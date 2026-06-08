# Owner Skill Sync Updater Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `subagent-driven-development` (recommended) or `executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an owner-only workflow for comparing or syncing external skills repos without changing this fork's established trigger order.

**Architecture:** Keep source policy in `skills.sync.json` and enforce it in the zero-dependency installer CLI. Put owner operating rules in a narrow skill plus owner docs so future agents classify repos before applying changes.

**Tech Stack:** Node.js ESM installer code, JSON registry, Markdown skills/docs, existing npm test scripts.

---

### Task 1: Enforce Source Policies

**Files:**
- Modify: `installer/skill-sync.js`
- Modify: `skills.sync.json`
- Test: `tests/installer/run-tests.js`

- [ ] Add `policy` values: `managed`, `preserve-existing`, and `review-only`.
- [ ] Set `superpowers` to `review-only`.
- [ ] Keep `ui-ux-pro-max` as managed composite sync.
- [ ] Make review-only sources emit skipped operations even when `--apply` is used.
- [ ] Verify review-only sources do not add upstream skill directories.

### Task 2: Expose Policy Selection

**Files:**
- Modify: `installer/cli.js`
- Test: `tests/installer/run-tests.js`

- [ ] Add `--policy <policy>` to `sync-skills add-source`.
- [ ] Default new sources to `preserve-existing`.
- [ ] Print the selected policy after adding a source.
- [ ] Test CLI policy selection.

### Task 3: Add Owner Workflow Guidance

**Files:**
- Create: `skills/owner-skill-sync-updater/SKILL.md`
- Create: `docs/OWNER-SKILL-SYNC.md`
- Modify: `tests/README.md`

- [ ] Document source classification order.
- [ ] Document review-only behavior for Superpowers and BMAD-derived process rules.
- [ ] Document managed behavior for `ui-ux-pro-max`.
- [ ] Document default behavior for new skills repos.

### Task 4: Verify And Version

**Files:**
- Modify: `package.json`
- Modify: `plugin.json`
- Modify: `.claude-plugin/plugin.json`
- Modify: `.cursor-plugin/plugin.json`
- Modify: `.codex-plugin/plugin.json`
- Modify: `.claude-plugin/marketplace.json`
- Modify: `gemini-extension.json`

- [ ] Bump project version to `1.1.0`.
- [ ] Run `npm.cmd run test:installer`.
- [ ] Run `npm.cmd run test:skills`.
- [ ] Run `git diff --check`.
- [ ] Push branch `owner/skill-sync-updater`.
