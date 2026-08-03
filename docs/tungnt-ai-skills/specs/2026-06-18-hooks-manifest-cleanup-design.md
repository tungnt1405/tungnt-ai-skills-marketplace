# Design: Hook Manifests Cleanup

> **⚠️ REVERTED (2026-07-20):** The removal of `hooks.copilot.json` was reverted.
> `hooks.json` and `hooks.copilot.json` serve different schemas:
> - `hooks.json` → Claude Code PascalCase (`SessionStart`, matcher, nested hooks)
> - `hooks.copilot.json` → Copilot lowercase (`sessionStart`, direct bash/powershell)
>
> `plugin.json.hooks` points to `hooks.json` (Claude Code format).
> Copilot native install discovers `hooks.copilot.json` by convention.
> See `2026-06-10-copilot-native-bootstrap-hooks-design.md` for the canonical dual-file architecture.

## Overview

Remove duplicate hook manifest files and fix Claude `matcher` values. Each AI platform keeps exactly one manifest file with a naming convention that makes the target AI obvious.

## Scope

Two independent changes:

1. **Remove `hooks.copilot.json`** — identical to `hooks.json`, redundant. Point `plugin.json` to the remaining file.
2. **Fix Claude `matcher`** — add missing `resume` event so hooks fire when a Claude Code session is resumed.

## Files Changed

| File | Action | Reason |
| --- | --- | --- |
| `hooks/hooks.copilot.json` | ❌ Delete | Duplicate of `hooks/hooks.json` |
| `plugin.json` | ✅ Edit line 24 | `hooks.copilot.json` → `hooks/hooks.json` |
| `installer/target-map.js`  | ✅ Edit line 203 | Remove from Copilot `requiredFiles` |
| `tests/installer/run-tests.js` | ✅ Edit lines 346-398 | Update paths and assertions |
| `tests/copilot-bootstrap/run-tests.js` | ✅ Edit line 40 | Update manifest path |
| `hooks/hooks.unix.json` | ✅ Edit matcher | Add `resume` to matcher string |
| `hooks/hooks.windows.json` | ✅ Edit matcher | Add `resume` to matcher string |

## Detailed Changes

### 1. Remove `hooks/hooks.copilot.json`

**Current state:** Two files with identical content.

**`hooks/hooks.json`:**
```json
{
  "hooks": {
    "sessionStart": [
      {
        "type": "command",
        "bash": "root=\"${COPILOT_PLUGIN_ROOT:-${TUNGNT_AI_SKILLS_PLUGIN_ROOT:-$HOME/.copilot/installed-plugins/tungnt-ai-skills-marketplace/tungnt-ai-skills}}\"; bash \"$root/hooks/session-start\"",
        "powershell": "$root = $env:COPILOT_PLUGIN_ROOT; if (-not $root) { $root = $env:TUNGNT_AI_SKILLS_PLUGIN_ROOT }; if (-not $root) { $homeDir = if ($env:USERPROFILE) { $env:USERPROFILE } else { $env:HOME }; $root = Join-Path $homeDir '.copilot\\installed-plugins\\tungnt-ai-skills-marketplace\\tungnt-ai-skills' }; & (Join-Path $root 'hooks\\session-start.ps1')",
        "timeoutSec": 30
      }
    ]
  }
}
```

**`hooks/hooks.copilot.json`:** Exact same content. Delete this file.

### 2. Fix `plugin.json` Reference

**`plugin.json` line 24:**
```
-  "hooks": "hooks/hooks.copilot.json"
+  "hooks": "hooks/hooks.json"
```

**Impact on Copilot install flow:** Copilot discovers `hooks/hooks.json` by default from the installed plugin directory. The `plugin.json` field is only used when Copilot explicitly reads it — both paths are valid. Switching to `hooks/hooks.json` means the explicit reference and the default-discovery file are the same file.

### 3. Update Installer Target Map

**`installer/target-map.js` lines 197-204** (Copilot target): Remove `'hooks/hooks.copilot.json'` from `requiredFiles`. The script files (`session-start`, `session-start.cmd`, `session-start.ps1`) and `hooks/hooks.json` are already listed.

```diff
 requiredFiles: [
   'plugin.json',
   ...REQUIRED_SKILL_FILES,
   'hooks/session-start',
   'hooks/session-start.cmd',
   'hooks/session-start.ps1',
-  'hooks/hooks.copilot.json',
 ],
```

### 4. Update Tests

**`tests/installer/run-tests.js`:**

- **Line 350** (test: `copilot plugin declares native bootstrap hook manifest`): change assertion from `hooks/hooks.copilot.json` to `hooks/hooks.json`
- **Line 354** (test: `copilot hook manifest uses documented sessionStart command shape`): read `hooks/hooks.json` instead of `hooks/hooks.copilot.json`
- **Line 398** (test: `copilot source validation requires bootstrap hook files`): check `hooks/hooks.json` exists instead of `hooks/hooks.copilot.json`

**`tests/copilot-bootstrap/run-tests.js` line 40:** Change manifest path from `hooks.copilot.json` to `hooks.json`.

### 5. Fix Claude matcher

**`hooks/hooks.unix.json`:**
```diff
- "matcher": "startup|clear|compact",
+ "matcher": "startup|resume|clear|compact",
```

**`hooks/hooks.windows.json`:**
```diff
- "matcher": "startup|clear|compact",
+ "matcher": "startup|resume|clear|compact",
```

**Why:** Claude Code's `SessionStart` hook fires both on fresh startup and session resume. Without `resume` in the matcher, resumed sessions won't trigger the bootstrap injection. Matches the polyglot documentation at `docs/windows/polyglot-hooks.md:68`.

## Files NOT Changed (pre-revert)

- `hooks/hooks.json` — ~~kept as the single Copilot manifest~~ **reverted**: now Claude Code PascalCase (`SessionStart`)
- `hooks/hooks.copilot.json` — **restored**: Copilot lowercase (`sessionStart`)
- `hooks/hooks.unix.json` / `hooks/hooks.windows.json` — kept as Claude Code fallback installer overrides (only matcher values changed)
- `hooks/hooks-cursor.json` — kept as Cursor manifest (unchanged)
- `hooks/hooks.antigravity.unix.json` / `hooks/hooks.antigravity.windows.json` — kept as Antigravity manifests (unchanged)
- `hooks/session-start` / `session-start.cmd` / `session-start.ps1` — unchanged
- `hooks/antigravity-pre-invocation` / `.cmd` / `.ps1` — unchanged

## Current Tree After Revert

```
hooks/
├── hooks.json                   # Claude Code — PascalCase SessionStart (plugin.json.hooks)
├── hooks.copilot.json           # Copilot — lowercase sessionStart
├── hooks.unix.json              # Claude Code fallback installer override — Unix
├── hooks.windows.json           # Claude Code fallback installer override — Windows
├── hooks-cursor.json            # Cursor
├── hooks.antigravity.unix.json  # Antigravity CLI/IDE — Unix
├── hooks.antigravity.windows.json # Antigravity CLI/IDE — Windows
├── session-start                # Shared bootstrap script (bash)
├── session-start.cmd            # Shared Windows launcher
├── session-start.ps1            # Shared bootstrap script (PowerShell)
├── antigravity-pre-invocation       # Antigravity PreInvocation (bash)
├── antigravity-pre-invocation.cmd   # Antigravity Windows launcher
└── antigravity-pre-invocation.ps1   # Antigravity PreInvocation (PowerShell)
```

## Spec Kernel

**Goal:** Remove duplicate hook manifest file and fix Claude matcher values.

**Users:** Maintainers who look at the `hooks/` directory; Copilot and Claude Code users who depend on bootstrap injection.

**Acceptance Criteria:**
- `hooks/hooks.copilot.json` is deleted from the repo
- `plugin.json` references `hooks/hooks.json`
- All installer tests pass
- Copilot bootstrap tests pass
- Claude `matcher` values include `resume` in both unix and windows manifests
- The resulting file tree has exactly 1 manifest per platform

**Constraints:**
- No changes to shared hook scripts (`session-start`, `.ps1`, `.cmd`)
- No changes to Cursor or Antigravity manifest files
- No changes to the actual bootstrap injection logic

**Out of Scope:**
- Renaming files (deferred)
- Changing hook script output format
- Modifying installer deployment logic beyond the requiredFiles list
