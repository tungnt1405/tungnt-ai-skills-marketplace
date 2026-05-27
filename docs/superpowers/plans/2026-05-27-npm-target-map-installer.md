# npm Target-Map Installer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `subagent-driven-development` (recommended) or `executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a zero-dependency npm/npx installer that copies `tungnt-ai-skills` into the correct plugin directories for Claude Code, Codex, Copilot, Gemini, and Antigravity.

**Architecture:** Add a small Node ESM CLI with a data-driven target map, a package copy module, and a test runner using only built-in Node modules. The default `install` command installs all supported agents unless `--agent <id>` is supplied.

**Tech Stack:** Node.js ESM, `node:fs`, `node:path`, `node:os`, `node:assert`, npm `bin`.

---

## File Structure

- Create `bin/tungnt-ai-skills.js`: npm executable entrypoint.
- Create `installer/target-map.js`: single source of truth for supported agents, paths, required files, notes.
- Create `installer/package-copy.js`: copy/exclude/validate/remove helpers.
- Create `installer/cli.js`: argument parsing, command dispatch, install orchestration.
- Create `tests/installer/run-tests.js`: dependency-free Node test runner.
- Create `.agents/plugins/tungnt-ai-skills/plugin.json`: Antigravity manifest path required by spec/docs.
- Modify `package.json`: add `bin` and `scripts.test:installer`.
- Modify `README.md`: document npm installer first, keep manual sections as fallback.

## Tasks

- [ ] Add installer target map and unit coverage for supported agents.
- [ ] Add package copy engine and tests for source validation, copying, and force safety.
- [ ] Add CLI commands, npm bin wiring, and CLI behavior tests.
- [ ] Add Antigravity manifest at `.agents/plugins/tungnt-ai-skills/plugin.json`.
- [ ] Update README with npm installer usage and preserve manual fallback docs.
- [ ] Run final verification commands from the spec.

## Acceptance Criteria

- `npm exec -- tungnt-ai-skills install --dry-run` shows all five agent targets by default.
- `npm exec -- tungnt-ai-skills install --agent codex --dry-run` shows only Codex.
- Installing into a temp HOME creates plugin directories with `skills/using-tungnt-ai-skills/SKILL.md`.
- Tests pass without installing third-party npm dependencies.
- README explains the default all-agent behavior and the `--agent` override.
