# Native Codex and Copilot installs design

## Problem

The installer currently handles Codex and Copilot through local file/config writes:

- Codex copies a local marketplace package, writes a local `marketplace.json`, and enables a plugin table in `~/.codex/config.toml`.
- Copilot writes `~/.copilot/settings.json` directly.

This is more brittle than using each tool's native plugin commands. The install target should prefer native plugin workflows and avoid manually editing Codex or Copilot config for these agents.

## Goals

- Change Codex install to use the native Codex CLI marketplace command.
- Change Copilot install to use the native Copilot CLI marketplace and install commands.
- Check that the native binary exists before running real native install commands, and fail with a clear message if it is missing.
- Keep dry-run usable on machines where `codex` or `copilot` is not installed.
- Keep `--all` partial failure behavior: a missing native binary fails that target but does not prevent other selected targets from running.
- Do not update `README.md` for this change.

## Non-goals

- Do not write `~/.codex/config.toml` for Codex plugin enablement.
- Do not write `~/.copilot/settings.json` for Copilot plugin setup.
- Do not create `~/.codex/installed-plugins/tungnt-ai-skills-marketplace`.
- Do not invent a non-interactive Codex plugin install command. Local `codex plugin --help` exposes marketplace management but not plugin install.

## Codex behavior

Codex should be a native command target.

Dry-run prints:

```bash
codex plugin marketplace add tungnt1405/tungnt-ai-skills-marketplace
```

Real install first verifies that `codex` is available on `PATH`. If unavailable, the Codex target fails with a message such as:

```text
Native command not found: codex
```

If available, the installer runs the marketplace add command through the existing native command runner. The installer does not copy local Codex package files and does not write Codex config.

## Copilot behavior

Copilot should be a native command target.

Dry-run prints:

```bash
copilot plugin marketplace add tungnt1405/tungnt-ai-skills-marketplace
copilot plugin install tungnt-ai-skills@tungnt-ai-skills-marketplace
```

Real install first verifies that `copilot` is available on `PATH`. If unavailable, the Copilot target fails with:

```text
Native command not found: copilot
```

If available, the installer runs the two commands in order. The installer does not write Copilot settings JSON.

## Installer changes

Add native-command preflight to `installer/cli.js`:

- Collect the command executable names from `target.nativeCommands`.
- Verify each executable can be resolved from `PATH`.
- Perform this check only for real installs, not dry-run.
- Reuse the existing failure collection behavior.

Use a zero-dependency resolver implemented with `fs.existsSync`, `fs.statSync`, and `path.delimiter`. On Windows, check `PATHEXT` extensions when the command has no extension.

Update `installer/target-map.js`:

- Codex uses `nativeCommands`.
- Copilot uses `nativeCommands`.
- Remove Codex `marketplaceFile`, local marketplace entry, `configWrites`, and Codex-specific included entries from the active target.
- Remove Copilot `installMode: 'config'` and `configWrites`.

After these changes, `installer/config-writers.js` can be removed if no target uses it.

## Tests

Update `tests/installer/run-tests.js`:

- Codex dry-run prints native marketplace command and does not print planned copy entries, local marketplace file, or config file.
- Copilot dry-run prints native marketplace and install commands.
- Real Codex install with a missing `codex` command fails clearly.
- Real Copilot install with a missing `copilot` command fails clearly.
- Native command runner can find a fake command placed in a temp `PATH`.
- Remove tests for Codex config writes and Copilot settings writes when the helper is removed.
- Keep tests for other copy-based targets unchanged.

## Acceptance criteria

- `npm run test:installer` passes.
- `install --agent codex --dry-run` shows the native Codex marketplace command.
- `install --agent copilot --dry-run` shows both native Copilot commands.
- Missing `codex` or `copilot` binary produces a clear target failure.
- No README change is required for this behavior.
