#!/usr/bin/env node
/**
 * One-off repair pass for data/gorkhapatra-mcqs.json.
 *
 * The existing 20 weeks were generated back when the no-API-key fallback
 * picked distractors completely at random from the whole archive, so a
 * "when did this flood happen?" question could end up with a person's
 * name as a wrong option. This re-runs the *fixed* type-aware fallback
 * over the data that's already there — correct answers are untouched,
 * only the three wrong options (and the resulting shuffle/answerIndex)
 * are regenerated.
 *
 * Not part of the weekly automation — run once, by hand, after the fix.
 */
import fs from 'node:fs/promises';

const DATA_PATH = new URL('../data/gorkhapatra-mcqs.json', import.meta.url);

const NEPALI_MONTHS = [
  // Bikram Sambat months
  'वैशाख', 'जेठ', 'जेष्ठ', 'असार', 'आषाढ', 'साउन', 'श्रावण', 'भदौ', 'भाद्र',
  'असोज', 'आश्विन', 'कार्तिक', 'मंसिर', 'मङ्सिर', 'पुष', 'पुस', 'माघ', 'फागुन', 'फाल्गुन', 'चैत', 'चैत्र',
  // Gregorian months (as used for AD dates, e.g. "सन् २०२६ अगस्त १२")
  'जनवरी', 'फेब्रुअरी', 'मार्च', 'अप्रिल', 'मे', 'जुन', 'जुलाई',
  'अगस्त', 'सेप्टेम्बर', 'अक्टोबर', 'नोभेम्बर', 'डिसेम्बर'
];

function classifyAnswerType(text) {
  const t = (text || '').trim();
  if (!t) return 'other';
  const hasMonth = NEPALI_MONTHS.some((m) => t.includes(m));
  const hasEraWord = /विसं|सन्\s|गते|साल\b/.test(t);
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

async function main() {
  const archive = JSON.parse(await fs.readFile(DATA_PATH, 'utf-8'));

  // Clean up stray icon-font glyphs left over from scraping, first.
  for (const week of archive.weeks) {
    for (const q of week.questions) {
      q.question = stripPUA(q.question);
      q.hint = stripPUA(q.hint);
      q.explanation = stripPUA(q.explanation);
      q.options = q.options.map(stripPUA);
    }
  }

  const pool = archive.weeks
    .flatMap((w) => w.questions.map((q) => q.options[q.answerIndex]))
    .filter(Boolean)
    .map((text) => ({ text, type: classifyAnswerType(text) }));

  let fixedCount = 0;
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
      fixedCount++;
    }
  }

  await fs.writeFile(DATA_PATH, JSON.stringify(archive, null, 2) + '\n', 'utf-8');
  console.log(`Repaired distractors for ${fixedCount} questions across ${archive.weeks.length} weeks.`);
}

main().catch((err) => {
  console.error('repair-gorkhapatra-distractors.mjs failed:', err);
  process.exitCode = 1;
});
