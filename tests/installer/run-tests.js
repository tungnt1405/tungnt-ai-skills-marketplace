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
  writeCodexPluginEnable,
  writeCopilotSettings,
} from '../../installer/config-writers.js';
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

function countOccurrences(value, search) {
  return value.split(search).length - 1;
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
    path.join(home, '.copilot', 'settings.json'),
  );
  assert.equal(getTargetById('copilot').expectedParent(fakeEnv(home)), path.join(home, '.copilot'));
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

test('writeCodexPluginEnable creates plugin enable table', () => {
  const configFile = path.join(tempDir(), '.codex', 'config.toml');
  writeCodexPluginEnable(configFile, 'tungnt-ai-skills@openai-curated');
  assert.equal(
    fs.readFileSync(configFile, 'utf8'),
    '[plugins."tungnt-ai-skills@openai-curated"]\nenabled = true\n',
  );
});

test('writeCodexPluginEnable replaces existing table and preserves unrelated content', () => {
  const configFile = path.join(tempDir(), '.codex', 'config.toml');
  fs.mkdirSync(path.dirname(configFile), { recursive: true });
  fs.writeFileSync(configFile, [
    '[features]',
    'multi_agent = true',
    '',
    '[plugins."tungnt-ai-skills@openai-curated"]',
    'enabled = false',
    'stale = "remove"',
    '',
    '[other]',
    'value = 1',
    '',
  ].join('\n'));

  writeCodexPluginEnable(configFile, 'tungnt-ai-skills@openai-curated');

  const config = fs.readFileSync(configFile, 'utf8');
  assert.equal(config.includes('[features]\nmulti_agent = true'), true);
  assert.equal(config.includes('[other]\nvalue = 1'), true);
  assert.equal(config.includes('stale = "remove"'), false);
  assert.equal(countOccurrences(config, '[plugins."tungnt-ai-skills@openai-curated"]'), 1);
  assert.equal(config.includes('[plugins."tungnt-ai-skills@openai-curated"]\nenabled = true'), true);
});

test('writeCopilotSettings creates marketplace and enabled plugin settings', () => {
  const settingsFile = path.join(tempDir(), '.copilot', 'settings.json');
  writeCopilotSettings(
    settingsFile,
    'tungnt-ai-skills-marketplace',
    { source: 'github', repo: 'tungnt1405/tungnt-ai-skills-marketplace' },
    'tungnt-ai-skills@tungnt-ai-skills-marketplace',
  );

  const settings = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
  assert.deepEqual(settings, {
    extraKnownMarketplaces: {
      'tungnt-ai-skills-marketplace': {
        source: {
          source: 'github',
          repo: 'tungnt1405/tungnt-ai-skills-marketplace',
        },
      },
    },
    enabledPlugins: {
      'tungnt-ai-skills@tungnt-ai-skills-marketplace': true,
    },
  });
});

test('writeCopilotSettings prepends entries and preserves existing settings', () => {
  const settingsFile = path.join(tempDir(), '.copilot', 'settings.json');
  fs.mkdirSync(path.dirname(settingsFile), { recursive: true });
  fs.writeFileSync(settingsFile, `${JSON.stringify({
    theme: 'dark',
    extraKnownMarketplaces: {
      existing: {
        source: {
          source: 'github',
          repo: 'example/existing-marketplace',
        },
      },
    },
    enabledPlugins: {
      'existing-plugin@existing': true,
    },
  }, null, 2)}\n`);

  writeCopilotSettings(
    settingsFile,
    'tungnt-ai-skills-marketplace',
    { source: 'github', repo: 'tungnt1405/tungnt-ai-skills-marketplace' },
    'tungnt-ai-skills@tungnt-ai-skills-marketplace',
  );

  const settings = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
  assert.equal(settings.theme, 'dark');
  assert.deepEqual(Object.keys(settings.extraKnownMarketplaces), ['tungnt-ai-skills-marketplace', 'existing']);
  assert.deepEqual(Object.keys(settings.enabledPlugins), ['tungnt-ai-skills@tungnt-ai-skills-marketplace', 'existing-plugin@existing']);
});

test('writeCopilotSettings fails on invalid JSON without overwriting', () => {
  const settingsFile = path.join(tempDir(), '.copilot', 'settings.json');
  fs.mkdirSync(path.dirname(settingsFile), { recursive: true });
  fs.writeFileSync(settingsFile, '{ invalid json');

  assert.throws(
    () => writeCopilotSettings(
      settingsFile,
      'tungnt-ai-skills-marketplace',
      { source: 'github', repo: 'tungnt1405/tungnt-ai-skills-marketplace' },
      'tungnt-ai-skills@tungnt-ai-skills-marketplace',
    ),
    /Invalid JSON/,
  );
  assert.equal(fs.readFileSync(settingsFile, 'utf8'), '{ invalid json');
});

test('writeCopilotSettings fails on non-object settings sections without overwriting', () => {
  const settingsFile = path.join(tempDir(), '.copilot', 'settings.json');
  fs.mkdirSync(path.dirname(settingsFile), { recursive: true });
  const original = `${JSON.stringify({ extraKnownMarketplaces: [] }, null, 2)}\n`;
  fs.writeFileSync(settingsFile, original);

  assert.throws(
    () => writeCopilotSettings(
      settingsFile,
      'tungnt-ai-skills-marketplace',
      { source: 'github', repo: 'tungnt1405/tungnt-ai-skills-marketplace' },
      'tungnt-ai-skills@tungnt-ai-skills-marketplace',
    ),
    /extraKnownMarketplaces/,
  );
  assert.equal(fs.readFileSync(settingsFile, 'utf8'), original);
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
  assert.equal(out.stdout().includes(path.join(home, '.codex', '.tmp', 'plugins', 'plugins', 'tungnt-ai-skills-marketplace')), true);
  assert.equal(out.stdout().includes(path.join(home, '.codex', '.tmp', 'plugins', '.agents', 'plugins', 'marketplace.json')), true);
  assert.equal(out.stdout().includes('Marketplace plugin: tungnt-ai-skills'), true);
  assert.equal(out.stdout().includes(`Config file: ${path.join(home, '.codex', 'config.toml')}`), true);
});

test('install --agent copilot --dry-run selects Copilot settings config', () => {
  const home = tempDir();
  const out = capture();
  const code = runCli(['install', '--agent', 'copilot', '--dry-run'], fakeEnv(home), out.io);
  assert.equal(code, 0, out.stderr());
  assert.equal(out.stdout().includes('[copilot]'), true);
  assert.equal(out.stdout().includes('[codex]'), false);
  assert.equal(out.stdout().includes('Mode: config files'), true);
  assert.equal(out.stdout().includes(`Target: ${path.join(home, '.copilot', 'settings.json')}`), true);
  assert.equal(out.stdout().includes(`Config file: ${path.join(home, '.copilot', 'settings.json')}`), true);
  assert.equal(fs.existsSync(path.join(home, '.copilot')), false);
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

test('codex installs local marketplace package and entry', () => {
  const home = tempDir();
  const env = fakeEnv(home);
  const target = getTargetById('codex');
  const destination = target.defaultTarget(env);
  const marketplaceFile = path.join(home, '.codex', '.tmp', 'plugins', '.agents', 'plugins', 'marketplace.json');
  const configFile = path.join(home, '.codex', 'config.toml');
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
  assert.equal(
    fs.readFileSync(configFile, 'utf8'),
    '[plugins."tungnt-ai-skills@openai-curated"]\nenabled = true\n',
  );
});

test('codex install merges existing config without duplicate plugin table', () => {
  const home = tempDir();
  const env = fakeEnv(home);
  const configFile = path.join(home, '.codex', 'config.toml');
  fs.mkdirSync(path.dirname(configFile), { recursive: true });
  fs.writeFileSync(configFile, [
    '[features]',
    'multi_agent = true',
    '',
    '[plugins."tungnt-ai-skills@openai-curated"]',
    'enabled = false',
    'old = "value"',
    '',
    '[other]',
    'value = 1',
    '',
  ].join('\n'));

  const out = capture();
  const code = runCli(['install', '--agent', 'codex'], env, out.io);
  assert.equal(code, 0, out.stderr());

  const config = fs.readFileSync(configFile, 'utf8');
  assert.equal(config.includes('[features]\nmulti_agent = true'), true);
  assert.equal(config.includes('[other]\nvalue = 1'), true);
  assert.equal(config.includes('old = "value"'), false);
  assert.equal(countOccurrences(config, '[plugins."tungnt-ai-skills@openai-curated"]'), 1);
  assert.equal(config.includes('[plugins."tungnt-ai-skills@openai-curated"]\nenabled = true'), true);
});

test('copilot install creates settings with marketplace and enabled plugin', () => {
  const home = tempDir();
  const env = fakeEnv(home);
  const settingsFile = path.join(home, '.copilot', 'settings.json');
  const out = capture();
  const code = runCli(['install', '--agent', 'copilot'], env, out.io);
  assert.equal(code, 0, out.stderr());
  assert.deepEqual(JSON.parse(fs.readFileSync(settingsFile, 'utf8')), {
    extraKnownMarketplaces: {
      'tungnt-ai-skills-marketplace': {
        source: {
          source: 'github',
          repo: 'tungnt1405/tungnt-ai-skills-marketplace',
        },
      },
    },
    enabledPlugins: {
      'tungnt-ai-skills@tungnt-ai-skills-marketplace': true,
    },
  });
});

test('copilot install merges settings and puts managed entries first', () => {
  const home = tempDir();
  const env = fakeEnv(home);
  const settingsFile = path.join(home, '.copilot', 'settings.json');
  fs.mkdirSync(path.dirname(settingsFile), { recursive: true });
  fs.writeFileSync(settingsFile, `${JSON.stringify({
    extraKnownMarketplaces: {
      otherMarketplace: {
        source: {
          source: 'github',
          repo: 'example/other-marketplace',
        },
      },
    },
    enabledPlugins: {
      'other-plugin@otherMarketplace': true,
    },
    telemetry: false,
  }, null, 2)}\n`);

  const out = capture();
  const code = runCli(['install', '--agent', 'copilot'], env, out.io);
  assert.equal(code, 0, out.stderr());

  const settings = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
  assert.deepEqual(Object.keys(settings.extraKnownMarketplaces), ['tungnt-ai-skills-marketplace', 'otherMarketplace']);
  assert.deepEqual(Object.keys(settings.enabledPlugins), ['tungnt-ai-skills@tungnt-ai-skills-marketplace', 'other-plugin@otherMarketplace']);
  assert.equal(settings.telemetry, false);
});

test('copilot install fails on invalid settings JSON without overwriting', () => {
  const home = tempDir();
  const env = fakeEnv(home);
  const settingsFile = path.join(home, '.copilot', 'settings.json');
  fs.mkdirSync(path.dirname(settingsFile), { recursive: true });
  fs.writeFileSync(settingsFile, '{ invalid json');

  const out = capture();
  const code = runCli(['install', '--agent', 'copilot'], env, out.io);
  assert.equal(code, 1);
  assert.equal(out.stderr().includes('Invalid JSON'), true);
  assert.equal(fs.readFileSync(settingsFile, 'utf8'), '{ invalid json');
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
