# tungnt-ai-skills for OpenCode

Complete guide for using `tungnt-ai-skills` with [OpenCode.ai](https://opencode.ai).

## Installation

Add `tungnt-ai-skills` to the `plugin` array in your `opencode.json` (global or project-level):

```json
{
  "plugin": ["tungnt-ai-skills@git+https://github.com/tungnt1405/ai-skills.git"]
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

### Finding Skills

Use OpenCode's native `skill` tool to list all available skills:

```text
use skill tool to list skills
```

### Loading a Skill

```text
use skill tool to load brainstorming
```

### Personal Skills

Create your own skills in `~/.config/opencode/skills/`:

```bash
mkdir -p ~/.config/opencode/skills/my-skill
```

Create `~/.config/opencode/skills/my-skill/SKILL.md`:

```markdown
---
name: my-skill
description: Use when [condition] - [what it does]
---

# My Skill

[Your skill content here]
```

### Project Skills

Create project-specific skills in `.opencode/skills/` within your project.

**Skill Priority:** Project skills > Personal skills > bundled `tungnt-ai-skills`

## Updating

OpenCode installs `tungnt-ai-skills` through a git-backed package spec. Some OpenCode and Bun versions pin that resolved git dependency in a lockfile or cache, so a restart may not pick up the newest commit. If updates do not appear, clear OpenCode's package cache or reinstall the plugin.

To pin a specific ref:

```json
{
  "plugin": ["tungnt-ai-skills@git+https://github.com/tungnt1405/ai-skills.git#main"]
}
```

## How It Works

The plugin does two things:

1. Injects bootstrap context so every conversation starts with `using-tungnt-ai-skills`.
2. Registers the bundled `skills/` directory so OpenCode discovers the fork's skills without symlinks or manual path config.

## Tool Mapping

Skills written for Claude Code are adapted for OpenCode like this:

- `TodoWrite` -> `todowrite`
- `Task` with subagents -> OpenCode's `@mention` system
- `Skill` tool -> OpenCode's native `skill` tool
- File operations -> native OpenCode tools

## Troubleshooting

### Plugin not loading

1. Check OpenCode logs: `opencode run --print-logs "hello" 2>&1 | grep -i tungnt-ai-skills`
2. Verify the plugin line in your `opencode.json` is correct
3. Make sure you're running a recent version of OpenCode

### Windows install issues

Some Windows OpenCode builds have upstream installer issues with git-backed plugin specs, including cache paths for `git+https` URLs and Bun not finding `git.exe` even when it works in a normal terminal. If OpenCode cannot install the plugin, try installing with system npm and pointing OpenCode at the local package:

```powershell
npm install tungnt-ai-skills@git+https://github.com/tungnt1405/ai-skills.git --prefix "$HOME\.config\opencode"
```

Then use the installed package path in `opencode.json`:

```json
{
  "plugin": ["~/.config/opencode/node_modules/tungnt-ai-skills"]
}
```

### Skills not found

1. Use OpenCode's `skill` tool to list available skills
2. Check that the plugin is loading
3. Each skill needs a `SKILL.md` file with valid YAML frontmatter

### Bootstrap not appearing

1. Restart OpenCode after config changes
2. Confirm the plugin can read `skills/using-tungnt-ai-skills/SKILL.md`

## Help

- Report issues: https://github.com/tungnt1405/ai-skills/issues
- Repository: https://github.com/tungnt1405/ai-skills.git
- OpenCode docs: https://opencode.ai/docs/
