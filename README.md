# tungnt-ai-skills

`tungnt-ai-skills` is a personal fork of [obra/superpowers](https://github.com/obra/superpowers) with custom bootstrap rules, curated workflow skills, fork-specific plugin metadata, and local agent setup adjustments.

## What This Fork Provides

- `using-tungnt-ai-skills` bootstrap rules for this fork
- workflow skills under `skills/` for brainstorming, planning, implementation, review, and branch finish work
- plugin metadata for Claude Code, Codex, GitHub Copilot CLI, Gemini CLI, and Google Antigravity
- a zero-dependency npm installer that copies the package into supported agent plugin directories

Some compatibility paths still use the old upstream name. In particular, `docs/superpowers/` remains the active docs root for plans and specs.

## Repository Layout

- `skills/` bundled workflow skills
- `skills/using-tungnt-ai-skills/` session bootstrap and platform references
- `docs/superpowers/` active plans and specs root
- `hooks/` session bootstrap and cross-platform hook wrappers
- `installer/` npm installer target map and copy logic
- `bin/tungnt-ai-skills.js` npm executable entrypoint
- `.claude-plugin/`, `.codex-plugin/`, `.agents/`, `.opencode/` harness metadata
- `tests/` regression and installer tests

## Core Workflow

Agents should start with `using-tungnt-ai-skills`, then choose the smallest relevant workflow skill:

- fuzzy idea or design work: `brainstorming`
- approved design that needs an implementation plan: `writing-plans`
- substantial work that needs isolation: `using-git-worktrees`
- plan execution with subagents: `subagent-driven-development`
- plan execution without subagents: `executing-plans`
- review before handoff: `requesting-code-review`
- final merge, cleanup, or handoff: `finishing-a-development-branch`

Skill calls use the real names from each `SKILL.md` file, not a plugin-prefixed namespace.

## Install

This package is installed directly from the GitHub repository:

```bash
npm exec --yes --package=github:tungnt1405/tungnt-ai-skills-marketplace -- tungnt-ai-skills install
```

With no flags, `install` behaves like `--all` and targets Claude Code, Codex, GitHub Copilot CLI, Gemini CLI, and Google Antigravity.

Install one agent only:

```bash
npm exec --yes --package=github:tungnt1405/tungnt-ai-skills-marketplace -- tungnt-ai-skills install --agent codex
```

Supported agent ids:

| Agent id | Target |
| --- | --- |
| `claude` | Claude Code |
| `codex` | Codex |
| `copilot` | GitHub Copilot CLI |
| `gemini` | Gemini CLI |
| `antigravity` | Google Antigravity |

The `antigravity` target installs shared content under `~/.gemini` so Antigravity CLI, Antigravity IDE, and Antigravity 2.0 can reuse the same files:

```text
~/.gemini/skills/{skill_name}/SKILL.md
~/.gemini/AGENTS.md
~/.gemini/CLAUDE.md
~/.gemini/GEMINI.md
```

Preview resolved install directories without writing files:

```bash
npm exec --yes --package=github:tungnt1405/tungnt-ai-skills-marketplace -- tungnt-ai-skills install --dry-run
```

Preview one agent only:

```bash
npm exec --yes --package=github:tungnt1405/tungnt-ai-skills-marketplace -- tungnt-ai-skills install --agent codex --dry-run
```

List supported agents and default target directories:

```bash
npm exec --yes --package=github:tungnt1405/tungnt-ai-skills-marketplace -- tungnt-ai-skills targets
```

## Update

To update an existing install, run the installer again with `--force`:

```bash
npm exec --yes --package=github:tungnt1405/tungnt-ai-skills-marketplace -- tungnt-ai-skills install --force
```

Update one agent only:

```bash
npm exec --yes --package=github:tungnt1405/tungnt-ai-skills-marketplace -- tungnt-ai-skills install --agent codex --force
```

If you are updating this local source checkout first, pull the latest repository changes, then rerun the installer:

```bash
git pull
npm exec --yes --package=github:tungnt1405/tungnt-ai-skills-marketplace -- tungnt-ai-skills install --agent codex --force
```

Restart or reload the target agent after updating so it reads the new plugin files.

## Manual Harness Notes

The npm installer is the preferred path. Manual setup should only be needed for debugging or for harnesses not covered by the installer.

Every manual integration has the same requirements:

- load `skills/using-tungnt-ai-skills/SKILL.md` automatically at session start
- expose the bundled `skills/` directory to the harness
- preserve compatibility paths such as `docs/superpowers/`
- keep skill invocations using the names declared in each `SKILL.md`

For Antigravity manual installs, prefer the shared Gemini root instead of product-specific folders. Current Antigravity variants use product-specific skill roots such as `~/.gemini/antigravity-cli/skills`, `~/.gemini/antigravity-ide/skills`, and `~/.gemini/antigravity/skills`; the shared root `~/.gemini/skills` is the common location all variants can read. Global Markdown files should live directly in `~/.gemini`.

Harness-specific metadata in this repo:

- Claude Code: `.claude-plugin/plugin.json`
- Codex: `.codex-plugin/plugin.json`
- Gemini CLI: `gemini-extension.json`
- Google Antigravity: `.agents/plugins/tungnt-ai-skills/plugin.json`
- OpenCode: `.opencode/plugins/`

Additional notes:

- Antigravity: [docs/README.antigravity.md](docs/README.antigravity.md)
- OpenCode: [docs/README.opencode.md](docs/README.opencode.md)

## Development

Run installer tests:

```bash
npm run test:installer
```

The package is intentionally dependency-free. Do not add third-party runtime dependencies unless the project requirements change explicitly.

Before opening a PR, read [CLAUDE.md](CLAUDE.md). This fork has strict contributor rules around real problem statements, duplicate PR checks, complete PR templates, and human review of the full diff.

## License

This fork is distributed under the MIT License. See [LICENSE](LICENSE) for the current copyright notice and terms.
