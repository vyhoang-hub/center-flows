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

    // "About this center" card — collapsible, with child sections (staff
    // distribution, observations & notes). Falls back to the old `staff` shape.
    var about = data.about;
    if (!about && data.staff) {
      about = {
        layers: data.staff.layers,
        title: "About this center",
        sections: [{
          heading: "Staff distribution",
          text: data.staff.summary,
          items: data.staff.breakdown || [],
        }],
      };
    }
    if (about) {
      var card = document.getElementById("staffCard");
      card.dataset.layers = (about.layers || []).join(",");

      // Render a list item, which may itself carry nested `children`.
      function renderItem(i) {
        if (typeof i === "string") return "<li>" + escText(i) + "</li>";
        var kids = i.children && i.children.length
          ? "<ul>" + i.children.map(renderItem).join("") + "</ul>" : "";
        return "<li>" + escText(i.text || "") + kids + "</li>";
      }

      // The center's meta.tags become the first section (moved out of the header).
      var tags = (data.meta && data.meta.tags) || [];
      var tagsHtml = tags.length
        ? '<div class="about-section about-tags">' +
            tags.map(function (t) {
              var label = typeof t === "string" ? t : t.label;
              var tone = typeof t === "string" ? "neutral" : (t.tone || "neutral");
              var icon = typeof t === "string" ? "" : (t.icon || "");
              var ic = (typeof iconSvg === "function") ? iconSvg(icon, 15) : "";
              return '<span class="tag" data-tone="' + tone + '">' +
                (ic ? '<span class="tag-ic">' + ic + "</span>" : "") +
                "<span>" + escText(label) + "</span></span>";
            }).join("") +
          "</div>"
        : "";

      var body = tagsHtml + (about.sections || []).map(function (s) {
        return '<div class="about-section">' +
          (s.heading ? "<h4>" + escText(s.heading) + "</h4>" : "") +
          (s.text ? "<p>" + escText(s.text) + "</p>" : "") +
          (s.items && s.items.length
            ? "<ul>" + s.items.map(renderItem).join("") + "</ul>"
            : "") +
          "</div>";
      }).join("");
      card.innerHTML =
        '<button class="about-head" id="aboutToggle" aria-expanded="true">' +
          "<span>" + escText(about.title || "About this center") + "</span>" +
          '<span class="about-caret" aria-hidden="true">▾</span>' +
        "</button>" +
        '<div class="about-body" id="aboutBody">' + body + "</div>";
      // Collapse / expand.
      card.querySelector("#aboutToggle").addEventListener("click", function () {
        var collapsed = card.classList.toggle("collapsed");
        this.setAttribute("aria-expanded", String(!collapsed));
      });
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
  currentId: null,   // which node's detail is showing (for click-to-toggle)

  /* Clicking a node opens its detail; clicking the SAME node again closes it.
     Returns true if the card is now open, false if it was toggled closed. */
  toggle: function (node) {
    var el = document.getElementById("detail");
    if (this.currentId === node.id && el.classList.contains("open")) {
      this.close();
      return false;
    }
    this.open(node);
    return true;
  },

  open: function (node) {
    var el = document.getElementById("detail");
    this.currentId = node.id;
    el.dataset.cat = node.category || "neutral";
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
    this.currentId = null;
    // Clear the selected-shape highlight (× button, Escape, or re-click).
    if (window.Diagram && Diagram.select) Diagram.select(null);
  },
};

function escText(s) {
  return String(s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
