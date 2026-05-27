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

### NPM Installer

```bash
npm exec --yes --package=github:tungnt1405/tungnt-ai-skills-marketplace -- tungnt-ai-skills install
```

The NPM installer uses each target's native install style. Claude Code is installed through marketplace commands. Codex follows the local marketplace setup below by copying the plugin package and writing `marketplace.json`. The remaining local targets copy the package into their plugin folders.

With no flags, `install` behaves like `--all` and targets Claude Code, Codex, GitHub Copilot CLI, Gemini CLI, and the concrete Antigravity plugin folders.

Install one agent only:

```bash
npm exec --yes --package=github:tungnt1405/tungnt-ai-skills-marketplace -- tungnt-ai-skills install --agent codex
```

Install all Antigravity layouts:

```bash
npm exec --yes --package=github:tungnt1405/tungnt-ai-skills-marketplace -- tungnt-ai-skills install --agent antigravity-all
```

Supported agent ids:

| Agent id | Target |
| --- | --- |
| `claude` | Claude Code |
| `codex` | Codex |
| `copilot` | GitHub Copilot CLI |
| `gemini` | Gemini CLI |
| `agy` | Antigravity CLI |
| `antigravity` | Google Antigravity |
| `antigravity-ide` | Antigravity IDE |
| `antigravity-all` | Antigravity CLI and Antigravity IDE |

Antigravity targets install plugin folders using the recommended product-specific roots:

```text
~/.gemini/antigravity-cli/plugins/tungnt-ai-skills
~/.gemini/config/plugins/tungnt-ai-skills
```

The `antigravity` and `antigravity-ide` targets use the same plugin location. The `antigravity` target is available for explicit installs, while `--all` and `antigravity-all` install the shared location once through `antigravity-ide`.

Each Antigravity install also copies shared global files to `~/.gemini`:

```text
~/.gemini/AGENTS.md
~/.gemini/CLAUDE.md
~/.gemini/GEMINI.md
~/.gemini/gemini-extension.json
```

Preview resolved install directories without writing files:

```bash
npm exec --yes --package=github:tungnt1405/tungnt-ai-skills-marketplace -- tungnt-ai-skills install --dry-run
```

For Claude Code, dry-run prints the marketplace commands that will be executed. For Codex, dry-run prints the local marketplace package path and `marketplace.json` path that will be written.

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

## Set up the Marketplace manually if it was not installed

### Codex

Codex support in this fork is driven by the bundled plugin manifest:

- `.codex-plugin/plugin.json`
- bundled `skills/`

#### Codex Marketplace Setup

[Codex CLI add marketplace](https://developers.openai.com/codex/plugins/build#add-a-marketplace-from-the-cli)

Codex CLI and Codex App use the same marketplace/plugin metadata. Configure the marketplace once, then install from either the CLI command palette or the App UI.

Add the marketplace:

```bash
codex plugin marketplace add tungnt1405/tungnt-ai-skills-marketplace

# codex plugin marketplace add tungnt1405/tungnt-ai-skills-marketplace --ref main

# codex plugin marketplace add $REPO_ROOT/tungnt-ai-skills-marketplace # you must clone repo to local
```

For a manual local setup, copy the plugin folder into `~/.codex/.tmp/plugins`:

```bash
# get root marketplace to get path of marketplace installed
codex plugin marketplace list

# copy plugin to the local marketplace plugins directory
cp -R $REPO_ROOT/tungnt-ai-skills-marketplace ~/.codex/.tmp/plugins/plugins
```

Add or update `~/.codex/.tmp/plugins/.agents/plugins/marketplace.json`:

```json
"plugins": [
  ...
  , {
    "name": "tungnt-ai-skills",
    "source": {
      "source": "local",
      "path": "./plugins/tungnt-ai-skills-marketplace"
    },
    "policy": {
      "installation": "AVAILABLE",
      "authentication": "ON_INSTALL"
    },
    "category": "Productivity"
  }
]
```

The plugin/package name is:

```text
tungnt-ai-skills
```

#### Codex CLI

Open Codex and install from `/plugins`:

```bash
codex

/plugins tungnt-ai-skills
```

#### Codex App

Use the same shared marketplace setup above, then install from the App UI:

- Open Plugins in the sidebar.
- Search for `tungnt-ai-skills`.
- Click `+` and follow the prompts.

If the fork is not published in your Codex App marketplace, use the local/manual marketplace setup above.

### Google Antigravity

This repo includes Antigravity plugin metadata:

- `.agents/plugins/tungnt-ai-skills/plugin.json`
- `.agents/plugins/plugin.json`
- root `plugin.json` for NPM installer targets

Open this repo in Antigravity, then run:

```text
/plugins
```

Enable or verify:

```text
tungnt-ai-skills
```

The Antigravity manifest follows the existing IDE/agent metadata pattern used by files such as `.codex-plugin/plugin.json`. The root `skills/` directory remains the single source of truth; no Antigravity-specific skills are duplicated.

Detailed Antigravity notes:

- `docs/README.antigravity.md`

### GitHub Copilot CLI

- Register the marketplace:

```bash
copilot plugin marketplace add tungnt1405/tungnt-ai-skills-marketplace
```

- Install the plugin:

```bash
copilot plugin install tungnt-ai-skills@tungnt-ai-skills-marketplace
```

## Manual Harness Notes

For direct file-copy installs, use the NPM installer above. Manual setup should only be needed for debugging or for harnesses not covered by the installer or marketplace flows.

Every manual integration has the same requirements:

- load `skills/using-tungnt-ai-skills/SKILL.md` automatically at session start
- expose the bundled `skills/` directory to the harness
- preserve compatibility paths such as `docs/superpowers/`
- keep skill invocations using the names declared in each `SKILL.md`

Harness-specific metadata in this repo:

- Claude Code: `.claude-plugin/plugin.json`
- Codex: `.codex-plugin/plugin.json`
- Gemini CLI: `gemini-extension.json`
- Google Antigravity: `.agents/plugins/tungnt-ai-skills/plugin.json`, `.agents/plugins/plugin.json`, `plugin.json`
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
