---
name: executing-plans
description: Use when you have a written implementation plan to execute in a separate session with review checkpoints
---

# Executing Plans

## Overview

Load plan, review critically, execute all tasks, report when complete.

**Announce at start:** "I'm using the executing-plans skill to implement this plan."

**Note:** Tell your human partner that tungnt-ai-skills works much better with access to subagents. The quality of its work will be significantly higher if run on a platform with subagent support (such as Claude Code or Codex). If subagents are available, use `subagent-driven-development` instead of this skill.

## Settings Compliance

Before starting execution, read `setting.json` at the project root. Respect `policy.autoCommit`: when `false`, do not auto-commit — leave changes for the user. Respect `policy.autoTest`: when `false`, do not auto-run tests unless the user asks.

## Lightweight Status Tracking

Status tracking is optional but recommended for multi-task plans. Use `docs/tungnt-ai-skills/status/<plan-name>-status.yaml`, where `<plan-name>` is the plan filename without `.md`.

When starting a plan, create the status file if it does not exist:

```yaml
plan_file: docs/tungnt-ai-skills/plans/example.md
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

## Phased Plan Support

When the plan contains a `plan.md` with a phase mapping table and separate `phase-*.md` files, execute phases in dependency order:

1. Read `plan.md` to find the phase mapping table and dependency graph.
2. For each phase (in dependency order):
   a. Read the `phase-*.md` file.
   b. Check frontmatter `status` — skip phases already marked `complete`.
   c. Extract implementation steps as tasks.
   d. Execute tasks using the normal per-task flow (Steps 2-3 below).
   e. Update phase frontmatter `status` to `complete` when all tasks pass.
3. After all phases complete, proceed to Step 3 (Complete Development).

Phase frontmatter is the source of truth for phased progress. The optional YAML status file tracks runtime state but does not override phase frontmatter.

For single-plan files (no phase mapping table), use the existing flow unchanged. No separate status YAML is required for single-plan work.

## The Process

### Step 1: Load and Review Plan
1. Read plan file
2. Review critically - identify any questions or concerns about the plan
3. If concerns: Raise them with your human partner before starting
4. If no concerns: Create TodoWrite and proceed
5. Create or resume the optional status file at `docs/tungnt-ai-skills/status/<plan-name>-status.yaml`
6. Check for review continuation items before starting new work

### Step 2: Execute Tasks

For each task:
1. Mark as in_progress
2. Follow each step exactly (plan has bite-sized steps)
3. Run verifications as specified
4. Mark as completed

### Step 3: Complete Development

After all tasks complete and verified:
- Announce: "I'm using the finishing-a-development-branch skill to complete this work."
- **REQUIRED SUB-SKILL:** Use `finishing-a-development-branch`
- Follow that skill to verify tests, present options, execute choice

## When to Stop and Ask for Help

**STOP executing immediately when:**
- Hit a blocker (missing dependency, test fails, instruction unclear)
- Plan has critical gaps preventing starting
- You don't understand an instruction
- Verification fails repeatedly

**Ask for clarification rather than guessing.**

## When to Revisit Earlier Steps

**Return to Review (Step 1) when:**
- Partner updates the plan based on your feedback
- Fundamental approach needs rethinking

**Don't force through blockers** - stop and ask.

## Remember
- Review plan critically first
- Follow plan steps exactly
- Don't skip verifications
- Reference skills when plan says to
- Stop when blocked, don't guess
- Never start implementation on main/master branch without explicit user consent

## Integration

**Required workflow skills:**
- **using-git-worktrees** - Ensures isolated workspace (creates one or verifies existing)
- **writing-plans** - Creates the plan this skill executes
- **finishing-a-development-branch** - Complete development after all tasks
