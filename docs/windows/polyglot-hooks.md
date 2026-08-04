# Cross-Platform Polyglot Hooks for Claude Code

Claude Code plugins need hooks that work on Windows, macOS, and Linux. This
repository uses one generic dispatcher, `hooks/run-hook.cmd`, for extensionless
Bash hook scripts.

> `hooks/run-hook.cmd` is the authoritative implementation. If this document and
> the code differ, follow the code.

## Why the dispatcher exists

Claude Code may run hooks through Bash, PowerShell, or CMD depending on the
platform and installed tools. A quoted executable path followed by an argument
can be parsed incorrectly by PowerShell or CMD, especially when the plugin path
contains spaces or characters such as parentheses.

The manifest therefore declares `"shell": "bash"`. Claude Code 2.1.81 and newer
use Git Bash for the command; older versions ignore the unknown field.

Hook scripts remain extensionless (`session-start`, not `session-start.sh`) so
Claude Code's Windows `.sh` auto-detection does not rewrite the dispatcher
command.

## Files

```text
hooks/
├── hooks.json       # Calls run-hook.cmd with a script name
├── run-hook.cmd     # Generic CMD/Bash polyglot dispatcher
└── session-start    # Actual extensionless Bash hook
```

## Manifest

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup|resume|clear|compact",
        "hooks": [
          {
            "type": "command",
            "command": "\"${CLAUDE_PLUGIN_ROOT}/hooks/run-hook.cmd\" session-start",
            "shell": "bash",
            "async": false
          }
        ]
      }
    ]
  }
}
```

The dispatcher path is quoted because `${CLAUDE_PLUGIN_ROOT}` may contain
spaces. `session-start` is passed separately as the hook script name.

## What `run-hook.cmd` supports

On Windows, the dispatcher:

1. Rejects calls without a script name.
2. Resolves scripts relative to its own `hooks/` directory.
3. Tries Git Bash from `C:\Program Files\Git\bin\bash.exe`.
4. Tries `C:\Program Files (x86)\Git\bin\bash.exe`.
5. Falls back to `bash` on `PATH` for custom Git Bash, MSYS2, or Cygwin installs.
6. Forwards arguments `%2` through `%9` to the selected hook.
7. Exits successfully when Bash is unavailable, leaving the plugin usable
   without SessionStart context injection.

On Unix, the CMD block becomes a no-op heredoc. The dispatcher resolves its own
directory, shifts off the script name, and forwards all remaining arguments to
the extensionless Bash hook.

## Adding another hook

Create an extensionless Bash script in `hooks/`, then pass its filename to the
same dispatcher:

```json
{
  "type": "command",
  "command": "\"${CLAUDE_PLUGIN_ROOT}/hooks/run-hook.cmd\" validate-bash",
  "shell": "bash"
}
```

Do not add a dedicated `.cmd` wrapper for each hook.

## Portable hook scripts

- Prefer Bash builtins and self-contained scripts.
- Quote variable expansions such as `"$value"`.
- Use `$(command)` instead of backticks.
- Do not rely on login-shell PATH initialization.
- Keep hook filenames extensionless.

## Troubleshooting

### Bash is unavailable

Install Git for Windows in a standard location or make `bash` available on
`PATH`. Without Bash, the Windows dispatcher exits successfully and skips the
hook.

### Hook works on Unix but not Windows

Confirm that `hooks.json` passes an extensionless script name, for example
`run-hook.cmd session-start`, and that the script exists beside the dispatcher.

### Hook does not fire

Confirm that the matcher is one Claude Code emits. This repository uses
`startup|resume|clear|compact` for SessionStart.

## Upstream reference

This implementation follows the Superpowers generic dispatcher pattern:

- [Polyglot hooks documentation](https://github.com/obra/superpowers/blob/main/docs/windows/polyglot-hooks.md)
- [`run-hook.cmd`](https://github.com/obra/superpowers/blob/main/hooks/run-hook.cmd)
