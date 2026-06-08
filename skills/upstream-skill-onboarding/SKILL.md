---
name: upstream-skill-onboarding
description: Use when the user asks to add, import, onboard, or synchronize skills from an external repository into this project
---

# Upstream Skill Onboarding

Use this skill when a user provides a repository and asks to add, import, onboard, or sync its skills into this project.

## Goal

Turn an external skill repository into a managed sync source in `skills.sync.json`, then sync it through the normal CLI path instead of manually copying files.

## Workflow

1. **Identify the repository**
   - Extract the Git URL or local path from the user's request.
   - If no repository is provided, ask for it.

2. **Inspect first**
   - Run:

     ```bash
     npm exec -- tungnt-ai-skills sync-skills inspect --repo <repo>
     ```

   - On Windows PowerShell, use `npm.cmd exec -- ...` if `npm.ps1` is blocked.
   - Do not apply or copy files before inspection.

3. **Review the mapping**
   - Confirm whether the repository layout is a clear `skills-root` or `single-skill` mapping.
   - If the layout is unusual, create a short spec and plan before editing `skills.sync.json`.
   - Do not invent paths. Use only paths found by inspect or verified by reading the cloned repository.

4. **Add the source**
   - If the mapping is clear, run:

     ```bash
     npm exec -- tungnt-ai-skills sync-skills add-source --name <source-name> --repo <repo>
     ```

   - Choose a stable source name using lowercase letters, digits, dots, dashes, or underscores.

5. **Dry-run sync**
   - Run:

     ```bash
     npm exec -- tungnt-ai-skills sync-skills --source <source-name>
     ```

   - Report the added, updated, and removed counts.

6. **Ask before apply**
   - Explain what will be changed.
   - Apply only after user approval:

     ```bash
     npm exec -- tungnt-ai-skills sync-skills --source <source-name> --apply
     ```

7. **Verify**
   - Run:

     ```bash
     npm.cmd run test:installer
     npm.cmd run test:skills
     git diff --check
     ```

   - Use `npm run ...` instead of `npm.cmd run ...` on shells where `npm` works directly.

8. **Show the diff**
   - Show `git status --short` and summarize the relevant changes.
   - Do not commit until the user approves the diff, unless the user already asked you to commit.

## Safety Rules

- Never manually copy skill files from an external repository when the sync tool can manage them.
- Never run `--apply` before a dry-run.
- Never overwrite unrelated local skills.
- Keep external source definitions in `skills.sync.json`, not hardcoded JavaScript.
- If a repository needs a composite mapping, document the chosen files/directories in a spec before applying.
