# Copilot Bootstrap Hook Cwd Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `subagent-driven-development` (recommended) or `executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Copilot's `sessionStart` bootstrap hook work from any session workspace cwd without hardcoding a customer machine path.

**Architecture:** Keep `hooks/session-start` and `hooks/session-start.ps1` as the only bootstrap implementations. Change Copilot hook manifests to resolve a plugin root in this order: Copilot-provided root, test override root, then the standard Copilot installed-plugin path under the current user's home directory. Tests run the actual manifest command from a temporary workspace cwd with `TUNGNT_AI_SKILLS_PLUGIN_ROOT` set to the source repo, so they verify cwd independence without depending on a user's installed plugin cache.

**Tech Stack:** Node.js ESM tests, PowerShell hook commands on Windows, Bash hook commands on Unix, JSON hook manifests, Markdown docs.

---

## File Structure

- Modify `hooks/hooks.copilot.json`: Copilot named hook manifest; replace workspace-relative commands with plugin-root-aware commands.
- Modify `hooks/hooks.json`: Copilot default discovery manifest mirror; keep it in sync with `hooks/hooks.copilot.json`.
- Modify `tests/copilot-bootstrap/run-tests.js`: make the focused regression test set `TUNGNT_AI_SKILLS_PLUGIN_ROOT` so it verifies command behavior from any cwd without requiring an installed plugin folder.
- Modify `tests/installer/run-tests.js`: update manifest assertions so tests no longer lock in `cwd: "."` and `.\hooks\session-start.ps1`.
- Modify `README.md`: document the cwd failure symptom and the fixed plugin-root resolution behavior.
- Modify `docs/tungnt-ai-skills/investigations/copilot-bootstrap-hook-cwd-2026-06-11.md`: add a follow-up record with the final command strategy and verification results.

## Task 1: Confirm Current Failing Baseline

**Files:**
- Test: `tests/copilot-bootstrap/run-tests.js`
- Read: `hooks/hooks.copilot.json`

- [ ] **Step 1: Run the focused regression test**

Run:

```powershell
npm.cmd run test:copilot-bootstrap
```

Expected: FAIL with this error shape:

```text
Copilot bootstrap hook should run when cwd is a normal session workspace.
The term '.\hooks\session-start.ps1' is not recognized
```

- [ ] **Step 2: Confirm the manifest still contains the failing relative command**

Run:

```powershell
Get-Content -Raw hooks\hooks.copilot.json
```

Expected: output includes:

```json
"powershell": "& .\\hooks\\session-start.ps1",
"cwd": "."
```

- [ ] **Step 3: Commit the red baseline only if the failing test file is not already committed**

If `tests/copilot-bootstrap/run-tests.js` and `package.json` are already committed, skip this commit. Otherwise run:

```powershell
git add package.json tests/copilot-bootstrap/run-tests.js docs/tungnt-ai-skills/investigations/copilot-bootstrap-hook-cwd-2026-06-11.md docs/tungnt-ai-skills/specs/2026-06-11-copilot-bootstrap-hook-cwd-fix-design.md
git commit -m "test: reproduce copilot bootstrap cwd failure"
```

Expected: commit succeeds, or this step is skipped because the red test already exists in the working branch.

## Task 2: Make the Focused Test Independent from Installed Plugin Cache

**Files:**
- Modify: `tests/copilot-bootstrap/run-tests.js`

- [ ] **Step 1: Replace `runHookCommand` with an env-aware version**

In `tests/copilot-bootstrap/run-tests.js`, replace the existing `runHookCommand` function with:

```js
function runHookCommand(cwd, command, env = {}) {
  const processEnv = {
    ...process.env,
    ...env,
  };

  if (process.platform === 'win32') {
    return spawnSync(
      'powershell.exe',
      ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', command],
      { cwd, encoding: 'utf8', env: processEnv },
    );
  }

  return spawnSync(command, {
    cwd,
    encoding: 'utf8',
    shell: true,
    env: processEnv,
  });
}
```

- [ ] **Step 2: Add a test plugin root env object**

After the `command` constant, add:

```js
const hookEnv = {
  TUNGNT_AI_SKILLS_PLUGIN_ROOT: PACKAGE_ROOT,
};
```

- [ ] **Step 3: Pass the env object to both hook executions**

Replace:

```js
const pluginRootRun = runHookCommand(PACKAGE_ROOT, command);
```

with:

```js
const pluginRootRun = runHookCommand(PACKAGE_ROOT, command, hookEnv);
```

Replace:

```js
const workspaceRun = runHookCommand(workspaceDir, command);
```

with:

```js
const workspaceRun = runHookCommand(workspaceDir, command, hookEnv);
```

- [ ] **Step 4: Add assertions that the manifest no longer relies on workspace cwd**

After `assert.equal(typeof command, 'string');`, add:

```js
assert.equal(Object.hasOwn(entry, 'cwd'), false);
assert.match(command, /TUNGNT_AI_SKILLS_PLUGIN_ROOT/);
assert.doesNotMatch(command, /^\s*&\s*\.\\/);
assert.doesNotMatch(command, /bash\s+\.\/hooks\/session-start/);
```

- [ ] **Step 5: Run the focused test and verify it still fails before manifest changes**

Run:

```powershell
npm.cmd run test:copilot-bootstrap
```

Expected: FAIL because `hooks/hooks.copilot.json` still contains `cwd: "."`, `& .\hooks\session-start.ps1`, and no `TUNGNT_AI_SKILLS_PLUGIN_ROOT` reference.

## Task 3: Make Copilot Hook Manifests Plugin-Root-Aware

**Files:**
- Modify: `hooks/hooks.copilot.json`
- Modify: `hooks/hooks.json`

- [ ] **Step 1: Replace `hooks/hooks.copilot.json` content**

Set `hooks/hooks.copilot.json` to exactly:

```json
{
  "version": 1,
  "hooks": {
    "sessionStart": [
      {
        "type": "command",
        "bash": "root=\"${COPILOT_PLUGIN_ROOT:-${TUNGNT_AI_SKILLS_PLUGIN_ROOT:-$HOME/.copilot/installed-plugins/tungnt-ai-skills-marketplace/tungnt-ai-skills}}\"; bash \"$root/hooks/session-start\"",
        "powershell": "$root = $env:COPILOT_PLUGIN_ROOT; if (-not $root) { $root = $env:TUNGNT_AI_SKILLS_PLUGIN_ROOT }; if (-not $root) { $homeDir = if ($env:USERPROFILE) { $env:USERPROFILE } else { $env:HOME }; $root = Join-Path $homeDir '.copilot\\installed-plugins\\tungnt-ai-skills-marketplace\\tungnt-ai-skills' }; & (Join-Path $root 'hooks\\session-start.ps1')",
        "timeoutSec": 30
      }
    ]
  }
}
```

- [ ] **Step 2: Replace `hooks/hooks.json` content with the same manifest**

Set `hooks/hooks.json` to exactly the same JSON:

```json
{
  "version": 1,
  "hooks": {
    "sessionStart": [
      {
        "type": "command",
        "bash": "root=\"${COPILOT_PLUGIN_ROOT:-${TUNGNT_AI_SKILLS_PLUGIN_ROOT:-$HOME/.copilot/installed-plugins/tungnt-ai-skills-marketplace/tungnt-ai-skills}}\"; bash \"$root/hooks/session-start\"",
        "powershell": "$root = $env:COPILOT_PLUGIN_ROOT; if (-not $root) { $root = $env:TUNGNT_AI_SKILLS_PLUGIN_ROOT }; if (-not $root) { $homeDir = if ($env:USERPROFILE) { $env:USERPROFILE } else { $env:HOME }; $root = Join-Path $homeDir '.copilot\\installed-plugins\\tungnt-ai-skills-marketplace\\tungnt-ai-skills' }; & (Join-Path $root 'hooks\\session-start.ps1')",
        "timeoutSec": 30
      }
    ]
  }
}
```

- [ ] **Step 3: Run the focused regression test**

Run:

```powershell
npm.cmd run test:copilot-bootstrap
```

Expected: PASS and output includes:

```text
Copilot bootstrap hook cwd test passed
```

- [ ] **Step 4: Commit manifest and focused test changes**

Run:

```powershell
git add hooks/hooks.copilot.json hooks/hooks.json tests/copilot-bootstrap/run-tests.js
git commit -m "fix: resolve copilot bootstrap hook from plugin root"
```

Expected: commit succeeds.

## Task 4: Update Installer Manifest Assertions

**Files:**
- Modify: `tests/installer/run-tests.js`

- [ ] **Step 1: Update `copilot hook manifest uses documented sessionStart command shape`**

Replace the assertion block in that test with:

```js
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
```

- [ ] **Step 2: Update `copilot default hook discovery file is native sessionStart shape`**

Replace the assertion block in that test with:

```js
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
```

- [ ] **Step 3: Run installer tests**

Run:

```powershell
npm.cmd run test:installer
```

Expected: PASS with:

```text
59 tests passed
```

- [ ] **Step 4: Commit installer test updates**

Run:

```powershell
git add tests/installer/run-tests.js
git commit -m "test: update copilot hook manifest assertions"
```

Expected: commit succeeds.

## Task 5: Update README Troubleshooting

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Replace the Copilot hook description paragraph**

In the GitHub Copilot CLI section, replace the paragraph that begins:

```markdown
Copilot discovers `hooks/hooks.json` by default in the installed plugin.
```

with:

```markdown
Copilot discovers `hooks/hooks.json` by default in the installed plugin. The source `hooks/hooks.json` therefore uses Copilot's `sessionStart` hook shape to run `hooks/session-start`, which injects `skills/using-tungnt-ai-skills/SKILL.md` as session context. `hooks/hooks.copilot.json` is kept as the named Copilot manifest mirror.

The Copilot hook command must resolve the installed plugin root, not the user's active workspace. The manifests first use a Copilot-provided `COPILOT_PLUGIN_ROOT` when available, then a test override `TUNGNT_AI_SKILLS_PLUGIN_ROOT`, then the standard installed plugin path under the current user's home directory. Do not hardcode a machine-specific path such as `C:\Users\<name>`.
```

- [ ] **Step 2: Add troubleshooting text before the acceptance prompt**

Before:

```markdown
After installing or updating, restart Copilot and run this clean-session acceptance prompt:
```

insert:

````markdown
If Copilot logs show this error, the plugin was installed but the bootstrap hook did not reach the script:

```text
Hook from "tungnt-ai-skills@tungnt-ai-skills-marketplace" execution failed
.\hooks\session-start.ps1 is not recognized
```

Update the plugin, restart Copilot, and confirm the hook command no longer resolves from the workspace cwd.
````

- [ ] **Step 3: Check README does not contain a machine-specific Copilot path**

Run:

```powershell
rg -n "C:\\Users\\[^\\]+\\.copilot|/Users/[^/]+/\\.copilot|/home/[^/]+/\\.copilot" README.md docs\tungnt-ai-skills\specs docs\tungnt-ai-skills\investigations docs\tungnt-ai-skills\plans
```

Expected: no matches.

- [ ] **Step 4: Commit README update**

Run:

```powershell
git add README.md
git commit -m "docs: explain copilot hook root resolution"
```

Expected: commit succeeds.

## Task 6: Record Final Investigation Follow-Up

**Files:**
- Modify: `docs/tungnt-ai-skills/investigations/copilot-bootstrap-hook-cwd-2026-06-11.md`

- [ ] **Step 1: Append a follow-up section**

Append this section to the end of the investigation file:

````markdown
## Follow-up: 2026-06-11

### New Evidence

- `hooks/hooks.copilot.json` and `hooks/hooks.json` now resolve the bootstrap script through `COPILOT_PLUGIN_ROOT`, `TUNGNT_AI_SKILLS_PLUGIN_ROOT`, or the current user's standard Copilot installed-plugin directory.
- `npm.cmd run test:copilot-bootstrap` passes and confirms the hook emits `additionalContext` from both plugin-root cwd and temporary workspace cwd.
- `npm.cmd run test:installer` passes with 59 installer tests.

### Additional Findings

The fix does not require changing `hooks/session-start.ps1` because that script already derives its package root from `$PSScriptRoot` after it is invoked by an absolute/plugin-root-aware path.

### Updated Hypotheses

The original plugin-root environment variable hypothesis remains compatible with the fix. If Copilot provides `COPILOT_PLUGIN_ROOT`, the hook uses it. If it does not, the hook falls back to a current-user home-relative installed-plugin path without hardcoding a customer machine path.

### Backlog Changes

- Closed: local hook command cwd reproduction.
- Closed: manifest command root-resolution fix.
- Open: capture a real logged-in Copilot acceptance transcript if the current shell still lacks non-interactive authentication.

### Updated Conclusion

**Confidence:** High

The root cause was a workspace-relative hook command. The fixed manifests invoke the bootstrap script through a plugin-root-aware path, and local tests prove the command no longer depends on the caller's cwd.
````

- [ ] **Step 2: If non-interactive Copilot is authenticated, run the acceptance prompt**

Run:

```powershell
$testDir = Join-Path $env:TEMP "copilot-bootstrap-acceptance"
New-Item -ItemType Directory -Force -Path $testDir | Out-Null
copilot.cmd -C $testDir -p "Let's make a react todo list" --allow-all-tools --output-format text --stream off --no-color
```

Expected when authenticated: Copilot mentions or uses `using-tungnt-ai-skills` and selects `brainstorming` before writing code.

Expected if this shell is still not authenticated:

```text
Error: No authentication information found.
```

- [ ] **Step 3: If authentication is missing, append the auth blocker note**

If Step 2 returns the auth error, append this note under the follow-up section:

````markdown

### Runtime Acceptance Blocker

The non-interactive acceptance command could not be completed in this shell because Copilot reported:

```text
Error: No authentication information found.
```

Run the same acceptance command from an authenticated Copilot shell or capture an interactive session transcript with the prompt `Let's make a react todo list`.
````

- [ ] **Step 4: Commit investigation follow-up**

Run:

```powershell
git add docs/tungnt-ai-skills/investigations/copilot-bootstrap-hook-cwd-2026-06-11.md
git commit -m "docs: record copilot bootstrap cwd fix evidence"
```

Expected: commit succeeds.

## Task 7: Final Verification

**Files:**
- Verify: `hooks/hooks.copilot.json`
- Verify: `hooks/hooks.json`
- Verify: `tests/copilot-bootstrap/run-tests.js`
- Verify: `tests/installer/run-tests.js`
- Verify: `README.md`
- Verify: `docs/tungnt-ai-skills/investigations/copilot-bootstrap-hook-cwd-2026-06-11.md`

- [ ] **Step 1: Run focused Copilot bootstrap test**

Run:

```powershell
npm.cmd run test:copilot-bootstrap
```

Expected: PASS with:

```text
Copilot bootstrap hook cwd test passed
```

- [ ] **Step 2: Run installer regression tests**

Run:

```powershell
npm.cmd run test:installer
```

Expected: PASS with:

```text
59 tests passed
```

- [ ] **Step 3: Check whitespace**

Run:

```powershell
git diff --check
```

Expected: no output and exit code 0.

- [ ] **Step 4: Check for machine-specific path leaks**

Run:

```powershell
rg -n "C:\\Users\\[^\\]+\\.copilot|/Users/[^/]+/\\.copilot|/home/[^/]+/\\.copilot" hooks tests README.md docs\tungnt-ai-skills
```

Expected: no output.

- [ ] **Step 5: Review final diff**

Run:

```powershell
git diff --stat
git diff -- hooks\hooks.copilot.json hooks\hooks.json tests\copilot-bootstrap\run-tests.js tests\installer\run-tests.js README.md docs\tungnt-ai-skills\investigations\copilot-bootstrap-hook-cwd-2026-06-11.md
```

Expected:

- `hooks/hooks.copilot.json` and `hooks/hooks.json` no longer contain `cwd: "."`.
- `hooks/hooks.copilot.json` and `hooks/hooks.json` no longer contain `& .\hooks\session-start.ps1`.
- `tests/copilot-bootstrap/run-tests.js` sets `TUNGNT_AI_SKILLS_PLUGIN_ROOT`.
- `tests/installer/run-tests.js` asserts root-aware commands instead of exact relative commands.
- `README.md` documents the troubleshooting error and warns against machine-specific paths.
- Investigation follow-up records verification results.

- [ ] **Step 6: Commit final verification cleanup if needed**

If Task 7 required any cleanup edits, run:

```powershell
git add hooks tests README.md docs\tungnt-ai-skills
git commit -m "chore: finalize copilot bootstrap cwd fix"
```

Expected: commit succeeds, or this step is skipped because there were no cleanup edits.

## Self-Review

### Spec Coverage

- Cwd-independent hook execution: Tasks 2, 3, and 7.
- No hardcoded customer path: Tasks 3, 5, and 7.
- Single bootstrap implementation: Task 3 keeps commands invoking `hooks/session-start` and `hooks/session-start.ps1`.
- Regression coverage: Tasks 2, 4, and 7.
- Docs and investigation update: Tasks 5 and 6.
- Real Copilot acceptance or auth blocker record: Task 6.

### Placeholder Scan

This plan contains no prohibited placeholder markers or open-ended "add tests" instructions. Each code-editing task includes exact snippets or complete file content.

### Type and Name Consistency

The test override environment variable is consistently named `TUNGNT_AI_SKILLS_PLUGIN_ROOT` in hook manifests, focused tests, installer assertions, and docs. The Copilot-provided root variable is consistently named `COPILOT_PLUGIN_ROOT` as an optional first-choice input.
