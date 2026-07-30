---
name: writing-plans
description: Use when you have a spec or requirements for a multi-step task, before touching code
---

# Writing Plans

## Settings Scan

- Check if brainstorming memory recorded policies for compliance; STRICTLY COMPLY with policies. If policies are lost or missing, read `tais/setting.json` in the current workspace if available (fallback: `setting.json` at plugin root) (read-only — never mutate). Check `policy.autoCommit`, `policy.autoTest`, `policy.dangerousCommands`, `policy.sensitiveFiles`, and `policy.installAndUpdate` to shape which questions you ask and default assumptions you accept.

If the file is missing, continue with defaults. MUST remember and follow settings in `tais/setting.json` (fallback: `setting.json` at plugin root).

MUST remember policies when executing, ALWAYS PRIORITIZE following `tais/setting.json` in the current workspace if available or `setting.json` at plugin root to get policies.

## Overview

Write comprehensive implementation plan, assuming engineer has 0 context about our codebase and suspicious tastes. Document everything they need to know: which files to touch for each task, code, tests, docs they might need to look at, how to test. Supply complete plan in small tasks. DRY. YAGNI. TDD. Commit frequently (if `policy.autoCommit` is enabled, COMPLY with `setting.json`).

Assume they are a skilled developer, but know almost nothing about the toolset or problem domain. Assume they don't know good test design.

**Announcement:** "I am using the writing-plans skill to create an implementation plan."

**Context:** If working in an isolated worktree, it should be created via the `using-git-worktrees` skill at execution time.

**Save plan to:** If working on less than 3 implementation phases, save `docs/tungnt-ai-skills/plans/YYYY-MM-DD-<feature-name>.md`. In case of working on more than 2 implementation phases, save `docs/tungnt-ai-skills/plans/YYYY-MM-DD-<feature-name>/plan.md`, `docs/tungnt-ai-skills/plans/YYYY-MM-DD-<feature-name>/phase-xxx-<feature-name>.md`, with xxx being the corresponding phase number.
- (User preferences for plan location override this default)

## Scope Check

If spec covers multiple independent subsystems, it should have been broken into sub-project specs during brainstorming. If not, propose splitting into separate plans — one per subsystem. Each plan should produce independently working, testable software.

## Plan Shape

Choose single-file or phased output based on specific signals:

**Single-file plan** — use when conditions met: Fewer than 3 implementation phases.
- Create unique plan file: `docs/tungnt-ai-skills/plans/YYYY-MM-DD-<feature-name>.md`.

**Phased plan** — use when conditions met: Work has 3 or more implementation phases.
- Create plan file and corresponding phase files according to exact format `docs/tungnt-ai-skills/plans/YYYY-MM-DD-<feature-name>/plan.md`, `docs/tungnt-ai-skills/plans/YYYY-MM-DD-<feature-name>/phase-xxx-<feature-name>.md`, with xxx being the corresponding phase number. `plan.md` is the overview file.

For phased plans:
1. Create `plan.md` with phase mapping table, dependencies, and success criteria.
2. Create all `phase-*.md` files immediately — do not defer phase file creation to execution time.
3. Every phase file must have frontmatter: `phase`, `title`, `status: pending`, `priority`, `effort`, `dependencies`.
4. Phase frontmatter is the primary reference source for phase progress. Optional status YAML files are only runtime tracking.

For single-file plans, keep current plan format unchanged. No separate status YAML required.

## File Structure

Before defining tasks, map which files will be created or modified and what each file is responsible for. This is where separation decisions are locked.

- Design units with clear boundaries and well-defined interfaces. Each file should have one clear responsibility.
- You reason best about code you can hold in context at once, and your edits are more reliable when files are focused. Prefer smaller, more focused files over doing too much.
- Files that change together should live together. Divide by responsibility, not technical layer.
- In existing codebase, follow established patterns. If codebase uses large files, do not unilaterally refactor - but if the file you modify has grown unwieldy, including splitting and staging by file in **phased plan** is reasonable.

This structure informs task breakdown. Each task should produce a self-contained change that is meaningful independently.

## Task Granularity

**Each step is one action (2-5 minutes):**
- "Write failing test" - step
- "Run it to ensure it fails" - step
- "Implement minimal code to make test pass" - step
- "Run tests and ensure they pass" - step
- "Commit" - step

## Plan Document Header

**EVERY plan MUST start with this header:**

```markdown
# [Feature Name] Implementation Plan

> **For agent executor:** MANDATORY SUB-SKILL: Use `subagent-driven-development` (recommended) or `executing-plans` to implement this plan task by task. Steps use checkbox syntax (`- [ ]`) for tracking.

**Goal:** [One sentence describing what is being built]

**Architecture:** [2-3 sentences on approach]

**Tech Stack:** [Main technologies/libraries]

**Plan Shape:** single-file | phased (N phases)

**Status:** pending/in-progress/completed

---
```

## Task Structure

### Single file only

- `policy.autoTest`, `policy.dangerousCommands`, `policy.sensitiveFiles`, and `policy.installAndUpdate` check policies being configured. If all are off, add **Step 0: Do not perform the following actions:** do not auto-commit, do not run commands in policy, do not read/write sensitiveFiles files, do not auto installAndUpdate without user prompt. If some policies are enabled/disabled, for disabled policies add structure **Step 0: Do not perform the following actions:** ... If all are allowed, do not add **Step 0: Do not perform the following actions:**

- Step 5 structure below needs to check `policy.autoCommit`; if enabled, add step 5 structure; if not enabled, omit step 5 structure.

````markdown
### Task N: [Component Name]

**Files:**
- Create: `exact/path/to/file.py`
- Modify: `exact/path/to/existing.py:123-145`
- Test: `tests/exact/path/to/test.py`

- [ ] **Step 1: Write failing test**

```python
def test_specific_behavior():
    result = function(input)
    assert result == expected
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest tests/path/test.py::test_name -v`
Expected: FAIL with "function not defined"

- [ ] **Step 3: Write minimal implementation**

```python
def function(input):
    return expected
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest tests/path/test.py::test_name -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add tests/path/test.py src/path/file.py
git commit -m "feat: add specific feature"
```
````

````markdown
### Follow phased steps on plan.md

# <task-name>

## Overview

- Short description of goal.
- Value delivered after completion.
- General scope.
- Desired output results.

## Source Context

- Spec document.
- Business requirements.
- Design.
- Technical decisions.
- References.
- Assumptions.

## Related Plans

- Related plans.
- Completed work with impact.
- In-progress work.
- Dependent work.
- Inherited work.

## Phase Mapping

| Phase | File | Status | Purpose | Main files |
|---|---|---|---|---|
| 1 | phase-01-<name>.md | pending | Analysis and preparation | |
| 2 | phase-02-<name>.md | pending | Solution design | |
| 3 | phase-03-<name>.md | pending | Implementation | |
| 4 | phase-04-<name>.md | pending | Testing and refinement | |
| 5 | phase-05-<name>.md | pending | Summary and handoff | |
| n | phase-0n-<name>.md | pending | ................... | |

## Dependencies

```text
Phase 1 -> Phase 2
Phase 2 -> Phase 3
Phase 3 -> Phase 4
Phase 4 -> Phase 5
Phase n -> Phase n+1
```

## Phase Details

### Phase 1 - Analysis

#### Goal

#### Tasks

- Gather requirements.
- Read related documents.
- Define scope.
- List risks.
- Identify dependencies.

#### Outputs

- List of requirements.
- Clear scope.
- List of dependencies.
- List of risks.

---

### Phase 2 - Design

#### Goal

#### Tasks

- Design processing flow.
- Design data structures.
- Design architecture.
- Identify changes to implement.
- Determine impact.

#### Outputs

- Complete design.
- List of files to change.
- List of APIs.
- List of interfaces.

---

### Phase 3 - Implementation

#### Goal

#### Tasks

- Update source code.
- Add features.
- Fix bugs.
- Refactor if needed.
- Sync documentation.

#### Outputs

- Working features.
- Complete source code.
- Updated documentation.

---

### Phase 4 - Testing

#### Goal

#### Tasks

- Unit test.
- Integration test.
- Manual test.
- Regression test.
- Fix detected bugs.

#### Outputs

- Test results.
- List of resolved bugs.
- Quality confirmation.

---

### Phase 5 - Refinement

#### Goal

#### Tasks

- Review all changes.
- Check documentation.
- Check coding conventions.
- Check dependencies.
- Prepare handoff.

---

### Phase N - ...

#### Goal

#### Tasks

- ...

#### Outputs

- Pull Request.
- Complete documentation.
- Result report.
- User guide (if any).

## Success Criteria

- [ ] Requirements met.
- [ ] Features work correctly.
- [ ] No critical errors introduced.
- [ ] Testing passed.
- [ ] Documentation updated.
- [ ] Existing functionality unaffected.
- [ ] Completed within scope.

## Out of Scope

- Features out of scope.
- Unnecessary refactoring.
- Major architecture changes.
- Unrelated changes.
- Optimization beyond requirements.

## Validation Log

### <YYYY-MM-DD HH:mm>

#### Checks

- Requirements.
- Design.
- Implementation.
- Testing.
- Documentation.

#### Results

- Verified.
- Unverified.
- Needs addition.

#### Decisions

1.
2.
3.

## Risks

- Missing requirements.
- Missing documentation.
- Unfinished dependencies.
- Conflicts with other changes.
- Unexpected errors.

## Handoff

### Next Steps

Provide suggested commands to execute plan

```bash

/subagent-driven-development <report-path>/plan.md

# or

/executing-plans <report-path>/plan.md
```

### Breakdown by phase

---
phase: <N>
title: "<Phase Name>"
status: pending       # pending | in-progress | completed
priority: P2          # P1 | P2 | P3
effort: ""            # Example: "4h", "2d"
dependencies: []      # List of dependent phases
---

# Phase <id>: <Phase Name>

## Overview

<Brief description of goals and outcomes of this phase>

## Requirements

- Functional:
- Non-functional:

## Architecture

<Describe design, processing flow, data flow, related components, and how components interact>

## Related Code Files

- Create new: `path/...`
- Modify: `path/...`
- Delete: `path/...`

## Implementation Steps

1.
2.
3.

## Success Criteria

- [ ] Complete all requirements of phase.
- [ ] Features work correctly.
- [ ] No new errors introduced.
- [ ] Technical requirements met.
- [ ] Documentation updated (if any).

## Risk Assessment

### Risks

-

### Mitigation

-
````

## No Placeholders

Each step must contain actual content the engineer needs. These are **plan failures** — never write them:
- "TBD", "TODO", "implement later", "fill in details later"
- "Add appropriate error handling" / "add validation" / "handle edge cases"
- "Write tests for the above" (without actual test code)
- "Similar to Task N" (repeating code — engineer may read tasks out of order)
- Steps describing what to do without showing how to do it (code block required for code steps)
- References to types, functions, or methods not defined in any task

## Remember
- Exact file paths always
- Complete code in every step — if a step changes code, show code
- Exact commands with expected output
- DRY, YAGNI, TDD, commit frequently

## Self-Review

After writing complete plan, look at spec with fresh eyes and test plan against it. This is a checklist you run yourself — not dispatched to a subagent.

**1. Spec coverage:** Scan each section/requirement in spec. Which task implements it? List any gaps.

**2. Placeholder scan:** Search your plan for red flags — any patterns from the "No Placeholders" section above. Fix them.

**3. Type consistency:** Are types, method signatures, and property names used in later tasks matching what you defined in earlier tasks? Function calling `clearLayers()` in Task 3 but `clearFullLayers()` in Task 7 is an error.

If you find issues, fix inline. No need to re-review — just fix and move on. If you find spec requirements without tasks, add tasks.

## Verification

Verification runs only when user explicitly invokes verification skill or subcommand. Do not add automated verification gate to writing-plans workflow. Plan is ready for execution handoff after self-review passes.

## Execution Handoff

After saving plan, propose execution options:

**"Plan complete and saved to `docs/tungnt-ai-skills/plans/<filename>.md` for simple cases without phases, or saved to `docs/tungnt-ai-skills/plans/YYYY-MM-DD-<feature-name>/<filename>*.md` for phased cases. Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a new subagent for each task, two-stage review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach do you prefer?"**

**If Subagent-Driven selected:**
- **MANDATORY SUB-SKILL:** Use `subagent-driven-development`
- New subagent per task + two-stage review

**If Inline Execution selected:**
- **MANDATORY SUB-SKILL:** Use `executing-plans`
- Batch execution with checkpoints for review
