# Release notes

## 2026-08-03

### Skills and workflows

- Clearly separated process skills from domain skills; the agent selects a workflow before
  loading the required domain knowledge.
- Updated `brainstorming`, `investigation`, `writing-plans`, execution, and review.
- Added `ba-spec`, `figma-to-code`, and related document templates.

### Installer and hooks

- Added native plugin metadata for GitHub Copilot CLI.
- Separated hooks by harness:
  - Claude/Codex: `hooks/hooks.json`
  - GitHub Copilot CLI: `hooks/hooks-copilot.json`
- Added the shared polyglot dispatcher `hooks/run-hook.cmd` for Bash hooks on Windows,
  macOS, and Linux. The Claude Code manifest enforces `shell: "bash"` to prevent command
  parsing errors caused by quoted paths in PowerShell/CMD; the dispatcher supports Git Bash
  in its standard installation directory or `bash` on `PATH`. The Antigravity manifest also
  uses this dispatcher for its `PreInvocation` bootstrap hook.
- Added skill structure validation and regression tests for the installer and bootstrap.

### Installation and updates

```bash
# Install
npm exec --yes --package=github:tungnt1405/tungnt-ai-skills-marketplace -- tungnt-ai-skills install

# Update
npm exec --yes --package=github:tungnt1405/tungnt-ai-skills-marketplace -- tungnt-ai-skills update
```

Native installation and update for one agent:

```bash
npm exec --yes --package=github:tungnt1405/tungnt-ai-skills-marketplace -- tungnt-ai-skills install --agent copilot --native
npm exec --yes --package=github:tungnt1405/tungnt-ai-skills-marketplace -- tungnt-ai-skills update --agent copilot --native
```

See [README.md](README.md) for agent-specific commands and manual installation instructions.
