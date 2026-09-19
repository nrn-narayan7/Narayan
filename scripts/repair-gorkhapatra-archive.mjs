#!/usr/bin/env node
/**
 * One-off repair pass for data/gorkhapatra-mcqs.json.
 *
 * Two bugs compounded in the existing 20 weeks of data:
 *
 *   1. The original answer parser didn't treat a colon as a boundary,
 *      so when Gorkhapatra chained several related facts on one line
 *      ("तीन महिना ... : विसं २०८३ भदौ ११ गते ... : विसं २०८३ भदौ १०
 *      गते"), the *entire* chain got stored as a single "answer" —
 *      producing long, run-on option text.
 *   2. The no-API-key distractor fallback picked wrong options from
 *      the whole archive at random, with no regard for whether they
 *      were even the same *kind* of fact as the correct answer.
 *
 * Both are fixed in update-gorkhapatra.mjs for future weeks. This
 * script re-derives clean, short answers from the data already on
 * disk and regenerates every question's distractors from that
 * cleaned-up pool, so the fix applies retroactively too.
 *
 * Not part of the weekly automation — run once, by hand, after the fix.
 */
import fs from 'node:fs/promises';

const DATA_PATH = new URL('../data/gorkhapatra-mcqs.json', import.meta.url);

const NEPALI_MONTHS = [
  'वैशाख', 'जेठ', 'जेष्ठ', 'असार', 'आषाढ', 'साउन', 'श्रावण', 'भदौ', 'भाद्र',
  'असोज', 'आश्विन', 'कार्तिक', 'मंसिर', 'मङ्सिर', 'पुष', 'पुस', 'माघ', 'फागुन', 'फाल्गुन', 'चैत', 'चैत्र',
  'जनवरी', 'फेब्रुअरी', 'मार्च', 'अप्रिल', 'मे', 'जुन', 'जुलाई',
  'अगस्त', 'सेप्टेम्बर', 'अक्टोबर', 'नोभेम्बर', 'डिसेम्बर'
];

function classifyAnswerType(text) {
  const t = (text || '').trim();
  if (!t) return 'other';
  const hasMonth = NEPALI_MONTHS.some((m) => t.includes(m));
  const hasEraWord = /विसं|सन् |गते|साल\b/.test(t);
  if (hasMonth || hasEraWord) return 'date';

  const hasUnit = /(मेगावाट|करोड|लाख|अर्ब|प्रतिशत|%|रुपियाँ|रु\.|किमी|मिटर|केजी|जना|वटा|औँ|औं|संस्करण)/.test(t);
  const digitCount = (t.match(/[०-९0-9]/g) || []).length;
  const digitRatio = digitCount / Math.max(t.length, 1);
  if (hasUnit || digitRatio > 0.25) return 'number';

  return 'other';
}

function generateFallback(answer, pool) {
  const type = classifyAnswerType(answer);
  const sameType = [...new Set(pool.filter((a) => a.text !== answer && a.type === type).map((a) => a.text))];
  const rest = [...new Set(pool.filter((a) => a.text !== answer && a.type !== type).map((a) => a.text))];
  const shuffle = (arr) => arr.sort(() => Math.random() - 0.5);
  const distractors = shuffle(sameType).concat(shuffle(rest)).slice(0, 3);
  while (distractors.length < 3) distractors.push('माथिमध्ये कुनै पनि होइन');
  return distractors;
}

function stripPUA(text) {
  if (typeof text !== 'string') return text;
  return text.replace(/[\uE000-\uF8FF]/g, ' ').replace(/\s+/g, ' ').trim();
}

/** Same boundary logic as the fixed parseObjectiveQA in update-gorkhapatra.mjs. */
function splitAnswerFromExtra(text) {
  let t = (text || '').replace(/^[\-\u2010-\u2015:।.\s]+/, '').trim();
  if (!t) return { short: '', rest: '' };
  const boundaryRe = /\s[\-\u2010-\u2015]\s|\s:\s|।/g;
  let match;
  while ((match = boundaryRe.exec(t))) {
    const idx = match.index;
    if (idx <= 0) continue;
    const before = t.slice(0, idx);
    const opens = (before.match(/\(/g) || []).length;
    const closes = (before.match(/\)/g) || []).length;
    if (opens > closes) continue;
    return { short: t.slice(0, idx).trim(), rest: t.slice(idx + match[0].length).trim() };
  }
  return { short: t, rest: '' };
}

async function main() {
  const archive = JSON.parse(await fs.readFile(DATA_PATH, 'utf-8'));

  let truncatedCount = 0;

  // Pass 1: clean every option's text (glyphs + compound-blob truncation),
  // and for the correct answer specifically, fold anything trimmed off
  // into that question's explanation instead of discarding it.
  for (const week of archive.weeks) {
    for (const q of week.questions) {
      const correctText = q.options[q.answerIndex];

      q.options = q.options.map((opt) => {
        const cleaned = stripPUA(opt);
        const { short, rest } = splitAnswerFromExtra(cleaned);
        if (rest) truncatedCount++;
        return short || cleaned;
      });

      const newCorrectText = q.options[q.answerIndex];
      if (newCorrectText !== correctText) {
        const { rest: trimmedOff } = splitAnswerFromExtra(stripPUA(correctText));
        const existingExtra = (q.explanation || '').replace(/^सही उत्तर:\s*/, '').replace(/^.*?।\s*/, '');
        const extraBits = [trimmedOff, existingExtra].filter(Boolean).join(' ');
        q.explanation = extraBits ? `${newCorrectText}। ${extraBits}` : `सही उत्तर: ${newCorrectText}।`;
      }
      q.question = stripPUA(q.question);
      q.hint = stripPUA(q.hint);
    }
  }

  // Pass 2: rebuild the type-classified pool from the now-cleaned correct
  // answers, and regenerate every question's distractors from it so the
  // whole archive is internally consistent again.
  const pool = archive.weeks
    .flatMap((w) => w.questions.map((q) => q.options[q.answerIndex]))
    .filter(Boolean)
    .map((text) => ({ text, type: classifyAnswerType(text) }));

  let regenCount = 0;
  for (const week of archive.weeks) {
    for (const q of week.questions) {
      const answer = q.options[q.answerIndex];
      const distractors = generateFallback(answer, pool);
      const options = [answer, ...distractors];
      for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
      }
      q.options = options;
      q.answerIndex = options.indexOf(answer);
      regenCount++;
    }
  }

  await fs.writeFile(DATA_PATH, JSON.stringify(archive, null, 2) + '\n', 'utf-8');
  console.log(`Cleaned ${truncatedCount} compound/blob answers, regenerated distractors for ${regenCount} questions across ${archive.weeks.length} weeks.`);
}

main().catch((err) => {
  console.error('repair-gorkhapatra-archive.mjs failed:', err);
  process.exitCode = 1;
});
