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
})();
