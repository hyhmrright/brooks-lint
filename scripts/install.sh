#!/usr/bin/env bash
#
# brooks-lint universal skill installer.
#
# brooks-lint ships as standard Agent Skills (SKILL.md). Most modern coding
# agents discover skills from a per-platform folder with a single-level glob
# (skills/<name>/SKILL.md) and read shared files via the relative path
# ../_shared/. This script copies the six skills + _shared/ FLAT into the right
# folder for your platform, so the relative reads always resolve — you can't get
# the layout wrong.
#
# Usage:
#   ./scripts/install.sh <platform> [--project]
#   curl -fsSL https://raw.githubusercontent.com/hyhmrright/brooks-lint/main/scripts/install.sh | bash -s -- <platform>
#
# Platforms: opencode cursor windsurf antigravity pi kiro copilot claude agents
#   agents = the vendor-neutral ~/.agents/skills folder (read by Cursor, Copilot, pi)
#
# Flags:
#   --project   install into the current repo (./.<platform>/skills) instead of the global folder
#   --dir PATH  install into an explicit folder (overrides platform mapping)
#   --list      print supported platforms and exit
#
set -euo pipefail

REPO_URL="https://github.com/hyhmrright/brooks-lint.git"
PLATFORMS="opencode cursor windsurf antigravity pi kiro copilot claude agents"

err()  { printf '\033[31merror:\033[0m %s\n' "$*" >&2; }
info() { printf '\033[36m›\033[0m %s\n' "$*"; }
ok()   { printf '\033[32m✓\033[0m %s\n' "$*"; }

# --- resolve the skills/ source (adjacent to this script, or clone) ----------
resolve_src() {
  local script_dir
  script_dir="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" >/dev/null 2>&1 && pwd || true)"
  if [ -n "$script_dir" ] && [ -d "$script_dir/../skills" ]; then
    local root
    root="$( cd "$script_dir/.." && pwd )"
    printf '%s' "$root/skills"
    return
  fi
  # Running via curl | bash — clone a shallow copy.
  local tmp
  tmp="$(mktemp -d)"
  info "Cloning brooks-lint into $tmp …" >&2
  git clone --depth 1 "$REPO_URL" "$tmp/brooks-lint" >/dev/null 2>&1
  printf '%s' "$tmp/brooks-lint/skills"
}

# --- map a platform to its skills folder -------------------------------------
global_dir() {
  case "$1" in
    opencode)    printf '%s' "$HOME/.config/opencode/skills" ;;
    cursor)      printf '%s' "$HOME/.cursor/skills" ;;
    windsurf)    printf '%s' "$HOME/.codeium/windsurf/skills" ;;
    antigravity) printf '%s' "$HOME/.gemini/skills" ;;
    pi)          printf '%s' "$HOME/.pi/agent/skills" ;;
    kiro)        printf '%s' "$HOME/.kiro/skills" ;;
    copilot)     printf '%s' "$HOME/.copilot/skills" ;;
    claude)      printf '%s' "$HOME/.claude/skills" ;;
    agents)      printf '%s' "$HOME/.agents/skills" ;;
    *)           return 1 ;;
  esac
}

project_dir() {
  case "$1" in
    opencode)    printf '%s' "$PWD/.opencode/skills" ;;
    cursor)      printf '%s' "$PWD/.cursor/skills" ;;
    windsurf)    printf '%s' "$PWD/.windsurf/skills" ;;
    antigravity) printf '%s' "$PWD/.agent/skills" ;;
    pi)          printf '%s' "$PWD/.pi/skills" ;;
    kiro)        printf '%s' "$PWD/.kiro/skills" ;;
    copilot)     printf '%s' "$PWD/.github/skills" ;;
    claude)      printf '%s' "$PWD/.claude/skills" ;;
    agents)      printf '%s' "$PWD/.agents/skills" ;;
    *)           return 1 ;;
  esac
}

# --- arg parsing -------------------------------------------------------------
PLATFORM=""
SCOPE="global"
EXPLICIT_DIR=""
while [ $# -gt 0 ]; do
  case "$1" in
    --project|--here) SCOPE="project" ;;
    --dir)            shift; EXPLICIT_DIR="${1:-}" ;;
    --list)           printf 'Supported platforms: %s\n' "$PLATFORMS"; exit 0 ;;
    -h|--help)        sed -n '2,28p' "${BASH_SOURCE[0]:-$0}" | sed 's/^# \{0,1\}//'; exit 0 ;;
    -*)               err "unknown flag: $1"; exit 2 ;;
    *)                PLATFORM="$1" ;;
  esac
  shift
done

if [ -z "$PLATFORM" ] && [ -z "$EXPLICIT_DIR" ]; then
  err "no platform given."
  printf 'Supported platforms: %s\n' "$PLATFORMS" >&2
  printf 'Example: ./scripts/install.sh opencode\n' >&2
  exit 2
fi

# --- resolve destination -----------------------------------------------------
if [ -n "$EXPLICIT_DIR" ]; then
  DEST="$EXPLICIT_DIR"
elif [ "$SCOPE" = "project" ]; then
  DEST="$(project_dir "$PLATFORM")" || { err "unknown platform: $PLATFORM"; exit 2; }
else
  DEST="$(global_dir "$PLATFORM")" || { err "unknown platform: $PLATFORM"; exit 2; }
fi

SRC="$(resolve_src)"
[ -d "$SRC" ] || { err "could not locate skills/ source at: $SRC"; exit 1; }

# --- copy flat ---------------------------------------------------------------
info "Installing brooks-lint skills"
info "  from: $SRC"
info "  to:   $DEST"
mkdir -p "$DEST"
cp -R "$SRC"/* "$DEST"/

count="$(find "$DEST" -maxdepth 2 -name SKILL.md | wc -l | tr -d ' ')"
ok "Installed $count skills (+ _shared/) into $DEST"
info "Flat layout verified: brooks-* and _shared/ are siblings, so ../_shared/ resolves."
echo
info "Next: open your agent and ask \"review this PR\" / \"audit the architecture\","
info "or invoke a skill directly (e.g. /brooks-review). See docs/<platform>-setup.md."
