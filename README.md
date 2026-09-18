# Narayan Prasad Tripathi — Personal Site

Static site for [narayantripathi.com.np](https://narayantripathi.com.np), hosted on GitHub Pages.

## What's here

- `index.html`, `about.html`, `contact.html`, `news.html` / `news1.html` — main site pages.
- `loksewa.html` — Loksewa exam preparation hub (GK / IQ / Gorkhapatra Weekly). See
  [`docs/LOKSEWA-SETUP.md`](docs/LOKSEWA-SETUP.md) for how its auto-updating works and
  how to configure it.
- `styles.css` — shared design system (CSS custom properties at the top define the
  palette/typography used across every page).
- `news-styles.css`, `js/feeds.js`, `js/news-feed.js`, `js/news-backend.js`,
  `js/article-viewer.js` — the live news feed. **Untouched** — same behavior as before.
- `data/` — question banks for the Loksewa hub (`gk-questions.json`, `iq-questions.json`,
  `gorkhapatra-mcqs.json`).
- `scripts/update-gorkhapatra.mjs` + `.github/workflows/loksewa-update.yml` — the
  automation that keeps the Gorkhapatra archive current every week.

## Local preview

No build step — it's a static site. Serve the folder with any static server, e.g.:

```bash
npx serve .
```

## Deploying

Push to the `main` branch of the GitHub Pages repo this was exported from
(`nrn-narayan7/Narayan`, custom domain via `CNAME`). GitHub Pages serves the files
directly — no build step for the site itself.
