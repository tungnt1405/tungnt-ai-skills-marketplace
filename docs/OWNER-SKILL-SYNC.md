# Owner Skill Sync Branch

Use branch `owner/skill-sync-updater` for owner-maintained skill sync work. Do not use this branch to change upstream `main` directly.

## Policies

- `superpowers`: `review-only`. Compare upstream ideas and explain candidate local edits. Do not copy upstream skills or overwrite local trigger logic.
- `ui-ux-pro-max`: `managed`. Sync data/scripts/templates recursively, then review wrapper text such as `SKILL.md` and `PROMPT.md`.
- BMAD-derived rules: `review-only`. Cherry-pick ideas such as quick-dev gates by rewriting for this fork.
- New repos: `preserve-existing` by default. Add new skills only; existing local skills are compared and skipped.

## Manual Flow

```powershell
npm.cmd exec -- tungnt-ai-skills sync-skills --source superpowers
npm.cmd exec -- tungnt-ai-skills sync-skills --source ui-ux-pro-max
npm.cmd run test:installer
npm.cmd run test:skills
git diff --check
```

For a new repo:

```powershell
npm.cmd exec -- tungnt-ai-skills sync-skills inspect --repo https://github.com/example/skills-pack.git
npm.cmd exec -- tungnt-ai-skills sync-skills add-source --name example-pack --repo https://github.com/example/skills-pack.git
npm.cmd exec -- tungnt-ai-skills sync-skills --source example-pack
```

Use `--policy review-only` when the repo is a forked workflow/process source.
