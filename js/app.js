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
    // A tag may be a plain string (legacy) or { label, tone, icon }.
    var label = typeof t === "string" ? t : t.label;
    var tone = typeof t === "string" ? "neutral" : (t.tone || "neutral");
    var icon = typeof t === "string" ? "" : (t.icon || "");
    var s = document.createElement("span");
    s.className = "tag";
    s.dataset.tone = tone;
    // icon is a Lucide name (e.g. "map-pin"); render inline SVG at tag size.
    var ic = iconSvg(icon, 15);
    s.innerHTML = (ic ? '<span class="tag-ic">' + ic + "</span>" : "") +
      "<span>" + esc(label) + "</span>";
    tagHost.appendChild(s);
  });
  document.title = data.meta.name + " — Dispatch Workflow";

  // --- Diagram --------------------------------------------------------------
  Diagram.render(data, function (node, el) {
    var wasOpen = Detail.toggle(node);   // returns true if the card is now open
    Diagram.select(wasOpen ? el : null); // highlight the selected shape, or clear
  });

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

  /* Show/hide every element based on the current layer toggles. Every drawn
     element carries a data-layers attribute — including the incident-flow story
     notes (.annotation-note) and the region blob/labels — so they toggle with
     their layer (e.g. the flow notes hide/show with Incident Flow). */
  function applyVisibility() {
    document.querySelectorAll(
      ".node, .connector, .pill, .zone, .edge, .annotation-note, .region, .region-label"
    ).forEach(function (el) {
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
