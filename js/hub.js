/* =============================================================================
 * hub.js — the User Research Hub: a home index of centers + each center's page
 * =============================================================================
 * Research is organized BY LOCATION, not by artifact type. The home page groups
 * every center by country, then by state/region. Opening a center gives you one
 * page holding everything learned at that site visit, split across tabs:
 * overview, mental models, personas, workflows, key findings, supporting
 * research.
 *
 * WHY THIS IS ONE PAGE AND NOT SEVERAL HTML FILES
 *   The published site is a single encrypted file — deploy-pages.yml uploads only
 *   dist/index.html, so a second .html file would simply 404. So the "pages" are
 *   views inside this document, switched by the URL hash. Deep links and the
 *   browser's back/forward button still work, and it still opens by double-click
 *   from a file:// path.
 *
 * HOW A CENTER GETS HERE
 *   Each data/<center>.js pushes itself onto window.RESEARCH_CENTERS. Add a file,
 *   and it appears — there is no list to keep in sync. See data/_template.js.
 *
 * ROUTES
 *   #/                       home — centers grouped by country / region
 *   #/c/<id>                 a center, on its default tab
 *   #/c/<id>/<section>       a center, on a named tab (deep-linkable)
 *
 * Plain browser JS, no modules: `var Hub` at top level, matching Diagram/Panels.
 * ========================================================================== */

var Hub = {
  /* The tabs on every center page. `key` is the slug used in the URL. Order here
     is the order they appear. Adding a section means adding one entry plus a
     render function below — the router and the tab strip need no changes. */
  SECTIONS: [
    { key: "overview",      label: "Overview",           field: "overview"     },
    { key: "mental-models", label: "Mental models",      field: "mentalModels" },
    { key: "personas",      label: "Personas",           field: "personas"     },
    { key: "workflows",     label: "Workflows",          field: "workflows"    },
    { key: "findings",      label: "Key findings",       field: "findings"     },
    { key: "supporting",    label: "Supporting research", field: "supporting"  },
  ],

  start: function () {
    window.addEventListener("hashchange", function () { Hub.route(); });
    this.route();
  },

  /* --- Data ---------------------------------------------------------------- */

  centers: function () { return window.RESEARCH_CENTERS || []; },

  center: function (id) {
    var all = this.centers();
    for (var i = 0; i < all.length; i++) {
      if (all[i].meta && all[i].meta.id === id) return all[i];
    }
    return null;
  },

  /* Group centers into [{ country, regions: [{ region, centers: [] }] }],
     everything sorted alphabetically so the index is stable and scannable. */
  byLocation: function () {
    var groups = [];
    function find(list, name, key) {
      for (var i = 0; i < list.length; i++) if (list[i][key] === name) return list[i];
      return null;
    }
    this.centers().forEach(function (c) {
      var geo = (c.meta && c.meta.geo) || {};
      var country = geo.country || "Location not recorded";
      var region = geo.region || "—";
      var g = find(groups, country, "country");
      if (!g) { g = { country: country, regions: [] }; groups.push(g); }
      var r = find(g.regions, region, "region");
      if (!r) { r = { region: region, centers: [] }; g.regions.push(r); }
      r.centers.push(c);
    });
    var byName = function (a, b) { return String(a).localeCompare(String(b)); };
    groups.sort(function (a, b) { return byName(a.country, b.country); });
    groups.forEach(function (g) {
      g.regions.sort(function (a, b) { return byName(a.region, b.region); });
      g.regions.forEach(function (r) {
        r.centers.sort(function (a, b) { return byName(a.meta.name, b.meta.name); });
      });
    });
    return groups;
  },

  /* How many research artifacts a center has, for the home card's summary line.
     `overview` isn't counted — it's context, not an artifact. */
  artifactCount: function (c) {
    var r = c.research || {};
    return ["mentalModels", "personas", "workflows", "findings", "supporting"]
      .reduce(function (n, k) { return n + ((r[k] && r[k].length) || 0); }, 0);
  },

  /* --- Routing ------------------------------------------------------------- */

  /* Read the hash into { view, id, section }. Anything unrecognised falls back
     to home rather than rendering an empty screen. */
  parse: function () {
    var raw = String(location.hash || "").replace(/^#\/?/, "");
    var parts = raw.split("/").filter(Boolean);
    if (parts[0] === "c" && parts[1]) {
      return { view: "center", id: decodeURIComponent(parts[1]), section: parts[2] || null };
    }
    return { view: "home" };
  },

  route: function () {
    var r = this.parse();
    if (r.view === "center") {
      var c = this.center(r.id);
      if (c) { this.renderCenter(c, r.section); return; }
      // Unknown center id (a stale link, or a data file that was renamed).
      location.replace("#/");
      return;
    }
    this.renderHome();
  },

  /* --- Shared rendering helpers -------------------------------------------- */

  /* Which pane is showing: the scrolling hub content, or the diagram canvas.
     Only one of the two is ever visible. */
  /* Marks the shell as home vs. center so hub.css can style the two differently
     (the landing page is a plain white sheet; center pages are layered cards). */
  _view: function (name) {
    document.getElementById("hub").setAttribute("data-view", name);
  },

  _show: function (which) {
    var main = document.getElementById("hubMain");
    var app = document.getElementById("centerApp");
    // Navigating away from the diagram closes any open node detail. Without this
    // the card would still be open on return — and if you opened a different
    // center it would be showing the previous center's node.
    if (which !== "diagram" && !app.hidden && typeof Detail !== "undefined") Detail.close();
    main.hidden = which !== "main";
    app.hidden = which !== "diagram";
  },

  /* Center tags, using the same markup panels.js emits for the About card, so
     the existing .tag[data-tone] styling and Lucide icons apply unchanged. */
  tagsHtml: function (tags) {
    if (!tags || !tags.length) return "";
    return '<div class="hub-tags">' + tags.map(function (t) {
      var label = typeof t === "string" ? t : t.label;
      var tone = typeof t === "string" ? "neutral" : (t.tone || "neutral");
      var icon = typeof t === "string" ? "" : (t.icon || "");
      var ic = (typeof iconSvg === "function") ? iconSvg(icon, 15) : "";
      return '<span class="tag" data-tone="' + tone + '">' +
        (ic ? '<span class="tag-ic">' + ic + "</span>" : "") +
        "<span>" + escText(label) + "</span></span>";
    }).join("") + "</div>";
  },

  /* A list item that may carry nested `children` — same shape the About card
     uses, so overview content can be moved between the two freely. */
  itemHtml: function (i) {
    if (typeof i === "string") return "<li>" + escText(i) + "</li>";
    var kids = i.children && i.children.length
      ? "<ul>" + i.children.map(Hub.itemHtml).join("") + "</ul>" : "";
    return "<li>" + escText(i.text || "") + kids + "</li>";
  },

  /* Shown when a section has no content yet. Names the data field to fill in, so
     the page tells you how to extend it. */
  emptyHtml: function (label, field) {
    return '<div class="hub-empty">' +
      "<p><strong>" + escText(label) + "</strong> hasn't been documented for this center yet.</p>" +
      '<p class="hub-empty-hint">Add entries to <code>research.' + escText(field) +
      "</code> in this center's data file.</p></div>";
  },

  chipsHtml: function (list) {
    if (!list || !list.length) return "";
    return '<div class="hub-chips">' + list.map(function (s) {
      return '<span class="chip">' + escText(s) + "</span>";
    }).join("") + "</div>";
  },

  listBlock: function (heading, items) {
    if (!items || !items.length) return "";
    return '<div class="res-block"><h4>' + escText(heading) + "</h4><ul>" +
      items.map(Hub.itemHtml).join("") + "</ul></div>";
  },

  /* --- Home ---------------------------------------------------------------- */

  renderHome: function () {
    document.title = "User Research Hub";
    this._view("home");
    this._show("main");

    var groups = this.byLocation();
    var total = this.centers().length;

    document.getElementById("hubBar").innerHTML =
      '<div class="hub-bar-main">' +
        '<h1 class="hub-title">User Research Hub</h1>' +
        '<p class="hub-sub">' +
          escText(total + (total === 1 ? " center" : " centers")) + " · " +
          escText(groups.length + (groups.length === 1 ? " country" : " countries")) +
          " · organized by site visit" +
        "</p>" +
      "</div>";

    if (!total) {
      document.getElementById("hubMain").innerHTML =
        '<div class="hub-page">' + this.emptyHtml("No centers", "…") + "</div>";
      return;
    }

    var html = groups.map(function (g) {
      return '<section class="geo-group">' +
        '<h2 class="geo-country">' + escText(g.country) + "</h2>" +
        g.regions.map(function (r) {
          return '<div class="geo-region-block">' +
            '<h3 class="geo-region">' + escText(r.region) + "</h3>" +
            '<div class="center-grid">' + r.centers.map(Hub.centerCard).join("") + "</div>" +
          "</div>";
        }).join("") +
      "</section>";
    }).join("");

    document.getElementById("hubMain").innerHTML = '<div class="hub-page">' + html + "</div>";
  },

  centerCard: function (c) {
    var m = c.meta || {};
    var isPlaceholder = m.status === "placeholder";
    var n = Hub.artifactCount(c);
    var sub = [m.city, m.visitDate].filter(Boolean).join(" · ");

    return '<a class="center-card' + (isPlaceholder ? " is-placeholder" : "") + '" ' +
        'href="#/c/' + encodeURIComponent(m.id) + '">' +
      '<div class="center-card-top">' +
        '<h4 class="center-card-name">' + escText(m.name || m.id) + "</h4>" +
        (isPlaceholder
          ? '<span class="center-badge">Placeholder</span>'
          : '<span class="center-badge is-documented">' +
              escText(n + (n === 1 ? " artifact" : " artifacts")) + "</span>") +
      "</div>" +
      (m.location ? '<p class="center-card-role">' + escText(m.location) + "</p>" : "") +
      (sub ? '<p class="center-card-meta">' + escText(sub) + "</p>" : "") +
      (m.summary ? '<p class="center-card-summary">' + escText(m.summary) + "</p>" : "") +
      Hub.tagsHtml(m.tags) +
    "</a>";
  },

  /* --- Center page --------------------------------------------------------- */

  /* Is this section worth linking to? Used to pick a sensible default tab. */
  _hasContent: function (c, field) {
    var r = c.research || {};
    if (field === "overview") {
      // Overview falls back to the About card's sections, so a center with an
      // About card always has an overview.
      var ov = r.overview;
      if (ov && ov.sections && ov.sections.length) return true;
      return !!(c.about && c.about.sections && c.about.sections.length);
    }
    return !!(r[field] && r[field].length);
  },

  renderCenter: function (c, section) {
    var m = c.meta || {};
    var valid = this.SECTIONS.some(function (s) { return s.key === section; });
    if (!valid) {
      // No section given (or a bogus one): open the first tab that has content.
      var first = this.SECTIONS.filter(function (s) { return Hub._hasContent(c, s.field); })[0];
      section = (first || this.SECTIONS[0]).key;
    }

    document.title = m.name + " — User Research Hub";
    this._view("center");
    this.renderCenterBar(c, section);

    var def = this.SECTIONS.filter(function (s) { return s.key === section; })[0];
    var body;
    switch (section) {
      case "overview":      body = this.overviewHtml(c);   break;
      case "mental-models": body = this.mentalModelsHtml(c); break;
      case "personas":      body = this.personasHtml(c);   break;
      case "workflows":     body = this.workflowsHtml(c);  break;
      case "findings":      body = this.findingsHtml(c);   break;
      case "supporting":    body = this.supportingHtml(c); break;
    }

    // mentalModelsHtml returns null when the diagram itself should fill the pane.
    if (body === null) {
      this._show("diagram");
      CenterApp.mount(c);
      return;
    }

    this._show("main");
    document.getElementById("hubMain").innerHTML =
      '<div class="hub-page">' +
        '<h2 class="hub-section-title">' + escText(def.label) + "</h2>" +
        body +
      "</div>";
  },

  renderCenterBar: function (c, section) {
    var m = c.meta || {};
    var geo = m.geo || {};
    var path = [geo.country, geo.region].filter(Boolean).join(" / ");

    var tabs = this.SECTIONS.map(function (s) {
      var on = s.key === section;
      var has = Hub._hasContent(c, s.field);
      return '<a class="hub-tab' + (has ? "" : " is-empty") + '" role="tab" ' +
        'aria-selected="' + (on ? "true" : "false") + '" ' +
        'href="#/c/' + encodeURIComponent(m.id) + "/" + s.key + '">' +
        escText(s.label) + "</a>";
    }).join("");

    document.getElementById("hubBar").innerHTML =
      '<div class="hub-crumbs">' +
        '<a class="hub-back" href="#/">&larr; All centers</a>' +
        (path ? '<span class="hub-crumb-sep">·</span><span class="hub-crumb">' +
          escText(path) + "</span>" : "") +
      "</div>" +
      // The tags sit inside the title row (hub.css pushes them to the right edge)
      // rather than on a line of their own, which keeps the bar one row shorter.
      '<div class="hub-bar-main">' +
        '<h1 class="hub-title">' + escText(m.name || m.id) + "</h1>" +
        '<p class="hub-sub">' +
          escText([m.location, m.visitDate].filter(Boolean).join(" · ")) +
        "</p>" +
        this.tagsHtml(m.tags) +
      "</div>" +
      '<nav class="hub-tabs" role="tablist">' + tabs + "</nav>";
  },

  /* --- Section renderers --------------------------------------------------- */

  overviewHtml: function (c) {
    var r = c.research || {};
    // Prefer research.overview; otherwise reuse the About card's sections, so a
    // center never has to write the same thing twice.
    var sections = (r.overview && r.overview.sections) ||
      (c.about && c.about.sections) || [];
    if (!sections.length) return this.emptyHtml("An overview", "overview");

    var intro = c.meta && c.meta.summary
      ? '<p class="hub-lede">' + escText(c.meta.summary) + "</p>" : "";

    return intro + '<div class="res-grid">' + sections.map(function (s) {
      return '<article class="res-card">' +
        (s.heading ? "<h3>" + escText(s.heading) + "</h3>" : "") +
        (s.text ? "<p>" + escText(s.text) + "</p>" : "") +
        (s.items && s.items.length
          ? "<ul>" + s.items.map(Hub.itemHtml).join("") + "</ul>" : "") +
      "</article>";
    }).join("") + "</div>";
  },

  /* Returns null to mean "show the interactive diagram instead of cards" — that
     is the existing dispatch diagram, which is this center's mental model. */
  mentalModelsHtml: function (c) {
    var list = (c.research && c.research.mentalModels) || [];
    if (list.some(function (mm) { return mm.view === "diagram"; })) return null;
    if (!list.length) return this.emptyHtml("A mental model", "mentalModels");

    return '<div class="res-grid">' + list.map(function (mm) {
      return '<article class="res-card">' +
        "<h3>" + escText(mm.title || "Untitled") + "</h3>" +
        (mm.description ? "<p>" + escText(mm.description) + "</p>" : "") +
      "</article>";
    }).join("") + "</div>";
  },

  personasHtml: function (c) {
    var list = (c.research && c.research.personas) || [];
    if (!list.length) return this.emptyHtml("Personas", "personas");

    return '<div class="res-grid">' + list.map(function (p) {
      return '<article class="res-card persona-card">' +
        '<div class="persona-head">' +
          '<div class="persona-avatar" aria-hidden="true">' +
            escText(String(p.name || "?").charAt(0)) + "</div>" +
          "<div><h3>" + escText(p.name || "Unnamed") + "</h3>" +
          (p.role ? '<p class="persona-role">' + escText(p.role) + "</p>" : "") +
          (p.shift ? '<p class="persona-shift">' + escText(p.shift) + "</p>" : "") +
          "</div>" +
        "</div>" +
        (p.quote ? '<blockquote class="persona-quote">' + escText(p.quote) + "</blockquote>" : "") +
        Hub.listBlock("Goals", p.goals) +
        Hub.listBlock("Frustrations", p.frustrations) +
        (p.tools && p.tools.length
          ? '<div class="res-block"><h4>Tools</h4>' + Hub.chipsHtml(p.tools) + "</div>" : "") +
      "</article>";
    }).join("") + "</div>";
  },

  workflowsHtml: function (c) {
    var list = (c.research && c.research.workflows) || [];
    if (!list.length) return this.emptyHtml("Workflows", "workflows");

    return '<div class="res-grid">' + list.map(function (w) {
      return '<article class="res-card">' +
        "<h3>" + escText(w.title || "Untitled workflow") + "</h3>" +
        (w.description ? "<p>" + escText(w.description) + "</p>" : "") +
        (w.steps && w.steps.length
          ? '<ol class="res-steps">' + w.steps.map(function (s) {
              return "<li>" + escText(typeof s === "string" ? s : (s.text || "")) + "</li>";
            }).join("") + "</ol>"
          : "") +
      "</article>";
    }).join("") + "</div>";
  },

  findingsHtml: function (c) {
    var list = (c.research && c.research.findings) || [];
    if (!list.length) return this.emptyHtml("Key findings", "findings");

    return '<div class="res-grid">' + list.map(function (f) {
      var impact = f.impact || "medium";
      return '<article class="res-card finding-card" data-impact="' + escText(impact) + '">' +
        '<div class="finding-head">' +
          "<h3>" + escText(f.title || "Untitled finding") + "</h3>" +
          '<span class="impact-badge">' + escText(impact) + " impact</span>" +
        "</div>" +
        (f.detail ? "<p>" + escText(f.detail) + "</p>" : "") +
        Hub.listBlock("Evidence", f.evidence) +
      "</article>";
    }).join("") + "</div>";
  },

  supportingHtml: function (c) {
    var list = (c.research && c.research.supporting) || [];
    if (!list.length) return this.emptyHtml("Supporting research", "supporting");

    return '<div class="res-grid">' + list.map(function (s) {
      return '<article class="res-card">' +
        '<div class="finding-head">' +
          "<h3>" + escText(s.title || "Untitled") + "</h3>" +
          (s.kind ? '<span class="kind-badge">' + escText(s.kind) + "</span>" : "") +
        "</div>" +
        (s.description ? "<p>" + escText(s.description) + "</p>" : "") +
      "</article>";
    }).join("") + "</div>";
  },
};

/* Boot. In the encrypted bundle this whole file is evaluated by gate.js AFTER the
   document has loaded, so check readyState rather than assuming an event is
   still coming. */
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", function () { Hub.start(); });
} else {
  Hub.start();
}
