# tungnt-ai-skills

`tungnt-ai-skills` is a personal fork of [obra/superpowers](https://github.com/obra/superpowers) with custom bootstrap rules, curated skill families, fork-specific plugin metadata, and local workflow adjustments for my own agent setup.

## Fork Origin

This repository is based on the upstream `Superpowers` project and keeps that origin visible where attribution or compatibility matters.

- Upstream project: `obra/superpowers`
- Fork identity in this repo: `tungnt-ai-skills`
- Current license: MIT, see [LICENSE](LICENSE)

Some internal compatibility paths still intentionally keep the old namespace:

- `docs/superpowers/` is the current docs root for plans and specs
- some legacy compatibility assets still mention `superpowers` where a harness or migration path expects it

Those legacy names are compatibility details, not the primary branding of this fork.

## What Is Different In This Fork

- bootstrap skill is `using-tungnt-ai-skills`
- workflow skills are curated under `skills/`
- plugin/package metadata is forked to `tungnt-ai-skills`
- contributor docs and harness bootstrap rules are adjusted for this repo’s structure

## Repository Layout

- `skills/using-tungnt-ai-skills/` bootstrap skill and platform references
- `skills/` workflow skills forked and curated from the upstream system
- `docs/superpowers/` active plans/specs root kept for compatibility
- `hooks/` session bootstrap and cross-platform hook wrappers
- `.codex-plugin/` Codex plugin manifest for this fork
- `.opencode/plugins/` OpenCode plugin entrypoints
- `tests/` regression, harness, and integration tests

## Core Workflow

The intended flow is still derived from Superpowers, but this fork uses its own bootstrap and layout:

1. Start with `using-tungnt-ai-skills`
2. Choose the relevant collection, usually the root workflow skills in `skills/`
3. Use `brainstorming` for design work
4. Use `writing-plans` for implementation planning
5. Use `using-git-worktrees` before isolated execution when needed
6. Use `subagent-driven-development` or `executing-plans` to implement
7. Use `requesting-code-review` and `finishing-a-development-branch` to review and close out work

Skill calls in this repo use the skill names defined in each `SKILL.md` file, for example `brainstorming`, `writing-plans`, `subagent-driven-development`, not a plugin-prefixed namespace.

## Basic Workflow

This fork keeps the same general workflow shape as upstream Superpowers, but maps it to the fork's current bootstrap and skill layout.

### 1. Start with the bootstrap

Use `using-tungnt-ai-skills` first.

This skill tells the agent:

- which skill collection to inspect
- which repository layout rules are active in this fork
- which legacy paths are intentional compatibility paths

### 2. If the task is still vague, use `brainstorming`

Use `brainstorming` when:

- the feature idea is rough
- scope is unclear
- you need tradeoffs or architecture options
- you want a design/spec before writing code

Expected outcome:

- a clarified approach
- a design that the user can review
- a spec saved under the current docs root, which is still `docs/superpowers/`

### 3. Once the design is approved, use `writing-plans`

Use `writing-plans` when:

- the requirements are known
- the work is multi-step
- you want a task-by-task implementation plan with test guidance

Expected outcome:

- a concrete implementation plan
- exact file targets
- test and verification steps

### 4. Before implementation, decide whether isolation is needed

Use `using-git-worktrees` when:

- the change is substantial
- you want to protect the current branch
- the harness is not already managing isolation for you

Expected outcome:

- either a worktree under the fork's preferred pathing
- or confirmation that the current harness already provides isolation

### 5. Execute the plan using the right implementation mode

Prefer `subagent-driven-development` when:

- subagents are available
- quality and review loops matter
- the work should proceed task by task

Use `executing-plans` when:

- subagents are unavailable
- you still want structured execution in a single session

### 6. Review and finish cleanly

Use `requesting-code-review` when:

- implementation is done
- you want findings before merge or handoff

Use `finishing-a-development-branch` when:

- the work is complete
- tests and final verification should run
- a skill-owned worktree may need cleanup

## Picking The Right Skill

Use this quick selector:

- Idea is fuzzy: `brainstorming`
- Design is approved and needs an implementation plan: `writing-plans`
- You need workspace isolation: `using-git-worktrees`
- You want highest-quality implementation with subagents: `subagent-driven-development`
- You need inline structured execution without subagents: `executing-plans`
- You want a focused review before finishing: `requesting-code-review`
- You are wrapping up and deciding merge/cleanup: `finishing-a-development-branch`

## Installation

The npm installer copies this package into the default plugin locations for all currently supported agents:

```bash
npx tungnt-ai-skills install
```

With no flags, `install` behaves like `--all` and targets Claude Code, Codex, GitHub Copilot CLI, Gemini CLI, and Google Antigravity.

Install one agent only:

```bash
npx tungnt-ai-skills install --agent codex
```

Preview without writing files:

```bash
npx tungnt-ai-skills install --agent codex --dry-run
```

List supported agents and resolved target directories:

```bash
npx tungnt-ai-skills targets
```

If a target directory already exists, the installer stops before replacing it. Use `--force` to replace an existing install:

```bash
npx tungnt-ai-skills install --agent codex --force
```

The manual sections below are fallback details for debugging or wiring a harness directly.

For every harness, the goal is the same:

- load `skills/using-tungnt-ai-skills/SKILL.md` automatically at session start
- make the bundled `skills/` directory discoverable
- keep skill calls using the real skill names from each `SKILL.md`

### Claude Code

This repo includes both a Claude plugin manifest and a local development marketplace.

#### Local Dev Marketplace

- Register the marketplace from this repo:

```bash
/plugin marketplace add ./.claude-plugin/marketplace.json
```

- Install the fork from that marketplace:

```bash
/plugin install tungnt-ai-skills@tungnt-ai-skills-marketplace
```

#### Direct Manifest

If you are wiring it manually, the main Claude artifacts are:

- `.claude-plugin/plugin.json`
- `hooks/session-start`
- `hooks/run-hook.cmd`
- `skills/using-tungnt-ai-skills/SKILL.md`

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

For a manual local setup, copy the plugin folder into `~/.codex/tmp/plugins`:

```bash
# get root marketplace to get path of marketplace installed
codex plugin marketplace list

# copy plugin to the local marketplace plugins directory
cp -R $REPO_ROOT/tungnt-ai-skills-marketplace ~/.codex/tmp/plugins/plugins
```

Add or update `~/.codex/tmp/plugins/.agents/plugins/marketplace.json`:

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
copilot plugin marketplace add tungnt1405/ai-skills
```

- Install the plugin:

```bash
copilot plugin install tungnt-ai-skills@tungnt-ai-skills-marketplace
```

### Other harnesses

If you adapt this fork to another agent or IDE:

- inject the bootstrap from `skills/using-tungnt-ai-skills/SKILL.md`
- expose the `skills/` directory to the harness
- preserve the fork's compatibility paths such as `docs/superpowers/` unless you migrate the repo consistently

## Usage Notes

- Start with `using-tungnt-ai-skills`
- Use `brainstorming` for vague ideas and design work
- Use `writing-plans` once the design is approved
- Use `using-git-worktrees` before isolated implementation when needed
- Prefer `subagent-driven-development` when subagents are available
- Use `executing-plans` when subagents are unavailable
- Finish with `requesting-code-review` and `finishing-a-development-branch`

Detailed operating notes are in [RELEASE-NOTES.md](E:/tungnt.it/my_works/2026/05/ai-agent/RELEASE-NOTES.md).

## Contributing To This Fork

This is a maintained fork, not the upstream project.

- fork-specific branding or workflow changes belong here, not upstream
- if you plan to contribute upstream, strip fork-specific behavior first
- read [CLAUDE.md](CLAUDE.md) before changing skills, hooks, or harness integration
- use `writing-skills` when changing behavior-shaping skill content

## License

This fork is distributed under the MIT License. See [LICENSE](LICENSE) for the current copyright notice and terms.
