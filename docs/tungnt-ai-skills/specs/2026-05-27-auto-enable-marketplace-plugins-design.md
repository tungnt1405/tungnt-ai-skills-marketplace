# Auto-enable marketplace plugins design

## Problem

The npm installer can place `tungnt-ai-skills` files for supported agents, but some agents still require manual activation after install.

Codex currently writes the local marketplace entry and then asks the user to open the UI or `/plugins` to install the plugin. GitHub Copilot CLI currently uses a direct copy target, while the desired setup is marketplace registration through `~/.copilot/settings.json`.

The installer should leave both agents ready to use after `tungnt-ai-skills install` whenever their configuration files are writable.

## Goals

- After Codex marketplace setup, ensure `~/.codex/config.toml` enables the plugin.
- Configure GitHub Copilot CLI by creating or updating `~/.copilot/settings.json`.
- Preserve existing config content and keep output files valid when they already contain other settings.
- Put the `tungnt-ai-skills` marketplace/plugin entries before existing object entries in Copilot settings.
- Keep the installer zero-dependency and testable with temporary HOME directories.
- Make dry-run output list the settings/config files that would be written.

## Non-goals

- Do not change skill content or plugin metadata.
- Do not rely on networked marketplace commands for Copilot.
- Do not add a full TOML parser dependency.
- Do not redesign the existing Codex local marketplace package copy.

## Codex behavior

Codex keeps the current local marketplace install flow:

- Copy `.codex-plugin`, `assets`, and `skills` into `~/.codex/.tmp/plugins/plugins/tungnt-ai-skills-marketplace`.
- Write or update `~/.codex/.tmp/plugins/.agents/plugins/marketplace.json` with the local marketplace plugin entry.

After that, the installer ensures `~/.codex/config.toml` contains:

```toml
[plugins."tungnt-ai-skills@openai-curated"]
enabled = true
```

If the file does not exist, the installer creates it with only that table. If the file exists, the installer appends or replaces only the target table. Existing unrelated TOML content remains intact.

For existing files, the safest zero-dependency TOML strategy is section-level text editing:

- Find a table header exactly matching `[plugins."tungnt-ai-skills@openai-curated"]`.
- If present, replace that table body up to the next table header with `enabled = true`.
- If absent, append a blank line and the target table to the end of the file.
- Preserve a final newline.

This avoids trying to parse arbitrary TOML while still preventing duplicate plugin enable tables.

## Copilot behavior

The Copilot target should create or update:

```text
~/.copilot/settings.json
```

The desired minimum file is:

```json
{
  "extraKnownMarketplaces": {
    "tungnt-ai-skills-marketplace": {
      "source": {
        "source": "github",
        "repo": "tungnt1405/tungnt-ai-skills-marketplace"
      }
    }
  },
  "enabledPlugins": {
    "tungnt-ai-skills@tungnt-ai-skills-marketplace": true
  }
}
```

When `extraKnownMarketplaces` already has entries, the installer writes `tungnt-ai-skills-marketplace` first and then writes the previous entries after it. When `enabledPlugins` already has entries, the installer writes `tungnt-ai-skills@tungnt-ai-skills-marketplace` first and then writes the previous entries after it.

The JSON writer should parse the existing file with `JSON.parse`, update object properties, and write back with `JSON.stringify(settings, null, 2)`. This guarantees valid JSON formatting after merge and avoids manual comma insertion bugs. If the existing file is invalid JSON, the install should fail for Copilot with a clear message and should not overwrite the invalid file.

If `extraKnownMarketplaces` or `enabledPlugins` exists but is not an object, the installer should fail with a clear message. Replacing non-object user data would be too surprising.

## Target map changes

Add data-driven config write declarations to `installer/target-map.js` instead of hard-coding Codex and Copilot behavior in the install loop.

Codex should declare:

- config file: `~/.codex/config.toml`
- kind: `tomlPluginEnable`
- plugin id: `tungnt-ai-skills@openai-curated`

Copilot should declare:

- settings file: `~/.copilot/settings.json`
- kind: `copilotSettings`
- marketplace id: `tungnt-ai-skills-marketplace`
- marketplace source: GitHub repo `tungnt1405/tungnt-ai-skills-marketplace`
- enabled plugin id: `tungnt-ai-skills@tungnt-ai-skills-marketplace`

The Copilot target should no longer be modeled as only a direct plugin-folder copy. Its install behavior is configuration-based marketplace setup.

## Installer architecture

Add small config helpers in `installer/cli.js` or a new `installer/config-writers.js` module:

- `writeCodexPluginEnable(filePath, pluginId)`
- `writeCopilotSettings(filePath, marketplaceId, marketplaceSource, enabledPluginId)`
- `writeTargetConfigs(target, env, io)`
- `listTargetConfigs(target, env)`

The main install flow should call config writers after package/marketplace writes for each target. Dry-run should print planned config files without writing.

Atomic writes should follow the existing marketplace pattern: write to `file.tmp`, then rename.

## Error handling

- Missing Copilot settings JSON: create the file.
- Invalid Copilot settings JSON: fail the Copilot target with the parse error path and leave the file unchanged.
- Existing Copilot object key with invalid type: fail without modifying the file.
- Existing Codex TOML with the target table: replace only that table.
- Existing Codex TOML without the target table: append the target table.
- Partial failure in `--all`: continue other targets and report failed target ids, matching current installer behavior.

## Tests

Add dependency-free Node tests for:

- Codex install creates `~/.codex/config.toml` with the plugin enabled.
- Codex install updates an existing config with unrelated TOML content and no duplicate plugin table.
- Copilot install creates `~/.copilot/settings.json` with `extraKnownMarketplaces` and `enabledPlugins`.
- Copilot install merges existing `extraKnownMarketplaces` and puts `tungnt-ai-skills-marketplace` first.
- Copilot install merges existing `enabledPlugins` and puts `tungnt-ai-skills@tungnt-ai-skills-marketplace` first.
- Copilot install fails on invalid JSON without overwriting the file.
- Dry-run prints planned Codex and Copilot config files.

## Documentation

Update `README.md` so the npm installer section says:

- Codex writes the local marketplace entry and enables `tungnt-ai-skills@openai-curated` in `~/.codex/config.toml`.
- Copilot writes marketplace and enabled plugin settings to `~/.copilot/settings.json`.

Keep the manual Copilot instructions short and focused on the equivalent marketplace commands for debugging.

## Acceptance criteria

- `npm run test:installer` passes.
- `install --agent codex` in a temp HOME writes both Codex marketplace metadata and `~/.codex/config.toml`.
- `install --agent copilot` in a temp HOME writes `~/.copilot/settings.json`.
- Existing valid Copilot JSON remains valid JSON after merge.
- Existing valid Codex TOML keeps unrelated content and has exactly one target plugin enable table.
