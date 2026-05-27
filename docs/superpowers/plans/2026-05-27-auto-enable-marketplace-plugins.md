# Auto-enable Marketplace Plugins Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `subagent-driven-development` (recommended) or `executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the installer automatically configure Codex and Copilot plugin enablement after marketplace setup.

**Architecture:** Add a zero-dependency config writer module for JSON/TOML config files, declare config writes in `installer/target-map.js`, and call those writers from `installer/cli.js`. Codex keeps its local marketplace copy flow and adds `~/.codex/config.toml`; Copilot becomes a config-based marketplace setup through `~/.copilot/settings.json`.

**Tech Stack:** Node.js ESM, built-in `node:fs`, `node:path`, `node:assert`, existing installer test runner.

---

## Implementation Changes

- Create `installer/config-writers.js`.
  - Export `listTargetConfigs(target, env)` and `writeTargetConfigs(target, env)`.
  - Support `kind: 'tomlPluginEnable'` by creating/updating:
    ```toml
    [plugins."tungnt-ai-skills@openai-curated"]
    enabled = true
    ```
  - TOML update rule: replace an existing exact `[plugins."..."]` table body up to the next table header, otherwise append the table; preserve unrelated content and final newline.
  - Support `kind: 'copilotSettings'` by parsing JSON, prepending marketplace/plugin entries, and writing via `JSON.stringify(settings, null, 2) + '\n'`.
  - Fail without writing when Copilot settings JSON is invalid or `extraKnownMarketplaces` / `enabledPlugins` exists as a non-object.

- Modify `installer/target-map.js`.
  - Add `configWrites` to Codex for `~/.codex/config.toml`.
  - Change Copilot to config-based install through `~/.copilot/settings.json`.

- Modify `installer/cli.js`.
  - Import `listTargetConfigs` and `writeTargetConfigs`.
  - In dry-run, print each planned config file as `Config file: <path>`.
  - For `installMode: 'config'`, skip package copy, destination replacement, and install validation; only write declared config files.
  - For normal local targets, keep current copy/marketplace behavior, then call `writeTargetConfigs(target, env)` before `validateInstall`.
  - Keep partial failure behavior unchanged.

- Update `README.md`.
  - In the npm installer section, state that Codex writes marketplace metadata and enables `tungnt-ai-skills@openai-curated` in `~/.codex/config.toml`.
  - State that Copilot writes marketplace and enabled plugin settings into `~/.copilot/settings.json`.
  - Keep manual Copilot README content short.

## Test Plan

- Update `tests/installer/run-tests.js`.
  - Change existing Copilot direct-copy assumptions to use Gemini or another copy-based target.
  - Add Codex config create and merge tests.
  - Add Copilot settings create, merge-order, and invalid JSON tests.
  - Add dry-run tests for Codex and Copilot config files.

- Verification commands:
  ```bash
  npm run test:installer
  npm exec --yes --package=. -- tungnt-ai-skills install --agent codex --dry-run
  npm exec --yes --package=. -- tungnt-ai-skills install --agent copilot --dry-run
  ```

## Execution Tasks

- [ ] Task 1: Add `installer/config-writers.js` with focused writer helpers and direct tests for JSON/TOML merge behavior.
- [ ] Task 2: Wire `configWrites` into `target-map.js` and update target-map/dry-run tests.
- [ ] Task 3: Update `cli.js` install flow for config-only targets and post-copy config writes.
- [ ] Task 4: Update installer integration tests for Codex config and Copilot settings create/merge/failure scenarios.
- [ ] Task 5: Update README installer notes and run the full verification commands.
- [ ] Task 6: Commit implementation with message:
  ```bash
  git add installer/config-writers.js installer/target-map.js installer/cli.js tests/installer/run-tests.js README.md docs/superpowers/plans/2026-05-27-auto-enable-marketplace-plugins.md
  git commit -m "Enable marketplace plugins during install"
  ```

## Assumptions

- Copilot install should no longer require copying files into `~/.copilot/plugins/tungnt-ai-skills`.
- Existing invalid Copilot JSON is user-owned data; installer reports the error and leaves it untouched.
- No runtime dependencies are added.
