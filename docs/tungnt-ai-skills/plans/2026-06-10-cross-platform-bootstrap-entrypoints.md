# Cross-Platform Bootstrap Entrypoints Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `subagent-driven-development` (recommended) or `executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep `hooks/session-start` as the only bootstrap implementation while installing an OS-appropriate hook entrypoint for Claude/Cursor plugin sessions.

**Architecture:** `hooks/session-start` remains the single source of truth that reads `skills/using-tungnt-ai-skills/SKILL.md` and emits hook JSON. Windows installs use a `.cmd` launcher because Claude hooks run through CMD there. Unix installs use `bash "${CLAUDE_PLUGIN_ROOT}/hooks/session-start"` directly so Linux/macOS do not depend on `.cmd` execution semantics.

**Tech Stack:** Node.js installer modules, JSON hook manifests, Bash session hook, Windows CMD wrapper, dependency-free Node tests.

---

## File Structure

- Create: `hooks/hooks.windows.json`
  - Windows Claude hook template. Calls `session-start.cmd`.
- Create: `hooks/hooks.unix.json`
  - Linux/macOS Claude hook template. Calls `bash "${CLAUDE_PLUGIN_ROOT}/hooks/session-start"`.
- Modify: `hooks/hooks.json`
  - Keep as the source default for compatibility, but document that installer-managed installs overwrite it from the OS template.
- Modify: `installer/target-map.js`
  - Add the OS-specific hook manifest file to the Claude fallback target.
- Modify: `installer/package-copy.js`
  - After copying a package, overwrite `hooks/hooks.json` in the destination when `target.hookManifestFile` is declared.
- Modify: `tests/installer/run-tests.js`
  - Add tests that Claude fallback installs write the platform-specific command into installed `hooks/hooks.json`.
- Modify: `docs/windows/polyglot-hooks.md`
  - Clarify that `.cmd` is Windows-only and `hooks/session-start` is the shared bootstrap logic.
- Modify: `README.md`
  - Document the one-bootstrap/two-entrypoint model.

## Important Constraint

This plan fixes installer-managed file-copy installs. Native marketplace installs that fetch the repository directly may still use the static `hooks/hooks.json` from the source unless the target marketplace supports OS-specific hook manifests. Do not claim native marketplace installs are fully OS-selected unless verified in a real Claude session on each OS.

### Task 1: Add OS-Specific Hook Manifest Templates

**Files:**
- Create: `hooks/hooks.windows.json`
- Create: `hooks/hooks.unix.json`
- Modify: `hooks/hooks.json`

- [ ] **Step 1: Write the Windows hook manifest**

Create `hooks/hooks.windows.json`:

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup|clear|compact",
        "hooks": [
          {
            "type": "command",
            "command": "\"${CLAUDE_PLUGIN_ROOT}/hooks/session-start.cmd\"",
            "async": false
          }
        ]
      }
    ]
  }
}
```

- [ ] **Step 2: Write the Unix hook manifest**

Create `hooks/hooks.unix.json`:

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup|clear|compact",
        "hooks": [
          {
            "type": "command",
            "command": "bash \"${CLAUDE_PLUGIN_ROOT}/hooks/session-start\"",
            "async": false
          }
        ]
      }
    ]
  }
}
```

- [ ] **Step 3: Keep source `hooks/hooks.json` as the Windows-compatible fallback**

Confirm `hooks/hooks.json` contains the same JSON as `hooks/hooks.windows.json`. This preserves current behavior for direct source use and avoids changing native marketplace behavior without runtime verification.

Run:

```powershell
Get-Content -Raw hooks\hooks.json
```

Expected: command is `"${CLAUDE_PLUGIN_ROOT}/hooks/session-start.cmd"`.

- [ ] **Step 4: Commit**

```bash
git add hooks/hooks.json hooks/hooks.windows.json hooks/hooks.unix.json
git commit -m "chore: add platform-specific bootstrap hook manifests"
```

### Task 2: Teach The Installer To Select The Claude Hook Manifest

**Files:**
- Modify: `installer/target-map.js`
- Modify: `installer/package-copy.js`

- [ ] **Step 1: Add failing installer test for platform hook manifest selection**

In `tests/installer/run-tests.js`, add this test after `install --agent claude imports local marketplace by default`:

```js
test('install --agent claude writes platform-specific hooks manifest', () => {
  const home = tempDir();
  const out = capture();
  const code = runCli(['install', '--agent', 'claude'], emptyPathEnv(home), out.io);
  const hooksFile = path.join(home, '.claude', 'plugins', 'cache', 'tungnt-ai-skills-marketplace', 'hooks', 'hooks.json');
  const hooks = JSON.parse(fs.readFileSync(hooksFile, 'utf8'));
  const command = hooks.hooks.SessionStart[0].hooks[0].command;

  assert.equal(code, 0, out.stderr());
  if (process.platform === 'win32') {
    assert.equal(command, '"${CLAUDE_PLUGIN_ROOT}/hooks/session-start.cmd"');
  } else {
    assert.equal(command, 'bash "${CLAUDE_PLUGIN_ROOT}/hooks/session-start"');
  }
});
```

- [ ] **Step 2: Run the failing test**

Run:

```powershell
npm.cmd run test:installer
```

Expected: FAIL because the installer still copies the static `hooks/hooks.json`.

- [ ] **Step 3: Add platform hook metadata to Claude fallback target**

In `installer/target-map.js`, add constants near `CLAUDE_LOCAL_MARKETPLACE_ENTRIES`:

```js
const CLAUDE_HOOK_MANIFEST_FILE = process.platform === 'win32'
  ? 'hooks/hooks.windows.json'
  : 'hooks/hooks.unix.json';
```

Inside `TARGETS[0].fallbackInstall`, add:

```js
hookManifestFile: CLAUDE_HOOK_MANIFEST_FILE,
```

- [ ] **Step 4: Overwrite installed `hooks/hooks.json` from the selected template**

In `installer/package-copy.js`, update `copyPackage`:

```js
export function copyPackage(packageRoot, destination, target = {}) {
  fs.mkdirSync(destination, { recursive: true });
  for (const entry of plannedEntries(packageRoot, target)) {
    copyEntry(path.join(packageRoot, entry), path.join(destination, entry), entry);
  }
  copySelectedHookManifest(packageRoot, destination, target);
}
```

Add this helper below `copyExtraPackages`:

```js
function copySelectedHookManifest(packageRoot, destination, target = {}) {
  if (!target.hookManifestFile) {
    return;
  }
  const source = path.join(packageRoot, target.hookManifestFile);
  const destinationFile = path.join(destination, 'hooks', 'hooks.json');
  fs.mkdirSync(path.dirname(destinationFile), { recursive: true });
  fs.copyFileSync(source, destinationFile);
}
```

- [ ] **Step 5: Run installer tests**

Run:

```powershell
npm.cmd run test:installer
```

Expected: all installer tests pass.

- [ ] **Step 6: Commit**

```bash
git add installer/target-map.js installer/package-copy.js tests/installer/run-tests.js
git commit -m "fix: select bootstrap hook manifest by platform"
```

### Task 3: Tighten Source Validation For Claude Hook Files

**Files:**
- Modify: `installer/target-map.js`
- Modify: `tests/installer/run-tests.js`

- [ ] **Step 1: Add required hook files to Claude fallback validation**

In `installer/target-map.js`, update `fallbackInstall.requiredFiles` for Claude:

```js
requiredFiles: [
  ...REQUIRED_SKILL_FILES,
  '.claude-plugin/marketplace.json',
  '.claude-plugin/plugin.json',
  'hooks/session-start',
  'hooks/session-start.cmd',
  'hooks/hooks.windows.json',
  'hooks/hooks.unix.json',
],
```

- [ ] **Step 2: Add a test for planned Claude entries**

In `tests/installer/run-tests.js`, add this after `install --agent claude imports local marketplace by default`:

```js
test('claude fallback source includes bootstrap hook entrypoints', () => {
  const target = getTargetById('claude').fallbackInstall;
  validateSource(PACKAGE_ROOT, target);
  assert.equal(fs.existsSync(path.join(PACKAGE_ROOT, 'hooks', 'session-start')), true);
  assert.equal(fs.existsSync(path.join(PACKAGE_ROOT, 'hooks', 'session-start.cmd')), true);
  assert.equal(fs.existsSync(path.join(PACKAGE_ROOT, 'hooks', 'hooks.windows.json')), true);
  assert.equal(fs.existsSync(path.join(PACKAGE_ROOT, 'hooks', 'hooks.unix.json')), true);
});
```

- [ ] **Step 3: Run installer tests**

Run:

```powershell
npm.cmd run test:installer
```

Expected: all installer tests pass.

- [ ] **Step 4: Commit**

```bash
git add installer/target-map.js tests/installer/run-tests.js
git commit -m "test: require bootstrap hook entrypoints for claude"
```

### Task 4: Update Documentation To Explain The Single Bootstrap Model

**Files:**
- Modify: `README.md`
- Modify: `docs/windows/polyglot-hooks.md`

- [ ] **Step 1: Update README Claude section**

In `README.md`, under the Claude Code manual setup section, replace the package list with:

```text
.claude-plugin/marketplace.json
.claude-plugin/plugin.json
skills/
hooks/
```

Add this paragraph after the list:

```markdown
Bootstrap logic lives in `hooks/session-start`. Installer-managed Claude installs select the hook manifest by OS:

- Windows installs write `hooks/hooks.json` to call `hooks/session-start.cmd`.
- Linux/macOS installs write `hooks/hooks.json` to call `bash "${CLAUDE_PLUGIN_ROOT}/hooks/session-start"`.

Both paths load the same `skills/using-tungnt-ai-skills/SKILL.md` bootstrap content.
```

- [ ] **Step 2: Replace stale reusable wrapper section in polyglot docs**

In `docs/windows/polyglot-hooks.md`, replace the `Reusable Wrapper Pattern` section with:

```markdown
## Repository Pattern

This repository keeps one bootstrap implementation and separate launchers:

- `hooks/session-start` contains the actual bootstrap logic.
- `hooks/session-start.cmd` is the Windows launcher.
- `hooks/hooks.windows.json` calls the Windows launcher.
- `hooks/hooks.unix.json` calls `bash "${CLAUDE_PLUGIN_ROOT}/hooks/session-start"` directly.

Installer-managed Claude installs copy the selected template to `hooks/hooks.json` in the installed plugin folder.
```

- [ ] **Step 3: Run text search for stale references**

Run:

```powershell
rg -n "run-hook\.cmd|CODEX\.md|contextFileName|session-start\.sh" README.md docs hooks .codex-plugin tests installer --glob "!docs/tungnt-ai-skills/plans/2026-06-10-cross-platform-bootstrap-entrypoints.md"
```

Expected: no matches.

- [ ] **Step 4: Commit**

```bash
git add README.md docs/windows/polyglot-hooks.md
git commit -m "docs: explain platform-specific bootstrap entrypoints"
```

### Task 5: Final Verification

**Files:**
- Verify: all modified files

- [ ] **Step 1: Run installer tests**

Run:

```powershell
npm.cmd run test:installer
```

Expected: all tests pass.

- [ ] **Step 2: Run skill content tests**

Run:

```powershell
npm.cmd run test:skills
```

Expected:

```text
skill structure validation passed
skill content tests passed
```

- [ ] **Step 3: Run whitespace check**

Run:

```powershell
git diff --check
```

Expected: no output.

- [ ] **Step 4: Inspect final references**

Run:

```powershell
rg -n "run-hook\.cmd|CODEX\.md|contextFileName|session-start\.sh" README.md docs hooks .codex-plugin tests installer --glob "!docs/tungnt-ai-skills/plans/2026-06-10-cross-platform-bootstrap-entrypoints.md"
```

Expected: no output.

- [ ] **Step 5: Review diff**

Run:

```powershell
git diff --stat
git diff -- hooks installer tests README.md docs/windows/polyglot-hooks.md
```

Expected:

- Hook logic remains in `hooks/session-start`.
- Windows command appears only in `hooks/hooks.windows.json`, `hooks/hooks.json`, and docs explaining Windows behavior.
- Unix command appears in `hooks/hooks.unix.json`.
- No `run-hook.cmd`, `CODEX.md`, or `contextFileName` references remain.

- [ ] **Step 6: Commit final verification updates if any**

If verification required small corrections:

```bash
git add <corrected-files>
git commit -m "fix: align bootstrap hook verification"
```

If no corrections were needed, do not create an empty commit.

## Self-Review

**Spec coverage:** The plan covers the agreed design: one bootstrap implementation in `hooks/session-start`, Windows launcher via `.cmd`, Unix launcher via `bash`, installer selection, tests, and documentation.

**Placeholder scan:** No task contains `TBD`, `TODO`, "similar to", or unspecified implementation work. Code snippets and commands are explicit.

**Type consistency:** The same names are used throughout: `hookManifestFile`, `hooks/hooks.windows.json`, `hooks/hooks.unix.json`, `hooks/session-start`, and `hooks/session-start.cmd`.
