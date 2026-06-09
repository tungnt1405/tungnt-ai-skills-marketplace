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

Create or update a case file at `docs/tungnt-ai-skills/investigations/<slug>.md` for bugs, incidents, resumable investigations, or non-trivial code-area exploration. For a lightweight "explain this code path" request, report findings directly unless the user asks for a persistent case file.

The slug is a ticket ID when one exists. Otherwise derive a short lowercase kebab-case name from the problem statement. If the file already exists, resume it when the user asked for resume or follow-up; otherwise create `<slug>-YYYY-MM-DD.md`.

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
- Delegate broad scans only when the platform supports subagents and the user or workflow allows delegation. Otherwise, narrow the scan and summarize evidence incrementally.

## Safety

- Prefer read-only commands while collecting evidence.
- Do not run migrations, installers, cleanup scripts, external-service writes, destructive commands, or behavior-changing commands unless the user explicitly requests or approves them.
- Do not implement fixes during investigation unless the user changes the task from diagnosis to implementation.

## Process

1. **Route the input.**
   - Existing case file: read it, summarize open hypotheses, missing evidence, backlog, and last conclusion.
   - New issue: record the input shape, scope, and any stated hypothesis.

2. **Find the stronghold.**
   - Identify one Confirmed anchor independently from the user's theory.
   - If no Confirmed anchor is available after checking accessible sources, create an evidence-light case file with a prioritized data-collection backlog and pause.

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
   - Update case status to Active, Complete, Blocked, or Superseded.
   - Recommend the next workflow: `quick-dev` for trivial confirmed fixes, `brainstorming` plus `writing-plans` for ambiguous product or behavior choices, `writing-plans` only when requirements are already explicit, or `requesting-code-review` for review.

## Confidence

- **High:** The symptom is reproduced or directly observed, and the root cause has cited evidence.
- **Medium:** The conclusion is deduced from confirmed evidence, with minor uncertainty remaining.
- **Low:** The conclusion is plausible but depends on missing evidence that is clearly named.

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
| Status | Active / Complete / Blocked / Superseded |
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
