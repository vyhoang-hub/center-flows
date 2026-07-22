# Hosting & embedding notes

## Current state (2026-07-22)

- **Live now:** GitHub Pages (public) — see steps below. Chosen because SharePoint
  cannot run this app's JavaScript in an embed (its file preview / File-viewer /
  "Copy embed code" all route through `_layouts/15/embed.aspx`, a script-blocking
  sandbox). GitHub Pages serves real HTML, so the diagram renders, and SharePoint's
  **Embed** web part can show that external URL.
- ⚠️ **Public exposure:** a GitHub Pages URL is reachable by anyone with the link,
  even from a private repo. Accepted as an interim measure.
- **Planned:** move to **private Azure hosting** behind company sign-in (below), then
  repoint the SharePoint embed at the private URL and disable the Pages workflow.

---

## Turn on GitHub Pages (one-time, in the repo settings)

1. Repo → **Settings** → **Pages**.
2. **Build and deployment → Source** → choose **GitHub Actions**.
3. The `.github/workflows/deploy-pages.yml` workflow publishes on every push to `main`.
4. Published URL: `https://vyhoang-hub.github.io/center-flows/`
5. Embed in SharePoint: page → **Edit** → **Embed** web part → paste the Pages URL
   (an external `https://` site, so scripts run — unlike a SharePoint-hosted file).

---

## Move to private Azure hosting (the recommended long-term home)

The company uses Azure, so the app can be hosted **privately, behind Entra ID
(Azure AD) sign-in** — not on the public internet. The files are already plain
static HTML/CSS/JS (no build step), so deployment is straightforward.

### Request to send IT / whoever owns Azure

> **Subject: Host a small internal static site (private, Entra ID sign-in)**
>
> Hi [name],
>
> I have a small internal web page — plain static HTML/CSS/JS, no server code and
> no build step — that I need hosted somewhere only our organization can reach
> (behind our normal Microsoft/Entra ID login). It's internal UX research and
> should **not** be on the public internet.
>
> Could you host it on **Azure Static Web Apps** (or Azure Storage static website)
> with **Entra ID authentication** in front of it? The source is a GitHub repo
> (`vyhoang-hub/center-flows`); the site is just the files at the repo root
> (`index.html` + `css/`, `js/`, `data/`, `assets/`). It can deploy straight from
> GitHub or from an Azure DevOps pipeline — whatever fits our setup.
>
> Once it's up, I'll embed the private URL into a SharePoint page using the Embed
> web part. What I need back from you is the **hosting URL** (and confirmation that
> sign-in is required to view it).
>
> Thanks!

### After Azure is live
1. Open the private Azure URL to confirm it renders and requires sign-in.
2. SharePoint page → **Edit** → **Embed** web part → replace the Pages URL with the
   Azure URL → **Publish**.
3. Disable public Pages: in `.github/workflows/deploy-pages.yml`, comment out the
   `push:` trigger again (or delete the workflow).

---

## Updating the diagram (either host)

1. Edit the data (`data/norcomm.js`) or add a center from `data/_template.js`.
2. `bash build.sh` to refresh the single-file `dist/index.html` (used for direct
   file sharing). For GitHub Pages, just pushing to `main` republishes the repo-root
   multi-file version automatically.
