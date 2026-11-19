# Installing tungnt-ai-skills for OpenCode

## Prerequisites

- [OpenCode.ai](https://opencode.ai) installed
- OpenCode `>= 1.18.30`

The plugin uses OpenCode's V2 plugin contract (`default { id, setup }`). Older builds
reject it at load time with `PluginModule.LoadError: Plugin must export a default
definition with an id and an effect or setup function`, which leaves the `skill` tool
empty. Upgrade OpenCode before installing.

## Installation

Recommended: one command via the shared installer (copies files; no config edit needed):

```bash
npm exec --yes --package=github:tungnt1405/tungnt-ai-skills-marketplace -- tungnt-ai-skills install --agent opencode
```

Details: [docs/README.opencode.md](../docs/README.opencode.md).

### Plugin configuration

To let OpenCode install the package itself, register the plugin in your
`opencode.json` (global or project-level):

```json
{
  "plugin": ["tungnt-ai-skills@git+https://github.com/tungnt1405/tungnt-ai-skills-marketplace"]
}
```

A `plugin` entry may also be a local path or `file://` URL to the plugin module.
Files auto-discovered from `~/.config/opencode/plugins/` need no entry at all.

Restart OpenCode. The plugin installs through OpenCode's plugin manager and registers
all bundled skills.

Verify by asking: "Tell me about tungnt-ai-skills"

OpenCode uses its own plugin install. If you also use Claude Code, Codex, or another harness, install `tungnt-ai-skills` separately for each one.

## Migrating from older installs

If you previously installed upstream `superpowers` or an older manual clone of this fork using symlinks, remove the old setup:

```bash
# Upstream cleanup: remove old symlinks
rm -f ~/.config/opencode/plugins/superpowers.js
rm -f ~/.config/opencode/plugins/tungnt-ai-skills.js
rm -rf ~/.config/opencode/skills/superpowers
rm -rf ~/.config/opencode/skills/tungnt-ai-skills

# Optionally remove the cloned repo
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

1. Check logs:
   `opencode run --standalone --print-logs "hello" 2>&1 | grep -i tungnt-ai-skills`,
   or inspect `~/.local/share/opencode/log/opencode.log` filtering for `role=server`.
2. A `PluginModule.LoadError` in the log means the host is older than the V2 contract.
   Upgrade OpenCode to `>= 1.18.30`.
3. Verify the plugin entry in your `opencode.json`.
4. Confirm `opencode --version` reports `>= 1.18.30`.

### Windows install issues

Some Windows OpenCode builds have upstream installer issues with git-backed plugin specs, including cache paths for `git+https` URLs and Bun not finding `git.exe` even when it works in a normal terminal. If OpenCode cannot install the plugin, try installing with system npm and pointing OpenCode at the local package:

```powershell
npm install tungnt-ai-skills@git+https://github.com/tungnt1405/tungnt-ai-skills-marketplace --prefix "$HOME\.config\opencode"
```

Then use the absolute path of the installed package in `opencode.json`:

```json
{
  "plugin": ["C:\\Users\\<you>\\.config\\opencode\\node_modules\\tungnt-ai-skills"]
}
```

OpenCode does not expand `~`; a `~/...` entry is treated as a package name, not a local directory.

### Skills not found

1. Confirm the plugin loaded (see above); a load error registers no skills at all.
2. Use the `skill` tool to list what's discovered.

### Tool mapping

Skills speak in actions ("create a todo", "dispatch a subagent", "read a file"). On
OpenCode `>= 1.18.30` the plugin injects this mapping:

- "Create a todo" → there is no todo tool; track the plan in a markdown file instead
- `Subagent (general-purpose):` template → `subagent` with `agent: "general"` (or
  `agent: "explore"` for codebase exploration); pass `sessionID` to continue a previous
  subagent
- "Invoke a skill" → OpenCode's native `skill` tool, with the skill directory name as its
  `id`
- "Read a file" → `read`
- "Create, edit, or delete files" → `patch` with `patchText` when available; otherwise
  `write` to create or overwrite, `edit` for targeted changes, and `shell` for deletion
- "Run a shell command" → `shell` (`command`, `workdir`, `timeout`, `background`)
- "Search file contents" / "find files by name" → `grep`, `glob`
- "Fetch a URL" → `webfetch`
- "Search the web" → `websearch`

Skills name each other as `superpowers:<name>`; OpenCode registers bare ids, so drop the
prefix (`superpowers:brainstorming` → `skill` with `id: "brainstorming"`).

## Help

- Report issues: https://github.com/tungnt1405/tungnt-ai-skills-marketplace/issues
- Repository: https://github.com/tungnt1405/tungnt-ai-skills-marketplace
