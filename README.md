# Dispatch Center Workflow Hub

An interactive, data-driven visualization of how a dispatch center handles calls,
dispatching, communication, systems, and role responsibilities. Built for internal
UX research documentation — product managers, designers, developers, and leadership.

The first workflow modeled is **NORCOMM**. The system is designed so you can add
future dispatch centers by **editing a data file, not rebuilding the UI**.

---

## Why no build tools (React/Vite)?

This machine has no Node.js, npm, or Python, and React/Vite has failed here before.
So the prototype is intentionally **plain HTML, CSS, and JavaScript with no build
step**. Every feature from the concept doc is still here — data-driven rendering,
layer toggles, clickable detail panels, and copy-a-file replicability. A static
site is also straightforward to host and then embed in SharePoint.

---

## How to run / preview

**Double-click `index.html`.** It opens in your browser. That's it — no install.

After you edit any file, just **refresh the browser** to see the change.

> Tip: everything is written to work directly from a `file://` path (opened by
> double-click). No local server is required.

---

## Project structure

```
UX research hub/
  index.html          ← open locally; also the hosted site's entry page
  css/
    theme.css          ← colors & design tokens (edit colors here)
    app.css            ← layout and component styling
  js/
    diagram.js         ← draws nodes, edges, and zones from the data
    panels.js          ← layer toggles + detail panel
    app.js             ← wires data → diagram → panels together
  data/
    norcomm.js         ← the NORCOMM workflow (the sample data)
    _template.js       ← blank copy for adding a new center
  assets/              ← the exact connector & zone-outline SVGs from Figma
  README.md
```

The `assets/` folder holds the curved connector lines and dashed zone outlines
exported straight from the Figma file, so the layout is pixel-faithful. They're
saved locally — the page does **not** depend on Figma being open.

**Key idea:** the files in `js/` and `css/` are the reusable *engine*. The files in
`data/` are the *content*. You should almost never need to touch the engine.

---

## How to add another dispatch center

1. **Copy** `data/_template.js` to a new name, e.g. `data/springfield.js`.
2. **Fill in** the `meta`, `nodes`, `edges`, and (optionally) `zones` and `staff`.
   Use `data/norcomm.js` as a worked example.
3. **Point the page at it:** in `index.html`, change this line:
   ```html
   <script src="data/norcomm.js"></script>
   ```
   to:
   ```html
   <script src="data/springfield.js"></script>
   ```
4. **Refresh** the browser to preview locally.
5. **For an offline, single-file copy**, bundle that center:
   ```
   bash build.sh data/springfield.js
   ```
   For an interactive SharePoint experience, publish the site to an approved
   web host and embed that hosted URL (see "Publishing / embedding" below).

### The data model (per center)

| Field     | What it is |
|-----------|------------|
| `meta`    | Name, location, visit date, summary, tags. Shown in the header. |
| `layers`  | The toggle list on the right. `id`s are referenced by nodes/edges/zones. |
| `zones`     | Big grouping outlines (e.g. CALL / POLICE / FIRE), drawn from data — no SVG export needed. Optional. |
| `nodes`     | Circles (roles), octagons (field resources), system boxes (CAD). Each has a `detail` shown in the click-through panel. |
| `edges`     | Curved lines drawn between two nodes by `id` (`from`/`to`), with a `curve` bend and optional arrowhead. **This is the easy way to draw connections for a new center — no Figma export required.** |
| `connectors`| Exact SVG vectors exported from a Figma frame, hand-positioned. NORCOMM uses these to stay pixel-faithful; a new center can skip them entirely and use `edges` instead. |
| `pills`     | Small text chips (telephone, radio, 911, zone/flow labels, annotations). |
| `staff`     | Optional staff-distribution card. |

> **Two ways to draw lines.** `edges` are drawn procedurally between nodes, so a
> brand-new center is authored as **pure data with zero image exports**.
> `connectors` are pre-exported Figma SVGs used only when you need to reproduce a
> specific Figma layout exactly (as NORCOMM does).

**Coordinates:** the stage is `2002 × 1303` units (from the Figma frame). A node's
or zone's `x`/`y` is its **top-left corner** and `w`/`h` its size. Edges connect
node **centers** automatically (computed from `x`/`y` + `w`/`h`), so you only ever
position the boxes. The whole stage auto-scales to fit the screen, so you can think
in Figma pixels.

**Layers:** every node/edge/zone lists the layer `id`s it belongs to. An element is
visible when **at least one** of its layers is on. Turn a layer off and matching
elements fade out. "Show all" / "Hide all" are at the bottom of the panel.

---

## Color coding

Set in `css/theme.css`. This build matches the **Figma design** exactly:

- **Slate `#354a57`** — all role circles (call takers, dispatchers, supervisor, data)
- **Light blue `#c9d9e4`** — field-resource octagons (fire/ems/patrol)
- **Sage `#a4c5a4`** — CAD / system boxes
- **Pink `#b866a3`** — communication pills & dashed communication paths
- **Red `#c95548`** — 911 intake · **Yellow `#e2ce88`** — non-emergency intake
- **Tan `#c7c0b8`** — dashed department zone outlines

In Figma the circles are all one slate color; the category color coding from the
concept doc (blue=police, orange=fire, green=data) is applied to the **detail
panel accent and layer dots** rather than repainting the shapes. Change any value
in `css/theme.css` to restyle.

---

## Publishing / embedding in SharePoint

### Why uploading the HTML file to SharePoint does not work

The app's header, canvas background, controls, and empty Layers shell are static
HTML. The nodes, labels, lines, layer rows, and interactions are created by
JavaScript. SharePoint's document preview, File Viewer, and generated "Copy embed
code" URL route the file through `_layouts/15/embed.aspx`, whose sandbox blocks
that JavaScript. The result looks like a diagram bug because the shell remains
visible while the actual diagram is missing.

Bundling the app into `dist/index.html` solves broken relative file paths, but it
cannot override a SharePoint iframe that disallows scripts. The bundle remains
useful for local/offline sharing:

```
bash build.sh                 # ENCRYPTED bundle of data/norcomm.js -> dist/index.html
bash build.sh data/other.js   # encrypted bundle of another center
bash build.sh --plain         # unencrypted, local preview only — never publish
```

By default the bundle is **encrypted behind a passphrase**: the diagram and the
research data are stored as AES-256 ciphertext and decrypted in the reader's
browser after they type the passphrase. `build.sh` prompts for it. This is what
makes it safe to publish to GitHub Pages, which anyone with the URL can read. The
scheme and how to rotate the passphrase are documented in `HOSTING.md`; the moving
parts are `crypt.sh` (encrypts), `js/gate.js` + `css/gate.css` (the lock screen).

### Working interactive path

Host the static site at a normal HTTPS URL, then put that URL in SharePoint's
**Embed** web part. A normal web host permits the JavaScript that renders and
operates the diagram.

This repository deploys to GitHub Pages at
`https://vyhoang-hub.github.io/center-flows/`. GitHub Pages is readable by anyone
who has the URL — there is no sign-in, and that holds even for a private repo — so
the workflow publishes **only the encrypted `dist/index.html`** and nothing else.
The rest of the repo (including `data/norcomm.js`) is not served. A guard step
fails the deploy if the bundle is not encrypted.

Two caveats worth keeping in view:

- **The repository itself is still public**, so `data/norcomm.js` is readable on
  github.com regardless of what Pages serves, and it stays in earlier commits even
  if deleted. Making the repo private closes that; Pages keeps working.
- **The site published plaintext before 2026-07-27** (the workflow uploaded the
  whole repo root). Assume that content may already have been copied or indexed.

To publish a change:

1. `bash build.sh` and enter the passphrase.
2. Commit `dist/index.html` and push to `main`.
3. Verify `https://vyhoang-hub.github.io/center-flows/` shows the passphrase screen.
4. In SharePoint, edit the page, add an **Embed** web part, and paste that URL.

The preferred long-term home for internal research is **Azure Static Web Apps
with Entra ID sign-in** (or another company-approved internal HTTPS host). After
IT provides that URL, replace the GitHub Pages URL in SharePoint. See
`HOSTING.md` for the IT request and migration checklist.

### What will not fix the SharePoint file-preview version

- Re-uploading or renaming `dist/index.html`
- Clearing the SharePoint cache
- Changing the zoom, pan, or fit calculations
- Inlining more JavaScript, CSS, or SVG files

Those changes cannot grant `allow-scripts` to SharePoint's preview iframe.

### Questions to ask IT / SharePoint admins

- Is the **Embed web part** enabled, and is embedding from *(your host URL)* on the
  allow-list? (Admins can restrict which domains can be iframed.)
- Do we have an approved place to **host static internal files** over HTTPS?
- Is the approved hosted domain allowed by **HTML Field Security** for the Embed
  web part?
- Any **authentication** requirement for the host that would block the iframe?

### Making the embed clean

- The layout is responsive and will stack the layer panel under the diagram on
  narrow iframes.
- Give the Embed web part a generous height (e.g. 800px+) so the diagram has room.

---

## Editing tips

- **Change a color everywhere:** edit the variable in `css/theme.css`.
- **Move a node:** change its `x`/`y` in the data file.
- **Add a detail:** add `responsibilities`, `systems`, or `notes` arrays to a
  node's `detail`.
- **Add/rename a layer:** edit the `layers` array, then tag nodes/edges with its
  `id`.

If something doesn't appear, open the browser console (F12) — a mistyped node `id`
in an edge's `from`/`to` is the most common cause and is safely skipped.
