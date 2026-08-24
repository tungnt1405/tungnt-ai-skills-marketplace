# Spec: OpenCode installer target (`--agent opencode`)

- Date: 2026-08-24
- Status: Approved design, pending implementation plan
- Branch: `docs/opencode-install-guide`

## Goal

Make `tungnt-ai-skills install --agent opencode` work through the standard npx installer,
installing the plugin and skills for [OpenCode](https://opencode.ai) using the same
file-copy model as the Gemini/Antigravity targets. Native mode (`--native`) is out of scope
until the package is published to npm.

## Users

- Users installing tungnt-ai-skills for OpenCode via one command instead of manual clone + symlink.
- Maintainers, who gain one more declarative target instead of bespoke documentation-only instructions.

## Background evidence

| Fact | Source |
| --- | --- |
| `opencode plugin add` accepts only npm registry names; rejects Git/tarball specs | https://opencode.ai/v2/docs/build/plugins |
| `tungnt-ai-skills` is not published to npm (`npm view` → E404) | checked 2026-08-24 |
| Tested global layout: package at `~/.config/opencode/tungnt-ai-skills/`, registered plugin at `~/.config/opencode/plugins/tungnt-ai-skills.js` | `tests/opencode/setup.sh` |
| Plugin resolves skills relative to its own real path (`import.meta.url` → `../../skills`) | `.opencode/plugins/tungnt-ai-skills.js:51` |
| Target schema already supports copy targets with extras (`gemini`, `agy`) and per-target bespoke steps (`rootHookManifestFile`, `writeCopilotSettings`) | `installer/target-map.js`, `installer/cli.js` |

## Decisions

1. **Copy-mode target** (Approach A) reusing `TARGETS` machinery: `defaultTarget`,
   `includedEntries`, `requiredFiles`, `updateCacheDirs`.
2. **Hybrid registration**: the registered plugin file is created as a symlink on POSIX and
   a plain file copy on Windows (`process.platform === 'win32'`). Rationale: symlinks need
   Admin/Developer Mode on Windows; the tested setup uses symlinks on POSIX so updates to the
   installed package propagate without re-registration.
3. **No mutation of `opencode.json`**: directory auto-discovery under
   `~/.config/opencode/plugins/` is sufficient; merging user JSON adds risk for no benefit.
4. **No `nativeCommands`**: blocked on npm publication. The target prints a note explaining
   this and the unlock path (publish to npm, then a follow-up change can declare
   `['opencode', 'plugin', 'add', 'tungnt-ai-skills', '--global']`).

Rejected alternatives: (B) merge `"plugin"` entry into the user's global `opencode.json`
(config-mutation risk, redundant); (C) run `npm install` inside the config dir
(environment-dependent, slow, non-deterministic).

## Architecture

### New target schema field: `registerPluginFiles`

```js
// installer/target-map.js (new target)
{
  id: 'opencode',
  displayName: 'OpenCode',
  defaultTarget: (env = process.env) => joinHome(env, '.config', 'opencode', 'tungnt-ai-skills'),
  expectedParent: (env = process.env) => joinHome(env, '.config', 'opencode'),
  includedEntries: ['skills', REQUIRED_SETTINGS_FILE],
  requiredFiles: [
    ...REQUIRED_SKILL_FILES,
    REQUIRED_SETTINGS_FILE,
    '.opencode/plugins/tungnt-ai-skills.js',
  ],
  updateCacheDirs: [
    {
      destination: (env = process.env) => joinHome(env, '.config', 'opencode', 'tungnt-ai-skills'),
      expectedParent: (env = process.env) => joinHome(env, '.config', 'opencode'),
    },
  ],
  registerPluginFiles: [
    {
      source: '.opencode/plugins/tungnt-ai-skills.js',
      destination: (env = process.env) =>
        joinHome(env, '.config', 'opencode', 'plugins', 'tungnt-ai-skills.js'),
      symlinkOnPosix: true,
    },
  ],
  nextSteps: [
    'Restart OpenCode after installation.',
    'Ask the agent to list skills; tungnt-ai-skills entries should appear.',
  ],
  postInstallNotes:
    'Installed via file copy. --native requires the package on the npm registry (opencode plugin add does not accept git specs).',
}
```

### Execution semantics (`installer/package-copy.js` + `installer/cli.js`)

New exported function `registerPluginFilesForTarget(packageRoot, target, env)`:

For each entry in `target.registerPluginFiles`:

1. Resolve `sourcePath = <packageRoot>/<source>`; fail if missing.
2. Resolve `destinationPath = destination(env)`.
3. Compute `expectedParent` as the dirname of `destinationPath`; run the existing
   `ensureInsideExpectedParent(destinationPath, expectedParent)` guard.
4. Remove any existing entry at `destinationPath` (file, symlink, or directory) before
   creating anything. Never write through a pre-existing symlink.
5. Resolve the link target: `<target.defaultTarget(env)>/<source>`. On POSIX with
   `symlinkOnPosix`, verify the resolved real path of the target is inside the resolved
   `defaultTarget` directory, then create `fs.symlinkSync(targetRealPath, destinationPath)`.
   If symlink creation throws (unsupported filesystem), fall back to `fs.copyFileSync`
   from `sourcePath` with a warning line.
6. On Windows, or when `symlinkOnPosix` is false, `fs.copyFileSync(sourcePath, destinationPath)`.

Call sites:

- `install()`: after `copyPackage(...)` / `copySettingTemplate(...)` for the target.
- `update()`: same position, so refreshes replace the registered file/link each run.
- Dry-run plan output lists the register step (source → destination, mode symlink|copy).

Idempotency: running install or update repeatedly yields the same final state.

## Data flow

```text
npx ... tungnt-ai-skills install --agent opencode
  └─ validateSource(packageRoot, target)            # incl. .opencode/plugins/tungnt-ai-skills.js
  ├─ removeExistingInstall(~/.config/opencode/tungnt-ai-skills)
  ├─ copyPackage(skills/, setting.json)
  ├─ copySettingTemplate()
  ├─ registerPluginFilesForTarget()                  # NEW: link/copy into ~/.config/opencode/plugins/
  └─ printNextSteps()                                # restart OpenCode
```

Update flow: `removeManagedPackageEntries` → `copyPackage` → `copySettingTemplate` →
`registerPluginFilesForTarget`.

## Error handling

| Case | Behavior |
| --- | --- |
| Missing source plugin file | `validateSource` fails before any write, message names the file |
| Destination outside expected parent | `ensureInsideExpectedParent` throws, no write |
| Symlink unsupported | warn once, fall back to file copy, exit 0 |
| Partial failure mid-register | previous state already removed; rerunning install repairs |

## Security review (skill: security-and-hardening)

- Trust boundary: installer writes executable plugin code under `$HOME/.config/opencode/`;
  source is the trusted package itself; all destinations are repo-defined constants joined
  to `$HOME`. No user-supplied paths are accepted by the CLI for this target.
- Unlink-before-create removes the write-through-preexisting-symlink risk (a planted symlink
  at the destination must not redirect writes).
- Link-target containment check keeps the symlink inside the freshly installed package.
- No new dependencies, no lifecycle scripts, no shell execution, no secrets.
- Accepted residual risk (low): another local process can still race the installer for the
  same user account; consistent with every other file-copy target in this installer.

## Testing

Mirror `tests/installer/` patterns:

1. Unit: planned entries for the `opencode` target contain exactly `skills/`, `setting.json`.
2. Unit: `validateSource` passes on the repo and fails when `.opencode/plugins/tungnt-ai-skills.js` is missing.
3. Integration (POSIX): fake `$HOME` install → assert package tree exists and
   `~/.config/opencode/plugins/tungnt-ai-skills.js` is a symlink resolving inside the package.
4. Integration: plant a regular file and a dangling symlink at the destination before install;
   assert both are replaced safely.
5. Update: second run refreshes content behind the same link path; dry-run prints the register step.
6. Smoke: extend `tests/opencode/run-tests.sh` usage notes to mention the installer path.

## Documentation

- `README.md`: add `opencode` to valid agents; example `install --agent opencode`; keep the
  note that OpenCode is not covered by `update --native`.
- `docs/README.opencode.md`: promote the npx method to the recommended path; keep manual
  clone + symlink as alternative.
- `.opencode/INSTALL.md`: cross-link to the installer command.

## Out of scope

- Publishing to npm and wiring `nativeCommands` / `updateCommands` for
  `opencode plugin add` (follow-up once the registry package exists).
- Project-level (per-repo `.opencode/`) installs.
- Managing `cli.json` TUI plugins.

## Spec Kernel

**Goal:** `tungnt-ai-skills install --agent opencode` produces the tested OpenCode layout
via the shared npx installer.

**Users:** OpenCode users; maintainers adding targets declaratively.

**Acceptance Criteria:**
- Given the repo source, when `install --agent opencode` runs with a fake `$HOME`, then
  `~/.config/opencode/tungnt-ai-skills/{skills,setting.json}` exists and
  `~/.config/opencode/plugins/tungnt-ai-skills.js` resolves into the package on POSIX.
- Given Windows (or forced copy mode), the same command leaves a regular file copy at the
  registered path.
- Given an existing install, `update --agent opencode` refreshes both the package and the
  registered entry idempotently.
- Given a planted symlink at the registered path, install replaces it without writing through it.
- Given `install --dry-run --agent opencode`, the plan includes the register step.

**Constraints:**
- Reuse existing `TARGETS` machinery; the only new mechanism is `registerPluginFiles`.
- Do not modify user `opencode.json`.
- No `--native` until npm publication exists.

**Out of Scope:** npm publish + native commands; project-level installs; `cli.json` handling.

---

## Addendum (2026-08-24): Native config-write mode (`--agent opencode --native`)

### Evidence

- Empirical test on installed OpenCode 1.18.21: `opencode plugin add <git-spec>` and
  `plugin add <local-path>` both print help and write NOTHING to config — the command accepts
  npm registry names only. Spawning it is therefore not a viable native path.
- OpenCode's own distribution mechanism for non-registry plugins is the global
  `opencode.json` `"plugin"` array (installed via Bun at startup). Writing that entry through
  the installer mirrors the existing Copilot pattern (`fallbackInstall.mode: 'copilotSettings'`
  → `writeCopilotSettings()`).

### Design

New target schema block on the `opencode` target:

```js
nativeConfigWrite: {
  configFile: (env = process.env) => joinHome(env, '.config', 'opencode', 'opencode.json'),
  pluginEntry: 'tungnt-ai-skills@git+https://github.com/tungnt1405/tungnt-ai-skills-marketplace#main',
  cleanupPaths: [
    { // registered copy-mode plugin file
      path: (env = process.env) => joinHome(env, '.config', 'opencode', 'plugins', 'tungnt-ai-skills.js'),
      expectedParent: (env = process.env) => joinHome(env, '.config', 'opencode', 'plugins'),
    },
    { // copy-mode package directory
      path: (env = process.env) => joinHome(env, '.config', 'opencode', 'tungnt-ai-skills'),
      expectedParent: (env = process.env) => joinHome(env, '.config', 'opencode'),
    },
  ],
  cachePackageDir: (env = process.env) =>
    path.join(env.XDG_CACHE_HOME || joinHome(env, '.cache'), 'opencode', 'node_modules', PLUGIN_NAME),
},
```

### Flows

**install --native** (`target.nativeConfigWrite && options.native`, checked BEFORE the
copy-mode path):
1. Remove each `cleanupPaths[].path` (guarded by its `expectedParent` via
   `ensureInsideExpectedParent`; missing paths are fine).
2. `writeOpenCodeConfig(target, env)`:
   - Missing file → create `{ "$schema": ..., "plugin": [entry] }` (schema key optional; keep
     minimal).
   - Existing JSON → parse; invalid JSON → fail WITHOUT writing; `plugin` missing → create as
     array; `plugin` not an array → fail; entry absent → push; present → leave untouched.
     Never remove or reorder other keys.
3. `Status: installed` + `postInstallNotes` + `printNextSteps`.

**update --native:** idempotent `writeOpenCodeConfig` again, plus remove
`cachePackageDir` (only the `tungnt-ai-skills` subdirectory — never the shared
`node_modules` root) so the next OpenCode start refetches `#main`.

**No `--native`:** copy-mode path unchanged. Additionally, copy-mode install/update detects
our git-spec entry already present in `opencode.json` and prints a WARNING note advising a
single mechanism (never mutates `opencode.json` outside `--native`).

**Dry-run (--native):** print `Mode: native config write`, the config file path, the plugin
entry, and each cleanup path.

### Safety / security review

- All deletions go through `ensureInsideExpectedParent` with repo-defined constants joined to `$HOME`.
- Cache deletion is scoped to the single managed package subdirectory.
- Config writes preserve unrelated keys; parse failures abort without clobbering.
- No shell execution added.

### Acceptance criteria

- Given a fake `$HOME`, `install --agent opencode --native` removes prior copy-mode artifacts,
  creates `~/.config/opencode/opencode.json` with exactly our plugin entry, and preserves any
  pre-existing unrelated keys when the file already exists.
- Given malformed existing `opencode.json`, the command fails and leaves the file byte-identical.
- Given `update --agent opencode --native`, the entry remains a single occurrence and the
  managed cache subdirectory is removed while siblings remain.
- Given copy-mode run while the config entry exists, output contains a coexistence warning and
  `opencode.json` is unmodified.
- Given `install --agent opencode --native --dry-run`, the plan names mode/config path/entry/cleanup paths.

