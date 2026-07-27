# Hosting & embedding notes

## Current state (2026-07-27)

- **Live:** GitHub Pages, at `https://vyhoang-hub.github.io/center-flows/`.
- **Protected by a passphrase.** The published page contains the diagram and the
  research data only as AES-256 ciphertext; it asks for a passphrase and decrypts
  in the reader's browser. See [Encryption](#encryption-how-the-passphrase-gate-works)
  below.
- **Only one file is published.** The workflow uploads `dist/index.html` and
  nothing else, so everything in `data/`, `iteration-notes.md`, `concept-idea` and
  the rest of the repo are not served at all. **Every** center is inside that one
  encrypted file — the hub's separate "pages" are URL hashes, not separate files, so
  there is nothing else to publish as the hub grows.
- **Why this host is needed:** SharePoint
  cannot run this app's JavaScript in an embed (its file preview / File-viewer /
  "Copy embed code" all route through `_layouts/15/embed.aspx`, a script-blocking
  sandbox). GitHub Pages serves real HTML, so the diagram renders, and SharePoint's
  **Embed** web part can show that external URL.
- **Planned:** move to **private Azure hosting** behind company sign-in (below), then
  repoint the SharePoint embed at the private URL and disable the Pages workflow.
  The passphrase gate is what makes public Pages tolerable until then; it is not a
  replacement for real sign-in.

### ⚠️ What happened before 2026-07-27

Between enabling Pages and this change, the workflow published the **whole repo
root** (`path: .`). That meant `https://vyhoang-hub.github.io/center-flows/data/norcomm.js`,
`…/iteration-notes.md` and `…/concept-idea` returned the research content in plain
text to anyone with the URL. Assume that content may already have been fetched,
cached or indexed — encryption stops future access, not past access.

Two follow-ups that encryption does **not** fix:

1. **The repo itself is public**, so every file in `data/` is readable on
   github.com, and they appear in earlier commits even if deleted. Making the repo
   private (Settings → Danger Zone) closes both; Pages keeps working. This matters
   more as the hub grows: each new center is another plaintext file in `data/`.
2. **Consider whether the alert-tone detail belongs in the document at all** —
   `data/norcomm.js` maps specific tones to "Priority 1 / weapon involved" and to a
   20-minute unassigned-call threshold.

---

## Turn on GitHub Pages (one-time, in the repo settings)

1. Repo → **Settings** → **Pages**.
2. **Build and deployment → Source** → choose **GitHub Actions**.
3. The `.github/workflows/deploy-pages.yml` workflow publishes on every push to `main`.
4. Published URL: `https://vyhoang-hub.github.io/center-flows/`
5. Embed in SharePoint: page → **Edit** → **Embed** web part → paste the Pages URL
   (an external `https://` site, so scripts run — unlike a SharePoint-hosted file).
   Put the passphrase in the text next to the embed, so colleagues who can already
   see the SharePoint page can get in.

---

## Encryption: how the passphrase gate works

`bash build.sh` asks for a passphrase and wraps the app's code + every center's data
in AES-256-CBC with an HMAC-SHA256 tag (`crypt.sh` builds it, `js/gate.js` opens it).
Both sides use only primitives that OpenSSL and the browser's built-in WebCrypto
share, so there is no JavaScript crypto library to trust or update.

```
salt   = 8 random bytes
master = PBKDF2-SHA256(passphrase, salt, 600,000 iterations)
encKey = HMAC-SHA256(master, "dispatch-hub/v1/enc")
macKey = HMAC-SHA256(master, "dispatch-hub/v1/mac")
ct     = AES-256-CBC(payload, encKey, random 16-byte iv)
mac    = HMAC-SHA256(macKey, salt || iv || ct)
```

The browser checks `mac` **before** decrypting, so a wrong passphrase is rejected
cleanly rather than producing garbage.

### Rotating the passphrase

1. `bash build.sh` → enter the new passphrase twice.
2. Commit `dist/index.html` and push. Pages republishes automatically.
3. Tell the readers. Old copies of the file still open with the old passphrase —
   rotation protects the published page, not copies already downloaded.

### Choosing a passphrase

Anyone can download the encrypted file and grind guesses offline, so **length is
the only real defence**. 600,000 PBKDF2 iterations makes each guess cost about a
second, but a short or predictable passphrase ("norcomm", "dispatch") still falls
quickly. Use a long multi-word phrase. **Never commit it to the repo** — share it
in the SharePoint page text or by email.

### Previewing locally

`bash build.sh --plain` builds an unencrypted bundle for quick checks. It is
readable by anyone, the deploy workflow refuses to publish it, and you should not
share it. **Don't commit it either** — re-run `bash build.sh` (encrypted) before you
commit `dist/index.html`, or `git checkout -- dist/index.html` to put the last
encrypted build back.

One passphrase covers the whole hub. There is no per-center access: anyone with the
passphrase can open every center in the bundle. If a future center needs narrower
access, that's the point to move to the Azure host below rather than to build a
second gate.

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
   `push:` trigger again (or delete the workflow). Also turn Pages off in
   **Settings → Pages** so the old URL stops resolving.
4. Once Entra ID sign-in is doing the access control, the passphrase gate is
   optional — you can serve the `--plain` bundle behind it if you prefer.

---

## Updating research content (either host)

1. Edit a center's data file (e.g. `data/norcomm.js`), or add a new center by
   copying `data/_template.js` and adding one `<script>` line to `index.html`.
   See "How to add another center" in `README.md`.
2. Check it renders locally — double-click `index.html`, or bundle it first with
   `bash build.sh --plain` and open `dist/index.html`.
3. `bash build.sh` and enter the passphrase to produce the encrypted bundle. Every
   `data/*.js` except `_template.js` is included automatically, so a new center needs
   no change here.
4. Commit `dist/index.html` and push to `main` — Pages republishes automatically.

Step 3 is required: the site serves `dist/index.html`, so a data change is not live
until you rebuild and commit that file. If you built with `--plain` in step 2, make
sure step 3 actually ran before committing — the deploy guard will reject a plain
bundle, but it's easier to catch here.
