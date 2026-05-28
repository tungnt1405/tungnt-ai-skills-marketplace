# tungnt-ai-skills for Google Antigravity

This repository includes Antigravity plugin metadata at the repository root for global installs:

```text
plugin.json
skills/
```

It also keeps workspace metadata at:

```text
.agents/plugins/tungnt-ai-skills-marketplace/
```

Antigravity discovers workspace plugins from `.agents/plugins/<plugin-name>/` or `_agents/plugins/<plugin-name>/`. The plugin must include `plugin.json`; optional components include `skills/`, `rules/`, `mcp_config.json`, and `hooks.json`.

The canonical skills stay in the repository root `skills/` directory; there is no duplicated Antigravity-specific skills tree.

## Use In This Repo

Open this repository in Antigravity, then run:

```text
/plugins
```

Enable or verify:

```text
tungnt-ai-skills
```

The workspace plugin metadata is:

- `.agents/plugins/tungnt-ai-skills-marketplace/plugin.json`

## Global Install

For a global Antigravity install, stage the repository root as the plugin root so `plugin.json` and the root `skills/` directory remain together.

Antigravity CLI plugin path:

```text
~/.gemini/antigravity-cli/plugins/tungnt-ai-skills/
```

Antigravity and Antigravity IDE share this plugin path:

```text
~/.gemini/config/plugins/tungnt-ai-skills/
```

In both cases, `skills/using-tungnt-ai-skills/SKILL.md` must be inside the plugin root:

```text
~/.gemini/antigravity-cli/plugins/tungnt-ai-skills/skills/using-tungnt-ai-skills/SKILL.md
~/.gemini/config/plugins/tungnt-ai-skills/skills/using-tungnt-ai-skills/SKILL.md
```

The installer also copies these shared global files to `~/.gemini`:

```text
~/.gemini/AGENTS.md
~/.gemini/CLAUDE.md
~/.gemini/GEMINI.md
~/.gemini/gemini-extension.json
```

`GEMINI.md` is written to load the bootstrap skill from the installed plugin root for the current harness. Do not copy only `.agents/plugins/tungnt-ai-skills-marketplace/` for a global install unless your Antigravity setup only needs manifest metadata.
