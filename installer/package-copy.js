import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const INCLUDED_ENTRIES = [
  'skills',
  'hooks',
  'assets',
  '.claude-plugin',
  '.codex-plugin',
  '.agents',
  '.antigravitycli',
  '.opencode',
  '.cursor-plugin',
  'gemini-extension.json',
  'GEMINI.md',
  'CLAUDE.md',
  'AGENTS.md',
  'README.md',
  'LICENSE',
  'package.json',
];

const EXCLUDED_NAMES = new Set([
  '.DS_Store',
  'Thumbs.db',
]);

const EXCLUDED_RELATIVE_PATHS = new Set([
  '.git',
  'node_modules',
  'tests',
  'docs/superpowers/plans',
  'docs/superpowers/specs',
]);

export function getPackageRoot(importMetaUrl) {
  return path.resolve(path.dirname(fileURLToPath(importMetaUrl)), '..');
}

export function toPosix(relativePath) {
  return relativePath.split(path.sep).join('/');
}

export function listPlannedEntries(packageRoot) {
  return INCLUDED_ENTRIES.filter((entry) => fs.existsSync(path.join(packageRoot, entry)));
}

export function validateSource(packageRoot, target) {
  const missing = target.requiredFiles.filter((file) => !fs.existsSync(path.join(packageRoot, file)));
  if (missing.length > 0) {
    throw new Error(`${target.displayName} source is missing required file(s): ${missing.join(', ')}`);
  }
}

export function validateInstall(destination, target) {
  const missing = target.requiredFiles.filter((file) => !fs.existsSync(path.join(destination, file)));
  if (missing.length > 0) {
    throw new Error(`${target.displayName} install is missing required file(s): ${missing.join(', ')}`);
  }
}

export function copyPackage(packageRoot, destination) {
  fs.mkdirSync(destination, { recursive: true });
  for (const entry of listPlannedEntries(packageRoot)) {
    copyEntry(path.join(packageRoot, entry), path.join(destination, entry), entry);
  }
}

function copyEntry(source, destination, relativePath) {
  const normalized = toPosix(relativePath);
  const name = path.basename(source);
  if (EXCLUDED_NAMES.has(name) || EXCLUDED_RELATIVE_PATHS.has(normalized)) {
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
