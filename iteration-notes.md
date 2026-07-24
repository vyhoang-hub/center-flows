# Iteration Notes

> Put the changes you want made below. When you say **"check iteration notes"**, I'll read this file and make the changes. I'll ask before executing if anything is unclear.

---

## To Do

<!-- Add changes here. Example:
- [ ] Change the header background color to dark blue
- [ ] Fix the alignment of the cards on the home page
-->

- The telephone line connecting the 911 to call department is not right. Please review the the Figma and fix that.
- The communication line from supervisor to police is missing.
- The placement of the department names are slight off center.
- (1-3 call receiver) needs to be centered in that container

Please ask questions if you have any.

---

## Done

### Round 12 — Modern floating layout + real icons
- [x] **Detail card fades in (fade-in-fwd), floats, no longer sidebar.** Replaced the slide-in docked sidebar with a floating rounded card that fades in using the exact `fade-in-fwd` keyframe supplied. It sits left of the layers card so the legend stays visible. _(css/app.css `@keyframes fade-in-fwd`, `.detail`; js/panels.js)_
- [x] **Selected-shape indicator.** Clicking a node now rings it in its category color (box-shadow ring for circles/boxes; drop-shadow that follows the clip-path for octagons) and lifts it slightly. The ring clears when the card closes (× / Escape / re-click). _(js/diagram.js `Diagram.select`; js/app.js wiring; css/app.css `.node.selected`)_
- [x] **Floating header + panels (modern look).** Canvas is now full-bleed; the header, layers panel, zoom toolbar, staff card and detail card all float over it as rounded cards with shadows instead of stretching edge-to-edge. _(css/app.css `.app`, `.app-header`, `.app-body`, `.canvas-wrap`, `.layer-panel`)_
- [x] **Real icons — Lucide (inline SVG).** Swapped every emoji for Lucide icons, inlined as SVG so they stay self-contained in the bundle and crisp at any zoom: shield (patrol), car (patrol vehicle), flame (fire), ambulance (EMS); map-pin / building / bar-chart for the header tags. New `LUCIDE` map + `iconSvg()` helper; data uses icon *names*. _(js/diagram.js, js/app.js, data/norcomm.js, css/app.css)_
- [x] Rebuilt `dist/index.html` (all inlined, 27 SVGs, zero external refs).

### Round 11 — Diagram-UX polish (while waiting on IT for private hosting)
- [x] **No more horizontal scroll.** Added `overflow: hidden` to `html, body` and `.app-body` so nothing (including the detail panel) can push out a page scrollbar — content is clipped to the app frame. _(css/app.css)_
- [x] **Legend stays visible with detail open + click-to-toggle.** The detail panel now docks to the LEFT of the layers column (`right: var(--panel-w)`), so the Layers list is never covered. Clicking a node opens its detail; clicking the **same** node again closes it (like hitting ×). _(css/app.css `.detail`; js/panels.js new `Detail.toggle`/`currentId`; js/app.js wiring)_
- [x] **Staff distribution floats bottom-left of the canvas** with generous padding, moved out of the right-hand panel; the zoom toolbar moved to the bottom-**right** so they don't collide. _(index.html, css/app.css `.staff-card`/`.canvas-controls`)_
- [x] **Header pills are prominent + color-coded.** Tags are now bigger, bold, with an icon and a per-tone tint: location=blue, agency=green, size=orange. Data model accepts `{label, tone, icon}` (still back-compatible with plain strings). _(data/norcomm.js meta.tags; js/app.js; css/app.css `.app-header .tag`)_
- [x] **Fixed the blurry canvas.** Removed `will-change: transform` on `.stage` — it pinned the whole diagram to a GPU layer rasterized at 100% and bitmap-scaled down (the blur). Without it the browser re-rasterizes text/shapes crisply at the current zoom. _(css/app.css `.stage`)_
- [x] Rebuilt `dist/index.html` (all changes inlined, 27 SVGs, zero external refs).

### Round 10 — Root cause found: SharePoint sandbox blocks JS → moving to GitHub Pages
- [x] **Mystery solved.** The diagram was NEVER broken. Direct-open of the file in SharePoint renders the full diagram + diagnostics (`data: images: ALLOWED`, 60 stage children). But SharePoint's **file preview and the Share→"Copy embed code" both use `_layouts/15/embed.aspx`, a sandbox that turns JavaScript OFF** — so the shell shows but the diagram (drawn by JS) stays blank. The File viewer web part does the same. That's a Microsoft security design, not a code bug — which is why none of Rounds 6–9's code fixes changed the embed outcome.
- [x] **Decision (2026-07-22):** owner accepts public hosting. SharePoint can't run the app's JS in an embed, so host on **GitHub Pages** (serves real HTML, JS runs) and embed that public URL. ⚠️ Pages is publicly reachable by URL even from a private repo — accepted trade-off; revisit if content is reclassified.
- [x] **Re-enabled** `.github/workflows/deploy-pages.yml` (push trigger on `main`) with an updated deliberate-choice notice.
- [x] **Removed the temporary diagnostics** (`js/diag.js`, build stamp) now that the cause is known; rebuilt a clean `dist/index.html`.
- [ ] **ACTION FOR USER:** one-time — turn Pages on (Settings → Pages → Source: GitHub Actions), then embed the published URL in SharePoint via the Embed web part.

### Round 9 — Fix diagram off-screen in SharePoint iframe
- [x] **Symptom:** in SharePoint everything rendered (legend + controls) EXCEPT the diagram; locally it was fine. So JS runs in the iframe — not a script-block issue.
- [x] **Cause:** `fit()` ran at first render when the iframe canvas still had **0 width/height**. The old math (`(0-48)/2002` → negative → guard reset scale to 1, then `tx=-1001, ty=-651`) pushed the stage ~1000px off-screen. The panel (separate grid column) and controls (pinned to canvas corner) stayed visible, so only the diagram looked missing.
- [x] **Fix:** `fit()` now **bails without touching the transform** if the canvas isn't sized yet; a **ResizeObserver** re-fits once the element gets real dimensions, plus a `window load` re-fit. Robust to iframe timing. _(js/diagram.js)_

### Round 8 — Fix blank bundle (unclosed HTML comment)
- [x] **Bug:** after Round 7's bundler change, `dist/index.html` rendered blank (diagram + legend gone). Cause: the awk that extracts the `<body>` stopped at the first line matching `<script` — but `index.html`'s load-order **comment** contains the prose "`<script>` tags", so extraction stopped *mid-comment*, emitting an **unclosed `<!-- -->`** that swallowed all the inlined JS. Nothing executed → blank page.
- [x] **Fix:** anchored the stop pattern to `^[[:space:]]*<script` (a real tag at line start), so prose mentions of "script" inside comments are ignored. Verified: comments balanced (9/9), all critical JS lives after `<script>` opens, zero external refs. _(build.sh)_

### Round 7 — Clearer, labeled controls (+ bundler bug fix)
- [x] **Found why the Round 6 buttons weren't visible:** `build.sh` had the page `<body>` **hardcoded as a stale copy**, so the bundle never included the zoom/collapse buttons (wheel-zoom + drag worked because those are in the JS). Fixed the bundler to **extract the body straight from `index.html`** via awk, so it can never drift again.
- [x] **Turned the icon-only controls into a labeled toolbar** — "Zoom in", "Zoom out", "Fit", "Fullscreen" now show icon **and** text, and are bigger. _(index.html, css/app.css `.ctrl-btn`/`.ctrl-lbl`)_
- [x] **Made the panel toggle obvious** — the subtle × is now a labeled **"Hide ›"** button in the panel header, and the reopen tab is a prominent slate **"☰ Show Layers"** button. _(index.html, css/app.css)_
- [x] Rebuilt `dist/index.html` — labels confirmed present, self-contained, single `.app` container.

### Round 6 — Readability in the SharePoint embed (zoom / pan / collapse / fullscreen)
Problem (from the uploaded screenshot): embedded in SharePoint, the whole diagram was scaled down to fit the panel, so text was unreadable and there was a horizontal scrollbar.
- [x] **Zoom + pan** — mouse-wheel zoom toward the cursor, drag-to-pan the canvas, and floating **+ / − / Fit** buttons (bottom-left). Clicking a node still opens its detail panel (drag only pans on empty canvas). _(js/diagram.js: new scale/tx/ty transform model replacing the old fit-only scaling; js/app.js wiring; css/app.css `.canvas-controls`)_
- [x] **Fullscreen button** (⛶) — the biggest readability win inside a small embed; expands the app to the whole screen and refits. _(js/app.js `toggleFullscreen`, `fullscreenchange` refit)_
- [x] **Collapsible Layers panel** — an × in the panel header hides it so the diagram spans full width; a small "☰ Layers" tab (top-right) brings it back. _(index.html, css/app.css `body.panel-collapsed`)_
- [x] **Bigger diagram / expand all the way** — replaced the "cap at 100%, shrink-to-fit" logic with fit-to-viewport + free zoom (up to 4×), so it can be enlarged as much as needed rather than being locked small.
- [x] Rebuilt `dist/index.html` (all features confirmed inlined, zero external refs).

> 📌 To publish: open `dist/index.html` locally to confirm it looks right, then re-upload it over the old file in the SharePoint library.

### Round 5 — Ready for SharePoint embedding
- [x] **Confirmed the content is internal/sensitive** → must not go on the public internet. **Disabled the GitHub Pages auto-deploy** (`.github/workflows/deploy-pages.yml`): commented out the `push` trigger so nothing publishes automatically (manual-only, gated behind a warning), because Pages is publicly reachable by URL even from a private repo.
- [x] **Diagnosed the blank/unstyled SharePoint page:** a document library can't serve a multi-file app — relative links to css/js/assets break.
- [x] **Added `build.sh`** — bundles CSS + data + all JS + every SVG (base64) into one self-contained `dist/index.html` with zero external references. Pure bash (no Node/Python). `diagram.js` gained `assetSrc()` which uses the inlined `window.ASSET_MAP` when present, else falls back to `assets/<hash>.svg` (double-click workflow unchanged).
- [x] **✅ CONFIRMED WORKING:** the single-file `dist/index.html` renders correctly when uploaded to SharePoint and embedded via the Embed web part.
- [x] **Updated README**: publishing section now leads with the proven single-file path + step-by-step SharePoint embed; "add another center" now includes the `bash build.sh data/<center>.js` publish step; Azure Static Web Apps documented as the fallback if a tenant ever blocks inline JS.

### Round 4 — Real Figma sync + replicable components
Figma Dev Mode MCP is now connected, so the design was read directly (node `1:8`).
- [x] **Downloaded the 11 authentic connector SVGs** that earlier rounds couldn't access, straight from the Dev Mode server. All 36 Figma vectors now exist locally.
- [x] **Rebuilt `data/norcomm.js` connectors** with the real geometry (top-left x/y + true viewBox w/h), and re-sorted every line into its correct layer by its actual Figma stroke color: tan `#C7C0B8` → departments, pink `#B866A3` → communications, gray `#929292` → flow. Added two lines that were missing entirely (`789ea523` data→police-CAD flow, `6e62f17f` supervisor→dispatch comm).
- [x] **Removed the three fabricated placeholder SVGs** (`sup-police-comm`, `sup-fire-comm`, `arrow-to-cad-fire`) from Rounds 1-2 — they were hand-drawn guesses and are now replaced by authentic vectors.
- [x] **Added a procedural edge + zone renderer** (`js/diagram.js`) so new site visits can draw lines and grouping outlines from pure data (`edges: [{from, to, curve, style, color}]`, `zones: [{x,y,w,h,label}]`) with **no Figma export required**. Previously the engine only drew pre-exported SVGs, so `_template.js`'s `edges`/`zones` were silently ignored — that gap is now closed. CSS (`css/app.css`) and layer-toggle visibility (`js/app.js`) updated to match.
- [x] **Rewrote `data/_template.js`** into a complete, runnable example using the procedural `edges`/`zones` path, and **fixed the coordinate docs** (x/y is top-left, not center) in the template and README.

### Round 1 — NORCOMM Dispatch Workflow
- [x] **Header tags** changed to: Location: Bellevue, WA / Consolidated Agency (call taking + police dispatch + fire dispatch) / US Medium-size center. _(data/norcomm.js)_
- [x] **Supervisor → Police** communication line added (pink dashed, arrowhead toward Police). New asset `assets/sup-police-comm.svg`.
- [x] **Supervisor → Fire** communication line — ⚠️ NOTE: no existing Sup→Fire line was in the data, so I **created** a new pink dashed line with the Fire-pointing arrowhead (per your "add arrowhead to existing" answer, but there was nothing to add to). New asset `assets/sup-fire-comm.svg`. Please verify this is the connection you meant.
- [x] **Arrowhead into CAD** ('digital command & control software') from fire/ems resources added. New asset `assets/arrow-to-cad-fire.svg`.

> ⚠️ Positions for the three new SVG elements are best-effort guesses in Figma coordinate space. Open index.html, then tell me how to nudge each (e.g. "move Sup→Police line left 40px, down 10px") and I'll adjust in the next round.

### Round 2 — arrowhead style correction
- [x] Rebuilt the three new SVGs to match the **authentic Figma export style**: connector + arrowhead as a single/paired *filled* path (no `stroke-width` dashed lines, no chunky triangle). Slender filled triangle arrowhead, colors `#B866A3` (comm) / `#929292` (flow) — matching existing assets like `967d…svg` and `5785…svg`.

> 🚧 BLOCKER: The Figma link (node 1-8) is private — WebFetch returns 403 and no Figma MCP server is connected, so I could NOT read the actual design. I matched the arrowhead style to the existing exported assets instead. To implement the design **exactly**, either:
>   1. Connect the Figma Dev Mode MCP server (Figma desktop → Preferences → enable "Dev Mode MCP Server"), or
>   2. Export the frame as SVG/PNG (or screenshot) into the project and I'll match it.
> Also note: existing pink comm lines are *dashed*; my new Sup→Police / Sup→Fire lines are currently *solid*. Say the word and I'll make them dashed to match.

### Round 3 — Figma MCP setup (in progress)
- ✅ Registered Figma Dev Mode MCP server with Claude Code: `figma-dev-mode` → `http://127.0.0.1:3845/sse`. Health check: Connected.
- ⛔ **Action needed: restart Claude Code.** MCP tools load at session startup; the server was added mid-session so its tools aren't live yet.
- **Next session TODO:** Use `mcp__figma-dev-mode__get_code` / `get_image` / `get_metadata` on node `1-8` of file 6obaodufXt4EpNSinEHvJX to pull exact geometry + arrowhead paths, then rebuild the Supervisor→Police, Supervisor→Fire, and fire/ems→CAD connectors to match the real design (positions, dashed vs solid, and arrowhead shape).
