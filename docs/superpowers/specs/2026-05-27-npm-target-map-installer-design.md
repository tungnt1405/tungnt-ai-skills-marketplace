# npm target-map installer design

## Problem

Installing `tungnt-ai-skills` currently requires different manual steps for each supported harness. The repository already contains agent-specific manifests and documentation for Claude Code, Codex, Copilot, Gemini, and Antigravity, but there is no single package installer that can place the right files in the right agent directory.

Users should be able to run the package through `npx` or `npm exec` and get a filesystem install without learning each harness layout first.

## Goals

- Provide an npm package CLI that installs the local package into supported agent targets.
- Support `claude`, `codex`, `copilot`, `gemini`, and `antigravity`.
- Use a target-map so agent target paths and copy behavior are data-driven and testable.
- Default to installing all supported agents when no agent flag is supplied.
- Keep the package zero-dependency at runtime.
- Preserve the repository's existing source-of-truth layout for runtime agent use: root `skills/`, agent manifests, hooks, and agent instruction Markdown files.

## Non-goals

- Do not call native agent marketplace commands such as `codex plugin marketplace add`.
- Do not create symlink-based installs.
- Do not redesign skill content or agent manifests.
- Do not guarantee acceptance by upstream plugin marketplaces.

## CLI behavior

The package exposes a binary named `tungnt-ai-skills`.

Supported commands:

```bash
npx tungnt-ai-skills install
npx tungnt-ai-skills install --all
npx tungnt-ai-skills install --agent claude
npx tungnt-ai-skills install --agent codex
npx tungnt-ai-skills install --agent copilot
npx tungnt-ai-skills install --agent gemini
npx tungnt-ai-skills install --agent antigravity
npx tungnt-ai-skills install --agent codex --dry-run
npx tungnt-ai-skills install --agent codex --force
npx tungnt-ai-skills targets
```

`install` with no `--agent` and no explicit target selection behaves the same as `install --all`.

`targets` prints the supported agents, display names, and resolved default install directories for the current OS.

`--dry-run` prints the planned source, destination, and selected agent targets without writing files.

`--force` allows replacing an existing install directory after the installer verifies the destination is inside the expected parent directory for that agent.

## Target map

Create an installer target-map module, for example `installer/target-map.js`, with one entry per agent:

- `id`: stable CLI id such as `codex`
- `displayName`: human-readable name
- `defaultTarget`: function that resolves the install directory for the current OS
- `copyMode`: package copy strategy
- `requiredFiles`: files that must exist after install
- `postInstallNotes`: short text explaining any manual enable step

The initial target directories are:

| Agent | Default target |
| --- | --- |
| Claude Code | `~/.claude/plugins/tungnt-ai-skills` |
| Codex | `~/.codex/tmp/plugins/plugins/tungnt-ai-skills` |
| Copilot | `~/.copilot/plugins/tungnt-ai-skills` |
| Gemini | `~/.gemini/extensions/tungnt-ai-skills` |
| Antigravity | `~/.gemini/config/plugins/tungnt-ai-skills` |

The map is the only place where these defaults live. CLI parsing and copy logic consume the map rather than duplicating paths.

## Copy strategy

The installer copies only the runtime files needed by the supported agents instead of staging the full package root. This keeps root `skills/` available for agents that expect the plugin root to contain skills while avoiding unrelated repository files in agent plugin directories.

Include:

- `skills/`
- `hooks/`
- `.claude-plugin/`
- `.codex-plugin/`
- `.agents/`
- `gemini-extension.json`
- `GEMINI.md`
- `CLAUDE.md`
- `AGENTS.md`

Exclude:

- `.git/`
- `node_modules/`
- `tests/`
- `docs/superpowers/plans/`
- `docs/superpowers/specs/`
- `assets/`
- `.antigravitycli/`
- `.opencode/`
- `.cursor-plugin/`
- `README.md`
- `LICENSE`
- `package.json`
- temporary files and OS metadata

After copying, the installer validates each selected target by checking required files. The shared required files are:

- `skills/using-tungnt-ai-skills/SKILL.md`

Agent-specific required files:

- Claude Code: `.claude-plugin/plugin.json`
- Codex: `.codex-plugin/plugin.json`
- Gemini: `gemini-extension.json`
- Antigravity: `.agents/plugins/tungnt-ai-skills/plugin.json`
- Copilot: shared package files plus post-install notes for enabling through the Copilot plugin flow

If an expected source file is missing, the installer fails before modifying any target for that agent. The implementation should add the Antigravity manifest at `.agents/plugins/tungnt-ai-skills/plugin.json` because the current Antigravity documentation names that path as supported plugin metadata.

## Error handling

- Unknown command: print usage and exit non-zero.
- Unknown agent id: print supported ids and exit non-zero.
- Existing destination without `--force`: fail with a message showing the destination and retry command.
- Existing destination with `--force`: remove only after resolving the destination and confirming it is under the expected parent directory.
- Missing source file: fail before copying that agent.
- Partial failure during `--all`: continue installing remaining agents, then exit non-zero with a summary of failed agents.

## Tests

Add Node-based tests that do not require external dependencies:

- Target-map includes the five supported agents.
- Default `install` selection resolves to all agents.
- `--agent` selects one agent.
- `targets` prints all supported ids.
- `--dry-run` does not write files.
- Installer copies shared required files into a temp HOME.
- Existing target fails without `--force`.
- Existing target is replaced with `--force` only when the resolved path is under the expected agent parent.

The tests should run with the system Node runtime and use temporary directories for HOME or agent root overrides.

## Documentation

Update `README.md` installation instructions to introduce the npm path first:

```bash
npx tungnt-ai-skills install
```

Document agent-specific installs and dry-run:

```bash
npx tungnt-ai-skills install --agent codex
npx tungnt-ai-skills install --agent codex --dry-run
```

Keep the existing manual sections as fallback details for users who need to debug or wire a harness directly.

## Acceptance criteria

- `npm exec -- tungnt-ai-skills install --dry-run` shows all five agent targets by default.
- `npm exec -- tungnt-ai-skills install --agent codex --dry-run` shows only Codex.
- Installing into a temp HOME creates plugin directories with `skills/using-tungnt-ai-skills/SKILL.md`.
- Tests pass without installing third-party npm dependencies.
- README explains the default all-agent behavior and the `--agent` override.
