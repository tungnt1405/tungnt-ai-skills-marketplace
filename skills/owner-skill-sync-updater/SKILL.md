---
name: owner-skill-sync-updater
description: Use when the owner asks to add, inspect, compare, sync, or update skills from an external skills repository, including Superpowers, BMAD-derived workflow rules, ui-ux-pro-max assets, or a new skills repo URL.
---

# Owner Skill Sync Updater

This skill is for this fork's owner-maintained skill update branch. It coordinates external skill repos without breaking the fork's existing trigger order.

## Required Order

1. Load the normal bootstrap/process skills first.
2. Classify the requested source before running `--apply`.
3. Dry-run and explain the plan.
4. Ask before applying any source that can write files.
5. Run tests and show the diff before commit.

## Source Classification

Use these policies:

- `review-only`: forked or behavior-shaping workflow sources. Never copy, update, or delete files automatically. Use this for `superpowers` and BMAD-derived process rules.
- `managed`: domain asset sources that this fork intentionally vendors. Use this for `ui-ux-pro-max` data/scripts/templates. Still review wrapper text such as `SKILL.md` and `PROMPT.md` for fork context.
- `preserve-existing`: new third-party skills repos. Add brand-new local skills, but do not modify files inside local skills that already exist.

## Superpowers And BMAD Rules

For Superpowers or BMAD-derived workflow rules:

- Do not copy upstream skills directly into this fork.
- Do not add upstream bootstrap skills such as `using-superpowers`; this fork uses `using-tungnt-ai-skills`.
- Do not reintroduce old upstream example names when local equivalents exist, such as `CLAUDE_MD_TESTING.md` when the fork uses `PROJECT_INSTRUCTIONS_TESTING.md`.
- Compare upstream ideas against local `SKILL.md` files and report specific candidate changes with reasons.
- Preserve trigger order: `using-tungnt-ai-skills` first, then the selected process skill, then domain skills.
- Preserve `quick-dev` as the selected process skill when its scope gate passes; do not route those cases back through `brainstorming`.

When a change is needed, rewrite wording for this fork's context instead of copying upstream prose verbatim.

## UI UX Pro Max Rules

For `ui-ux-pro-max`:

- Treat CSV, YAML, TOML, JSON, Python, and template files under managed data/script/template directories as vendored assets.
- Review `SKILL.md` and `PROMPT.md` wording before applying upstream text because this fork wraps the domain skill.
- Keep `ui-ux-pro-max` as a domain skill. It must not replace the process skill selected by the bootstrap.

## New Repo Flow

When the owner gives a new repo URL:

1. Run `sync-skills inspect --repo <repo>`.
2. Explain detected layout and recommended policy.
3. If it is a forked workflow/process repo, add with `--policy review-only`.
4. If it is a new skills pack, add with default `preserve-existing`.
5. Dry-run the new source.
6. Propose trigger names and skill placement without weakening TDD, planning, or review gates.
7. Ask before apply.
8. Run `npm.cmd run test:installer`, `npm.cmd run test:skills`, and `git diff --check`.

## Commands

```powershell
npm.cmd exec -- tungnt-ai-skills sync-skills inspect --repo <repo>
npm.cmd exec -- tungnt-ai-skills sync-skills add-source --name <name> --repo <repo> --policy review-only
npm.cmd exec -- tungnt-ai-skills sync-skills add-source --name <name> --repo <repo>
npm.cmd exec -- tungnt-ai-skills sync-skills --source <name>
npm.cmd exec -- tungnt-ai-skills sync-skills --source <name> --apply
```
