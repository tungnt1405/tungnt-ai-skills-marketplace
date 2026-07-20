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

## Project Settings Compliance

Before taking actions, read `tais/setting.json` at the project root (fallback: `setting.json` at plugin root) and respect its `policy` values. The template is `setting.template.json`.

| Key | Effect |
| --- | --- |
| `policy.autoCommit` | When `false`: do not auto-commit — leave changes for the user. |
| `policy.autoTest` | When `false`: do not auto-run tests unless the user asks. |
| `policy.dangerousCommands.blocked` | Never execute commands in this list. |
| `policy.dangerousCommands.askConfirmation` | When `true`: ask the user before running any destructive command. |
| `policy.sensitiveFiles.blocked` | Do not read or write files matching these patterns. |
| `policy.sensitiveFiles.askConfirmation` | When `true`: ask the user before touching sensitive files. |
| `policy.installAndUpdate.askUser` | When `true`: ask the user before installing or updating dependencies. |

**Rules:**
- Resolve settings in this order:
  1. `tais/setting.json` in current workspace
  2. plugin `setting.json`
  3. safe defaults if missing/invalid
- Read `setting.json` once at the start of work.
- Never mutate `setting.json` unless the user explicitly asks.
- Pass relevant policy values to subagents when dispatching them (they skip bootstrap).

## What This Fork Contains

This fork is a curated workflow skillset with its own structure and naming.

### Process Skills

Process skills choose the workflow and enforce gates. Exactly one process path should lead the work before any domain skill is used:

- `using-tungnt-ai-skills`
  Purpose: bootstrap skill. Read this first, then use the right skill for the task.
- `investigation`
  Purpose: evidence-graded debugging, incident tracing, and code-area exploration before fixes or plans.
- `quick-dev`
  Purpose: fast path for trivial, low-risk code changes that do not justify the full brainstorming and planning pipeline.
- `brainstorming`
  Purpose: design exploration and approval gate before creative work or behavior changes.
- `writing-plans`
  Purpose: turn approved specs or explicit requirements into implementation plans.
- `executing-plans` / `subagent-driven-development`
  Purpose: execute written plans with verification and review checkpoints.
- `requesting-code-review` / `receiving-code-review`
  Purpose: review completed work or evaluate incoming review feedback.
- `finishing-a-development-branch`
  Purpose: verify Definition-of-Done, then handle final branch integration.
- `writing-skills`
  Purpose: create, edit, or validate skills using skill-documentation TDD.

### Domain Skills

Domain skills add specialized judgment inside an already selected process workflow. They are never a substitute for the process gate.

- `api-design`
  Purpose: REST/HTTP API contract judgment during brainstorming, planning, execution, or review.
- `security-and-hardening`
  Purpose: application security and DevSecOps judgment during brainstorming, planning, execution, or review.
- `ui-ux-pro-max`
  Purpose: design intelligence for UI/UX work. Use during UI design, review, or implementation to query design databases and generate design-system evidence. This is a domain skill, not a process skill.

### Manual Utility Skills

Manual utility skills run only when the user explicitly invokes them. They do not select a process workflow and must not auto-trigger on vague, complex, or underspecified requests.

- `prompt-leverage`
  Purpose: manually upgrade, clarify, template, or apply a raw prompt. Use only on explicit `skill:prompt-leverage` or direct prompt-improvement requests. If the user requests `apply`, restart normal workflow selection after producing the upgraded prompt.
- `ba-spec`
  Purpose: manually generate BA feature specifications from business input, Figma links/screenshots, documents, tickets, meeting notes, or change requests in the conversation language unless the user explicitly asks otherwise. Use only when the user explicitly invokes `ba-spec`; it must not auto-run during install, session bootstrap, or generic BA/spec requests, and it must not implement production code.
- `figma-to-code`
  Purpose: manually convert one selected Figma frame/component/instance into frontend code. Use only when the user explicitly invokes `figma-to-code`, asks to implement UI code from Figma, or when active `ba-spec` work needs Figma implementation guidance; it must not auto-run for BA-only specs or Figma evidence logs.

Treat the workflow skills at the root of `skills/` as the main collection for this fork. Pick the matching skill instead of assuming everything follows one legacy grouping.

## Repository Layout

Use the actual folder layout in this repo when choosing files or giving instructions:

- `skills/using-tungnt-ai-skills/`
  Bootstrap skill and platform references for this fork.
- `skills/`
  Root location for the fork's workflow skills such as `brainstorming`, `writing-plans`, `using-git-worktrees`, `ui-ux-pro-max`, and related execution/review skills.
- `docs/tungnt-ai-skills/`
  Current docs root for plans, specs, investigations, and status files.
- `tests/`
  Regression and integration tests for the forked skill behavior.
- `plans/templates/`
  Plan templates referenced by root workflow skills.
- `docs/tungnt-ai-skills/templates/`
  Shared design and workflow templates for root skills.

Do not invent `skills/using-superpowers/` paths in this repo. Use `skills/using-tungnt-ai-skills/` instead.

## How to Access Skills

In Claude Code, use the `Skill` tool.

In Copilot CLI, use the `skill` tool.

In Gemini CLI, use the `activate_skill` tool.

In other environments, use the platform's documented skill-loading mechanism.

## Platform Adaptation

Some skills use Claude Code tool names in their instructions. For platform-specific tool mapping:

- Copilot CLI: `skills/using-tungnt-ai-skills/references/copilot-tools.md`
- Codex: `skills/using-tungnt-ai-skills/references/codex-tools.md`
- Gemini CLI: `skills/using-tungnt-ai-skills/references/gemini-tools.md`

## The Rule

Invoke relevant or requested skills before any meaningful response or action, including exploratory steps when a skill collection clearly applies.

The selected process skill controls the workflow. Domain skills may add constraints, evidence, examples, checklists, or review lenses, but they do not satisfy or bypass `brainstorming`, `writing-plans`, `executing-plans`, `subagent-driven-development`, `investigation`, review, or `writing-skills` gates.

Examples:

- Planning or decomposition work: check the root workflow skills in `skills/`
- Brainstorming or structured ideation: check the root workflow skills in `skills/`
- Prompt upgrade request: use `prompt-leverage` only if the user explicitly asks for prompt leverage, prompt improvement, prompt clarification, prompt templating, or `skill:prompt-leverage`

If no skill clearly applies, continue normally.

## Recommended Selection Order

When multiple skills may apply, use this order:

1. Bootstrap with `using-tungnt-ai-skills`
2. Choose a process skill that determines approach and gates
3. Choose a domain skill that supplies evidence, constraints, or implementation guidance inside that process

## Ambiguous Project Triage

When the user's description is vague, broad, or mixes several concerns, do a short project/context triage before choosing domain lenses:

1. **Read project signals first.** Check nearby docs, package/build files, folder names, framework files, and current diff/status when available.
2. **Classify the work shape.** Is this a bug investigation, tiny edit, new behavior, approved plan, code review, skill authoring, or finish/merge task?
3. **Choose the process skill.** Process choice comes from the work shape, not from the domain. If still unclear, use `brainstorming` for new behavior or ask one concise clarification.
4. **Scan domain signals.** After process selection, use the domain lens routing table below.
5. **Name the priority.** If multiple lenses match, use the one tied to the highest risk first: security/data loss > public API contract > UI/UX polish. Additional lenses are secondary.

Do not use domain signals as permission to skip the process workflow. "Auth dashboard" means `brainstorming` first, then `security-and-hardening` and `ui-ux-pro-max` as lenses.

## Domain Lens Routing

After selecting the process skill, scan the user request, approved plan, current diff, error, and project context for these signals:

| Signals | Add domain lens |
| --- | --- |
| REST, HTTP, endpoint, route, controller, request schema, response schema, error shape, pagination, filtering, sorting, idempotency, versioning, backward compatibility, SDK contract | `api-design` |
| auth, authentication, authorization, session, cookie, CORS, CSRF, secrets, PII, payment, tenant isolation, file upload, webhook, SSRF, dependency audit, supply chain, OWASP, DevSecOps, LLM output, tool permissions | `security-and-hardening` |
| UI, UX, dashboard, layout, component, form, table, mobile screen, web app screen, design system, visual hierarchy, responsive behavior, accessibility, interaction pattern | `ui-ux-pro-max` |

Domain routing examples:

- "Tests auth middleware are failing because user A can read user B's resource" -> process `investigation`, then lens `security-and-hardening`.
- "Add REST endpoint to create invoice with idempotency and paginated list" -> process `brainstorming`, then lens `api-design`; add `security-and-hardening` if money, auth, tenant, or PII behavior is involved.
- "Review auth diff before merge" -> process `requesting-code-review`, then lens `security-and-hardening`.
- "Build permissions dashboard with roles, invites, and audit log" -> process `brainstorming`, then lenses `ui-ux-pro-max` and `security-and-hardening`.

Examples:

- "Design an endpoint"
  Use `brainstorming` first for new behavior, then use `api-design` inside that design workflow. Use `writing-plans` only after the design/spec gate is satisfied.
- "Add auth, CORS, or payment handling"
  Use `brainstorming` first unless `quick-dev` clearly passes. Use `security-and-hardening` as a domain lens inside the selected workflow.
- "Create or update a skill"
  Use `writing-skills`; domain skills cannot replace the RED/GREEN skill-testing gate.
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
## Red Flags

These usually mean you are skipping the repo's workflow discipline:

- "This is simple, I do not need a skill"
- "I will inspect files first and decide later"
- "I remember how an older version handled this"
- "The folder name looks close enough"
- "The domain skill has a checklist, so I can implement now"
- "Security/API/UI guidance is enough; no need for the process workflow"

Stop and load the matching current skill instead.

## Naming Notes

Do not refer to this fork using any older upstream branding in new instructions, summaries, or injected session guidance.

Use these names instead:

- `tungnt-ai-skills` for the overall fork
- the root `skills/` workflow collection for the forked planning/execution/review skills
