# Testing And Manual Skill Updates

Use this guide when an agent needs to compare, update, or add skills from another repository without changing the main branch directly or breaking this fork's skill trigger order.

## Branch Model

Use `owner/skill-sync-updater` as the reusable work branch for skill update operations:

```bash
git switch owner/skill-sync-updater
git pull
```

This branch contains the sync tooling, owner-only skill updater workflow, and minor version `1.1.0`. If you look at `main` before merging this branch or a feature branch based on it, `main` can still show the older version.

Do not run skill sync work directly on `main`.

After the update is reviewed and tested, create a clean feature branch for the change you want to merge:

```bash
git switch -c feature/add-skill-abc
git add .
git commit -m "feat: add skill abc"
git push -u origin feature/add-skill-abc
```

Open the PR from `feature/add-skill-abc` into `main`.

## Moving Changes To Main

Keep `owner/skill-sync-updater` as the working branch. Move only reviewed files into a merge branch.

Recommended flow:

```bash
git switch owner/skill-sync-updater
git pull
git switch -c feature/add-skill-abc
git status --short
git diff --stat
```

Stage only the intended files:

```bash
git add skills/new-skill/SKILL.md
git add skills/new-skill/data/items.csv
git add tests/skill-content/run-tests.js
```

Do not use broad `git add .` when a sync touched many files. Use `git status --short` and add exact paths so review-only comparison output does not accidentally enter the PR.

When the update is only for an existing local skill, inspect the file diff and keep fork wording:

```bash
git diff -- skills/brainstorming/SKILL.md
git add skills/brainstorming/SKILL.md
```

When a repo adds a brand-new skill, include the full skill directory only after reviewing its trigger and tests:

```bash
git add skills/example-new-skill
git add tests/skill-content/run-tests.js
```

When `ui-ux-pro-max` updates managed assets, add only the approved managed paths:

```bash
git add skills/ui-ux-pro-max/data
git add skills/ui-ux-pro-max/scripts
git add skills/ui-ux-pro-max/templates
```

Review wrapper files separately before adding them:

```bash
git diff -- skills/ui-ux-pro-max/SKILL.md skills/ui-ux-pro-max/PROMPT.md
git add skills/ui-ux-pro-max/SKILL.md
git add skills/ui-ux-pro-max/PROMPT.md
```

## Conflict Handling

Before merging or rebasing a feature branch, update from `main`:

```bash
git fetch origin
git rebase origin/main
```

If a conflict appears, resolve by file type:

- `skills/using-tungnt-ai-skills/SKILL.md`: keep local fork trigger order unless the PR intentionally changes bootstrap behavior.
- `skills/brainstorming/SKILL.md`, `skills/quick-dev/SKILL.md`, TDD/planning/review skills: keep fork logic; manually cherry-pick wording only after reading both sides.
- `skills/ui-ux-pro-max/data`, `scripts`, `templates`: prefer the approved synced asset version if the PR is specifically updating `ui-ux-pro-max`.
- New skill directory: keep the whole directory if it was intentionally added and has reviewed trigger text.
- Version/manifest files: keep the branch version bump only if this PR is intended to publish a new version.

Useful conflict commands:

```bash
git status --short
git diff --name-only --diff-filter=U
git diff --ours -- path/to/file
git diff --theirs -- path/to/file
```

Use one side only when the decision is clear:

```bash
git checkout --ours path/to/file
git checkout --theirs path/to/file
git add path/to/file
```

For behavior-shaping skills, prefer manual editing over choosing a whole side. After resolving:

```bash
git add path/to/resolved-file
git rebase --continue
```

If the conflict involves trigger order and you are unsure, stop and ask before continuing.

## Quick Run Checklist

Start from the updater branch:

```bash
git switch owner/skill-sync-updater
git pull
```

Ask the agent to inspect and dry-run first. After you approve the apply step, run the checks.

Linux/macOS:

```bash
npm run test:installer
npm run test:skills
git diff --check
git status --short
```

Windows PowerShell:

```powershell
npm.cmd run test:installer
npm.cmd run test:skills
git diff --check
git status --short
```

Create the branch you want to merge into `main`:

```bash
git switch -c feature/add-skill-abc
git add .
git commit -m "feat: add skill abc"
git push -u origin feature/add-skill-abc
```

## Agent Prompt

Use a prompt like this:

```text
Toi muon them/cap nhat skills tu repo https://github.com/example/skills-pack.
Hay dung owner-skill-sync-updater: inspect repo, phan loai policy, dry-run,
giai thich skill nao nen them/sua va ly do. Khong apply khi chua hoi toi.
```

The agent should follow this order:

1. Load the normal bootstrap/process skills first.
2. Use `owner-skill-sync-updater`.
3. Inspect the repo.
4. Classify the source policy.
5. Dry-run.
6. Explain what should change and why.
7. Ask before `--apply`.
8. Run tests after apply.
9. Show the diff before commit.

## Source Policies

`superpowers`: `review-only`

- Compare upstream ideas and report candidate local edits.
- Do not copy upstream skills.
- Do not add `using-superpowers`.
- Do not overwrite local `using-tungnt-ai-skills`, `quick-dev`, `brainstorming`, TDD, planning, or review trigger logic.

BMAD-derived workflow rules: `review-only`

- Cherry-pick ideas such as quick-dev gates only after rewriting for this fork.
- Do not change the fork's process logic unless the owner explicitly approves the specific behavior change.

`ui-ux-pro-max`: managed composite source

- Sync data/scripts/templates recursively when approved.
- Review wrapper text such as `SKILL.md` and `PROMPT.md` before accepting upstream wording.
- Keep it as a domain skill; it must not replace process skills.

New skills repos: `preserve-existing`

- Add brand-new skills.
- Existing local skills are compared and skipped.
- Design triggers so they do not weaken this fork's TDD, planning, review, or bootstrap gates.

## Commands

Dry-run all known sources:

Linux/macOS:

```bash
npm exec -- tungnt-ai-skills sync-skills
```

Windows PowerShell:

```powershell
npm.cmd exec -- tungnt-ai-skills sync-skills
```

Dry-run one known source:

Linux/macOS:

```bash
npm exec -- tungnt-ai-skills sync-skills --source superpowers
npm exec -- tungnt-ai-skills sync-skills --source ui-ux-pro-max
```

Windows PowerShell:

```powershell
npm.cmd exec -- tungnt-ai-skills sync-skills --source superpowers
npm.cmd exec -- tungnt-ai-skills sync-skills --source ui-ux-pro-max
```

Inspect a new repo:

Linux/macOS:

```bash
npm exec -- tungnt-ai-skills sync-skills inspect --repo https://github.com/example/skills-pack.git
```

Windows PowerShell:

```powershell
npm.cmd exec -- tungnt-ai-skills sync-skills inspect --repo https://github.com/example/skills-pack.git
```

Add a new skills repo with the default `preserve-existing` policy:

Linux/macOS:

```bash
npm exec -- tungnt-ai-skills sync-skills add-source --name example-pack --repo https://github.com/example/skills-pack.git
```

Windows PowerShell:

```powershell
npm.cmd exec -- tungnt-ai-skills sync-skills add-source --name example-pack --repo https://github.com/example/skills-pack.git
```

Add a forked workflow/process repo as review-only:

Linux/macOS:

```bash
npm exec -- tungnt-ai-skills sync-skills add-source --name workflow-pack --repo https://github.com/example/workflow-pack.git --policy review-only
```

Windows PowerShell:

```powershell
npm.cmd exec -- tungnt-ai-skills sync-skills add-source --name workflow-pack --repo https://github.com/example/workflow-pack.git --policy review-only
```

Dry-run the new source:

Linux/macOS:

```bash
npm exec -- tungnt-ai-skills sync-skills --source example-pack
```

Windows PowerShell:

```powershell
npm.cmd exec -- tungnt-ai-skills sync-skills --source example-pack
```

Apply only after review:

Linux/macOS:

```bash
npm exec -- tungnt-ai-skills sync-skills --source example-pack --apply
```

Windows PowerShell:

```powershell
npm.cmd exec -- tungnt-ai-skills sync-skills --source example-pack --apply
```

`--apply` is policy-aware. Review-only sources still do not write files.

## Review Before Commit

Inspect the diff:

```powershell
git status --short
git diff --stat
git diff -- skills
```

Run checks:

Linux/macOS:

```bash
npm run test:installer
npm run test:skills
git diff --check
```

Windows PowerShell:

```powershell
npm.cmd run test:installer
npm.cmd run test:skills
git diff --check
```

Commit only after tests pass and the diff is focused on the intended skill update.

## Network Notes

Manual sync requires `git` and network access to GitHub. If cloning fails, verify:

```bash
git --version
git ls-remote https://github.com/obra/superpowers.git HEAD
git ls-remote https://github.com/nextlevelbuilder/ui-ux-pro-max-skill.git HEAD
```

Installer tests do not require network access; they use local fixtures.
