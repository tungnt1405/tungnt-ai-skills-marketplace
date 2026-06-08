# Extensible Skill Sync Sources Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `subagent-driven-development` (recommended) or `executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make upstream skill sync sources configurable and add CLI onboarding support for new skill repositories.

**Architecture:** Move source definitions into `skills.sync.json`, keep fallback defaults in `installer/skill-sync.js`, add inspect/add-source helpers to the sync module, and route `sync-skills inspect` / `sync-skills add-source` through `installer/cli.js`. Add an `upstream-skill-onboarding` skill to guide agents through repo inspection, config, dry-run, apply, and tests.

**Tech Stack:** Node.js ES modules, Node built-ins, existing installer tests.

---

### Task 1: Registry-Backed Sources

**Files:**
- Create: `skills.sync.json`
- Modify: `installer/skill-sync.js`
- Modify: `tests/installer/run-tests.js`

- [ ] Add a root registry with existing `superpowers` and `ui-ux-pro-max` source definitions.
- [ ] Update `syncSkills` to load sources from `skills.sync.json` when present and fallback defaults otherwise.
- [ ] Keep current sync behavior and tests passing.

### Task 2: Inspect and Add Source

**Files:**
- Modify: `installer/skill-sync.js`
- Modify: `installer/cli.js`
- Modify: `tests/installer/run-tests.js`

- [ ] Add `inspectSkillRepository({ repo })` to find common skill layouts.
- [ ] Add `addSyncSource({ repoRoot, name, repository })` to write recommended mapping into `skills.sync.json`.
- [ ] Add CLI routes for `sync-skills inspect --repo ...` and `sync-skills add-source --name ... --repo ...`.
- [ ] Test with local fixture repos so no network is required.

### Task 3: Agent Onboarding Skill and Docs

**Files:**
- Create: `skills/upstream-skill-onboarding/SKILL.md`
- Modify: `tests/README.md`

- [ ] Add a skill that triggers when users ask to add/import/onboard external skill repos.
- [ ] Document the inspect/add-source/dry-run/apply flow.
- [ ] Run installer tests, skill-content tests, and whitespace checks.
