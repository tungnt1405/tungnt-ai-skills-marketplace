# Installing tungnt-ai-skills for OpenCode

## Prerequisites

- [OpenCode.ai](https://opencode.ai) installed

## Installation

Add `tungnt-ai-skills` to the `plugin` array in your `opencode.json` (global or project-level):

```json
{
  "plugin": ["tungnt-ai-skills@git+https://github.com/tungnt1405/tungnt-ai-skills-marketplace"]
}
```

Restart OpenCode. The plugin installs through OpenCode's plugin manager and registers all bundled skills.

Verify by asking: "Tell me about tungnt-ai-skills"

OpenCode uses its own plugin install. If you also use Claude Code, Codex, or another harness, install `tungnt-ai-skills` separately for each one.

## Migrating from older installs

If you previously installed upstream `superpowers` or an older manual clone of this fork using symlinks, remove the old setup:

```bash
rm -f ~/.config/opencode/plugins/superpowers.js
rm -f ~/.config/opencode/plugins/tungnt-ai-skills.js
rm -rf ~/.config/opencode/skills/superpowers
rm -rf ~/.config/opencode/skills/tungnt-ai-skills
rm -rf ~/.config/opencode/superpowers
rm -rf ~/.config/opencode/tungnt-ai-skills
```

Then follow the installation steps above.

## Usage

Use OpenCode's native `skill` tool:

```text
use skill tool to list skills
use skill tool to load brainstorming
```

## Updating

OpenCode installs `tungnt-ai-skills` through a git-backed package spec. Some OpenCode and Bun versions pin that resolved git dependency in a lockfile or cache, so a restart may not pick up the newest commit. If updates do not appear, clear OpenCode's package cache or reinstall the plugin.

To pin a specific ref:

```json
{
  "plugin": ["tungnt-ai-skills@git+https://github.com/tungnt1405/tungnt-ai-skills-marketplace#main"]
}
```

## Troubleshooting

### Plugin not loading

1. Check logs: `opencode run --print-logs "hello" 2>&1 | grep -i tungnt-ai-skills`
2. Verify the plugin line in your `opencode.json`
3. Make sure you're running a recent version of OpenCode

### Windows install issues

Some Windows OpenCode builds have upstream installer issues with git-backed plugin specs, including cache paths for `git+https` URLs and Bun not finding `git.exe` even when it works in a normal terminal. If OpenCode cannot install the plugin, try installing with system npm and pointing OpenCode at the local package:

```powershell
npm install tungnt-ai-skills@git+https://github.com/tungnt1405/tungnt-ai-skills-marketplace --prefix "$HOME\.config\opencode"
```

Then use the installed package path in `opencode.json`:

```json
{
  "plugin": ["~/.config/opencode/node_modules/tungnt-ai-skills"]
}
```

### Skills not found

1. Use `skill` tool to list what's discovered
2. Check that the plugin is loading

### Tool mapping

When skills reference Claude Code tools:

- `TodoWrite` -> `todowrite`
- `Task` with subagents -> `@mention` syntax
- `Skill` tool -> OpenCode's native `skill` tool
- File operations -> your native tools

## Help

- Report issues: https://github.com/tungnt1405/ai-skills/issues
- Repository: https://github.com/tungnt1405/tungnt-ai-skills-marketplace
