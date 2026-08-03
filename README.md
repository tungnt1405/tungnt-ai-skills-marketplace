# tungnt-ai-skills

`tungnt-ai-skills` is a personal fork of [obra/superpowers](https://github.com/obra/superpowers) with custom bootstrap rules, curated workflow skills, fork-specific plugin metadata, and local agent setup adjustments.

## What This Fork Provides

- `using-tungnt-ai-skills` bootstrap rules for this fork
- workflow skills under `skills/` for investigation, quick fixes, brainstorming, planning, implementation, review, and branch finish work
- domain skills for API design, security hardening, and UI/UX evidence inside the normal workflow
- manual utility skills such as `prompt-leverage` for explicit prompt upgrade, clarification, templating, or apply flows
- `writing-skills` guidance for creating, editing, and pressure-testing skills
- optional YAML plan status tracking under `docs/tungnt-ai-skills/status/`
- plugin metadata for Claude Code, Codex, GitHub Copilot CLI, Gemini CLI, and Google Antigravity
- a zero-dependency npm installer that copies the package into supported agent plugin directories

The active docs root for plans, specs, investigations, and status files is `docs/tungnt-ai-skills/`.

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
- `docs/tungnt-ai-skills/` active plans and specs root
- `hooks/` session bootstrap and cross-platform hook wrappers
- `installer/` npm installer target map and copy logic
- `bin/tungnt-ai-skills.js` npm executable entrypoint
- `.claude-plugin/`, `.codex-plugin/`, `.agents/`, `.opencode/` harness metadata
- `tests/` regression and installer tests

## Core Workflow

Agents should start with `using-tungnt-ai-skills`, then choose the smallest relevant process skill:

- bug diagnosis, incident tracing, or unfamiliar code exploration: `investigation`
- trivial low-risk changes that can be completed quickly: `quick-dev`
- fuzzy idea or design work: `brainstorming`
- approved design that needs an implementation plan: `writing-plans`
- substantial work that needs isolation: `using-git-worktrees`
- plan execution with subagents: `subagent-driven-development`
- plan execution without subagents: `executing-plans`
- review before handoff: `requesting-code-review`
- final merge, cleanup, or handoff: `finishing-a-development-branch`
- creating or updating reusable skills: `writing-skills`

Domain skills are supporting references, not workflow selectors:

- REST/HTTP contract design evidence: `api-design`
- application security and DevSecOps evidence: `security-and-hardening`
- UI/UX design evidence: `ui-ux-pro-max`

Domain skills must be used inside the selected process workflow. They do not replace `brainstorming`, `writing-plans`, execution, review, investigation, or `writing-skills` gates.

Manual utility skills do not auto-trigger:

- `prompt-leverage` runs only when the user explicitly invokes `skill:prompt-leverage` or asks to improve, upgrade, clarify, template, or apply a raw prompt. `skill:prompt-leverage prompt: <text>` upgrades only; `skill:prompt-leverage apply prompt: <text>` upgrades first, then restarts the normal workflow selection.
- `ba-spec` runs only when the user explicitly invokes `ba-spec`. It creates BA feature-spec Markdown and HTML in the conversation language from business input, Figma links/screenshots, documents, tickets, meeting notes, or change requests. It does not auto-run on install/session start and does not implement production code.
- `figma-to-code` runs only when the user explicitly invokes `figma-to-code`, asks to implement UI code from Figma, or when active `ba-spec` work needs Figma implementation guidance. It does not auto-run for BA-only specs or Figma evidence logs.

Skill calls use the real names from each `SKILL.md` file, not a plugin-prefixed namespace.

Recent workflow additions:

- `prompt-leverage` provides a manual prompt preprocessor for explicit prompt-upgrade requests without changing the normal workflow gates.
- `ba-spec` provides manual BA feature-spec generation in the conversation language with Figma evidence gates and Markdown + HTML packaging.
- `figma-to-code` provides manual Figma-to-frontend-code guidance and can support `ba-spec` only when Figma-related developer implementation guidance is needed.
- `ui-ux-pro-max` provides UI/UX design intelligence as a domain skill; use it inside the normal workflow without replacing `brainstorming`, `writing-plans`, or execution gates.
- `brainstorming` can emit an optional Spec Kernel with goal, users, acceptance criteria, constraints, and out-of-scope items for handoff to `writing-plans`.
- `executing-plans` and `subagent-driven-development` can maintain lightweight YAML status files at `docs/tungnt-ai-skills/status/<plan-name>-status.yaml`.
- `executing-plans` checks for unresolved review continuation items before starting new plan tasks.
- `requesting-code-review` and the subagent code-quality prompt use Blind Hunter, Edge Case Hunter, and Acceptance Auditor lenses with Must-Fix, Should-Fix, Consider, and Praise buckets.
- `finishing-a-development-branch` now validates Definition-of-Done before presenting merge, PR, keep, or discard options.

## Install

### Install Menu

Choose the path that matches your environment:

| Option | Use when | What it does |
| --- | --- | --- |
| [1. NPM/npx installer](#1-npmnpx-installer-recommended) | `npm exec` or `npx` works | Runs the zero-dependency installer. Default mode sets up marketplace metadata and prints follow-up UI/CLI steps. |
| [2. Native installer mode](#2-native-installer-mode) | You want the target agent CLI to run plugin commands | Runs native install or update commands through the installer. |
| [3. Manual setup](#3-manual-setup-when-npmnpx-is-not-available) | `npm exec`/`npx` fails or you need to debug files | Shows the exact files/settings to copy or edit by hand, plus direct CLI commands where available. |

### 1. NPM/npx Installer (Recommended)

```bash
npm exec --yes --package=github:tungnt1405/tungnt-ai-skills-marketplace -- tungnt-ai-skills install
```

Use the NPM installer first when `npm exec` works. It has two modes:

- Default mode imports or registers marketplace metadata that can be written safely, then prints the app/CLI steps for adding the plugin.
- `--native` mode runs the target agent's native plugin commands directly.

Use `install` for first-time setup or to repair marketplace registration. Use `update` when the plugin is already installed and you want the latest version. `--force` replaces file-copy installer targets or rewrites fallback marketplace metadata. For compatibility with older update instructions, `install --native --force` runs native update commands when the target declares them, but `update --native` is the clearer command.

If `npm exec` or `npx` cannot run in your environment, skip the installer and use the manual setup section below.

By default, the NPM installer performs only manual marketplace setup for Claude Code, Codex, and GitHub Copilot CLI. It does not run native plugin commands unless `--native` is passed. The remaining local targets copy the package into their plugin folders.

With no flags, `install` behaves like `--all` and targets Claude Code, Codex, GitHub Copilot CLI, Gemini CLI, and the concrete Antigravity plugin folders.

Install one agent only:

```bash
npm exec --yes --package=github:tungnt1405/tungnt-ai-skills-marketplace -- tungnt-ai-skills install --agent codex
```

### 2. Native Installer Mode

Run native plugin install commands instead of default marketplace metadata setup:

```bash
npm exec --yes --package=github:tungnt1405/tungnt-ai-skills-marketplace -- tungnt-ai-skills install --agent codex --native
```

For Claude Code and GitHub Copilot CLI, native install first registers the marketplace and then installs/enables the plugin. If the marketplace is already registered, the installer treats that as a successful no-op and continues to the plugin install step. For Claude Code, an already-enabled plugin is also treated as a successful no-op.

Run native plugin update commands for an existing install:

```bash
npm exec --yes --package=github:tungnt1405/tungnt-ai-skills-marketplace -- tungnt-ai-skills update --agent copilot --native
npm exec --yes --package=github:tungnt1405/tungnt-ai-skills-marketplace -- tungnt-ai-skills update --agent claude --native
```

Claude Code and GitHub Copilot CLI both expose native `plugin update` commands, so they use the same update shape. For Claude Code, `update --native` runs marketplace update plus plugin update only; `enable` stays on install path. Codex currently exposes marketplace snapshot refresh through `codex plugin marketplace upgrade`; it does not expose a separate `codex plugin update` command in the current CLI. To make Codex native update actually refresh the installed plugin cache, the installer upgrades the marketplace snapshot, removes the installed plugin, then adds it again from the refreshed snapshot.

Older commands that used `install --native --force` still work for native update targets:

```bash
npm exec --yes --package=github:tungnt1405/tungnt-ai-skills-marketplace -- tungnt-ai-skills install --agent copilot --native --force
```

That compatibility form runs Copilot's native update commands instead of trying to add the marketplace again.

Native mode still uses the NPM installer entrypoint. If `npm exec` or `npx` cannot run, use the manual setup section and run the listed native commands directly.

Install all Antigravity layouts:

```bash
npm exec --yes --package=github:tungnt1405/tungnt-ai-skills-marketplace -- tungnt-ai-skills install --agent antigravity-all
```

Supported agent ids:

| Agent id | Target | Native |
| --- | --- | --- |
| `claude` | Claude Code | `install`, `update` |
| `codex` | Codex | `install`, `update` |
| `copilot` | GitHub Copilot CLI | `install`, `update` |
| `gemini` | Gemini CLI | `no` |
| `agy` | Antigravity CLI | `no` |
| `antigravity` | Google Antigravity | `no` |
| `antigravity-ide` | Antigravity IDE | `no` |
| `antigravity-all` | Antigravity CLI and Antigravity IDE | `no`, aggregate target |

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

For Claude Code, Codex, and Copilot, install dry-run prints the manual marketplace files or settings that would be written and the next install/enable commands to run yourself. With `--native`, install dry-run prints the native marketplace install commands that would be executed. Update dry-run prints either the installer refresh command plus any cache/plugin folders that will be cleaned, or the native update commands. Dry-run does not write files.

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
setting.json
```

Bootstrap logic lives in `hooks/session-start`. Installer-managed Claude installs select the hook manifest by OS:

- Windows installs write `hooks/hooks.json` to call `hooks/session-start.cmd`.
- Linux/macOS installs write `hooks/hooks.json` to call `bash "${CLAUDE_PLUGIN_ROOT}/hooks/session-start"`.

Both paths load the same `skills/using-tungnt-ai-skills/SKILL.md` bootstrap content.

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

To update an already installed Claude plugin, run:

```bash
claude plugin marketplace update tungnt-ai-skills-marketplace
claude plugin update tungnt-ai-skills@tungnt-ai-skills-marketplace
```

If the NPM installer works, `--native` runs those Claude CLI commands for you. If `npm exec` or `npx` is unavailable, run the commands directly.

#### Codex

Codex support in this fork is driven by the bundled plugin manifest:

- `.codex-plugin/plugin.json`
- bundled `skills/`
- `.agents/plugins/marketplace.json`

##### Codex Marketplace Setup

[Codex CLI add marketplace](https://developers.openai.com/codex/plugins/build#add-a-marketplace-from-the-cli)

Codex CLI and Codex App use the same marketplace/plugin metadata. Configure the marketplace once, then install from either the CLI command palette or the App UI.

Recommended native CLI setup:

```bash
codex plugin marketplace add tungnt1405/tungnt-ai-skills-marketplace
codex plugin add tungnt-ai-skills@tungnt-ai-skills-marketplace

# codex plugin marketplace add tungnt1405/tungnt-ai-skills-marketplace --ref main
```

If the GitHub marketplace add path fails on Windows with a staging `.git` access error, use a local checkout as the marketplace source:

```bash
git clone https://github.com/tungnt1405/tungnt-ai-skills-marketplace
codex plugin marketplace add ./tungnt-ai-skills-marketplace
codex plugin add tungnt-ai-skills@tungnt-ai-skills-marketplace
```

For the manual local setup used by the installer fallback, copy the plugin folder into the Codex personal plugin directory:

```bash
# copy plugin to the Codex personal plugin directory
mkdir -p ~/.codex/plugins
cp -R $REPO_ROOT/tungnt-ai-skills-marketplace ~/.codex/plugins/tungnt-ai-skills-marketplace
```

The fallback package directory is:

```text
~/.codex/plugins/tungnt-ai-skills-marketplace
```

Add or update the Codex personal marketplace at `~/.agents/plugins/marketplace.json`:

```json
{
  "plugins": [
    {
      "name": "tungnt-ai-skills",
      "source": {
        "source": "local",
        "path": "./.codex/plugins/tungnt-ai-skills-marketplace"
      },
      "policy": {
        "installation": "AVAILABLE",
        "authentication": "ON_INSTALL"
      },
      "category": "Coding"
    }
  ]
}
```

If the file already has plugins, merge the entry into the existing `plugins` array. Codex installs the selected plugin into its cache after you add it:

```text
~/.codex/plugins/cache/<marketplace-name>/tungnt-ai-skills/<version>/
```

The plugin folder copied to `~/.codex/plugins/tungnt-ai-skills-marketplace` must include:

```text
.codex-plugin/plugin.json
assets/
skills/
setting.json
```

The root `.agents/plugins/marketplace.json` in this repository is the repo marketplace used when this repository is added directly:

```json
{
  "name": "tungnt-ai-skills-marketplace",
  "interface": {
    "displayName": "Tungnt AI Skills"
  },
  "plugins": [
    {
      "name": "tungnt-ai-skills",
      "source": {
        "source": "url",
        "url": "https://github.com/tungnt1405/tungnt-ai-skills-marketplace.git",
        "ref": "main"
      },
      "policy": {
        "installation": "AVAILABLE",
        "authentication": "ON_INSTALL"
      },
      "category": "Coding"
    }
  ]
}
```

The personal marketplace entry and repo marketplace entry are intentionally different:

```text
personal manual setup: source.local path -> ./.codex/plugins/tungnt-ai-skills-marketplace
repo/native setup: source.url -> GitHub repository
```
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
codex plugin add tungnt-ai-skills@tungnt-ai-skills-marketplace
```

To refresh Codex's marketplace snapshot later, run:

```bash
codex plugin marketplace upgrade tungnt-ai-skills-marketplace
codex plugin remove tungnt-ai-skills@tungnt-ai-skills-marketplace
codex plugin add tungnt-ai-skills@tungnt-ai-skills-marketplace
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
cp -R plugin.json setting.json hooks skills ~/.gemini/antigravity-cli/plugins/tungnt-ai-skills/
cp hooks/hooks.antigravity.unix.json ~/.gemini/antigravity-cli/plugins/tungnt-ai-skills/hooks.json
# On Windows, copy hooks/hooks.antigravity.windows.json instead.
```

Install Antigravity IDE:

```bash
mkdir -p ~/.gemini/config/plugins/tungnt-ai-skills
cp -R plugin.json setting.json hooks skills ~/.gemini/config/plugins/tungnt-ai-skills/
cp hooks/hooks.antigravity.unix.json ~/.gemini/config/plugins/tungnt-ai-skills/hooks.json
# On Windows, copy hooks/hooks.antigravity.windows.json instead.
```

Copy the shared global files used by both layouts:

```bash
cp AGENTS.md CLAUDE.md GEMINI.md gemini-extension.json ~/.gemini/
```

Restart Antigravity CLI or Antigravity IDE after copying files, then open `/plugins` and verify `tungnt-ai-skills`.

The root `plugin.json`, `setting.json`, generated root `hooks.json`, `hooks/`, and `skills/` directory are the Antigravity plugin payload. The Antigravity hook uses `PreInvocation` to inject `using-tungnt-ai-skills` once at session start. The root `skills/` directory remains the single source of truth; no Antigravity-specific skills are duplicated.

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

The Copilot plugin uses the root `plugin.json` manifest. That manifest exposes bundled skills through `skills/` and points Copilot at the Copilot-native hook manifest:

```text
hooks/hooks-copilot.json
```

Copilot discovers `hooks/hooks-copilot.json` in the installed plugin. This file uses Copilot's `sessionStart` hook shape to run `hooks/session-start`, which injects `skills/using-tungnt-ai-skills/SKILL.md` as session context.

The Copilot hook command must resolve the installed plugin root, not the user's active workspace. The manifests first use a Copilot-provided `COPILOT_PLUGIN_ROOT` when available, then a test override `TUNGNT_AI_SKILLS_PLUGIN_ROOT`, then the standard installed plugin path under the current user's home directory. Do not hardcode a machine-specific path such as `C:\Users\<name>`.

Then choose the path that matches how you use Copilot:

Copilot app (VSCODE):

1. Open GitHub Copilot Chat (VSCODE).
2. Open the Plugins tab.
3. Click button `Install Plugin from Source`
4. Input `tungnt1405/tungnt-ai-skills-marketplace`
5. Click `trust` to install


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

- Update an installed plugin:

```bash
copilot plugin marketplace update tungnt-ai-skills-marketplace
copilot plugin update tungnt-ai-skills@tungnt-ai-skills-marketplace
```

If Copilot logs show this error, the plugin was installed but the bootstrap hook did not reach the script:

```text
Hook from "tungnt-ai-skills@tungnt-ai-skills-marketplace" execution failed
.\hooks\session-start.ps1 is not recognized
```

Update the plugin, restart Copilot, and confirm the hook command no longer resolves from the workspace cwd.

After installing or updating, restart Copilot and run this clean-session acceptance prompt:

```text
Let's make a react todo list
```

A working integration loads `using-tungnt-ai-skills` at session start and selects `brainstorming` before writing code.

## Update

Use `update` for an existing install:

```bash
npm exec --yes --package=github:tungnt1405/tungnt-ai-skills-marketplace -- tungnt-ai-skills update
```

Update one agent only:

```bash
npm exec --yes --package=github:tungnt1405/tungnt-ai-skills-marketplace -- tungnt-ai-skills update --agent copilot --native
```

Update behavior depends on the target:

- Claude Code: `update --native` runs marketplace update, then plugin update. Enable stays on install path only.
- GitHub Copilot CLI: `update --native` runs marketplace update, then plugin update.
- Codex: `update --native` refreshes the configured marketplace snapshot, removes the installed plugin, then adds it again from the refreshed snapshot because current Codex CLI does not expose a plugin update command.
- File-copy targets such as Gemini and Antigravity: `update` refreshes the installed files the same way `install --force` did before.
- Default Claude/Codex/Copilot fallback paths first remove the installer-managed cache/plugin folder for that agent, then refresh local marketplace files/settings and print the manual app/CLI steps when a native plugin update is still needed. This cleans stale skill payloads without clearing the global `npm`/`npx` cache.

If you are updating this local source checkout first, pull the latest repository changes, then rerun the installer:

```bash
git pull
npm exec --yes --package=github:tungnt1405/tungnt-ai-skills-marketplace -- tungnt-ai-skills update --agent copilot --native
```

Restart or reload the target agent after updating so it reads the new plugin files.

## Manual Harness Notes

For direct file-copy installs, use the NPM installer above. Manual setup should only be needed for debugging or for harnesses not covered by the installer or marketplace flows.

Every manual integration has the same requirements:

- load `skills/using-tungnt-ai-skills/SKILL.md` automatically at session start
- expose the bundled `skills/` directory to the harness
- use `docs/tungnt-ai-skills/` as the canonical docs root
- keep skill invocations using the names declared in each `SKILL.md`

Harness-specific metadata in this repo:

- Claude Code: `.claude-plugin/plugin.json`
- Codex: `.codex-plugin/plugin.json`, `.agents/plugins/marketplace.json`
- GitHub Copilot CLI: `plugin.json`, `hooks/hooks-copilot.json`
- Gemini CLI: `gemini-extension.json`
- Google Antigravity: `.agents/plugins/tungnt-ai-skills-marketplace/plugin.json`, `plugin.json`
- OpenCode: `.opencode/plugins/`

Additional notes:

- Antigravity: [docs/README.antigravity.md](docs/README.antigravity.md)
- OpenCode: [docs/README.opencode.md](docs/README.opencode.md)

## Development

Run installer tests:

```bash
npm run test:installer
```

Run skill content regression tests:

```bash
npm run test:skills
```

The package is intentionally dependency-free. Do not add third-party runtime dependencies unless the project requirements change explicitly.

Before opening a PR, read [CLAUDE.md](CLAUDE.md). This fork has strict contributor rules around real problem statements, duplicate PR checks, complete PR templates, and human review of the full diff.

## License

This fork is distributed under the MIT License. See [LICENSE](LICENSE) for the current copyright notice and terms.
