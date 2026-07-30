---
name: executing-plans
description: Use when you have a written implementation plan to execute in a separate session with review checkpoints
---

# Executing Plans

## Overview

Load the plan, critically review it, execute all tasks, report upon completion.

**Announcement:** "I am using the executing-plans skill to implement this plan."

**Note:** Tell your partner that tungnt-ai-skills works much better when it has access to subagents. Work quality will be significantly higher if run on a platform supporting subagents (such as Claude Code or Codex). If subagents are available, use `subagent-driven-development` instead of this skill.

## Settings Compliance

Before starting execution, check previously saved policies (if any); if not found or not remembered, MUST read `tais/setting.json` in the current workspace if available (fallback: `setting.json` at plugin root). Respect `policy.autoCommit`: when `false`, do not auto-commit — leave changes for the user. Respect `policy.autoTest`: when `false`, do not auto-run tests unless the user requests.

MUST remember policies when executing, ALWAYS PRIORITIZE following `tais/setting.json` in the current workspace if available or `setting.json` at plugin root to get policies.

## Lightweight Status Tracking

Recommended status tracking for multi-task plans. Change status directly at the top of file `docs/tungnt-ai-skills/plans/YYYY-MM-DD-<feature-name>.md` or `docs/tungnt-ai-skills/plans/YYYY-MM-DD-<feature-name>/*.md` files combined with TodoWrite.

When starting a task, set that task to `in-progress`. When it is verified and completed, set `status: complete` and `completed_at: YYYY-MM-DD`. When all tasks complete, set `overall_status: complete`.

Preserve user edits and comments in status files. If status file cannot be updated cleanly, continue execution and report tracking error.

## Phased Plan Support

When the plan uses phased output (`docs/tungnt-ai-skills/plans/YYYY-MM-DD-<feature-name>/plan.md` + `docs/tungnt-ai-skills/plans/YYYY-MM-DD-<feature-name>/phase-*.md` files), execute phases in dependency order:

1. Read `plan.md` to find phase mapping table and dependency graph.
2. For each phase (in dependency order):
   a. Read `phase-*.md` file.
   b. Check `status` in frontmatter — skip phases marked `complete`.
   c. Extract implementation steps into tasks.
   d. Execute tasks using normal per-task flow (Steps 2-3 below).
   e. Update phase frontmatter `status` to `complete` when all tasks pass.
3. After all phases complete, proceed to Step 3 (Finish Development).

Phase frontmatter is the source of truth for phase progress. Plan file or `phase-*` with optional status remains only runtime tracking.

Single plan files use current unchanged flow.

## The Process

### Step 1: Load and Review Plan
1. Read plan file
2. Critically review — identify questions or concerns about the plan
3. If concerns exist: Raise with partner before starting
4. If no concerns exist: Create TodoWrite and continue
5. Change status of the `docs/tungnt-ai-skills/plans/YYYY-MM-DD-<feature-name>/plan.md` or `docs/tungnt-ai-skills/plans/YYYY-MM-DD-<feature-name>/*.md` file being executed
6. Check review continuation item before starting new work

### Step 2: Execute Tasks

For each task:
1. Mark `in-progress` being worked on
2. Follow each step precisely (plan has micro-steps)
3. Run verification as specified
4. Mark complete

### Step 3: Finish Development

After all tasks complete and are verified:
- Announcement: "I am using the finishing-a-development-branch skill to finish this work."
- **MANDATORY SUB-SKILL:** Use `finishing-a-development-branch`
- Follow that skill to verify checks, present options, execute choice

## When to Stop and Ask for Help

**STOP execution immediately when:**
- Encountering a block (missing dependency, test failure, unclear instruction)
- Plan has critical gaps preventing start
- You don't understand instructions
- Verification fails repeatedly

**Ask for clarification instead of guessing.**

## When to Revisit Previous Steps

**Return to Review (Step 1) when:**
- Partner updates plan based on your feedback
- Need to re-`brainstorm` fundamental approach

**Don't force past blocks** — stop and ask.

## Remember
- Critically review plan first
- Follow plan steps precisely
- Don't skip verification
- Refer to skills when plan requests
- Stop when blocked, don't guess
- Never start implementation on main/master branch without explicit user consent

## Integration

**Mandatory process skills:**
- **using-git-worktrees** - Ensure isolated workspace (create or verify existing)
- **writing-plans** - Create plan that this skill executes
- **finishing-a-development-branch** - Finish development after all tasks
