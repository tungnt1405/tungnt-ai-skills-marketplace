# tungnt-ai-skills for OpenCode

This repository ships a native OpenCode plugin plus the canonical skills tree:

```text
.opencode/plugins/tungnt-ai-skills.js   # OpenCode plugin entry point
.opencode/INSTALL.md                    # short install notes
skills/                                 # canonical skills tree
```

The plugin does two things:

1. Registers the repository's `skills/` directory in OpenCode's `skills.paths`, so every bundled skill is discovered natively by OpenCode's `skill` tool.
2. Injects the `using-tungnt-ai-skills` bootstrap context into the first user message of each session, with a tool-mapping note for OpenCode. The bootstrap is marked `ALREADY LOADED`, so the agent follows its routing rules without re-loading the bootstrap skill.

## Prerequisites

- [OpenCode](https://opencode.ai) installed and runnable from a terminal.
- Node.js with `npm exec` or `npx` (required by the recommended installer method).
- `git` available (for the git-backed install method).

## Install Method 0: npx installer (recommended)

```bash
npm exec --yes --package=github:tungnt1405/tungnt-ai-skills-marketplace -- tungnt-ai-skills install --agent opencode
```

This copies the package to `~/.config/opencode/tungnt-ai-skills/` and registers the plugin file at
`~/.config/opencode/plugins/tungnt-ai-skills.js` (symlink on Linux/macOS, plain copy on Windows).
Update later with `tungnt-ai-skills update --agent opencode`. With `--native`, the installer instead merges the
git-backed plugin entry shown in Method 1 into `~/.config/opencode/opencode.json` (removing any prior copy-mode
files), so OpenCode itself manages download and caching at startup. Update natively with
`tungnt-ai-skills update --agent opencode --native`.

## Install Method 1: Plugin spec

Add `tungnt-ai-skills` to the `plugin` array in your `opencode.json` (project-level or global at `~/.config/opencode/opencode.json`):

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["tungnt-ai-skills@git+https://github.com/tungnt1405/tungnt-ai-skills-marketplace"]
}
```

Restart OpenCode. It resolves the git-backed package, loads `.opencode/plugins/tungnt-ai-skills.js` from it, and registers all bundled skills.

To pin a specific ref:

```json
{
  "plugin": ["tungnt-ai-skills@git+https://github.com/tungnt1405/tungnt-ai-skills-marketplace#main"]
}
```

## Install Method 2: Manual / local checkout

Use this when you keep a local clone (for example to track `main` manually) or when your OpenCode build has trouble with `git+https` specs.

1. Clone the repository somewhere stable:

   ```bash
   git clone https://github.com/tungnt1405/tungnt-ai-skills-marketplace.git ~/.config/opencode/tungnt-ai-skills
   ```

2. Link the plugin file into OpenCode's global plugins directory:

   ```bash
   mkdir -p ~/.config/opencode/plugins
   ln -sf ~/.config/opencode/tungnt-ai-skills/.opencode/plugins/tungnt-ai-skills.js \
     ~/.config/opencode/plugins/tungnt-ai-skills.js
   ```

3. Restart OpenCode. The plugin auto-registers the cloned `skills/` directory; no `plugin:` entry is needed because files in `~/.config/opencode/plugins/` are discovered automatically.

If you use a custom config directory, set `OPENCODE_CONFIG_DIR`; the plugin honors it when resolving paths.

### Windows notes

Some Windows OpenCode builds have upstream issues with `git+https` cache paths and Bun not finding `git.exe`. Fall back to system npm:

```powershell
npm install tungnt-ai-skills@git+https://github.com/tungnt1405/tungnt-ai-skills-marketplace --prefix "$HOME\.config\opencode"
```

Then reference the installed package path:

```json
{
  "plugin": ["~/.config/opencode/node_modules/tungnt-ai-skills"]
}
```

## Verify

1. Restart OpenCode after any config or plugin change (config is not hot-reloaded).
2. Ask the agent to list skills; `using-tungnt-ai-skills`, `brainstorming`, `writing-plans`, and the rest of `skills/` should appear.
3. Start a new session and confirm the agent follows the bootstrap routing rules without being told twice.
4. Check logs if unsure:

   ```bash
   opencode run --print-logs "hello" 2>&1 | grep -i tungnt-ai-skills
   ```

## Updating

OpenCode may pin resolved git dependencies in its package cache, so a restart alone might not pick up new commits. If updates do not appear, clear OpenCode's package cache or reinstall the plugin, then restart again.

For manual installs, pull inside the clone:

```bash
git -C ~/.config/opencode/tungnt-ai-skills pull --ff-only
```

## Migrating from older installs

Remove legacy symlinks or copies before switching install methods:

```bash
rm -f ~/.config/opencode/plugins/superpowers.js
rm -f ~/.config/opencode/plugins/tungnt-ai-skills.js
rm -rf ~/.config/opencode/skills/superpowers
rm -rf ~/.config/opencode/skills/tungnt-ai-skills
rm -rf ~/.config/opencode/superpowers
rm -rf ~/.config/opencode/tungnt-ai-skills
```

Then follow one of the install methods above.

## Tool mapping

Skills are written harness-neutral but reference Claude Code tool names. The injected bootstrap includes this mapping automatically:

| Skill text | Use in OpenCode |
| --- | --- |
| `TodoWrite` | `todowrite` |
| `Task` tool with subagents | subagent system (`@mention`) |
| `Skill` tool | OpenCode's native `skill` tool |
| `Read`, `Write`, `Edit`, `Bash` | your native tools |

## See also

- `.opencode/INSTALL.md`: condensed install notes kept next to the plugin file.
- [docs/README.antigravity.md](README.antigravity.md): equivalent guide for Google Antigravity.
- Report issues: <https://github.com/tungnt1405/tungnt-ai-skills-marketplace/issues>
