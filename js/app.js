/* =============================================================================
 * app.js — wires the data, the diagram, and the panels together.
 * Loaded last. Runs once the DOM and all other scripts are ready.
 * ========================================================================== */

(function () {
  var data = window.DISPATCH_CENTER;
  if (!data) {
    document.body.innerHTML =
      "<p style='padding:40px;font-family:sans-serif'>Could not find dispatch " +
      "center data. Check that data/norcomm.js loaded before app.js.</p>";
    return;
  }

  // --- Header ---------------------------------------------------------------
  document.getElementById("centerName").textContent = data.meta.name;
  document.getElementById("centerSub").textContent =
    [data.meta.location, data.meta.visitDate].filter(Boolean).join(" · ");
  var tagHost = document.getElementById("centerTags");
  (data.meta.tags || []).forEach(function (t) {
    var s = document.createElement("span");
    s.className = "tag";
    s.textContent = t;
    tagHost.appendChild(s);
  });
  document.title = data.meta.name + " — Dispatch Workflow";

  // --- Diagram --------------------------------------------------------------
  Diagram.render(data, function (node) { Detail.open(node); });

  // --- Layers ---------------------------------------------------------------
  Panels.initLayers(data, applyVisibility);
  applyVisibility();

  // --- Zoom / pan / fullscreen controls -------------------------------------
  byId("zoomIn").addEventListener("click", function () { Diagram.zoomAt(1.25); });
  byId("zoomOut").addEventListener("click", function () { Diagram.zoomAt(1 / 1.25); });
  byId("zoomFit").addEventListener("click", function () { Diagram.fit(); });
  byId("fullscreen").addEventListener("click", toggleFullscreen);

  // Keep the "Fit" view sensible when entering/leaving fullscreen.
  document.addEventListener("fullscreenchange", function () {
    var on = !!document.fullscreenElement;
    document.body.classList.toggle("is-fullscreen", on);
    // Let the layout settle, then refit.
    setTimeout(function () { Diagram.fit(); }, 60);
  });

  // --- Collapsible layers panel ---------------------------------------------
  byId("panelCollapse").addEventListener("click", function () { setPanel(false); });
  byId("layersReopen").addEventListener("click", function () { setPanel(true); });

  // Close detail panel on Escape.
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") Detail.close();
  });

  /* Show/hide every element based on the current layer toggles.
     Nodes, connectors, and pills all carry a data-layers attribute. */
  function applyVisibility() {
    document.querySelectorAll(".node, .connector, .pill, .zone, .edge").forEach(function (el) {
      el.classList.toggle("faded", !Panels.isVisible(el.dataset.layers));
    });
    // Staff annotation card
    var staff = document.getElementById("staffCard");
    if (staff) staff.style.display = Panels.isVisible(staff.dataset.layers) ? "" : "none";
  }

  function byId(id) { return document.getElementById(id); }

  /* Collapse/expand the right-hand Layers panel. When collapsed, the diagram
     takes the full width and a small "Layers" tab appears to bring it back. */
  function setPanel(open) {
    document.body.classList.toggle("panel-collapsed", !open);
    // The canvas changed width, so refit after the layout updates.
    setTimeout(function () { Diagram.fit(); }, 60);
  }

  /* Fullscreen the whole app — the biggest readability win inside a small
     SharePoint embed. Falls back silently if the browser blocks it. */
  function toggleFullscreen() {
    var el = document.querySelector(".app");
    if (!document.fullscreenElement) {
      if (el.requestFullscreen) el.requestFullscreen().catch(function () {});
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
    }
  }
})();
