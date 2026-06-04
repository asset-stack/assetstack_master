# Marketing site → standalone bundle → WordPress

This repo can emit a **self-contained static marketing site** (home, product,
solutions, industries, compliance, contact) that is byte-identical to the live
React pages — same layouts, videos, animations, 3D globe and links. You then put
it behind your WordPress site so it serves under your marketing domain.

## What was added

| File | Purpose |
|------|---------|
| `marketing/main.marketing.jsx` | Entry point — mounts ONLY the 6 marketing routes (no dashboard, no auth). |
| `marketing/index.html` | HTML shell with all SEO/OG meta + fonts + analytics. |
| `vite.marketing.config.js` | Build config → outputs to `dist-marketing/`. |

The marketing pages reuse the **exact same components** as the live app, so there
is zero visual drift. The pages make a couple of `base44` data calls (e.g. saved
landing layout) that already **fail silently to defaults**, so they work fully
offline of the app backend.

## 1. Build the static bundle

```bash
npx vite build --config vite.marketing.config.js
```

Output → `dist-marketing/` (plain HTML + JS + CSS, deploy anywhere).

Local preview:

```bash
npx vite preview --config vite.marketing.config.js
```

> Optional: add these scripts to package.json for convenience
> ```json
> "build:marketing": "vite build --config vite.marketing.config.js",
> "preview:marketing": "vite preview --config vite.marketing.config.js"
> ```

## 2. Host the bundle

Drop `dist-marketing/` on any static host: Netlify, Vercel, Cloudflare Pages,
or an S3/CDN bucket. You'll get a URL like `https://marketing.yoursite.com`.

**SPA fallback** — because it's a single-page app, configure the host to rewrite
all unknown paths to `index.html`:
- Netlify → add `dist-marketing/_redirects` containing: `/*  /index.html  200`
- Vercel → `vercel.json`: `{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }`
- Cloudflare Pages → it does SPA fallback automatically.

## 3. Serve it under your WordPress domain

Pick ONE based on your hosting access:

### A) Reverse proxy (best — clean URLs, good SEO)
On the WordPress web server (Nginx example), proxy the marketing paths to the
static bundle so the URL stays on your main domain:

```nginx
location ~ ^/(Product|Solutions|Industries|LandingCompliance|Contact)?$ {
    proxy_pass https://marketing.yoursite.com;
}
```

Result: `yoursite.com/Product` renders the React page, no iframe.

### B) Subdomain (easiest on managed WordPress)
Point a subdomain at the bundle: `get.yoursite.com` → `dist-marketing/`.
Link to it from WordPress nav. Pages live at `get.yoursite.com/Product` etc.

### C) Iframe embed (last resort)
Create WP pages and embed `<iframe src="https://marketing.yoursite.com/Product">`.
Works, but worse for SEO and scroll behaviour — avoid if A or B are possible.

## 4. Split of responsibilities

- **React bundle** → the 6 visual marketing pages (identical to live).
- **WordPress** → blog/news, SEO plugins, lead capture forms.
- Point the "Book a demo" / Contact CTA at your WordPress form endpoint if you
  want all leads to land in WP. (Currently the nav "Sign in" deep-links into the
  app — keep or repoint as you wish.)

## 5. Staying in sync

It's the same React source. Any future change to a marketing component is **one
edit + one rebuild** (`build:marketing`) — redeploy `dist-marketing/` and the
WordPress-fronted site updates with zero drift.

## Notes / gotchas

- Internal nav uses React Router paths (`/Product`, `/Solutions`, …). With the
  SPA fallback (step 2) and proxy/subdomain (step 3) these resolve correctly.
- The "Sign in" button calls `base44.auth.redirectToLogin` → it still points at
  the real app login. Repoint it in `components/landing/LandingNav.jsx` if the
  marketing site should not link into the product.
- Fonts, videos and images are all absolute URLs (CDN-hosted) → they load fine
  from the standalone bundle with no extra config.