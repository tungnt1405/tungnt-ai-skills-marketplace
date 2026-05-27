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
  tungnt-ai-skills install [--all] [--agent <id>] [--dry-run] [--force]
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
  }

  const failures = [];
  for (const target of targets) {
    const destination = target.defaultTarget(env);
    const expectedParent = target.expectedParent(env);
    io.out(`\n[${target.id}] ${target.displayName}\n`);
    io.out(`Target: ${destination}\n`);
    if (options.dryRun) {
      if (target.nativeCommands) {
        io.out('Mode: native marketplace commands\n');
        for (const command of target.nativeCommands) {
          io.out(`Command: ${command.join(' ')}\n`);
        }
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
        runNativeCommands(target, env);
        io.out('Status: installed\n');
        if (target.postInstallNotes) {
          io.out(`Note: ${target.postInstallNotes}\n`);
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
    const result = spawnSync(command, args, {
      env,
      shell: process.platform === 'win32',
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
