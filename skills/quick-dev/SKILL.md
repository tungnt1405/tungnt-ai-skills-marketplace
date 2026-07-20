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
- The change is expected to touch 1-2 non-test/non-doc files.
- There is no new architecture, workflow, data model, public API, migration, or broad behavior change.
- The risk of unintended consequences is low and easy to verify.

## Micro-Brainstorm Preflight

When the request is not fully explicit, ask one concise confirmation covering exact change, expected files, and verification. If the user answer expands scope or reveals a behavior/design choice, stop quick-dev and switch to `brainstorming`.

**Skip preflight only when BOTH conditions are met:** the user specified exact file and line/function AND the edit does not change runtime behavior (pure refactor, rename, or style fix).

## Relationship To Brainstorming

When the `quick-dev` scope gate passes, `quick-dev` is the selected process skill instead of `brainstorming`. If the gate fails or is uncertain, `brainstorming` remains mandatory for creative work, new functionality, or behavior changes.

## Escalate Out Of Quick Dev

Abort quick-dev and switch to `brainstorming` then `writing-plans` when any red flag appears:

- The request is ambiguous after one concise clarification.
- The change touches 3 or more files for reasons other than tests or docs.
- The change affects authentication, authorization, billing, data loss, migrations, security, concurrency, or persistent state.
- The fix requires choosing between multiple product behaviors.
- The user asks for a feature, workflow, or integration rather than a small tweak.
- Tests are unclear and cannot be made clear with a small focused check.

When escalating, state explicitly:

> "This work exceeds quick-dev scope because [specific reason]. Switching to brainstorming."

Do not ask whether to escalate — if the gate fails, escalation is mandatory.

## Process

1. **Restate intent and verify scope.** State the exact change, expected files, and verification command in 2-4 bullets. If the restatement reveals ambiguity or scope exceeding the gate, escalate immediately.
2. **Check workspace.** Run `git status --short`. If unrelated dirty files overlap the target files, work with them carefully or ask before proceeding.
3. **Inspect first.** Read the relevant files and existing tests before editing.
4. **Make the smallest change.** Follow existing style and avoid new abstractions unless the local pattern already requires one.
5. **Verify.** Run the narrowest relevant test first, then a broader command when the project provides one.
6. **Self-review.** Check the diff for scope creep, missed edge cases, accidental formatting churn, and temporary debug output.
7. **Request review when risk is non-trivial.** Use `requesting-code-review` if the change is more than a mechanical one-file edit.
8. **Report.** Summarize files changed and verification results.

## One-Shot Review

For one-file mechanical edits, self-review is enough. For anything that changes behavior across a boundary, run a code review pass before reporting completion.
