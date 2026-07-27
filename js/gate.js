/* =============================================================================
 * gate.js — decrypts the app in the browser after the reader types the passphrase
 * =============================================================================
 * Only used by the encrypted bundle from build.sh. It expects two globals that
 * build.sh writes into the page just above this script:
 *
 *   window.__ENVELOPE__  the JSON envelope produced by crypt.sh
 *   window.__GATE_NOTE__ optional line of help text under the heading
 *
 * This must stay byte-compatible with crypt.sh. If you change the KDF, the info
 * strings, or the MAC input order in one file, change it in the other too.
 * Everything here is built-in WebCrypto — no crypto library is loaded.
 * ========================================================================== */

(function () {
  "use strict";

  var env = window.__ENVELOPE__;
  var elMsg, elInput, elBtn;

  function msg(text, busy) {
    if (!elMsg) return;
    elMsg.textContent = text;
    elMsg.classList.toggle("is-busy", !!busy);
  }

  /* --- encoding helpers ---------------------------------------------------- */
  function hexToBytes(hex) {
    var out = new Uint8Array(hex.length / 2);
    for (var i = 0; i < out.length; i++) out[i] = parseInt(hex.substr(i * 2, 2), 16);
    return out;
  }
  function b64ToBytes(b64) {
    var bin = atob(b64);
    var out = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  function concatBytes(list) {
    var len = 0, i;
    for (i = 0; i < list.length; i++) len += list[i].length;
    var out = new Uint8Array(len), at = 0;
    for (i = 0; i < list.length; i++) { out.set(list[i], at); at += list[i].length; }
    return out;
  }
  function utf8(str) { return new TextEncoder().encode(str); }

  /* --- key schedule — mirrors crypt.sh ------------------------------------ */
  // master = PBKDF2(passphrase, salt, iter)
  // encKey = HMAC-SHA256(master, info.enc)
  // macKey = HMAC-SHA256(master, info.mac)
  function deriveKeys(passphrase) {
    var salt = hexToBytes(env.salt);
    return crypto.subtle
      .importKey("raw", utf8(passphrase), { name: "PBKDF2" }, false, ["deriveBits"])
      .then(function (baseKey) {
        return crypto.subtle.deriveBits(
          { name: "PBKDF2", salt: salt, iterations: env.kdf.iter, hash: env.kdf.hash },
          baseKey,
          256
        );
      })
      .then(function (masterBits) {
        // The master secret is only ever used as an HMAC key to expand into the
        // two real keys, so it is imported as HMAC rather than as an AES key.
        return crypto.subtle.importKey(
          "raw", masterBits, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
        );
      })
      .then(function (masterKey) {
        return Promise.all([
          crypto.subtle.sign("HMAC", masterKey, utf8(env.info.enc)),
          crypto.subtle.sign("HMAC", masterKey, utf8(env.info.mac))
        ]);
      })
      .then(function (parts) {
        return Promise.all([
          crypto.subtle.importKey("raw", parts[0], { name: "AES-CBC" }, false, ["decrypt"]),
          crypto.subtle.importKey("raw", parts[1], { name: "HMAC", hash: "SHA-256" }, false, ["verify"])
        ]);
      })
      .then(function (keys) { return { enc: keys[0], mac: keys[1] }; });
  }

  function unlock(passphrase) {
    var salt = hexToBytes(env.salt);
    var iv   = hexToBytes(env.iv);
    var ct   = b64ToBytes(env.ct);
    var tag  = b64ToBytes(env.mac);
    var keys;

    return deriveKeys(passphrase)
      .then(function (k) {
        keys = k;
        // Verify BEFORE decrypting. A wrong passphrase fails here, so we never
        // hand attacker-influenced bytes to the CBC unpadder (padding oracle),
        // and a genuine tampered payload is rejected rather than executed.
        return crypto.subtle.verify("HMAC", k.mac, tag, concatBytes([salt, iv, ct]));
      })
      .then(function (ok) {
        if (!ok) throw new Error("BAD_PASSPHRASE");
        return crypto.subtle.decrypt({ name: "AES-CBC", iv: iv }, keys.enc, ct);
      })
      .then(function (plainBuf) {
        var code = new TextDecoder().decode(plainBuf);
        // Run the whole payload as ONE unit. diagram.js/panels.js declare
        // `var Diagram` / `var Panels` / `var Detail` at top level and app.js
        // reads them, so they must share a single scope — evaluating the parts
        // separately would leave app.js unable to see them.
        new Function(code)();
      });
  }

  /* --- wire up the form ---------------------------------------------------- */
  function init() {
    var gate = document.getElementById("gate");
    elInput = document.getElementById("gatePass");
    elBtn   = document.getElementById("gateBtn");
    elMsg   = document.getElementById("gateMsg");

    var note = document.getElementById("gateNote");
    if (note && window.__GATE_NOTE__) note.textContent = window.__GATE_NOTE__;

    // Secure context / old browser check — say so plainly instead of appearing
    // to accept the passphrase and then silently doing nothing.
    if (!window.crypto || !window.crypto.subtle) {
      elBtn.disabled = true;
      elInput.disabled = true;
      msg(
        "This browser can't decrypt the page: WebCrypto is unavailable. " +
        "Open the site over https:// (not a local file copy) in a current browser."
      );
      return;
    }

    var busy = false;

    function submit() {
      if (busy) return;
      var pass = elInput.value;
      if (!pass) { msg("Enter the passphrase."); elInput.focus(); return; }

      busy = true;
      elBtn.disabled = true;
      // 600k PBKDF2 iterations is deliberately slow (~1s) to make offline
      // guessing expensive, so tell the reader it's working.
      msg("Decrypting…", true);

      // Yield once so "Decrypting…" paints before the CPU-bound derivation.
      // setTimeout, not requestAnimationFrame: rAF is throttled (or never fires)
      // in a background tab or an iframe the browser isn't painting, which would
      // strand the reader on "Decrypting…" forever. This page's whole purpose is
      // to be embedded in a SharePoint iframe, so that risk is real.
      setTimeout(function () {
        unlock(pass)
          .then(function () {
            if (gate && gate.parentNode) gate.parentNode.removeChild(gate);
          })
          .catch(function (err) {
            busy = false;
            elBtn.disabled = false;
            elInput.value = "";
            elInput.focus();
            if (err && err.message === "BAD_PASSPHRASE") {
              msg("Incorrect passphrase.");
            } else {
              msg("Could not decrypt this page. " + ((err && err.message) || "Unknown error."));
            }
          });
      }, 0);
    }

    elBtn.addEventListener("click", submit);
    elInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") { e.preventDefault(); submit(); }
    });
    elInput.focus();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
