# RELEASE-NOTES

## Purpose

`tungnt-ai-skills` is a fork of `obra/superpowers` customized for my own coding-agent workflow.

This file explains:

- how to install the fork for supported agents
- how the bootstrap works
- which skills to use in which situations
- which paths and compatibility namespaces are intentional

## Core Rules

Start every session with the bootstrap:

- `using-tungnt-ai-skills`

The bootstrap decides which skill or collection to use next.

This fork currently uses the root `skills/` workflow collection for workflow and execution skills.

## Latest Changes

### 2026-06-08 Workflow Expansion

- Added `investigation` for evidence-graded debugging, incident tracing, and unfamiliar code exploration before fixes.
- Added `quick-dev` for trivial, low-risk changes that fit a strict fast-path scope gate.
- Added `ui-ux-pro-max` to the documented workflow as the UI/UX design intelligence domain skill.
- Added `writing-skills` for creating, editing, and pressure-testing reusable skills.
- Added optional YAML plan status tracking at `docs/superpowers/status/<plan-name>-status.yaml` for `executing-plans` and `subagent-driven-development`.
- Added review continuation awareness so resumed plan execution prioritizes unresolved review feedback before new tasks.
- Added parallel review lenses: Blind Hunter, Edge Case Hunter, and Acceptance Auditor, with Must-Fix, Should-Fix, Consider, and Praise triage.
- Added optional Spec Kernel output in `brainstorming` for clearer handoff into `writing-plans`.
- Added Definition-of-Done validation in `finishing-a-development-branch` before merge, PR, keep, or discard options.
- Added `npm run test:skills` for dependency-free skill content regression checks.

## Skill Naming

Use the actual skill names defined in each `SKILL.md`.

Examples:

- `investigation`
- `quick-dev`
- `brainstorming`
- `ui-ux-pro-max`
- `writing-skills`
- `writing-plans`
- `using-git-worktrees`
- `subagent-driven-development`
- `executing-plans`
- `requesting-code-review`
- `finishing-a-development-branch`

Do not assume a plugin-prefixed call style like `tungnt-ai-skills:writing-plans`.

## Recommended Workflow

### When investigating a bug or unfamiliar code

Use:

- `investigation`

When:

- a bug, stack trace, failing test, or suspicious behavior needs diagnosis
- you need evidence-graded findings before choosing a fix
- you need to map an unfamiliar code path before changing behavior

### When making a small low-risk change

Use:

- `quick-dev`

When:

- the intent is clear without design exploration
- the change is expected to take under 30 minutes
- the change usually touches 1-2 non-test/non-doc files

Escalate out to `brainstorming` then `writing-plans` when scope, ambiguity, or risk grows.

### When starting from an idea

Use:

- `using-tungnt-ai-skills`
- `brainstorming`

When:

- the task is vague
- the user wants options or tradeoffs
- architecture or scope is still unclear

Current handoff:

- `brainstorming` may include a Spec Kernel with goal, users, acceptance criteria, constraints, and out-of-scope items.

### When working on UI/UX

Use:

- `ui-ux-pro-max`

When:

- designing, reviewing, or improving UI/UX for a web or mobile application
- you need evidence for visual direction, color, typography, layout, UX guidelines, charts, or stack-specific UI choices

Important:

- `ui-ux-pro-max` is a domain skill, not a process replacement
- keep the normal order: `brainstorming` for design approval, `writing-plans` for implementation planning, then execution/review skills

### When the design is approved

Use:

- `writing-plans`

When:

- requirements are already known
- a multi-step implementation needs structure
- you want explicit tasks, tests, and file targets

### Before implementation in an isolated workspace

Use:

- `using-git-worktrees`

When:

- the task will touch multiple files
- you want to protect the current branch
- the harness does not already provide isolation

Canonical worktree path:

- `~/.config/tungnt-ai-skills/worktrees/`

Legacy compatibility path still recognized:

- `~/.config/superpowers/worktrees/`

### When implementing the plan

Use:

- `subagent-driven-development`

When:

- the harness supports subagents
- you want one task at a time with review loops
- you want the highest-quality execution path

Fallback:

- `executing-plans`

Use that when:

- subagents are unavailable
- you need inline execution in one session

Current tracking:

- multi-task plans may maintain `docs/superpowers/status/<plan-name>-status.yaml`
- resumed `executing-plans` sessions should check unresolved review continuation items before starting new plan tasks

### During review and completion

Use:

- `requesting-code-review`
- `finishing-a-development-branch`

When:

- implementation is done
- you want structured review before merge or handoff
- you need cleanup of a skill-owned worktree

Current review and completion gates:

- code review uses Blind Hunter, Edge Case Hunter, and Acceptance Auditor lenses
- findings are triaged as Must-Fix, Should-Fix, Consider, or Praise
- branch finishing validates Definition-of-Done before presenting completion options

## Docs And Runtime Namespaces

Some names remain intentionally legacy for compatibility.

### Active legacy docs root

Current docs root:

- `docs/superpowers/`

This is intentional. New plans/specs still use that location unless you migrate the repo in a coordinated way.

### Brainstorm companion runtime directory

Current runtime directory:

- `.superpowers/brainstorm/`

This is also intentional compatibility behavior for now.

## Installation By Agent

### Claude Code

Use the repository hook/bootstrap files from this repo.

Important files:

- `hooks/session-start`
- `hooks/run-hook.cmd`
- `skills/using-tungnt-ai-skills/SKILL.md`

Requirement:

- the session must load `using-tungnt-ai-skills` automatically at session start

### Codex

Use the plugin manifest and bundled skills from this repo.

Important files:

- `.codex-plugin/plugin.json`
- `skills/`

Requirement:

- the plugin/package name should be `tungnt-ai-skills`
- skill calls should use the real skill names, not prefixed aliases

### OpenCode

Use the OpenCode plugin entrypoint from this repo.

Important files:

- `.opencode/plugins/tungnt-ai-skills.js`
- `.opencode/plugins/superpowers.js` as compatibility wrapper
- `.opencode/INSTALL.md`

Recommended plugin spec:

```json
{
  "plugin": ["tungnt-ai-skills@git+https://github.com/tungnt1405/tungnt-ai-skills-marketplace"]
}
```

### Gemini

Use:

- `GEMINI.md`
- `gemini-extension.json`

Requirement:

- extension naming and bootstrap path must point to `using-tungnt-ai-skills`

## Minimal Configuration Checklist

- bootstrap path exists at `skills/using-tungnt-ai-skills/SKILL.md`
- harness loads the bootstrap automatically at session start
- bundled skills directory is discoverable by the harness
- skill references use actual skill names
- docs compatibility paths are not “cleaned up” accidentally

## When To Use Which Skill

### `brainstorming`

Use when:

- requirements are unclear
- you need alternatives
- you need a spec before coding

May emit:

- Spec Kernel for handoff to `writing-plans`

### `ui-ux-pro-max`

Use when:

- building, designing, reviewing, or improving UI/UX for web or mobile applications
- the work needs design-system evidence, style direction, color palettes, font pairings, UX guidelines, chart guidance, or stack-specific UI recommendations

Does not replace:

- `brainstorming`
- `writing-plans`
- execution or review skills

### `investigation`

Use when:

- diagnosing bugs, incidents, failing tests, or unfamiliar code paths
- you need Confirmed, Deduced, and Hypothesized findings separated clearly

### `quick-dev`

Use when:

- a change is small, clear, low risk, and expected to touch only 1-2 non-test/non-doc files

### `writing-plans`

Use when:

- a spec already exists
- the work is multi-step
- you need explicit TDD-oriented execution steps

### `using-git-worktrees`

Use when:

- you need isolation
- the branch should stay clean
- the harness does not already manage worktrees

### `subagent-driven-development`

Use when:

- subagents are available
- quality matters more than raw speed
- the plan is ready to execute task by task

### `executing-plans`

Use when:

- subagents are unavailable
- you still want the plan executed in a structured way

Supports:

- optional YAML status tracking
- review continuation checks on resumed work

### `requesting-code-review`

Use when:

- a change is ready for review
- you want findings before merge or handoff

Uses:

- Blind Hunter
- Edge Case Hunter
- Acceptance Auditor

### `finishing-a-development-branch`

Use when:

- implementation and review are complete
- you need final verification, merge choice, or worktree cleanup

Requires:

- Definition-of-Done validation before completion options

### `writing-skills`

Use when:

- creating new skills
- editing existing skills
- verifying skill behavior before deployment

## Notes For Maintaining The Fork

- Keep upstream attribution where it explains origin or compatibility.
- Do not reintroduce `using-superpowers` as the active bootstrap path.
- Do not rewrite `docs/superpowers/` unless the whole repo migrates together.
- Do not mix real skill names with fake plugin-prefixed aliases in tests or docs.
