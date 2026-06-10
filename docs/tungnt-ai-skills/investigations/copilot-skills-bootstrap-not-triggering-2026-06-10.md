# Investigation: Copilot skills bootstrap not triggering

## Hand-off Brief

1. **What happened.** Confirmed: Copilot has `tungnt-ai-skills@tungnt-ai-skills-marketplace` installed, but earlier Copilot logs show the session-start hook failed before bootstrap context could be injected.
2. **Where the case stands.** Active: GitHub's Copilot docs confirm Copilot can discover `hooks/hooks.json` by default, so the remaining risk is hook file shape and Windows command execution, not basic discovery.
3. **What's needed next.** Convert or add a Copilot-native hook config with `version: 1`, a direct `sessionStart`/`SessionStart` command entry, and a Windows `powershell` command that actually invokes the bootstrap script.

## Case Info

| Field | Value |
| --- | --- |
| Ticket | N/A |
| Date opened | 2026-06-10 |
| Status | Active |
| Evidence sources | Repo docs, installer target map, hook scripts, local Copilot settings, local Copilot logs |

## Problem Statement

User reports that Copilot does not automatically activate the skills workflow. The intended behavior is that each new request first loads `using-tungnt-ai-skills`, classifies the work, and then selects the correct process skill before implementation.

## Evidence Inventory

| Source | Status | Notes |
| --- | --- | --- |
| Repo contributor rules | Available | `CLAUDE.md:71` says real integration loads `using-tungnt-ai-skills` at session start; otherwise skills are present but not invoked. |
| Acceptance test | Available | `CLAUDE.md:73` and `CLAUDE.md:77` define the clean-session test: "Let's make a react todo list" must trigger `brainstorming` before code. |
| Bootstrap hook | Available | `hooks/session-start:18` reads `skills/using-tungnt-ai-skills/SKILL.md`; `hooks/session-start:53` emits top-level `additionalContext` for Copilot/unknown platforms. |
| Copilot installer target | Available | `installer/target-map.js:173` defines the Copilot target; `installer/target-map.js:177` has `requiredFiles: []`; `installer/target-map.js:193-195` configures only `.copilot/settings.json` in fallback mode. |
| Root plugin manifest | Available | `plugin.json:23` declares `skills` only; unlike `.cursor-plugin/plugin.json:24`, it does not declare a `hooks` manifest path. |
| Local Copilot install state | Available | `copilot plugin list` output showed `tungnt-ai-skills@tungnt-ai-skills-marketplace (v1.4.2)`. |
| Local Copilot settings | Available | `.copilot/settings.json` contains `extraKnownMarketplaces.tungnt-ai-skills-marketplace` and `enabledPlugins.tungnt-ai-skills@tungnt-ai-skills-marketplace: true`. |
| Local Copilot logs | Available | `process-1780455716254-5352.log` and `process-1781055448415-9952.log` showed hook execution failed with `Unexpected token 'session-start'` while calling `hooks/run-hook.cmd session-start`. |
| Current installed hook files | Available | Installed plugin now has `hooks/session-start`, `hooks/session-start.cmd`, and `hooks/hooks.json`; `hooks/run-hook.cmd` is absent. |
| Copilot official plugin docs | Available | Copilot plugins can contain `plugin.json`, optional `skills/`, optional `hooks.json`, and optional MCP config; plugin reference also says hooks config is discovered from `hooks.json` or `hooks/hooks.json`. |
| Copilot official hooks docs | Available | Hook config should include `version: 1`; `sessionStart` can inject `additionalContext`; Windows command hooks should use `powershell` or a valid `command` fallback. |

## Confirmed Findings

### Finding 1: The framework explicitly requires session-start bootstrap

**Evidence:** `CLAUDE.md:71`, `CLAUDE.md:73`, `CLAUDE.md:77`

**Detail:** Installing skill files is not enough. The acceptance criterion is a clean harness session where the first user prompt causes `brainstorming` to auto-trigger before code.

### Finding 2: Copilot is installed and enabled locally

**Evidence:** Local command output: `copilot plugin list` reported `tungnt-ai-skills@tungnt-ai-skills-marketplace (v1.4.2)`; `.copilot/settings.json` has the marketplace and enabled plugin entry.

**Detail:** The failure is not simply "plugin missing."

### Finding 3: Earlier Copilot sessions failed before bootstrap injection

**Evidence:** Local Copilot logs for 2026-06-03 and 2026-06-10 showed `Hook execution failed` with PowerShell parser error `Unexpected token 'session-start'` for command shape `"hooks/run-hook.cmd" session-start`.

**Detail:** A failed hook cannot emit the bootstrap `additionalContext`, so Copilot proceeds without the mandatory process gate.

### Finding 4: Source now uses `session-start.cmd`, and Copilot can discover `hooks/hooks.json`

**Evidence:** `hooks/hooks.json:9`, `hooks/hooks.windows.json:9`, `hooks/session-start:53`, `plugin.json:23`, `.cursor-plugin/plugin.json:24`, `installer/target-map.js:177`, `installer/target-map.js:193-195`

**Detail:** The source contains a Windows hook entrypoint and Copilot-compatible JSON output. GitHub's Copilot plugin reference says hooks configuration can be discovered from `hooks.json` or `hooks/hooks.json`, so root `plugin.json` lacking `"hooks"` is not enough to explain the failure.

### Finding 5: Current `hooks/hooks.json` is not a clean Copilot-native hook config

**Evidence:** `hooks/hooks.json` has no top-level `version: 1`; it uses a Claude-style nested shape `hooks.SessionStart[0].hooks[0].command`; the command is `"${CLAUDE_PLUGIN_ROOT}/hooks/session-start.cmd"`.

**Detail:** GitHub's hook docs show command hook entries directly under the event array and define `bash`, `powershell`, or `command` fields. The previous log failure proves that a quoted command plus an argument was parsed by PowerShell as a string followed by an unexpected token. A quoted `.cmd` path without a PowerShell call operator can similarly fail to execute as intended.

## Deduced Conclusions

### Deduction 1: The process did not fail inside `quick-dev` or `ui-ux-pro-max`; it failed earlier at bootstrap

**Based on:** Findings 1 and 3.

**Reasoning:** If `using-tungnt-ai-skills` is not injected at session start, Copilot has no mandatory instruction to choose a process skill before acting. The later failure to choose `quick-dev` or `ui-ux-pro-max` is a symptom, not the root gate.

**Conclusion:** The user's breakdown is directionally correct, but the deepest root cause is harness bootstrap delivery, not the individual agent's later classification mistake.

### Deduction 2: The current repo still has a Copilot verification gap

**Based on:** Findings 1, 4, and 5.

**Reasoning:** The repo defines an acceptance test for new harnesses, but the inspected files do not show a Copilot-specific automated or transcript-backed test proving `brainstorming` auto-triggers in a clean Copilot session. The current hook file also does not match the documented Copilot shape closely enough to rely on by inspection.

**Conclusion:** Without that test, regressions like stale hook commands or missing hook manifest wiring can ship while the plugin still appears installed.

## Hypothesized Paths

### Hypothesis 1: Copilot cached an old hook command

**Status:** Open

**Theory:** Earlier installed metadata referenced `hooks/run-hook.cmd session-start`; after update, files changed to `session-start.cmd`, but the failing sessions had stale command metadata.

**Would confirm:** A fresh Copilot session after update logs no `run-hook.cmd` error and passes the acceptance test.

**Would refute:** A fresh Copilot session still fails or never runs the session-start hook.

### Hypothesis 2: Root `plugin.json` needs an explicit Copilot hook declaration

**Status:** Refuted / lowered priority

**Theory:** Copilot may read root `plugin.json`; because it only has `"skills": "./skills/"`, Copilot can expose skills but may not wire `hooks/hooks.json`.

**Would confirm:** Copilot documentation or runtime behavior showing root `plugin.json` must declare hooks.

**Would refute:** Copilot documentation showing `hooks/hooks.json` is a default discovery path.

**Resolution:** Refuted as the primary cause by GitHub's Copilot plugin reference: hooks configuration can be discovered from `hooks.json` or `hooks/hooks.json`. An explicit `"hooks"` field may still be clearer, but it is not required for discovery.

### Hypothesis 3: The hook command shape is wrong for Copilot on Windows

**Status:** Open

**Theory:** Copilot discovers `hooks/hooks.json`, but the entry is Claude-shaped and uses a `command` string that PowerShell does not invoke correctly. Therefore the bootstrap hook either fails or emits no valid JSON.

**Would confirm:** A Copilot-native `hooks/hooks.json` using `version: 1`, direct `sessionStart`, and `powershell: "& \"...\\session-start.cmd\""` causes bootstrap injection and the acceptance test passes.

**Would refute:** Current `hooks/hooks.json` runs successfully in a clean Copilot session and injects `using-tungnt-ai-skills`.

## Missing Evidence

| Gap | Impact | How to Obtain |
| --- | --- | --- |
| Clean Copilot acceptance transcript after current update | Determines whether the current install is fixed or still broken | Start a new Copilot session and send exactly `Let's make a react todo list`; confirm `brainstorming` is used before code. |
| Copilot hook execution transcript | Determines whether current `hooks/hooks.json` actually executes and injects `additionalContext` | Run a fresh Copilot session with verbose logs and inspect hook execution after startup. |

## Conclusion

**Confidence:** Medium

Confirmed: Copilot plugin is installed and enabled, previous sessions failed hook execution before bootstrap injection, and Copilot can discover `hooks/hooks.json` by default. Deduced: the observed "Copilot skips planning/skills" behavior is caused by bootstrap not reliably reaching the model, so the process gate is bypassed before work classification. The highest-risk open cause is now the Copilot hook file shape and Windows command invocation, not missing hook discovery.

## Recommended Next Steps

### Diagnostic

Run the clean-session acceptance test in Copilot after the current update:

```text
Let's make a react todo list
```

Expected: Copilot must invoke `using-tungnt-ai-skills`, then `brainstorming`, before writing code.

### Fix direction

If the acceptance test fails, fix the Copilot integration at the bootstrap contract level, not by adding stronger wording to `quick-dev` or `ui-ux-pro-max`. The likely fix area is a Copilot-native hook config:

- add top-level `version: 1`
- use `sessionStart` or `SessionStart` with direct command entries
- use `powershell` on Windows instead of a quoted `command` fallback
- ensure `hooks/session-start` emits top-level `additionalContext`

## Follow-up: 2026-06-10

### New Evidence

GitHub Copilot docs provided by the user confirm:

- A Copilot plugin can contain optional hooks alongside plugin manifest and skills.
- The plugin reference lists `hooks.json` or `hooks/hooks.json` as hook configuration discovery paths.
- The hooks reference says `sessionStart` can inject `additionalContext`.
- The hooks troubleshooting guidance says hook JSON should include `version: 1`.
- The command hook schema supports `bash`, `powershell`, and `command`; on Windows, `powershell` is the precise field.

### Updated Conclusion

The statement "hooks.json is being received" is consistent with the docs and local evidence. The process gap is not that Copilot fails to see hooks. The sharper diagnosis is: Copilot sees a hook config, but the config is not clearly Copilot-native and has already shown Windows PowerShell command parsing failure in logs.
