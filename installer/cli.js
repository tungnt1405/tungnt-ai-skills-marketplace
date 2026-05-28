import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import {
  getAllTargets,
  getTargetById,
  supportedTargetIds,
} from './target-map.js';
import {
  copyExtraPackages,
  copyPackage,
  getPackageRoot,
  listPlannedExtraCopies,
  listPlannedEntries,
  removeExistingInstall,
  removeManagedPackageEntries,
  validateInstall,
  validateSource,
} from './package-copy.js';

const USAGE = `Usage:
  tungnt-ai-skills install [--all] [--agent <id>] [--dry-run] [--force] [--native]
  tungnt-ai-skills targets

Supported agents: ${supportedTargetIds().join(', ')}`;

export function runCli(argv = process.argv.slice(2), env = process.env, io = defaultIo()) {
  const command = argv[0] || 'help';
  if (command === 'targets') {
    printTargets(env, io);
    return 0;
  }
  if (command === 'install') {
    return install(argv.slice(1), env, io);
  }
  io.err(`${USAGE}\n`);
  return 1;
}

function defaultIo() {
  return {
    out: (message) => process.stdout.write(message),
    err: (message) => process.stderr.write(message),
  };
}

function parseInstallArgs(args) {
  const options = {
    all: false,
    agent: undefined,
    dryRun: false,
    force: false,
    native: false,
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--all') {
      options.all = true;
    } else if (arg === '--agent') {
      if (!args[index + 1] || args[index + 1].startsWith('--')) {
        throw new Error('Missing value for --agent');
      }
      options.agent = args[index + 1];
      index += 1;
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--force') {
      options.force = true;
    } else if (arg === '--native') {
      options.native = true;
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }
  }

  if (options.agent === undefined && !options.all) {
    options.all = true;
  }
  return options;
}

function selectedTargets(options) {
  if (options.agent) {
    const target = getTargetById(options.agent);
    if (!target) {
      throw new Error(`Unknown agent: ${options.agent}. Supported agents: ${supportedTargetIds().join(', ')}`);
    }
    if (target.aggregateTargetIds) {
      return target.aggregateTargetIds.map((id) => getTargetById(id));
    }
    return [target];
  }
  return getAllTargets().filter((target) => !target.aggregateTargetIds && target.includeInAll !== false);
}

function install(args, env, io) {
  let options;
  let targets;
  try {
    options = parseInstallArgs(args);
    targets = selectedTargets(options);
  } catch (error) {
    io.err(`${error.message}\n\n${USAGE}\n`);
    return 1;
  }

  const packageRoot = getPackageRoot(import.meta.url);
  io.out(`Source: ${packageRoot}\n`);
  if (options.dryRun) {
    io.out('Mode: dry-run\n');
    if (options.native) {
      io.out('Native: enabled\n');
    }
  }

  const failures = [];
  for (const target of targets) {
    const destination = target.defaultTarget(env);
    const expectedParent = target.expectedParent(env);
    io.out(`\n[${target.id}] ${target.displayName}\n`);
    io.out(`Target: ${destination}\n`);
    if (options.dryRun) {
      if (target.nativeCommands && options.native) {
        io.out('Mode: native marketplace commands\n');
        for (const command of target.nativeCommands) {
          io.out(`Command: ${command.join(' ')}\n`);
        }
        if (target.fallbackInstall) {
          io.out('Manual setup available when --native is omitted:\n');
          printFallbackPlan(packageRoot, target.fallbackInstall, env, io);
        }
      } else if (target.nativeCommands && target.fallbackInstall) {
        printFallbackPlan(packageRoot, target.fallbackInstall, env, io);
        printNextSteps(target, io);
      } else if (target.nativeCommands) {
        io.out('Mode: native marketplace commands\n');
        io.out('Native commands are available only with --native\n');
        printNextSteps(target, io);
      } else if (target.installMode === 'config') {
        io.out('Mode: config files\n');
      } else {
        io.out(`Planned entries: ${listPlannedEntries(packageRoot, target).join(', ')}\n`);
      }
      if (target.marketplaceFile) {
        io.out(`Marketplace file: ${target.marketplaceFile(env)}\n`);
        io.out(`Marketplace plugin: ${target.marketplaceEntry.name}\n`);
      }
      for (const extraCopy of listPlannedExtraCopies(packageRoot, target, env)) {
        io.out(`Additional target: ${extraCopy.destination}\n`);
        io.out(`Additional entries: ${extraCopy.entries.join(', ')}\n`);
      }
    }

    try {
      validateSource(packageRoot, target);
      if (options.dryRun) {
        io.out('Status: planned\n');
        continue;
      }
      if (target.nativeCommands) {
        if (options.native) {
          const missingCommand = missingNativeCommand(target, env);
          if (missingCommand) {
            throw new Error(`Native command not found: ${missingCommand}`);
          }
          runNativeCommands(target, env);
          io.out('Status: installed\n');
          if (target.postInstallNotes) {
            io.out(`Note: ${target.postInstallNotes}\n`);
          }
          if (target.printNextStepsAfterNative) {
            printNextSteps(target, io);
          }
        } else {
          if (!target.fallbackInstall) {
            throw new Error(`${target.displayName} requires --native; no manual marketplace setup is declared.`);
          }
          runFallbackInstall(packageRoot, target.fallbackInstall, env, options);
          io.out('Status: marketplace configured\n');
          printNextSteps(target, io);
        }
        continue;
      }
      if (target.installMode === 'merge') {
        if (options.force) {
          removeManagedPackageEntries(packageRoot, destination, expectedParent, target);
        }
      } else if (fs.existsSync(destination)) {
        if (!options.force) {
          throw new Error(`Destination already exists: ${destination}. Re-run with --force to replace it.`);
        }
        removeExistingInstall(destination, expectedParent);
      }
      copyPackage(packageRoot, destination, target);
      copyExtraPackages(packageRoot, target, env);
      if (target.marketplaceFile) {
        writeMarketplaceEntry(target.marketplaceFile(env), target.marketplaceEntry);
      }
      validateInstall(destination, target);
      io.out('Status: installed\n');
      if (target.postInstallNotes) {
        io.out(`Note: ${target.postInstallNotes}\n`);
      }
    } catch (error) {
      failures.push({ target, error });
      io.err(`[${target.id}] ${error.message}\n`);
    }
  }

  if (failures.length > 0) {
    io.err(`\nFailed agents: ${failures.map((failure) => failure.target.id).join(', ')}\n`);
    return 1;
  }

  return 0;
}

function runNativeCommands(target, env) {
  for (const [command, ...args] of target.nativeCommands) {
    const executable = findExecutable(command, env) || command;
    const spawn = nativeSpawnCommand(executable, args, env);
    const result = spawnSync(spawn.command, spawn.args, {
      env,
      stdio: 'inherit',
    });
    if (result.error) {
      throw result.error;
    }
    if (result.status !== 0) {
      throw new Error(`${command} ${args.join(' ')} exited with ${result.status}`);
    }
  }
}

function nativeSpawnCommand(executable, args, env) {
  const extension = path.extname(executable).toLowerCase();
  if (process.platform === 'win32' && (extension === '.cmd' || extension === '.bat')) {
    return {
      command: env.ComSpec || env.COMSPEC || 'cmd.exe',
      args: ['/d', '/s', '/c', 'call', executable, ...args],
    };
  }
  return {
    command: executable,
    args,
  };
}

function missingNativeCommand(target, env) {
  const commands = [...new Set(target.nativeCommands.map(([command]) => command))];
  for (const command of commands) {
    if (!findExecutable(command, env)) {
      return command;
    }
  }
  return undefined;
}

function findExecutable(command, env) {
  if (command.includes(path.sep)) {
    return isExecutable(command);
  }

  const pathValue = env.PATH || '';
  const extensions = process.platform === 'win32' && !path.extname(command)
    ? (env.PATHEXT || '.EXE;.CMD;.BAT;.COM').split(';')
    : [''];

  for (const directory of pathValue.split(path.delimiter).filter(Boolean)) {
    for (const extension of extensions) {
      const candidate = path.join(directory, `${command}${extension}`);
      if (isExecutable(candidate)) {
        return candidate;
      }
    }
  }

  return undefined;
}

function isExecutable(filePath) {
  try {
    const stat = fs.statSync(filePath);
    return stat.isFile();
  } catch {
    return false;
  }
}

function printFallbackPlan(packageRoot, fallback, env, io) {
  io.out('Mode: manual marketplace setup\n');
  if (fallback.mode === 'package') {
    io.out(`Manual target: ${fallback.defaultTarget(env)}\n`);
    io.out(`Manual entries: ${listPlannedEntries(packageRoot, fallback).join(', ')}\n`);
    if (fallback.marketplaceFile) {
      io.out(`Manual marketplace file: ${fallback.marketplaceFile(env)}\n`);
      io.out(`Manual marketplace plugin: ${fallback.marketplaceEntry.name}\n`);
    }
    return;
  }
  if (fallback.mode === 'copilotSettings') {
    io.out(`Manual settings file: ${fallback.settingsFile(env)}\n`);
    io.out(`Manual marketplace: ${fallback.marketplaceId}\n`);
  }
}

function printNextSteps(target, io) {
  if (!target.nextSteps || target.nextSteps.length === 0) {
    return;
  }
  io.out('Next steps:\n');
  for (const step of target.nextSteps) {
    io.out(`  ${step}\n`);
  }
}

function runFallbackInstall(packageRoot, fallback, env, options) {
  if (fallback.mode === 'package') {
    installPackageFallback(packageRoot, fallback, env, options);
    return;
  }
  if (fallback.mode === 'copilotSettings') {
    writeCopilotSettings(fallback.settingsFile(env), fallback);
    return;
  }
  throw new Error(`Unknown fallback install mode: ${fallback.mode}`);
}

function installPackageFallback(packageRoot, fallback, env, options) {
  const destination = fallback.defaultTarget(env);
  const expectedParent = fallback.expectedParent(env);
  validateSource(packageRoot, fallback);
  if (fs.existsSync(destination)) {
    if (!options.force) {
      throw new Error(`Destination already exists: ${destination}. Re-run with --force to replace it.`);
    }
    removeExistingInstall(destination, expectedParent);
  }
  copyPackage(packageRoot, destination, fallback);
  if (fallback.marketplaceFile) {
    writeMarketplaceEntry(fallback.marketplaceFile(env), fallback.marketplaceEntry);
  }
  validateInstall(destination, fallback);
}

function writeCopilotSettings(filePath, fallback) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const settings = readCopilotSettings(filePath);
  if (!isPlainObject(settings.extraKnownMarketplaces)) {
    throw new Error(`Cannot update ${filePath}: extraKnownMarketplaces must be an object`);
  }

  settings.extraKnownMarketplaces = {
    ...settings.extraKnownMarketplaces,
    [fallback.marketplaceId]: fallback.marketplaceSource,
  };

  fs.writeFileSync(`${filePath}.tmp`, `${JSON.stringify(settings, null, 2)}\n`);
  fs.renameSync(`${filePath}.tmp`, filePath);
}

function readCopilotSettings(filePath) {
  if (!fs.existsSync(filePath)) {
    return {
      extraKnownMarketplaces: {},
    };
  }

  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    throw new Error(`Invalid JSON in ${filePath}: ${error.message}`);
  }
  if (!isPlainObject(parsed)) {
    throw new Error(`Cannot update ${filePath}: settings root must be an object`);
  }
  return {
    ...parsed,
    extraKnownMarketplaces: Object.hasOwn(parsed, 'extraKnownMarketplaces') ? parsed.extraKnownMarketplaces : {},
  };
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function writeMarketplaceEntry(filePath, entry) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const marketplace = readMarketplace(filePath);
  const plugins = Array.isArray(marketplace.plugins) ? marketplace.plugins : [];
  marketplace.plugins = [
    ...plugins.filter((plugin) => plugin.name !== entry.name),
    entry,
  ];
  fs.writeFileSync(`${filePath}.tmp`, `${JSON.stringify(marketplace, null, 2)}\n`);
  fs.renameSync(`${filePath}.tmp`, filePath);
}

function readMarketplace(filePath) {
  if (!fs.existsSync(filePath)) {
    return { plugins: [] };
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function printTargets(env, io) {
  for (const target of getAllTargets()) {
    io.out(`${target.id}\t${target.displayName}\t${target.defaultTarget(env)}\n`);
  }
}
