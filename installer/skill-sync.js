import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export const DEFAULT_SYNC_SOURCES = {
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
    sourceIds: undefined,
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

  return options;
}

export function syncSkills(options = {}) {
  const repoRoot = options.repoRoot || packageRoot();
  const sourcesConfig = options.sources || loadSyncSources(repoRoot);
  const sourceIds = options.sourceIds || Object.keys(sourcesConfig);
  const repoOverrides = options.repoOverrides || {};
  const apply = options.apply === true;

  validateSourceIds(sourceIds, sourcesConfig);
  validateSourceIds(Object.keys(repoOverrides), sourcesConfig);
  validateRepoRoot(repoRoot);

  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'tungnt-ai-skills-sync-'));
  try {
    const sources = sourceIds.map((id) => {
      const source = { id, ...sourcesConfig[id] };
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

export function inspectSkillRepository(options = {}) {
  const repository = options.repository;
  if (!repository) {
    throw new Error('Missing repository for inspect');
  }

  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'tungnt-ai-skills-inspect-'));
  try {
    const checkout = resolveCheckout({ id: 'inspect', repository }, undefined, tempRoot);
    const candidates = findSkillCandidates(checkout.path);
    const recommendation = recommendSource(candidates);
    return {
      repository: checkout.repository,
      candidates,
      recommendation,
    };
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
}

export function addSyncSource(options = {}) {
  const repoRoot = options.repoRoot || packageRoot();
  const name = options.name;
  const repository = options.repository;
  if (!name) {
    throw new Error('Missing source name');
  }
  if (!/^[a-z0-9][a-z0-9._-]*$/i.test(name)) {
    throw new Error(`Invalid source name: ${name}`);
  }
  if (!repository) {
    throw new Error('Missing repository for source');
  }

  validateRepoRoot(repoRoot);
  const registry = readSyncRegistry(repoRoot);
  if (registry.sources[name]) {
    throw new Error(`Sync source already exists: ${name}`);
  }

  const inspection = inspectSkillRepository({ repository });
  if (!inspection.recommendation) {
    throw new Error(`Could not recommend a sync mapping for ${repository}`);
  }

  const entry = {
    repository,
    mode: inspection.recommendation.mode,
    sourcePath: inspection.recommendation.sourcePath,
  };
  if (inspection.recommendation.destinationSkill) {
    entry.destinationSkill = inspection.recommendation.destinationSkill;
  }

  registry.sources[name] = entry;
  writeSyncRegistry(repoRoot, registry);
  return entry;
}

function requiredValue(args, index, flag) {
  if (!args[index + 1] || args[index + 1].startsWith('--')) {
    throw new Error(`Missing value for ${flag}`);
  }
  return args[index + 1];
}

export function loadSyncSources(repoRoot = packageRoot()) {
  return readSyncRegistry(repoRoot).sources;
}

function readSyncRegistry(repoRoot = packageRoot()) {
  const registryFile = path.join(repoRoot, 'skills.sync.json');
  if (!fs.existsSync(registryFile)) {
    return { sources: cloneJson(DEFAULT_SYNC_SOURCES) };
  }

  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(registryFile, 'utf8'));
  } catch (error) {
    throw new Error(`Invalid JSON in ${registryFile}: ${error.message}`);
  }
  if (!parsed || typeof parsed !== 'object' || !parsed.sources || typeof parsed.sources !== 'object' || Array.isArray(parsed.sources)) {
    throw new Error(`${registryFile} must contain an object at sources`);
  }
  return parsed;
}

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}

function writeSyncRegistry(repoRoot, registry) {
  const registryFile = path.join(repoRoot, 'skills.sync.json');
  fs.writeFileSync(`${registryFile}.tmp`, `${JSON.stringify(registry, null, 2)}\n`);
  fs.renameSync(`${registryFile}.tmp`, registryFile);
}

function validateSourceIds(sourceIds, sources) {
  for (const id of sourceIds) {
    if (!sources[id]) {
      throw new Error(`Unknown sync source: ${id}. Supported sources: ${Object.keys(sources).join(', ')}`);
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
  const repository = override || source.repository;
  if (repository) {
    const localPath = path.resolve(repository);
    if (fs.existsSync(localPath)) {
      return {
        path: localPath,
        repository,
      };
    }
  }

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

function findSkillCandidates(checkoutRoot) {
  const candidates = [];
  const skillsRootPaths = [];
  for (const candidatePath of [
    'skills',
    path.join('.claude', 'skills'),
    path.join('.codex', 'skills'),
    path.join('.github', 'copilot', 'skills'),
  ]) {
    const fullPath = path.join(checkoutRoot, candidatePath);
    const skills = listImmediateSkills(fullPath);
    if (skills.length > 0) {
      const normalizedPath = toPosix(candidatePath);
      skillsRootPaths.push(normalizedPath);
      candidates.push({
        type: 'skills-root',
        path: normalizedPath,
        skills,
      });
    }
  }

  for (const skillFile of findSkillFiles(checkoutRoot)) {
    const relativeDir = path.dirname(path.relative(checkoutRoot, skillFile));
    const normalizedDir = toPosix(relativeDir === '.' ? '' : relativeDir);
    if (skillsRootPaths.some((rootPath) => normalizedDir === rootPath || normalizedDir.startsWith(`${rootPath}/`))) {
      continue;
    }
    candidates.push({
      type: 'single-skill',
      path: normalizedDir,
      skill: readSkillName(skillFile) || path.basename(path.dirname(skillFile)),
    });
  }

  return candidates;
}

function listImmediateSkills(root) {
  if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) {
    return [];
  }
  return fs.readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .filter((entry) => fs.existsSync(path.join(root, entry.name, 'SKILL.md')))
    .map((entry) => readSkillName(path.join(root, entry.name, 'SKILL.md')) || entry.name)
    .sort();
}

function findSkillFiles(root) {
  const files = [];
  collectSkillFiles(root, files);
  return files;
}

function collectSkillFiles(current, files) {
  for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
    if (shouldExcludeName(entry.name)) {
      continue;
    }
    const fullPath = path.join(current, entry.name);
    if (entry.isDirectory()) {
      collectSkillFiles(fullPath, files);
      continue;
    }
    if (entry.isFile() && entry.name === 'SKILL.md') {
      files.push(fullPath);
    }
  }
}

function recommendSource(candidates) {
  const rootSkills = candidates.find((candidate) => candidate.type === 'skills-root' && candidate.path === 'skills');
  if (rootSkills) {
    return {
      mode: 'skills-root',
      sourcePath: rootSkills.path,
      skills: rootSkills.skills,
    };
  }

  const skillsRoot = candidates.find((candidate) => candidate.type === 'skills-root');
  if (skillsRoot) {
    return {
      mode: 'skills-root',
      sourcePath: skillsRoot.path,
      skills: skillsRoot.skills,
    };
  }

  const single = candidates.find((candidate) => candidate.type === 'single-skill');
  if (single) {
    return {
      mode: 'single-skill',
      sourcePath: single.path || '.',
      destinationSkill: single.skill,
      skills: [single.skill],
    };
  }

  return undefined;
}

function readSkillName(skillFile) {
  const content = fs.readFileSync(skillFile, 'utf8');
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) {
    return undefined;
  }
  const name = match[1].match(/^name:\s*(.+)$/m);
  return name ? name[1].trim().replace(/^["']|["']$/g, '') : undefined;
}

function toPosix(relativePath) {
  return relativePath.split(path.sep).join('/');
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
