/* =============================================================================
 * panels.js — the Layers panel (toggles + show/hide all) and the detail panel
 * ========================================================================== */

var Panels = {
  data: null,
  layerState: {},        // { layerId: true|false }
  onChange: null,        // called whenever visibility changes

  initLayers: function (data, onChange) {
    this.data = data;
    this.onChange = onChange;
    data.layers.forEach(function (l) { Panels.layerState[l.id] = l.on !== false; });

    var host = document.getElementById("layerList");
    host.innerHTML = "";
    data.layers.forEach(function (l) {
      var row = document.createElement("div");
      row.className = "layer-row";
      row.dataset.color = l.color || "neutral";
      row.dataset.layer = l.id;
      row.setAttribute("role", "button");
      row.setAttribute("tabindex", "0");
      row.setAttribute("aria-pressed", String(Panels.layerState[l.id]));
      row.innerHTML =
        '<span class="layer-dot"></span>' +
        '<span class="layer-name">' + escText(l.label) + "</span>" +
        '<span class="switch"></span>';
      row.addEventListener("click", function () { Panels.toggle(l.id); });
      row.addEventListener("keydown", function (ev) {
        if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); Panels.toggle(l.id); }
      });
      host.appendChild(row);
    });

    // Staff distribution annotation card
    if (data.staff) {
      var card = document.getElementById("staffCard");
      card.dataset.layers = (data.staff.layers || []).join(",");
      card.innerHTML =
        "<h3>Staff distribution</h3>" +
        "<p>" + escText(data.staff.summary) + "</p>" +
        "<ul>" + (data.staff.breakdown || []).map(function (b) {
          return "<li>" + escText(b) + "</li>";
        }).join("") + "</ul>";
    }

    document.getElementById("showAll").addEventListener("click", function () { Panels.setAll(true); });
    document.getElementById("hideAll").addEventListener("click", function () { Panels.setAll(false); });
  },

  toggle: function (id) {
    this.layerState[id] = !this.layerState[id];
    this._sync(id);
    this.onChange();
  },

  setAll: function (on) {
    var host = document.getElementById("layerList");
    this.data.layers.forEach(function (l) {
      Panels.layerState[l.id] = on;
      var row = host.querySelector('[data-layer="' + l.id + '"]');
      if (row) row.setAttribute("aria-pressed", String(on));
    });
    this.onChange();
  },

  _sync: function (id) {
    var row = document.querySelector('.layer-row[data-layer="' + id + '"]');
    if (row) row.setAttribute("aria-pressed", String(this.layerState[id]));
  },

  /* An element is visible if AT LEAST ONE of its layers is on.
     (Elements with no layers are always visible.) */
  isVisible: function (layersCsv) {
    if (!layersCsv) return true;
    var ids = layersCsv.split(",").filter(Boolean);
    if (!ids.length) return true;
    for (var i = 0; i < ids.length; i++) {
      if (this.layerState[ids[i]]) return true;
    }
    return false;
  },
};

/* --- Detail panel --------------------------------------------------------- */
var Detail = {
  open: function (node) {
    var el = document.getElementById("detail");
    el.dataset.color = node.color || "neutral";
    var d = node.detail || {};

    var head = document.getElementById("detailHead");
    head.innerHTML =
      '<button class="detail-close" aria-label="Close">&times;</button>' +
      (d.subtitle ? '<div class="kicker">' + escText(d.subtitle) + "</div>" : "") +
      "<h2>" + escText(node.label) + "</h2>";
    head.querySelector(".detail-close").addEventListener("click", Detail.close);

    var body = document.getElementById("detailBody");
    var html = "";
    if (d.systems && d.systems.length) {
      html += "<h3>Systems used</h3><div>" +
        d.systems.map(function (s) { return '<span class="chip">' + escText(s) + "</span>"; }).join("") +
        "</div>";
    }
    if (d.responsibilities && d.responsibilities.length) {
      html += "<h3>Responsibilities</h3><ul>" +
        d.responsibilities.map(function (r) { return "<li>" + escText(r) + "</li>"; }).join("") +
        "</ul>";
    }
    if (d.notes && d.notes.length) {
      html += "<h3>Notes &amp; observations</h3><ul>" +
        d.notes.map(function (n) { return "<li>" + escText(n) + "</li>"; }).join("") +
        "</ul>";
    }
    if (!html) html = "<p style='color:var(--ink-soft)'>No additional detail recorded yet.</p>";
    body.innerHTML = html;

    el.classList.add("open");
  },

  close: function () {
    document.getElementById("detail").classList.remove("open");
  },
};

function escText(s) {
  return String(s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
