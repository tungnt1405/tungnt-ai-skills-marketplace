# tungnt-ai-skills

`tungnt-ai-skills` is a personal fork of [obra/superpowers](https://github.com/obra/superpowers) with custom bootstrap rules, curated workflow skills, fork-specific plugin metadata, and local agent setup adjustments.

## What This Fork Provides

- `using-tungnt-ai-skills` bootstrap rules for this fork
- workflow skills under `skills/` for brainstorming, planning, implementation, review, and branch finish work
- plugin metadata for Claude Code, Codex, GitHub Copilot CLI, Gemini CLI, and Google Antigravity
- a zero-dependency npm installer that copies the package into supported agent plugin directories

Some compatibility paths still use the old upstream name. In particular, `docs/superpowers/` remains the active docs root for plans and specs.

## Menu

- [What This Fork Provides](#what-this-fork-provides)
- [Repository Layout](#repository-layout)
- [Core Workflow](#core-workflow)
- [Install](#install)
  - [Install Menu](#install-menu)
  - [1. NPM/npx Installer](#1-npmnpx-installer-recommended)
  - [2. Native Installer Mode](#2-native-installer-mode)
  - [3. Manual Setup When NPM/Npx Is Not Available](#3-manual-setup-when-npmnpx-is-not-available)
- [Update](#update)
- [Manual Harness Notes](#manual-harness-notes)
- [Development](#development)
- [License](#license)

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

### Install Menu

Choose the path that matches your environment:

| Option | Use when | What it does |
| --- | --- | --- |
| [1. NPM/npx installer](#1-npmnpx-installer-recommended) | `npm exec` or `npx` works | Runs the zero-dependency installer. Default mode sets up marketplace metadata and prints follow-up UI/CLI steps. |
| [2. Native installer mode](#2-native-installer-mode) | You want the target agent CLI to run plugin commands | Runs native `plugin marketplace add`, `plugin install`, or `plugin enable` commands through the installer. |
| [3. Manual setup](#3-manual-setup-when-npmnpx-is-not-available) | `npm exec`/`npx` fails or you need to debug files | Shows the exact files/settings to copy or edit by hand, plus direct CLI commands where available. |

### 1. NPM/npx Installer (Recommended)

```bash
npm exec --yes --package=github:tungnt1405/tungnt-ai-skills-marketplace -- tungnt-ai-skills install
```

Use the NPM installer first when `npm exec` works. It has two modes:

- Default mode imports or registers marketplace metadata that can be written safely, then prints the app/CLI steps for adding the plugin.
- `--native` mode runs the target agent's native plugin commands directly.

If `npm exec` or `npx` cannot run in your environment, skip the installer and use the manual setup section below.

By default, the NPM installer performs only manual marketplace setup for Claude Code, Codex, and GitHub Copilot CLI. It does not run native plugin commands unless `--native` is passed. The remaining local targets copy the package into their plugin folders.

With no flags, `install` behaves like `--all` and targets Claude Code, Codex, GitHub Copilot CLI, Gemini CLI, and the concrete Antigravity plugin folders.

Install one agent only:

```bash
npm exec --yes --package=github:tungnt1405/tungnt-ai-skills-marketplace -- tungnt-ai-skills install --agent codex
```

### 2. Native Installer Mode

Run native plugin commands instead of default marketplace metadata setup:

```bash
npm exec --yes --package=github:tungnt1405/tungnt-ai-skills-marketplace -- tungnt-ai-skills install --agent codex --native
```

Native mode still uses the NPM installer entrypoint. If `npm exec` or `npx` cannot run, use the manual setup section and run the listed native commands directly.

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

For Claude Code, Codex, and Copilot, dry-run prints the manual marketplace files or settings that would be written and the next install/enable commands to run yourself. With `--native`, dry-run prints the native marketplace commands that would be executed. Dry-run does not write files.

Preview one agent only:

```bash
npm exec --yes --package=github:tungnt1405/tungnt-ai-skills-marketplace -- tungnt-ai-skills install --agent codex --dry-run
```

List supported agents and default target directories:

```bash
npm exec --yes --package=github:tungnt1405/tungnt-ai-skills-marketplace -- tungnt-ai-skills targets
```

### 3. Manual Setup When NPM/Npx Is Not Available

Use this section only when the NPM installer cannot run, or when you need to debug the files it writes. These steps are manual equivalents of the installer's default marketplace setup. Native CLI commands are listed separately for users who want the agent CLI to perform install/enable actions directly.

#### Claude Code

The default installer path copies the local marketplace package to:

```text
~/.claude/plugins/cache/tungnt-ai-skills-marketplace
```

That package includes:

```text
.claude-plugin/marketplace.json
.claude-plugin/plugin.json
skills/
hooks/
```

After the marketplace package is present, choose the path that matches how you use Claude:

Claude Code app:

1. Open Claude Code.
2. Open the Plugins tab.
3. Search for `tungnt-ai-skills`.
4. Add the plugin.

Claude CLI:

```bash
claude

/plugins tungnt-ai-skills
```

Or run the equivalent native commands directly:

```bash
claude plugin install tungnt-ai-skills@tungnt-ai-skills-marketplace
claude plugin enable tungnt-ai-skills@tungnt-ai-skills-marketplace
```

If the NPM installer works, `--native` runs those Claude CLI commands for you. If `npm exec` or `npx` is unavailable, run the commands directly.

#### Codex

Codex support in this fork is driven by the bundled plugin manifest:

- `.codex-plugin/plugin.json`
- bundled `skills/`

##### Codex Marketplace Setup

[Codex CLI add marketplace](https://developers.openai.com/codex/plugins/build#add-a-marketplace-from-the-cli)

Codex CLI and Codex App use the same marketplace/plugin metadata. Configure the marketplace once, then install from either the CLI command palette or the App UI.

Add the marketplace:

```bash
codex plugin marketplace add tungnt1405/tungnt-ai-skills-marketplace

# codex plugin marketplace add tungnt1405/tungnt-ai-skills-marketplace --ref main

# codex plugin marketplace add $REPO_ROOT/tungnt-ai-skills-marketplace # you must clone repo to local
```

For the manual local setup used by the installer fallback, copy the plugin folder into the Codex local marketplace plugins directory:

```bash
# copy plugin to the local marketplace plugins directory
cp -R $REPO_ROOT/tungnt-ai-skills-marketplace ~/.codex/.tmp/plugins/plugins
```

The fallback package directory is:

```text
~/.codex/.tmp/plugins/plugins/tungnt-ai-skills-marketplace
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

The default NPM installer path writes this local marketplace entry automatically. When the native command succeeds, the installer reports the install status and does not print the manual follow-up steps.

##### Codex CLI

Choose the path that matches how you use Codex:

Codex CLI:

```bash
codex

/plugins tungnt-ai-skills
```

Then add `tungnt-ai-skills` from the plugins screen.

If the NPM installer works, `--native` runs this Codex CLI setup for you. If `npm exec` or `npx` is unavailable, run the commands directly:

```bash
codex plugin marketplace add tungnt1405/tungnt-ai-skills-marketplace
codex plugin install tungnt-ai-skills@openai-curated
```

##### Codex App

Codex app:

- Open Plugins in the sidebar.
- Search for `tungnt-ai-skills`.
- Add the plugin.

If the fork is not published in your Codex App marketplace, use the local/manual marketplace setup above.

#### Google Antigravity

The NPM installer copies Antigravity plugin files into the product-specific plugin roots:

```text
~/.gemini/antigravity-cli/plugins/tungnt-ai-skills
~/.gemini/config/plugins/tungnt-ai-skills
```

For a manual setup equivalent to the installer, run these commands from the repository root.

Install Antigravity CLI:

```bash
mkdir -p ~/.gemini/antigravity-cli/plugins/tungnt-ai-skills
cp -R plugin.json skills ~/.gemini/antigravity-cli/plugins/tungnt-ai-skills/
```

Install Antigravity IDE:

```bash
mkdir -p ~/.gemini/config/plugins/tungnt-ai-skills
cp -R plugin.json skills ~/.gemini/config/plugins/tungnt-ai-skills/
```

Copy the shared global files used by both layouts:

```bash
cp AGENTS.md CLAUDE.md GEMINI.md gemini-extension.json ~/.gemini/
```

Restart Antigravity CLI or Antigravity IDE after copying files, then open `/plugins` and verify `tungnt-ai-skills`.

The root `plugin.json` and `skills/` directory are the Antigravity plugin payload. The root `skills/` directory remains the single source of truth; no Antigravity-specific skills are duplicated.

Detailed Antigravity notes:

- `docs/README.antigravity.md`

#### GitHub Copilot CLI

The default installer path creates or updates:

```text
~/.copilot/settings.json
```

with the marketplace entry:

```json
{
  "extraKnownMarketplaces": {
    "tungnt-ai-skills-marketplace": {
      "source": {
        "source": "github",
        "repo": "tungnt1405/tungnt-ai-skills-marketplace"
      }
    }
  }
}
```

Then choose the path that matches how you use Copilot:

Copilot app:

1. Open GitHub Copilot.
2. Open the Plugins tab.
3. Search for `tungnt-ai-skills`.
4. Add the plugin.

Copilot CLI:

```bash
copilot

/plugins tungnt-ai-skills
```

Or run the equivalent native command directly:

```bash
copilot plugin install tungnt-ai-skills@tungnt-ai-skills-marketplace
```

The default path merges existing settings. It fails without overwriting the file if `settings.json` is invalid JSON or if `extraKnownMarketplaces` already exists as a non-object value.

If the NPM installer works, `--native` runs these Copilot commands for you. If `npm exec` or `npx` is unavailable, run the commands directly.

- Register the marketplace:

```bash
copilot plugin marketplace add tungnt1405/tungnt-ai-skills-marketplace
```

- Install the plugin:

```bash
copilot plugin install tungnt-ai-skills@tungnt-ai-skills-marketplace
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
