import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  getAllTargets,
  getTargetById,
  supportedTargetIds,
} from '../../installer/target-map.js';
import {
  copyPackage,
  ensureInsideExpectedParent,
  getPackageRoot,
  listPlannedEntries,
  removeManagedPackageEntries,
  removeExistingInstall,
  validateInstall,
  validateSource,
} from '../../installer/package-copy.js';
import { runCli } from '../../installer/cli.js';

const PACKAGE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

const tests = [];

function test(name, fn) {
  tests.push({ name, fn });
}

function tempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'tungnt-ai-skills-installer-'));
}

function capture() {
  let stdout = '';
  let stderr = '';
  return {
    io: {
      out: (message) => { stdout += message; },
      err: (message) => { stderr += message; },
    },
    stdout: () => stdout,
    stderr: () => stderr,
  };
}

function fakeEnv(home) {
  return { ...process.env, HOME: home, USERPROFILE: home };
}

test('target map includes exactly the supported agents', () => {
  assert.deepEqual(supportedTargetIds(), [
    'claude',
    'codex',
    'copilot',
    'gemini',
    'agy',
    'antigravity',
    'antigravity-ide',
    'antigravity-all',
  ]);
  assert.equal(getAllTargets().length, 8);
});

test('target map resolves targets under fake HOME', () => {
  const home = tempDir();
  for (const target of getAllTargets()) {
    assert.equal(target.defaultTarget(fakeEnv(home)).startsWith(home), true, target.id);
    assert.equal(target.expectedParent(fakeEnv(home)).startsWith(home), true, target.id);
  }
  assert.equal(
    getTargetById('agy').defaultTarget(fakeEnv(home)),
    path.join(home, '.gemini', 'antigravity-cli', 'plugins', 'tungnt-ai-skills'),
  );
  assert.equal(
    getTargetById('antigravity-ide').defaultTarget(fakeEnv(home)),
    path.join(home, '.gemini', 'config', 'plugins', 'tungnt-ai-skills'),
  );
  assert.equal(
    getTargetById('antigravity').defaultTarget(fakeEnv(home)),
    path.join(home, '.gemini', 'config', 'plugins', 'tungnt-ai-skills'),
  );
  assert.equal(getTargetById('antigravity-all').defaultTarget(fakeEnv(home)), path.join(home, '.gemini'));
});

test('unknown target returns undefined', () => {
  assert.equal(getTargetById('unknown'), undefined);
});

test('planned package entries include core files', () => {
  const entries = listPlannedEntries(PACKAGE_ROOT);
  assert.deepEqual(entries, [
    'skills',
    'hooks',
    'gemini-extension.json',
    'GEMINI.md',
    'CLAUDE.md',
    'AGENTS.md',
  ]);
  assert.equal(entries.includes('package.json'), false);
  assert.equal(entries.includes('README.md'), false);
  assert.equal(entries.includes('assets'), false);
});

test('copyPackage copies shared required files', () => {
  const destination = path.join(tempDir(), 'plugin');
  const target = getTargetById('copilot');
  validateSource(PACKAGE_ROOT, target);
  copyPackage(PACKAGE_ROOT, destination);
  validateInstall(destination, target);
  assert.equal(fs.existsSync(path.join(destination, 'skills', 'using-tungnt-ai-skills', 'SKILL.md')), true);
});

test('removeExistingInstall refuses paths outside expected parent', () => {
  const root = tempDir();
  const outside = path.join(root, 'outside', 'plugin');
  const parent = path.join(root, 'inside');
  fs.mkdirSync(outside, { recursive: true });
  assert.throws(() => removeExistingInstall(outside, parent), /outside expected parent/);
});

test('ensureInsideExpectedParent accepts child destination', () => {
  const root = tempDir();
  const parent = path.join(root, 'plugins');
  const destination = path.join(parent, 'tungnt-ai-skills');
  assert.doesNotThrow(() => ensureInsideExpectedParent(destination, parent));
});

test('validateSource reports missing required files', () => {
  const fixture = tempDir();
  fs.mkdirSync(path.join(fixture, 'skills', 'using-tungnt-ai-skills'), { recursive: true });
  fs.writeFileSync(path.join(fixture, 'skills', 'using-tungnt-ai-skills', 'SKILL.md'), '');
  const target = getTargetById('codex');
  assert.throws(() => validateSource(fixture, target), /missing required file/);
});

test('targets command prints all supported ids', () => {
  const home = tempDir();
  const out = capture();
  const code = runCli(['targets'], fakeEnv(home), out.io);
  assert.equal(code, 0);
  for (const id of supportedTargetIds()) {
    assert.equal(out.stdout().includes(id), true, id);
  }
});

test('install --dry-run defaults to all agents and does not write', () => {
  const home = tempDir();
  const out = capture();
  const code = runCli(['install', '--dry-run'], fakeEnv(home), out.io);
  assert.equal(code, 0, out.stderr());
  for (const id of supportedTargetIds().filter((targetId) => !['antigravity', 'antigravity-all'].includes(targetId))) {
    assert.equal(out.stdout().includes(`[${id}]`), true, id);
  }
  assert.equal(out.stdout().includes('[antigravity]'), false);
  assert.equal(out.stdout().includes('[antigravity-all]'), false);
  assert.equal(fs.existsSync(path.join(home, '.codex')), false);
});

test('install --agent codex --dry-run selects only Codex', () => {
  const home = tempDir();
  const out = capture();
  const code = runCli(['install', '--agent', 'codex', '--dry-run'], fakeEnv(home), out.io);
  assert.equal(code, 0, out.stderr());
  assert.equal(out.stdout().includes('[codex]'), true);
  assert.equal(out.stdout().includes('[claude]'), false);
  assert.equal(out.stdout().includes('Planned entries: .codex-plugin, assets, skills'), true);
  assert.equal(out.stdout().includes(path.join(home, '.codex', 'tmp', 'plugins', 'plugins', 'tungnt-ai-skills-marketplace')), true);
  assert.equal(out.stdout().includes(path.join(home, '.codex', 'tmp', 'plugins', '.agents', 'plugins', 'marketplace.json')), true);
  assert.equal(out.stdout().includes('Marketplace plugin: tungnt-ai-skills'), true);
});

test('install --agent claude --dry-run selects Claude marketplace commands', () => {
  const home = tempDir();
  const out = capture();
  const code = runCli(['install', '--agent', 'claude', '--dry-run'], fakeEnv(home), out.io);
  assert.equal(code, 0, out.stderr());
  assert.equal(out.stdout().includes('[claude]'), true);
  assert.equal(out.stdout().includes('[codex]'), false);
  assert.equal(out.stdout().includes('Mode: native marketplace commands'), true);
  assert.equal(out.stdout().includes('Command: claude plugin marketplace add tungnt1405/tungnt-ai-skills-marketplace'), true);
  assert.equal(out.stdout().includes('Command: claude plugin install tungnt-ai-skills@tungnt-ai-skills-marketplace'), true);
  assert.equal(out.stdout().includes('Command: claude plugin enable tungnt-ai-skills@tungnt-ai-skills-marketplace'), true);
});

test('install --agent agy --dry-run uses Antigravity CLI plugin layout', () => {
  const home = tempDir();
  const out = capture();
  const code = runCli(['install', '--agent', 'agy', '--dry-run'], fakeEnv(home), out.io);
  assert.equal(code, 0, out.stderr());
  assert.equal(out.stdout().includes(path.join(home, '.gemini', 'antigravity-cli', 'plugins', 'tungnt-ai-skills')), true);
  assert.equal(out.stdout().includes('Planned entries: plugin.json, skills'), true);
  assert.equal(out.stdout().includes(`Additional target: ${path.join(home, '.gemini')}`), true);
  assert.equal(out.stdout().includes('Additional entries: AGENTS.md, CLAUDE.md, GEMINI.md, gemini-extension.json'), true);
});

test('install --agent antigravity-ide --dry-run uses Antigravity IDE plugin layout', () => {
  const home = tempDir();
  const out = capture();
  const code = runCli(['install', '--agent', 'antigravity-ide', '--dry-run'], fakeEnv(home), out.io);
  assert.equal(code, 0, out.stderr());
  assert.equal(out.stdout().includes(path.join(home, '.gemini', 'config', 'plugins', 'tungnt-ai-skills')), true);
  assert.equal(out.stdout().includes('Planned entries: plugin.json, skills'), true);
  assert.equal(out.stdout().includes(`Additional target: ${path.join(home, '.gemini')}`), true);
  assert.equal(out.stdout().includes('Additional entries: AGENTS.md, CLAUDE.md, GEMINI.md, gemini-extension.json'), true);
});

test('install --agent antigravity --dry-run uses shared Antigravity IDE plugin layout', () => {
  const home = tempDir();
  const out = capture();
  const code = runCli(['install', '--agent', 'antigravity', '--dry-run'], fakeEnv(home), out.io);
  assert.equal(code, 0, out.stderr());
  assert.equal(out.stdout().includes(path.join(home, '.gemini', 'config', 'plugins', 'tungnt-ai-skills')), true);
  assert.equal(out.stdout().includes('Planned entries: plugin.json, skills'), true);
  assert.equal(out.stdout().includes(`Additional target: ${path.join(home, '.gemini')}`), true);
  assert.equal(out.stdout().includes('Additional entries: AGENTS.md, CLAUDE.md, GEMINI.md, gemini-extension.json'), true);
});

test('install --agent antigravity-all --dry-run plans all Antigravity plugin layouts', () => {
  const home = tempDir();
  const out = capture();
  const code = runCli(['install', '--agent', 'antigravity-all', '--dry-run'], fakeEnv(home), out.io);
  assert.equal(code, 0, out.stderr());
  assert.equal(out.stdout().includes('[agy]'), true);
  assert.equal(out.stdout().includes('[antigravity-ide]'), true);
  assert.equal(out.stdout().includes('[antigravity]'), false);
  assert.equal(out.stdout().includes(path.join(home, '.gemini', 'antigravity-cli', 'plugins', 'tungnt-ai-skills')), true);
  assert.equal(out.stdout().includes(path.join(home, '.gemini', 'config', 'plugins', 'tungnt-ai-skills')), true);
});

test('unknown agent exits non-zero', () => {
  const out = capture();
  const code = runCli(['install', '--agent', 'nope'], fakeEnv(tempDir()), out.io);
  assert.equal(code, 1);
  assert.equal(out.stderr().includes('Unknown agent'), true);
});

test('missing --agent value exits non-zero', () => {
  const out = capture();
  const code = runCli(['install', '--agent'], fakeEnv(tempDir()), out.io);
  assert.equal(code, 1);
  assert.equal(out.stderr().includes('Missing value for --agent'), true);
});

test('install fails on existing destination without --force', () => {
  const home = tempDir();
  const env = fakeEnv(home);
  const target = getTargetById('copilot');
  fs.mkdirSync(target.defaultTarget(env), { recursive: true });
  const out = capture();
  const code = runCli(['install', '--agent', 'copilot'], env, out.io);
  assert.equal(code, 1);
  assert.equal(out.stderr().includes('Destination already exists'), true);
});

test('install --force replaces existing destination', () => {
  const home = tempDir();
  const env = fakeEnv(home);
  const target = getTargetById('copilot');
  const destination = target.defaultTarget(env);
  fs.mkdirSync(destination, { recursive: true });
  fs.writeFileSync(path.join(destination, 'stale.txt'), 'stale');
  const out = capture();
  const code = runCli(['install', '--agent', 'copilot', '--force'], env, out.io);
  assert.equal(code, 0, out.stderr());
  assert.equal(fs.existsSync(path.join(destination, 'stale.txt')), false);
  assert.equal(fs.existsSync(path.join(destination, 'skills', 'using-tungnt-ai-skills', 'SKILL.md')), true);
});

test('codex installs local marketplace package and entry', () => {
  const home = tempDir();
  const env = fakeEnv(home);
  const target = getTargetById('codex');
  const destination = target.defaultTarget(env);
  const marketplaceFile = path.join(home, '.codex', 'tmp', 'plugins', '.agents', 'plugins', 'marketplace.json');
  const out = capture();
  const code = runCli(['install', '--agent', 'codex'], env, out.io);
  assert.equal(code, 0, out.stderr());
  assert.equal(fs.existsSync(path.join(destination, '.codex-plugin', 'plugin.json')), true);
  assert.equal(fs.existsSync(path.join(destination, 'skills', 'using-tungnt-ai-skills', 'SKILL.md')), true);
  assert.equal(fs.existsSync(path.join(destination, 'assets', 'tungnt-ai-skills-small.svg')), true);
  const marketplace = JSON.parse(fs.readFileSync(marketplaceFile, 'utf8'));
  const entry = marketplace.plugins.find((plugin) => plugin.name === 'tungnt-ai-skills');
  assert.equal(entry.source.source, 'local');
  assert.equal(entry.source.path, './plugins/tungnt-ai-skills-marketplace');
  assert.equal(entry.policy.installation, 'AVAILABLE');
});

test('agy installs plugin folder with marker file and skills', () => {
  const home = tempDir();
  const env = fakeEnv(home);
  const target = getTargetById('agy');
  const destination = target.defaultTarget(env);
  const out = capture();
  const code = runCli(['install', '--agent', 'agy'], env, out.io);
  assert.equal(code, 0, out.stderr());
  assert.equal(fs.existsSync(path.join(destination, 'plugin.json')), true);
  assert.equal(fs.existsSync(path.join(destination, 'skills', 'using-tungnt-ai-skills', 'SKILL.md')), true);
  assert.equal(fs.existsSync(path.join(home, '.gemini', 'AGENTS.md')), true);
  assert.equal(fs.existsSync(path.join(home, '.gemini', 'CLAUDE.md')), true);
  assert.equal(fs.existsSync(path.join(home, '.gemini', 'GEMINI.md')), true);
  assert.equal(fs.existsSync(path.join(home, '.gemini', 'gemini-extension.json')), true);
});

async function run() {
  let failed = 0;
  for (const { name, fn } of tests) {
    try {
      await fn();
      console.log(`PASS ${name}`);
    } catch (error) {
      failed += 1;
      console.log(`FAIL ${name}`);
      console.log(error.stack || error.message);
    }
  }
  if (failed > 0) {
    process.exit(1);
  }
  console.log(`\n${tests.length} tests passed`);
}

run();
