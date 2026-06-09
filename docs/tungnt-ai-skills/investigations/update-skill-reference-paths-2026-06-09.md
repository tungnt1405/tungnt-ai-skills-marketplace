# Investigation: Update skill reference paths

## Hand-off Brief

1. **What happened.** Confirmed: after updating the Copilot-installed plugin, an agent attempted to read `skills/investigation/references/copilot-tools.md` and `skills/investigation/references/codex-tools.md`, but those files do not exist.
2. **Where the case stands.** Complete: the source and installed plugin contain those reference files under `skills/using-tungnt-ai-skills/references/`; the failing reads use the active process skill as the base path.
3. **What's needed next.** Update the bootstrap wording to use explicit repo-root paths, and add a test that protects those referenced files.

## Case Info

| Field | Value |
| --- | --- |
| Ticket | N/A |
| Date opened | 2026-06-09 |
| Status | Complete |
| Evidence sources | User error report, source tree, installed Copilot plugin, current tests |

## Problem Statement

User reported that after updating the skill from git, attempts to read platform reference files failed with paths under `skills/investigation/references/`.

## Evidence Inventory

| Source | Status | Notes |
| --- | --- | --- |
| User-reported error | Available | Failed reads target `skills/investigation/references/copilot-tools.md` and `skills/investigation/references/codex-tools.md`. |
| Source tree | Available | `skills/investigation/` has only `SKILL.md`; platform reference docs live under `skills/using-tungnt-ai-skills/references/`. |
| Installed Copilot plugin | Available | Same shape as source: bootstrap reference files exist, investigation reference files do not. |
| Tests | Available | Existing skill-content tests assert security reference files, but not platform adaptation reference paths. |

## Confirmed Findings

### Finding 1: Bootstrap references are written as relative filenames

**Evidence:** `skills/using-tungnt-ai-skills/SKILL.md:95`

**Detail:** The bootstrap says `Copilot CLI: references/copilot-tools.md`, `Codex: references/codex-tools.md`, and `Gemini CLI: references/gemini-tools.md`.

### Finding 2: The referenced files exist under the bootstrap skill only

**Evidence:** `skills/using-tungnt-ai-skills/references/copilot-tools.md`, `skills/using-tungnt-ai-skills/references/codex-tools.md`, `skills/using-tungnt-ai-skills/references/gemini-tools.md`

**Detail:** The source tree contains the platform reference files in the bootstrap skill directory.

### Finding 3: Investigation has no references directory

**Evidence:** `skills/investigation/SKILL.md`

**Detail:** `skills/investigation/` contains only `SKILL.md`; there is no `skills/investigation/references/` directory.

### Finding 4: Installed Copilot plugin has the same layout

**Evidence:** `/Users/tungnt/.copilot/installed-plugins/tungnt-ai-skills-marketplace/tungnt-ai-skills/skills/using-tungnt-ai-skills/references/copilot-tools.md`

**Detail:** The installed plugin has the bootstrap reference file. The corresponding investigation path is missing, matching the source layout.

## Deduced Conclusions

### Deduction 1: The update did fetch the platform reference files for Copilot

**Based on:** Findings 2 and 4.

**Reasoning:** The Copilot-installed plugin contains `skills/using-tungnt-ai-skills/references/copilot-tools.md`, so the file is present after update.

**Conclusion:** The Copilot symptom is a path-resolution/instruction ambiguity issue, not a missing fetched file.

### Deduction 2: The ambiguous relative path is the likely trigger

**Based on:** Findings 1 and 3.

**Reasoning:** The bootstrap uses `references/foo.md` without naming the containing skill. Once the process skill changes to `investigation`, an agent can reasonably resolve that relative path under `skills/investigation/`, producing exactly the failing path in the user report.

**Conclusion:** The bootstrap should point to `skills/using-tungnt-ai-skills/references/foo.md` explicitly.

## Hypothesized Paths

### Hypothesis 1: Codex marketplace cache may omit nested skill support files

**Status:** Open

**Theory:** The Codex cached copy under `.codex/plugins/cache/.../1.3.2` is missing nested `references/` and `scripts/` directories, even though the local Codex plugin folder has them.

**Would confirm:** A clean Codex marketplace install reproduces the missing nested directories.

**Would refute:** A fresh cache after marketplace upgrade includes all nested files.

## Missing Evidence

| Gap | Impact | How to Obtain |
| --- | --- | --- |
| Exact Copilot command/session transcript | Would confirm whether the failing read was attempted by the agent or by the installer itself. | Capture the full terminal/session output around the failure. |
| Fresh Codex marketplace install behavior | Would separate Codex cache packaging behavior from local fallback install behavior. | Run a clean Codex plugin remove/add and inspect cache contents. |

## Source Code Trace

| Element | Detail |
| --- | --- |
| Error origin | Agent read operation against `skills/investigation/references/*.md` |
| Trigger | Bootstrap platform adaptation section after `investigation` is selected |
| Condition | Relative path `references/*.md` is interpreted against the active skill directory |
| Related files | `skills/using-tungnt-ai-skills/SKILL.md`, `tests/skill-content/run-tests.js` |

## Conclusion

**Confidence:** High for Copilot symptom, Medium for Codex cache side finding.

Confirmed: the files exist in the installed Copilot plugin, but under `skills/using-tungnt-ai-skills/references/`, not `skills/investigation/references/`. Deduced: the bootstrap wording is too ambiguous after another process skill becomes active. The fix direction is to use full repo-root paths in the bootstrap and test that each platform adaptation path exists.

## Recommended Next Steps

### Fix direction

Change the platform adaptation bullets in `skills/using-tungnt-ai-skills/SKILL.md` from `references/*.md` to `skills/using-tungnt-ai-skills/references/*.md`, then add a content test that extracts those paths and asserts they exist.

### Diagnostic

For Codex specifically, run a clean marketplace cache refresh and verify nested skill assets are included; if not, investigate Codex plugin packaging separately.

## Reproduction Plan

1. Activate `using-tungnt-ai-skills`.
2. Select `investigation`.
3. Ask the agent to read platform adaptation docs.
4. Observe whether it reads `skills/investigation/references/*.md` or the explicit bootstrap reference path.

## Side Findings

- Confirmed: `/Users/tungnt/.copilot/installed-plugins/tungnt-ai-skills-marketplace/tungnt-ai-skills` is at commit `2d37089`, while the local repo is at `a167d54`.
- Confirmed: the installed Copilot plugin has a local modification in `hooks/run-hook.cmd`, unrelated to the reference-path failure.

## Follow-up: 2026-06-09

### New Evidence

- Confirmed: `skills/using-tungnt-ai-skills/SKILL.md` now points to explicit repo-root platform reference paths under `skills/using-tungnt-ai-skills/references/`.
- Confirmed: `tests/skill-content/run-tests.js` now asserts those platform reference paths are present in the bootstrap and exist on disk, and rejects the ambiguous `references/*.md` paths.
- Confirmed: version metadata is synchronized at `1.4.0` across declared manifests, including `.agents/plugins/tungnt-ai-skills-marketplace/plugin.json`.

### Updated Conclusion

The Copilot path-resolution bug has a targeted fix and regression coverage. Skill and installer tests pass after the minor version bump.
