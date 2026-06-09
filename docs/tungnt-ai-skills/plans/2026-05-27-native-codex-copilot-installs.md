# Native Codex and Copilot Installs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `subagent-driven-development` (recommended) or `executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Change Codex and Copilot installer targets to use their native plugin commands instead of local config or settings writes.

**Architecture:** Convert `codex` and `copilot` entries in `installer/target-map.js` to `nativeCommands` targets. Add a zero-dependency native command preflight in `installer/cli.js` so missing CLIs fail clearly before command execution. Remove the now-unused config writer module and the tests that covered Codex/Copilot manual config writes.

**Tech Stack:** Node.js ESM, built-in `node:fs`, `node:path`, `node:child_process`, `node:assert`, existing dependency-free installer test runner.

---

## File Structure

- Modify `installer/target-map.js`: make Codex and Copilot native command targets.
- Modify `installer/cli.js`: remove config writer integration and add native command preflight.
- Delete `installer/config-writers.js`: no target uses Codex/Copilot config writers after this change.
- Modify `tests/installer/run-tests.js`: replace config-writer tests with native command dry-run and missing-binary coverage.
- Do not modify `README.md`.

### Task 1: Native command preflight

**Files:**
- Modify: `installer/cli.js`
- Test: `tests/installer/run-tests.js`

- [ ] **Step 1: Write failing tests for native command availability**

Add helper functions near the existing `fakeEnv` helper in `tests/installer/run-tests.js`:

```js
function emptyPathEnv(home) {
  return { ...fakeEnv(home), PATH: '' };
}

function makeFakeExecutable(directory, name) {
  const filePath = path.join(directory, name);
  fs.writeFileSync(filePath, '#!/bin/sh\nexit 0\n');
  fs.chmodSync(filePath, 0o755);
  return filePath;
}
```

Add tests after the dry-run tests:

```js
test('install --agent copilot fails clearly when copilot command is missing', () => {
  const out = capture();
  const code = runCli(['install', '--agent', 'copilot'], emptyPathEnv(tempDir()), out.io);
  assert.equal(code, 1);
  assert.equal(out.stderr().includes('Native command not found: copilot'), true);
});

test('install --agent codex fails clearly when codex command is missing', () => {
  const out = capture();
  const code = runCli(['install', '--agent', 'codex'], emptyPathEnv(tempDir()), out.io);
  assert.equal(code, 1);
  assert.equal(out.stderr().includes('Native command not found: codex'), true);
});

test('native command preflight accepts commands from PATH', () => {
  const home = tempDir();
  const bin = path.join(home, 'bin');
  fs.mkdirSync(bin, { recursive: true });
  makeFakeExecutable(bin, 'codex');
  const out = capture();
  const code = runCli(['install', '--agent', 'codex'], { ...fakeEnv(home), PATH: bin }, out.io);
  assert.equal(code, 0, out.stderr());
  assert.equal(out.stdout().includes('Status: installed'), true);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
npm run test:installer
```

Expected: the new missing-command tests fail because the current implementation either writes config or reports a lower-level spawn error instead of `Native command not found: ...`.

- [ ] **Step 3: Add native command resolver and preflight**

In `installer/cli.js`, remove the `config-writers.js` import and add these helpers below `runNativeCommands`:

```js
function ensureNativeCommandsAvailable(target, env) {
  const commands = [...new Set(target.nativeCommands.map(([command]) => command))];
  for (const command of commands) {
    if (!findExecutable(command, env)) {
      throw new Error(`Native command not found: ${command}`);
    }
  }
}

function findExecutable(command, env) {
  if (command.includes(path.sep)) {
    return isExecutable(command);
  }

  const pathValue = env.PATH || '';
  const extensions = process.platform === 'win32' && !path.extname(command)
    ? (env.PATHEXT || '.EXE;.CMD;.BAT;.COM').split(';')
    : [''];

  for (const directory of pathValue.split(path.delimiter).filter(Boolean)) {
    for (const extension of extensions) {
      const candidate = path.join(directory, `${command}${extension}`);
      if (isExecutable(candidate)) {
        return candidate;
      }
    }
  }

  return undefined;
}

function isExecutable(filePath) {
  try {
    const stat = fs.statSync(filePath);
    return stat.isFile();
  } catch {
    return false;
  }
}
```

Update the native command branch inside `install()`:

```js
if (target.nativeCommands) {
  ensureNativeCommandsAvailable(target, env);
  runNativeCommands(target, env);
  io.out('Status: installed\n');
  if (target.postInstallNotes) {
    io.out(`Note: ${target.postInstallNotes}\n`);
  }
  continue;
}
```

- [ ] **Step 4: Run focused tests**

Run:

```bash
npm run test:installer
```

Expected: native preflight tests still fail until Task 2 changes Codex/Copilot targets to native commands; no syntax errors.

### Task 2: Convert Codex and Copilot target map entries

**Files:**
- Modify: `installer/target-map.js`
- Modify: `installer/cli.js`
- Delete: `installer/config-writers.js`
- Test: `tests/installer/run-tests.js`

- [ ] **Step 1: Update Codex target**

Replace the current `codex` target body in `installer/target-map.js` with:

```js
{
  id: 'codex',
  displayName: 'Codex',
  defaultTarget: (env = process.env) => joinHome(env, '.codex'),
  expectedParent: (env = process.env) => joinHome(env),
  requiredFiles: [],
  nativeCommands: [
    ['codex', 'plugin', 'marketplace', 'add', 'tungnt1405/tungnt-ai-skills-marketplace'],
  ],
  postInstallNotes: 'Codex marketplace registered through Codex CLI.',
},
```

- [ ] **Step 2: Update Copilot target**

Replace the current `copilot` target body in `installer/target-map.js` with:

```js
{
  id: 'copilot',
  displayName: 'GitHub Copilot CLI',
  defaultTarget: (env = process.env) => joinHome(env, '.copilot'),
  expectedParent: (env = process.env) => joinHome(env),
  requiredFiles: [],
  nativeCommands: [
    ['copilot', 'plugin', 'marketplace', 'add', 'tungnt1405/tungnt-ai-skills-marketplace'],
    ['copilot', 'plugin', 'install', 'tungnt-ai-skills@tungnt-ai-skills-marketplace'],
  ],
  postInstallNotes: 'Copilot marketplace registered and plugin installed through Copilot CLI.',
},
```

- [ ] **Step 3: Remove config writer code path**

In `installer/cli.js`:

- Delete the `listTargetConfigs` / `writeTargetConfigs` import.
- Delete the dry-run loop that prints `Config file: ...`.
- Delete the `installMode === 'config'` branch.
- Delete the `writeTargetConfigs(target, env);` call after marketplace writes.

Delete `installer/config-writers.js`.

- [ ] **Step 4: Run tests to reveal stale test expectations**

Run:

```bash
npm run test:installer
```

Expected: tests that still import config writers or expect Codex/Copilot config files fail.

### Task 3: Update installer tests for native targets

**Files:**
- Modify: `tests/installer/run-tests.js`

- [ ] **Step 1: Remove config writer imports and tests**

Remove this import:

```js
import {
  writeCodexPluginEnable,
  writeCopilotSettings,
} from '../../installer/config-writers.js';
```

Delete tests named:

- `writeCodexPluginEnable creates plugin enable table`
- `writeCodexPluginEnable replaces existing table and preserves unrelated content`
- `writeCopilotSettings creates marketplace and enabled plugin settings`
- `writeCopilotSettings prepends entries and preserves existing settings`
- `writeCopilotSettings fails on invalid JSON without overwriting`
- `writeCopilotSettings fails on non-object settings sections without overwriting`
- `codex installs local marketplace package and entry`
- `codex install merges existing config without duplicate plugin table`
- `copilot install creates settings with marketplace and enabled plugin`
- `copilot install merges settings and puts managed entries first`
- `copilot install fails on invalid settings JSON without overwriting`

Remove `countOccurrences()` if no remaining test uses it.

- [ ] **Step 2: Update target path expectations**

In `target map resolves targets under fake HOME`, change Copilot expectation to:

```js
assert.equal(getTargetById('copilot').defaultTarget(fakeEnv(home)), path.join(home, '.copilot'));
assert.equal(getTargetById('copilot').expectedParent(fakeEnv(home)), home);
assert.equal(getTargetById('codex').defaultTarget(fakeEnv(home)), path.join(home, '.codex'));
assert.equal(getTargetById('codex').expectedParent(fakeEnv(home)), home);
```

- [ ] **Step 3: Update Codex dry-run test**

Replace `install --agent codex --dry-run selects only Codex` assertions with:

```js
assert.equal(out.stdout().includes('[codex]'), true);
assert.equal(out.stdout().includes('[claude]'), false);
assert.equal(out.stdout().includes('Mode: native marketplace commands'), true);
assert.equal(out.stdout().includes('Command: codex plugin marketplace add tungnt1405/tungnt-ai-skills-marketplace'), true);
assert.equal(out.stdout().includes('Planned entries:'), false);
assert.equal(out.stdout().includes('Marketplace file:'), false);
assert.equal(out.stdout().includes('Config file:'), false);
```

- [ ] **Step 4: Update Copilot dry-run test**

Replace `install --agent copilot --dry-run selects Copilot settings config` assertions with:

```js
assert.equal(out.stdout().includes('[copilot]'), true);
assert.equal(out.stdout().includes('[codex]'), false);
assert.equal(out.stdout().includes('Mode: native marketplace commands'), true);
assert.equal(out.stdout().includes('Command: copilot plugin marketplace add tungnt1405/tungnt-ai-skills-marketplace'), true);
assert.equal(out.stdout().includes('Command: copilot plugin install tungnt-ai-skills@tungnt-ai-skills-marketplace'), true);
assert.equal(out.stdout().includes('Config file:'), false);
```

- [ ] **Step 5: Keep copy-target tests on Gemini**

Ensure the existing package destination tests continue using `gemini`:

```js
const target = getTargetById('gemini');
const code = runCli(['install', '--agent', 'gemini'], env, out.io);
const code = runCli(['install', '--agent', 'gemini', '--force'], env, out.io);
```

- [ ] **Step 6: Run tests**

Run:

```bash
npm run test:installer
```

Expected: all installer tests pass.

### Task 4: Final verification and commit

**Files:**
- Modify: `installer/cli.js`
- Modify: `installer/target-map.js`
- Modify: `tests/installer/run-tests.js`
- Delete: `installer/config-writers.js`
- No README changes.

- [ ] **Step 1: Run full verification**

Run:

```bash
npm run test:installer
npm exec --yes --package=. -- tungnt-ai-skills install --agent codex --dry-run
npm exec --yes --package=. -- tungnt-ai-skills install --agent copilot --dry-run
git diff --check
```

Expected:

- Installer tests pass.
- Codex dry-run prints `Command: codex plugin marketplace add tungnt1405/tungnt-ai-skills-marketplace`.
- Copilot dry-run prints both Copilot native commands.
- `git diff --check` reports no whitespace errors.

- [ ] **Step 2: Confirm README is unchanged**

Run:

```bash
git diff -- README.md
```

Expected: no output.

- [ ] **Step 3: Commit implementation**

Run:

```bash
git add installer/cli.js installer/target-map.js tests/installer/run-tests.js installer/config-writers.js
git commit -m "Use native Codex and Copilot plugin installs"
```
