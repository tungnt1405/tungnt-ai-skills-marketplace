import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const INCLUDED_ENTRIES = [
  'skills',
  'hooks',
  'setting.json',
  'gemini-extension.json',
  'GEMINI.md',
  'CLAUDE.md',
  'AGENTS.md',
];

const EXCLUDED_NAMES = new Set([
  '.DS_Store',
  'Thumbs.db',
  '__pycache__',
]);

const EXCLUDED_RELATIVE_PATHS = new Set([
  '.git',
  'node_modules',
  'tests',
  'docs/tungnt-ai-skills/plans',
  'docs/tungnt-ai-skills/specs',
]);

export function getPackageRoot(importMetaUrl) {
  return path.resolve(path.dirname(fileURLToPath(importMetaUrl)), '..');
}

export function toPosix(relativePath) {
  return relativePath.split(path.sep).join('/');
}

export function listPlannedEntries(packageRoot, target = {}) {
  return plannedEntries(packageRoot, target);
}

export function listPlannedExtraCopies(packageRoot, target = {}, env = process.env) {
  return extraCopies(packageRoot, target, env).map((copy) => ({
    destination: copy.destination,
    entries: plannedEntries(packageRoot, copy),
  }));
}

export function validateSource(packageRoot, target) {
  const requiredFiles = [
    ...target.requiredFiles,
    ...extraRequiredFiles(target),
  ];
  const missing = requiredFiles.filter((file) => !fs.existsSync(path.join(packageRoot, file)));
  if (missing.length > 0) {
    throw new Error(`${target.displayName} source is missing required file(s): ${missing.join(', ')}`);
  }
}

export function validateInstall(destination, target) {
  const requiredFiles = target.installedRequiredFiles || target.requiredFiles;
  const missing = requiredFiles.filter((file) => !fs.existsSync(path.join(destination, file)));
  if (missing.length > 0) {
    throw new Error(`${target.displayName} install is missing required file(s): ${missing.join(', ')}`);
  }
}

export function copyPackage(packageRoot, destination, target = {}) {
  fs.mkdirSync(destination, { recursive: true });
  for (const entry of plannedEntries(packageRoot, target)) {
    copyEntry(path.join(packageRoot, entry), path.join(destination, entry), entry);
  }
  copyRegisterPluginSources(packageRoot, destination, target);
  copySelectedRootHookManifest(packageRoot, destination, target);
}

export function copyExtraPackages(packageRoot, target = {}, env = process.env) {
  for (const copy of extraCopies(packageRoot, target, env)) {
    fs.mkdirSync(copy.destination, { recursive: true });
    for (const entry of plannedEntries(packageRoot, copy)) {
      copyEntry(path.join(packageRoot, entry), path.join(copy.destination, entry), entry);
    }
  }
}

export function copySettingTemplate(packageRoot, destination) {
  const templatePath = path.join(packageRoot, 'setting.template.json');
  const destinationPath = path.join(destination, 'setting.json');
  if (fs.existsSync(templatePath) && !fs.existsSync(destinationPath)) {
    fs.mkdirSync(path.dirname(destinationPath), { recursive: true });
    fs.copyFileSync(templatePath, destinationPath);
  }
}

function copyRegisterPluginSources(packageRoot, destination, target = {}) {
  const sources = [...new Set((target.registerPluginFiles || []).map((entry) => entry.source))];
  for (const source of sources) {
    const sourcePath = path.join(packageRoot, source);
    if (!fs.existsSync(sourcePath)) {
      continue;
    }
    copyEntry(sourcePath, path.join(destination, source), source);
  }
}

function copySelectedRootHookManifest(packageRoot, destination, target = {}) {
  if (!target.rootHookManifestFile) {
    return;
  }
  const source = path.join(packageRoot, target.rootHookManifestFile);
  const destinationFile = path.join(destination, 'hooks.json');
  fs.mkdirSync(path.dirname(destinationFile), { recursive: true });
  fs.copyFileSync(source, destinationFile);
}

export function writeGlobalHookManifest(packageRoot, target = {}, env = process.env) {
  const manifest = target.globalHookManifest;
  if (!manifest || !target.rootHookManifestFile) {
    return null;
  }
  const sourcePath = path.join(packageRoot, target.rootHookManifestFile);
  const group = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
  const pluginDir = target.defaultTarget(env);
  const targetPlatform = target.platform || process.platform;
  const rewritten = rewriteHookCommands(group, pluginDir, targetPlatform);

  const destinationFile = manifest.destination(env);
  let merged = false;
  let output = rewritten;
  if (fs.existsSync(destinationFile)) {
    try {
      const existing = JSON.parse(fs.readFileSync(destinationFile, 'utf8'));
      if (existing && typeof existing === 'object' && !Array.isArray(existing)) {
        merged = Object.keys(rewritten).some((key) => Object.prototype.hasOwnProperty.call(existing, key));
        output = { ...existing, ...rewritten };
      }
    } catch {
      fs.copyFileSync(destinationFile, `${destinationFile}.bak`);
    }
  }

  fs.mkdirSync(path.dirname(destinationFile), { recursive: true });
  fs.writeFileSync(destinationFile, `${JSON.stringify(output, null, 2)}\n`);
  return { destination: destinationFile, merged };
}

function rewriteHookCommands(group, pluginDir, targetPlatform) {
  return Object.fromEntries(
    Object.entries(group).map(([groupName, events]) => [
      groupName,
      Object.fromEntries(
        Object.entries(events || {}).map(([event, handlers]) => [
          event,
          Array.isArray(handlers)
            ? handlers.map((handler) => {
                // Direct command handlers (PreInvocation, PostInvocation, Stop)
                if (typeof handler?.command === 'string') {
                  return rewriteCommand(handler, pluginDir, targetPlatform);
                }
                // Nested hooks array handlers (PreToolUse, PostToolUse): {matcher, hooks: [...]}
                if (handler && Array.isArray(handler.hooks)) {
                  return {
                    ...handler,
                    hooks: handler.hooks.map((h) => rewriteCommand(h, pluginDir, targetPlatform)),
                  };
                }
                return handler;
              })
            : handlers,
        ])
      ),
    ])
  );
}

function rewriteCommand(handler, pluginDir, targetPlatform) {
  if (typeof handler?.command !== 'string') {
    return handler;
  }
  // Match relative paths (hooks/run-hook.cmd or hooks\run-hook.cmd) 
  // or full Windows paths (%USERPROFILE%\...\hooks\run-hook.cmd)
  const match = handler.command.match(/^(?:(?:\.\/)?hooks[\/\\]run-hook\.cmd|(?:%USERPROFILE%|[A-Za-z]:)[^ ]*?hooks[\/\\]run-hook\.cmd)(?:\s+(.*))?$/);
  if (!match) {
    return handler;
  }
  const args = match[1] ? ` ${match[1]}` : '';
  const isWindows = targetPlatform === 'win32';
  let command;
  if (isWindows) {
    // On Windows, use %USERPROFILE% which expands to the user's home directory.
    // Standard Antigravity CLI plugin locations on Windows:
    // %USERPROFILE%\.gemini\antigravity-cli\plugins\tungnt-ai-skills\hooks\run-hook.cmd (agy)
    // %USERPROFILE%\.gemini\config\plugins\tungnt-ai-skills\hooks\run-hook.cmd (antigravity/antigravity-ide)
    const pluginName = 'tungnt-ai-skills';
    const isAgy = pluginDir.includes('antigravity-cli');
    const pluginSubPath = isAgy
      ? '.gemini\\antigravity-cli\\plugins'
      : '.gemini\\config\\plugins';
    const script = `%USERPROFILE%\\${pluginSubPath}\\${pluginName}\\hooks\\run-hook.cmd`;
    command = `${script}${args}`;
  } else {
    // POSIX: bash "path" format
    const script = path.join(pluginDir, 'hooks', 'run-hook.cmd');
    command = `bash "${script}"${args}`;
  }
  return { ...handler, command };
}

function plannedEntries(packageRoot, target = {}) {
  const entries = target.includedEntries || INCLUDED_ENTRIES;
  return entries.filter((entry) => fs.existsSync(path.join(packageRoot, entry)));
}

function extraCopies(packageRoot, target = {}, env = process.env) {
  return (target.extraCopies || []).map((copy) => ({
    ...copy,
    destination: copy.destination(env),
  }));
}

function extraRequiredFiles(target = {}) {
  return (target.extraCopies || []).flatMap((copy) => copy.requiredFiles || copy.includedEntries || []);
}

function copyEntry(source, destination, relativePath) {
  const normalized = toPosix(relativePath);
  const name = path.basename(source);
  if (EXCLUDED_NAMES.has(name) || name.endsWith('.pyc') || EXCLUDED_RELATIVE_PATHS.has(normalized)) {
    return;
  }

  const stat = fs.statSync(source);
  if (stat.isDirectory()) {
    fs.mkdirSync(destination, { recursive: true });
    for (const child of fs.readdirSync(source)) {
      copyEntry(path.join(source, child), path.join(destination, child), path.join(relativePath, child));
    }
    return;
  }

  if (stat.isFile()) {
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(source, destination);
  }
}

export function ensureInsideExpectedParent(destination, expectedParent) {
  const resolvedDestination = path.resolve(destination);
  const resolvedParent = path.resolve(expectedParent);
  const relative = path.relative(resolvedParent, resolvedDestination);
  if (relative === '' || relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Refusing to modify ${resolvedDestination}; it is outside expected parent ${resolvedParent}`);
  }
}

export function removeExistingInstall(destination, expectedParent) {
  ensureInsideExpectedParent(destination, expectedParent);
  if (fs.existsSync(destination)) {
    for (const entry of fs.readdirSync(destination)) {
      if (entry !== '.tmp') {
        fs.rmSync(path.join(destination, entry), { recursive: true, force: true });
      }
    }
    if (!fs.existsSync(path.join(destination, '.tmp'))) {
      fs.rmSync(destination, { recursive: true, force: true });
    }
  }
}

export function removeManagedPackageEntries(packageRoot, destination, expectedParent, target = {}) {
  ensureInsideExpectedParent(destination, expectedParent);
  for (const entry of plannedEntries(packageRoot, target)) {
    if (entry === 'skills') {
      removeManagedSkills(path.join(packageRoot, entry), path.join(destination, entry));
      continue;
    }
    fs.rmSync(path.join(destination, entry), { recursive: true, force: true });
  }
}

function removeManagedSkills(sourceSkillsDir, destinationSkillsDir) {
  if (!fs.existsSync(sourceSkillsDir)) {
    return;
  }
  for (const skillName of fs.readdirSync(sourceSkillsDir)) {
    fs.rmSync(path.join(destinationSkillsDir, skillName), { recursive: true, force: true });
  }
}

export function backupSettingJson(destination) {
  const tmpDir = path.join(destination, '.tmp');
  if (fs.existsSync(tmpDir)) {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
  const settingPath = path.join(destination, 'setting.json');
  if (!fs.existsSync(settingPath)) {
    return false;
  }
  fs.mkdirSync(tmpDir, { recursive: true });
  fs.renameSync(settingPath, path.join(tmpDir, 'setting.json'));
  return true;
}

export function restoreSettingJson(destination) {
  const tmpDir = path.join(destination, '.tmp');
  const tmpSettingPath = path.join(tmpDir, 'setting.json');
  if (fs.existsSync(tmpSettingPath)) {
    fs.renameSync(tmpSettingPath, path.join(destination, 'setting.json'));
  }
  if (fs.existsSync(tmpDir)) {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

export function pluginFileMode(entry) {
  return entry.symlinkOnPosix && process.platform !== 'win32' ? 'symlink' : 'copy';
}

export function registerPluginFilesForTarget(packageRoot, target, env = process.env) {
  const results = [];
  for (const entry of target.registerPluginFiles || []) {
    const sourcePath = path.join(packageRoot, entry.source);
    if (!fs.existsSync(sourcePath)) {
      throw new Error(`${target.displayName} register source is missing: ${entry.source}`);
    }
    const destinationPath = path.resolve(entry.destination(env));
    const expectedParent = target.expectedParent
      ? target.expectedParent(env)
      : path.dirname(destinationPath);
    ensureInsideExpectedParent(destinationPath, expectedParent);
    // Never write through a pre-existing entry (a planted symlink would redirect writes).
    fs.rmSync(destinationPath, { recursive: true, force: true });
    fs.mkdirSync(path.dirname(destinationPath), { recursive: true });

    const mode = pluginFileMode(entry);
    if (mode === 'symlink') {
      const packageDir = path.resolve(target.defaultTarget(env));
      const linkTarget = path.join(packageDir, entry.source);
      let realTarget;
      try {
        realTarget = fs.realpathSync(linkTarget);
      } catch {
        throw new Error(
          `${target.displayName} register target does not exist yet: ${linkTarget}. Install/copy the package to ${packageDir} before registering symlinks.`
        );
      }
      const realPackageDir = fs.realpathSync(packageDir);
      if (realTarget !== realPackageDir && !realTarget.startsWith(realPackageDir + path.sep)) {
        throw new Error(`Refusing to link ${realTarget}; it resolves outside ${realPackageDir}`);
      }
      try {
        fs.symlinkSync(linkTarget, destinationPath);
        results.push({ destination: destinationPath, mode });
        continue;
      } catch (error) {
        results.push({
          destination: destinationPath,
          mode: 'copy',
          warning: `symlink failed (${error.code ?? error.message}); copied file instead`,
        });
      }
    }

    fs.copyFileSync(sourcePath, destinationPath);
    if (!results.length || results[results.length - 1].destination !== destinationPath) {
      results.push({ destination: destinationPath, mode: 'copy' });
    }
  }
  return results;
}
