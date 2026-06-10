# Copilot Native Bootstrap Hooks Design

## Problem

Copilot has `tungnt-ai-skills` installed and enabled, and Copilot can discover plugin hook files. The failure is not basic marketplace installation or missing hook discovery.

The current bootstrap hook path is still not reliable for Copilot:

- `hooks/hooks.json` is shaped for Claude-style hooks, with nested `hooks.SessionStart[0].hooks[0].command`.
- The file has no top-level `version: 1`, which Copilot hook docs expect.
- The current command uses a quoted command fallback. Earlier local Copilot logs showed PowerShell parsing failed for the same class of command shape: a quoted `.cmd` path followed by an argument.
- If `sessionStart` fails, `using-tungnt-ai-skills` is not injected, so the agent skips the mandatory process gate and may jump straight into implementation.

The integration needs a Copilot-native hook config that injects the same bootstrap content without changing the shared bootstrap script or breaking the existing Claude/Cursor hook path.

## Goals

- Make Copilot load `using-tungnt-ai-skills` at session start through a Copilot-native hook config.
- Keep `hooks/session-start` as the single bootstrap implementation.
- Use Copilot's documented hook schema: top-level `version: 1`, direct `sessionStart` event entries, and `additionalContext` output.
- Use a Windows-safe `powershell` command for Copilot CLI on Windows.
- Preserve existing Claude/Cursor hook behavior unless explicitly changed by a later spec.
- Add verification that catches regressions where Copilot can install the plugin but does not load the bootstrap.

## Non-goals

- Do not rewrite the `using-tungnt-ai-skills` skill content.
- Do not change quick-dev, brainstorming, or domain skill routing as part of this fix.
- Do not remove Claude-compatible `hooks/hooks.json` in this change.
- Do not add third-party runtime dependencies.
- Do not require users to manually opt in to skills per Copilot session.

## Recommended Approach

Use a dedicated Copilot hook manifest and point the root Copilot plugin manifest at it.

This avoids forcing one `hooks/hooks.json` file to serve two hook schemas. Claude-style hooks can keep using `hooks/hooks.json`, while Copilot gets an explicit manifest whose structure follows GitHub's Copilot docs.

Alternative approaches considered:

- **Change `hooks/hooks.json` to Copilot-native.** Simpler for Copilot, but risks breaking Claude/native marketplace installs that currently expect the Claude-style hook shape.
- **Keep current hook file and only change the command string.** Lower diff, but leaves the schema mismatch and missing `version: 1` in place.
- **Duplicate bootstrap logic in a Copilot-specific script.** Avoids wrapper complexity, but creates two bootstrap implementations that can drift.

The recommended approach gives the narrowest behavioral change with the strongest compatibility story.

## Detailed Design

### 1. Add a Copilot-native hook manifest

Create `hooks/hooks.copilot.json`.

The file should use Copilot's documented config shape:

```json
{
  "version": 1,
  "hooks": {
    "sessionStart": [
      {
        "type": "command",
        "bash": "bash \"${COPILOT_PLUGIN_ROOT}/hooks/session-start\"",
        "powershell": "& \"${COPILOT_PLUGIN_ROOT}\\hooks\\session-start.cmd\"",
        "timeoutSec": 30
      }
    ]
  }
}
```

If Copilot does not expose `COPILOT_PLUGIN_ROOT`, use the environment variable observed in real Copilot hook execution. The implementation must confirm this with a local hook smoke test before finalizing the manifest. Do not guess silently.

If Copilot only supports repository-relative commands for plugin hooks, use a relative command rooted at the plugin directory and document that contract in the test.

### 2. Point Copilot at the Copilot hook manifest

Update root `plugin.json` to declare:

```json
"hooks": "hooks/hooks.copilot.json"
```

Keep the existing:

```json
"skills": "./skills/"
```

This makes the root plugin manifest explicit for Copilot while preserving the default `hooks/hooks.json` file for existing Claude-style plugin behavior.

### 3. Keep one bootstrap implementation

Do not fork the bootstrap body.

`hooks/session-start` remains the only script that reads:

```text
skills/using-tungnt-ai-skills/SKILL.md
```

and emits hook output. Its Copilot branch already emits top-level:

```json
{
  "additionalContext": "BOOTSTRAP_CONTEXT"
}
```

That output matches Copilot's documented `sessionStart` behavior, where `additionalContext` is injected into the session.

### 4. Make the Windows command path explicit

The Windows command must use PowerShell invocation syntax, not a bare quoted string:

```powershell
& "${COPILOT_PLUGIN_ROOT}\hooks\session-start.cmd"
```

This avoids the earlier parser failure class where PowerShell treated a quoted path as a string literal and rejected the following token.

The `.cmd` wrapper may continue to locate Git Bash and execute `hooks/session-start`. If Git Bash is missing, the failure should be visible in Copilot logs and not swallowed as a successful hook.

### 5. Add source validation

Update installer/source validation so Copilot installs require:

- `plugin.json`
- `skills/using-tungnt-ai-skills/SKILL.md`
- `hooks/session-start`
- `hooks/session-start.cmd`
- `hooks/hooks.copilot.json`

This should live in `installer/target-map.js` for the Copilot target.

### 6. Add tests

Extend `tests/installer/run-tests.js` or add focused hook manifest tests to assert:

- `hooks/hooks.copilot.json` parses as JSON.
- It has `version: 1`.
- It has `hooks.sessionStart`.
- The first entry uses `type: "command"`.
- The Windows command is in the `powershell` field and starts with `&`.
- The Unix command is in the `bash` field and calls `hooks/session-start`.
- `plugin.json` points to `hooks/hooks.copilot.json`.
- The Copilot source validation requires the bootstrap hook files.

Keep these tests dependency-free.

### 7. Add runtime verification instructions

Document the required manual acceptance test because only a real Copilot session can prove the bootstrap reaches the model:

```text
Let's make a react todo list
```

Expected behavior:

1. Copilot starts a clean session.
2. The `sessionStart` hook injects `using-tungnt-ai-skills`.
3. Copilot loads the bootstrap before meaningful work.
4. Copilot selects `brainstorming` before writing code.

The PR or handoff must include the transcript and relevant Copilot log lines. If the hook runs but the model still skips `brainstorming`, treat that as a separate prompt-compliance issue after bootstrap delivery has been proven.

## File Changes

- Create: `hooks/hooks.copilot.json`
- Modify: `plugin.json`
- Modify: `installer/target-map.js`
- Modify: `tests/installer/run-tests.js`
- Modify: `README.md`
- Optional modify: `docs/windows/polyglot-hooks.md` only if it currently implies all hook consumers use the Claude-style manifest.

## Compatibility

### Claude

No behavior change intended. Claude-compatible hook files remain in:

- `hooks/hooks.json`
- `hooks/hooks.windows.json`
- `hooks/hooks.unix.json`

### Cursor

No behavior change intended. Cursor continues using:

- `hooks/hooks-cursor.json`

### Copilot

Copilot should use:

- `plugin.json` -> `hooks/hooks.copilot.json`

If Copilot ignores the explicit manifest field and still discovers `hooks/hooks.json`, implementation must stop and document the observed behavior before changing shared hook files.

## Error Handling

- Hook command failures should be visible in Copilot logs.
- The hook script should continue returning valid compact JSON on success.
- The hook should not write debug output to stdout because stdout is parsed as hook JSON.
- Any diagnostics should go to stderr.

## Acceptance Criteria

- `npm run test:installer` passes.
- Hook manifest tests pass for `hooks/hooks.copilot.json`.
- `plugin.json` declares the Copilot hook manifest path.
- A fresh Copilot session no longer logs the previous `run-hook.cmd session-start` parser error.
- A fresh Copilot session acceptance test with `Let's make a react todo list` triggers `using-tungnt-ai-skills` and then `brainstorming` before code is written.
- Existing Claude/Cursor hook files remain intact.

## Spec Kernel

**Goal:** Make Copilot reliably inject `using-tungnt-ai-skills` at session start through a Copilot-native hook config.

**Users:** Developers using `tungnt-ai-skills` through GitHub Copilot CLI.

**Acceptance Criteria:**
- Given `tungnt-ai-skills` is installed in Copilot, when a clean Copilot session starts, then the session-start hook injects `using-tungnt-ai-skills` as `additionalContext`.
- Given the first user prompt is `Let's make a react todo list`, when Copilot responds, then it selects `brainstorming` before writing code.
- Given the plugin is installed on Windows, when Copilot runs the hook, then the command is invoked through PowerShell with the call operator and does not fail with `Unexpected token`.

**Constraints:**
- Keep one bootstrap implementation in `hooks/session-start`.
- Do not break Claude or Cursor hook manifests.
- Do not add runtime dependencies.

**Out of Scope:**
- Changing skill routing content.
- Reworking installer architecture beyond Copilot source validation.
- Automating an end-to-end Copilot transcript test if the CLI cannot run non-interactively in this environment.
