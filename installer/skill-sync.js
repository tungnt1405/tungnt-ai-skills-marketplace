import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export const SYNC_SOURCES = {
  superpowers: {
    id: 'superpowers',
    repository: 'https://github.com/obra/superpowers.git',
    sourcePath: 'skills',
    mode: 'skills-root',
  },
  'ui-ux-pro-max': {
    id: 'ui-ux-pro-max',
    repository: 'https://github.com/nextlevelbuilder/ui-ux-pro-max-skill.git',
    mode: 'composite-skill',
    destinationSkill: 'ui-ux-pro-max',
    files: [
      {
        sourcePath: path.join('.claude', 'skills', 'ui-ux-pro-max', 'SKILL.md'),
        destinationPath: 'SKILL.md',
      },
    ],
    directories: [
      {
        sourcePath: path.join('src', 'ui-ux-pro-max', 'data'),
        destinationPath: 'data',
      },
      {
        sourcePath: path.join('src', 'ui-ux-pro-max', 'scripts'),
        destinationPath: 'scripts',
      },
      {
        sourcePath: path.join('src', 'ui-ux-pro-max', 'templates'),
        destinationPath: 'templates',
      },
    ],
  },
};

const SOURCE_IDS = Object.keys(SYNC_SOURCES);
const EXCLUDED_NAMES = new Set([
  '.DS_Store',
  'Thumbs.db',
  '__pycache__',
  '.git',
  'node_modules',
]);

export function parseSyncSkillsArgs(args) {
  const options = {
    apply: false,
    sourceIds: SOURCE_IDS,
    repoOverrides: {},
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--apply') {
      options.apply = true;
    } else if (arg === '--dry-run') {
      options.apply = false;
    } else if (arg === '--source') {
      const value = requiredValue(args, index, '--source');
      options.sourceIds = value.split(',').map((source) => source.trim()).filter(Boolean);
      index += 1;
    } else if (arg === '--repo') {
      const value = requiredValue(args, index, '--repo');
      const [id, ...repoParts] = value.split('=');
      const repo = repoParts.join('=');
      if (!id || !repo) {
        throw new Error('--repo must use <source>=<path-or-url>');
      }
      options.repoOverrides[id] = repo;
      index += 1;
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }
  }

  validateSourceIds(options.sourceIds);
  validateSourceIds(Object.keys(options.repoOverrides));
  return options;
}

export function syncSkills(options = {}) {
  const repoRoot = options.repoRoot || packageRoot();
  const sourceIds = options.sourceIds || SOURCE_IDS;
  const repoOverrides = options.repoOverrides || {};
  const apply = options.apply === true;

  validateSourceIds(sourceIds);
  validateRepoRoot(repoRoot);

  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'tungnt-ai-skills-sync-'));
  try {
    const sources = sourceIds.map((id) => {
      const source = SYNC_SOURCES[id];
      const checkout = resolveCheckout(source, repoOverrides[id], tempRoot);
      const operations = planSource(source, checkout.path, path.join(repoRoot, 'skills'));
      if (apply) {
        applyOperations(operations);
      }
      return {
        id,
        repository: checkout.repository,
        mode: apply ? 'apply' : 'dry-run',
        operations,
        summary: summarizeOperations(operations),
      };
    });
    return { apply, sources };
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
}

function requiredValue(args, index, flag) {
  if (!args[index + 1] || args[index + 1].startsWith('--')) {
    throw new Error(`Missing value for ${flag}`);
  }
  return args[index + 1];
}

function validateSourceIds(sourceIds) {
  for (const id of sourceIds) {
    if (!SYNC_SOURCES[id]) {
      throw new Error(`Unknown sync source: ${id}. Supported sources: ${SOURCE_IDS.join(', ')}`);
    }
  }
}

function packageRoot() {
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
}

function validateRepoRoot(repoRoot) {
  if (!fs.existsSync(path.join(repoRoot, 'package.json'))) {
    throw new Error(`Repository root is missing package.json: ${repoRoot}`);
  }
  if (!fs.existsSync(path.join(repoRoot, 'skills'))) {
    throw new Error(`Repository root is missing skills directory: ${repoRoot}`);
  }
}

function resolveCheckout(source, override, tempRoot) {
  if (override) {
    const localPath = path.resolve(override);
    if (fs.existsSync(localPath)) {
      return {
        path: localPath,
        repository: override,
      };
    }
  }

  const repository = override || source.repository;
  const destination = path.join(tempRoot, source.id);
  const result = spawnSync('git', ['clone', '--depth', '1', repository, destination], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    throw new Error(`git clone failed for ${source.id}: ${result.stderr || result.stdout}`);
  }
  return {
    path: destination,
    repository,
  };
}

function planSource(source, checkoutRoot, skillsRoot) {
  if (source.mode === 'composite-skill') {
    return planCompositeSkill(source, checkoutRoot, skillsRoot);
  }

  const sourceRoot = path.join(checkoutRoot, source.sourcePath);
  if (!fs.existsSync(sourceRoot)) {
    throw new Error(`${source.id} source path is missing: ${source.sourcePath}`);
  }

  if (source.mode === 'single-skill') {
    validateSkillDirectory(sourceRoot, source.id);
    return planDirectory(sourceRoot, path.join(skillsRoot, source.destinationSkill), skillsRoot);
  }

  const operations = [];
  for (const entry of fs.readdirSync(sourceRoot, { withFileTypes: true })) {
    if (!entry.isDirectory() || shouldExcludeName(entry.name)) {
      continue;
    }
    const sourceSkill = path.join(sourceRoot, entry.name);
    validateSkillDirectory(sourceSkill, entry.name);
    operations.push(...planDirectory(sourceSkill, path.join(skillsRoot, entry.name), skillsRoot));
  }
  return operations;
}

function planCompositeSkill(source, checkoutRoot, skillsRoot) {
  const destinationDir = path.join(skillsRoot, source.destinationSkill);
  ensureInsideSkills(destinationDir, skillsRoot);
  const mappedFiles = new Map();

  for (const file of source.files || []) {
    const sourceFile = path.join(checkoutRoot, file.sourcePath);
    if (!fs.existsSync(sourceFile)) {
      throw new Error(`${source.id} source file is missing: ${file.sourcePath}`);
    }
    mappedFiles.set(file.destinationPath, sourceFile);
  }

  for (const directory of source.directories || []) {
    const sourceDir = path.join(checkoutRoot, directory.sourcePath);
    if (!fs.existsSync(sourceDir)) {
      throw new Error(`${source.id} source directory is missing: ${directory.sourcePath}`);
    }
    for (const [relativePath, sourceFile] of listFiles(sourceDir)) {
      mappedFiles.set(path.join(directory.destinationPath, relativePath), sourceFile);
    }
  }

  if (!mappedFiles.has('SKILL.md')) {
    throw new Error(`${source.id} is missing SKILL.md`);
  }

  return planMappedFiles(mappedFiles, destinationDir, skillsRoot);
}

function validateSkillDirectory(directory, label) {
  if (!fs.existsSync(path.join(directory, 'SKILL.md'))) {
    throw new Error(`${label} is missing SKILL.md`);
  }
}

function planDirectory(sourceDir, destinationDir, skillsRoot) {
  ensureInsideSkills(destinationDir, skillsRoot);
  const sourceFiles = listFiles(sourceDir);
  return planMappedFiles(sourceFiles, destinationDir, skillsRoot);
}

function planMappedFiles(sourceFiles, destinationDir, skillsRoot) {
  const destinationFiles = fs.existsSync(destinationDir) ? listFiles(destinationDir) : new Map();
  const operations = [];

  for (const [relativePath, sourceFile] of sourceFiles) {
    const destinationFile = path.join(destinationDir, relativePath);
    ensureInsideSkills(destinationFile, skillsRoot);
    const existing = destinationFiles.get(relativePath);
    if (!existing) {
      operations.push({ type: 'added', source: sourceFile, destination: destinationFile, relativePath });
    } else if (fileHash(sourceFile) !== fileHash(existing)) {
      operations.push({ type: 'updated', source: sourceFile, destination: destinationFile, relativePath });
    }
  }

  for (const [relativePath, destinationFile] of destinationFiles) {
    if (!sourceFiles.has(relativePath)) {
      ensureInsideSkills(destinationFile, skillsRoot);
      operations.push({ type: 'removed', destination: destinationFile, relativePath, stopAt: destinationDir });
    }
  }

  return operations;
}

function listFiles(root) {
  const files = new Map();
  walk(root, root, files);
  return files;
}

function walk(root, current, files) {
  for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
    if (shouldExcludeName(entry.name)) {
      continue;
    }
    const fullPath = path.join(current, entry.name);
    if (entry.isDirectory()) {
      walk(root, fullPath, files);
      continue;
    }
    if (entry.isFile() && !entry.name.endsWith('.pyc')) {
      files.set(path.relative(root, fullPath), fullPath);
    }
  }
}

function shouldExcludeName(name) {
  return EXCLUDED_NAMES.has(name);
}

function fileHash(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function applyOperations(operations) {
  for (const operation of operations.filter((entry) => entry.type === 'removed')) {
    fs.rmSync(operation.destination, { force: true });
    removeEmptyParents(path.dirname(operation.destination), operation.stopAt);
  }
  for (const operation of operations.filter((entry) => entry.type !== 'removed')) {
    fs.mkdirSync(path.dirname(operation.destination), { recursive: true });
    fs.copyFileSync(operation.source, operation.destination);
  }
}

function removeEmptyParents(directory, stopAt) {
  let current = directory;
  const stop = path.resolve(stopAt);
  while (path.resolve(current) !== stop && fs.existsSync(current) && fs.readdirSync(current).length === 0) {
    fs.rmdirSync(current);
    current = path.dirname(current);
  }
}

function ensureInsideSkills(targetPath, skillsRoot) {
  const resolvedTarget = path.resolve(targetPath);
  const resolvedRoot = path.resolve(skillsRoot);
  const relative = path.relative(resolvedRoot, resolvedTarget);
  if (relative === '' || relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Refusing to modify path outside skills: ${resolvedTarget}`);
  }
}

function summarizeOperations(operations) {
  return {
    added: operations.filter((operation) => operation.type === 'added').length,
    updated: operations.filter((operation) => operation.type === 'updated').length,
    removed: operations.filter((operation) => operation.type === 'removed').length,
  };
}
