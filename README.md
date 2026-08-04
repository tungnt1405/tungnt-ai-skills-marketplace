# tungnt-ai-skills

A collection of skills for Claude Code, Codex, GitHub Copilot CLI, Gemini CLI, and Antigravity.
Each session automatically loads `using-tungnt-ai-skills`, then selects the appropriate
workflow for investigation, brainstorming, planning, implementation, and review.

## Quick installation

Requirement: Node.js with `npm exec` or `npx`.

```bash
npm exec --yes --package=github:tungnt1405/tungnt-ai-skills-marketplace -- tungnt-ai-skills install
```

The command above installs the plugin for all supported agents. To install it for one agent only:

```bash
npm exec --yes --package=github:tungnt1405/tungnt-ai-skills-marketplace -- tungnt-ai-skills install --agent codex
```

Valid agents: `claude`, `codex`, `copilot`, `gemini`, `agy`, `antigravity`,
`antigravity-ide`, `antigravity-all`.

Preview the changes without writing files:

```bash
npm exec --yes --package=github:tungnt1405/tungnt-ai-skills-marketplace -- tungnt-ai-skills install --dry-run
```

## Install with a native CLI

Add `--native` to have the installer call the agent's CLI:

```bash
npm exec --yes --package=github:tungnt1405/tungnt-ai-skills-marketplace -- tungnt-ai-skills install --agent claude --native
npm exec --yes --package=github:tungnt1405/tungnt-ai-skills-marketplace -- tungnt-ai-skills install --agent codex --native
npm exec --yes --package=github:tungnt1405/tungnt-ai-skills-marketplace -- tungnt-ai-skills install --agent copilot --native
```

`--native` applies to Claude Code, Codex, and GitHub Copilot CLI. Gemini and Antigravity use
file copies managed by the installer.

To install without `npx`, run the following commands directly:

```bash
# Claude Code
claude plugin marketplace add tungnt1405/tungnt-ai-skills-marketplace
claude plugin install tungnt-ai-skills@tungnt-ai-skills-marketplace
claude plugin enable tungnt-ai-skills@tungnt-ai-skills-marketplace

# Codex
codex plugin marketplace add tungnt1405/tungnt-ai-skills-marketplace
codex plugin add tungnt-ai-skills@tungnt-ai-skills-marketplace

# GitHub Copilot CLI
copilot plugin marketplace add tungnt1405/tungnt-ai-skills-marketplace
copilot plugin install tungnt-ai-skills@tungnt-ai-skills-marketplace
```

## Update

Update all installations managed by the installer:

```bash
npm exec --yes --package=github:tungnt1405/tungnt-ai-skills-marketplace -- tungnt-ai-skills update
```

Update one native plugin:

```bash
npm exec --yes --package=github:tungnt1405/tungnt-ai-skills-marketplace -- tungnt-ai-skills update --agent claude --native
npm exec --yes --package=github:tungnt1405/tungnt-ai-skills-marketplace -- tungnt-ai-skills update --agent codex --native
npm exec --yes --package=github:tungnt1405/tungnt-ai-skills-marketplace -- tungnt-ai-skills update --agent copilot --native
```

To update natively without `npx`, run the following commands directly:

```bash
# Claude Code
claude plugin marketplace update tungnt-ai-skills-marketplace
claude plugin update tungnt-ai-skills@tungnt-ai-skills-marketplace

# Codex: refresh the marketplace, then reinstall the plugin
codex plugin marketplace upgrade tungnt-ai-skills-marketplace
codex plugin remove tungnt-ai-skills@tungnt-ai-skills-marketplace
codex plugin add tungnt-ai-skills@tungnt-ai-skills-marketplace

# GitHub Copilot CLI
copilot plugin marketplace update tungnt-ai-skills-marketplace
copilot plugin update tungnt-ai-skills@tungnt-ai-skills-marketplace
```

## Manual installation without npm/npx

Clone the repository, then copy the entire package to the agent's plugin directory:

| Agent | Directory |
| --- | --- |
| Claude Code | `~/.claude/plugins/cache/tungnt-ai-skills-marketplace` |
| Codex | `~/.codex/plugins/tungnt-ai-skills-marketplace` |
| GitHub Copilot CLI | `~/.copilot/installed-plugins/tungnt-ai-skills-marketplace/tungnt-ai-skills` |
| Gemini CLI | `~/.gemini/extensions/tungnt-ai-skills` |
| Antigravity CLI | `~/.gemini/antigravity-cli/plugins/tungnt-ai-skills` |
| Antigravity IDE | `~/.gemini/config/plugins/tungnt-ai-skills` |

## Verification

Start a new session and request a coding task. The plugin is working correctly when the agent
automatically loads `using-tungnt-ai-skills` before selecting the next skill.

For configuration details, see [docs/setting-configuration.md](docs/setting-configuration.md).

## License

MIT. Forked from [obra/superpowers](https://github.com/obra/superpowers).
