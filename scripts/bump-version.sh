#!/usr/bin/env bash
#
# bump-version.sh — bump version numbers across all declared files,
# with drift detection and repo-wide audit for missed files.
#
# Usage:
#   bump-version.sh <new-version>   Bump all declared files to new version
#   bump-version.sh --check         Report current versions (detect drift)
#   bump-version.sh --audit         Check + grep repo for old version strings
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CONFIG="$REPO_ROOT/.version-bump.json"

if [[ ! -f "$CONFIG" ]]; then
  echo "error: .version-bump.json not found at $CONFIG" >&2
  exit 1
fi

# --- helpers ---

# Read a dotted field path from a JSON file.
# Handles both simple ("version") and nested ("plugins.0.version") paths.
read_json_field() {
  local file="$1" field="$2"
  python3 - "$file" "$field" <<'PY'
import json, sys

path, field = sys.argv[1], sys.argv[2]
try:
    node = json.load(open(path, encoding="utf-8"))
    for part in field.split("."):
        node = node[int(part)] if isinstance(node, list) else node[part]
except (OSError, ValueError, KeyError, IndexError) as exc:
    sys.exit(f"error: cannot read {field} from {path}: {exc}")
if not isinstance(node, str):
    sys.exit(f"error: {field} is not a string in {path}")
print(node)
PY
}

# Write a dotted field path in a JSON file.
write_json_field() {
  local file="$1" field="$2" value="$3"
  local tmp="${file}.tmp"
  python3 - "$file" "$tmp" "$field" "$value" <<'PY'
import json, re, sys

path, tmp, field, value = sys.argv[1:5]
try:
    raw = open(path, encoding="utf-8").read()
    data = json.loads(raw)
    # Preserve the file's existing indentation instead of forcing 2 spaces.
    match = re.search(r"\n([ \t]+)[^\s]", raw)
    indent = len(match.group(1)) if match else 2
    node = data
    parts = field.split(".")
    for part in parts[:-1]:
        node = node[int(part)] if isinstance(node, list) else node[part]
    last = parts[-1]
    if isinstance(node, list):
        node[int(last)] = value
    else:
        node[last] = value
    with open(tmp, "w", encoding="utf-8") as fh:
        json.dump(data, fh, indent=indent, ensure_ascii=False)
        fh.write("\n")
except (OSError, ValueError, KeyError, IndexError) as exc:
    sys.exit(f"error: cannot write {field} to {path}: {exc}")
PY
  mv "$tmp" "$file"
}

# ponytail: flat top-level scalar keys only — the only YAML manifests declared
# are flat. Nested YAML would need PyYAML or yq.
read_yaml_field() {
  local file="$1" field="$2"
  python3 - "$file" "$field" <<'PY'
import re, sys

path, field = sys.argv[1], sys.argv[2]
try:
    lines = open(path, encoding="utf-8").read().splitlines()
except OSError as exc:
    sys.exit(f"error: cannot read {path}: {exc}")
pattern = re.compile(r"^" + re.escape(field) + r":\s*(.*?)\s*$")
for line in lines:
    match = pattern.match(line)
    if not match:
        continue
    raw = match.group(1)
    if raw[:1] in ("'", '"') and raw[:1] == raw[-1:]:
        print(raw[1:-1])
        sys.exit(0)
    if raw == "" or raw in ("null", "~", "true", "false") or re.fullmatch(r"-?\d+(\.\d+)?", raw):
        sys.exit(f"error: {field} is not a string in {path}")
    print(raw)
    sys.exit(0)
sys.exit(f"error: {field} not found in {path}")
PY
}

write_yaml_field() {
  local file="$1" field="$2" value="$3"
  python3 - "$file" "$field" "$value" <<'PY'
import re, sys

path, field, value = sys.argv[1:4]
try:
    text = open(path, encoding="utf-8").read()
except OSError as exc:
    sys.exit(f"error: cannot read {path}: {exc}")
new_text, count = re.subn(
    r"(?m)^" + re.escape(field) + r":.*$", f"{field}: {value}", text, count=1
)
if not count:
    sys.exit(f"error: {field} not found in {path}")
with open(path, "w", encoding="utf-8") as fh:
    fh.write(new_text)
PY
}

read_manifest_field() {
  local file="$1"

  case "$file" in
    *.json) read_json_field "$@" ;;
    *.yaml) read_yaml_field "$@" ;;
    *)
      echo "error: unsupported manifest format: $file" >&2
      return 1
      ;;
  esac
}

write_manifest_field() {
  local file="$1"

  case "$file" in
    *.json) write_json_field "$@" ;;
    *.yaml) write_yaml_field "$@" ;;
    *)
      echo "error: unsupported manifest format: $file" >&2
      return 1
      ;;
  esac
}

# Read the list of declared files from config.
# Outputs lines of "path<TAB>field"
declared_files() {
  python3 - "$CONFIG" <<'PY'
import json, sys

for entry in json.load(open(sys.argv[1], encoding="utf-8"))["files"]:
    print(f"{entry['path']}\t{entry['field']}")
PY
}

preflight_manifests() {
  local path field fullpath

  while IFS=$'\t' read -r path field; do
    fullpath="$REPO_ROOT/$path"
    [[ -f "$fullpath" ]] || continue

    if ! read_manifest_field "$fullpath" "$field" >/dev/null; then
      echo "error: cannot read declared manifest: $path ($field)" >&2
      return 1
    fi
  done < <(declared_files)
}

# Read the audit exclude patterns from config.
audit_excludes() {
  python3 - "$CONFIG" <<'PY' 2>/dev/null
import json, sys

for pattern in json.load(open(sys.argv[1], encoding="utf-8")).get("audit", {}).get("exclude", []):
    print(pattern)
PY
}

# --- commands ---

cmd_check() {
  local has_drift=0
  local versions=()

  echo "Version check:"
  echo ""

  while IFS=$'\t' read -r path field; do
    local fullpath="$REPO_ROOT/$path"
    if [[ ! -f "$fullpath" ]]; then
      printf "  %-45s  MISSING\n" "$path ($field)"
      has_drift=1
      continue
    fi
    local ver
    ver=$(read_manifest_field "$fullpath" "$field")
    printf "  %-45s  %s\n" "$path ($field)" "$ver"
    versions+=("$ver")
  done < <(declared_files)

  echo ""

  if [[ "${#versions[@]}" -eq 0 ]]; then
    echo "error: could not read any declared manifest versions" >&2
    return 1
  fi

  # Check if all versions match
  local unique
  unique=$(printf '%s\n' "${versions[@]}" | sort -u | wc -l | tr -d ' ')
  if [[ "$unique" -gt 1 ]]; then
    echo "DRIFT DETECTED — versions are not in sync:"
    printf '%s\n' "${versions[@]}" | sort | uniq -c | sort -rn | while read -r count ver; do
      echo "  $ver ($count files)"
    done
    has_drift=1
  else
    echo "All declared files are in sync at ${versions[0]}"
  fi

  return $has_drift
}

cmd_audit() {
  # First run check
  cmd_check || true
  echo ""

  # Determine the current version (most common across declared files)
  local current_version
  current_version=$(
    while IFS=$'\t' read -r path field; do
      local fullpath="$REPO_ROOT/$path"
      [[ -f "$fullpath" ]] && read_manifest_field "$fullpath" "$field"
    done < <(declared_files) | sort | uniq -c | sort -rn | head -1 | awk '{print $2}'
  )

  if [[ -z "$current_version" ]]; then
    echo "error: could not determine current version" >&2
    return 1
  fi

  echo "Audit: scanning repo for version string '$current_version'..."
  echo ""

  # Build grep exclude args
  local -a exclude_args=()
  while IFS= read -r pattern; do
    exclude_args+=("--exclude=$pattern" "--exclude-dir=$pattern")
  done < <(audit_excludes)

  # Also always exclude binary files and .git
  exclude_args+=("--exclude-dir=.git" "--exclude-dir=node_modules" "--exclude=package-lock.json" "--binary-files=without-match")

  # Get list of declared paths for comparison
  local -a declared_paths=()
  while IFS=$'\t' read -r path _field; do
    declared_paths+=("$path")
  done < <(declared_files)

  # Grep for the version string, but not inside a longer number such as an
  # IP address; a "v" prefix or surrounding quotes still match.
  local version_pattern="(^|[^0-9.])${current_version//./\\.}([^0-9]|$)"
  local found_undeclared=0
  while IFS= read -r match; do
    local match_file
    match_file=$(echo "$match" | cut -d: -f1)
    # Make path relative to repo root
    local rel_path="${match_file#$REPO_ROOT/}"

    # Check if this file is in the declared list
    local is_declared=0
    for dp in "${declared_paths[@]}"; do
      if [[ "$rel_path" == "$dp" ]]; then
        is_declared=1
        break
      fi
    done

    if [[ "$is_declared" -eq 0 ]]; then
      if [[ "$found_undeclared" -eq 0 ]]; then
        echo "UNDECLARED files containing '$current_version':"
        found_undeclared=1
      fi
      echo "  $match"
    fi
  done < <(grep -rnE "${exclude_args[@]}" "$version_pattern" "$REPO_ROOT" 2>/dev/null || true)

  if [[ "$found_undeclared" -eq 0 ]]; then
    echo "No undeclared files contain the version string. All clear."
  else
    echo ""
    echo "Review the above files — if they should be bumped, add them to .version-bump.json"
    echo "If they should be skipped, add them to the audit.exclude list."
  fi
}

cmd_bump() {
  local new_version="$1"

  # Validate semver-ish format
  if ! echo "$new_version" | grep -qE '^[0-9]+\.[0-9]+\.[0-9]+'; then
    echo "error: '$new_version' doesn't look like a version (expected X.Y.Z)" >&2
    exit 1
  fi

  preflight_manifests

  echo "Bumping all declared files to $new_version..."
  echo ""

  while IFS=$'\t' read -r path field; do
    local fullpath="$REPO_ROOT/$path"
    if [[ ! -f "$fullpath" ]]; then
      echo "  SKIP (missing): $path"
      continue
    fi
    local old_ver
    old_ver=$(read_manifest_field "$fullpath" "$field")
    write_manifest_field "$fullpath" "$field" "$new_version"
    printf "  %-45s  %s -> %s\n" "$path ($field)" "$old_ver" "$new_version"
  done < <(declared_files)

  echo ""
  echo "Done. Running audit to check for missed files..."
  echo ""
  cmd_audit
}

# --- main ---

if ! command -v python3 >/dev/null 2>&1; then
  echo "error: required tool 'python3' is not on PATH" >&2
  exit 1
fi

case "${1:-}" in
  --check)
    cmd_check
    ;;
  --audit)
    cmd_audit
    ;;
  --help|-h|"")
    echo "Usage: bump-version.sh <new-version> | --check | --audit"
    echo ""
    echo "  <new-version>  Bump all declared files to the given version"
    echo "  --check        Show current versions, detect drift"
    echo "  --audit        Check + scan repo for undeclared version references"
    exit 0
    ;;
  --*)
    echo "error: unknown flag '$1'" >&2
    exit 1
    ;;
  *)
    cmd_bump "$1"
    ;;
esac
