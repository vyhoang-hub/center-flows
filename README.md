# User Research Hub

A place to keep everything learned from dispatch-center site visits, organized **by
location rather than by artifact type**. The home page indexes every center by
country and region; opening one gives you a single page holding its overview,
mental models, personas, workflows, key findings, and supporting research.

Built for internal UX research documentation — product managers, designers,
developers, and leadership.

The first center documented is **NORCOMM**, whose mental model is a fully
interactive diagram. The system is designed so you add future centers by **adding a
data file, not rebuilding the UI**.

### How the pages fit together

```
#/                        home — centers grouped by country / region
#/c/<id>                  a center, on its first tab with content
#/c/<id>/<section>        a named tab: overview, mental-models, personas,
                          workflows, findings, supporting
```

Those are URL **hashes**, not separate files: the whole hub is one document, which
is what lets it publish as a single encrypted file (see "Publishing" below) and
still open from a double-clicked `index.html`. Deep links and the browser's
back/forward buttons work normally.

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
    app.css            ← layout and component styling for the diagram
    hub.css            ← the home index and the center-page chrome
    gate.css           ← the passphrase screen (encrypted builds only)
  js/
    diagram.js         ← draws nodes, edges, and zones from the data
    panels.js          ← layer toggles + detail panel
    app.js             ← mounts one center's data into the diagram
    hub.js             ← the router, home index, and the six content tabs
    gate.js            ← decrypts the bundle in the browser
  data/
    norcomm.js         ← NORCOMM: diagram + research (the worked example)
    harbor-point.js    ← placeholder center
    riverside.js       ← placeholder center, second country
    _template.js       ← copy this to add a new center (never bundled)
  assets/              ← the exact connector & zone-outline SVGs from Figma
  build.sh             ← bundles everything into one encrypted dist/index.html
  README.md
```

The `assets/` folder holds the curved connector lines and dashed zone outlines
exported straight from the Figma file, so the layout is pixel-faithful. They're
saved locally — the page does **not** depend on Figma being open.

**Key idea:** the files in `js/` and `css/` are the reusable *engine*. The files in
`data/` are the *content*. You should almost never need to touch the engine.

---

## How to add another center

1. **Copy** `data/_template.js` to a new name, e.g. `data/springfield.js`.
2. **Rename the global** at the top (`window.CENTER_TEMPLATE`) and the matching name
   in the registration line at the bottom, so two centers can't overwrite each other.
3. **Fill in** `meta` — especially `meta.id` (it's the URL) and `meta.geo`, which is
   what places the card on the home page. Then fill in whatever you have: the
   diagram keys (`layers`, `nodes`, `edges`, …) and/or the `research` block. Anything
   you leave out shows an empty state naming the field to fill in.
4. **Add one line** to `index.html`, next to the other data files:
   ```html
   <script src="data/springfield.js"></script>
   ```
5. **Refresh** the browser. The center appears on the home page under its
   country/region, at `#/c/springfield`.
6. **Bundle it** with `bash build.sh` — every `data/*.js` except `_template.js` is
   included automatically, so there's nothing to configure.

Use `data/norcomm.js` as the worked example, and `data/harbor-point.js` as the
smallest useful placeholder.

### The data model (per center)

Everything except `meta` is optional. A center with only `meta` is a valid
placeholder card.

| Field     | What it is |
|-----------|------------|
| `meta`    | `id` (the URL), `name`, `location`, `visitDate`, `summary`, `tags`, plus **`geo`** (`country` / `region` / `city` — how the home page groups it) and **`status`** (`"documented"` or `"placeholder"`, which drives the home-card badge). |
| `research`  | The center page's tabs — see the table below. |
| `layers`  | The toggle list on the right of the diagram. `id`s are referenced by nodes/edges/zones. Use `layers: []` for a center with no diagram. |
| `zones`     | Big grouping outlines (e.g. CALL / POLICE / FIRE), drawn from data — no SVG export needed. Optional. |
| `nodes`     | Circles (roles), resource blobs (field resources), system boxes (CAD). Each has a `detail` shown in the click-through panel. |
| `edges`     | Curved lines drawn between two nodes by `id` (`from`/`to`), with a `curve` bend and optional arrowhead. **This is the easy way to draw connections for a new center — no Figma export required.** |
| `connectors`| Exact SVG vectors exported from a Figma frame, hand-positioned. NORCOMM uses these to stay pixel-faithful; a new center can skip them entirely and use `edges` instead. |
| `pills`     | Small text chips (telephone, radio, 911, zone/flow labels, annotations). |
| `about`     | The "About this center" card floating over the diagram. Doubles as the Overview tab when `research.overview` is absent, so you write it once. |

### The `research` block (one key per tab)

| Key | Shape | Notes |
|---|---|---|
| `overview`     | `{ sections: [{ heading, text, items }] }` | Omit it to reuse `about.sections`. |
| `mentalModels` | `[{ id, title, description, view }]` | `view: "diagram"` means *this artifact is the interactive canvas* — the tab shows the diagram instead of cards. |
| `personas`     | `[{ id, name, role, shift, quote, goals, frustrations, tools }]` | |
| `workflows`    | `[{ id, title, description, steps }]` | Written walkthroughs; the diagram belongs under `mentalModels`. |
| `findings`     | `[{ id, title, impact, detail, evidence }]` | `impact` is `high` / `medium` / `low` and colors the badge. |
| `supporting`   | `[{ id, title, kind, description }]` | `kind` is `photo` / `note` / `transcript` / `artifact`. |

`items` and `evidence` lists accept either plain strings or `{ text, children }` for
one level of nesting.

> **Two ways to draw lines.** `edges` are drawn procedurally between nodes, so a
> brand-new center is authored as **pure data with zero image exports**.
> `connectors` are pre-exported Figma SVGs used only when you need to reproduce a
> specific Figma layout exactly (as NORCOMM does).

**Coordinates:** the stage is `2210 × 1303` units (from the Figma frame). A node's
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
- **Light blue `#c9d9e4`** — field-resource blobs (fire/ems/patrol)
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

The page shell — the bar, canvas background, controls, and empty Layers panel — is
static HTML. Every center name, card, tab, node, label and line is created by
JavaScript from the data files. SharePoint's document preview, File Viewer, and
generated "Copy embed code" URL route the file through `_layouts/15/embed.aspx`,
whose sandbox blocks that JavaScript. The result looks like a bug because the shell
remains visible while all the content is missing.

Bundling the app into `dist/index.html` solves broken relative file paths, but it
cannot override a SharePoint iframe that disallows scripts. The bundle remains
useful for local/offline sharing:

```
bash build.sh                 # ENCRYPTED bundle of EVERY center -> dist/index.html
bash build.sh data/other.js   # just one center (or list several)
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
The rest of the repo (including every file in `data/`) is not served. A guard step
fails the deploy if the bundle is not encrypted, or if any research content appears
in the clear.

Two caveats worth keeping in view:

- **The repository itself is still public**, so the files in `data/` are readable on
  github.com regardless of what Pages serves, and they stay in earlier commits even
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
- **Add a persona / finding / workflow:** append to the matching array in that
  center's `research` block. Nothing else needs to change — the tabs are data-driven.
- **Move a center on the home page:** edit `meta.geo`. Countries and regions are
  created from the data and sorted alphabetically; there is no list to maintain.
- **Add a whole new section tab:** add an entry to `Hub.SECTIONS` and a render
  function in `js/hub.js`. This is the one case that touches the engine.

If something doesn't appear, open the browser console (F12) — a mistyped node `id`
in an edge's `from`/`to` is the most common cause and is safely skipped. If a center
is missing from the home page, check that its data file has a `<script>` line in
`index.html` and that its last line registers it.
