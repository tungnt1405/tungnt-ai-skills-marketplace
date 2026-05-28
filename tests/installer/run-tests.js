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

function emptyPathEnv(home) {
  return { ...fakeEnv(home), PATH: '' };
}

function makeFakeExecutable(directory, name) {
  const executableName = process.platform === 'win32' ? `${name}.cmd` : name;
  const filePath = path.join(directory, executableName);
  const content = process.platform === 'win32'
    ? '@echo off\r\nexit /b 0\r\n'
    : '#!/bin/sh\nexit 0\n';
  fs.writeFileSync(filePath, content);
  if (process.platform !== 'win32') {
    fs.chmodSync(filePath, 0o755);
  }
  return filePath;
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
  assert.equal(
    getTargetById('copilot').defaultTarget(fakeEnv(home)),
    path.join(home, '.copilot'),
  );
  assert.equal(getTargetById('copilot').expectedParent(fakeEnv(home)), home);
  assert.equal(getTargetById('codex').defaultTarget(fakeEnv(home)), path.join(home, '.codex'));
  assert.equal(getTargetById('codex').expectedParent(fakeEnv(home)), home);
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
  const target = getTargetById('gemini');
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
  const target = getTargetById('gemini');
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
  assert.equal(out.stdout().includes('Mode: manual marketplace setup'), true);
  assert.equal(out.stdout().includes('Command: codex plugin marketplace add tungnt1405/tungnt-ai-skills-marketplace'), false);
  assert.equal(out.stdout().includes('Command: codex plugin add tungnt-ai-skills@tungnt-ai-skills-marketplace'), false);
  assert.equal(out.stdout().includes(`Manual target: ${path.join(home, '.codex', 'plugins', 'tungnt-ai-skills-marketplace')}`), true);
  assert.equal(out.stdout().includes(`Manual marketplace file: ${path.join(home, '.agents', 'plugins', 'marketplace.json')}`), true);
  assert.equal(out.stdout().includes('Next steps:'), true);
  assert.equal(out.stdout().includes('Codex CLI: Open a terminal and run codex.'), true);
  assert.equal(out.stdout().includes('Codex CLI: Run /plugins tungnt-ai-skills.'), true);
  assert.equal(out.stdout().includes('Codex CLI: Add the plugin from the plugins screen.'), true);
  assert.equal(out.stdout().includes('Codex app: Open the Plugins tab.'), true);
  assert.equal(out.stdout().includes('Planned entries:'), false);
  assert.equal(out.stdout().includes('Marketplace file:'), false);
  assert.equal(out.stdout().includes('Config file:'), false);
  assert.equal(fs.existsSync(path.join(home, '.codex')), false);
});

test('install --agent codex --native --dry-run selects Codex native commands', () => {
  const home = tempDir();
  const out = capture();
  const code = runCli(['install', '--agent', 'codex', '--native', '--dry-run'], fakeEnv(home), out.io);
  assert.equal(code, 0, out.stderr());
  assert.equal(out.stdout().includes('Native: enabled'), true);
  assert.equal(out.stdout().includes('Mode: native marketplace commands'), true);
  assert.equal(out.stdout().includes('Command: codex plugin marketplace add tungnt1405/tungnt-ai-skills-marketplace'), true);
  assert.equal(out.stdout().includes('Command: codex plugin add tungnt-ai-skills@tungnt-ai-skills-marketplace'), true);
  assert.equal(out.stdout().includes('Manual setup available when --native is omitted:'), true);
  assert.equal(fs.existsSync(path.join(home, '.codex')), false);
});

test('install --agent copilot --dry-run selects Copilot manual marketplace settings', () => {
  const home = tempDir();
  const out = capture();
  const code = runCli(['install', '--agent', 'copilot', '--dry-run'], fakeEnv(home), out.io);
  assert.equal(code, 0, out.stderr());
  assert.equal(out.stdout().includes('[copilot]'), true);
  assert.equal(out.stdout().includes('[codex]'), false);
  assert.equal(out.stdout().includes('Mode: manual marketplace setup'), true);
  assert.equal(out.stdout().includes('Command: copilot plugin marketplace add tungnt1405/tungnt-ai-skills-marketplace'), false);
  assert.equal(out.stdout().includes(`Manual settings file: ${path.join(home, '.copilot', 'settings.json')}`), true);
  assert.equal(out.stdout().includes('Manual marketplace: tungnt-ai-skills-marketplace'), true);
  assert.equal(out.stdout().includes('Copilot app: Open GitHub Copilot.'), true);
  assert.equal(out.stdout().includes('Copilot app: Open the Plugins tab.'), true);
  assert.equal(out.stdout().includes('Copilot app: Search for tungnt-ai-skills.'), true);
  assert.equal(out.stdout().includes('Copilot app: Add the plugin.'), true);
  assert.equal(out.stdout().includes('copilot plugin install tungnt-ai-skills@tungnt-ai-skills-marketplace'), true);
  assert.equal(out.stdout().includes('Config file:'), false);
  assert.equal(fs.existsSync(path.join(home, '.copilot')), false);
});

test('install --agent copilot imports marketplace settings by default', () => {
  const home = tempDir();
  const out = capture();
  const code = runCli(['install', '--agent', 'copilot'], emptyPathEnv(home), out.io);
  const settingsFile = path.join(home, '.copilot', 'settings.json');
  assert.equal(code, 0, out.stderr());
  assert.equal(out.stdout().includes('Native command not found'), false);
  assert.equal(out.stdout().includes('Status: marketplace configured'), true);
  assert.equal(out.stdout().includes('Copilot app: Open GitHub Copilot.'), true);
  assert.equal(out.stdout().includes('Copilot app: Open the Plugins tab.'), true);
  assert.equal(out.stdout().includes('Copilot app: Search for tungnt-ai-skills.'), true);
  assert.equal(out.stdout().includes('Copilot app: Add the plugin.'), true);
  assert.equal(out.stdout().includes('copilot plugin install tungnt-ai-skills@tungnt-ai-skills-marketplace'), true);
  assert.deepEqual(JSON.parse(fs.readFileSync(settingsFile, 'utf8')), {
    extraKnownMarketplaces: {
      'tungnt-ai-skills-marketplace': {
        source: {
          source: 'github',
          repo: 'tungnt1405/tungnt-ai-skills-marketplace',
        },
      },
    },
  });
});

test('install --agent codex imports local marketplace by default', () => {
  const home = tempDir();
  const out = capture();
  const code = runCli(['install', '--agent', 'codex'], emptyPathEnv(home), out.io);
  const destination = path.join(home, '.codex', 'plugins', 'tungnt-ai-skills-marketplace');
  const marketplaceFile = path.join(home, '.agents', 'plugins', 'marketplace.json');
  assert.equal(code, 0, out.stderr());
  assert.equal(out.stdout().includes('Native command not found'), false);
  assert.equal(out.stdout().includes('Status: marketplace configured'), true);
  assert.equal(out.stdout().includes('Codex CLI: Open a terminal and run codex.'), true);
  assert.equal(out.stdout().includes('Codex CLI: Run /plugins tungnt-ai-skills.'), true);
  assert.equal(out.stdout().includes('Codex CLI: Add the plugin from the plugins screen.'), true);
  assert.equal(out.stdout().includes('Codex app: Add the plugin.'), true);
  assert.equal(fs.existsSync(path.join(destination, '.codex-plugin', 'plugin.json')), true);
  assert.equal(fs.existsSync(path.join(destination, 'skills', 'using-tungnt-ai-skills', 'SKILL.md')), true);
  assert.deepEqual(JSON.parse(fs.readFileSync(marketplaceFile, 'utf8')), {
    name: 'tungnt-ai-skills-marketplace',
    interface: {
      displayName: 'Tungnt AI Skills',
    },
    plugins: [
      {
        name: 'tungnt-ai-skills',
        source: {
          source: 'local',
          path: './.codex/plugins/tungnt-ai-skills-marketplace',
        },
        policy: {
          installation: 'AVAILABLE',
          authentication: 'ON_INSTALL',
        },
        category: 'Coding',
      },
    ],
  });
});

test('native command preflight accepts commands from PATH with --native', () => {
  const home = tempDir();
  const bin = path.join(home, 'bin');
  fs.mkdirSync(bin, { recursive: true });
  makeFakeExecutable(bin, 'codex');
  const out = capture();
  const code = runCli(['install', '--agent', 'codex', '--native'], { ...fakeEnv(home), PATH: bin }, out.io);
  assert.equal(code, 0, out.stderr());
  assert.equal(out.stdout().includes('Status: installed'), true);
  assert.equal(out.stdout().includes('Note: Codex plugin installed through Codex CLI.'), true);
  assert.equal(out.stdout().includes('Next steps:'), false);
  assert.equal(out.stdout().includes('Codex CLI:'), false);
});

test('install --agent codex --native fails clearly when codex command is missing', () => {
  const out = capture();
  const code = runCli(['install', '--agent', 'codex', '--native'], emptyPathEnv(tempDir()), out.io);
  assert.equal(code, 1);
  assert.equal(out.stderr().includes('Native command not found: codex'), true);
});

test('native command path is used only with --native when copilot exists', () => {
  const home = tempDir();
  const bin = path.join(home, 'bin');
  fs.mkdirSync(bin, { recursive: true });
  makeFakeExecutable(bin, 'copilot');
  const out = capture();
  const code = runCli(['install', '--agent', 'copilot', '--native'], { ...fakeEnv(home), PATH: bin }, out.io);
  assert.equal(code, 0, out.stderr());
  assert.equal(out.stdout().includes('Status: installed'), true);
  assert.equal(out.stdout().includes('Status: marketplace configured'), false);
  assert.equal(out.stdout().includes('Next steps:'), false);
  assert.equal(out.stdout().includes('Copilot app:'), false);
  assert.equal(fs.existsSync(path.join(home, '.copilot', 'settings.json')), false);
});

test('install --agent claude --native does not print next steps when commands succeed', () => {
  const home = tempDir();
  const bin = path.join(home, 'bin');
  fs.mkdirSync(bin, { recursive: true });
  makeFakeExecutable(bin, 'claude');
  const out = capture();
  const code = runCli(['install', '--agent', 'claude', '--native'], { ...fakeEnv(home), PATH: bin }, out.io);
  assert.equal(code, 0, out.stderr());
  assert.equal(out.stdout().includes('Status: installed'), true);
  assert.equal(out.stdout().includes('Next steps:'), false);
  assert.equal(out.stdout().includes('Claude Code app:'), false);
});

test('install --agent copilot merges manual marketplace settings by default', () => {
  const home = tempDir();
  const settingsFile = path.join(home, '.copilot', 'settings.json');
  fs.mkdirSync(path.dirname(settingsFile), { recursive: true });
  fs.writeFileSync(settingsFile, `${JSON.stringify({
    theme: 'dark',
    extraKnownMarketplaces: {
      existing: {
        source: {
          source: 'github',
          repo: 'example/existing',
        },
      },
    },
    enabledPlugins: ['left alone'],
  }, null, 2)}\n`);
  const out = capture();
  const code = runCli(['install', '--agent', 'copilot'], emptyPathEnv(home), out.io);
  const settings = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
  assert.equal(code, 0, out.stderr());
  assert.equal(settings.theme, 'dark');
  assert.deepEqual(settings.extraKnownMarketplaces.existing, {
    source: {
      source: 'github',
      repo: 'example/existing',
    },
  });
  assert.deepEqual(settings.extraKnownMarketplaces['tungnt-ai-skills-marketplace'], {
    source: {
      source: 'github',
      repo: 'tungnt1405/tungnt-ai-skills-marketplace',
    },
  });
  assert.deepEqual(settings.enabledPlugins, ['left alone']);
});

test('install --agent copilot fails without overwriting invalid fallback settings JSON', () => {
  const home = tempDir();
  const settingsFile = path.join(home, '.copilot', 'settings.json');
  fs.mkdirSync(path.dirname(settingsFile), { recursive: true });
  fs.writeFileSync(settingsFile, '{ invalid json');
  const out = capture();
  const code = runCli(['install', '--agent', 'copilot'], emptyPathEnv(home), out.io);
  assert.equal(code, 1);
  assert.equal(out.stderr().includes('Invalid JSON'), true);
  assert.equal(fs.readFileSync(settingsFile, 'utf8'), '{ invalid json');
});

test('install --agent copilot fails when fallback settings keys are non-objects', () => {
  const home = tempDir();
  const settingsFile = path.join(home, '.copilot', 'settings.json');
  fs.mkdirSync(path.dirname(settingsFile), { recursive: true });
  fs.writeFileSync(settingsFile, `${JSON.stringify({
    extraKnownMarketplaces: [],
  }, null, 2)}\n`);
  const out = capture();
  const code = runCli(['install', '--agent', 'copilot'], emptyPathEnv(home), out.io);
  assert.equal(code, 1);
  assert.equal(out.stderr().includes('extraKnownMarketplaces must be an object'), true);
});

test('install --agent claude --dry-run selects Claude manual marketplace setup', () => {
  const home = tempDir();
  const out = capture();
  const code = runCli(['install', '--agent', 'claude', '--dry-run'], fakeEnv(home), out.io);
  assert.equal(code, 0, out.stderr());
  assert.equal(out.stdout().includes('[claude]'), true);
  assert.equal(out.stdout().includes('[codex]'), false);
  assert.equal(out.stdout().includes('Mode: manual marketplace setup'), true);
  assert.equal(out.stdout().includes(`Manual target: ${path.join(home, '.claude', 'plugins', 'cache', 'tungnt-ai-skills-marketplace')}`), true);
  assert.equal(out.stdout().includes('Manual entries: .claude-plugin, hooks, skills'), true);
  assert.equal(out.stdout().includes('Claude Code app: Open Claude Code.'), true);
  assert.equal(out.stdout().includes('Claude Code app: Open the Plugins tab.'), true);
  assert.equal(out.stdout().includes('Claude Code app: Search for tungnt-ai-skills.'), true);
  assert.equal(out.stdout().includes('Claude Code app: Add the plugin.'), true);
  assert.equal(out.stdout().includes('claude plugin install tungnt-ai-skills@tungnt-ai-skills-marketplace'), true);
  assert.equal(out.stdout().includes('claude plugin enable tungnt-ai-skills@tungnt-ai-skills-marketplace'), true);
  assert.equal(out.stdout().includes('Command: claude plugin marketplace add tungnt1405/tungnt-ai-skills-marketplace'), false);
});

test('install --agent claude --native --dry-run selects Claude marketplace commands', () => {
  const home = tempDir();
  const out = capture();
  const code = runCli(['install', '--agent', 'claude', '--native', '--dry-run'], fakeEnv(home), out.io);
  assert.equal(code, 0, out.stderr());
  assert.equal(out.stdout().includes('Mode: native marketplace commands'), true);
  assert.equal(out.stdout().includes('Command: claude plugin marketplace add tungnt1405/tungnt-ai-skills-marketplace'), true);
  assert.equal(out.stdout().includes('Command: claude plugin install tungnt-ai-skills@tungnt-ai-skills-marketplace'), true);
  assert.equal(out.stdout().includes('Command: claude plugin enable tungnt-ai-skills@tungnt-ai-skills-marketplace'), true);
});

test('install --agent claude imports local marketplace by default', () => {
  const home = tempDir();
  const out = capture();
  const code = runCli(['install', '--agent', 'claude'], emptyPathEnv(home), out.io);
  const destination = path.join(home, '.claude', 'plugins', 'cache', 'tungnt-ai-skills-marketplace');
  assert.equal(code, 0, out.stderr());
  assert.equal(out.stdout().includes('Native command not found'), false);
  assert.equal(out.stdout().includes('Status: marketplace configured'), true);
  assert.equal(fs.existsSync(path.join(destination, '.claude-plugin', 'marketplace.json')), true);
  assert.equal(fs.existsSync(path.join(destination, '.claude-plugin', 'plugin.json')), true);
  assert.equal(fs.existsSync(path.join(destination, 'skills', 'using-tungnt-ai-skills', 'SKILL.md')), true);
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

test('install fails on existing package destination without --force', () => {
  const home = tempDir();
  const env = fakeEnv(home);
  const target = getTargetById('gemini');
  fs.mkdirSync(target.defaultTarget(env), { recursive: true });
  const out = capture();
  const code = runCli(['install', '--agent', 'gemini'], env, out.io);
  assert.equal(code, 1);
  assert.equal(out.stderr().includes('Destination already exists'), true);
});

test('install --force replaces existing package destination', () => {
  const home = tempDir();
  const env = fakeEnv(home);
  const target = getTargetById('gemini');
  const destination = target.defaultTarget(env);
  fs.mkdirSync(destination, { recursive: true });
  fs.writeFileSync(path.join(destination, 'stale.txt'), 'stale');
  const out = capture();
  const code = runCli(['install', '--agent', 'gemini', '--force'], env, out.io);
  assert.equal(code, 0, out.stderr());
  assert.equal(fs.existsSync(path.join(destination, 'stale.txt')), false);
  assert.equal(fs.existsSync(path.join(destination, 'skills', 'using-tungnt-ai-skills', 'SKILL.md')), true);
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
