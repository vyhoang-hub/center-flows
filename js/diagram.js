/* =============================================================================
 * diagram.js — draws connectors, nodes, and pills from window.DISPATCH_CENTER
 * =============================================================================
 * Plain browser JS, no build step, no modules. Everything is positioned in the
 * Figma coordinate space (2002 x 1303) and the whole stage is scaled to fit.
 * ========================================================================== */

var STAGE_W = 2002;
var STAGE_H = 1303;

var Diagram = {
  data: null,
  onNodeClick: null,

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

    // Draw order = stacking order. Zones sit at the very back, then the two
    // ways of drawing lines (exported Figma SVGs and data-driven edges), then
    // the nodes and pills on top.
    this._renderZones(stage, data.zones || []);
    this._renderConnectors(stage, data.connectors || []);
    this._renderEdges(stage, data.edges || [], data.nodes || []);
    this._renderNodes(stage, data.nodes || []);
    this._renderPills(stage, data.pills || []);

    this._initInteractions();
    this.fit();
    window.addEventListener("resize", function () { Diagram.fit(); });
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
    var pad = 24;
    var sx = (wrap.clientWidth - pad * 2) / STAGE_W;
    var sy = (wrap.clientHeight - pad * 2) / STAGE_H;
    var s = Math.min(sx, sy);
    if (!isFinite(s) || s <= 0) s = 1;
    this.scale = Math.max(this.minScale, Math.min(this.maxScale, s));
    // Center the scaled stage in the viewport.
    this.tx = (wrap.clientWidth - STAGE_W * this.scale) / 2;
    this.ty = (wrap.clientHeight - STAGE_H * this.scale) / 2;
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
       arrow     : true (default) | false */
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

      // Arrowhead at the `to` end, aimed along the tangent (control -> end).
      if (e.arrow !== false) {
        var ang = Math.atan2(p2.y - cy, p2.x - cx);
        var size = 9;
        var tip = p2, r = (b.w || 0) / 2;
        // Pull the tip back to the node's edge so it doesn't hide under the node.
        var back = { x: p2.x - Math.cos(ang) * r, y: p2.y - Math.sin(ang) * r };
        tip = back;
        var left = { x: tip.x - size * Math.cos(ang - 0.5), y: tip.y - size * Math.sin(ang - 0.5) };
        var right = { x: tip.x - size * Math.cos(ang + 0.5), y: tip.y - size * Math.sin(ang + 0.5) };
        var head = document.createElementNS("http://www.w3.org/2000/svg", "path");
        head.setAttribute("d", "M " + tip.x + " " + tip.y + " L " + left.x + " " + left.y + " L " + right.x + " " + right.y + " Z");
        head.setAttribute("fill", stroke);
        g.appendChild(head);
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
      el.innerHTML =
        (n.icon ? '<span class="ic">' + n.icon + "</span>" : "") +
        '<span class="lbl">' + esc(n.label) + "</span>";
      el.addEventListener("click", function () {
        if (Diagram.onNodeClick) Diagram.onNodeClick(n);
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
      el.textContent = p.text;
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
