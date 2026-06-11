# Investigation: Copilot bootstrap hook cwd

## Hand-off Brief

1. **What happened.** Confirmed: Copilot has `tungnt-ai-skills` installed, but its session-start hook fails when run from a normal session cwd because the manifest uses a relative `.\hooks\session-start.ps1` path.
2. **Where the case stands.** Complete for diagnosis; the hook script itself works when run from the plugin root, and Copilot logs show the runtime failure before bootstrap context can be injected.
3. **What's needed next.** Change the Copilot hook command to locate the installed plugin root, then run the new `npm run test:copilot-bootstrap` regression and a logged-in Copilot acceptance transcript.

## Case Info

| Field | Value |
| --- | --- |
| Ticket | N/A |
| Date opened | 2026-06-11 |
| Status | Complete |
| Evidence sources | Copilot CLI local state, Copilot log, hook manifest, manual hook execution, new regression test |

## Problem Statement

User reports that Copilot on this machine does not auto-activate the bootstrap skills even though hooks are present; skills only work when invoked directly.

## Evidence Inventory

| Source | Status | Notes |
| --- | --- | --- |
| `copilot plugin list` | Available | Reports `tungnt-ai-skills@tungnt-ai-skills-marketplace (v1.4.6)` installed. |
| `%USERPROFILE%\.copilot\settings.json` | Available | Plugin is enabled under `enabledPlugins`. |
| `%USERPROFILE%\.copilot\logs\process-1781143214623-12592.log` | Available | Shows hook execution failure for this plugin. |
| `hooks/hooks.copilot.json` | Available | Uses relative session-start commands and `cwd: "."`. |
| `hooks/session-start.ps1` | Available | Emits top-level `additionalContext` for Copilot/unknown platforms. |
| Non-interactive Copilot acceptance prompt | Partial | Could not run in this shell because `copilot.cmd -p` reported no authentication information. |

## Investigation Backlog

| # | Path to Explore | Priority | Status | Notes |
| --- | --- | --- | --- | --- |
| 1 | Confirm plugin installed/enabled | High | Done | `copilot plugin list` and settings confirmed install state. |
| 2 | Determine whether hook script can emit bootstrap | High | Done | Running `hooks/session-start.ps1` from repo root returns JSON with `additionalContext`. |
| 3 | Determine whether Copilot calls hook successfully | High | Done | Copilot log shows command failure. |
| 4 | Capture logged-in acceptance transcript | Medium | Open | Needs authenticated non-interactive Copilot or an interactive transcript. |

## Timeline of Events

| Time | Event | Source | Confidence |
| --- | --- | --- | --- |
| 2026-06-11 09:00:14 +07:00 | Copilot CLI starts session `1360b5c2-8757-430f-818a-c6241623690a`. | `%USERPROFILE%\.copilot\logs\process-1781143214623-12592.log` | Confirmed |
| 2026-06-11 09:04:13 +07:00 | Copilot reports hook execution failed for `tungnt-ai-skills@tungnt-ai-skills-marketplace`. | `%USERPROFILE%\.copilot\logs\process-1781143214623-12592.log` | Confirmed |

## Confirmed Findings

### Finding 1: Copilot plugin is installed and enabled

**Evidence:** `copilot plugin list` returned `tungnt-ai-skills@tungnt-ai-skills-marketplace (v1.4.6)`. `%USERPROFILE%\.copilot\settings.json` contains `"enabledPlugins": { "tungnt-ai-skills@tungnt-ai-skills-marketplace": true }`.

**Detail:** The failure is not simply that the plugin is absent or disabled.

### Finding 2: Copilot manifest points at relative hook paths

**Evidence:** `hooks/hooks.copilot.json:7`, `hooks/hooks.copilot.json:8`, and `hooks/hooks.copilot.json:9` define `bash ./hooks/session-start`, `& .\hooks\session-start.ps1`, and `cwd: "."`.

**Detail:** Those paths only work if Copilot executes the hook with the plugin root as cwd.

### Finding 3: The hook script can emit Copilot-compatible context

**Evidence:** `hooks/session-start.ps1:43` emits top-level `additionalContext`. Manual execution from repo root returned JSON containing `additionalContext` and `using-tungnt-ai-skills`.

**Detail:** The bootstrap payload format and skill-file read are not the immediate failure in the observed session.

### Finding 4: Copilot actually fails before bootstrap injection

**Evidence:** `%USERPROFILE%\.copilot\logs\process-1781143214623-12592.log` records `Hook from "tungnt-ai-skills@tungnt-ai-skills-marketplace" execution failed` followed by PowerShell saying `.\hooks\session-start.ps1` is not recognized.

**Detail:** This matches the relative-path manifest. Copilot is trying to execute the hook, but from a directory where `.\hooks\session-start.ps1` does not exist.

### Finding 5: A regression test now captures the cwd failure mode

**Evidence:** `tests/copilot-bootstrap/run-tests.js` runs the configured Copilot hook command once from the plugin root and once from a temporary workspace cwd.

**Detail:** The second run is expected to fail on the current code, demonstrating why runtime Copilot sessions do not get bootstrap context.

## Deduced Conclusions

### Deduction 1: Direct skill invocation works because it bypasses failed session-start injection

**Based on:** Findings 1, 3, and 4.

**Reasoning:** Skills are installed and the bootstrap script can produce context, but Copilot fails running the hook before the context reaches the model. Calling a skill directly uses Copilot's skill tool/path after session start and does not depend on successful bootstrap injection.

**Conclusion:** The observed "must use directly" behavior is consistent with hook command resolution failure, not with missing skill files.

### Deduction 2: The manifest needs plugin-root-aware execution

**Based on:** Findings 2 and 4.

**Reasoning:** The current command is relative to cwd. Runtime cwd is not guaranteed to be the plugin root. Therefore the command must either use an environment variable provided by Copilot for the plugin root, a manifest-supported plugin-relative command, or a wrapper path that Copilot resolves relative to the plugin package.

**Conclusion:** Fix direction is to change Copilot hook command discovery, not to alter the bootstrap skill content.

## Hypothesized Paths

### Hypothesis 1: Copilot exposes a plugin-root environment variable

**Status:** Open

**Theory:** Similar to Claude's `CLAUDE_PLUGIN_ROOT`, Copilot may provide a root variable usable in the hook command.

**Would confirm:** Official Copilot SDK/CLI docs or a diagnostic hook dumping hook environment.

**Would refute:** Docs or environment capture showing no plugin-root variable.

**Resolution:** Not settled in this pass.

## Missing Evidence

| Gap | Impact | How to Obtain |
| --- | --- | --- |
| Logged-in non-interactive Copilot acceptance transcript | Confirms end-user behavior after a fix | Run `copilot.cmd -p "Let's make a react todo list" --allow-all-tools` in an authenticated shell or capture an interactive transcript. |
| Copilot hook environment variables | Determines cleanest fix | Add a temporary diagnostic hook or check official Copilot CLI plugin hook docs. |

## Source Code Trace

| Element | Detail |
| --- | --- |
| Error origin | `hooks/hooks.copilot.json:8` relative PowerShell command |
| Trigger | Copilot `sessionStart` hook for installed `tungnt-ai-skills` plugin |
| Condition | Copilot executes hook with cwd set to the user/session workspace instead of the plugin root |
| Related files | `plugin.json:24`, `hooks/hooks.json:8`, `hooks/session-start.ps1:43`, `README.md:497` |

## Conclusion

**Confidence:** High

Confirmed evidence shows Copilot has the plugin installed and attempts to run the hook, but the hook fails resolving `.\hooks\session-start.ps1`. The bootstrap script itself works from the plugin root and emits Copilot-style `additionalContext`. Therefore Copilot does not auto-activate skills because the session-start hook fails before injecting `using-tungnt-ai-skills`, while direct skill invocation still works because it bypasses that bootstrap path.

## Recommended Next Steps

### Fix direction

Make the Copilot hook command plugin-root-aware, then update the existing manifest tests that currently lock in `cwd: "."` plus relative commands.

### Diagnostic

Run `npm run test:copilot-bootstrap`. On the current code it should fail on the workspace-cwd assertion and print the same path-resolution failure shape seen in the Copilot log.

## Reproduction Plan

1. Ensure the current plugin manifest remains unchanged.
2. Run `npm run test:copilot-bootstrap`.
3. Observe that the hook passes from the repo/plugin root and fails from a temporary workspace cwd.

## Side Findings

- In this PowerShell environment, `copilot --help` resolves to `copilot.ps1` and is blocked by execution policy. Calling `copilot.cmd --help` works.
- `copilot.cmd -p "Let's make a react todo list" --allow-all-tools` could not run here because this shell reported no authentication information.
