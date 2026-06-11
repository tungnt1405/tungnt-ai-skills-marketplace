# Copilot Bootstrap Hook Cwd Fix Design

## Problem

Copilot has `tungnt-ai-skills` installed and enabled, and Copilot does execute the plugin's `sessionStart` hook. The current failure is later in the chain: the hook command is resolved from the active session workspace instead of the installed plugin root.

Observed evidence:

- `copilot plugin list` reports `tungnt-ai-skills@tungnt-ai-skills-marketplace (v1.4.6)`.
- `%USERPROFILE%\.copilot\settings.json` enables `tungnt-ai-skills@tungnt-ai-skills-marketplace`.
- `%USERPROFILE%\.copilot\logs\process-1781143214623-12592.log` records `Hook from "tungnt-ai-skills@tungnt-ai-skills-marketplace" execution failed`.
- The same log shows PowerShell cannot resolve `.\hooks\session-start.ps1`.
- Manual execution of `hooks/session-start.ps1` from the plugin/repo root emits valid JSON containing `additionalContext` and `using-tungnt-ai-skills`.
- `npm.cmd run test:copilot-bootstrap` now reproduces the failure by running the configured hook from a temporary workspace cwd.

The prior Copilot bootstrap work made the manifest Copilot-native, but it still left `bash ./hooks/session-start`, `& .\hooks\session-start.ps1`, and `cwd: "."`. That works only when `.` is the plugin root. In real Copilot sessions, `.` is the user's workspace.

## Goals

- Make Copilot's `sessionStart` hook locate `hooks/session-start` from the installed plugin root, independent of the user's current workspace.
- Preserve the single bootstrap implementation in `hooks/session-start` and `hooks/session-start.ps1`.
- Keep hook stdout valid JSON with top-level `additionalContext`.
- Add regression coverage that fails when hook commands only work from the plugin root.
- Update docs so the Copilot troubleshooting path points at cwd/root resolution, not just install state.
- Verify with both local command tests and a real logged-in Copilot acceptance transcript.

## Non-goals

- Do not change `using-tungnt-ai-skills` routing content.
- Do not duplicate bootstrap logic into a Copilot-only copy.
- Do not change Claude, Codex, Cursor, Gemini, or Antigravity hook behavior except where shared tests need to remain compatible.
- Do not add runtime dependencies.
- Do not require users to manually invoke a skill at the start of each Copilot session.

## Recommended Approach

Use a two-phase fix:

1. Discover and document the plugin-root mechanism Copilot exposes during hook execution.
2. Update Copilot hook commands to use that mechanism, with tests that execute the configured hook from a non-plugin workspace cwd.

Do not assume a variable named `COPILOT_PLUGIN_ROOT`. The previous design mentioned this as a possibility, but the current failure shows that unverified assumptions around hook execution are the main risk. The implementation must prove the actual contract on this machine before finalizing the command shape.

If Copilot exposes a plugin root environment variable, use it. If it does not, use a narrowly scoped fallback that resolves this installed marketplace path:

```text
~/.copilot/installed-plugins/tungnt-ai-skills-marketplace/tungnt-ai-skills
```

The fallback must fail visibly when the expected plugin root is missing; it must not silently emit empty or partial context.

## Detailed Design

### 1. Add a temporary diagnostic hook path during implementation

Before changing production hook commands, capture the hook execution environment from a real Copilot session.

Diagnostic requirements:

- Output diagnostics to stderr only.
- Do not write secrets, token values, or full environment dumps into repo files.
- Record only variable names and safe path values needed to identify plugin root behavior.
- Remove the diagnostic hook before finalizing the fix.

The implementer should capture:

- Current working directory at hook execution time.
- Any environment variable whose name contains `COPILOT`, `PLUGIN`, `HOOK`, or `ROOT`.
- Whether the installed plugin root exists at `~/.copilot/installed-plugins/tungnt-ai-skills-marketplace/tungnt-ai-skills`.

This diagnostic step settles whether the final command should use a Copilot-provided root variable or the installed-path fallback.

### 2. Replace workspace-relative Copilot hook commands

Modify both Copilot hook manifests:

- `hooks/hooks.copilot.json`
- `hooks/hooks.json`

Both currently use the same Copilot-native shape and should stay mirrored unless a separate spec intentionally splits them.

The final command must not depend on `cwd: "."` being the plugin root.

Preferred shape if Copilot exposes a plugin root variable:

```json
{
  "version": 1,
  "hooks": {
    "sessionStart": [
      {
        "type": "command",
        "bash": "bash \"${COPILOT_PLUGIN_ROOT}/hooks/session-start\"",
        "powershell": "& \"$env:COPILOT_PLUGIN_ROOT\\hooks\\session-start.ps1\"",
        "timeoutSec": 30
      }
    ]
  }
}
```

Use the real variable name discovered by the diagnostic step. If the variable is not `COPILOT_PLUGIN_ROOT`, do not invent an alias unless the wrapper explicitly defines it.

Fallback shape if no plugin root variable exists:

```json
{
  "version": 1,
  "hooks": {
    "sessionStart": [
      {
        "type": "command",
        "bash": "bash \"$HOME/.copilot/installed-plugins/tungnt-ai-skills-marketplace/tungnt-ai-skills/hooks/session-start\"",
        "powershell": "$root = Join-Path $env:USERPROFILE '.copilot\\installed-plugins\\tungnt-ai-skills-marketplace\\tungnt-ai-skills'; & (Join-Path $root 'hooks\\session-start.ps1')",
        "timeoutSec": 30
      }
    ]
  }
}
```

For Windows, prefer invoking `session-start.ps1` directly through PowerShell. Do not go through `session-start.cmd` unless testing proves Copilot requires CMD wrapping, because the observed failure is already in the PowerShell hook path.

### 3. Keep the bootstrap script self-contained

No behavior change is required in `hooks/session-start.ps1` for the confirmed failure. It already derives the plugin root from `$PSScriptRoot`:

```powershell
$pluginRoot = Split-Path -Parent $PSScriptRoot
```

Once the command reaches the script by absolute/plugin-root path, the existing script reads:

```text
skills/using-tungnt-ai-skills/SKILL.md
```

from the correct root and emits:

```json
{
  "additionalContext": "..."
}
```

The only script-level change allowed by this spec is improved stderr diagnostics when the bootstrap file is missing. Do not write diagnostics to stdout.

### 4. Update tests to enforce cwd-independent execution

Keep the new focused regression test:

- `tests/copilot-bootstrap/run-tests.js`

The test must:

- Parse the actual command from `hooks/hooks.copilot.json`.
- Run it from the repo/plugin root and expect success.
- Run it from a temporary workspace cwd and expect success.
- Assert stdout contains `additionalContext`.
- Assert stdout contains `using-tungnt-ai-skills`.

After the fix, this command must pass:

```bash
npm.cmd run test:copilot-bootstrap
```

Update existing installer tests that currently lock in the old relative commands:

- `tests/installer/run-tests.js`

Replace assertions for:

```js
assert.equal(entry.bash, 'bash ./hooks/session-start');
assert.equal(entry.powershell, '& .\\hooks\\session-start.ps1');
assert.equal(entry.cwd, '.');
```

with assertions that verify:

- `entry.bash` references `hooks/session-start` without requiring workspace cwd.
- `entry.powershell` references `session-start.ps1` without requiring workspace cwd.
- `entry.cwd` is absent unless Copilot documentation or observed behavior proves it is needed.
- Both `hooks/hooks.copilot.json` and `hooks/hooks.json` use the same resolved command strategy.

### 5. Update docs and investigation links

Modify `README.md` Copilot section:

- Explain that installed/enabled plugin state is not enough; the session-start hook must run successfully.
- Add a troubleshooting note for the exact log shape:

```text
Hook from "tungnt-ai-skills@tungnt-ai-skills-marketplace" execution failed
.\hooks\session-start.ps1 is not recognized
```

- Point users to update the plugin and rerun the clean-session acceptance prompt.

Update the investigation file after implementation:

- `docs/tungnt-ai-skills/investigations/copilot-bootstrap-hook-cwd-2026-06-11.md`

Add a follow-up section with:

- Final command strategy chosen.
- Test output from `npm.cmd run test:copilot-bootstrap`.
- Installer test output.
- Real Copilot acceptance result or a clearly stated remaining auth blocker.

## File Changes

- Modify: `hooks/hooks.copilot.json`
- Modify: `hooks/hooks.json`
- Modify: `tests/copilot-bootstrap/run-tests.js` only if needed to reflect the final command contract
- Modify: `tests/installer/run-tests.js`
- Modify: `README.md`
- Modify: `docs/tungnt-ai-skills/investigations/copilot-bootstrap-hook-cwd-2026-06-11.md`
- Optional modify: `hooks/session-start.ps1` only for stderr-only missing-bootstrap diagnostics

## Compatibility

### Copilot

Copilot hook execution should become independent from the session workspace cwd. A clean session should inject `using-tungnt-ai-skills` before the model handles the first user request.

### Claude

No intended behavior change. Claude-specific manifests remain:

- `hooks/hooks.windows.json`
- `hooks/hooks.unix.json`

Do not convert those files to the Copilot command strategy.

### Cursor

No intended behavior change. Cursor continues using:

- `hooks/hooks-cursor.json`

### Antigravity and Gemini

No intended behavior change.

## Error Handling

- If the plugin root cannot be resolved, the hook should fail clearly in Copilot logs.
- The hook must not emit non-JSON text to stdout.
- Missing bootstrap file diagnostics must go to stderr.
- The fix must not swallow hook failures by returning successful JSON with missing bootstrap content.

## Acceptance Criteria

- `npm.cmd run test:copilot-bootstrap` passes.
- `npm.cmd run test:installer` passes.
- `git diff --check` passes.
- `hooks/hooks.copilot.json` no longer depends on `.\hooks\session-start.ps1` from the workspace cwd.
- `hooks/hooks.json` mirrors the same Copilot-safe command strategy or has a documented reason not to.
- A real Copilot session no longer logs `.\hooks\session-start.ps1 is not recognized`.
- A fresh Copilot acceptance prompt:

```text
Let's make a react todo list
```

causes Copilot to load `using-tungnt-ai-skills` and select `brainstorming` before writing code.

If the non-interactive prompt cannot run because this shell lacks authentication, the implementation handoff must include:

- the exact auth error,
- the command that was attempted,
- the tests that still passed locally,
- and instructions for capturing the transcript from an authenticated Copilot session.

## Spec Kernel

**Goal:** Make Copilot bootstrap hook execution independent from the user's session cwd so `using-tungnt-ai-skills` is injected automatically.

**Users:** Developers using `tungnt-ai-skills` through GitHub Copilot CLI or Copilot app plugin support.

**Acceptance Criteria:**

- Given the hook command is run from a non-plugin workspace cwd, when `npm.cmd run test:copilot-bootstrap` executes, then the command still emits valid JSON with `additionalContext`.
- Given Copilot starts a clean session with the plugin installed, when the `sessionStart` hook runs, then no log entry reports `.\hooks\session-start.ps1 is not recognized`.
- Given the first prompt is `Let's make a react todo list`, when Copilot responds, then it uses `using-tungnt-ai-skills` and selects `brainstorming` before code creation.

**Constraints:**

- Keep bootstrap logic centralized in `hooks/session-start` and `hooks/session-start.ps1`.
- Do not add dependencies.
- Do not alter non-Copilot hook manifests unless required by shared tests.
- Do not write hook diagnostics to stdout.

**Out of Scope:**

- Rewriting skill content.
- Reworking marketplace install behavior.
- Automating a real model transcript without an authenticated Copilot session.
