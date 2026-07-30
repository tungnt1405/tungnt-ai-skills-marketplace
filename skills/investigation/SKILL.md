---
name: investigation
description: Use when investigating a bug, tracing an incident, exploring unfamiliar code, or building an evidence-backed case file before changing behavior
---

# Investigation

Investigate before fixing. Reconstruct what is happening from evidence, document confidence, and stop at diagnosis unless the user explicitly asks for implementation.

## Settings Scan

Before the investigation questions phase, read `tais/setting.json` in current workspace if available (fallback: `setting.json` at plugin root) (read-only — never modify). Check `policy.autoCommit`, `policy.autoTest`, `policy.dangerousCommands`, `policy.sensitiveFiles`, and `policy.installAndUpdate` to shape what questions you ask and what default assumptions you accept.

MANDATORY to remember policies when executing, ALWAYS PRIORITIZE following `tais/setting.json` in current workspace if available or `setting.json` at plugin root to get policies.

## When To Use

- A bug, incident, stack trace, log, diagnostic archive, failing test, or suspicious behavior needs diagnosis.
- A code area is unfamiliar and the user needs a reliable mental model before work starts.
- A prior investigation case file should be resumed.

DO NOT investigate, read restricted files, or use prohibited commands in `policy.dangerousCommands`, `policy.sensitiveFiles`.

## Output

Create or update a case file at `docs/tungnt-ai-skills/investigations/<slug>.md` for bugs, incidents, resumable investigations, or non-trivial code-area exploration. For a lightweight "explain this code path" request, report findings directly unless the user asks for a persistent case file.

The slug is a ticket ID when one exists. Otherwise derive a short lowercase kebab-case name from the problem statement. If the file already exists, resume it when the user asked for resume or follow-up; otherwise create `<slug>-YYYY-MM-DD.md`.

## Evidence Grades

- **Confirmed.** Directly observed evidence. Cite `path:line`, log timestamp, command output, or commit hash.

**Nature:** Objective data, empirical in nature, with absolute reproducibility. This is an irrefutable anchor point throughout the investigation process.

   - **Quantitative standard:** Traceability via invariant identifiers is required. Raw technical parameters must be provided, such as: specific `path:line` in source code, intact timestamps from system log files, standard output/error strings (stdout/stderr output) from the execution environment, or cryptographic hash codes (commit hash/checksum). Reinterpretation of data is not accepted.

   - **Deviation risk:** Evidence integrity may be compromised if data is tampered with, log extraction environments are contaminated, or system clocks (NTP) are out of phase. Validate the isolation of the data feed before accepting this grade.

- **Deduced.** Logically follows from Confirmed evidence. Show the chain.

**Nature:** Result of deductive reasoning, narrowly and directly interpolated from "Confirmed" grade evidence. Every step of information transformation must strictly adhere to causality.

   - **Quantitative standard:** Clear logical mapping is required. Linking from "Evidence A" to "Consequence B" must not contain unmeasured hidden variables. The absence of negative evidence is insufficient to turn a deduction into truth; deductions must be proven by the presence of known system rules.

   - **Deviation risk:** High risk of post hoc fallacies or ignoring confounding factors. A system state may be the result of overlapping concurrent execution threads, thus single-thread deductions easily lead to logical blind spots.

- **Hypothesized.** Plausible but unconfirmed. State what would confirm or refute it.

**Nature:** A grounded predictive model built to fill information gaps when the data chain is broken. The most critical characteristic of a scientific hypothesis is falsifiability.

   - **Quantitative standard:** Absolutely do not leave open-ended. Every hypothesis presented must immediately include test conditions. Specifically: must precisely define which actions, test tools, and target value thresholds will transition this hypothesis state to "Confirmed" or eliminate it entirely to "Refuted".

   - **Deviation risk:** Confirmation bias tendency, where subsequently collected data is distorted to try to fit the initial hypothesis. Unverified hypotheses must never be used as static premises for subsequent reasoning loops or as grounds to execute system-changing actions.

## Principles

- Treat the user's description as a hypothesis until evidence confirms it.
- Start from one Confirmed stronghold: exact error, function name, route, config key, failing test, timestamp, or commit.
- Follow evidence outward. When evidence contradicts the working theory, update the theory.
- Keep wrong turns. Mark hypotheses as Open, Confirmed, or Refuted instead of deleting them.
- Missing evidence is a finding. Document the gap, impact, and how to obtain it.
- Use CWD-relative `path:line` citations.
- Use parallel file reads and searches when evidence sources are independent.
- Delegate broad scans only when the platform supports subagents and the user or workflow allows delegation. Otherwise, narrow the scan and summarize evidence incrementally.

<HARD-GATE>
DO NOT invoke any implementation skill, write any code, set up any project, or perform any implementation action until you have completed the analysis and investigation of the requested task. This applies to EVERY project regardless of perceived simplicity.
</HARD-GATE>

## Safety

ALWAYS COMPLY WITH policies `policy.dangerousCommands`, `policy.sensitiveFiles`, do not run commands or read files specified in policies.

- Prefer read-only commands while collecting evidence.
- Do not run migrations, installers, cleanup scripts, external-service writes, destructive commands, or behavior-changing commands unless the user explicitly requests or approves them.
- Do not implement fixes during investigation unless the user changes the task from diagnosis to implementation.

## Process

1. **Route the input.**
   - Existing case file: read it, summarize open hypotheses, missing evidence, backlog, and last conclusion.
   - New issue: record the input shape, scope, and any stated hypothesis.
   **STOP TO CLARIFY when requirements are ambiguous, unclear, missing information, or hypotheses lack evidence:** stop and ask dialogue questions to get results when input needs clarification, hypotheses need clarification, or additional evidence needs to be provided to yield a final conclusion before continuing.

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
   - Fill the Debug Diagnosis table with evidence-graded symptom, expected behavior, root cause, blast radius, reproduction, verification, and debug artifacts.
   - Rewrite the Hand-off Brief.
   - State the Final Conclusion with High, Medium, or Low confidence.
   - Provide fix direction only at mechanism level.
   - Provide reproduction or verification steps.
   - Update case status to Active, Complete, Blocked, or Superseded.
   - Recommend the next workflow: `quick-dev` for simple confirmed fixes, `brainstorming` for complex fixes, build new confirmed features in cases with *high* and *medium* confidence. *LOW CONFIDENCE* requires asking user "EVALUATION has low confidence. You need to re-verify and proceed with analysis again to increase confidence."

## Confidence

- **High:** The symptom is reproduced or directly observed, and the root cause has cited evidence.
- **Medium:** The conclusion is deduced from confirmed evidence, with minor uncertainty remaining.
- **Low:** The conclusion is plausible but depends on clearly named missing evidence. **Mark RED/GREEN** for low confidence cases and ask the user to re-check results and search for additional input data to provide for analysis to raise confidence.

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

## Debug Diagnosis

| Field | Detail |
| --- | --- |
| Exact symptom | <observable behavior and how it was detected> |
| Expected behavior | <what should happen under the same conditions> |
| Root cause | <confirmed or hypothesized cause with evidence grade> |
| Blast radius | <other features, users, or data affected> |
| Reproduction | <minimal steps to trigger the symptom> |
| Verification steps | <commands or checks that confirm the fix works> |
| Debug artifacts | <relevant logs, screenshots, diagnostic output, or snapshots> |

## Conclusion

**Confidence:** High / Medium / Low

<Summary separating Confirmed, Deduced, and Hypothesized conclusions.>

## Recommended Next Steps

### Fix direction

<Mechanism-level fix direction. Cite root cause from Debug Diagnosis. Stay at diagnosis level — do not implement.>

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
