---
name: using-tungnt-ai-skills
description: Use when starting any conversation to load the bootstrap rules for this fork and decide which skill or collection to use first
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

This fork is a curated workflow skillset with its own structure and naming.

- `using-tungnt-ai-skills`
  Purpose: bootstrap skill. Read this first, then use the right skill for the task.
- `investigation`
  Purpose: evidence-graded debugging, incident tracing, and code-area exploration before fixes or plans.
- `quick-dev`
  Purpose: fast path for trivial, low-risk code changes that do not justify the full brainstorming and planning pipeline.
- `ui-ux-pro-max`
  Purpose: design intelligence for UI/UX work. Use during UI design, review, or implementation to query design databases and generate design-system evidence. This is a domain skill, not a process skill.
- `owner-skill-sync-updater`
  Purpose: owner-only workflow for inspecting, comparing, and syncing external skills repositories without bypassing this fork's trigger order.

Treat the workflow skills at the root of `skills/` as the main collection for this fork. Pick the matching skill instead of assuming everything follows one legacy grouping.

## Repository Layout

Use the actual folder layout in this repo when choosing files or giving instructions:

- `skills/using-tungnt-ai-skills/`
  Bootstrap skill and platform references for this fork.
- `skills/`
  Root location for the fork's workflow skills such as `brainstorming`, `writing-plans`, `using-git-worktrees`, `ui-ux-pro-max`, and related execution/review skills.
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

Invoke relevant or requested skills before any meaningful response or action, including exploratory steps when a skill collection clearly applies.

Examples:

- Planning or decomposition work: check the root workflow skills in `skills/`
- Brainstorming or structured ideation: check the root workflow skills in `skills/`

If no skill clearly applies, continue normally.

## Recommended Selection Order

When multiple skills may apply, use this order:

1. Bootstrap with `using-tungnt-ai-skills`
2. Choose a process skill that determines approach and gates
3. Choose a domain skill that supplies evidence, constraints, or implementation guidance inside that process

Examples:

- "Design an endpoint"
  First check the most relevant workflow skill, then `writing-plans` if the work is multi-step.
- "Plan a feature"
  First check `writing-plans`.
- "Brainstorm a solution"
  First check `brainstorming`.
- "Investigate why this fails" / "trace this bug" / "explain this unfamiliar code path"
  Use `investigation` before proposing fixes.
- "Make this tiny fix" / "small tweak in one file"
  Use `quick-dev` only when its scope gate is satisfied. If the work is creative, ambiguous, or changes broader behavior, `brainstorming` remains mandatory before `writing-plans`.
- "Build a landing page" / "Design a dashboard UI" / "Improve the UI/UX"
  Use `brainstorming` for requirement discovery and design approval when the work is creative or changes behavior. During that design work, use `ui-ux-pro-max` to generate UI/UX evidence and design-system recommendations. Do not let `ui-ux-pro-max` replace the brainstorming gate or change the next step from `writing-plans`.
- "Add skills from this repo" / "sync skills from upstream" / "compare Superpowers updates"
  Use `owner-skill-sync-updater` after the normal bootstrap/process skill selection. It classifies external repos before dry-run/apply so upstream workflow sources do not overwrite local trigger logic.

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
- the root `skills/` workflow collection for the forked planning/execution/review skills
