# tungnt-ai-skills for Google Antigravity

This repository includes Antigravity plugin metadata at:

```text
.agents/plugins/tungnt-ai-skills/
```

Antigravity discovers workspace plugins from `.agents/plugins/<plugin-name>/` or `_agents/plugins/<plugin-name>/`. The plugin must include `plugin.json`; optional components include `skills/`, `rules/`, `mcp_config.json`, and `hooks.json`.

This fork only adds the Antigravity JSON manifest. The canonical skills stay in the repository root `skills/` directory; there is no duplicated Antigravity-specific skills tree.

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

- `.agents/plugins/plugin.json`

## Global Install

For a global Antigravity install, stage the whole repository as the plugin root so the root `skills/` directory remains present.

Antigravity global plugin path:

```text
~/.gemini/config/plugins/tungnt-ai-skills/
```

Antigravity CLI staging path:

```text
~/.gemini/antigravity-cli/plugins/tungnt-ai-skills/
```

Do not copy only `.agents/plugins/tungnt-ai-skills/` for a global install unless your Antigravity setup only needs manifest metadata.
