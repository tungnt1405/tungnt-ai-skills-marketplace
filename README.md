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
- workflow skills are curated under `skills/SPS/`
- additional families live under `skills/CXT7/`, `skills/API/`, and `skills/AUTH_SECURITY/`
- plugin/package metadata is forked to `tungnt-ai-skills`
- contributor docs and harness bootstrap rules are adjusted for this repo’s structure

## Repository Layout

- `skills/using-tungnt-ai-skills/` bootstrap skill and platform references
- `skills/SPS/` workflow skills forked and curated from the upstream system
- `skills/CXT7/`, `skills/API/`, `skills/AUTH_SECURITY/` fork-specific additional families
- `docs/superpowers/` active plans/specs root kept for compatibility
- `hooks/` session bootstrap and cross-platform hook wrappers
- `.codex-plugin/` Codex plugin manifest for this fork
- `.opencode/plugins/` OpenCode plugin entrypoints
- `tests/` regression, harness, and integration tests

## Core Workflow

The intended flow is still derived from Superpowers, but this fork uses its own bootstrap and layout:

1. Start with `using-tungnt-ai-skills`
2. Choose the relevant family, usually `SPS`
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

- which skill family to inspect
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

Installation differs by harness. If you use more than one, install `tungnt-ai-skills` separately for each one.

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
/plugin install tungnt-ai-skills@tungnt-dev
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

If your Codex environment supports plugin search/installation UI, install `tungnt-ai-skills` there when published. For local/manual setup, use the manifest in this repo.

The plugin/package name is:

```text
tungnt-ai-skills
```

### OpenCode

OpenCode uses its own plugin install.

- Add this plugin entry to `opencode.json`:

```json
{
  "plugin": ["tungnt-ai-skills@git+https://github.com/tungnt1405/ai-skills.git"]
}
```

Main entrypoint:

- `.opencode/plugins/tungnt-ai-skills.js`

Compatibility wrapper retained:

- `.opencode/plugins/superpowers.js`

Detailed OpenCode notes:

- `.opencode/INSTALL.md`
- `docs/README.opencode.md`

### Cursor

Cursor support in this fork is described by:

- `.cursor-plugin/plugin.json`

If your Cursor environment supports plugin import from a local repo or manifest, use that file and keep the repo's `skills/`, `hooks/`, and related plugin assets together.

### Gemini

- Install the extension from this fork's repository:

```bash
gemini extensions install https://github.com/tungnt1405/ai-skills.git
```

- Update later:

```bash
gemini extensions update tungnt-ai-skills
```

Main Gemini files:

- `GEMINI.md`
- `gemini-extension.json`

The extension/bootstrap configuration must point to `using-tungnt-ai-skills`.

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
