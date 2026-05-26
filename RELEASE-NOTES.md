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

The bootstrap decides which skill family to use next.

This fork currently uses:

- `SPS` for workflow and execution skills
- `CXT7` for context-oriented material
- `API` for API guidance
- `AUTH_SECURITY` for auth and security guidance

## Skill Naming

Use the actual skill names defined in each `SKILL.md`.

Examples:

- `brainstorming`
- `writing-plans`
- `using-git-worktrees`
- `subagent-driven-development`
- `executing-plans`
- `requesting-code-review`
- `finishing-a-development-branch`

Do not assume a plugin-prefixed call style like `tungnt-ai-skills:writing-plans`.

## Recommended Workflow

### When starting from an idea

Use:

- `using-tungnt-ai-skills`
- `brainstorming`

When:

- the task is vague
- the user wants options or tradeoffs
- architecture or scope is still unclear

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

### During review and completion

Use:

- `requesting-code-review`
- `finishing-a-development-branch`

When:

- implementation is done
- you want structured review before merge or handoff
- you need cleanup of a skill-owned worktree

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
  "plugin": ["tungnt-ai-skills@git+https://github.com/tungnt1405/ai-skills.git"]
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

### `requesting-code-review`

Use when:

- a change is ready for review
- you want findings before merge or handoff

### `finishing-a-development-branch`

Use when:

- implementation and review are complete
- you need final verification, merge choice, or worktree cleanup

## Notes For Maintaining The Fork

- Keep upstream attribution where it explains origin or compatibility.
- Do not reintroduce `using-superpowers` as the active bootstrap path.
- Do not rewrite `docs/superpowers/` unless the whole repo migrates together.
- Do not mix real skill names with fake plugin-prefixed aliases in tests or docs.
