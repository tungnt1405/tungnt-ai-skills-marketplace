# Testing and Manual Sync

This file is a quick operator guide for manually checking the upstream skill sync tool before committing changes.

## Sync Tool

The sync command is exposed through the existing CLI. From this repository root, use `npm exec`:

```bash
npm exec -- tungnt-ai-skills sync-skills
npm exec -- tungnt-ai-skills sync-skills --source superpowers
npm exec -- tungnt-ai-skills sync-skills --source ui-ux-pro-max
```

On Windows PowerShell, use `npm.cmd` if `npm.ps1` is blocked:

```powershell
npm.cmd exec -- tungnt-ai-skills sync-skills
npm.cmd exec -- tungnt-ai-skills sync-skills --source superpowers
npm.cmd exec -- tungnt-ai-skills sync-skills --source ui-ux-pro-max
```

You can also run the bin directly:

```bash
node bin/tungnt-ai-skills.js sync-skills --source superpowers
```

The shorter command works only after the package is installed or linked into your PATH:

```bash
npm link
tungnt-ai-skills sync-skills --source superpowers
```

Dry-run is the default. It clones the upstream repo into a temporary directory, compares files, prints a summary, and does not write to this checkout.

To apply changes:

```bash
npm exec -- tungnt-ai-skills sync-skills --apply
npm exec -- tungnt-ai-skills sync-skills --source superpowers --apply
npm exec -- tungnt-ai-skills sync-skills --source ui-ux-pro-max --apply
```

## What Gets Synced

`superpowers` syncs upstream skill directories from:

```text
https://github.com/obra/superpowers.git
upstream: skills/
local:    skills/
```

`ui-ux-pro-max` is a composite sync:

```text
https://github.com/nextlevelbuilder/ui-ux-pro-max-skill.git
upstream: .claude/skills/ui-ux-pro-max/SKILL.md
upstream: src/ui-ux-pro-max/data/
upstream: src/ui-ux-pro-max/scripts/
upstream: src/ui-ux-pro-max/templates/
local:    skills/ui-ux-pro-max/
```

That means CSV, YAML, TOML, JSON, Python, Markdown, and future files under those managed directories are copied recursively. Cache and transient files such as `.git`, `node_modules`, `__pycache__`, `.pyc`, `.DS_Store`, and `Thumbs.db` are skipped.

## Before Commit

After applying a sync, inspect the diff first:

```bash
git status --short
git diff --stat
git diff -- skills
```

Then run the regression checks.

On Windows PowerShell, prefer `npm.cmd` because some machines block `npm.ps1`:

```powershell
npm.cmd run test:installer
npm.cmd run test:skills
git diff --check
```

On shells where `npm` works directly:

```bash
npm run test:installer
npm run test:skills
git diff --check
```

Commit only after the tests pass and the skill diff matches the upstream sync you intended.

## Network Notes

Manual sync requires `git` and network access to GitHub. If the command fails before cloning, verify:

```bash
git --version
git ls-remote https://github.com/obra/superpowers.git HEAD
git ls-remote https://github.com/nextlevelbuilder/ui-ux-pro-max-skill.git HEAD
```

The installer tests do not require network access; they use local fixtures to verify sync behavior.

## Adding Another Skills Repository

Use inspect first. It does not write files:

```bash
npm exec -- tungnt-ai-skills sync-skills inspect --repo https://github.com/example/skills-pack.git
```

If the recommendation is clear, add it to the registry:

```bash
npm exec -- tungnt-ai-skills sync-skills add-source --name example-pack --repo https://github.com/example/skills-pack.git
```

This writes a new entry to:

```text
skills.sync.json
```

Then run a dry-run:

```bash
npm exec -- tungnt-ai-skills sync-skills --source example-pack
```

Apply only after reviewing the dry-run:

```bash
npm exec -- tungnt-ai-skills sync-skills --source example-pack --apply
```

The auto-detected layouts currently support common repositories shaped like:

```text
skills/<skill-name>/SKILL.md
.claude/skills/<skill-name>/SKILL.md
.codex/skills/<skill-name>/SKILL.md
.github/copilot/skills/<skill-name>/SKILL.md
SKILL.md
```

For unusual layouts, inspect the repository, decide the mapping, and edit `skills.sync.json` explicitly. Composite sources can map explicit files and directories into a single local skill.

## Agent Prompt Flow

When asking an AI agent to add a new skills repo, use a prompt like:

```text
Tôi muốn thêm skills từ repo https://github.com/example/skills-pack.
Hãy inspect repo, đề xuất mapping, thêm source, dry-run, rồi hỏi tôi trước khi apply.
```

The agent should use the `upstream-skill-onboarding` skill and follow this order:

1. `sync-skills inspect --repo <repo>`
2. explain detected mapping
3. `sync-skills add-source --name <name> --repo <repo>`
4. `sync-skills --source <name>`
5. ask before `--apply`
6. run tests after apply
7. show the diff before commit
