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

Write implementation plans for an engineer who has not seen this codebase or this spec. Assume they write idiomatic code in the project's language once they know the exact interface and the exact test, and that they will make a reasonable choice wherever the plan leaves one open. What they cannot know is what you decided: which files, which names and signatures, which values from the spec, which tests prove each task. Document those. Give them the whole plan as bite-sized tasks. DRY. YAGNI. TDD. Frequent commits (if `policy.autoCommit` is enabled, COMPLY with `setting.json`).

Assume they are a skilled developer, but know almost nothing about the toolset or problem domain. Assume they don't know good test design.

**Announcement:** "I am using the writing-plans skill to create an implementation plan."

**Context:** If working in an isolated worktree, it should be created via the `using-git-worktrees` skill at execution time.

**Save plan to:** If working on less than 3 implementation phases, save `docs/tungnt-ai-skills/plans/YYYY-MM-DD-<feature-name>.md`. In case of working on more than 2 implementation phases, save `docs/tungnt-ai-skills/plans/YYYY-MM-DD-<feature-name>/plan.md`, `docs/tungnt-ai-skills/plans/YYYY-MM-DD-<feature-name>/phase-xxx-<feature-name>.md`, with xxx being the corresponding phase number.
- (User preferences for plan location override this default)

## Scope Check

If the spec covers multiple independent subsystems, it should have been broken into sub-project specs during brainstorming. If not, suggest breaking this into separate plans — one per subsystem. Each plan should produce working, testable software on its own.

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

Before defining tasks, map out which files will be created or modified and what each one is responsible for. This is where decomposition decisions get locked in.

- Design units with clear boundaries and well-defined interfaces. Each file should have one clear responsibility.
- You reason best about code you can hold in context at once, and your edits are more reliable when files are focused. Prefer smaller, focused files over large ones that do too much.
- Files that change together should live together. Split by responsibility, not by technical layer.
- In existing codebases, follow established patterns. If the codebase uses large files, don't unilaterally restructure - but if a file you're modifying has grown unwieldy, including a split in the plan (or staging by file in a **phased plan**) is reasonable.

This structure informs the task decomposition. Each task should produce self-contained changes that make sense independently.

## Task Right-Sizing

A task is the smallest unit that carries its own test cycle and is worth a fresh reviewer's gate. When drawing task boundaries: fold setup, configuration, scaffolding, and documentation steps into the task whose deliverable needs them; split only where a reviewer could meaningfully reject one task while approving its neighbor. Each task ends with an independently testable deliverable.

## Step Granularity

**Each step is one action with a checkable result (2-5 minutes):**
- "Write the failing test" - step
- "Run it to make sure it fails" - step
- "Implement the minimal code to make the test pass" - step
- "Run the tests and make sure they pass" - step
- "Commit" - step

## Plan Document Header

**EVERY plan MUST start with this header:**

```markdown
# [Feature Name] Implementation Plan

> **For agent executor:** MANDATORY SUB-SKILL: Use `subagent-driven-development` (recommended) or `executing-plans` to implement this plan task by task. Steps use checkbox syntax (`- [ ]`) for tracking.

**Goal:** [One sentence describing what is being built]

**Architecture:** [2-3 sentences about approach]

**Tech Stack:** [Key technologies/libraries]

**Spec:** [path to the spec/design doc this plan implements — the plan argues from the spec, so the spec travels with it; executors read both]

**Plan Shape:** single-file | phased (N phases)

**Status:** pending/in-progress/completed

## Global Constraints

[The spec's project-wide requirements — version floors, dependency limits, naming and copy rules, platform requirements — one line each, with exact values copied verbatim from the spec. Every task's requirements implicitly include this section.]

## Review Focus

[The five input classes or failure modes the spec implies but no task's tests exercise that are most likely to bite a person using this software — one line each, naming the input or condition and the behavior a reasonable person would expect, most likely first. The spec is a vision document: it says what the software must do, not everything it will meet, and its silence on an input is not permission for that input to break the program. Write the list here, once, with the spec in front of you. Then, for each line, add the test that pins it to the task that owns the code, in that task's own step style.]

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

**Interfaces:**
- Consumes: [what this task uses from earlier tasks — exact signatures]
- Produces: [what later tasks rely on — exact function names, parameter and return types. A task's implementer sees only their own task; this block is how they learn the names and types neighboring tasks use.]

- [ ] **Step 1: Write the failing test**

```python
def test_specific_behavior():
    result = function(input)
    assert result == expected
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest tests/path/test.py::test_name -v`
Expected: FAIL with "function not defined"

- [ ] **Step 3: Implement `function(input: InputType) -> ResultType` in `exact/path/to/file.py`**

One line on the approach when the signature and the test leave a choice (which library call, which data structure); a code block only for an algorithm they do not determine.

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

## What a Step Contains

A step is done when the implementer can write exactly one reasonable thing from it. That is the whole requirement: unambiguous, not complete. Each kind of step carries what makes it unambiguous and nothing more:

- **A test step:** the test's name and its assertions, as code, with the spec's exact values in them.
- **A code step:** the exact signature (name, parameters, return type), the file it lives in, and the specific values the spec pins. The implementer writes the body. A body appears only for an algorithm the signature and tests do not determine, or for exact copy the spec fixes.
- **A verification step:** the command to run and the output that means it passed.
- **A reference to another task:** that task's Interfaces block says what to use; the plan does not repeat that task's code.

A plan is the set of decisions the implementer cannot make alone. A plan longer than the code it describes has written the code instead. Lines that decide nothing ("TBD", "handle edge cases", "add appropriate validation", "write tests for the above", a type or function no task defines) are the opposite failure, and the self-review catches both.

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
- DRY, YAGNI, TDD, commit frequently (subject to `policy.autoCommit`)

## Self-Review

After writing the complete plan, look at the spec with fresh eyes and check the plan against it. This is a checklist you run yourself — not a subagent dispatch.

**1. Spec coverage:** Skim each section/requirement in the spec. Can you point to a task that implements it? List any gaps.

**2. Step scan:** Every step must let the implementer write exactly one reasonable thing, and no step may carry more than that: a line that decides nothing is a gap, a function body the signature and tests already determine is a transcript. Fix both. Search your plan for red flags — any patterns from the "No Placeholders" section above. Fix them.

**3. Type consistency:** Do the types, method signatures, and property names you used in later tasks match what you defined in earlier tasks? A function called `clearLayers()` in Task 3 but `clearFullLayers()` in Task 7 is a bug.

**4. Review Focus:** For each input class or failure mode the spec implies, is there a task whose tests exercise it? The five uncovered ones most likely to bite a person go in the Review Focus section, and each line there gets its test added to the owning task. An empty section means you checked and found none, not that you skipped the check.

**5. Proportion:** Compare the plan's length to the spec's. A plan several times longer than the spec it implements is a transcript of the program, not a plan. If code blocks are most of the document, replace bodies with signatures, test names and assertions, and check that each step is still unambiguous.

If you find issues, fix them inline. No need to re-review — just fix and move on. If you find a spec requirement with no task, add the task.

## Verification

Verification runs only when user explicitly invokes verification skill or subcommand. Do not add automated verification gate to writing-plans workflow. Plan is ready for execution handoff after self-review passes.

## Execution Handoff

After saving and self-reviewing the plan, link it for your human partner to read. If they have already explicitly supplied an execution method, ask them to review the plan and confirm it captures what they want; wait for that review before implementation, then use the preserved method. Otherwise, ask them to review the plan and choose an execution method before implementation.

**When no execution method has already been supplied:**

**"Plan complete and saved to `docs/tungnt-ai-skills/plans/<filename>.md` for simple cases without phases, or saved to `docs/tungnt-ai-skills/plans/YYYY-MM-DD-<feature-name>/<filename>*.md` for phased cases. Please review the plan. Which execution approach would you prefer?**

- **Subagent-driven (recommended)** - A fresh subagent implements each task and a fresh reviewer checks it before the next one starts, then a whole-branch review at the end. Most thorough; costs a fresh context per task and per review.
- **Native / Inline Execution** - I implement every task myself in this session using executing-plans, batch execution with checkpoints, then one fresh reviewer checks the whole branch. Cheapest and fastest; runs well when the plan carries the design.

**For this plan I recommend <one of the two>, because <one sentence from the plan: how much the tasks depend on each other's interfaces, how many there are, what a shipped mistake would cost>. Does the plan capture what you want, and which approach should we use?"**

**When an execution method has already been supplied:**

**"Plan complete and saved to `docs/tungnt-ai-skills/plans/<filename>.md` for simple cases without phases, or saved to `docs/tungnt-ai-skills/plans/YYYY-MM-DD-<feature-name>/<filename>*.md` for phased cases. Please review the plan. Does it capture what you want?"**

**If Subagent-driven chosen:**
- **MANDATORY SUB-SKILL:** Use `subagent-driven-development`

**If Native / Inline Execution chosen:**
- **MANDATORY SUB-SKILL:** Use `executing-plans`
