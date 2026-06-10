# Investigation: Context Override Loophole in Developer Workspace

## Hand-off Brief

1. **What happened.** When the AI agent operates inside the developer workspace (`./`), the workspace's local `SessionStart` hook injects the developer (draft) version of the bootstrap skill into the AI context, overriding the globally installed "production" version of the plugin skills.
2. **Where the case stands.** We have identified the root causes: local hook priority override and relative path ambiguity in `RULE[user_global]`. Status is Complete.
3. **What's needed next.** Implement environment-awareness in the local `session-start` script to add a dev-mode flag, and use absolute paths in global rules.

## Case Info

| Field | Value |
| --- | --- |
| Ticket | N/A |
| Date opened | 2026-06-10 |
| Status | Complete |
| Evidence sources | `hooks/hooks.json`, `hooks/session-start`, `GEMINI.md` Global Rules |

## Problem Statement

The AI agent is bypassing the installed system plugin (`C:\Users\Admin\.gemini\config\plugins\tungnt-ai-skills\skills\`) and directly loading skills from the local workspace. This creates a "loophole" where the AI is governed by potentially unstable developer rules rather than the verified, installed rules when operating inside the plugin's own source code repository.

## Evidence Inventory

| Source | Status | Notes |
| --- | --- | --- |
| Global Rules (`RULE[user_global]`) | Available | Injected at session start |
| Workspace Hook (`hooks/hooks.json`) | Available | Defines `SessionStart` trigger |
| Script (`hooks/session-start`) | Available | Executes payload injection |

## Investigation Backlog

| # | Path to Explore | Priority | Status | Notes |
| --- | --- | --- | --- | --- |
| 1 | Explore how `SessionStart` hooks are executed when both global and local hooks are present. | High | Complete | Analyzed local script behavior. |

## Timeline of Events

| Time | Event | Source | Confidence |
| --- | --- | --- | --- |
| 16:15:13 | User opens workspace `./` | System | Confirmed |
| 16:15:13 | IDE executes local `SessionStart` hook (`hooks/session-start.cmd`) | `hooks/hooks.json` | Deduced |
| 16:15:15 | AI reads `using-tungnt-ai-skills` from local workspace due to the injected context. | Agent Logs | Confirmed |

## Confirmed Findings

### Finding 1: Local workspace hook overrides global plugin

**Evidence:** `hooks/hooks.json` mapping to `hooks/session-start.cmd`

**Detail:** The IDE triggers the local hook on SessionStart, which injects `<EXTREMELY_IMPORTANT>` tags containing the local `SKILL.md` content into the AI's prompt. This forces the AI to prioritize the local developer version over the global installed version.

### Finding 2: Relative path ambiguity

**Evidence:** Global Rule text: `If this GEMINI.md file is loaded from inside the plugin root, load: ./skills/using-tungnt-ai-skills/SKILL.md`

**Detail:** The AI resolves `./skills/...` relative to the current working directory. Since the developer workspace has the exact same directory structure as the plugin, it reads the local files instead of navigating to `~/.gemini/config/plugins/...`.

## Deduced Conclusions

### Deduction 1: AI prioritizes local dev rules

**Based on:** Finding 1 and Finding 2

**Reasoning:** The injected context via the hook is highly prioritized by the LLM (due to `<EXTREMELY_IMPORTANT>`), and relative path resolution forces it to look at local files.

**Conclusion:** The AI will always act as if the local workspace files are the authoritative rules governing its behavior, creating an "inception problem" where the AI uses the tool's draft code to define how it uses tools.

## Hypothesized Paths

None - root causes are fully confirmed.

## Missing Evidence

| Gap | Impact | How to Obtain |
| --- | --- | --- |
| None | N/A | N/A |

## Source Code Trace

| Element | Detail |
| --- | --- |
| Error origin | `hooks/session-start` |
| Trigger | Session initialization |
| Condition | Opening the workspace that contains the source code for the plugin itself. |
| Related files | `hooks/hooks.json`, `.gemini/GEMINI.md` |

## Conclusion

**Confidence:** High

The loophole is confirmed to be a combination of aggressive local hook execution (Context Injection) and relative path resolution in Global Rules. The AI is functioning exactly as programmed by the local repository's hooks, but this behavior conflicts with the expectation that the installed system plugin should take precedence.

## Recommended Next Steps

### Fix direction

1. **Environment Awareness:** Update `hooks/session-start` to detect if it's running in developer mode (e.g., check if the path contains `.gemini/config/plugins`). If it is running locally, prepend a warning indicating this is the DEV VERSION and should NOT override system skills.
2. **Absolute Paths:** Modify the Global Rules generator to emit absolute paths for the `SKILL.md` references instead of relative `./skills/...`.

### Diagnostic

No further diagnostics required.

## Reproduction Plan

1. Install the `tungnt-ai-skills` plugin globally.
2. Open the source repository of `tungnt-ai-skills` in the IDE.
3. Ask the AI to evaluate a skill and observe it citing local files instead of installed global files.

## Side Findings

- The local hooks mechanism is highly effective at injecting context, which validates the architectural choice for the plugin itself, even if it causes issues during plugin development. (Confirmed)

## Follow-up: 2026-06-10

### New Evidence

None at this time.

### Additional Findings

None.

### Updated Hypotheses

None.

### Backlog Changes

None.

### Updated Conclusion

The root cause remains confirmed as a Context Override loop due to local workspace hooks. Proceed to implementation of Fix Direction.
