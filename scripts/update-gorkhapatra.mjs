#!/usr/bin/env node
/**
 * scripts/update-gorkhapatra.mjs
 *
 * Weekly automation for the Loksewa → Gorkhapatra section.
 *
 * What it does:
 *   1. Reads the Gorkhapatra "Loksewa" category listing
 *      (https://gorkhapatraonline.com/categories/loksewa) to find the
 *      latest "वस्तुगत प्रश्नोत्तर" (objective Q&A) article(s).
 *   2. Skips anything already present in data/gorkhapatra-mcqs.json
 *      (deduped by source URL).
 *   3. Fetches each new article and parses its numbered Q&A pairs.
 *   4. Turns each Q&A pair into a 4-option MCQ:
 *        - the correct answer is taken verbatim from Gorkhapatra's own
 *          published answer (never altered) — this is what keeps the
 *          archive accurate;
 *        - three plausible wrong options + a hint are generated either
 *          by the Anthropic API (if ANTHROPIC_API_KEY is set) or, as a
 *          safe fallback with no API key, from other real answers
 *          already in the archive.
 *   5. Prepends the new week, de-dupes, sorts newest-first, and trims
 *      the archive to the most recent N weeks (see WINDOW_WEEKS).
 *   6. Writes data/gorkhapatra-mcqs.json back out.
 *
 * Intended to run on a schedule via
 * .github/workflows/loksewa-update.yml — it needs the open internet,
 * which a GitHub Actions runner has (this repo's own sandboxed dev
 * environment may not).
 *
 * Usage:  node scripts/update-gorkhapatra.mjs
 * Env:    ANTHROPIC_API_KEY   (optional — enables better distractors/hints)
 *         GORKHAPATRA_MAX_PAGES (optional, default 2)
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.join(__dirname, '..', 'data', 'gorkhapatra-mcqs.json');
const CATEGORY_URL = 'https://gorkhapatraonline.com/categories/loksewa';
const WINDOW_WEEKS = 20;
const MAX_PAGES = Number(process.env.GORKHAPATRA_MAX_PAGES || 2);
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5';

const UA =
  'Mozilla/5.0 (compatible; NarayanTripathiLoksewaBot/1.0; +https://narayantripathi.com.np/loksewa)';

async function fetchText(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`Fetch failed (${res.status}) for ${url}`);
  return res.text();
}

/* ---------------- Discover candidate article links ---------------- */

async function discoverArticles() {
  const found = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const url = page === 1 ? CATEGORY_URL : `${CATEGORY_URL}?page=${page}`;
    let html;
    try {
      html = await fetchText(url);
    } catch (err) {
      console.warn(`Could not fetch listing page ${page}:`, err.message);
      break;
    }
    // Match article links + nearby title text. Gorkhapatra's markup can
    // shift over time, so this is intentionally loose: any /news/<id>
    // link whose surrounding text mentions "वस्तुगत प्रश्नोत्तर".
    const linkRe = /href="(https:\/\/gorkhapatraonline\.com\/news\/\d+)"[^>]*>([^<]{0,200})/g;
    let m;
    while ((m = linkRe.exec(html))) {
      const [, url2, snippet] = m;
      found.push({ url: url2, snippet });
    }
  }
  // De-dupe by URL while preserving first-seen order.
  const seen = new Set();
  return found.filter((a) => {
    if (seen.has(a.url)) return false;
    seen.add(a.url);
    return true;
  });
}

/* ---------------- Parse a single article ---------------- */

function stripTags(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const DEVANAGARI_DIGITS = '०१२३४५६७८९';
function devanagariToArabic(str) {
  return str.replace(/[०-९]/g, (d) => String(DEVANAGARI_DIGITS.indexOf(d)));
}

/**
 * Parses "१. प्रश्न ... ? उत्तर वाक्य। थप तथ्य वाक्य।" style numbered
 * Q&A out of a body of plain text. Returns [{ question, answer, extra }]
 */
function parseObjectiveQA(bodyText) {
  const qa = [];
  // Split on a Devanagari-numeral list marker like "१." "२." etc.
  const parts = bodyText.split(/(?=[१२३४५६७८९][०-९]*\.\s)/g);
  for (const part of parts) {
    const m = part.match(/^([१२३४५६७८९][०-९]*)\.\s*(.+)/s);
    if (!m) continue;
    const body = m[2].trim();
    const qMark = body.indexOf('?');
    if (qMark === -1) continue;
    const question = body.slice(0, qMark + 1).trim();
    const rest = body.slice(qMark + 1).trim();
    if (!question || !rest) continue;
    // Gorkhapatra's own format is usually "उत्तर – सहायक तथ्यहरू ।":
    // prefer splitting on the en/em dash first (short answer vs.
    // supporting facts); fall back to the first sentence-ending danda.
    const dashIdx = rest.search(/\s[–—-]\s/);
    const dandaIdx = rest.search(/[।.]/);
    let answer, extra;
    if (dashIdx !== -1 && (dandaIdx === -1 || dashIdx < dandaIdx)) {
      answer = rest.slice(0, dashIdx).trim();
      extra = rest.slice(dashIdx + 1).replace(/^[–—-]\s*/, '').trim();
    } else if (dandaIdx !== -1) {
      answer = rest.slice(0, dandaIdx).replace(/^[-–—:]\s*/, '').trim();
      extra = rest.slice(dandaIdx + 1).trim();
    } else {
      answer = rest.replace(/^[-–—:]\s*/, '').trim();
      extra = '';
    }
    if (question.length > 10 && answer.length > 0 && answer.length < 200) {
      qa.push({ question, answer, extra });
    }
  }
  return qa;
}

async function fetchArticle(url) {
  const html = await fetchText(url);
  const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
  const title = titleMatch ? titleMatch[1].split('|')[0].trim() : '';
  // Nepali publish date, e.g. "१० भदौ २०८३, बुधबार" — best effort scrape;
  // falls back to "not found" (script still records the article by URL).
  const dateMatch = html.match(/([०-९]{1,2}\s+[^\s,<]+\s+[०-९]{4},?\s*(सोम|मङ्ग|बुध|बिहि|शुक्र|शनि|आइत)बार)/);
  const publishedNepali = dateMatch ? dateMatch[1] : '';
  const bodyText = stripTags(html);
  const isObjective = /वस्तुगत\s*प्रश्नोत्तर/.test(title) || /वस्तुगत\s*प्रश्नोत्तर/.test(bodyText.slice(0, 400));
  return { url, title, publishedNepali, bodyText, isObjective };
}

/* ---------------- Distractor / hint generation ---------------- */

async function generateWithAnthropic(question, answer, extra) {
  if (!ANTHROPIC_API_KEY) return null;
  const prompt = `तपाईं नेपाली लोकसेवा परीक्षाका लागि बहुविकल्पीय प्रश्न (MCQ) तयार पार्ने सहायक हुनुहुन्छ।
तलको प्रश्न र सही उत्तर दिइएको छ। सही उत्तरलाई कहिल्यै नबदल्नुहोस्।
तपाईंको काम: यही विषयसँग मिल्ने तर स्पष्ट रूपमा गलत ३ वटा विकल्प (distractors), र उत्तर नखुलाई मद्दत गर्ने १ वटा छोटो संकेत (hint) नेपालीमा तयार पार्नु हो।

प्रश्न: ${question}
सही उत्तर: ${answer}
थप तथ्य (उपलब्ध भए): ${extra || 'छैन'}

कडाइका साथ, अरू कुनै व्याख्या नराखी, ठ्याक्कै यही स्वरूपमा JSON मात्र फर्काउनुहोस्:
{"distractors": ["...", "...", "..."], "hint": "..."}`;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    if (!res.ok) {
      console.warn('Anthropic API call failed:', res.status, await res.text());
      return null;
    }
    const data = await res.json();
    const text = (data.content || []).map((b) => b.text || '').join('');
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    const parsed = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(parsed.distractors) || parsed.distractors.length < 3) return null;
    return { distractors: parsed.distractors.slice(0, 3), hint: parsed.hint || '' };
  } catch (err) {
    console.warn('Anthropic generation error:', err.message);
    return null;
  }
}

function generateFallback(answer, pastAnswers) {
  // Reuse three other real answers already in the archive as generic
  // wrong options (never fabricated facts — just recycled true ones
  // attached to the wrong question).
  const pool = pastAnswers.filter((a) => a && a !== answer);
  const shuffled = pool.sort(() => Math.random() - 0.5);
  const distractors = shuffled.slice(0, 3);
  while (distractors.length < 3) distractors.push('माथिमध्ये कुनै पनि होइन');
  return {
    distractors,
    hint: 'यो प्रश्नको उत्तर स्रोत लेखमा उल्लेखित मुख्य तथ्यसँग सम्बन्धित छ — तलको स्रोत लिङ्क हेर्नुहोस्।'
  };
}

/* ---------------- Main ---------------- */

async function main() {
  const raw = await fs.readFile(DATA_PATH, 'utf-8');
  const archive = JSON.parse(raw);
  const existingUrls = new Set(archive.weeks.map((w) => w.sourceUrl));
  const pastAnswers = archive.weeks.flatMap((w) => w.questions.map((q) => q.options[q.answerIndex]));

  console.log('Discovering Loksewa articles…');
  const candidates = await discoverArticles();
  console.log(`Found ${candidates.length} candidate links.`);

  const newArticleUrls = candidates
    .map((c) => c.url)
    .filter((u) => !existingUrls.has(u));

  if (!newArticleUrls.length) {
    console.log('No new articles found. Archive is already up to date.');
    return;
  }

  const newWeeks = [];
  for (const url of newArticleUrls.slice(0, 6)) {
    // cap per run to keep CI time/cost bounded; next scheduled run picks up the rest
    console.log('Fetching article:', url);
    let article;
    try {
      article = await fetchArticle(url);
    } catch (err) {
      console.warn('Failed to fetch article, skipping:', url, err.message);
      continue;
    }
    if (!article.isObjective) {
      console.log('  → not an objective-type article, skipping:', article.title);
      continue;
    }
    const qaPairs = parseObjectiveQA(article.bodyText);
    if (!qaPairs.length) {
      console.log('  → no parseable Q&A found, skipping.');
      continue;
    }

    const questions = [];
    let qIndex = 1;
    for (const { question, answer, extra } of qaPairs.slice(0, 20)) {
      let gen = await generateWithAnthropic(question, answer, extra);
      if (!gen) gen = generateFallback(answer, pastAnswers);

      const options = [answer, ...gen.distractors];
      // Shuffle while tracking correct index.
      for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
      }
      const answerIndex = options.indexOf(answer);

      questions.push({
        id: `gp-auto-${Date.now()}-${qIndex}`,
        question,
        options,
        answerIndex,
        hint: gen.hint || 'स्रोत लेखमा उल्लेखित मुख्य तथ्य नियाल्नुहोस्।',
        explanation: extra ? `${answer}। ${extra}` : `सही उत्तर: ${answer}।`
      });
      qIndex++;
    }

    if (!questions.length) continue;

    const bsMatch = article.publishedNepali.match(/([०-९]{1,2})\s+(\S+)\s+([०-९]{4})/);
    const weekId = bsMatch
      ? `auto-${devanagariToArabic(bsMatch[3])}-${bsMatch[2]}-${devanagariToArabic(bsMatch[1])}`
      : `auto-${Date.now()}`;

    newWeeks.push({
      weekId,
      publishedNepali: article.publishedNepali || 'मिति फेला परेन',
      publishedApproxISO: new Date().toISOString().slice(0, 10),
      sourceUrl: article.url,
      sourceTitle: article.title || 'लोकसेवा तयारी विशेष : वस्तुगत प्रश्नोत्तर',
      questions
    });
    console.log(`  → parsed ${questions.length} question(s).`);
  }

  if (!newWeeks.length) {
    console.log('No usable new weeks parsed this run.');
    return;
  }

  const merged = [...newWeeks, ...archive.weeks]
    .filter((w, i, arr) => arr.findIndex((x) => x.sourceUrl === w.sourceUrl) === i)
    .sort((a, b) => (a.publishedApproxISO < b.publishedApproxISO ? 1 : -1))
    .slice(0, WINDOW_WEEKS);

  archive.weeks = merged;
  archive.meta.lastSynced = new Date().toISOString().slice(0, 10);
  archive.meta.windowWeeks = WINDOW_WEEKS;

  await fs.writeFile(DATA_PATH, JSON.stringify(archive, null, 2) + '\n', 'utf-8');
  console.log(`Wrote ${merged.length} weeks to ${path.relative(process.cwd(), DATA_PATH)}.`);
}

main().catch((err) => {
  console.error('update-gorkhapatra.mjs failed:', err);
  process.exitCode = 1;
});
