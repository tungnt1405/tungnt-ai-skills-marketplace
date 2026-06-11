import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const INCLUDED_ENTRIES = [
  'skills',
  'hooks',
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
  copySelectedHookManifest(packageRoot, destination, target);
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

function copySelectedHookManifest(packageRoot, destination, target = {}) {
  if (!target.hookManifestFile) {
    return;
  }
  const source = path.join(packageRoot, target.hookManifestFile);
  const destinationFile = path.join(destination, 'hooks', 'hooks.json');
  fs.mkdirSync(path.dirname(destinationFile), { recursive: true });
  fs.copyFileSync(source, destinationFile);
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
    fs.rmSync(destination, { recursive: true, force: true });
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
