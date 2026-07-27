#!/usr/bin/env bash
# =============================================================================
# build.sh — bundle the whole app into ONE self-contained dist/index.html
# =============================================================================
# Why: some hosts (notably SharePoint document libraries) can't serve a folder
# of linked files — relative links to css/js/assets break and you get a blank
# page. This script inlines everything (CSS, JS, every center's data, and every
# SVG) into a single HTML file with no external references, so it can be dropped
# anywhere as one file.
#
# By default the bundle is ENCRYPTED behind a passphrase (see crypt.sh): the
# diagrams and the research data are stored as ciphertext and only decrypted in
# the reader's browser. That is what makes it safe to publish to GitHub Pages,
# which is readable by anyone who has the URL. See HOSTING.md.
#
# Usage:   bash build.sh                    # encrypted bundle of EVERY center
#          bash build.sh data/other.js      # just one center (or list several)
#          bash build.sh --plain            # UNENCRYPTED, for local preview only
#
# Output:  dist/index.html   (open it by double-click to verify)
#
# Every data/*.js except _template.js is bundled, so adding a center means adding
# the file and one <script> line in index.html — this script needs no changes.
#
# No Node/npm/Python needed — pure bash + base64 + openssl (all already here).
# Re-run this whenever you change the app or the data and want a fresh bundle.
# =============================================================================
set -euo pipefail
cd "$(dirname "$0")"

# --- Parse arguments ----------------------------------------------------------
# --plain skips encryption. Handy for checking a change renders before you go to
# the trouble of typing a passphrase, but never publish the result.
ENCRYPT=1
DATA_FILES=()
for arg in "$@"; do
  case "$arg" in
    --plain) ENCRYPT=0 ;;
    -h|--help) sed -n '2,28p' "$0"; exit 0 ;;
    -*) echo "ERROR: unknown option: $arg" >&2; exit 1 ;;
    *)  DATA_FILES+=("$arg") ;;
  esac
done

# No files named: bundle every center. _template.js is skipped because it's a
# copy-me reference, not a real center — bundling it would put a "REPLACE-ME"
# card on the home page.
if [ "${#DATA_FILES[@]}" -eq 0 ]; then
  for f in data/*.js; do
    [ "$(basename "$f")" = "_template.js" ] && continue
    DATA_FILES+=("$f")
  done
fi
[ "${#DATA_FILES[@]}" -gt 0 ] || { echo "ERROR: no data files found in data/" >&2; exit 1; }

OUT_DIR="dist"
OUT="$OUT_DIR/index.html"

for f in "${DATA_FILES[@]}"; do
  [ -f "$f" ] || { echo "ERROR: data file not found: $f" >&2; exit 1; }
done
mkdir -p "$OUT_DIR"

if [ "$ENCRYPT" -eq 1 ]; then
  echo "Bundling ${#DATA_FILES[@]} center(s) -> $OUT (encrypted)"
else
  echo "Bundling ${#DATA_FILES[@]} center(s) -> $OUT (PLAIN — do not publish this)"
fi

# --- 1. Build window.ASSET_MAP from every .svg the data files reference --------
# Each SVG becomes a base64 data: URI so it lives inside the HTML.
ASSET_JS="$(mktemp)"
PAYLOAD="$(mktemp)"
ENVELOPE="$(mktemp)"
trap 'rm -f "$ASSET_JS" "$PAYLOAD" "$ENVELOPE"' EXIT
echo "window.ASSET_MAP = {" > "$ASSET_JS"
count=0
# Pull every asset name out of every data file. Assets are referenced by several
# keys: `asset` (connectors/regions), `glow` and `iconAsset` (resource nodes &
# pills). Names are either 40-char Figma hashes or slugs like inside-center-blob.
# `grep -h` suppresses the filename prefix that appears once there are 2+ files;
# `sort -u` then de-duplicates assets shared between centers.
for hash in $(grep -hoE '(asset|glow|iconAsset): "[A-Za-z0-9_-]+"' "${DATA_FILES[@]}" | grep -oE '"[A-Za-z0-9_-]+"' | tr -d '"' | sort -u); do
  svg="assets/$hash.svg"
  if [ ! -f "$svg" ]; then
    echo "  WARNING: referenced asset missing, skipping: $svg" >&2
    continue
  fi
  b64=$(base64 -w0 "$svg" 2>/dev/null || base64 "$svg" | tr -d '\n')
  echo "  \"$hash\": \"data:image/svg+xml;base64,$b64\"," >> "$ASSET_JS"
  count=$((count + 1))
done
echo "};" >> "$ASSET_JS"
echo "  inlined $count SVG asset(s)"

# --- 2. Collect everything that must be kept secret --------------------------
# This is the app's brain plus the research content. In an encrypted build it all
# becomes one ciphertext blob; the order is the same load order index.html uses,
# because diagram.js/panels.js declare top-level `var Diagram`/`Panels`/`Detail`
# that app.js and hub.js then read — they have to end up in one shared scope, and
# hub.js goes LAST because it boots the router.
{
  cat "$ASSET_JS"        # window.ASSET_MAP (inlined SVGs) — must come first
  echo ''
  for f in "${DATA_FILES[@]}"; do
    cat "$f"             # each center registers itself on window.RESEARCH_CENTERS
    echo ''
  done
  cat js/diagram.js
  echo ''
  cat js/panels.js
  echo ''
  cat js/app.js
  echo ''
  cat js/hub.js          # last: renders the home page / routes to a center
} > "$PAYLOAD"

if [ "$ENCRYPT" -eq 1 ]; then
  # crypt.sh prompts for the passphrase on stderr and writes JSON to stdout.
  bash crypt.sh "$PAYLOAD" > "$ENVELOPE"
fi

# --- 3. Assemble the single HTML file ----------------------------------------
{
  echo '<!DOCTYPE html>'
  echo '<html lang="en">'
  echo '<head>'
  echo '  <meta charset="UTF-8" />'
  echo '  <meta name="viewport" content="width=device-width, initial-scale=1.0" />'
  echo '  <title>User Research Hub</title>'
  echo '  <!-- Bundled build: all CSS/JS/data/SVGs inlined. Generated by build.sh. -->'
  echo '  <style>'
  cat css/theme.css
  cat css/app.css
  cat css/hub.css        # after app.css — it overrides a few of its rules
  [ "$ENCRYPT" -eq 1 ] && cat css/gate.css
  echo '  </style>'
  echo '</head>'
  echo '<body>'

  # Passphrase screen. Sits above the app markup and removes itself once the
  # payload is decrypted. The app shell below stays empty until then.
  if [ "$ENCRYPT" -eq 1 ]; then
    cat <<'GATE'
  <div class="gate" id="gate">
    <div class="gate-card">
      <h1>User Research Hub</h1>
      <p id="gateNote">This page holds internal UX research. Enter the passphrase to view it.</p>
      <div class="gate-row">
        <input type="password" id="gatePass" placeholder="Passphrase"
               autocomplete="off" autocapitalize="off" spellcheck="false" />
        <button type="button" id="gateBtn">Unlock</button>
      </div>
      <div class="gate-msg" id="gateMsg" role="status" aria-live="polite"></div>
    </div>
  </div>
GATE
  fi
  # Body markup is extracted straight from index.html (the lines between <body>
  # and the first <script>), so the bundle NEVER drifts from the real page.
  # We drop index.html's <script src=...> tags because the bundle inlines all JS
  # right below instead.
  # Anchor the stop pattern to a <script tag at the START of a line. index.html's
  # load-order comment mentions the word "<script>" in prose, so an unanchored
  # match would stop mid-comment and emit an UNCLOSED <!-- --> that swallows all
  # the inlined JS (blank page). ^[[:space:]]*<script only matches real tags.
  awk '
    /<body>/                    { inbody=1; next }
    inbody && /^[[:space:]]*<script/ { exit }
    inbody                      { print }
  ' index.html
  if [ "$ENCRYPT" -eq 1 ]; then
    # Only ciphertext reaches the page. The envelope carries its own KDF
    # parameters, so a future iteration-count change won't break old bundles.
    echo '  <script>'
    printf 'window.__ENVELOPE__ = '
    cat "$ENVELOPE"
    echo ';'
    echo '  </script>'
    echo '  <script>'
    cat js/gate.js
    echo '  </script>'
  else
    echo '  <script>'
    cat "$PAYLOAD"
    echo '  </script>'
  fi
  echo '</body>'
  echo '</html>'
} > "$OUT"

# --- 4. Safety net: prove no plaintext research leaked into an encrypted build -
# Cheap insurance against a future edit accidentally putting the payload back in
# the clear. Canaries are strings that only exist in the research content.
#
# 'RESEARCH_CENTERS' is the catch-all: every data file ends with the line that
# registers itself on it, so this one string catches ANY center leaking in the
# clear — including centers added after this was written.
if [ "$ENCRYPT" -eq 1 ]; then
  leaked=0
  for canary in 'Priority 1' 'NORCOMM' 'Bellevue' 'DISPATCH_CENTER' 'RESEARCH_CENTERS'; do
    if grep -qF "$canary" "$OUT"; then
      echo "ERROR: plaintext '$canary' found in $OUT — refusing to leave a leaky bundle." >&2
      leaked=1
    fi
  done
  if [ "$leaked" -eq 1 ]; then
    rm -f "$OUT"
    exit 1
  fi
  echo "  verified: no plaintext research content in the bundle"
fi

bytes=$(wc -c < "$OUT")
echo "Done: $OUT ($bytes bytes). Double-click it to verify before uploading."
if [ "$ENCRYPT" -eq 0 ]; then
  echo "NOTE: this is a PLAIN bundle — readable by anyone. Do not publish it." >&2
fi
