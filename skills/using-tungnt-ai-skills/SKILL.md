---
name: using-tungnt-ai-skills
description: Use when starting any conversation to load the bootstrap rules for this fork and decide which skill family to use first
---

<SUBAGENT-STOP>
If you were dispatched as a subagent to execute a specific task, skip this skill.
</SUBAGENT-STOP>

<EXTREMELY-IMPORTANT>
If you think there is even a 1% chance a skill in this repo might apply, you MUST invoke the relevant skill before responding or taking action.

If a skill applies, use it. Do not rely on memory of older workflow copies from before this fork.
</EXTREMELY-IMPORTANT>

## Instruction Priority

These skills guide workflow, but user instructions still win:

1. User instructions in the current conversation or repo docs
2. `tungnt-ai-skills` skills
3. Default assistant behavior

If a local project instruction conflicts with a skill, follow the project instruction.

## What This Fork Contains

This fork is a curated mixed skillset with its own structure and naming.

- `using-tungnt-ai-skills`
  Purpose: bootstrap skill. Read this first, then use the right skill for the task.
- `SPS`
  Purpose: selected workflow skills curated for this fork.
- `CXT7`
  Purpose: context-oriented material gathered from Context7-related workflows.
- `API`
  Purpose: API design and implementation guidance maintained in this fork.
- `AUTH_SECURITY`
  Purpose: authentication and security guidance maintained in this fork.

Treat `SPS`, `CXT7`, `API`, and `AUTH_SECURITY` as separate skill families. Pick the family that matches the task instead of assuming everything follows one legacy collection.

## Repository Layout

Use the actual folder layout in this repo when choosing files or giving instructions:

- `skills/using-tungnt-ai-skills/`
  Bootstrap skill and platform references for this fork.
- `skills/SPS/`
  Curated workflow skills carried by this fork.
- `docs/superpowers/`
  Current docs root for legacy plans and specs. The folder name is legacy, but the content belongs to `tungnt-ai-skills`.
- `tests/`
  Regression and integration tests for the forked skill behavior.

Do not invent `skills/using-superpowers/` paths in this repo. Use `skills/using-tungnt-ai-skills/` instead.

## How to Access Skills

In Claude Code, use the `Skill` tool.

In Copilot CLI, use the `skill` tool.

In Gemini CLI, use the `activate_skill` tool.

In other environments, use the platform's documented skill-loading mechanism.

## Platform Adaptation

Some skills use Claude Code tool names in their instructions. For platform-specific tool mapping:

- Copilot CLI: `references/copilot-tools.md`
- Codex: `references/codex-tools.md`
- Gemini CLI: `references/gemini-tools.md`

## The Rule

Invoke relevant or requested skills before any meaningful response or action, including exploratory steps when a skill family clearly applies.

Examples:

- Planning or decomposition work: check `SPS`
- Brainstorming or structured ideation: check `SPS`
- API design/versioning/pagination/rate limiting: check `API`
- Auth or security concerns: check `AUTH_SECURITY`
- Context-oriented retrieval or repo understanding workflows tied to your curated set: check `CXT7`

If no skill clearly applies, continue normally.

## Recommended Selection Order

When multiple skills may apply, use this order:

1. Bootstrap with `using-tungnt-ai-skills`
2. Choose a process skill that determines approach
3. Choose a domain skill that guides implementation

Examples:

- "Design an endpoint"
  First check `API`, then any `SPS` planning skill if the work is multi-step.
- "Plan a feature"
  First check `SPS/writing-plans`.
- "Brainstorm a solution"
  First check `SPS/brainstorming`.
- "Review auth flow"
  First check `AUTH_SECURITY`.

## Red Flags

These usually mean you are skipping the repo's workflow discipline:

- "This is simple, I do not need a skill"
- "I will inspect files first and decide later"
- "I remember how an older version handled this"
- "The folder name looks close enough"

Stop and load the matching current skill instead.

## Naming Notes

Do not refer to this fork using any older upstream branding in new instructions, summaries, or injected session guidance.

Use these names instead:

- `tungnt-ai-skills` for the overall fork
- `SPS` for the curated SPS collection
- `CXT7` for the Context7-derived collection
- `API` and `AUTH_SECURITY` for your original collections
