# Sync Upstream Skills Design

## Goal

Add a harness-friendly CLI tool that updates this repository's bundled `skills/` from the original upstream skill repositories when an AI agent is asked to synchronize them.

## User Interface

The existing `tungnt-ai-skills` CLI gets a new subcommand:

```bash
tungnt-ai-skills sync-skills --dry-run
tungnt-ai-skills sync-skills --apply
tungnt-ai-skills sync-skills --source superpowers --apply
tungnt-ai-skills sync-skills --source ui-ux-pro-max --apply
```

`--dry-run` is the default. The command writes to disk only when `--apply` is present. This gives harnesses and agents a safe default that can show a plan before changing tracked skill files.

## Sources

The command synchronizes two upstream sources:

- `superpowers`: `https://github.com/obra/superpowers`, source path `skills/`, destination `skills/`
- `ui-ux-pro-max`: `https://github.com/nextlevelbuilder/ui-ux-pro-max-skill`, wrapper skill file `.claude/skills/ui-ux-pro-max/SKILL.md` plus source-of-truth directories `src/ui-ux-pro-max/data/`, `src/ui-ux-pro-max/scripts/`, and `src/ui-ux-pro-max/templates/`, destination `skills/ui-ux-pro-max/`

The `superpowers` source can add new skills or update existing skills in the root `skills/` directory. The `ui-ux-pro-max` source updates only `skills/ui-ux-pro-max/`.

## Behavior

The command clones each selected upstream repository into a temporary directory using the local `git` executable. It reads files from the temporary checkout and compares them to the local destination. It reports `added`, `updated`, and `removed` paths.

When applying changes, it replaces only the managed destination for the selected source:

- For `superpowers`, each upstream skill directory under upstream `skills/` is copied into local `skills/<skill-name>/`.
- For `ui-ux-pro-max`, upstream `.claude/skills/ui-ux-pro-max/SKILL.md` and all files under upstream `src/ui-ux-pro-max/data/`, `src/ui-ux-pro-max/scripts/`, and `src/ui-ux-pro-max/templates/` replace local `skills/ui-ux-pro-max/`.

This means non-Markdown assets such as CSV, YAML, TOML, JSON, Python, and future template/data files are copied recursively as long as they live under a managed upstream source directory.

The command does not delete local skill directories that are not managed by the selected source. This preserves fork-specific skills such as `using-tungnt-ai-skills`, `quick-dev`, or `investigation` unless an upstream source explicitly manages the same skill name.

## Safety

The implementation uses no new package dependencies. It relies on Node built-ins and `git`.

Before applying, the command validates:

- the repository root contains `package.json` and `skills/`
- `git` is available
- the cloned upstream source path exists
- each copied skill directory has a `SKILL.md`
- every write target resolves inside this repository's `skills/` directory

It excludes transient files and directories such as `.git`, `node_modules`, `.DS_Store`, `Thumbs.db`, `__pycache__`, and Python bytecode files.

## Testing

Tests should cover the sync module without network access by using local fixture directories as source overrides. The CLI test should verify:

- `sync-skills --dry-run` plans changes without writing
- `sync-skills --apply` writes added and updated skill files
- `--source` limits sync to one source
- invalid sources fail clearly
- writes outside `skills/` are refused

The existing installer tests remain the primary CLI regression suite.
