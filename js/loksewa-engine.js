/**
 * Loksewa Quiz Engine
 * Powers the GK, IQ and Gorkhapatra Weekly sections of the Loksewa Prep hub.
 *
 * - Deterministic "today's set": every visitor on the same calendar day sees
 *   the same shuffled subset from a question bank (seeded PRNG on the date),
 *   so the set genuinely changes at midnight without needing a server.
 * - Hint is hidden until clicked; explanation is hidden until the answer is submitted.
 * - No external dependencies.
 */
(function () {
  'use strict';

  /* ---------- Seeded PRNG helpers (deterministic "daily" shuffles) ---------- */

  function mulberry32(seed) {
    return function () {
      seed |= 0;
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function seedFromString(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function todayKey() {
    const d = new Date();
    return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  }

  function shuffledIndices(n, seed) {
    const rand = mulberry32(seed);
    const arr = Array.from({ length: n }, (_, i) => i);
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      const tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  }

  function pickDailySet(bank, sectionKey, count) {
    const seed = seedFromString(todayKey() + '|' + sectionKey);
    const order = shuffledIndices(bank.length, seed);
    const n = Math.min(count, bank.length);
    return order.slice(0, n).map((i) => bank[i]);
  }

  function pickRandomSet(bank, count) {
    const seed = Math.floor(Math.random() * 1e9);
    const order = shuffledIndices(bank.length, seed);
    const n = Math.min(count, bank.length);
    return order.slice(0, n).map((i) => bank[i]);
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /* ---------- LocalStorage streak / score memory (best-effort) ---------- */

  const Store = {
    key(section) {
      return 'loksewa:' + section;
    },
    read(section) {
      try {
        return JSON.parse(localStorage.getItem(this.key(section))) || {};
      } catch (e) {
        return {};
      }
    },
    write(section, data) {
      try {
        localStorage.setItem(this.key(section), JSON.stringify(data));
      } catch (e) {
        /* storage unavailable — fail silently, quiz still works */
      }
    }
  };

  /* ---------- Quiz Runner: renders one question at a time ---------- */

  class QuizRunner {
    /**
     * @param {HTMLElement} root - container to render into
     * @param {Array} questions - array of question objects
     * @param {Object} opts - { sectionLabel, sectionKey, showSource(bool), onFinish(score,total) }
     */
    constructor(root, questions, opts) {
      this.root = root;
      this.questions = questions;
      this.opts = opts || {};
      this.index = 0;
      this.score = 0;
      this.selected = null;
      this.submitted = false;
      this.hintShown = false;
      this.render();
    }

    get total() {
      return this.questions.length;
    }

    render() {
      if (!this.questions.length) {
        this.root.innerHTML = '<div class="ls-empty">यस सेटमा हाल कुनै प्रश्न उपलब्ध छैन।</div>';
        return;
      }
      if (this.index >= this.total) {
        this.renderSummary();
        return;
      }
      const q = this.questions[this.index];
      this.selected = null;
      this.submitted = false;
      this.hintShown = false;

      const progressTicks = this.questions
        .map((_, i) => {
          let cls = 'ls-tick';
          if (i < this.index) cls += ' ls-tick--done';
          if (i === this.index) cls += ' ls-tick--current';
          return '<span class="' + cls + '"></span>';
        })
        .join('');

      const sourceLine =
        this.opts.showSource && q.__source
          ? '<div class="ls-source"><i class="fas fa-newspaper"></i> स्रोत: गोरखापत्र, ' +
            escapeHtml(q.__source.publishedNepali) +
            ' — <a href="' + escapeHtml(q.__source.sourceUrl) + '" target="_blank" rel="noopener">मूल लेख हेर्नुहोस् ↗</a></div>'
          : '';

      const categoryTag = q.category ? '<span class="ls-tag">' + escapeHtml(q.category) + '</span>' : '';

      this.root.innerHTML =
        '<div class="ls-quiz-head">' +
        '<div class="ls-progress" aria-hidden="true">' + progressTicks + '</div>' +
        '<div class="ls-count">प्रश्न ' + (this.index + 1) + ' / ' + this.total + '</div>' +
        '</div>' +
        '<div class="ls-card">' +
        categoryTag +
        '<p class="ls-question">' + escapeHtml(q.question) + '</p>' +
        '<ul class="ls-options" role="list"></ul>' +
        '<div class="ls-actions">' +
        '<button type="button" class="ls-btn ls-btn--ghost" data-act="hint"><i class="fas fa-flag"></i> संकेत हेर्नुहोस्</button>' +
        '<button type="button" class="ls-btn ls-btn--primary" data-act="submit" disabled>उत्तर पेश गर्नुहोस्</button>' +
        '</div>' +
        '<div class="ls-hint" hidden></div>' +
        '<div class="ls-feedback" hidden></div>' +
        sourceLine +
        '</div>';

      const optionsList = this.root.querySelector('.ls-options');
      q.options.forEach((opt, i) => {
        const li = document.createElement('li');
        li.className = 'ls-option';
        li.setAttribute('role', 'button');
        li.tabIndex = 0;
        li.dataset.index = String(i);
        li.innerHTML =
          '<span class="ls-option__marker">' + String.fromCharCode(65 + i) + '</span>' +
          '<span class="ls-option__text">' + escapeHtml(opt) + '</span>';
        li.addEventListener('click', () => this.selectOption(i));
        li.addEventListener('keypress', (e) => {
          if (e.key === 'Enter' || e.key === ' ') this.selectOption(i);
        });
        optionsList.appendChild(li);
      });

      this.root.querySelector('[data-act="hint"]').addEventListener('click', () => this.showHint());
      this.root.querySelector('[data-act="submit"]').addEventListener('click', () => this.submit());
    }

    selectOption(i) {
      if (this.submitted) return;
      this.selected = i;
      this.root.querySelectorAll('.ls-option').forEach((el) => {
        el.classList.toggle('ls-option--selected', Number(el.dataset.index) === i);
      });
      this.root.querySelector('[data-act="submit"]').disabled = false;
    }

    showHint() {
      const q = this.questions[this.index];
      const hintBox = this.root.querySelector('.ls-hint');
      this.hintShown = true;
      hintBox.hidden = false;
      hintBox.innerHTML = '<i class="fas fa-flag"></i> <strong>संकेत:</strong> ' + escapeHtml(q.hint || 'यो प्रश्नका लागि संकेत उपलब्ध छैन।');
    }

    submit() {
      if (this.selected === null || this.submitted) return;
      const q = this.questions[this.index];
      this.submitted = true;
      const isCorrect = this.selected === q.answerIndex;
      if (isCorrect) this.score++;

      this.root.querySelectorAll('.ls-option').forEach((el) => {
        const idx = Number(el.dataset.index);
        el.classList.add('ls-option--locked');
        if (idx === q.answerIndex) el.classList.add('ls-option--correct');
        else if (idx === this.selected) el.classList.add('ls-option--incorrect');
      });

      const feedback = this.root.querySelector('.ls-feedback');
      feedback.hidden = false;
      feedback.className = 'ls-feedback ' + (isCorrect ? 'ls-feedback--correct' : 'ls-feedback--incorrect');
      feedback.innerHTML =
        '<div class="ls-feedback__head">' +
        (isCorrect ? '<i class="fas fa-check-circle"></i> सही उत्तर!' : '<i class="fas fa-times-circle"></i> गलत उत्तर') +
        '</div>' +
        '<p class="ls-explanation"><strong>व्याख्या:</strong> ' + escapeHtml(q.explanation || 'यस प्रश्नका लागि थप व्याख्या उपलब्ध छैन।') + '</p>';

      const submitBtn = this.root.querySelector('[data-act="submit"]');
      submitBtn.textContent = this.index + 1 < this.total ? 'अर्को प्रश्न →' : 'नतिजा हेर्नुहोस् →';
      submitBtn.dataset.act = 'next';
      submitBtn.disabled = false;
      submitBtn.removeEventListener('click', () => this.submit());
      submitBtn.onclick = () => this.next();

      this.root.querySelector('[data-act="hint"]').disabled = true;
    }

    next() {
      this.index++;
      this.render();
    }

    renderSummary() {
      const pct = Math.round((this.score / this.total) * 100);
      let remark = 'अभ्यास जारी राख्नुहोस्!';
      if (pct >= 80) remark = 'उत्कृष्ट! तपाईं राम्रोसँग तयार हुनुहुन्छ।';
      else if (pct >= 50) remark = 'राम्रो प्रयास — अझै अभ्यास गर्नुहोस्।';

      if (this.opts.sectionKey) {
        const rec = Store.read(this.opts.sectionKey);
        rec.lastScore = this.score;
        rec.lastTotal = this.total;
        rec.lastDate = todayKey();
        rec.best = Math.max(rec.best || 0, this.score);
        Store.write(this.opts.sectionKey, rec);
      }

      this.root.innerHTML =
        '<div class="ls-summary">' +
        '<div class="ls-summary__score">' + this.score + ' / ' + this.total + '</div>' +
        '<p class="ls-summary__remark">' + remark + '</p>' +
        '<div class="ls-actions ls-actions--center">' +
        '<button type="button" class="ls-btn ls-btn--primary" data-act="retry">यही सेट फेरि दिनुहोस्</button>' +
        '<button type="button" class="ls-btn ls-btn--ghost" data-act="newset">नयाँ सेट ल्याउनुहोस्</button>' +
        '</div>' +
        '</div>';

      this.root.querySelector('[data-act="retry"]').addEventListener('click', () => {
        this.index = 0;
        this.score = 0;
        this.render();
      });
      this.root.querySelector('[data-act="newset"]').addEventListener('click', () => {
        if (typeof this.opts.onRequestNewSet === 'function') this.opts.onRequestNewSet();
      });

      if (typeof this.opts.onFinish === 'function') this.opts.onFinish(this.score, this.total);
    }
  }

  window.LoksewaEngine = {
    pickDailySet,
    pickRandomSet,
    QuizRunner,
    todayKey,
    Store
  };
})();
