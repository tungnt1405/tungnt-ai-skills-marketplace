# Specification: BMad Cross-Pollination (Strategy A)

## Problem

The `tungnt-ai-skills` fork (derived from `superpowers`) is a highly efficient, lean execution toolset (10 skills) built around Test-Driven Development (TDD) and isolated subagent tasks. However, it lacks features for debugging and code investigation, advanced multi-layered code reviews, lightweight progress tracking, and a fast-path execution mode for trivial changes.

On the other hand, the [BMad Method](https://github.com/bmad-code-org/BMAD-METHOD) is a comprehensive product development framework (44 skills, 6 personas) containing advanced capabilities in debugging, structural code reviews, sprint status tracking, and quick development.

We need to selectively port (cherry-pick) the most valuable capabilities from the BMad Method into the `tungnt-ai-skills` fork, creating a more powerful execution system while strictly maintaining:
1. **Zero third-party dependencies** (as per the fork's core design).
2. **Upstream pull compatibility** with the root `obra/superpowers` repository so that pulling/merging upstream updates remains conflict-free. Since this fork is for personal use only and will not be merged back upstream, we do not need to follow strict upstream PR submission guidelines.
3. **No absolute local machine links** in codebase documentation, using the public BMad GitHub URL structure instead.

---

## Goals

- Implement **Phase 1: Quick Wins** (within 1-2 days of work):
  - Add a dedicated `investigation` skill adapted from BMad's `bmad-investigate`.
  - Add parallel review lenses (Blind Hunter, Edge Case Hunter, Acceptance Auditor) to the existing code quality review pipeline.
  - Implement optional lightweight YAML-based sprint/plan status tracking.
- Implement **Phase 2: Strategic Enhancements** (within 1 week of work):
  - Add a `quick-dev` skill adapted from BMad's `bmad-quick-dev` to bypass full planning pipeline for small tweaks.
  - Add spec distillation output to the `brainstorming` skill.
  - Add review continuation awareness to the `executing-plans` skill.
  - Add a Definition-of-Done (DoD) check gate in `finishing-a-development-branch`.
- Ensure all ported skills strictly strip BMad's TOML customization logic, XML markup tags, and specific persona tags, keeping them lean and markdown-focused.
- Maintain simple pull-compatibility by keeping changes clean and decoupled.

## Non-goals

- Do not port BMad's multi-agent persona orchestration (`bmad-party-mode`) or business/marketing skills.
- Do not introduce BMad's TOML/Python configuration engine or any external dependencies.
- Do not use any absolute paths referencing local machine directories.

---

## Detailed Design

### Phase 1: Quick Wins

#### 1. Porting the Investigation Skill
A new general-purpose skill named `investigation` will be added.
- **Source inspiration:** [bmad-investigate](https://github.com/bmad-code-org/BMAD-METHOD/tree/main/.agents/skills/bmad-investigate/SKILL.md)
- **Target path:** `skills/investigation/SKILL.md`
- **Adaptation Rules:**
  - Strip the `resolve_customization.py` call and BMad TOML configuration references.
  - Strip persona variables (`{communication_language}`, `{user_skill_level}`, etc.).
  - Flatten any sub-steps into a single, cohesive markdown skill file.
  - Retain the evidence-grading framework (Grade A/B/C findings) to maintain high-quality diagnostic output.
  - Register the skill in the main bootstrap menu: `skills/using-tungnt-ai-skills/SKILL.md`.

#### 2. Enhanced Code Review with Parallel Layers
Integrate BMad's structured code review lenses into the existing two-stage review pipeline without introducing additional subagent runs.
- **Source inspiration:** [bmad-code-review](https://github.com/bmad-code-org/BMAD-METHOD/tree/main/.agents/skills/bmad-code-review/SKILL.md)
- **Target paths:** 
  - `skills/requesting-code-review/SKILL.md` (Modify)
  - `skills/subagent-driven-development/code-quality-reviewer-prompt.md` (Modify)
- **Implementation:**
  - Update `skills/requesting-code-review/SKILL.md` to define three parallel review lenses:
    1. **Blind Hunter:** Adversarial bug hunting, security verification.
    2. **Edge Case Hunter:** Focuses on boundary conditions, concurrency, and unhandled errors.
    3. **Acceptance Auditor:** Verifies strict compliance with the plan's requirements.
  - Update `skills/subagent-driven-development/code-quality-reviewer-prompt.md` to instruct the subagent to run these three lenses and categorize findings into a structured triage list (`Must-Fix`, `Should-Fix`, `Consider`, `Praise`).

#### 3. Lightweight Sprint/Plan Status Tracking
Create a lightweight, optional tracking mechanism for task completion during plan execution.
- **Target paths:**
  - `skills/executing-plans/SKILL.md` (Modify)
  - `skills/subagent-driven-development/SKILL.md` (Modify)
- **Implementation:**
  - Define a standard YAML format at `docs/superpowers/status/<plan-name>-status.yaml`.
  - When starting a plan, the agent creates this file containing `plan_file`, `started_at`, `overall_status: in-progress`, and the list of tasks.
  - Upon task completion, the executor updates `status: complete` and `completed_at` for that task in the status file.
  - When the final task is finished, the agent sets `overall_status: complete` in the status file.

---

### Phase 2: Strategic Enhancements

#### 4. Porting the Quick-Dev Skill
Provide a fast-track workflow to allow agents to bypass brainstorming and planning for simple bug fixes or tweaks (under 30 minutes, touching 1-2 files).
- **Source inspiration:** [bmad-quick-dev](https://github.com/bmad-code-org/BMAD-METHOD/tree/main/.agents/skills/bmad-quick-dev)
- **Target path:** `skills/quick-dev/SKILL.md`
- **Adaptation Rules:**
  - Flatten BMad's multi-file quick-dev steps into a single `SKILL.md` file.
  - Retain the Red Flags checklist (e.g., if a task touches 3+ files or is ambiguous, abort and switch back to `writing-plans`).
  - Add to the bootstrap menu `skills/using-tungnt-ai-skills/SKILL.md`.

#### 5. Spec Distillation in Brainstorming
Improve the convergence of the brainstorming process by formatting the output as a clean, standardized spec kernel.
- **Source inspiration:** [bmad-spec](https://github.com/bmad-code-org/BMAD-METHOD/tree/main/.agents/skills/bmad-spec/SKILL.md)
- **Target path:** `skills/brainstorming/SKILL.md` (Modify)
- **Implementation:**
  - Add an optional "Spec Kernel" template at the end of the brainstorming skill containing: `Goal`, `Users`, `Acceptance Criteria (AC)`, `Constraints`, and `Out of Scope`.
  - Ensure this spec kernel maps directly as the primary input for the `writing-plans` skill.

#### 6. Review Continuation Awareness
Provide agents with the ability to detect and prioritize fixing reviewed items when resuming a plan.
- **Target path:** `skills/executing-plans/SKILL.md` (Modify)
- **Implementation:**
  - Add instructions to search for existing code review comments and mark them as high-priority tasks.
  - Fixes for reviewed tasks must be resolved and verified before proceeding to any remaining pending plan tasks.

#### 7. Definition-of-Done (DoD) Validation Gate
Ensure a final quality gate is executed before presenting branch completion options.
- **Target path:** `skills/finishing-a-development-branch/SKILL.md` (Modify)
- **Implementation:**
  - Add a validation step before listing merge options.
  - The gate checks:
    - [ ] All plan tasks marked as complete.
    - [ ] All new and existing tests pass.
    - [ ] No temporary placeholders, `TODO`, or `FIXME` comments in modified code.
    - [ ] Acceptance criteria mapped to corresponding tests.

---

## Synchronization & Guardrails

Since this fork is for personal use and will not be merged back to `obra/superpowers`, the focus is on maintaining local stability and ease of pulling updates from upstream:

1. **Pull Compatibility:** Avoid renaming or deleting existing files unless absolutely necessary to ensure git can merge upstream updates smoothly. Modifying existing files is fully permitted.
2. **Naming Isolation:** Ported skills should use clean names without the `bmad-` prefix (e.g., `investigation` instead of `bmad-investigate`) to preserve the fork's identity.
3. **No Config Dependencies:** Do not import BMad's TOML config readers. If customization is required, use environment variables or local documentation files.
4. **Sync Validation:** After each phase, check compatibility with upstream main:
   ```bash
   git fetch upstream
   git merge upstream/main --no-commit --no-ff
   git merge --abort
   ```

---

## Acceptance Criteria

1. **Structure Validation:**
   - All newly added and modified skill files follow the standard markdown layout.
   - All references to BMad Method link directly to the public GitHub repository at `https://github.com/bmad-code-org/BMAD-METHOD`.
   - No absolute local machine paths exist in the spec or implemented skills.

2. **Integration Verification:**
   - The `using-tungnt-ai-skills` bootstrap skill correctly lists `investigation` and `quick-dev` when updated.
   - All existing tests pass.
