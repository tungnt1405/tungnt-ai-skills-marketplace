#!/usr/bin/env bash
# Locate an installed skill by name without asking an agent to crawl the filesystem.
# Usage: bash scripts/find-skill.sh <skill-name> [extra-root...]
set -euo pipefail

# Platform guard: Linux/macOS run as-is; Windows requires Git Bash (MSYSTEM set by
# Git Bash and MSYS2). Any other shell stops instead of searching with broken paths.
os="$(uname -s 2>/dev/null || true)"
case "$os" in
  Linux* | Darwin*) ;;
  MINGW* | MSYS* | CYGWIN*)
    if [ -z "${MSYSTEM:-}" ]; then
      echo "find-skill.sh: Windows requires Git Bash. Start Git Bash and rerun." >&2
      exit 2
    fi
    ;;
  *)
    echo "find-skill.sh: unsupported platform \"${os:-unknown}\". Use Git Bash on Windows, or run on Linux/macOS." >&2
    exit 2
    ;;
esac

name="${1:-}"
if [ -z "$name" ]; then
  echo "usage: bash scripts/find-skill.sh <skill-name> [extra-root...]" >&2
  exit 2
fi
shift

# Harness roots are searched whole, so any plugin laid out under them is found
# without naming it (Claude, Codex, Copilot, Gemini/Antigravity, OpenCode, Hermes, Pi, Cursor).
roots=(
  "./.claude/skills"
  "./.agents/skills"
  "./.opencode/skills"
  "./.pi/skills"
  "./.cursor/skills"
  "./skills"
  "$HOME/.claude/skills"
  "$HOME/.claude/plugins"
  "$HOME/.agents/skills"
  "$HOME/.agents/plugins"
  "${CODEX_HOME:-$HOME/.codex}/skills"
  "$HOME/.codex/plugins"
  "$HOME/.copilot"
  "$HOME/.gemini"
  "$HOME/.config/opencode"
  "$HOME/.hermes"
  "$HOME/.pi"
  "$HOME/.cursor"
  "$@"
)

# Dynamic fallback: any <harness>/skills directory, including harnesses added later.
shopt -s nullglob
for dir in "$HOME"/.*/skills "$HOME"/.config/*/skills; do
  roots+=("$dir")
done

found=0
searched=()
for root in "${roots[@]}"; do
  [ -d "$root" ] || continue
  # Skip roots already covered by a broader root, so each skill prints once.
  dup=0
  for seen_root in "${searched[@]}"; do
    case "$root" in "$seen_root" | "$seen_root"/*) dup=1; break ;; esac
  done
  [ "$dup" -eq 1 ] && continue
  searched+=("$root")
  # -name is a glob; skill names are literal kebab-case, so no glob chars are expected.
  while IFS= read -r file; do
    echo "$file"
    found=1
  done < <(find "$root" -type d -name "$name" -exec sh -c '
    for dir; do [ -f "$dir/SKILL.md" ] && echo "$dir/SKILL.md"; done
  ' _ {} + 2>/dev/null)
done

if [ "$found" -eq 0 ]; then
  echo "Skill \"$name\" not found." >&2
  echo "Searched: ${searched[*]:-(no roots existed)}" >&2
  echo "Install the plugin that ships it, then rerun this script." >&2
  exit 1
fi
