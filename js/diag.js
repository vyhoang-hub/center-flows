/* =============================================================================
 * diag.js — TEMPORARY on-screen diagnostics for the SharePoint embed.
 * =============================================================================
 * The diagram renders locally but not inside the SharePoint iframe, where we
 * can't open a dev console. This shows a small overlay with the facts we need
 * to pinpoint the cause, and surfaces any thrown error on-screen.
 *
 * Toggle: the overlay always shows for now. Add "#nodiag" to the URL to hide it.
 * Remove this file (and its <script> line) once the embed issue is resolved.
 * ========================================================================== */
(function () {
  if (location.hash.indexOf("nodiag") !== -1) return;

  var lines = [];
  function push(label, val) { lines.push(label + ": " + val); }

  // Catch anything that throws anywhere, so a silent error becomes visible.
  var caughtError = null;
  window.addEventListener("error", function (e) {
    caughtError = (e.message || "error") + (e.filename ? " @" + e.filename : "") +
      (e.lineno ? ":" + e.lineno : "");
    render();
  });
  window.addEventListener("unhandledrejection", function (e) {
    caughtError = "promise: " + (e.reason && e.reason.message ? e.reason.message : e.reason);
    render();
  });

  var box;
  function render() {
    if (!box) {
      box = document.createElement("div");
      box.id = "diagBox";
      box.style.cssText =
        "position:fixed;left:8px;bottom:8px;z-index:99999;max-width:340px;" +
        "background:#111827;color:#e5e7eb;font:11px/1.45 monospace;" +
        "padding:10px 12px;border-radius:8px;box-shadow:0 4px 16px rgba(0,0,0,.4);" +
        "white-space:pre-wrap;opacity:.94;";
      document.body.appendChild(box);
    }
    var text = "DIAGNOSTICS (add #nodiag to URL to hide)\n" + lines.join("\n");
    if (caughtError) text += "\n⚠ ERROR: " + caughtError;
    box.textContent = text;
  }

  function collect() {
    lines = [];
    var d = window.DISPATCH_CENTER;
    push("DISPATCH_CENTER", d ? "present" : "MISSING");
    if (d) {
      push("nodes/connectors", (d.nodes ? d.nodes.length : "?") + " / " +
        (d.connectors ? d.connectors.length : "?"));
    }
    push("ASSET_MAP", window.ASSET_MAP ? Object.keys(window.ASSET_MAP).length + " svgs" : "MISSING");

    var wrap = document.getElementById("canvasWrap");
    var stage = document.getElementById("stage");
    push("canvasWrap size", wrap ? (wrap.clientWidth + "x" + wrap.clientHeight) : "no #canvasWrap");
    push("stage children", stage ? stage.childNodes.length : "no #stage");
    push("stage transform", stage ? (getComputedStyle(stage).transform || "none") : "-");

    // The big question: does this iframe allow data: images? (CSP test.)
    var img = new Image();
    img.onload = function () { push("data: images", "ALLOWED"); render(); };
    img.onerror = function () { push("data: images", "BLOCKED (likely CSP)"); render(); };
    img.src = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyIiBoZWlnaHQ9IjIiPjwvc3ZnPg==";

    render();
  }

  // Run after everything else has had a chance to render.
  if (document.readyState === "complete") setTimeout(collect, 300);
  else window.addEventListener("load", function () { setTimeout(collect, 300); });
})();
