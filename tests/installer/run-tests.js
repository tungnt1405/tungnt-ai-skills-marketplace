import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import {
  getAllTargets,
  getTargetById,
  supportedTargetIds,
} from '../../installer/target-map.js';
import {
  copyPackage,
  copySettingTemplate,
  ensureInsideExpectedParent,
  getPackageRoot,
  listPlannedEntries,
  pluginFileMode,
  registerPluginFilesForTarget,
  removeManagedPackageEntries,
  removeExistingInstall,
  validateInstall,
  validateSource,
} from '../../installer/package-copy.js';
import { runCli, writeOpenCodeConfig } from '../../installer/cli.js';

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

function assertNoTmpLeftover(destination) {
  assert.equal(fs.existsSync(path.join(destination, '.tmp')), false);
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

function makeFakeLoggingExecutable(directory, name) {
  const executableName = process.platform === 'win32' ? `${name}.cmd` : name;
  const filePath = path.join(directory, executableName);
  const content = process.platform === 'win32'
    ? '@echo off\r\necho %*>>"%TEST_COMMAND_LOG%"\r\nexit /b 0\r\n'
    : '#!/bin/sh\necho "$*" >> "$TEST_COMMAND_LOG"\nexit 0\n';
  fs.writeFileSync(filePath, content);
  if (process.platform !== 'win32') {
    fs.chmodSync(filePath, 0o755);
  }
  return filePath;
}

function makeFakeMarketplaceAlreadyRegisteredExecutable(directory, name) {
  const executableName = process.platform === 'win32' ? `${name}.cmd` : name;
  const filePath = path.join(directory, executableName);
  const content = process.platform === 'win32'
    ? [
      '@echo off',
      'echo %*>>"%TEST_COMMAND_LOG%"',
      'if "%1 %2 %3"=="plugin marketplace add" (',
      '  echo Marketplace "tungnt-ai-skills-marketplace" already registered 1>&2',
      '  exit /b 1',
      ')',
      'exit /b 0',
      '',
    ].join('\r\n')
    : [
      '#!/bin/sh',
      'echo "$*" >> "$TEST_COMMAND_LOG"',
      'if [ "$1 $2 $3" = "plugin marketplace add" ]; then',
      '  echo \'Marketplace "tungnt-ai-skills-marketplace" already registered\' >&2',
      '  exit 1',
      'fi',
      'exit 0',
      '',
    ].join('\n');
  fs.writeFileSync(filePath, content);
  if (process.platform !== 'win32') {
    fs.chmodSync(filePath, 0o755);
  }
  return filePath;
}

function makeFakeClaudeAlreadyEnabledExecutable(directory) {
  const executableName = process.platform === 'win32' ? 'claude.cmd' : 'claude';
  const filePath = path.join(directory, executableName);
  const content = process.platform === 'win32'
    ? [
      '@echo off',
      'echo %*>>"%TEST_COMMAND_LOG%"',
      'if "%1 %2"=="plugin enable" (',
      '  echo Failed to enable plugin "tungnt-ai-skills@tungnt-ai-skills-marketplace": Plugin "tungnt-ai-skills@tungnt-ai-skills-marketplace" is already enabled 1>&2',
      '  exit /b 1',
      ')',
      'exit /b 0',
      '',
    ].join('\r\n')
    : [
      '#!/bin/sh',
      'echo "$*" >> "$TEST_COMMAND_LOG"',
      'if [ "$1 $2" = "plugin enable" ]; then',
      '  echo \'Failed to enable plugin "tungnt-ai-skills@tungnt-ai-skills-marketplace": Plugin "tungnt-ai-skills@tungnt-ai-skills-marketplace" is already enabled\' >&2',
      '  exit 1',
      'fi',
      'exit 0',
      '',
    ].join('\n');
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
    'opencode',
    'agy',
    'antigravity',
    'antigravity-ide',
    'antigravity-all',
  ]);
  assert.equal(getAllTargets().length, 9);
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
    'setting.json',
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
  assert.equal(fs.existsSync(path.join(destination, 'setting.json')), true);
  assert.equal(fs.existsSync(path.join(destination, 'skills', 'using-tungnt-ai-skills', 'SKILL.md')), true);
});

test('copyPackage excludes Python bytecode cache files', () => {
  const fixture = tempDir();
  const destination = path.join(tempDir(), 'plugin');
  const skillDir = path.join(fixture, 'skills', 'example');
  fs.mkdirSync(path.join(skillDir, 'scripts', '__pycache__'), { recursive: true });
  fs.writeFileSync(path.join(skillDir, 'SKILL.md'), '---\nname: example\ndescription: example\n---\n');
  fs.writeFileSync(path.join(skillDir, 'scripts', 'tool.py'), 'print("ok")\n');
  fs.writeFileSync(path.join(skillDir, 'scripts', '__pycache__', 'tool.cpython-312.pyc'), 'bytecode');

  copyPackage(fixture, destination);

  assert.equal(fs.existsSync(path.join(destination, 'skills', 'example', 'scripts', 'tool.py')), true);
  assert.equal(fs.existsSync(path.join(destination, 'skills', 'example', 'scripts', '__pycache__')), false);
  assert.equal(fs.existsSync(path.join(destination, 'skills', 'example', 'scripts', '__pycache__', 'tool.cpython-312.pyc')), false);
});

test('copySettingTemplate copies setting.template.json when setting.json does not exist', () => {
  const fixture = tempDir();
  const destination = path.join(tempDir(), 'plugin');
  fs.writeFileSync(path.join(fixture, 'setting.template.json'), '{"test": true}');

  copySettingTemplate(fixture, destination);

  assert.equal(fs.existsSync(path.join(destination, 'setting.json')), true);
  assert.equal(fs.readFileSync(path.join(destination, 'setting.json'), 'utf8'), '{"test": true}');
});

test('copySettingTemplate does not overwrite existing setting.json', () => {
  const fixture = tempDir();
  const destination = path.join(tempDir(), 'plugin');
  fs.writeFileSync(path.join(fixture, 'setting.template.json'), '{"test": true}');

  fs.mkdirSync(destination, { recursive: true });
  fs.writeFileSync(path.join(destination, 'setting.json'), '{"existing": true}');

  copySettingTemplate(fixture, destination);

  assert.equal(fs.readFileSync(path.join(destination, 'setting.json'), 'utf8'), '{"existing": true}');
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
  assert.equal(out.stdout().includes('Manual entries: .codex-plugin, assets, skills, setting.json'), true);
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
  assert.equal(out.stdout().includes('Copilot app: Open GitHub Copilot Chat (Visual Studio Code - VSCode).'), true);
  assert.equal(out.stdout().includes('Copilot app: Open the Extensions vscode.'), true);
  assert.equal(out.stdout().includes('Copilot app: Find `@agentPlugins:tungnt1405/tungnt-ai-skills-marketplace` to install.'), true);
  assert.equal(out.stdout().includes('Copilot app: Open the Plugins tab.'), true);
  assert.equal(out.stdout().includes('Copilot app: Check installed plugin.'), true);
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
  assert.equal(out.stdout().includes('Copilot app: Open GitHub Copilot Chat (Visual Studio Code - VSCode).'), true);
  assert.equal(out.stdout().includes('Copilot app: Open the Extensions vscode.'), true);
  assert.equal(out.stdout().includes('Copilot app: Find `@agentPlugins:tungnt1405/tungnt-ai-skills-marketplace` to install.'), true);
  assert.equal(out.stdout().includes('Copilot app: Open the Plugins tab.'), true);
  assert.equal(out.stdout().includes('Copilot app: Check installed plugin.'), true);
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

test('plugin manifests select hooks for their harness', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(PACKAGE_ROOT, 'plugin.json'), 'utf8'));
  const claudeManifest = JSON.parse(fs.readFileSync(path.join(PACKAGE_ROOT, '.claude-plugin', 'plugin.json'), 'utf8'));

  assert.equal(manifest.skills, './skills/');
  assert.equal(manifest.hooks, './hooks/hooks-copilot.json');
  assert.equal(Object.hasOwn(claudeManifest, 'hooks'), false);
});

test('copilot hook manifest uses documented sessionStart command shape', () => {
  const hooks = JSON.parse(fs.readFileSync(path.join(PACKAGE_ROOT, 'hooks', 'hooks-copilot.json'), 'utf8'));
  const entry = hooks.hooks.sessionStart[0];

  assert.equal(hooks.version, 1);
  assert.equal(Array.isArray(hooks.hooks.sessionStart), true);
  assert.equal(hooks.hooks.sessionStart.length, 1);
  assert.equal(entry.type, 'command');
  assert.equal(entry.timeoutSec, 30);
  assert.equal(Object.hasOwn(entry, 'cwd'), false);
  assert.match(entry.bash, /hooks\/session-start/);
  assert.match(entry.bash, /TUNGNT_AI_SKILLS_PLUGIN_ROOT/);
  assert.match(entry.bash, /\.copilot\/installed-plugins\/tungnt-ai-skills-marketplace\/tungnt-ai-skills/);
  assert.match(entry.powershell, /session-start\.ps1/);
  assert.match(entry.powershell, /TUNGNT_AI_SKILLS_PLUGIN_ROOT/);
  assert.match(entry.powershell, /installed-plugins\\tungnt-ai-skills-marketplace\\tungnt-ai-skills/);
});

test('copilot default hook discovery file is native sessionStart shape', () => {
  const hooks = JSON.parse(fs.readFileSync(path.join(PACKAGE_ROOT, 'hooks', 'hooks-copilot.json'), 'utf8'));
  const entry = hooks.hooks.sessionStart[0];

  assert.equal(hooks.version, 1);
  assert.equal(Array.isArray(hooks.hooks.sessionStart), true);
  assert.equal(hooks.hooks.sessionStart.length, 1);
  assert.equal(entry.type, 'command');
  assert.equal(entry.timeoutSec, 30);
  assert.equal(Object.hasOwn(entry, 'cwd'), false);
  assert.match(entry.bash, /hooks\/session-start/);
  assert.match(entry.bash, /TUNGNT_AI_SKILLS_PLUGIN_ROOT/);
  assert.match(entry.bash, /\.copilot\/installed-plugins\/tungnt-ai-skills-marketplace\/tungnt-ai-skills/);
  assert.match(entry.powershell, /session-start\.ps1/);
  assert.match(entry.powershell, /TUNGNT_AI_SKILLS_PLUGIN_ROOT/);
  assert.match(entry.powershell, /installed-plugins\\tungnt-ai-skills-marketplace\\tungnt-ai-skills/);
});

test('copilot source validation requires bootstrap hook files', () => {
  const target = getTargetById('copilot');

  validateSource(PACKAGE_ROOT, target);
  assert.equal(fs.existsSync(path.join(PACKAGE_ROOT, 'plugin.json')), true);
  assert.equal(fs.existsSync(path.join(PACKAGE_ROOT, 'setting.json')), true);
  assert.equal(fs.existsSync(path.join(PACKAGE_ROOT, 'skills', 'using-tungnt-ai-skills', 'SKILL.md')), true);
  assert.equal(fs.existsSync(path.join(PACKAGE_ROOT, 'hooks', 'session-start')), true);
  assert.equal(fs.existsSync(path.join(PACKAGE_ROOT, 'hooks', 'run-hook.cmd')), true);
  assert.equal(fs.existsSync(path.join(PACKAGE_ROOT, 'hooks', 'session-start.cmd')), true);
  assert.equal(fs.existsSync(path.join(PACKAGE_ROOT, 'hooks', 'session-start.ps1')), true);
  assert.equal(fs.existsSync(path.join(PACKAGE_ROOT, 'hooks', 'hooks-copilot.json')), true);
});

test('antigravity hook manifest uses documented PreInvocation injectSteps shape', () => {
  const hooks = JSON.parse(fs.readFileSync(path.join(PACKAGE_ROOT, 'hooks', 'hooks.antigravity.json'), 'utf8'));
  const hook = hooks['tungnt-ai-skills-bootstrap'];
  const entry = hook.PreInvocation[0];

  assert.equal(Array.isArray(hook.PreInvocation), true);
  assert.equal(hook.PreInvocation.length, 1);
  assert.equal(entry.type, 'command');
  assert.equal(entry.command, 'hooks/run-hook.cmd antigravity-pre-invocation');
  assert.equal(entry.timeout, 10);
});

test('antigravity source validation requires PreInvocation bootstrap hook files', () => {
  for (const id of ['agy', 'antigravity', 'antigravity-ide']) {
    const target = getTargetById(id);

    validateSource(PACKAGE_ROOT, target);
    assert.equal(fs.existsSync(path.join(PACKAGE_ROOT, 'plugin.json')), true);
    assert.equal(fs.existsSync(path.join(PACKAGE_ROOT, 'setting.json')), true);
    assert.equal(fs.existsSync(path.join(PACKAGE_ROOT, 'skills', 'using-tungnt-ai-skills', 'SKILL.md')), true);
    assert.equal(fs.existsSync(path.join(PACKAGE_ROOT, 'hooks', 'run-hook.cmd')), true);
    assert.equal(fs.existsSync(path.join(PACKAGE_ROOT, 'hooks', 'antigravity-pre-invocation')), true);
    assert.equal(fs.existsSync(path.join(PACKAGE_ROOT, 'hooks', 'antigravity-pre-invocation.cmd')), true);
    assert.equal(fs.existsSync(path.join(PACKAGE_ROOT, 'hooks', 'antigravity-pre-invocation.ps1')), true);
    assert.equal(fs.existsSync(path.join(PACKAGE_ROOT, 'hooks', 'hooks.antigravity.json')), true);
  }
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
  assert.equal(fs.existsSync(path.join(destination, 'setting.json')), true);
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

test('install --agent copilot --native continues when marketplace already exists', () => {
  const home = tempDir();
  const bin = path.join(home, 'bin');
  const commandLog = path.join(home, 'commands.log');
  fs.mkdirSync(bin, { recursive: true });
  makeFakeMarketplaceAlreadyRegisteredExecutable(bin, 'copilot');
  const out = capture();
  const code = runCli(
    ['install', '--agent', 'copilot', '--native'],
    { ...fakeEnv(home), PATH: bin, TEST_COMMAND_LOG: commandLog },
    out.io,
  );
  const log = fs.readFileSync(commandLog, 'utf8');
  assert.equal(code, 0, out.stderr());
  assert.equal(out.stdout().includes('Marketplace already registered; continuing with plugin install.'), true);
  assert.equal(log.includes('plugin marketplace add tungnt1405/tungnt-ai-skills-marketplace'), true);
  assert.equal(log.includes('plugin install tungnt-ai-skills@tungnt-ai-skills-marketplace'), true);
});

test('install --agent claude --native continues when marketplace already exists', () => {
  const home = tempDir();
  const bin = path.join(home, 'bin');
  const commandLog = path.join(home, 'commands.log');
  fs.mkdirSync(bin, { recursive: true });
  makeFakeMarketplaceAlreadyRegisteredExecutable(bin, 'claude');
  const out = capture();
  const code = runCli(
    ['install', '--agent', 'claude', '--native'],
    { ...fakeEnv(home), PATH: bin, TEST_COMMAND_LOG: commandLog },
    out.io,
  );
  const log = fs.readFileSync(commandLog, 'utf8');
  assert.equal(code, 0, out.stderr());
  assert.equal(out.stdout().includes('Marketplace already registered; continuing with plugin install.'), true);
  assert.equal(log.includes('plugin marketplace add tungnt1405/tungnt-ai-skills-marketplace'), true);
  assert.equal(log.includes('plugin install tungnt-ai-skills@tungnt-ai-skills-marketplace'), true);
  assert.equal(log.includes('plugin enable tungnt-ai-skills@tungnt-ai-skills-marketplace'), true);
});

test('install --agent claude --native continues when plugin is already enabled', () => {
  const home = tempDir();
  const bin = path.join(home, 'bin');
  const commandLog = path.join(home, 'commands.log');
  fs.mkdirSync(bin, { recursive: true });
  makeFakeClaudeAlreadyEnabledExecutable(bin);
  const out = capture();
  const code = runCli(
    ['install', '--agent', 'claude', '--native'],
    { ...fakeEnv(home), PATH: bin, TEST_COMMAND_LOG: commandLog },
    out.io,
  );
  const log = fs.readFileSync(commandLog, 'utf8');
  assert.equal(code, 0, out.stderr());
  assert.equal(out.stdout().includes('Plugin already enabled; continuing.'), true);
  assert.equal(log.includes('plugin marketplace add tungnt1405/tungnt-ai-skills-marketplace'), true);
  assert.equal(log.includes('plugin install tungnt-ai-skills@tungnt-ai-skills-marketplace'), true);
  assert.equal(log.includes('plugin enable tungnt-ai-skills@tungnt-ai-skills-marketplace'), true);
});

test('update --agent claude --native runs update commands without enable', () => {
  const home = tempDir();
  const bin = path.join(home, 'bin');
  const commandLog = path.join(home, 'commands.log');
  fs.mkdirSync(bin, { recursive: true });
  makeFakeLoggingExecutable(bin, 'claude');
  const out = capture();
  const code = runCli(
    ['update', '--agent', 'claude', '--native'],
    { ...fakeEnv(home), PATH: bin, TEST_COMMAND_LOG: commandLog },
    out.io,
  );
  const log = fs.readFileSync(commandLog, 'utf8');
  assert.equal(code, 0, out.stderr());
  assert.equal(log.includes('plugin marketplace update tungnt-ai-skills-marketplace'), true);
  assert.equal(log.includes('plugin update tungnt-ai-skills@tungnt-ai-skills-marketplace'), true);
  assert.equal(log.includes('plugin enable tungnt-ai-skills@tungnt-ai-skills-marketplace'), false);
});

test('update --agent copilot --native --dry-run prints Copilot update commands', () => {
  const home = tempDir();
  const out = capture();
  const code = runCli(['update', '--agent', 'copilot', '--native', '--dry-run'], fakeEnv(home), out.io);
  assert.equal(code, 0, out.stderr());
  assert.equal(out.stdout().includes('Mode: native update commands'), true);
  assert.equal(out.stdout().includes('Command: copilot plugin marketplace update tungnt-ai-skills-marketplace'), true);
  assert.equal(out.stdout().includes('Command: copilot plugin update tungnt-ai-skills@tungnt-ai-skills-marketplace'), true);
});

test('install --agent copilot --native --force --dry-run uses update commands for compatibility', () => {
  const home = tempDir();
  const out = capture();
  const code = runCli(['install', '--agent', 'copilot', '--native', '--force', '--dry-run'], fakeEnv(home), out.io);
  assert.equal(code, 0, out.stderr());
  assert.equal(out.stdout().includes('Mode: native update commands'), true);
  assert.equal(out.stdout().includes('Command: copilot plugin marketplace update tungnt-ai-skills-marketplace'), true);
  assert.equal(out.stdout().includes('Command: copilot plugin update tungnt-ai-skills@tungnt-ai-skills-marketplace'), true);
  assert.equal(out.stdout().includes('Command: copilot plugin marketplace add tungnt1405/tungnt-ai-skills-marketplace'), false);
});

test('update --agent claude --native --dry-run prints Claude update commands', () => {
  const home = tempDir();
  const out = capture();
  const code = runCli(['update', '--agent', 'claude', '--native', '--dry-run'], fakeEnv(home), out.io);
  assert.equal(code, 0, out.stderr());
  assert.equal(out.stdout().includes('Mode: native update commands'), true);
  assert.equal(out.stdout().includes('Command: claude plugin marketplace update tungnt-ai-skills-marketplace'), true);
  assert.equal(out.stdout().includes('Command: claude plugin update tungnt-ai-skills@tungnt-ai-skills-marketplace'), true);
  assert.equal(out.stdout().includes('Command: claude plugin enable tungnt-ai-skills@tungnt-ai-skills-marketplace'), false);
});

test('update --agent codex --native --dry-run prints Codex reinstall commands', () => {
  const home = tempDir();
  const out = capture();
  const code = runCli(['update', '--agent', 'codex', '--native', '--dry-run'], fakeEnv(home), out.io);
  assert.equal(code, 0, out.stderr());
  assert.equal(out.stdout().includes('Mode: native update commands'), true);
  assert.equal(out.stdout().includes('Command: codex plugin marketplace upgrade tungnt-ai-skills-marketplace'), true);
  assert.equal(out.stdout().includes('Command: codex plugin remove tungnt-ai-skills@tungnt-ai-skills-marketplace'), true);
  assert.equal(out.stdout().includes('Command: codex plugin add tungnt-ai-skills@tungnt-ai-skills-marketplace'), true);
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
  assert.equal(out.stdout().includes('Manual entries: .claude-plugin, hooks, skills, setting.json'), true);
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
  assert.equal(fs.existsSync(path.join(destination, 'setting.json')), true);
  assert.equal(fs.existsSync(path.join(destination, 'skills', 'using-tungnt-ai-skills', 'SKILL.md')), true);
});

test('install --agent claude includes the shared hooks manifest', () => {
  const home = tempDir();
  const out = capture();
  const code = runCli(['install', '--agent', 'claude'], emptyPathEnv(home), out.io);
  const hooksFile = path.join(home, '.claude', 'plugins', 'cache', 'tungnt-ai-skills-marketplace', 'hooks', 'hooks.json');
  const hooks = JSON.parse(fs.readFileSync(hooksFile, 'utf8'));
  const sessionStart = hooks.hooks.SessionStart[0];
  const entry = hooks.hooks.SessionStart[0].hooks[0];

  assert.equal(code, 0, out.stderr());
  assert.equal(sessionStart.matcher, 'startup|resume|clear|compact');
  assert.equal(entry.command, '"${CLAUDE_PLUGIN_ROOT}/hooks/run-hook.cmd" session-start');
  assert.equal(entry.shell, 'bash');
});

test('claude fallback source includes bootstrap hook entrypoints', () => {
  const target = getTargetById('claude').fallbackInstall;
  validateSource(PACKAGE_ROOT, target);
  assert.equal(fs.existsSync(path.join(PACKAGE_ROOT, 'hooks', 'session-start')), true);
  assert.equal(fs.existsSync(path.join(PACKAGE_ROOT, 'hooks', 'run-hook.cmd')), true);
  assert.equal(fs.existsSync(path.join(PACKAGE_ROOT, 'hooks', 'session-start.cmd')), true);
  assert.equal(fs.existsSync(path.join(PACKAGE_ROOT, 'hooks', 'session-start.ps1')), true);
  assert.equal(fs.existsSync(path.join(PACKAGE_ROOT, 'hooks', 'hooks.json')), true);
});

test('install --agent agy --dry-run uses Antigravity CLI plugin layout', () => {
  const home = tempDir();
  const out = capture();
  const code = runCli(['install', '--agent', 'agy', '--dry-run'], fakeEnv(home), out.io);
  assert.equal(code, 0, out.stderr());
  assert.equal(out.stdout().includes(path.join(home, '.gemini', 'antigravity-cli', 'plugins', 'tungnt-ai-skills')), true);
  assert.equal(out.stdout().includes('Planned entries: plugin.json, hooks, skills, setting.json'), true);
  assert.equal(out.stdout().includes(`Additional target: ${path.join(home, '.gemini')}`), true);
  assert.equal(out.stdout().includes('Additional entries: AGENTS.md, CLAUDE.md, GEMINI.md, gemini-extension.json'), true);
});

test('install --agent antigravity-ide --dry-run uses Antigravity IDE plugin layout', () => {
  const home = tempDir();
  const out = capture();
  const code = runCli(['install', '--agent', 'antigravity-ide', '--dry-run'], fakeEnv(home), out.io);
  assert.equal(code, 0, out.stderr());
  assert.equal(out.stdout().includes(path.join(home, '.gemini', 'config', 'plugins', 'tungnt-ai-skills')), true);
  assert.equal(out.stdout().includes('Planned entries: plugin.json, hooks, skills, setting.json'), true);
  assert.equal(out.stdout().includes(`Additional target: ${path.join(home, '.gemini')}`), true);
  assert.equal(out.stdout().includes('Additional entries: AGENTS.md, CLAUDE.md, GEMINI.md, gemini-extension.json'), true);
});

test('install --agent antigravity --dry-run uses shared Antigravity IDE plugin layout', () => {
  const home = tempDir();
  const out = capture();
  const code = runCli(['install', '--agent', 'antigravity', '--dry-run'], fakeEnv(home), out.io);
  assert.equal(code, 0, out.stderr());
  assert.equal(out.stdout().includes(path.join(home, '.gemini', 'config', 'plugins', 'tungnt-ai-skills')), true);
  assert.equal(out.stdout().includes('Planned entries: plugin.json, hooks, skills, setting.json'), true);
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
  assert.equal(fs.existsSync(path.join(destination, 'setting.json')), true);
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
  assert.equal(fs.existsSync(path.join(destination, 'setting.json')), true);
  assert.equal(fs.existsSync(path.join(destination, 'hooks.json')), true);
  assert.equal(fs.existsSync(path.join(destination, 'hooks', 'antigravity-pre-invocation')), true);
  assert.equal(fs.existsSync(path.join(destination, 'hooks', 'antigravity-pre-invocation.cmd')), true);
  assert.equal(fs.existsSync(path.join(destination, 'hooks', 'antigravity-pre-invocation.ps1')), true);
  assert.equal(fs.existsSync(path.join(destination, 'skills', 'using-tungnt-ai-skills', 'SKILL.md')), true);
  assert.equal(fs.existsSync(path.join(home, '.gemini', 'AGENTS.md')), true);
  assert.equal(fs.existsSync(path.join(home, '.gemini', 'CLAUDE.md')), true);
  assert.equal(fs.existsSync(path.join(home, '.gemini', 'GEMINI.md')), true);
  assert.equal(fs.existsSync(path.join(home, '.gemini', 'gemini-extension.json')), true);
});

test('agy install writes the shared Antigravity root hooks manifest', () => {
  const home = tempDir();
  const env = fakeEnv(home);
  const target = getTargetById('agy');
  const destination = target.defaultTarget(env);
  const out = capture();
  const code = runCli(['install', '--agent', 'agy'], env, out.io);
  const hooks = JSON.parse(fs.readFileSync(path.join(destination, 'hooks.json'), 'utf8'));
  const command = hooks['tungnt-ai-skills-bootstrap'].PreInvocation[0].command;

  assert.equal(code, 0, out.stderr());
  assert.equal(command, 'hooks/run-hook.cmd antigravity-pre-invocation');
});

test('agy install registers absolute PreInvocation in global config hooks.json', () => {
  const home = tempDir();
  const env = fakeEnv(home);
  const out = capture();
  const code = runCli(['install', '--agent', 'agy'], env, out.io);
  assert.equal(code, 0, out.stderr());

  const globalHooksFile = path.join(home, '.gemini', 'config', 'hooks.json');
  const hooks = JSON.parse(fs.readFileSync(globalHooksFile, 'utf8'));
  const command = hooks['tungnt-ai-skills-bootstrap'].PreInvocation[0].command;
  const expectedScript = path.join(
    getTargetById('agy').defaultTarget(env),
    'hooks',
    'run-hook.cmd'
  );

  assert.equal(command, `bash "${expectedScript}" antigravity-pre-invocation`);
  assert.equal(out.stdout().includes('Registered global Antigravity hooks'), true, out.stdout());
});

test('agy install without --debug keeps policy.hookDebug disabled', () => {
  const home = tempDir();
  const env = fakeEnv(home);
  const destination = getTargetById('agy').defaultTarget(env);
  const out = capture();
  const code = runCli(['install', '--agent', 'agy'], env, out.io);
  assert.equal(code, 0, out.stderr());

  const setting = JSON.parse(fs.readFileSync(path.join(destination, 'setting.json'), 'utf8'));
  assert.equal(setting.policy.hookDebug, false);
  assert.equal(out.stdout().includes('Hook debug: enabled'), false, out.stdout());
});

test('install --debug enables policy.hookDebug in installed setting.json', () => {
  const home = tempDir();
  const env = fakeEnv(home);
  const destination = getTargetById('agy').defaultTarget(env);
  const out = capture();
  const code = runCli(['install', '--agent', 'agy', '--debug'], env, out.io);
  assert.equal(code, 0, out.stderr());

  const setting = JSON.parse(fs.readFileSync(path.join(destination, 'setting.json'), 'utf8'));
  assert.equal(setting.policy.hookDebug, true);
  assert.equal(setting.policy.autoCommit, false);
  assert.equal(out.stdout().includes('Hook debug: enabled (policy.hookDebug=true)'), true, out.stdout());
});

test('update --debug enables policy.hookDebug and preserves custom policy values', () => {
  const home = tempDir();
  const env = fakeEnv(home);
  const destination = getTargetById('agy').defaultTarget(env);

  let out = capture();
  let code = runCli(['install', '--agent', 'agy', '--force'], env, out.io);
  assert.equal(code, 0, out.stderr());

  const settingPath = path.join(destination, 'setting.json');
  fs.writeFileSync(settingPath, JSON.stringify({
    policy: {
      autoCommit: true,
      autoTest: false,
      hookDebug: false,
      dangerousCommands: { blocked: ['rm -rf /'], askConfirmation: false },
      sensitiveFiles: { blocked: [], askConfirmation: true },
      installAndUpdate: { askUser: false },
    },
  }, null, 2));

  out = capture();
  code = runCli(['update', '--agent', 'agy', '--debug'], env, out.io);
  assert.equal(code, 0, out.stderr());

  const setting = JSON.parse(fs.readFileSync(settingPath, 'utf8'));
  assert.equal(setting.policy.hookDebug, true);
  assert.equal(setting.policy.autoCommit, true, 'custom autoCommit must be preserved');
  assert.deepEqual(setting.policy.dangerousCommands.blocked, ['rm -rf /']);
});

test('global config hooks.json merge preserves foreign hook groups on install and update', () => {
  const home = tempDir();
  const env = fakeEnv(home);
  const globalHooksFile = path.join(home, '.gemini', 'config', 'hooks.json');
  fs.mkdirSync(path.dirname(globalHooksFile), { recursive: true });
  fs.writeFileSync(globalHooksFile, JSON.stringify({
    'someone-elses-hooks': {
      Stop: [{ type: 'command', command: '/bin/true' }],
    },
  }, null, 2));

  let out = capture();
  let code = runCli(['install', '--agent', 'agy'], env, out.io);
  assert.equal(code, 0, out.stderr());

  let hooks = JSON.parse(fs.readFileSync(globalHooksFile, 'utf8'));
  assert.deepEqual(hooks['someone-elses-hooks'].Stop[0].command, '/bin/true');
  assert.notEqual(hooks['tungnt-ai-skills-bootstrap'], undefined);

  code = runCli(['update', '--agent', 'agy'], env, out.io);
  assert.equal(code, 0, out.stderr());

  hooks = JSON.parse(fs.readFileSync(globalHooksFile, 'utf8'));
  assert.deepEqual(hooks['someone-elses-hooks'].Stop[0].command, '/bin/true');
  assert.equal(hooks['tungnt-ai-skills-bootstrap'].PreInvocation.length, 1);
});

test('antigravity pre-invocation bootstraps once per conversation then reminds', function () {
  if (process.platform === 'win32') {
    this.skip();
  }
  const hookPath = path.join(PACKAGE_ROOT, 'hooks', 'antigravity-pre-invocation');
  const stateDir = tempDir();
  const runHook = (payload) => spawnSync('bash', [hookPath], {
    input: JSON.stringify(payload),
    encoding: 'utf8',
    env: { ...process.env, TAIS_HOOK_STATE_DIR: stateDir },
  });

  const bootstrapRun = runHook({ invocationNum: 0, conversationId: 'conv-a' });
  assert.equal(bootstrapRun.status, 0, bootstrapRun.stderr);
  assert.equal(bootstrapRun.stdout.includes('EXTREMELY_IMPORTANT'), true, bootstrapRun.stdout);
  assert.equal(bootstrapRun.stdout.includes('"injectSteps"'), true, bootstrapRun.stdout);

  const reminderRun = runHook({ invocationNum: 0, conversationId: 'conv-a' });
  assert.equal(reminderRun.status, 0, reminderRun.stderr);
  assert.equal(reminderRun.stdout.includes('EXTREMELY_IMPORTANT'), false, reminderRun.stdout);
  assert.equal(reminderRun.stdout.includes('MUST call the Skill tool'), true, reminderRun.stdout);

  const midTurnRun = runHook({ invocationNum: 1, conversationId: 'conv-a' });
  assert.equal(midTurnRun.status, 0, midTurnRun.stderr);
  assert.deepEqual(JSON.parse(midTurnRun.stdout), {});

  const newConversationRun = runHook({ invocationNum: 0, conversationId: 'conv-b' });
  assert.equal(newConversationRun.status, 0, newConversationRun.stderr);
  assert.equal(newConversationRun.stdout.includes('EXTREMELY_IMPORTANT'), true, newConversationRun.stdout);

  const stateFile = path.join(stateDir, 'bootstrap-state.txt');
  const state = fs.readFileSync(stateFile, 'utf8');
  assert.equal(state.includes('conv-a='), true, state);
  assert.equal(state.includes('conv-b='), true, state);
});

test('antigravity pre-invocation enables debug logging via policy.hookDebug', function () {
  if (process.platform === 'win32') {
    this.skip();
  }
  const hookPath = path.join(PACKAGE_ROOT, 'hooks', 'antigravity-pre-invocation');
  const stateDir = tempDir();
  const workspace = tempDir();
  const logFile = path.join(workspace, 'hook-debug.log');
  fs.mkdirSync(path.join(workspace, 'tais'), { recursive: true });

  const runHook = () => spawnSync('bash', [hookPath], {
    input: JSON.stringify({ invocationNum: 0, conversationId: 'conv-dbg', workspacePaths: [workspace] }),
    encoding: 'utf8',
    env: { ...process.env, TAIS_HOOK_STATE_DIR: stateDir, TAIS_HOOK_DEBUG_LOG: logFile },
  });

  runHook();
  assert.equal(fs.existsSync(logFile), false, 'debug must stay off without policy or env');

  fs.writeFileSync(
    path.join(workspace, 'tais', 'setting.json'),
    JSON.stringify({ policy: { hookDebug: true } })
  );
  runHook();
  const logged = fs.readFileSync(logFile, 'utf8');
  assert.equal(logged.includes('"conversationId":"conv-dbg"'), true, logged);
});

test('update --agent codex clears installed plugin cache before refreshing fallback', () => {
  const home = tempDir();
  const env = emptyPathEnv(home);
  const cacheDir = path.join(home, '.codex', 'plugins', 'cache', 'tungnt-ai-skills-marketplace');
  const fallbackDir = path.join(home, '.codex', 'plugins', 'tungnt-ai-skills-marketplace');
  fs.mkdirSync(path.join(cacheDir, 'tungnt-ai-skills', '0.0.0', 'skills', 'old-skill'), { recursive: true });
  fs.writeFileSync(path.join(cacheDir, 'tungnt-ai-skills', '0.0.0', 'skills', 'old-skill', 'SKILL.md'), 'stale');
  fs.mkdirSync(fallbackDir, { recursive: true });
  fs.writeFileSync(path.join(fallbackDir, 'stale.txt'), 'stale');

  const out = capture();
  const code = runCli(['update', '--agent', 'codex'], env, out.io);
  assert.equal(code, 0, out.stderr());
  assert.equal(out.stdout().includes(`Cleaned cache/plugin folder: ${cacheDir}`), true);
  assert.equal(fs.existsSync(cacheDir), false);
  assert.equal(fs.existsSync(path.join(fallbackDir, 'stale.txt')), false);
  assert.equal(fs.existsSync(path.join(fallbackDir, 'setting.json')), true);
  assert.equal(fs.existsSync(path.join(fallbackDir, 'skills', 'using-tungnt-ai-skills', 'SKILL.md')), true);
});

test('update --agent copilot clears plugin cache before refreshing settings fallback', () => {
  const home = tempDir();
  const env = emptyPathEnv(home);
  const cacheDir = path.join(home, '.copilot', 'plugins', 'cache', 'tungnt-ai-skills-marketplace');
  fs.mkdirSync(path.join(cacheDir, 'tungnt-ai-skills', '0.0.0', 'skills', 'old-skill'), { recursive: true });
  fs.writeFileSync(path.join(cacheDir, 'tungnt-ai-skills', '0.0.0', 'skills', 'old-skill', 'SKILL.md'), 'stale');

  const out = capture();
  const code = runCli(['update', '--agent', 'copilot'], env, out.io);
  const settingsFile = path.join(home, '.copilot', 'settings.json');
  assert.equal(code, 0, out.stderr());
  assert.equal(out.stdout().includes(`Cleaned cache/plugin folder: ${cacheDir}`), true);
  assert.equal(fs.existsSync(cacheDir), false);
  assert.deepEqual(JSON.parse(fs.readFileSync(settingsFile, 'utf8')).extraKnownMarketplaces['tungnt-ai-skills-marketplace'], {
    source: {
      source: 'github',
      repo: 'tungnt1405/tungnt-ai-skills-marketplace',
    },
  });
});

test('update --agent claude clears local marketplace cache before copying fresh skills', () => {
  const home = tempDir();
  const env = emptyPathEnv(home);
  const cacheDir = path.join(home, '.claude', 'plugins', 'cache', 'tungnt-ai-skills-marketplace');
  fs.mkdirSync(cacheDir, { recursive: true });
  fs.writeFileSync(path.join(cacheDir, 'stale.txt'), 'stale');

  const out = capture();
  const code = runCli(['update', '--agent', 'claude'], env, out.io);
  assert.equal(code, 0, out.stderr());
  assert.equal(out.stdout().includes(`Skipped active folder: ${cacheDir}`), true);
  assert.equal(fs.existsSync(path.join(cacheDir, 'stale.txt')), false);
  assert.equal(fs.existsSync(path.join(cacheDir, 'setting.json')), true);
  assert.equal(fs.existsSync(path.join(cacheDir, 'skills', 'using-tungnt-ai-skills', 'SKILL.md')), true);
});

test('update --agent agy clears stale plugin folder before copying fresh skills', () => {
  const home = tempDir();
  const env = fakeEnv(home);
  const target = getTargetById('agy');
  const destination = target.defaultTarget(env);
  fs.mkdirSync(destination, { recursive: true });
  fs.writeFileSync(path.join(destination, 'stale.txt'), 'stale');

  const out = capture();
  const code = runCli(['update', '--agent', 'agy'], env, out.io);
  assert.equal(code, 0, out.stderr());
  assert.equal(out.stdout().includes(`Skipped active folder: ${destination}`), true);
  assert.equal(fs.existsSync(path.join(destination, 'stale.txt')), false);
  assert.equal(fs.existsSync(path.join(destination, 'setting.json')), true);
  assert.equal(fs.existsSync(path.join(destination, 'skills', 'using-tungnt-ai-skills', 'SKILL.md')), true);
});

test('update --agent antigravity clears stale plugin folder before copying fresh skills', () => {
  const home = tempDir();
  const env = fakeEnv(home);
  const target = getTargetById('antigravity');
  const destination = target.defaultTarget(env);
  fs.mkdirSync(destination, { recursive: true });
  fs.writeFileSync(path.join(destination, 'stale.txt'), 'stale');

  const out = capture();
  const code = runCli(['update', '--agent', 'antigravity'], env, out.io);
  assert.equal(code, 0, out.stderr());
  assert.equal(out.stdout().includes(`Skipped active folder: ${destination}`), true);
  assert.equal(fs.existsSync(path.join(destination, 'stale.txt')), false);
  assert.equal(fs.existsSync(path.join(destination, 'setting.json')), true);
  assert.equal(fs.existsSync(path.join(destination, 'skills', 'using-tungnt-ai-skills', 'SKILL.md')), true);
});

test('update --agent antigravity-ide clears stale plugin folder before copying fresh skills', () => {
  const home = tempDir();
  const env = fakeEnv(home);
  const target = getTargetById('antigravity-ide');
  const destination = target.defaultTarget(env);
  fs.mkdirSync(destination, { recursive: true });
  fs.writeFileSync(path.join(destination, 'stale.txt'), 'stale');

  const out = capture();
  const code = runCli(['update', '--agent', 'antigravity-ide'], env, out.io);
  assert.equal(code, 0, out.stderr());
  assert.equal(out.stdout().includes(`Skipped active folder: ${destination}`), true);
  assert.equal(fs.existsSync(path.join(destination, 'stale.txt')), false);
  assert.equal(fs.existsSync(path.join(destination, 'setting.json')), true);
  assert.equal(fs.existsSync(path.join(destination, 'skills', 'using-tungnt-ai-skills', 'SKILL.md')), true);
});

test('update --agent codex --dry-run prints cache cleanup path', () => {
  const home = tempDir();
  const out = capture();
  const code = runCli(['update', '--agent', 'codex', '--dry-run'], fakeEnv(home), out.io);
  assert.equal(code, 0, out.stderr());
  assert.equal(out.stdout().includes(`Clean cache/plugin folder: ${path.join(home, '.codex', 'plugins', 'cache', 'tungnt-ai-skills-marketplace')}`), true);
  assert.equal(fs.existsSync(path.join(home, '.codex')), false);
});

test('install creates setting.json from template on fresh install', () => {
  const home = tempDir();
  const env = fakeEnv(home);
  const target = getTargetById('agy');
  const destination = target.defaultTarget(env);

  const out = capture();
  const code = runCli(['install', '--agent', 'agy'], env, out.io);

  assert.equal(code, 0, out.stderr());
  assert.equal(fs.existsSync(path.join(destination, 'setting.json')), true);

  const templatePath = path.join(PACKAGE_ROOT, 'setting.template.json');
  const templateContent = fs.readFileSync(templatePath, 'utf8');
  assert.equal(fs.readFileSync(path.join(destination, 'setting.json'), 'utf8'), templateContent);
  assertNoTmpLeftover(destination);
});

test('install without --force on pre-existing destination preserves existing setting.json', () => {
  const home = tempDir();
  const env = fakeEnv(home);
  const target = getTargetById('agy');
  const destination = target.defaultTarget(env);

  fs.mkdirSync(destination, { recursive: true });
  const customSetting = '{"custom": "setting"}';
  fs.writeFileSync(path.join(destination, 'setting.json'), customSetting);

  const out = capture();
  const code = runCli(['install', '--agent', 'agy'], env, out.io);

  assert.equal(code, 1);
  assert.equal(out.stderr().includes('Destination already exists'), true);
  assert.equal(fs.readFileSync(path.join(destination, 'setting.json'), 'utf8'), customSetting);
  assertNoTmpLeftover(destination);
});

test('install --force update preserves existing setting.json', () => {
  const home = tempDir();
  const env = fakeEnv(home);
  const target = getTargetById('agy');
  const destination = target.defaultTarget(env);

  fs.mkdirSync(destination, { recursive: true });
  const customSetting = '{"custom": "setting"}';
  fs.writeFileSync(path.join(destination, 'setting.json'), customSetting);

  const out = capture();
  const code = runCli(['install', '--agent', 'agy', '--force'], env, out.io);

  assert.equal(code, 0, out.stderr());
  assert.equal(fs.readFileSync(path.join(destination, 'setting.json'), 'utf8'), customSetting);
  assertNoTmpLeftover(destination);
});

test('install --force creates setting.json if missing during update', () => {
  const home = tempDir();
  const env = fakeEnv(home);
  const target = getTargetById('agy');
  const destination = target.defaultTarget(env);

  fs.mkdirSync(destination, { recursive: true });
  fs.writeFileSync(path.join(destination, 'stale.txt'), 'stale');

  const out = capture();
  const code = runCli(['install', '--agent', 'agy', '--force'], env, out.io);

  assert.equal(code, 0, out.stderr());
  assert.equal(fs.existsSync(path.join(destination, 'stale.txt')), false);
  assert.equal(fs.existsSync(path.join(destination, 'setting.json')), true);

  const templatePath = path.join(PACKAGE_ROOT, 'setting.template.json');
  const templateContent = fs.readFileSync(templatePath, 'utf8');
  assert.equal(fs.readFileSync(path.join(destination, 'setting.json'), 'utf8'), templateContent);
  assertNoTmpLeftover(destination);
});

test('update merge-mode preserves existing setting.json', () => {
  const target = getTargetById('agy');
  const originalMode = target.installMode;
  target.installMode = 'merge';

  const home = tempDir();
  const env = fakeEnv(home);
  const destination = target.defaultTarget(env);

  try {
    fs.mkdirSync(destination, { recursive: true });
    const customSetting = '{"custom": "merge"}';
    fs.writeFileSync(path.join(destination, 'setting.json'), customSetting);

    const out = capture();
    const code = runCli(['update', '--agent', 'agy'], env, out.io);

    assert.equal(code, 0, out.stderr());
    assert.equal(fs.readFileSync(path.join(destination, 'setting.json'), 'utf8'), customSetting);
    assertNoTmpLeftover(destination);
  } finally {
    target.installMode = originalMode;
  }
});

test('pluginFileMode: posix+symlinkOnPosix=symlink, win32 or opt-out=copy', () => {
  const entry = { symlinkOnPosix: true };
  const originalDescriptor = Object.getOwnPropertyDescriptor(process, 'platform');
  try {
    Object.defineProperty(process, 'platform', { value: 'linux' });
    assert.equal(pluginFileMode(entry), 'symlink');
    Object.defineProperty(process, 'platform', { value: 'win32' });
    assert.equal(pluginFileMode(entry), 'copy');
  } finally {
    if (originalDescriptor) Object.defineProperty(process, 'platform', originalDescriptor);
  }
  assert.equal(pluginFileMode({}), 'copy');
});

test('registerPluginFilesForTarget: copies when symlinkOnPosix is false', () => {
  const home = tempDir();
  const env = fakeEnv(home);
  const packageRoot = PACKAGE_ROOT;
  const pkgDir = path.join(home, '.config', 'opencode', 'tungnt-ai-skills');
  fs.mkdirSync(path.dirname(path.join(pkgDir, '.opencode/plugins/tungnt-ai-skills.js')), { recursive: true });
  fs.copyFileSync(
    path.join(PACKAGE_ROOT, '.opencode/plugins/tungnt-ai-skills.js'),
    path.join(pkgDir, '.opencode/plugins/tungnt-ai-skills.js')
  );
  const target = {
    displayName: 'OpenCode',
    defaultTarget: (e) => path.join(e.HOME, '.config', 'opencode', 'tungnt-ai-skills'),
    registerPluginFiles: [
      {
        source: '.opencode/plugins/tungnt-ai-skills.js',
        destination: (e) => path.join(e.HOME, '.config', 'opencode', 'plugins', 'tungnt-ai-skills.js'),
        symlinkOnPosix: false,
      },
    ],
  };
  const results = registerPluginFilesForTarget(packageRoot, target, env);
  const dest = path.join(home, '.config', 'opencode', 'plugins', 'tungnt-ai-skills.js');
  assert.equal(results.length, 1);
  assert.equal(results[0].mode, 'copy');
  assert.equal(fs.lstatSync(dest).isSymbolicLink(), false);
  assert.ok(fs.readFileSync(dest, 'utf8').includes('TungntAiSkillsPlugin'));
});

test('registerPluginFilesForTarget: symlinks into the package and replaces planted entries', () => {
  const home = tempDir();
  const env = fakeEnv(home);
  const pluginsDir = path.join(home, '.config', 'opencode', 'plugins');
  fs.mkdirSync(pluginsDir, { recursive: true });
  // Plant a regular file AND a dangling symlink; both must be replaced safely.
  fs.writeFileSync(path.join(pluginsDir, 'tungnt-ai-skills.js'), 'planted');
  // Replace a pre-existing DANGLING symlink safely (rmSync must unlink, not follow).
  const danglingDest = path.join(pluginsDir, 'tungnt-ai-skills-dangling.js');
  fs.symlinkSync(path.join(home, 'does-not-exist-target'), danglingDest);
  const target = {
    displayName: 'OpenCode',
    defaultTarget: (e) => path.join(e.HOME, '.config', 'opencode', 'tungnt-ai-skills'),
    registerPluginFiles: [
      {
        source: '.opencode/plugins/tungnt-ai-skills.js',
        destination: (e) => path.join(e.HOME, '.config', 'opencode', 'plugins', 'tungnt-ai-skills.js'),
        symlinkOnPosix: true,
      },
    ],
  };
  // Prepare the fake installed package so the containment check can resolve realpaths.
  const pkgDir = target.defaultTarget(env);
  fs.mkdirSync(path.dirname(path.join(pkgDir, '.opencode/plugins/tungnt-ai-skills.js')), { recursive: true });
  fs.copyFileSync(
    path.join(PACKAGE_ROOT, '.opencode/plugins/tungnt-ai-skills.js'),
    path.join(pkgDir, '.opencode/plugins/tungnt-ai-skills.js')
  );
  const results = registerPluginFilesForTarget(PACKAGE_ROOT, target, env);
  const dest = path.join(pluginsDir, 'tungnt-ai-skills.js');
  assert.equal(results[0].mode, 'symlink');
  const realDest = fs.realpathSync(dest);
  assert.ok(
    realDest.startsWith(fs.realpathSync(pkgDir)),
    'link target must resolve inside the installed package'
  );
  const t2 = {
    displayName: 'OpenCode',
    defaultTarget: target.defaultTarget,
    registerPluginFiles: [
      { ...target.registerPluginFiles[0], destination: () => danglingDest },
    ],
  };
  const results2 = registerPluginFilesForTarget(PACKAGE_ROOT, t2, env);
  assert.equal(results2[0].mode, 'symlink');
  assert.ok(fs.existsSync(danglingDest), 'dangling symlink replaced by working registration');
});

test('dry-run install --agent opencode prints planned entries and register step', () => {
  const home = tempDir();
  const env = fakeEnv(home);
  const out = capture();
  const code = runCli(['install', '--agent', 'opencode', '--dry-run'], env, out.io);
  assert.equal(code, 0, out.stderr());
  assert.ok(out.stdout().includes('Planned entries: skills, setting.json'), out.stdout());
  assert.ok(out.stdout().includes('Register plugin (symlink)'), out.stdout());
  assert.ok(out.stdout().includes(path.join('.config', 'opencode', 'plugins', 'tungnt-ai-skills.js')), out.stdout());
});

test('opencode target: id registered, planned entries, required files exist in repo', () => {
  const target = getTargetById('opencode');
  assert.ok(target, 'opencode target must be declared');
  assert.equal(supportedTargetIds().includes('opencode'), true);

  const home = tempDir();
  const env = fakeEnv(home);
  assert.deepEqual(listPlannedEntries(PACKAGE_ROOT, target).sort(), ['setting.json', 'skills']);
  validateSource(PACKAGE_ROOT, target); // throws if .opencode/plugins/tungnt-ai-skills.js is missing
  assert.equal(target.defaultTarget(env), path.join(home, '.config', 'opencode', 'tungnt-ai-skills'));
});

test('install/update --agent opencode produces the registered layout end-to-end', () => {
  const home = tempDir();
  const env = fakeEnv(home);
  const out = capture();
  let code = runCli(['install', '--agent', 'opencode'], env, out.io);
  assert.equal(code, 0, out.stderr());

  const packageDir = path.join(home, '.config', 'opencode', 'tungnt-ai-skills');
  assert.ok(fs.existsSync(path.join(packageDir, 'skills', 'using-tungnt-ai-skills', 'SKILL.md')));
  assert.ok(fs.existsSync(path.join(packageDir, 'setting.json')));

  const registered = path.join(home, '.config', 'opencode', 'plugins', 'tungnt-ai-skills.js');
  if (process.platform === 'win32') {
    assert.equal(fs.lstatSync(registered).isSymbolicLink(), false);
  } else {
    assert.equal(fs.lstatSync(registered).isSymbolicLink(), true);
    assert.ok(fs.realpathSync(registered).startsWith(fs.realpathSync(packageDir)));
  }

  // Update refreshes idempotently behind the same path.
  code = runCli(['update', '--agent', 'opencode'], env, capture().io);
  assert.equal(code, 0);
  assert.ok(fs.existsSync(registered));
});

test('update --agent opencode preserves custom setting.json', () => {
  const home = tempDir();
  const env = fakeEnv(home);
  assert.equal(runCli(['install', '--agent', 'opencode'], env, capture().io), 0);
  const destination = path.join(home, '.config', 'opencode', 'tungnt-ai-skills');
  const custom = '{"custom": "opencode"}';
  fs.writeFileSync(path.join(destination, 'setting.json'), custom);
  const code = runCli(['update', '--agent', 'opencode'], env, capture().io);
  assert.equal(code, 0);
  assert.equal(fs.readFileSync(path.join(destination, 'setting.json'), 'utf8'), custom);
});

test('opencode nativeConfigWrite schema: config path, pinned entry, guarded cleanup paths', () => {
  const target = getTargetById('opencode');
  assert.ok(target.nativeConfigWrite, 'nativeConfigWrite must be declared');
  const home = tempDir();
  const env = fakeEnv(home);
  assert.equal(
    target.nativeConfigWrite.configFile(env),
    path.join(home, '.config', 'opencode', 'opencode.json')
  );
  assert.equal(
    target.nativeConfigWrite.pluginEntry,
    'tungnt-ai-skills@git+https://github.com/tungnt1405/tungnt-ai-skills-marketplace#main'
  );
  assert.deepEqual(
    target.nativeConfigWrite.cleanupPaths.map((p) => p.path(env)),
    [
      path.join(home, '.config', 'opencode', 'plugins', 'tungnt-ai-skills.js'),
      path.join(home, '.config', 'opencode', 'tungnt-ai-skills'),
    ]
  );
  assert.deepEqual(
    target.nativeConfigWrite.cleanupPaths.map((p) => p.expectedParent(env)),
    [
      path.join(home, '.config', 'opencode', 'plugins'),
      path.join(home, '.config', 'opencode'),
    ]
  );
  assert.equal(target.nativeConfigWrite.cleanupPaths[0].path(env), target.registerPluginFiles[0].destination(env));
  assert.equal(target.nativeConfigWrite.cleanupPaths[1].path(env), target.defaultTarget(env));
  const cleanEnv = { HOME: home, USERPROFILE: home };
  assert.equal(
    target.nativeConfigWrite.cachePackageDir(cleanEnv),
    path.join(home, '.cache', 'opencode', 'node_modules', 'tungnt-ai-skills')
  );
  assert.equal(
    target.nativeConfigWrite.cachePackageDir({ ...cleanEnv, XDG_CACHE_HOME: path.join(home, 'xdg-cache') }),
    path.join(home, 'xdg-cache', 'opencode', 'node_modules', 'tungnt-ai-skills')
  );
});

test('writeOpenCodeConfig creates, merges, and refuses invalid json', () => {
  const home = tempDir();
  const env = fakeEnv(home);
  const target = getTargetById('opencode');
  const configFile = target.nativeConfigWrite.configFile(env);

  // Creates missing file with minimal shape.
  writeOpenCodeConfig(target, env);
  let parsed = JSON.parse(fs.readFileSync(configFile, 'utf8'));
  assert.deepEqual(parsed.plugin, [target.nativeConfigWrite.pluginEntry]);

  // Preserves unrelated keys; no duplicate entry on re-run.
  fs.writeFileSync(
    configFile,
    JSON.stringify({ $schema: 'https://opencode.ai/config.json', model: 'x/y', plugin: ['other-plugin'] })
  );
  writeOpenCodeConfig(target, env);
  parsed = JSON.parse(fs.readFileSync(configFile, 'utf8'));
  assert.deepEqual(parsed.plugin, ['other-plugin', target.nativeConfigWrite.pluginEntry]);
  assert.equal(parsed.model, 'x/y');

  // Invalid existing JSON fails without clobbering.
  fs.writeFileSync(configFile, '{not json');
  assert.throws(() => writeOpenCodeConfig(target, env));
  assert.equal(fs.readFileSync(configFile, 'utf8'), '{not json');
});

test('install --agent opencode --native cleans copy artifacts then writes config', () => {
  const home = tempDir();
  const env = fakeEnv(home);
  // Pre-seed copy-mode artifacts.
  const pkgDir = path.join(home, '.config', 'opencode', 'tungnt-ai-skills');
  fs.mkdirSync(path.join(pkgDir, 'skills'), { recursive: true });
  fs.writeFileSync(path.join(pkgDir, 'marker.txt'), 'x');
  const pluginsDir = path.join(home, '.config', 'opencode', 'plugins');
  fs.mkdirSync(pluginsDir, { recursive: true });
  fs.symlinkSync(path.join(pkgDir, 'marker.txt'), path.join(pluginsDir, 'tungnt-ai-skills.js'));

  const out = capture();
  const code = runCli(['install', '--agent', 'opencode', '--native'], env, out.io);
  assert.equal(code, 0, out.stderr());
  assert.equal(fs.existsSync(pkgDir), false, 'package dir removed');
  assert.throws(() => fs.lstatSync(path.join(pluginsDir, 'tungnt-ai-skills.js')));
  const parsed = JSON.parse(fs.readFileSync(path.join(home, '.config', 'opencode', 'opencode.json'), 'utf8'));
  assert.deepEqual(parsed.plugin, [getTargetById('opencode').nativeConfigWrite.pluginEntry]);
});

test('opencode native config guards: bad roots, non-array plugin, dangling symlink cleanup', () => {
  const home = tempDir();
  const env = fakeEnv(home);
  const target = getTargetById('opencode');
  const configFile = target.nativeConfigWrite.configFile(env);
  fs.mkdirSync(path.dirname(configFile), { recursive: true });

  for (const root of ['[1,2]', '"hello"', '42', 'null']) {
    fs.writeFileSync(configFile, root);
    assert.throws(() => writeOpenCodeConfig(target, env), /root must be a JSON object/);
    assert.equal(fs.readFileSync(configFile, 'utf8'), root);
  }

  for (const content of [JSON.stringify({ plugin: 'string' }), JSON.stringify({ plugin: null })]) {
    fs.writeFileSync(configFile, content);
    assert.throws(() => writeOpenCodeConfig(target, env), /"plugin" is not an array/);
    assert.equal(fs.readFileSync(configFile, 'utf8'), content);
  }

  fs.rmSync(configFile);
  const pluginsDir = path.join(home, '.config', 'opencode', 'plugins');
  fs.mkdirSync(pluginsDir, { recursive: true });
  fs.symlinkSync(path.join(home, 'deleted-target.txt'), path.join(pluginsDir, 'tungnt-ai-skills.js'));
  const danglingLink = path.join(pluginsDir, 'tungnt-ai-skills.js');
  assert.equal(fs.existsSync(danglingLink), false);
  const code = runCli(['install', '--agent', 'opencode', '--native'], env, capture().io);
  assert.equal(code, 0);
  assert.throws(() => fs.lstatSync(danglingLink));
  const parsed = JSON.parse(fs.readFileSync(configFile, 'utf8'));
  assert.deepEqual(parsed.plugin, [target.nativeConfigWrite.pluginEntry]);
});

test('update --agent opencode --native refreshes entry once and clears only managed cache dir', () => {
  const home = tempDir();
  // cleanEnv instead of fakeEnv so ambient XDG_CACHE_HOME cannot redirect the cache root.
  const cleanEnv = { HOME: home, USERPROFILE: home };
  const installOut = capture();
  assert.equal(
    runCli(['install', '--agent', 'opencode', '--native'], cleanEnv, installOut.io),
    0,
    installOut.stderr(),
  );
  const nodeModules = path.join(home, '.cache', 'opencode', 'node_modules');
  fs.mkdirSync(path.join(nodeModules, 'other-plugin'), { recursive: true });
  fs.mkdirSync(path.join(nodeModules, 'tungnt-ai-skills'), { recursive: true });

  const out = capture();
  assert.equal(runCli(['update', '--agent', 'opencode', '--native'], cleanEnv, out.io), 0, out.stderr());
  assert.ok(
    out.stdout().includes(`Cleared plugin cache: ${path.join(nodeModules, 'tungnt-ai-skills')}`),
    out.stdout(),
  );
  assert.equal(fs.existsSync(path.join(nodeModules, 'tungnt-ai-skills')), false);
  assert.ok(fs.existsSync(path.join(nodeModules, 'other-plugin')), 'sibling cache untouched');

  const parsed = JSON.parse(fs.readFileSync(path.join(home, '.config', 'opencode', 'opencode.json'), 'utf8'));
  assert.equal(parsed.plugin.filter((p) => p.startsWith('tungnt-ai-skills')).length, 1);
  assert.ok(parsed.plugin.includes(getTargetById('opencode').nativeConfigWrite.pluginEntry));
});

test('copy-mode warns when config entry already present but never mutates opencode.json', () => {
  const home = tempDir();
  const env = fakeEnv(home);
  assert.equal(runCli(['install', '--agent', 'opencode', '--native'], env, capture().io), 0);
  const configFile = path.join(home, '.config', 'opencode', 'opencode.json');
  const before = fs.readFileSync(configFile, 'utf8');

  const out = capture();
  const code = runCli(['install', '--agent', 'opencode', '--force'], env, out.io);
  assert.equal(code, 0, out.stderr());
  assert.ok(out.stderr().includes('already registers this plugin'), out.stderr());
  assert.ok(
    fs.existsSync(path.join(home, '.config', 'opencode', 'tungnt-ai-skills')),
    'copy-mode artifacts created',
  );
  assert.equal(fs.readFileSync(configFile, 'utf8'), before, 'config untouched by copy-mode');
});

test('dry-run --native prints mode, config file, entry, cleanup paths without writing', () => {
  const home = tempDir();
  const env = fakeEnv(home);
  const configDir = path.join(home, '.config', 'opencode');
  const configFile = path.join(configDir, 'opencode.json');

  const out = capture();
  const code = runCli(['install', '--agent', 'opencode', '--native', '--dry-run'], env, out.io);
  assert.equal(code, 0, out.stderr());
  assert.ok(out.stdout().includes('Mode: native config write'), out.stdout());
  assert.ok(out.stdout().includes('Config file:'), out.stdout());
  assert.ok(out.stdout().includes('Plugin entry: tungnt-ai-skills@git+'), out.stdout());
  assert.ok(out.stdout().includes('Cleanup:'), out.stdout());
  assert.equal(fs.existsSync(configDir), false, 'dry-run must not create the opencode config dir');

  fs.mkdirSync(configDir, { recursive: true });
  const seeded = JSON.stringify({ plugin: [] });
  fs.writeFileSync(configFile, seeded);

  const updateOut = capture();
  const updateCode = runCli(['update', '--agent', 'opencode', '--native', '--dry-run'], env, updateOut.io);
  assert.equal(updateCode, 0, updateOut.stderr());
  assert.ok(updateOut.stdout().includes('Mode: native config write'), updateOut.stdout());
  assert.ok(updateOut.stdout().includes('Config file:'), updateOut.stdout());
  assert.ok(updateOut.stdout().includes('Plugin entry: tungnt-ai-skills@git+'), updateOut.stdout());
  assert.ok(updateOut.stdout().includes('Cleanup:'), updateOut.stdout());
  assert.ok(updateOut.stdout().includes('Cleanup (cache):'), updateOut.stdout());
  assert.equal(fs.readFileSync(configFile, 'utf8'), seeded, 'update dry-run must not write');
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
