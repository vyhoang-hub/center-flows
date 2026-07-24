/* =============================================================================
 * diagram.js — draws connectors, nodes, and pills from window.DISPATCH_CENTER
 * =============================================================================
 * Plain browser JS, no build step, no modules. Everything is positioned in the
 * Figma coordinate space (2002 x 1303) and the whole stage is scaled to fit.
 * ========================================================================== */

var STAGE_W = 2210;
var STAGE_H = 1303;

/* Lucide icons (https://lucide.dev), inlined as SVG path data so they travel
   inside the single-file bundle and stay crisp at any zoom. Stroke uses
   currentColor, so each icon inherits the node/tag text color. Add a new icon
   by pasting its inner paths here under a short name. */
var LUCIDE = {
  shield:     '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
  car:        '<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/>',
  flame:      '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
  ambulance:  '<path d="M10 10H6"/><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.28a1 1 0 0 0-.684-.948l-1.923-.641a1 1 0 0 1-.578-.502l-1.539-3.076A1 1 0 0 0 16.382 8H14"/><path d="M8 8v4"/><path d="M9 18h6"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
  "map-pin":  '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
  "building": '<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>',
  "bar-chart":'<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
  radio:      '<path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"/><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"/><circle cx="12" cy="12" r="2"/><path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"/><path d="M19.1 4.9C23 8.8 23 15.1 19.1 19"/>',
  phone:      '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
  "message":  '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>'
};

/* Return an inline <svg> string for a Lucide icon name, or "" if unknown.
   Falls back gracefully so an emoji or stray name won't break rendering. */
function iconSvg(name, size) {
  if (!name || !LUCIDE[name]) return "";
  size = size || 24;
  return '<svg class="lucide" viewBox="0 0 24 24" width="' + size + '" height="' + size +
    '" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" ' +
    'stroke-linejoin="round" aria-hidden="true">' + LUCIDE[name] + "</svg>";
}

var Diagram = {
  data: null,
  onNodeClick: null,
  _selectedEl: null,   // the currently selected node element (for the highlight)

  /* Mark a node element as selected (adds the outline ring). Pass null to clear.
     Clicking a node calls this; closing the detail card clears it. */
  select: function (el) {
    if (this._selectedEl) this._selectedEl.classList.remove("selected");
    this._selectedEl = el || null;
    if (this._selectedEl) this._selectedEl.classList.add("selected");
  },

  // Pan/zoom state. scale = zoom factor; tx/ty = pan offset in screen px.
  scale: 1,
  tx: 0,
  ty: 0,
  minScale: 0.1,
  maxScale: 4,

  render: function (data, onNodeClick) {
    this.data = data;
    this.onNodeClick = onNodeClick;

    var stage = document.getElementById("stage");
    stage.style.width = STAGE_W + "px";
    stage.style.height = STAGE_H + "px";
    stage.innerHTML = "";

    // Draw order = stacking order. Regions (e.g. the "inside the center" blob)
    // sit at the very back, then zones, then the two ways of drawing lines
    // (exported Figma SVGs and data-driven edges), then nodes and pills on top.
    this._renderRegions(stage, data.regions || []);
    this._renderZones(stage, data.zones || []);
    this._renderConnectors(stage, data.connectors || []);
    this._renderEdges(stage, data.edges || [], data.nodes || []);
    this._renderNodes(stage, data.nodes || []);
    this._renderPills(stage, data.pills || []);
    this._renderAnnotations(stage, data.annotations || []);

    this._initInteractions();
    this.fit();
    window.addEventListener("resize", function () { Diagram.fit(); });

    // In an embedded iframe (e.g. SharePoint) the canvas often has 0 size at
    // first render, so the initial fit() can't compute a real scale. Re-fit
    // once the element actually gets a size, and again after full load, so the
    // diagram doesn't end up scaled/positioned off-screen.
    var wrap = document.getElementById("canvasWrap");
    if (wrap && typeof ResizeObserver !== "undefined") {
      var ro = new ResizeObserver(function () {
        if (wrap.clientWidth > 0 && wrap.clientHeight > 0) Diagram.fit();
      });
      ro.observe(wrap);
    }
    window.addEventListener("load", function () { Diagram.fit(); });
  },

  /* Write the current scale + pan to the stage as a single transform. */
  _apply: function () {
    var stage = document.getElementById("stage");
    stage.style.transformOrigin = "0 0";
    stage.style.transform =
      "translate(" + this.tx + "px," + this.ty + "px) scale(" + this.scale + ")";
  },

  /* Fit the whole diagram inside the canvas and center it. This is the default
     view and the "Fit" button. */
  fit: function () {
    var wrap = document.getElementById("canvasWrap");
    if (!wrap) return;
    var cw = wrap.clientWidth, ch = wrap.clientHeight;
    // Canvas not sized yet (common in a freshly-loaded iframe). Bail without
    // touching the transform — the ResizeObserver will call fit() again once
    // the element has real dimensions, avoiding an off-screen placement.
    var pad = 24;
    if (cw <= pad * 2 || ch <= pad * 2) return;
    var s = Math.min((cw - pad * 2) / STAGE_W, (ch - pad * 2) / STAGE_H);
    if (!isFinite(s) || s <= 0) return;
    this.scale = Math.max(this.minScale, Math.min(this.maxScale, s));
    // Center the scaled stage in the viewport.
    this.tx = (cw - STAGE_W * this.scale) / 2;
    this.ty = (ch - STAGE_H * this.scale) / 2;
    this._apply();
  },

  /* Zoom by a factor, keeping the point (cx,cy) — in canvas screen px —
     fixed under the cursor. Used by the wheel and the +/- buttons. */
  zoomAt: function (factor, cx, cy) {
    var wrap = document.getElementById("canvasWrap");
    if (cx == null) { cx = wrap.clientWidth / 2; cy = wrap.clientHeight / 2; }
    var newScale = Math.max(this.minScale, Math.min(this.maxScale, this.scale * factor));
    if (newScale === this.scale) return;
    // Keep the world point under the cursor stationary.
    this.tx = cx - (cx - this.tx) * (newScale / this.scale);
    this.ty = cy - (cy - this.ty) * (newScale / this.scale);
    this.scale = newScale;
    this._apply();
  },

  /* Wire up wheel-zoom and drag-to-pan on the canvas. */
  _initInteractions: function () {
    var wrap = document.getElementById("canvasWrap");
    if (!wrap || wrap._interactive) return;   // guard against double-binding
    wrap._interactive = true;

    // Wheel = zoom toward the cursor.
    wrap.addEventListener("wheel", function (e) {
      e.preventDefault();
      var rect = wrap.getBoundingClientRect();
      var cx = e.clientX - rect.left, cy = e.clientY - rect.top;
      var factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
      Diagram.zoomAt(factor, cx, cy);
    }, { passive: false });

    // Drag empty canvas = pan. Dragging starts panning only when the press
    // didn't land on a node/button (so clicking a node still opens its panel).
    var panning = false, sx = 0, sy = 0, startTx = 0, startTy = 0, moved = false;
    wrap.addEventListener("pointerdown", function (e) {
      if (e.target.closest(".node, .ctrl-btn, .layers-reopen")) return;
      panning = true; moved = false;
      sx = e.clientX; sy = e.clientY; startTx = Diagram.tx; startTy = Diagram.ty;
      wrap.classList.add("grabbing");
      wrap.setPointerCapture(e.pointerId);
    });
    wrap.addEventListener("pointermove", function (e) {
      if (!panning) return;
      var dx = e.clientX - sx, dy = e.clientY - sy;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) moved = true;
      Diagram.tx = startTx + dx; Diagram.ty = startTy + dy;
      Diagram._apply();
    });
    function endPan(e) {
      if (!panning) return;
      panning = false;
      wrap.classList.remove("grabbing");
      try { wrap.releasePointerCapture(e.pointerId); } catch (_) {}
    }
    wrap.addEventListener("pointerup", endPan);
    wrap.addEventListener("pointercancel", endPan);
  },

  /* Regions — large soft background shapes that group the whole workflow
     (e.g. the "inside the center" blob). Each is an absolutely-positioned SVG
     drawn behind everything, with an optional label chip.
       x/y/w/h : top-left + size in stage units
       asset   : an SVG in /assets (or inlined via ASSET_MAP), drawn to fill
       fill    : background color if no asset is given
       label / labelX / labelY : optional caption placed at absolute stage coords */
  _renderRegions: function (stage, regions) {
    regions.forEach(function (r) {
      var el = document.createElement("div");
      el.className = "region";
      el.dataset.layers = (r.layers || []).join(",");
      el.style.left = r.x + "px";
      el.style.top = r.y + "px";
      el.style.width = r.w + "px";
      el.style.height = r.h + "px";
      if (r.asset) {
        var img = document.createElement("img");
        img.src = assetSrc(r.asset);
        img.alt = "";
        el.appendChild(img);
      } else if (r.fill) {
        el.style.background = r.fill;
      }
      stage.appendChild(el);

      if (r.label) {
        var tag = document.createElement("span");
        tag.className = "region-label";
        tag.textContent = r.label;
        tag.style.left = (r.labelX != null ? r.labelX : r.x + 24) + "px";
        tag.style.top = (r.labelY != null ? r.labelY : r.y + 20) + "px";
        tag.dataset.layers = (r.layers || []).join(",");
        stage.appendChild(tag);
      }
    });
  },

  /* Annotations — free italic narrative notes placed at absolute stage coords
     (the flow story: "call -> incident...", etc.). Pure data, no SVG. */
  _renderAnnotations: function (stage, annotations) {
    annotations.forEach(function (a) {
      var el = document.createElement("div");
      el.className = "annotation-note";
      el.dataset.layers = (a.layers || ["annotations"]).join(",");
      el.style.left = a.x + "px";
      el.style.top = a.y + "px";
      if (a.w) el.style.width = a.w + "px";
      el.textContent = a.text;
      stage.appendChild(el);
    });
  },

  /* Zones — big grouping outlines (e.g. CALL / POLICE / FIRE) drawn from data,
     no SVG export needed. A dashed rounded rectangle with a small label chip.
     x/y is the TOP-LEFT of the zone in stage units. */
  _renderZones: function (stage, zones) {
    zones.forEach(function (z) {
      var el = document.createElement("div");
      el.className = "zone";
      el.dataset.layers = (z.layers || []).join(",");
      el.dataset.color = z.color || "neutral";
      el.style.left = z.x + "px";
      el.style.top = z.y + "px";
      el.style.width = z.w + "px";
      el.style.height = z.h + "px";
      if (z.label) {
        var tag = document.createElement("span");
        tag.className = "zone-label";
        tag.textContent = z.subtitle ? z.label + " " + z.subtitle : z.label;
        el.appendChild(tag);
      }
      stage.appendChild(el);
    });
  },

  /* Edges — curved lines drawn between two nodes referenced by id, so a new
     center can be authored as pure data with NO exported SVGs. Each edge is one
     absolutely-positioned <svg> spanning the diagram; the path bends by `curve`
     units perpendicular to the line, and an arrowhead is drawn at the `to` end.
       from / to : node ids            style : "solid" | "dashed"
       color     : comm | flow | neutral   curve : bend amount (+/-), 0 = straight
       arrow     : true (default, arrow at `to`) | false (none)
                 | "both" (arrowheads on BOTH ends) | "start" (at `from` only) */
  _renderEdges: function (stage, edges, nodes) {
    if (!edges.length) return;
    var byId = {};
    nodes.forEach(function (n) { byId[n.id] = n; });

    // Center of a node in stage units (x/y are top-left).
    function center(n) { return { x: n.x + (n.w || 0) / 2, y: n.y + (n.h || 0) / 2 }; }

    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "edge-layer");
    svg.setAttribute("width", STAGE_W);
    svg.setAttribute("height", STAGE_H);
    svg.setAttribute("viewBox", "0 0 " + STAGE_W + " " + STAGE_H);

    edges.forEach(function (e, i) {
      var a = byId[e.from], b = byId[e.to];
      if (!a || !b) {
        // Most common authoring mistake: a mistyped node id. Skip it safely.
        if (window.console) console.warn("edge skipped — unknown node id:", e.from, "->", e.to);
        return;
      }
      var p1 = center(a), p2 = center(b);
      var curve = e.curve || 0;
      // Control point: midpoint pushed perpendicular to the p1->p2 line.
      var mx = (p1.x + p2.x) / 2, my = (p1.y + p2.y) / 2;
      var dx = p2.x - p1.x, dy = p2.y - p1.y;
      var len = Math.sqrt(dx * dx + dy * dy) || 1;
      var cx = mx + (-dy / len) * curve;
      var cy = my + (dx / len) * curve;

      var color = e.color || "flow";
      var stroke = color === "comm" ? "var(--pink)"
                 : color === "neutral" ? "var(--flow)"
                 : "var(--flow)";

      var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", "M " + p1.x + " " + p1.y + " Q " + cx + " " + cy + " " + p2.x + " " + p2.y);
      path.setAttribute("fill", "none");
      path.setAttribute("stroke", stroke);
      path.setAttribute("stroke-width", "2");
      path.setAttribute("stroke-linecap", "round");
      if (e.style === "dashed") path.setAttribute("stroke-dasharray", "6 6");
      var g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.setAttribute("class", "edge");
      g.dataset.layers = (e.layers || []).join(",");
      g.appendChild(path);

      // Draw a filled triangular arrowhead pointing toward `end`, along the
      // given tangent angle, pulled back by the target node's radius so it sits
      // at the node edge instead of hiding under it.
      function addHead(end, ang, nodeW) {
        var size = 9, r = (nodeW || 0) / 2;
        var tip = { x: end.x - Math.cos(ang) * r, y: end.y - Math.sin(ang) * r };
        var left = { x: tip.x - size * Math.cos(ang - 0.5), y: tip.y - size * Math.sin(ang - 0.5) };
        var right = { x: tip.x - size * Math.cos(ang + 0.5), y: tip.y - size * Math.sin(ang + 0.5) };
        var head = document.createElementNS("http://www.w3.org/2000/svg", "path");
        head.setAttribute("d", "M " + tip.x + " " + tip.y + " L " + left.x + " " + left.y + " L " + right.x + " " + right.y + " Z");
        head.setAttribute("fill", stroke);
        g.appendChild(head);
      }

      // Arrowheads. Tangent at the `to` end points control->end; at the `from`
      // end it points control->start. "both" draws one on each end.
      var arrow = e.arrow === undefined ? true : e.arrow;
      if (arrow === true || arrow === "both") {
        addHead(p2, Math.atan2(p2.y - cy, p2.x - cx), b.w); // at `to`
      }
      if (arrow === "start" || arrow === "both") {
        addHead(p1, Math.atan2(p1.y - cy, p1.x - cx), a.w); // at `from`
      }
      svg.appendChild(g);
    });

    stage.appendChild(svg);
  },

  _renderConnectors: function (stage, connectors) {
    connectors.forEach(function (c) {
      var el = document.createElement("div");
      el.className = "connector";
      el.dataset.layers = (c.layers || []).join(",");
      el.style.left = c.x + "px";
      el.style.top = c.y + "px";
      el.style.width = c.w + "px";
      el.style.height = c.h + "px";
      var img = document.createElement("img");
      img.src = assetSrc(c.asset);
      img.alt = "";
      el.appendChild(img);
      stage.appendChild(el);
    });
  },

  _renderNodes: function (stage, nodes) {
    nodes.forEach(function (n) {
      var el = document.createElement("button");
      el.className = "node " + n.type;
      el.dataset.cat = n.category || "neutral";
      el.dataset.layers = (n.layers || []).join(",");
      el.style.left = n.x + "px";
      el.style.top = n.y + "px";
      el.style.width = n.w + "px";
      el.style.height = n.h + "px";
      el.setAttribute("aria-label", n.label);
      // Icon: an exported SVG asset (n.iconAsset, e.g. a Phosphor icon from
      // Figma) takes priority; otherwise a Lucide name (n.icon) is inlined.
      var icHtml = "";
      if (n.iconAsset) {
        icHtml = '<span class="ic"><img class="ic-img" src="' +
          assetSrc(n.iconAsset) + '" alt=""></span>';
      } else if (n.icon) {
        var ic = iconSvg(n.icon, 34);
        if (ic) icHtml = '<span class="ic">' + ic + "</span>";
      }
      // Optional soft glow shape behind the node (resource blobs from Figma).
      var glowHtml = n.glow
        ? '<img class="node-glow" src="' + assetSrc(n.glow) + '" alt="">'
        : "";
      el.innerHTML = glowHtml + icHtml + '<span class="lbl">' + esc(n.label) + "</span>";
      el.addEventListener("click", function () {
        if (Diagram.onNodeClick) Diagram.onNodeClick(n, el);
      });
      stage.appendChild(el);
    });
  },

  _renderPills: function (stage, pills) {
    pills.forEach(function (p) {
      var el = document.createElement("div");
      el.className = "pill " + p.kind;
      el.dataset.layers = (p.layers || []).join(",");
      el.style.left = p.x + "px";
      el.style.top = p.y + "px";
      if (p.w) el.style.minWidth = p.w + "px";
      if (p.h) el.style.height = p.h + "px";
      // Optional leading icon: an exported SVG asset (p.iconAsset, e.g. a
      // Phosphor icon from Figma) takes priority, else a Lucide name (p.icon).
      var icHtml = "";
      if (p.iconAsset) {
        icHtml = '<img class="pill-ic-img" src="' + assetSrc(p.iconAsset) + '" alt="">';
      } else if (p.icon) {
        var ic = iconSvg(p.icon, 13);
        if (ic) icHtml = '<span class="pill-ic">' + ic + "</span>";
      }
      if (icHtml) {
        el.classList.add("has-icon");
        el.innerHTML = icHtml + "<span>" + esc(p.text) + "</span>";
      } else {
        el.textContent = p.text;
      }
      stage.appendChild(el);
    });
  },
};

/* Resolve a connector asset to an <img> src.
   - Normal (multi-file) use: point at the file in /assets, exactly as before.
   - Bundled single-file build: build.sh injects window.ASSET_MAP, a
     { hash: "data:image/svg+xml;..." } lookup, so the SVGs travel inside the
     one HTML file and no separate /assets requests are made. */
function assetSrc(hash) {
  if (window.ASSET_MAP && window.ASSET_MAP[hash]) return window.ASSET_MAP[hash];
  return "assets/" + hash + ".svg";
}

/* Escape text before injecting as HTML. */
function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
