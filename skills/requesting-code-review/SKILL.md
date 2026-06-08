---
name: requesting-code-review
description: Use when completing tasks, implementing major features, or before merging to verify work meets requirements
---

# Requesting Code Review

Dispatch a code reviewer subagent to catch issues before they cascade. The reviewer gets precisely crafted context for evaluation - never your session's history. This keeps the reviewer focused on the work product, not your thought process, and preserves your own context for continued work.

**Core principle:** Review early, review often.

## When to Request Review

**Mandatory:**
- After each task in subagent-driven development
- After completing major feature
- Before merge to main

**Optional but valuable:**
- When stuck (fresh perspective)
- Before refactoring (baseline check)
- After fixing complex bug

## How to Request

**1. Get git SHAs:**
```bash
BASE_SHA=$(git rev-parse HEAD~1)  # or origin/main
HEAD_SHA=$(git rev-parse HEAD)
```

**2. Dispatch code reviewer subagent:**

Use Task tool with `general-purpose` type, fill template at `code-reviewer.md`

**Placeholders:**
- `{DESCRIPTION}` - Brief summary of what you built
- `{PLAN_OR_REQUIREMENTS}` - What it should do
- `{BASE_SHA}` - Starting commit
- `{HEAD_SHA}` - Ending commit

## Three Review Lenses

A code review pass uses three independent lenses inside the same reviewer subagent. These lenses do not change how many review subagents the workflow dispatches.

1. **Blind Hunter** receives only the diff. It looks for bugs, security issues, broken assumptions, missing migrations, unsafe defaults, and suspicious omissions without project narrative.
2. **Edge Case Hunter** receives the diff and can inspect the project. It walks changed branches and boundary conditions: empty input, missing defaults, state transitions, concurrency, retries, timeouts, filesystem and network failure, path handling, and cleanup.
3. **Acceptance Auditor** receives the diff plus plan or requirements. It verifies every acceptance criterion, constraint, and non-goal against the implementation.

Triage findings into:

- **Must-Fix**: correctness, security, data loss, broken acceptance criteria, or failing tests.
- **Should-Fix**: maintainability, test gaps, unclear error behavior, or fragile design that should be fixed before proceeding.
- **Consider**: real improvement but not required for this change.
- **Praise**: specific evidence of good implementation choices.

**3. Act on feedback:**
- Fix Must-Fix items immediately.
- Fix Should-Fix items before proceeding unless you can defend a narrower scope with evidence.
- Track Consider items separately when they are outside the current change.
- Push back on incorrect findings with code, tests, or source citations.

## Example

```
[Just completed Task 2: Add verification function]

You: Let me request code review before proceeding.

BASE_SHA=$(git log --oneline | grep "Task 1" | head -1 | awk '{print $1}')
HEAD_SHA=$(git rev-parse HEAD)

[Dispatch code reviewer subagent]
  DESCRIPTION: Added verifyIndex() and repairIndex() with 4 issue types
  PLAN_OR_REQUIREMENTS: Task 2 from docs/superpowers/plans/deployment-plan.md
  BASE_SHA: a7981ec
  HEAD_SHA: 3df7661

[Subagent returns]:
  Praise: Clean architecture, real tests
  Should-Fix:
    Missing progress indicators
  Consider:
    Magic number (100) for reporting interval
  Assessment: Ready to proceed with fixes

You: [Fix progress indicators]
[Continue to Task 3]
```

## Integration with Workflows

**Subagent-Driven Development:**
- Review after EACH task
- Catch issues before they compound
- Fix before moving to next task

**Executing Plans:**
- Review after each task or at natural checkpoints
- Get feedback, apply, continue

**Ad-Hoc Development:**
- Review before merge
- Review when stuck

## Red Flags

**Never:**
- Skip review because "it's simple"
- Ignore Must-Fix issues
- Proceed with unfixed Should-Fix issues without evidence
- Argue with valid technical feedback

**If reviewer wrong:**
- Push back with technical reasoning
- Show code/tests that prove it works
- Request clarification

See template at: requesting-code-review/code-reviewer.md
