# Investigation: Hook Format Impact — Copilot vs Claude

## Hand-off Brief

1. **What happened.** The user asks: if we change hooks to accommodate Claude's hook format, will Copilot be affected?
2. **Where the case stands.** The hook manifests are already segregated per platform. Modifying Claude-specific files (`hooks.unix.json`, `hooks.windows.json`) has **zero impact on Copilot** because they are deployed to different install paths and the installer never copies them into a Copilot location. Modifying `hooks/hooks.json` in the repo source (which is currently in Copilot format) would affect Copilot but not Claude (Claude's installer overwrites it). Modifying the shared hook scripts (`session-start`, `session-start.ps1`) affects both platforms, but they already contain platform-detection logic.
3. **What's needed next.** No action needed — current architecture is already sound. Read the analysis below for the details.

## Case Info

| Field | Value |
| --- | --- |
| Ticket | N/A |
| Date opened | 2026-06-18 |
| Status | Complete |
| Evidence sources | Repo source, installer code, JSON manifests per platform |

## Problem Statement

*"If we change hooks to accommodate Claude's hook format, will Copilot be affected?"* — user wants to understand cross-platform impact of hook changes.

## Evidence Inventory

| Source | Status | Notes |
| --- | --- | --- |
| `hooks/hooks.json` | Available | Copilot format: `sessionStart` (camelCase), `bash`/`powershell` fields |
| `hooks/hooks.copilot.json` | Available | Same Copilot format, referenced from `plugin.json` |
| `hooks/hooks.unix.json` | Available | Claude format: `SessionStart` (PascalCase), nested `hooks[0].hooks[0].command` |
| `hooks/hooks.windows.json` | Available | Same Claude format, points to `.cmd` wrapper |
| `hooks/hooks-cursor.json` | Available | Copilot-like format with `sessionStart` + `command` |
| `hooks/hooks.antigravity.unix.json` | Available | Antigravity-specific `PreInvocation` format |
| `hooks/hooks.antigravity.windows.json` | Available | Same Antigravity format |
| `plugin.json` | Available | References `hooks/hooks.copilot.json` |
| `.cursor-plugin/plugin.json` | Available | References `./hooks/hooks-cursor.json` |
| `installer/target-map.js` | Available | Defines per-platform file lists and install destinations |
| `installer/package-copy.js` | Available | Copies and renames manifest files at install time |
| `hooks/session-start` | Available | Shared bash hook script with platform detection |
| `hooks/session-start.ps1` | Available | Shared PowerShell hook script with platform detection |

## Investigation Backlog

| # | Path to Explore | Priority | Status | Notes |
| --- | --- | --- | --- | --- |
| 1 | Already complete | — | Complete | All evidence read and analyzed |

## Confirmed Findings

### Finding 1: Each platform has its own hook manifest file

| File | Platform | Format | Key differences from others |
| --- | --- | --- | --- |
| `hooks/hooks.json` | Copilot (default discovery) | `sessionStart` (camelCase), `bash` + `powershell` | Flat array, no `version` field, `bash`/`powershell`/`timeoutSec` |
| `hooks/hooks.copilot.json` | Copilot (explicit from `plugin.json`) | Identical to `hooks.json` | Mirror of hooks.json |
| `hooks/hooks.unix.json` | Claude Code (Unix) | `SessionStart` (PascalCase), `hooks[0].hooks[0].command` | Has `matcher`, nested `hooks` array, `async: bool`, `type: "command"` |
| `hooks/hooks.windows.json` | Claude Code (Windows) | Same as `.unix.json` | Points to `.cmd` instead of `.sh` |
| `hooks/hooks-cursor.json` | Cursor | `sessionStart` (camelCase), `command` string | Simpler than Copilot; no bash/powershell split |
| `hooks/hooks.antigravity.unix.json` | Antigravity | `tungnt-ai-skills-bootstrap.PreInvocation` | Different event name entirely |
| `hooks/hooks.antigravity.windows.json` | Antigravity | Same | Same |

**Evidence:** All files read from disk at the paths listed above.

### Finding 2: The hook schemas are structurally incompatible between Claude and Copilot

**Claude Code format** (`hooks.unix.json`):
```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup|clear|compact",
        "hooks": [
          {
            "type": "command",
            "command": "bash \"${CLAUDE_PLUGIN_ROOT}/hooks/session-start\"",
            "async": false
          }
        ]
      }
    ]
  }
}
```

**Copilot format** (`hooks.json`, `hooks.copilot.json`):
```json
{
  "hooks": {
    "sessionStart": [
      {
        "bash": "root=...; bash \"$root/hooks/session-start\"",
        "powershell": "$root=...; & (Join-Path $root 'hooks\\session-start.ps1')",
        "timeoutSec": 30
      }
    ]
  }
}
```

**Key incompatibilities:**
- Event name casing: `SessionStart` vs `sessionStart`
- Nesting: Claude uses `SessionStart[0].hooks[0].command`; Copilot uses `sessionStart[0].bash`/`.powershell`

**Evidence:** Direct file reads.

### Finding 3: The installer deploys different manifest files to different targets

**Claude fallback install** (`installer/target-map.js` line 115):
- Uses `hookManifestFile: CLAUDE_HOOK_MANIFEST_FILE` which resolves to `hooks/hooks.windows.json` (Win32) or `hooks/hooks.unix.json` (others)
- `copySelectedHookManifest()` in `installer/package-copy.js` (line 84-92) copies the Claude-specific file **into `hooks/hooks.json`** at the destination

**Copilot install** (`installer/target-map.js` lines 197-231):
- No hook manifest rename step
- `plugin.json` references `hooks/hooks.copilot.json` directly
- The repo `hooks/hooks.json` is copied as-is to the installed plugin (Copilot discovers it)

**Cursor install** (`.cursor-plugin/plugin.json` line 24):
- References `./hooks/hooks-cursor.json`

**Evidence:** `installer/target-map.js:54-56`, `installer/package-copy.js:84-92`, `plugin.json:24`, `.cursor-plugin/plugin.json:24`

### Finding 4: The shared hook scripts already handle platform detection internally

The `hooks/session-start` bash script (lines 45-53) detects the platform:
```bash
if [ -n "${CURSOR_PLUGIN_ROOT:-}" ]; then
  # Cursor format: additional_context
elif [ -n "${CLAUDE_PLUGIN_ROOT:-}" ] && [ -z "${COPILOT_CLI:-}" ]; then
  # Claude Code format: hookSpecificOutput.additionalContext
else
  # Copilot CLI or unknown: additionalContext (SDK standard)
fi
```

The PowerShell version (`session-start.ps1`, lines 30-44) has the same three-way switch.

**Evidence:** `hooks/session-start:45-53`, `hooks/session-start.ps1:30-44`

## Deduced Conclusions

### Deduction 1: Modifying Claude-specific manifest files does NOT affect Copilot

**Based on:** Findings 1, 2, 3

**Reasoning:**
1. Claude uses `hooks.unix.json` / `hooks.windows.json` — these files are only read during Claude install
2. The installer copies them into the Claude plugin cache, not into any Copilot directory
3. Copilot's `plugin.json` points to `hooks.copilot.json`, and Copilot auto-discovers `hooks.json` from its own plugin directory
4. There is no code path where a Claude-format manifest ends up in a Copilot directory

**Conclusion:** Changes to `hooks.unix.json`, `hooks.windows.json`, or the Antigravity hook files have **zero impact** on Copilot.

### Deduction 2: Modifying `hooks/hooks.json` affects Copilot but not Claude

**Based on:** Findings 1, 3

**Reasoning:**
- In the repo source, `hooks/hooks.json` is the Copilot-format file
- Copilot discovers this file during fallback install — it reads whatever `hooks/hooks.json` is in the installed plugin
- When installing for Claude, the installer **overwrites** `hooks/hooks.json` with the Claude-format version (from `hooks.windows.json` or `hooks.unix.json`)
- So Claude never reads the repo's `hooks/hooks.json` content

**Conclusion:** The repo's `hooks/hooks.json` can be safely used as the Copilot (or default) manifest. Claude ignores it because the installer replaces it.

### Deduction 3: Modifying shared hook scripts affects both platforms

**Based on:** Finding 4

**Reasoning:**
- Both Claude and Copilot invoke the same `hooks/session-start` bash script (or `.ps1`/`.cmd` on Windows)
- The script's **output format** is the differentiator, not which script is called
- The script already detects the calling platform via environment variables (`$CLAUDE_PLUGIN_ROOT`, `$COPILOT_CLI`, `$CURSOR_PLUGIN_ROOT`)

**Conclusion:** Changes to `hooks/session-start`, `hooks/session-start.cmd`, or `hooks/session-start.ps1` affect both platforms, but the script already handles this correctly with environment-based output selection.

## Conclusion

**Confidence:** High

The hook manifests are **already segregated** per platform:

| What gets modified | Affects Claude? | Affects Copilot? | Affects Cursor? | Why |
|---|---|---|---|---|
| `hooks.unix.json` / `hooks.windows.json` | ✅ Yes | ❌ No | ❌ No | Only deployed to Claude plugin cache |
| `hooks.hooks.copilot.json` | ❌ No | ✅ Yes | ❌ No | Referenced from `plugin.json`; not deployed to Claude |
| `hooks.hooks.json` (repo root) | ❌ No (overwritten by installer) | ✅ Yes | ❌ No | Repo version is Copilot-format; Claude overwrites it |
| `hooks/hooks-cursor.json` | ❌ No | ❌ No | ✅ Yes | Only used via `.cursor-plugin` |
| `hooks/antigravity-*.json` | ❌ No | ❌ No | ❌ No | Only Antigravity targets |
| `hooks/session-start` scripts | ✅ Yes | ✅ Yes | ✅ Yes | Shared — but platform detection is already embedded |

**Answer to the user's question:** If you change Claude hooks (the `.unix.json`/`.windows.json` manifests), Copilot is **not affected** — the files are isolated by the installer's target-specific deployment. If you change the shared `hooks/session-start` scripts, both are affected, but the scripts already have correct platform detection. The architecture is properly separated.

## Recommended Next Steps

### Fix direction

No fix needed. The current architecture correctly isolates hook manifests per platform. If you need to make changes:

- **For Claude-only changes:** Edit `hooks/hooks.unix.json` or `hooks/hooks.windows.json`
- **For Copilot-only changes:** Edit `hooks/hooks.copilot.json` (and/or `hooks/hooks.json` if you want to keep them in sync)
- **For shared changes** (e.g., new bootstrap content): Edit `hooks/session-start` and `hooks/session-start.ps1` — the platform detection logic inside them handles the difference in output format

### Reproduction Plan

N/A — no issue to reproduce.

## Side Findings

- Cursor uses a hybrid: Copilot-like `sessionStart` casing but with a single `command` field (not `bash`/`powershell` split). Confirmed at `hooks/hooks-cursor.json:6`.
- Antigravity hooks use a completely different event (`PreInvocation`) and inject via `ephemeralMessage`, not `additionalContext`. This is a fundamentally different mechanism and is not comparable to the Claude/Copilot session start hooks.
