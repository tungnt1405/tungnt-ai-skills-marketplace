---
name: prompt-leverage
description: Use when the user explicitly writes skill:prompt-leverage or asks to improve, upgrade, clarify, template, or apply a raw prompt before execution
---

# Prompt Leverage

Upgrade a raw prompt into a clearer execution prompt without changing the user's underlying intent. This is a manual preprocessor, not a replacement for the normal `tungnt-ai-skills` workflow.

This skill was informed by the linked prompt-leverage examples, but the manual trigger contract and workflow integration are maintained as part of this project.

## Manual Activation Only

Use this skill only when the user explicitly invokes it with `skill:prompt-leverage` or directly asks to improve, upgrade, clarify, template, or apply a prompt.

Do not use this skill merely because the current task is vague, complex, or missing context. If the user did not explicitly ask for prompt leverage, continue through the normal `using-tungnt-ai-skills` workflow.

## Trigger Contract

| User form | Meaning |
| --- | --- |
| `skill:prompt-leverage prompt: <text>` | Upgrade the prompt only. Do not execute it. |
| `skill:prompt-leverage apply prompt: <text>` | Upgrade the prompt, then execute the upgraded prompt through the normal workflow. |
| `skill:prompt-leverage template prompt: <text>` | Convert the prompt into a reusable fill-in-the-blank template. |
| `skill:prompt-leverage hook prompt: <text>` | Describe a prompt preprocessor hook for the requested prompt shape. |

If the user uses `prompt:` without `apply`, return the upgraded prompt and stop. If the user uses `apply`, first show the upgraded prompt briefly, then restart normal workflow selection from `using-tungnt-ai-skills`.

## Workflow

1. Read the raw prompt and identify the real job to be done.
2. Infer the task type: coding, research, writing, analysis, planning, review, or skill authoring.
3. Rebuild the prompt with the framework blocks in `references/framework.md`.
4. Keep the result proportional; do not turn a simple request into a giant spec.
5. Return the selected output mode. Execute only when the user explicitly requested `apply`.

## Transformation Rules

- Preserve the user's objective, constraints, and tone unless they conflict.
- Prefer adding missing structure over rewriting everything stylistically.
- Add context requirements only when they improve correctness.
- Add tool rules only when tool use materially affects correctness.
- Add verification and completion criteria for non-trivial tasks.
- Keep prompts compact enough to be practical in repeated use.
- Keep the upgraded prompt compatible with the existing `tungnt-ai-skills` process gates.

## Framework Blocks

Use these blocks selectively:

- `Objective`: state the task and what success looks like.
- `Context`: list sources, files, constraints, unknowns, and fact boundaries.
- `Work Style`: set depth, breadth, care, and first-principles expectations.
- `Tool Rules`: state when tools, browsing, or file inspection are required.
- `Output Contract`: define structure, formatting, tone, and level of detail.
- `Verification`: require checks for correctness, edge cases, and alternatives.
- `Done Criteria`: define when the agent should stop.

Use `scripts/augment_prompt.py` when a deterministic first-pass rewrite is helpful.

## Apply Behavior

When the user explicitly requests `apply`:

1. Produce the upgraded prompt.
2. Treat the upgraded prompt as the user's active request.
3. Restart normal workflow selection from `using-tungnt-ai-skills`.
4. Choose the correct process skill, such as `quick-dev`, `brainstorming`, `investigation`, `writing-plans`, `requesting-code-review`, or `writing-skills`.
5. Add domain lenses only after the process skill is selected.

This skill must not bypass brainstorming approval gates, quick-dev scope gates, investigation evidence grading, review flow, or writing-skills RED/GREEN expectations.

## Hook Spec Behavior

When the user requests `hook`, produce a pattern for a prompt preprocessor that can automatically recognize prompts worth upgrading. Do not install, enable, or imply an automatic hook unless the user explicitly asks for implementation.

A hook spec should define:

1. **Input:** the raw prompt, message payload, or request envelope the hook receives.
2. **Activation pattern:** conditions that trigger prompt leverage automatically.
3. **Non-trigger pattern:** conditions that must pass through unchanged.
4. **Classification:** task type, risk level, and whether confirmation is required before execution.
5. **Transformation:** which framework blocks to add, omit, or keep compact.
6. **Output:** upgraded prompt plus an optional summary of injected structure.
7. **Safety rule:** `prompt` mode never executes; only explicit `apply` can continue into the normal workflow.

Use this activation pattern for vague or underspecified prompts:

| Signal | Trigger when |
| --- | --- |
| Missing objective | The prompt asks to "fix", "improve", "make", "handle", "do this", or "help with" without clear success criteria. |
| Missing context | The prompt references files, code, docs, data, screenshots, or prior work without naming the source or boundary. |
| Missing output contract | The prompt does not state the expected format, depth, tone, artifact, or level of detail. |
| Missing verification | The prompt asks for coding, research, review, planning, or high-stakes output without checks or done criteria. |
| Risk without guardrails | The prompt touches security, money, data loss, production, legal, medical, public API behavior, or broad workflow changes without constraints. |

Use this non-trigger pattern to avoid overreach:

| Signal | Pass through when |
| --- | --- |
| Simple command | The user asks for a current shell command, quick lookup, direct rewrite, translation, or formatting change with enough detail. |
| Already structured | The prompt already has objective, context, output contract, verification, and done criteria. |
| Explicit no-upgrade | The user asks not to rewrite, not to clarify, or to execute exactly as written. |
| Workflow trigger | The prompt clearly maps to an existing `tungnt-ai-skills` process skill and does not ask for prompt preprocessing. |

Recommended hook decision:

```text
if explicit skill:prompt-leverage:
  run requested prompt-leverage mode
elif automatic hook is enabled and activation pattern matches and non-trigger pattern does not match:
  upgrade prompt and ask for confirmation before execution
else:
  continue unchanged
```

## Quality Bar

Before finalizing, check that the upgraded prompt:

- still matches the original intent
- does not add unnecessary ceremony
- includes the right verification level for the task
- gives the agent a clear definition of done
- does not silently execute unless `apply` was explicit

If the prompt is already strong, say so and make only minimal edits.

## Common Mistakes

| Mistake | Fix |
| --- | --- |
| Activating on any vague request | Only activate on explicit prompt-upgrade language or `skill:prompt-leverage`. |
| Treating `prompt:` as execution | Return the upgraded prompt only unless `apply` is present. |
| Skipping existing workflow after `apply` | Restart from `using-tungnt-ai-skills` and select the normal process skill. |
| Over-specifying simple prompts | Add only blocks that materially improve execution. |
