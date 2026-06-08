# Sync Upstream Skills Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `subagent-driven-development` (recommended) or `executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `tungnt-ai-skills sync-skills` so agent harnesses can safely synchronize bundled skills from upstream repositories.

**Architecture:** Put sync behavior in a focused `installer/skill-sync.js` module and keep `installer/cli.js` responsible for argument parsing and output. Tests use local fixture directories through source override options, so the regression suite does not require network access. `ui-ux-pro-max` is a composite sync: copy its wrapper `SKILL.md` from `.claude/skills/ui-ux-pro-max/` and recursively copy `data/`, `scripts/`, and `templates/` from `src/ui-ux-pro-max/`.

**Tech Stack:** Node.js ES modules, Node built-ins (`fs`, `path`, `os`, `child_process`, `crypto`), existing CLI test runner.

---

### Task 1: Create Sync Module

**Files:**
- Create: `installer/skill-sync.js`
- Modify: `tests/installer/run-tests.js`

- [ ] **Step 1: Write failing module tests**

Add tests that import `syncSkills`, create local fixture sources, and verify dry-run and apply behavior.

- [ ] **Step 2: Run tests to verify failure**

Run: `npm run test:installer`

Expected: FAIL because `installer/skill-sync.js` does not exist.

- [ ] **Step 3: Implement minimal sync module**

Create `installer/skill-sync.js` with:

- `SYNC_SOURCES` metadata for `superpowers` and `ui-ux-pro-max`
- `parseSyncSkillsArgs(args)` for `--source`, `--dry-run`, `--apply`, and `--repo`
- `syncSkills(options)` for clone/fixture resolution, diff planning, and optional apply
- path safety helpers that refuse writes outside local `skills/`
- composite copy support for non-Markdown data/scripts/templates, including CSV, YAML, TOML, JSON, and Python files

- [ ] **Step 4: Run tests to verify pass**

Run: `npm run test:installer`

Expected: PASS for new module tests.

### Task 2: Wire CLI Command

**Files:**
- Modify: `installer/cli.js`
- Modify: `tests/installer/run-tests.js`

- [ ] **Step 1: Write failing CLI tests**

Add tests for:

- `sync-skills --dry-run --repo superpowers=<fixture>`
- `sync-skills --apply --repo superpowers=<fixture>`
- unknown `--source` exits with a clear error

- [ ] **Step 2: Run tests to verify failure**

Run: `npm run test:installer`

Expected: FAIL because `sync-skills` is not handled by `runCli`.

- [ ] **Step 3: Wire command**

Import `parseSyncSkillsArgs` and `syncSkills` in `installer/cli.js`, add the command to usage, and print deterministic summaries:

- `Source: <id>`
- `Repository: <repo-or-fixture>`
- `Mode: dry-run` or `Mode: apply`
- `Added: <n>`
- `Updated: <n>`
- `Removed: <n>`

- [ ] **Step 4: Run tests to verify pass**

Run: `npm run test:installer`

Expected: PASS.

### Task 3: Verify and Review

**Files:**
- Modify: `installer/skill-sync.js`
- Modify: `installer/cli.js`
- Modify: `tests/installer/run-tests.js`

- [ ] **Step 1: Run focused tests**

Run: `npm run test:installer`

Expected: all installer tests pass.

- [ ] **Step 2: Run skill content tests**

Run: `npm run test:skills`

Expected: all skill content tests pass.

- [ ] **Step 3: Check diff hygiene**

Run: `git diff --check`

Expected: no whitespace errors.

- [ ] **Step 4: Self-review**

Review that no dependency was added, network is used only for real upstream clone when no fixture override is supplied, and apply mode cannot write outside `skills/`.
