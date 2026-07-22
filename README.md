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
layer toggles, clickable detail panels, and copy-a-file replicability. As a bonus,
a static site like this is the *easiest* possible thing to embed in SharePoint.

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
  index.html          ← open this to view / embed this to publish
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
4. **Refresh** the browser.

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

## Publishing / embedding — recommendation

**This content is internal/sensitive, so it must NOT go on the public internet.**
That single fact drives every choice below.

**Short version:** host these static files somewhere **only your organization can
reach** (behind your normal Microsoft 365 / SSO login), then embed the page into
SharePoint with the **Embed web part** (an `<iframe>`) pointed at that internal
URL. Do **not** paste the HTML/JS directly into a SharePoint page — modern
SharePoint strips scripts for security.

### Recommended options for INTERNAL-only content, simplest first

1. **SharePoint document library + the "Embed" or "File viewer" web part
   (recommended, all-Microsoft).**
   Upload the whole folder to a SharePoint/Teams document library on a site your
   audience already has access to. Because it lives inside SharePoint, it inherits
   your org's login — no separate hosting, no public exposure. Then embed it on a
   page (see the step-by-step below). Updates = re-upload the changed files.

2. **Internal web server / intranet host over HTTPS.**
   If IT runs an internal site that serves static files (reachable only on the
   corporate network/VPN), drop the folder there and embed that URL. Also private,
   slightly more setup.

3. **Azure Static Web Apps / Blob static hosting with access restricted to your
   tenant.** More moving parts; only worth it if IT already uses Azure and wants
   central hosting with Entra ID (Azure AD) sign-in in front of it.

> **Not recommended for this content: GitHub Pages.** A Pages site is **publicly
> reachable by anyone with the URL**, even when published from a *private* repo
> (the only exception is GitHub Enterprise Cloud's private Pages). Because this
> research is internal, the auto-deploy workflow in this repo has been
> **intentionally disabled** — see `.github/workflows/deploy-pages.yml`. Leave it
> off unless this content is ever formally cleared for public hosting.

### Step-by-step: embed in SharePoint (Microsoft-only path)

1. Go to the SharePoint site your audience uses. Open (or create) a **document
   library**, e.g. "Dispatch Research".
2. **Upload the entire project folder** (drag it in). Keep the folder structure —
   `index.html` must sit alongside its `css/`, `js/`, `data/`, and `assets/`
   folders, or the relative links break.
3. Click `index.html` in the library and confirm it opens/renders in the browser.
   Copy that page's URL from the address bar.
   - If SharePoint *downloads* the file instead of showing it, use option 2 below
     or ask IT to allow rendering — some tenants block inline HTML.
4. Go to the SharePoint **page** where you want the diagram to appear → **Edit** →
   click **+** to add a web part → choose **Embed**.
5. Paste the `index.html` URL. Set a generous height (800px+). **Publish** the page.
6. Open the page as a normal viewer to confirm the diagram shows and the layer
   toggles work.

> If the **Embed** web part refuses the URL, your tenant may only allow embedding
> from an approved domain list — that's the main question for IT below.

### Questions to ask IT / SharePoint admins

- Is the **Embed web part** enabled, and is embedding from *(your host URL)* on the
  allow-list? (Admins can restrict which domains can be iframed.)
- Do we have an approved place to **host static internal files** over HTTPS?
- Are **custom scripts** allowed on the target site (usually no — which is why we
  iframe instead)?
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
