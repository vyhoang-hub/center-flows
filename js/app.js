/* =============================================================================
 * app.js — wires one center's data into the diagram and the panels.
 * =============================================================================
 * This used to run itself on load, back when the page showed exactly one center.
 * Now hub.js calls CenterApp.mount(data) when you open a center's diagram, so the
 * same wiring is reused for every center. The logic is unchanged; it is just
 * split into the part that runs per center (draw the diagram, build the layer
 * list) and the part that must only ever run once (the toolbar buttons, Escape,
 * fullscreen — they live in static markup that outlives any single center).
 * ========================================================================== */

var CenterApp = {
  mounted: null,          // meta.id of the center currently drawn, or null
  _controlsWired: false,  // toolbar/keyboard listeners bound? (page-lifetime)

  /* Draw `data` into the existing diagram markup. Safe to call repeatedly:
     re-opening the same center just refits instead of redrawing. */
  mount: function (data) {
    if (!data) return;
    if (this.mounted === data.meta.id) {
      // Already drawn. The canvas may have had zero size while another tab was
      // showing, so fit() is what actually needs redoing.
      Diagram.fit();
      return;
    }
    this.mounted = data.meta.id;

    // --- Header -------------------------------------------------------------
    document.getElementById("centerName").textContent = data.meta.name;
    document.getElementById("centerSub").textContent =
      [data.meta.location, data.meta.visitDate].filter(Boolean).join(" · ");
    // meta.tags are now rendered inside the "About this center" card (see
    // panels.js), not in the header — so the header stays clean.

    // --- Diagram ------------------------------------------------------------
    Diagram.render(data, function (node, el) {
      var wasOpen = Detail.toggle(node);   // returns true if the card is now open
      Diagram.select(wasOpen ? el : null); // highlight the selected shape, or clear
    });

    // --- Layers -------------------------------------------------------------
    Panels.initLayers(data, CenterApp.applyVisibility);
    this.applyVisibility();

    this._wireControls();
  },

  /* Show/hide every element based on the current layer toggles. Every drawn
     element carries a data-layers attribute — including the incident-flow story
     notes (.annotation-note) and the region blob/labels — so they toggle with
     their layer (e.g. the flow notes hide/show with Incident Flow). */
  applyVisibility: function () {
    document.querySelectorAll(
      ".node, .connector, .pill, .zone, .edge, .annotation-note, .region, .region-label"
    ).forEach(function (el) {
      el.classList.toggle("faded", !Panels.isVisible(el.dataset.layers));
    });
    // Staff annotation card
    var staff = document.getElementById("staffCard");
    if (staff) staff.style.display = Panels.isVisible(staff.dataset.layers) ? "" : "none";
  },

  /* Zoom / pan / fullscreen / panel controls. These attach to elements in the
     static markup, so they are bound once for the life of the page — binding
     them per center would fire each handler once per center ever opened. */
  _wireControls: function () {
    if (this._controlsWired) return;
    this._controlsWired = true;

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

    // --- Collapsible layers panel -------------------------------------------
    byId("panelCollapse").addEventListener("click", function () { setPanel(false); });
    byId("layersReopen").addEventListener("click", function () { setPanel(true); });

    // Close detail panel on Escape.
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") Detail.close();
    });

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
  },
};
