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

## Installation Notes

This fork is not documented as an official upstream marketplace release. Install and test it from this repository according to the harness you are working on.

- Claude/Codex/Cursor/Copilot bootstrap is driven by the files in `hooks/` and `.codex-plugin/`
- OpenCode uses the plugin entrypoints in `.opencode/plugins/`
- Gemini uses `GEMINI.md` and `gemini-extension.json`

If you adapt this fork for another harness, make sure the session bootstrap loads `skills/using-tungnt-ai-skills/SKILL.md` automatically at session start.

## Contributing To This Fork

This is a maintained fork, not the upstream project.

- fork-specific branding or workflow changes belong here, not upstream
- if you plan to contribute upstream, strip fork-specific behavior first
- read [CLAUDE.md](CLAUDE.md) before changing skills, hooks, or harness integration
- use `writing-skills` when changing behavior-shaping skill content

## License

This fork is distributed under the MIT License. See [LICENSE](LICENSE) for the current copyright notice and terms.
