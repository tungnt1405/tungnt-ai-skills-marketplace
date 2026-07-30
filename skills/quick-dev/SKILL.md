---
name: quick-dev
description: Use for trivial, low-risk implementation requests that can be completed in under 30 minutes and typically touch 1-2 files
---

# Quick Development

Implement a small, clear change that always requires brainstorming to reason about the issue but does not require full planning and writing-plans. This is a fast path, not a shortcut around quality.

## Settings Scan

- Check if brainstorming memory recorded policies for compliance; STRICTLY COMPLY with policies. If policies are lost or missing, read `tais/setting.json` in the current workspace if available (fallback: `setting.json` at plugin root) (read-only — never mutate). Check `policy.autoCommit`, `policy.autoTest`, `policy.dangerousCommands`, `policy.sensitiveFiles`, and `policy.installAndUpdate` to shape which questions you ask and default assumptions you accept.

If the file is missing, continue with defaults. MUST remember and follow settings in `tais/setting.json` (fallback: `setting.json` at plugin root).

MUST remember policies when executing, ALWAYS PRIORITIZE following `tais/setting.json` in the current workspace if available or `setting.json` at plugin root to get policies.

## Scope Gate

Only use this skill when ALL of the following are true:

- User intent is clear without design exploration.
- Expected change under 30 minutes.
- Expected change touches 1-2 non-test/non-doc files.
- No new architecture, workflow, data model, public API, migration, or broad behavior change.
- Risk of unintended consequences is low and easily verifiable.

## Micro-Brainstorm Preflight

When request is not completely clear, ask one brief confirmation covering exact change, expected files, and verification. If user's answer expands scope or reveals behavior/design choices, stop quick-dev and switch to `brainstorming` for full planning and writing-plans.

**Skip preflight ONLY WHEN BOTH conditions are met:** user specifies exact file and line/function AND edit does not change runtime behavior (pure refactor, rename, or style fix). Always use brainstorming reasoning and then execute without full planning and writing-plans.

## Relationship to Brainstorming

When `quick-dev` scope gate passes, `quick-dev` is a process skill combined with `brainstorming` for fast implementation instead of doing full planning. If gate fails or is uncertain, `brainstorming` remains mandatory for creative work, new features, or behavior changes for full planning.

## Escalation Out of Quick Dev

Abort quick-dev and switch to `brainstorming` when any red flag appears:

- Request vague after one short clarification.
- Change touches 3 or more files for reasons other than test or documentation.
- Change affects auth, permissions, payment, data loss, migration, security, concurrency, or persistent state.
- Bug fix requires choosing between multiple product behaviors.
- User requests feature, workflow, or integration instead of small edit.
- Tests unclear and cannot be clarified by small focused check.

When escalating, state clearly:

> "This work exceeds quick-dev scope because [specific reason]. Switching to brainstorming."

Do NOT ask whether to escalate — if gate fails, escalation is mandatory.

## The Process

1. **Discuss and clarify issue.** Create discussion questions directly with user to determine requirements and clarify issues using prompt values.
2. **Restate intent and verify scope.** State exact change, expected files, and verification command in 2-4 bullet points. If restatement reveals ambiguity or scope exceeds gate, escalate immediately.
3. **Check workspace.** Run `git status --short`. If unrelated dirty files overlap target files, work carefully or ask before proceeding.
4. **Pre-check.** Read related files and existing tests before editing.
5. **Make minimal change.** Follow existing style and avoid new abstractions unless local patterns demand them.
6. **Verify.** Run narrowest relevant tests first, then broader commands as project provides.
7. **Self-review.** Inspect diff for scope creep, missed edge cases, unintended formatting changes, and temporary debug outputs.
8. **Request review on high and critical risk.** Use `requesting-code-review` if change is more than a single-file mechanical edit.
9. **Report.** Summarize changed files and verification results.

## Single Review Pass

For single-file mechanical edits, use `brainstorming` to think and evaluate then decide. For anything changing behavior across boundaries, run one code review pass before reporting completion.
