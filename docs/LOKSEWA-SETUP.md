# Loksewa section — how it works & how to keep it updating

This site is fully static (hosted on GitHub Pages), so the Loksewa hub is
built to update itself without needing a traditional server.

## The three sections

| Section | Source | Refresh mechanism |
|---|---|---|
| **GK** (सामान्य ज्ञान) | Hand-curated bank in `data/gk-questions.json` (45 questions, stable facts only — geography, history, constitution) | A different subset of ~8 questions is chosen automatically **every calendar day** by a seeded shuffle (`js/loksewa-engine.js`) — no server needed, every visitor sees the same set on the same day. |
| **IQ** (बौद्धिक परीक्षण) | Hand-curated bank in `data/iq-questions.json` (35 questions — series, analogy, coding, blood relations, direction sense, calendar, math) | Same daily-shuffle mechanism as GK. |
| **Gorkhapatra Weekly** | `data/gorkhapatra-mcqs.json`, seeded with 20 real weeks converted from Gorkhapatra's own **"वस्तुगत प्रश्नोत्तर"** column (published every Wednesday at `gorkhapatraonline.com/categories/loksewa`) | Kept current by a **GitHub Action** that runs automatically (see below). The front end just reads whatever is currently in the JSON file — a plain `fetch()`, no scraping happens in the visitor's browser. |

## Why GK/IQ don't scrape a live source

Gorkhapatra's own "वस्तुगत प्रश्नोत्तर" column is *fact-and-answer* text, not
multiple choice — there's no public feed of ready-made Loksewa MCQs with
verified wrong options. So the GK and IQ banks are written and checked by
hand for accuracy, and the "auto-refresh" for those two is the daily
seeded rotation rather than new content appearing from nowhere. The
Gorkhapatra tab is the one that genuinely pulls new real-world content
every week, because that's the one place with a real, dated, citable
weekly source.

## How the Gorkhapatra auto-update works

`scripts/update-gorkhapatra.mjs` runs on a schedule via
`.github/workflows/loksewa-update.yml` (every Wednesday, with a Friday
safety-net retry, plus you can trigger it manually from the **Actions**
tab any time):

1. Reads the Loksewa category listing on gorkhapatraonline.com for new
   "वस्तुगत प्रश्नोत्तर" articles not already in the archive.
2. Parses each article's numbered Q&A pairs.
3. Builds a 4-option MCQ per question. **The correct answer is always
   copied verbatim from Gorkhapatra's own published answer — the script
   never invents or edits it.** Only the three *wrong* options and the
   hint text are generated (see below), so the thing being tested stays
   accurate to the source.
4. Adds the new week to `data/gorkhapatra-mcqs.json`, and trims the file
   down to the most recent 20 weeks.
5. Commits the updated JSON straight back to the repository, so GitHub
   Pages redeploys it automatically.

### Optional: better wrong-answer options via the Anthropic API

By default (no setup required) the script falls back to reusing other
real answers already in the archive as the three wrong options — always
true facts, just attached to the wrong question, which is a common,
safe way to write plausible distractors without inventing anything.

If you'd like noticeably better, more topical wrong options and hints,
add a repository secret:

1. GitHub repo → **Settings → Secrets and variables → Actions → New
   repository secret**
2. Name: `ANTHROPIC_API_KEY`, value: your API key from
   [console.anthropic.com](https://console.anthropic.com)

The workflow already passes this secret to the script if it's present;
nothing else to configure. If the key is missing, invalid, or the API
call fails for any reason, the script silently falls back to the
reused-answers method above — the site never breaks because of this.

## Manually triggering an update

Repo → **Actions** tab → **Update Gorkhapatra Loksewa archive** →
**Run workflow**. Useful right after you first publish this site, since
the very first scheduled run won't happen until the next Wednesday.

## Editing the GK / IQ banks

Just edit `data/gk-questions.json` or `data/iq-questions.json` directly
— each entry is:

```json
{
  "id": "gk-046",
  "category": "भूगोल",
  "question": "...",
  "options": ["...", "...", "...", "..."],
  "answerIndex": 0,
  "hint": "...",
  "explanation": "..."
}
```

No build step — commit and push, GitHub Pages picks it up immediately.

## If the site ever moves off GitHub Pages

The scraping script needs the open internet and a place to run on a
schedule — a GitHub Actions runner provides both for free. If you move
hosting elsewhere, you can still keep using GitHub Actions purely for
this job (it only needs `contents: write` on this repo) even if the
site itself is served from somewhere else, or port `scripts/update-gorkhapatra.mjs`
to any other Node-capable scheduler (a cron job on a VPS, a serverless
function, etc.) — it has no GitHub-specific dependencies itself.
