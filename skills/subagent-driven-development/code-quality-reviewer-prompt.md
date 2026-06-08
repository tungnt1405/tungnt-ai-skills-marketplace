# Code Quality Reviewer Prompt Template

Use this template when dispatching a code quality reviewer subagent.

**Purpose:** Verify implementation is well-built (clean, tested, maintainable)

**Only dispatch after spec compliance review passes.**

```
Task tool (general-purpose):
  Use template at requesting-code-review/code-reviewer.md

  DESCRIPTION: [task summary, from implementer's report]
  PLAN_OR_REQUIREMENTS: Task N from [plan-file]
  BASE_SHA: [commit before task]
  HEAD_SHA: [current commit]
```

**Run all three lenses inside this single reviewer pass:**

1. **Blind Hunter:** inspect the diff before reading implementation narrative. Find correctness, security, data loss, and suspicious omission risks.
2. **Edge Case Hunter:** walk changed branches and boundary conditions that are directly reachable from the diff. Report unhandled empty values, missing defaults, cleanup gaps, concurrency, timeout, filesystem, network, and path issues.
3. **Acceptance Auditor:** check quality-relevant acceptance risks after spec compliance has passed. Do not re-run the full spec compliance review; report only plan deviations, non-goals, or acceptance risks that affect implementation quality.

**Also check:**
- Does each file have one clear responsibility with a well-defined interface?
- Are units decomposed so they can be understood and tested independently?
- Is the implementation following the file structure from the plan?
- Did this implementation create new files that are already large, or significantly grow existing files? Focus on what this change contributed.

**Code reviewer returns:** Praise, Must-Fix, Should-Fix, Consider, Assessment
