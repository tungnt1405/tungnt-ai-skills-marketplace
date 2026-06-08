# Extensible Skill Sync Sources Design

## Goal

Extend the upstream skill sync tool so new skill repositories can be onboarded without editing JavaScript source code. An AI agent should be able to respond to a prompt such as "add skills from repo X" by inspecting the repository, proposing a sync mapping, writing it to a registry, dry-running the sync, applying it after approval, and running tests.

## User Interface

The existing command remains:

```bash
npm exec -- tungnt-ai-skills sync-skills
npm exec -- tungnt-ai-skills sync-skills --source <name>
npm exec -- tungnt-ai-skills sync-skills --source <name> --apply
```

New onboarding commands:

```bash
npm exec -- tungnt-ai-skills sync-skills inspect --repo <git-url-or-local-path>
npm exec -- tungnt-ai-skills sync-skills add-source --name <name> --repo <git-url-or-local-path>
```

`inspect` never writes to the repository. It clones or opens the candidate source and prints detected skill layouts.

`add-source` writes a source entry to `skills.sync.json`. It uses the inspect recommendation when the layout is clear. If a repository has an unusual layout, the agent should create a spec/plan and edit `skills.sync.json` explicitly.

## Registry

The sync source registry lives at repository root:

```text
skills.sync.json
```

It stores the same source definitions the current tool has hardcoded:

- `skills-root`: copy every immediate child directory with `SKILL.md` from a source path into local `skills/<name>/`
- `single-skill`: copy one skill directory into local `skills/<destinationSkill>/`
- `composite-skill`: copy explicit files and directories into one local skill directory

The built-in `superpowers` and `ui-ux-pro-max` sources move into this registry. JavaScript code still has fallback defaults so tests and partial checkouts remain usable.

## Detection

`inspect` searches for common skill layouts:

- `skills/*/SKILL.md`
- `.claude/skills/*/SKILL.md`
- `.codex/skills/*/SKILL.md`
- `.github/copilot/skills/*/SKILL.md`
- root-level `SKILL.md`

If `skills/*/SKILL.md` exists, the recommended mapping is `skills-root` from `skills/`. If only one skill directory is found, the recommendation can be `single-skill`. The command reports all candidates so an agent can reason about unusual cases before writing config.

## Agent Workflow

Add a new skill named `upstream-skill-onboarding`. It should trigger when the user asks to add, import, onboard, or sync skills from an external repository.

The skill workflow:

1. Inspect the repo using `sync-skills inspect --repo <repo>`.
2. Explain the detected mapping and risks.
3. If the mapping is clear, run `sync-skills add-source --name <name> --repo <repo>`.
4. Run `sync-skills --source <name>` as a dry-run.
5. Ask before `--apply`.
6. After apply, run installer and skill-content tests.
7. Show the diff before commit.

## Safety

The existing safety model remains:

- dry-run by default
- no new package dependencies
- clone into temporary directories
- writes restricted to `skills/` and `skills.sync.json`
- transient files skipped
- tests use local fixtures and require no network
