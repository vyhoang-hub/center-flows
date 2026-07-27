#!/usr/bin/env bash
# =============================================================================
# crypt.sh — encrypt a file into a password-protected JSON envelope
# =============================================================================
# Why: the published site lives on GitHub Pages, which is readable by anyone who
# has the URL. This wraps the app's code + research data in AES-256 so the server
# only ever holds ciphertext, and the browser decrypts it after the reader types
# the passphrase. See HOSTING.md.
#
# Usage:   bash crypt.sh payload.js > envelope.json
#          (build.sh calls this for you — you rarely run it directly)
#
# Scheme (encrypt-then-MAC; every primitive exists in both openssl and the
# browser's built-in WebCrypto, so no JS crypto library is needed):
#
#   salt    = 8 random bytes
#   master  = PBKDF2-SHA256(passphrase, salt, 600000 iterations, 32 bytes)
#   encKey  = HMAC-SHA256(master, "dispatch-hub/v1/enc")   <- separate keys, so
#   macKey  = HMAC-SHA256(master, "dispatch-hub/v1/mac")      one never doubles
#                                                             as the other
#   iv      = 16 random bytes
#   ct      = AES-256-CBC(payload, encKey, iv)
#   mac     = HMAC-SHA256(macKey, salt || iv || ct)
#
# The browser checks `mac` BEFORE it tries to decrypt. A wrong passphrase fails
# that check and is rejected outright, which both gives a clean "wrong password"
# message and avoids feeding attacker-chosen bytes to the CBC unpadder.
#
# Two notes on why it is built this exact way:
#  * AES-GCM would normally be the obvious choice, but this machine's OpenSSL
#    refuses it: `openssl enc -aes-256-gcm` -> "AEAD ciphers not supported".
#    CBC + HMAC is the standard construction to use when AEAD isn't available.
#  * The passphrase is fed to openssl on STDIN, never as a command-line
#    argument. Arguments are visible to any other process on the machine (and
#    end up in shell history). This is also why `openssl kdf` is not used for
#    the PBKDF2 step even though it looks like the natural tool -- it only
#    accepts the password as an argv parameter. `openssl enc -P` does the same
#    PBKDF2 derivation while reading the password from stdin. Verified: both
#    produce identical bytes for the same salt/iterations.
#
# No Node/npm/Python needed — pure bash + openssl (both already on this machine).
# =============================================================================
set -euo pipefail

ITER=600000
KDF_HASH=sha256
ENC_INFO="dispatch-hub/v1/enc"
MAC_INFO="dispatch-hub/v1/mac"

IN="${1:-}"
[ -n "$IN" ] || { echo "ERROR: usage: bash crypt.sh <file-to-encrypt>" >&2; exit 1; }
[ -f "$IN" ] || { echo "ERROR: file not found: $IN" >&2; exit 1; }

command -v openssl >/dev/null || { echo "ERROR: openssl not found on PATH." >&2; exit 1; }

# --- 1. Read the passphrase (twice, hidden) -----------------------------------
# Prompts go to stderr so that `bash crypt.sh x > out.json` still shows them.
# $CRYPT_PASSPHRASE is an escape hatch for non-interactive/CI use; the normal
# path is the interactive prompt.
if [ -n "${CRYPT_PASSPHRASE:-}" ]; then
  PASS="$CRYPT_PASSPHRASE"
else
  # Read from the terminal, not stdin, so a piped/redirected stdin can't be
  # mistaken for the passphrase. /dev/tty is the reliable way to do that in Git
  # Bash, but it isn't always available — e.g. when bash.exe is launched from
  # PowerShell or cmd, or from an editor's task runner. Fall back to stdin in
  # that case rather than dying with "No such device or address".
  if [ -e /dev/tty ] && { : < /dev/tty; } 2>/dev/null; then
    TTY=/dev/tty
  elif [ -t 0 ]; then
    TTY=""                    # stdin is itself a terminal; read from it
  else
    echo "ERROR: no terminal available to prompt for a passphrase." >&2
    echo "       Run this from Git Bash, or set CRYPT_PASSPHRASE first." >&2
    exit 1
  fi

  read_secret() {             # read_secret <prompt> <varname>
    printf '%s' "$1" >&2
    if [ -n "$TTY" ]; then IFS= read -rs "$2" < "$TTY"; else IFS= read -rs "$2"; fi
    printf '\n' >&2
  }
  read_secret 'Passphrase: ' PASS
  read_secret 'Confirm:    ' PASS2
  [ "$PASS" = "$PASS2" ] || { echo "ERROR: passphrases did not match." >&2; exit 1; }
  unset PASS2
fi

[ -n "$PASS" ] || { echo "ERROR: passphrase must not be empty." >&2; exit 1; }
# Not a hard limit, just a nudge: anyone can download the encrypted blob and
# grind guesses offline, so passphrase length is the only real defence.
if [ "${#PASS}" -lt 12 ]; then
  echo "WARNING: passphrase is under 12 characters. Anyone can download the" >&2
  echo "         encrypted file and guess offline — prefer a long passphrase." >&2
fi

# --- 2. Derive the keys -------------------------------------------------------
# The salt MUST be exactly 8 bytes. `openssl enc -S` silently truncates anything
# longer ("hex string is too long, ignoring excess") and zero-pads anything
# shorter, while the browser would faithfully use every byte we put in the
# envelope. Any other length therefore produces a bundle that cannot be
# decrypted. Verified against RFC 6070: at exactly 8 bytes this is standard
# PBKDF2 and matches the published vectors. Don't "improve" this to 16.
SALT=$(openssl rand -hex 8)
IV=$(openssl rand -hex 16)
[ ${#SALT} -eq 16 ] || { echo "ERROR: salt must be 8 bytes (16 hex chars); got ${#SALT}." >&2; exit 1; }
[ ${#IV} -eq 32 ]   || { echo "ERROR: IV must be 16 bytes (32 hex chars); got ${#IV}." >&2; exit 1; }

# `enc -P` prints the PBKDF2 result instead of encrypting anything. We take only
# the key= line; its iv= is unused (we generate our own IV above).
MASTER=$(printf '%s' "$PASS" \
  | openssl enc -aes-256-cbc -pbkdf2 -iter "$ITER" -md "$KDF_HASH" \
      -S "$SALT" -pass stdin -P 2>/dev/null \
  | sed -n 's/^key=//p')
[ ${#MASTER} -eq 64 ] || { echo "ERROR: key derivation failed (got ${#MASTER} hex chars, expected 64)." >&2; exit 1; }

hmac_hex() {  # hmac_hex <hex-key> <message-string>  -> hex digest
  printf '%s' "$2" | openssl dgst -sha256 -mac HMAC -macopt "hexkey:$1" -binary \
    | od -An -tx1 | tr -d ' \n'
}
ENCKEY=$(hmac_hex "$MASTER" "$ENC_INFO")
MACKEY=$(hmac_hex "$MASTER" "$MAC_INFO")
unset PASS MASTER   # done with the secrets; drop them from the environment

# --- 3. Encrypt, then MAC over salt||iv||ct -----------------------------------
CT_BIN=$(mktemp); MAC_IN=$(mktemp)
trap 'rm -f "$CT_BIN" "$MAC_IN"' EXIT

openssl enc -aes-256-cbc -K "$ENCKEY" -iv "$IV" -in "$IN" -out "$CT_BIN"

{ printf '%s' "$SALT" | xxd -r -p
  printf '%s' "$IV"   | xxd -r -p
  cat "$CT_BIN"
} > "$MAC_IN"
MAC_B64=$(openssl dgst -sha256 -mac HMAC -macopt "hexkey:$MACKEY" -binary "$MAC_IN" | base64 -w0)
CT_B64=$(base64 -w0 < "$CT_BIN")

# --- 4. Emit the envelope -----------------------------------------------------
# Parameters travel with the data, so bumping ITER later can't break old bundles.
cat <<JSON
{"v":1,
 "kdf":{"name":"PBKDF2","hash":"SHA-256","iter":$ITER},
 "info":{"enc":"$ENC_INFO","mac":"$MAC_INFO"},
 "salt":"$SALT",
 "iv":"$IV",
 "ct":"$CT_B64",
 "mac":"$MAC_B64"}
JSON

echo "  encrypted $(wc -c < "$IN") bytes -> $(printf '%s' "$CT_B64" | wc -c) base64 chars" >&2
