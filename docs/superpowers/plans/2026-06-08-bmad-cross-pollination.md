# BMad Cross-Pollination Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `subagent-driven-development` (recommended) or `executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cherry-pick the useful investigation, review, lightweight tracking, quick-dev, spec distillation, continuation, and completion-gate ideas from BMad Method into `tungnt-ai-skills` without adding dependencies or importing BMad's config/persona system.

**Architecture:** Keep the fork's current flat markdown skill model. Add two new root skills, update existing workflow skills in place, and add a zero-dependency content regression test so ported behavior stays lean, public-link-only, and free of BMad TOML/XML/persona machinery.

**Tech Stack:** Markdown skills, Node.js ESM content tests using `node:fs`, `node:path`, and `node:assert`.

---

## Source References

Use the user-provided local BMad checkout for implementation details, but committed documentation and skills must refer only to public BMad repository URLs:

- `https://github.com/bmad-code-org/BMAD-METHOD/tree/main/.agents/skills/bmad-investigate`
- `https://github.com/bmad-code-org/BMAD-METHOD/tree/main/.agents/skills/bmad-code-review`
- `https://github.com/bmad-code-org/BMAD-METHOD/tree/main/.agents/skills/bmad-review-adversarial-general`
- `https://github.com/bmad-code-org/BMAD-METHOD/tree/main/.agents/skills/bmad-review-edge-case-hunter`
- `https://github.com/bmad-code-org/BMAD-METHOD/tree/main/.agents/skills/bmad-quick-dev`
- `https://github.com/bmad-code-org/BMAD-METHOD/tree/main/.agents/skills/bmad-spec`
- `https://github.com/bmad-code-org/BMAD-METHOD/tree/main/.agents/skills/bmad-sprint-planning`

## File Structure

- Create `skills/investigation/SKILL.md`: lean investigation workflow with evidence grades and case-file template inline.
- Create `skills/quick-dev/SKILL.md`: fast-path workflow for small, low-risk edits.
- Create `tests/skill-content/run-tests.js`: dependency-free content regression tests for the new and modified skill behavior.
- Modify `package.json`: add a `test:skills` script.
- Modify `skills/using-tungnt-ai-skills/SKILL.md`: list `investigation` and `quick-dev`, and add routing guidance.
- Modify `skills/requesting-code-review/SKILL.md`: document the three review lenses and triage buckets.
- Modify `skills/requesting-code-review/code-reviewer.md`: update the reusable review prompt to include the lenses and `Must-Fix` / `Should-Fix` / `Consider` / `Praise` output.
- Modify `skills/subagent-driven-development/code-quality-reviewer-prompt.md`: require one subagent to run all three lenses after spec compliance passes.
- Modify `skills/executing-plans/SKILL.md`: add optional plan status tracking and review-continuation prioritization.
- Modify `skills/subagent-driven-development/SKILL.md`: add optional plan status tracking during task execution.
- Modify `skills/brainstorming/SKILL.md`: add the optional Spec Kernel output section.
- Modify `skills/finishing-a-development-branch/SKILL.md`: add the Definition-of-Done validation gate before merge/PR options.

## Guardrails

- Do not add runtime dependencies, scripts that require BMad, TOML readers, Python helpers, or generated config files.
- Do not add BMad persona tags, BMad activation steps, `resolve_customization.py`, `customize.toml`, `{communication_language}`, `{user_skill_level}`, or `{implementation_artifacts}` placeholders to `tungnt-ai-skills` skills.
- Do not rename or delete existing skills.
- Public docs and skill files must not contain absolute local machine paths.
- Keep new skill names unprefixed: `investigation`, `quick-dev`.

## Tasks

### Task 1: Add Skill Content Regression Tests

**Files:**
- Create: `tests/skill-content/run-tests.js`
- Modify: `package.json`

- [ ] **Step 1: Create the failing content test**

Create `tests/skill-content/run-tests.js` with:

```js
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, files);
    } else {
      files.push(full);
    }
  }
  return files;
}

function assertIncludes(content, expected, label) {
  assert.equal(content.includes(expected), true, `${label} missing: ${expected}`);
}

assert.equal(exists('skills/investigation/SKILL.md'), true, 'investigation skill must exist');
assert.equal(exists('skills/quick-dev/SKILL.md'), true, 'quick-dev skill must exist');

const bootstrap = read('skills/using-tungnt-ai-skills/SKILL.md');
assertIncludes(bootstrap, '- `investigation`', 'bootstrap');
assertIncludes(bootstrap, '- `quick-dev`', 'bootstrap');

const investigation = read('skills/investigation/SKILL.md');
assertIncludes(investigation, 'name: investigation', 'investigation frontmatter');
assertIncludes(investigation, '**Confirmed.**', 'investigation evidence grading');
assertIncludes(investigation, '**Deduced.**', 'investigation evidence grading');
assertIncludes(investigation, '**Hypothesized.**', 'investigation evidence grading');
assertIncludes(investigation, '## Case File Template', 'investigation case template');

const quickDev = read('skills/quick-dev/SKILL.md');
assertIncludes(quickDev, 'name: quick-dev', 'quick-dev frontmatter');
assertIncludes(quickDev, 'under 30 minutes', 'quick-dev scope gate');
assertIncludes(quickDev, '1-2 files', 'quick-dev scope gate');
assertIncludes(quickDev, 'Switch to `writing-plans`', 'quick-dev red flags');

const requestReview = read('skills/requesting-code-review/SKILL.md');
assertIncludes(requestReview, 'Blind Hunter', 'requesting-code-review lenses');
assertIncludes(requestReview, 'Edge Case Hunter', 'requesting-code-review lenses');
assertIncludes(requestReview, 'Acceptance Auditor', 'requesting-code-review lenses');
assertIncludes(requestReview, 'Must-Fix', 'requesting-code-review triage');
assertIncludes(requestReview, 'Should-Fix', 'requesting-code-review triage');
assertIncludes(requestReview, 'Consider', 'requesting-code-review triage');
assertIncludes(requestReview, 'Praise', 'requesting-code-review triage');

const codeQualityPrompt = read('skills/subagent-driven-development/code-quality-reviewer-prompt.md');
assertIncludes(codeQualityPrompt, 'Run all three lenses inside this single reviewer pass', 'code quality reviewer prompt');

const executingPlans = read('skills/executing-plans/SKILL.md');
assertIncludes(executingPlans, 'docs/superpowers/status/<plan-name>-status.yaml', 'executing-plans status tracking');
assertIncludes(executingPlans, 'review continuation', 'executing-plans continuation');

const sdd = read('skills/subagent-driven-development/SKILL.md');
assertIncludes(sdd, 'status tracking', 'subagent-driven-development status tracking');

const brainstorming = read('skills/brainstorming/SKILL.md');
assertIncludes(brainstorming, '## Spec Kernel', 'brainstorming spec kernel');
assertIncludes(brainstorming, 'Acceptance Criteria', 'brainstorming spec kernel');

const finishing = read('skills/finishing-a-development-branch/SKILL.md');
assertIncludes(finishing, 'Definition-of-Done', 'finishing DoD gate');
assertIncludes(finishing, 'Acceptance criteria mapped to tests', 'finishing DoD gate');

const forbiddenSkillTokens = [
  'resolve_customization.py',
  'customize.toml',
  '{communication_language}',
  '{user_skill_level}',
  '{implementation_artifacts}',
  '<frozen-after-approval',
];

for (const relativePath of ['skills/investigation/SKILL.md', 'skills/quick-dev/SKILL.md']) {
  const content = read(relativePath);
  for (const token of forbiddenSkillTokens) {
    assert.equal(content.includes(token), false, `${relativePath} must not contain ${token}`);
  }
}

const scannedDirs = [
  path.join(root, 'skills'),
  path.join(root, 'docs', 'superpowers', 'specs'),
];

const absolutePathPattern = /(?:[A-Za-z]:\\|\/e\/tungnt\.it\/|\/mnt\/[a-z]\/)/;
for (const dir of scannedDirs) {
  for (const file of walk(dir)) {
    const content = fs.readFileSync(file, 'utf8');
    assert.equal(absolutePathPattern.test(content), false, `${path.relative(root, file)} contains an absolute local path`);
  }
}

console.log('skill content tests passed');
```

- [ ] **Step 2: Add the npm script**

Update `package.json` scripts to:

```json
"scripts": {
  "test:installer": "node tests/installer/run-tests.js",
  "test:skills": "node tests/skill-content/run-tests.js"
}
```

- [ ] **Step 3: Run the new test and verify it fails for missing features**

Run:

```bash
npm run test:skills
```

Expected: fails with `investigation skill must exist`.

- [ ] **Step 4: Commit the failing test**

```bash
git add package.json tests/skill-content/run-tests.js
git commit -m "test: add skill content regression checks"
```

### Task 2: Add the Investigation Skill and Bootstrap Routing

**Files:**
- Create: `skills/investigation/SKILL.md`
- Modify: `skills/using-tungnt-ai-skills/SKILL.md`

- [ ] **Step 1: Create `skills/investigation/SKILL.md`**

Create a single markdown skill adapted from BMad's investigation workflow:

````markdown
---
name: investigation
description: Use when investigating a bug, tracing an incident, exploring unfamiliar code, or building an evidence-backed case file before changing behavior
---

# Investigation

Investigate before fixing. Reconstruct what is happening from evidence, document confidence, and stop at diagnosis unless the user explicitly asks for implementation.

## When To Use

- A bug, incident, stack trace, log, diagnostic archive, failing test, or suspicious behavior needs diagnosis.
- A code area is unfamiliar and the user needs a reliable mental model before work starts.
- A prior investigation case file should be resumed.

## Output

Create or update a case file at `docs/superpowers/investigations/<slug>.md`.

The slug is a ticket ID when one exists. Otherwise derive a short lowercase kebab-case name from the problem statement. If the file already exists, ask whether to resume it or create `<slug>-YYYY-MM-DD.md`.

## Evidence Grades

- **Confirmed.** Directly observed evidence. Cite `path:line`, log timestamp, command output, or commit hash.
- **Deduced.** Logically follows from Confirmed evidence. Show the chain.
- **Hypothesized.** Plausible but unconfirmed. State what would confirm or refute it.

## Principles

- Treat the user's description as a hypothesis until evidence confirms it.
- Start from one Confirmed stronghold: exact error, function name, route, config key, failing test, timestamp, or commit.
- Follow evidence outward. When evidence contradicts the working theory, update the theory.
- Keep wrong turns. Mark hypotheses as Open, Confirmed, or Refuted instead of deleting them.
- Missing evidence is a finding. Document the gap, impact, and how to obtain it.
- Use CWD-relative `path:line` citations.
- Use parallel file reads and searches when evidence sources are independent.
- Delegate broad scans to a subagent when a step requires reading 5 or more files or a very large file.

## Process

1. **Route the input.**
   - Existing case file: read it, summarize open hypotheses, missing evidence, backlog, and last conclusion.
   - New issue: record the input shape, scope, and any stated hypothesis.

2. **Find the stronghold.**
   - Identify one Confirmed anchor independently from the user's theory.
   - If no Confirmed anchor is available, create an evidence-light case file with a prioritized data-collection backlog and pause.

3. **Initialize the case file.**
   - Fill Case Info, Problem Statement, Evidence Inventory, initial Hypotheses, and Investigation Backlog.
   - Present the scope, stronghold, case file path, and proposed next pass.

4. **Map the evidence perimeter.**
   - Inventory available, partial, and missing sources across logs, diagnostics, version control, tests, static checks, source code, and issue tracker context when available.
   - Update Evidence Inventory and Missing Evidence.

5. **Reason about cause.**
   - Trace backward from symptom to producing condition.
   - Build a timeline where time-based evidence exists.
   - Confirm or refute hypotheses with citations.
   - Run a refutation pass before moving a hypothesis to Confirmed.

6. **Trace source where it matters.**
   - Search exact error strings, affected symbols, recent commits, and neighboring implementations.
   - Read surrounding code and caller chains.
   - For exploration cases, map inputs, outputs, dependencies, and control flow.
   - For symptom cases, identify whether the cause is local or requires a broader model.

7. **Finalize.**
   - Rewrite the Hand-off Brief.
   - State the Final Conclusion with High, Medium, or Low confidence.
   - Provide fix direction only at mechanism level.
   - Provide reproduction or verification steps.
   - Recommend the next workflow: `quick-dev` for trivial fixes, `writing-plans` for larger work, or `requesting-code-review` for review.

## Case File Template

```markdown
# Investigation: <title>

## Hand-off Brief

1. **What happened.** <evidence-graded one-sentence problem statement>
2. **Where the case stands.** <status, strongest finding, remaining uncertainty>
3. **What's needed next.** <single recommended action>

## Case Info

| Field | Value |
| --- | --- |
| Ticket | <ticket ID or N/A> |
| Date opened | <YYYY-MM-DD> |
| Status | Active |
| Evidence sources | <logs, tests, commits, code paths, reports> |

## Problem Statement

<User-reported claim, refined or contradicted by evidence as needed.>

## Evidence Inventory

| Source | Status | Notes |
| --- | --- | --- |
| <source> | Available / Partial / Missing | <details> |

## Investigation Backlog

| # | Path to Explore | Priority | Status | Notes |
| --- | --- | --- | --- | --- |
| 1 | <description> | High / Medium / Low | Open | <context> |

## Timeline of Events

| Time | Event | Source | Confidence |
| --- | --- | --- | --- |
| <timestamp> | <event> | <citation> | Confirmed / Deduced |

## Confirmed Findings

### Finding 1: <title>

**Evidence:** <path:line, timestamp, command output, or commit hash>

**Detail:** <description>

## Deduced Conclusions

### Deduction 1: <title>

**Based on:** <confirmed findings>

**Reasoning:** <logical chain>

**Conclusion:** <what follows>

## Hypothesized Paths

### Hypothesis 1: <title>

**Status:** Open / Confirmed / Refuted

**Theory:** <description>

**Would confirm:** <specific evidence>

**Would refute:** <specific evidence>

**Resolution:** <what settled it, once known>

## Missing Evidence

| Gap | Impact | How to Obtain |
| --- | --- | --- |
| <gap> | <what it would resolve> | <collection step> |

## Source Code Trace

| Element | Detail |
| --- | --- |
| Error origin | <file:line or function> |
| Trigger | <what executes it> |
| Condition | <state that produces behavior> |
| Related files | <same code path> |

## Conclusion

**Confidence:** High / Medium / Low

<Summary separating Confirmed, Deduced, and Hypothesized conclusions.>

## Recommended Next Steps

### Fix direction

<Mechanism-level fix direction.>

### Diagnostic

<Additional confirmation steps if uncertainty remains.>

## Reproduction Plan

<Setup, trigger, expected result.>

## Side Findings

- <evidence-graded observation>

## Follow-up: <YYYY-MM-DD>

### New Evidence

### Additional Findings

### Updated Hypotheses

### Backlog Changes

### Updated Conclusion
```
````

- [ ] **Step 2: Update bootstrap skill list**

In `skills/using-tungnt-ai-skills/SKILL.md`, add these bullets under "What This Fork Contains":

```markdown
- `investigation`
  Purpose: evidence-graded debugging, incident tracing, and code-area exploration before fixes or plans.
- `quick-dev`
  Purpose: fast path for trivial, low-risk code changes that do not justify the full brainstorming and planning pipeline.
```

Add these examples under "Recommended Selection Order":

```markdown
- "Investigate why this fails" / "trace this bug" / "explain this unfamiliar code path"
  Use `investigation` before proposing fixes.
- "Make this tiny fix" / "small tweak in one file"
  Use `quick-dev` only when the scope gate is satisfied; otherwise route to `brainstorming` and `writing-plans`.
```

- [ ] **Step 3: Run targeted verification**

Run:

```bash
npm run test:skills
```

Expected: still fails, but no longer on investigation existence or bootstrap listing.

- [ ] **Step 4: Commit**

```bash
git add skills/investigation/SKILL.md skills/using-tungnt-ai-skills/SKILL.md
git commit -m "feat: add investigation skill"
```

### Task 3: Add Parallel Review Lenses to Code Review Prompts

**Files:**
- Modify: `skills/requesting-code-review/SKILL.md`
- Modify: `skills/requesting-code-review/code-reviewer.md`
- Modify: `skills/subagent-driven-development/code-quality-reviewer-prompt.md`

- [ ] **Step 1: Update `requesting-code-review` workflow**

Add a "Parallel Review Lenses" section after "How to Request":

```markdown
## Parallel Review Lenses

A code review pass uses three independent lenses inside the same reviewer subagent. Do not dispatch extra review subagents for these lenses unless the implementation workflow already calls for separate review agents.

1. **Blind Hunter** receives only the diff. It looks for bugs, security issues, broken assumptions, missing migrations, unsafe defaults, and suspicious omissions without project narrative.
2. **Edge Case Hunter** receives the diff and can inspect the project. It walks changed branches and boundary conditions: empty input, missing defaults, state transitions, concurrency, retries, timeouts, filesystem and network failure, path handling, and cleanup.
3. **Acceptance Auditor** receives the diff plus plan or requirements. It verifies every acceptance criterion, constraint, and non-goal against the implementation.

Triage findings into:

- **Must-Fix**: correctness, security, data loss, broken acceptance criteria, or failing tests.
- **Should-Fix**: maintainability, test gaps, unclear error behavior, or fragile design that should be fixed before proceeding.
- **Consider**: real improvement but not required for this change.
- **Praise**: specific evidence of good implementation choices.
```

Replace the existing "Act on feedback" severity language with:

```markdown
- Fix Must-Fix items immediately.
- Fix Should-Fix items before proceeding unless you can defend a narrower scope with evidence.
- Track Consider items separately when they are outside the current change.
- Push back on incorrect findings with code, tests, or source citations.
```

- [ ] **Step 2: Update `requesting-code-review/code-reviewer.md`**

In the prompt's "What to Check" section, add:

```markdown
## Required Review Lenses

Run all three lenses independently before writing the final review:

### Blind Hunter

Review only the diff first. Ignore the implementation story and look for bugs, security issues, missing cleanup, broken invariants, unsafe defaults, and suspicious omissions.

### Edge Case Hunter

Walk every changed branch and boundary condition that is directly reachable from the diff. Check empty values, missing defaults, error paths, retries, timeouts, concurrency, path handling, filesystem/network failure, and cleanup behavior.

### Acceptance Auditor

Compare the implementation against the provided plan or requirements. Flag missing acceptance criteria, violated constraints, unimplemented edge cases, and behavior added outside the requested scope.
```

Replace the output buckets with:

```markdown
### Praise
[Specific implementation choices that are genuinely good.]

### Must-Fix
[Correctness, security, data loss, failing tests, or acceptance violations.]

### Should-Fix
[Maintainability issues, missing important tests, fragile error behavior, unclear boundaries.]

### Consider
[Useful but non-blocking improvements or follow-up work.]

### Assessment

**Ready to proceed?** [Yes | No | With fixes]

**Reasoning:** [1-2 sentence technical assessment.]
```

- [ ] **Step 3: Update `subagent-driven-development/code-quality-reviewer-prompt.md`**

Replace the short add-on checklist with:

```markdown
**Run all three lenses inside this single reviewer pass:**

1. **Blind Hunter:** inspect the diff before reading implementation narrative. Find correctness, security, data loss, and suspicious omission risks.
2. **Edge Case Hunter:** walk changed branches and boundary conditions that are directly reachable from the diff. Report unhandled empty values, missing defaults, cleanup gaps, concurrency, timeout, filesystem, network, and path issues.
3. **Acceptance Auditor:** compare the implementation to the task text and plan. Report missing acceptance criteria, violated constraints, non-goals implemented accidentally, or plan deviations.

**Also check:**
- Does each file have one clear responsibility with a well-defined interface?
- Are units decomposed so they can be understood and tested independently?
- Is the implementation following the file structure from the plan?
- Did this implementation create new files that are already large, or significantly grow existing files? Focus on what this change contributed.

**Code reviewer returns:** Praise, Must-Fix, Should-Fix, Consider, Assessment.
```

- [ ] **Step 4: Run targeted verification**

Run:

```bash
npm run test:skills
```

Expected: review-lens assertions pass; later assertions may still fail.

- [ ] **Step 5: Commit**

```bash
git add skills/requesting-code-review/SKILL.md skills/requesting-code-review/code-reviewer.md skills/subagent-driven-development/code-quality-reviewer-prompt.md
git commit -m "feat: add layered code review lenses"
```

### Task 4: Add Optional Plan Status Tracking

**Files:**
- Modify: `skills/executing-plans/SKILL.md`
- Modify: `skills/subagent-driven-development/SKILL.md`

- [ ] **Step 1: Update `executing-plans`**

Add a "Lightweight Status Tracking" section before "The Process":

````markdown
## Lightweight Status Tracking

Status tracking is optional but recommended for multi-task plans. Use `docs/superpowers/status/<plan-name>-status.yaml`, where `<plan-name>` is the plan filename without `.md`.

When starting a plan, create the status file if it does not exist:

```yaml
plan_file: docs/superpowers/plans/example.md
started_at: YYYY-MM-DD
overall_status: in-progress
tasks:
  - id: 1
    name: Task name from plan
    status: pending
    completed_at:
```

When starting a task, set that task to `in-progress`. When it is verified and complete, set `status: complete` and `completed_at: YYYY-MM-DD`. When all tasks are complete, set `overall_status: complete`.

Preserve user edits and comments in the status file. If the status file cannot be updated cleanly, continue execution and report the tracking failure.
````

In Step 1 of the process, after TodoWrite creation, add:

```markdown
4. Create or resume the optional status file at `docs/superpowers/status/<plan-name>-status.yaml`.
5. Check for review continuation items before starting new work.
```

- [ ] **Step 2: Update `subagent-driven-development`**

Add a "Status Tracking" section after "Continuous execution":

```markdown
## Status Tracking

For plans with multiple tasks, maintain `docs/superpowers/status/<plan-name>-status.yaml` alongside TodoWrite.

- Create it after reading the plan and extracting tasks.
- Mark each task `in-progress` immediately before dispatching its implementer subagent.
- Mark each task `complete` with `completed_at: YYYY-MM-DD` only after spec compliance and code quality review both pass.
- Set `overall_status: complete` after the final code reviewer passes.
- If the file is missing during a resumed session, recreate it from the plan and mark already-completed tasks based on commits, checked plan boxes, and review records.
```

Add a status update box to the process diagram text by inserting this sentence after "Mark task complete in TodoWrite":

```markdown
Also update the YAML status file for that task before moving to the next task.
```

- [ ] **Step 3: Run targeted verification**

Run:

```bash
npm run test:skills
```

Expected: status tracking assertions pass; later assertions may still fail.

- [ ] **Step 4: Commit**

```bash
git add skills/executing-plans/SKILL.md skills/subagent-driven-development/SKILL.md
git commit -m "feat: add lightweight plan status tracking"
```

### Task 5: Add Quick-Dev Fast Path and Bootstrap Routing

**Files:**
- Create: `skills/quick-dev/SKILL.md`
- Modify: `skills/using-tungnt-ai-skills/SKILL.md`

- [ ] **Step 1: Create `skills/quick-dev/SKILL.md`**

Create a single-file fast-path skill:

```markdown
---
name: quick-dev
description: Use for trivial, low-risk implementation requests that can be completed in under 30 minutes and usually touch 1-2 files
---

# Quick Dev

Implement a small, clear change without the full brainstorming and writing-plans pipeline. This is a fast path, not a shortcut around quality.

## Scope Gate

Use this skill only when all of these are true:

- The user intent is clear without design exploration.
- The change is expected to take under 30 minutes.
- The change usually touches 1-2 files.
- There is no new architecture, workflow, data model, public API, migration, or broad behavior change.
- The risk of unintended consequences is low and easy to verify.

## Switch to `writing-plans`

Abort quick-dev and switch to `brainstorming` then `writing-plans` when any red flag appears:

- The request is ambiguous after one concise clarification.
- The change touches 3 or more files for reasons other than tests/docs.
- The change affects authentication, authorization, billing, data loss, migrations, security, concurrency, or persistent state.
- The fix requires choosing between multiple product behaviors.
- The user asks for a feature, workflow, or integration rather than a small tweak.
- Tests are unclear and cannot be made clear with a small focused check.

## Process

1. **Restate intent.** State the exact change, expected files, and verification command in 2-4 bullets.
2. **Check workspace.** Run `git status --short`. If unrelated dirty files overlap the target files, work with them carefully or ask before proceeding.
3. **Inspect first.** Read the relevant files and existing tests before editing.
4. **Make the smallest change.** Follow existing style and avoid new abstractions unless the local pattern already requires one.
5. **Verify.** Run the narrowest relevant test first, then a broader command when the project provides one.
6. **Self-review.** Check the diff for scope creep, missed edge cases, accidental formatting churn, and temporary debug output.
7. **Request review when risk is non-trivial.** Use `requesting-code-review` if the change is more than a mechanical one-file edit.
8. **Report.** Summarize files changed and verification results.

## One-Shot Review

For one-file mechanical edits, self-review is enough. For anything that changes behavior across a boundary, run a code review pass before reporting completion.
```

- [ ] **Step 2: Confirm bootstrap routing text**

If Task 2 already added the `quick-dev` bullet and routing example, only verify it remains accurate. If not present, add the same text from Task 2.

- [ ] **Step 3: Run targeted verification**

Run:

```bash
npm run test:skills
```

Expected: quick-dev assertions pass; later assertions may still fail.

- [ ] **Step 4: Commit**

```bash
git add skills/quick-dev/SKILL.md skills/using-tungnt-ai-skills/SKILL.md
git commit -m "feat: add quick dev workflow"
```

### Task 6: Add Spec Kernel, Review Continuation, and Definition-of-Done Gate

**Files:**
- Modify: `skills/brainstorming/SKILL.md`
- Modify: `skills/executing-plans/SKILL.md`
- Modify: `skills/finishing-a-development-branch/SKILL.md`

- [ ] **Step 1: Add Spec Kernel to brainstorming**

Add this section before "After the Design":

````markdown
## Spec Kernel

At the end of the approved design, optionally include a compact Spec Kernel that can be copied directly into `writing-plans`.

```markdown
## Spec Kernel

**Goal:** <one sentence describing the outcome>

**Users:** <who benefits or operates the change>

**Acceptance Criteria:**
- Given <precondition>, when <action>, then <expected result>.

**Constraints:**
- <non-negotiable technical, workflow, compatibility, or dependency constraint>

**Out of Scope:**
- <explicit non-goal>
```

Use the Spec Kernel when it improves handoff clarity. Do not replace the full design doc when the work is complex.
````

- [ ] **Step 2: Add review continuation awareness to `executing-plans`**

Add this section after "Step 1: Load and Review Plan":

````markdown
### Review Continuation

Before starting new plan tasks in a resumed session, search for unresolved review feedback:

```bash
rg -n "Must-Fix|Should-Fix|Critical|Important|review finding|code review|Acceptance Auditor|Edge Case Hunter|Blind Hunter" docs skills tests .
```

Treat unresolved review items as higher priority than pending plan tasks. Fix and verify them first, then continue the remaining plan tasks. If a review item conflicts with the plan, stop and ask the user whether to update the plan or reject the review finding with evidence.
````

- [ ] **Step 3: Add Definition-of-Done gate to finishing**

Insert this new step before the existing "Step 1: Verify Tests", then renumber later steps:

````markdown
### Step 1: Definition-of-Done Validation

Before presenting merge, PR, keep, or discard options, verify the work is actually done:

- All plan tasks are marked complete in the plan or status file.
- All new and existing tests relevant to the change pass.
- Modified code contains no temporary placeholders, debug output, or literal `TODO` / `FIXME` markers introduced by this change.
- Acceptance criteria mapped to tests or explicit verification commands.
- Review findings marked Must-Fix, Should-Fix, Critical, or Important are resolved or explicitly rejected with evidence.

Suggested checks:

```bash
git diff --check
rg -n "TODO|FIXME|console\\.log|debugger" <modified-files>
```

If any Definition-of-Done item fails, stop and fix it before continuing.
````

Change the overview line from:

```markdown
**Core principle:** Verify tests -> Detect environment -> Present options -> Execute choice -> Clean up.
```

to:

```markdown
**Core principle:** Validate Definition-of-Done -> Verify tests -> Detect environment -> Present options -> Execute choice -> Clean up.
```

- [ ] **Step 4: Run targeted verification**

Run:

```bash
npm run test:skills
```

Expected: all skill content tests pass.

- [ ] **Step 5: Commit**

```bash
git add skills/brainstorming/SKILL.md skills/executing-plans/SKILL.md skills/finishing-a-development-branch/SKILL.md
git commit -m "feat: add spec handoff and completion gates"
```

### Task 7: Final Verification and Sync Guard

**Files:**
- Modify only if verification exposes a real issue.

- [ ] **Step 1: Run existing and new tests**

Run:

```bash
npm run test:installer
npm run test:skills
```

Expected: both pass.

- [ ] **Step 2: Run content guard searches**

Run:

```bash
rg -n "resolve_customization.py|customize\\.toml|\\{communication_language\\}|\\{user_skill_level\\}|\\{implementation_artifacts\\}" skills/investigation skills/quick-dev
rg -n "bmad-" skills/investigation skills/quick-dev skills/using-tungnt-ai-skills
rg -n "https://github.com/bmad-code-org/BMAD-METHOD" skills docs/superpowers/specs
```

Expected:

- First command returns no matches.
- Second command returns no matches in new skill names or bootstrap naming.
- Third command returns public BMad links where source attribution is present.

- [ ] **Step 3: Validate no absolute local paths in committed skills/specs**

Run:

```bash
npm run test:skills
```

Expected: absolute-path scan passes for `skills` and `docs/superpowers/specs`.

- [ ] **Step 4: Optional upstream merge compatibility check**

Run only when network access and an `upstream` remote are available:

```bash
git fetch upstream
git merge upstream/main --no-commit --no-ff
git merge --abort
```

Expected: merge can be evaluated and aborted cleanly. If conflicts appear, record the conflicted files and decide whether the local changes should be moved or reduced.

- [ ] **Step 5: Commit any verification fixes**

If Task 7 required edits:

```bash
git add <fixed-files>
git commit -m "chore: tighten bmad cross pollination validation"
```

## Acceptance Criteria

- `skills/investigation/SKILL.md` exists, uses evidence grading, creates case files under `docs/superpowers/investigations/`, and contains no BMad config/persona machinery.
- `skills/quick-dev/SKILL.md` exists, has a strict scope gate, and routes out to `writing-plans` when risk grows.
- `skills/using-tungnt-ai-skills/SKILL.md` lists and routes `investigation` and `quick-dev`.
- Code review docs and prompts define Blind Hunter, Edge Case Hunter, Acceptance Auditor, and triage into Must-Fix, Should-Fix, Consider, and Praise.
- `executing-plans` and `subagent-driven-development` document optional YAML status tracking at `docs/superpowers/status/<plan-name>-status.yaml`.
- `executing-plans` prioritizes unresolved review feedback on resume.
- `brainstorming` includes an optional Spec Kernel with Goal, Users, Acceptance Criteria, Constraints, and Out of Scope.
- `finishing-a-development-branch` runs a Definition-of-Done validation before presenting branch completion options.
- `npm run test:installer` and `npm run test:skills` pass.
- No implemented skill contains local absolute paths, BMad TOML customization, BMad Python customization, BMad persona placeholders, or BMad-prefixed target skill names.
