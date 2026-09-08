/**
 * Loksewa page controller.
 * Loads the three question banks and wires them into the quiz engine,
 * handles tab switching between GK / IQ / Gorkhapatra, and the
 * Gorkhapatra weekly archive selector.
 */
(function () {
  'use strict';

  const DAILY_SET_SIZE = 8;
  const GORKHAPATRA_SET_SIZE = 20; // show a whole week's worth at once

  const state = {
    gk: null,
    iq: null,
    gorkhapatra: null,
    runners: {}
  };

  document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('loksewa-app')) return;
    initTabs();
    loadAll();
  });

  function initTabs() {
    const tabs = document.querySelectorAll('.ls-tab');
    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        tabs.forEach((t) => t.classList.remove('ls-tab--active'));
        tab.classList.add('ls-tab--active');
        document.querySelectorAll('.ls-panel').forEach((p) => p.classList.remove('ls-panel--active'));
        const panel = document.getElementById('panel-' + tab.dataset.section);
        if (panel) panel.classList.add('ls-panel--active');
      });
    });
  }

  async function loadAll() {
    try {
      const [gk, iq, gp] = await Promise.all([
        fetchJson('data/gk-questions.json'),
        fetchJson('data/iq-questions.json'),
        fetchJson('data/gorkhapatra-mcqs.json')
      ]);
      state.gk = gk.questions;
      state.iq = iq.questions;
      state.gorkhapatra = gp;

      setupBank('gk', state.gk, document.getElementById('gk-quiz-root'), document.getElementById('gk-meta'));
      setupBank('iq', state.iq, document.getElementById('iq-quiz-root'), document.getElementById('iq-meta'));
      setupGorkhapatra(state.gorkhapatra);
    } catch (err) {
      console.error('Loksewa data load failed:', err);
      ['gk-quiz-root', 'iq-quiz-root', 'gorkhapatra-quiz-root'].forEach((id) => {
        const el = document.getElementById(id);
        if (el) {
          el.innerHTML =
            '<div class="ls-empty"><i class="fas fa-exclamation-circle"></i> प्रश्नहरू लोड गर्न सकिएन। कृपया पृष्ठ रिफ्रेस गर्नुहोस्।</div>';
        }
      });
    }
  }

  async function fetchJson(path) {
    const res = await fetch(path, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch ' + path);
    return res.json();
  }

  function setupBank(key, bank, rootEl, metaEl) {
    if (!rootEl) return;

    function startDaily() {
      const set = window.LoksewaEngine.pickDailySet(bank, key, DAILY_SET_SIZE);
      state.runners[key] = new window.LoksewaEngine.QuizRunner(rootEl, set, {
        sectionKey: key,
        onRequestNewSet: startRandom
      });
    }
    function startRandom() {
      const set = window.LoksewaEngine.pickRandomSet(bank, DAILY_SET_SIZE);
      state.runners[key] = new window.LoksewaEngine.QuizRunner(rootEl, set, {
        sectionKey: key,
        onRequestNewSet: startRandom
      });
    }

    if (metaEl) {
      metaEl.textContent = 'आजको सेट: ' + Math.min(DAILY_SET_SIZE, bank.length) + ' प्रश्न · कुल बैंक: ' + bank.length + ' प्रश्न · हरेक दिन स्वतः परिवर्तन हुन्छ';
    }

    startDaily();

    const shuffleBtn = document.querySelector('[data-shuffle="' + key + '"]');
    if (shuffleBtn) shuffleBtn.addEventListener('click', startRandom);
  }

  function setupGorkhapatra(data) {
    const rootEl = document.getElementById('gorkhapatra-quiz-root');
    const selectEl = document.getElementById('gorkhapatra-week-select');
    const metaEl = document.getElementById('gorkhapatra-meta');
    if (!rootEl || !data) return;

    const weeks = data.weeks || [];

    if (metaEl) {
      metaEl.textContent =
        'पछिल्ला ' + weeks.length + ' हप्ताको अभिलेख · स्रोत: गोरखापत्र लोकसेवा स्तम्भ (हरेक बुधबार) · अन्तिम अद्यावधिक: ' +
        (data.meta && data.meta.lastSynced ? data.meta.lastSynced : '—');
    }

    if (selectEl) {
      selectEl.innerHTML = '';
      weeks.forEach((w, i) => {
        const opt = document.createElement('option');
        opt.value = String(i);
        opt.textContent = w.publishedNepali + ' (' + w.questions.length + ' प्रश्न)';
        selectEl.appendChild(opt);
      });
      selectEl.addEventListener('change', () => loadWeek(Number(selectEl.value)));
    }

    function loadWeek(i) {
      const week = weeks[i];
      if (!week) return;
      const questions = week.questions.map((q) => Object.assign({}, q, { __source: week }));
      state.runners.gorkhapatra = new window.LoksewaEngine.QuizRunner(rootEl, questions, {
        sectionKey: 'gorkhapatra-' + week.weekId,
        showSource: true,
        onRequestNewSet: () => loadWeek(i)
      });
    }

    if (weeks.length) loadWeek(0);
    else rootEl.innerHTML = '<div class="ls-empty">यस हप्ता गोरखापत्रबाट नयाँ सामग्री प्रकाशित भएको छैन।</div>';
  }
})();
