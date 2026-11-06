// Ranking public site: small progressive enhancements. Every page works without this file.
document.documentElement.classList.add('js');

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Nav: solid after scrolling, mobile menu toggle
const nav = document.querySelector('.nav');
if (nav) {
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 24);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  const toggle = nav.querySelector('.nav-toggle');
  toggle?.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  nav.querySelectorAll('.mobile-menu a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));
}

// Hero word rotator
document.querySelectorAll('.rotator').forEach(rot => {
  const words = [...rot.children];
  if (words.length < 2 || reduced) return;
  let i = 0;
  const fit = w => { rot.style.width = w.getBoundingClientRect().width + 'px'; };
  // Measure once fonts are in, so the first width is right
  fit(words[i]);
  (document.fonts?.ready || Promise.resolve()).then(() => fit(words[i]));
  window.addEventListener('resize', () => { rot.style.width = ''; fit(words[i]); });
  setInterval(() => {
    const cur = words[i];
    i = (i + 1) % words.length;
    const next = words[i];
    cur.classList.remove('on'); cur.classList.add('off');
    next.classList.remove('off'); next.classList.add('on');
    fit(next);
    setTimeout(() => cur.classList.remove('off'), 600);
    rot.setAttribute('aria-label', next.textContent);
  }, 2400);
});

// Reveal on scroll
const revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !reduced) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  revealEls.forEach(el => io.observe(el));
} else {
  revealEls.forEach(el => el.classList.add('in'));
}

// Generic tabs: [data-tabs] container with [role=tab][aria-controls] buttons
document.querySelectorAll('[data-tabs]').forEach(group => {
  const tabs = [...group.querySelectorAll('[role=tab]')];
  const select = tab => {
    tabs.forEach(t => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(t.getAttribute('aria-controls'));
      panel?.classList.toggle('on', on);
    });
  };
  group._select = select;
  const user = () => group.dispatchEvent(new Event('tabs:user'));
  tabs.forEach((t, idx) => {
    t.addEventListener('click', e => { if (e.isTrusted) user(); select(t); });
    t.addEventListener('keydown', e => {
      const dir = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (!dir) return;
      e.preventDefault(); user();
      const next = tabs[(idx + dir + tabs.length) % tabs.length];
      next.focus(); select(next);
    });
  });
});

// SEO tools tabs auto-advance while in view, until the visitor picks one
const tools = document.querySelector('.tools[data-tabs]');
if (tools && !reduced && 'IntersectionObserver' in window) {
  let manual = false;
  const tabs = [...tools.querySelectorAll('[role=tab]')];
  new IntersectionObserver(([e]) => { if (!manual) tools.classList.toggle('playing', e.isIntersecting); }, { threshold: 0.35 }).observe(tools);
  tools.addEventListener('tabs:user', () => { manual = true; tools.classList.remove('playing'); });
  tabs.forEach((t, i) => t.addEventListener('animationend', e => {
    if (manual || e.animationName !== 'fillbar') return;
    tools._select(tabs[(i + 1) % tabs.length]);
  }));
}

/* ---------------- Depth and motion ---------------- */
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

// Hero product window: tilted back in 3D, flattens as it scrolls into view
const stage = document.querySelector('.hero .stage');
const stageWin = stage?.querySelector('.window');
if (stageWin && !reduced) {
  stage.classList.add('is-3d');
  let cur = null, ticking = false;
  const target = () => {
    const r = stage.getBoundingClientRect(), vh = window.innerHeight;
    return Math.min(1, Math.max(0, (vh - r.top) / (vh * 0.85)));
  };
  const frame = () => {
    const t = target();
    cur = cur === null ? t : cur + (t - cur) * 0.14;
    stageWin.style.transform = `rotateX(${((1 - cur) * 22).toFixed(2)}deg) scale(${(0.92 + 0.08 * cur).toFixed(4)})`;
    if (Math.abs(t - cur) > 0.001) requestAnimationFrame(frame); else ticking = false;
  };
  const kick = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
  kick();
  window.addEventListener('scroll', kick, { passive: true });
  window.addEventListener('resize', kick);

  // Floating cards drift with the cursor
  const hero = stage.closest('.hero');
  if (finePointer && hero) {
    hero.addEventListener('pointermove', e => {
      const r = hero.getBoundingClientRect();
      stage.style.setProperty('--mx', ((e.clientX - r.left) / r.width - 0.5) * 2);
      stage.style.setProperty('--my', ((e.clientY - r.top) / r.height - 0.5) * 2);
    });
    hero.addEventListener('pointerleave', () => { stage.style.setProperty('--mx', 0); stage.style.setProperty('--my', 0); });
  }
}

// Cursor spotlight and 3D tilt on cards
if (finePointer && !reduced) {
  document.querySelectorAll('.spot').forEach(el => {
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--x', `${e.clientX - r.left}px`);
      el.style.setProperty('--y', `${e.clientY - r.top}px`);
      if (el.classList.contains('tilt')) {
        const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(1100px) rotateX(${(-y * 7).toFixed(2)}deg) rotateY(${(x * 7).toFixed(2)}deg) translateY(-4px)`;
      }
    });
    el.addEventListener('pointerleave', () => { if (el.classList.contains('tilt')) el.style.transform = ''; });
  });
}

// Count-up numbers when they scroll into view
const counters = document.querySelectorAll('[data-count]');
if (counters.length && 'IntersectionObserver' in window && !reduced) {
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    io.unobserve(e.target);
    const el = e.target, to = +el.dataset.count, t0 = performance.now(), dur = 1400;
    const step = t => {
      const k = Math.min(1, (t - t0) / dur), v = Math.round(to * (1 - Math.pow(1 - k, 3)));
      el.textContent = v;
      if (k < 1) requestAnimationFrame(step);
    };
    el.textContent = '0';
    requestAnimationFrame(step);
  }), { threshold: 0.6 });
  counters.forEach(c => io.observe(c));
}

// Sticky CTA on phones: shows after the hero, hides at the final call to action
const sticky = document.querySelector('[data-sticky-cta]');
if (sticky) {
  const heroEl = document.querySelector('.hero, .page-hero');
  const finalEl = document.querySelector('.final');
  const update = () => {
    const past = heroEl ? heroEl.getBoundingClientRect().bottom < 0 : window.scrollY > 600;
    const atEnd = finalEl ? finalEl.getBoundingClientRect().top < window.innerHeight : false;
    sticky.classList.toggle('show', past && !atEnd);
  };
  update();
  window.addEventListener('scroll', update, { passive: true });
}

// Swap text with a quick out/in slide (prices, totals)
const swapText = (el, txt) => {
  if (el.textContent === txt) return;
  if (reduced || !el.animate) { el.textContent = txt; return; }
  const out = el.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-10px)' }], { duration: 140, easing: 'ease-in' });
  out.onfinish = () => {
    el.textContent = txt;
    el.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 260, easing: 'cubic-bezier(.2,.8,.2,1)' });
  };
};

// Monthly / yearly toggle with a sliding thumb
document.querySelectorAll('.billing-toggle').forEach(tg => {
  const btns = [...tg.querySelectorAll('button')];
  const thumb = document.createElement('span');
  thumb.className = 'thumb';
  tg.prepend(thumb);
  tg.classList.add('has-thumb');
  const place = b => { thumb.style.width = b.offsetWidth + 'px'; thumb.style.transform = `translateX(${b.offsetLeft}px)`; };
  const current = () => btns.find(x => x.getAttribute('aria-pressed') === 'true') || btns[0];
  place(current());
  (document.fonts?.ready || Promise.resolve()).then(() => place(current()));
  window.addEventListener('load', () => place(current()));
  window.addEventListener('resize', () => place(current()));
  btns.forEach(b => b.addEventListener('click', () => {
    btns.forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    place(b);
    const yearly = b.dataset.period === 'yearly';
    document.body.classList.toggle('yearly', yearly);
    document.querySelectorAll('[data-monthly]').forEach(el => swapText(el, yearly ? el.dataset.yearly : el.dataset.monthly));
    document.querySelectorAll('[data-sub-monthly]').forEach(el => swapText(el, yearly ? el.dataset.subYearly : el.dataset.subMonthly));
  }));
});

// Pay-per-check calculator (pricing page). Prices per answer, in USD, from the price list.
const calc = document.getElementById('calc');
if (calc) {
  const PRICES = { chatgpt: 0.048, perplexity: 0.011, gemini: 0.051, claude: 0.02, aio: 0.006, aimode: 0.006 };
  const prompts = calc.querySelector('#c-prompts');
  const runs = calc.querySelector('#c-runs');
  const out = {
    prompts: calc.querySelector('#o-prompts'),
    runs: calc.querySelector('#o-runs'),
    total: document.getElementById('c-total'),
    formula: document.getElementById('c-formula'),
    verdict: document.getElementById('c-verdict'),
  };
  const fmt = n => n < 100 ? n.toFixed(2) : Math.round(n).toLocaleString('en-US');
  let shown = null, raf = 0;
  const tweenMoney = (el, to) => {
    const paint = v => { el.innerHTML = `$${fmt(v)}<small> /month</small>`; };
    if (shown === null || reduced) { shown = to; paint(to); return; }
    const from = shown, t0 = performance.now();
    cancelAnimationFrame(raf);
    const step = t => {
      const k = Math.min(1, (t - t0) / 450), e = 1 - Math.pow(1 - k, 3);
      shown = from + (to - from) * e; paint(shown);
      if (k < 1) raf = requestAnimationFrame(step); else shown = to;
    };
    raf = requestAnimationFrame(step);
  };
  const update = () => {
    const engines = [...calc.querySelectorAll('input[name=eng]:checked')].map(i => i.value);
    const per = engines.reduce((s, e) => s + PRICES[e], 0);
    const p = +prompts.value, r = +runs.value;
    const total = p * per * r;
    out.prompts.textContent = p;
    out.runs.textContent = r === 1 ? 'once a month' : r === 4 ? 'weekly' : r === 30 ? 'daily' : `${r}× a month`;
    tweenMoney(out.total, total);
    const max = Math.max(total, 119);
    const setBar = (id, v) => { const b = document.getElementById(id); if (b) b.style.width = Math.max(1.5, v / max * 100) + '%'; };
    setBar('b-payg', total); setBar('b-starter', 39); setBar('b-growth', 119);
    const vp = document.getElementById('v-payg'); if (vp) vp.textContent = '$' + fmt(total);
    out.formula.textContent = `${p} prompts × $${per.toFixed(3)} × ${r} run${r === 1 ? '' : 's'}`;
    let v;
    const plan = p <= 40 ? ['Starter', 39] : p <= 125 ? ['Growth', 119] : null;
    if (engines.length === 0) v = 'Pick at least one engine.';
    else if (plan && r <= 4 && total > plan[1]) v = `<b>${plan[0]} is cheaper.</b> $${plan[1]}/mo checks up to ${p <= 40 ? 40 : 125} prompts on all six engines every week, automatically, with alerts.`;
    else if (plan && r === 4) v = `<b>Pay per check costs less.</b> ${plan[0]} ($${plan[1]}/mo) costs more but runs these every week on its own and sends alerts, so nobody has to press the button.`;
    else if (r > 4) v = '<b>Pay per check is the way to run this.</b> Plans cover weekly checks; anything more often runs from credit at the same prices.';
    else if (!plan) v = '<b>Pay per check.</b> Over 125 prompts, run them from credit, or talk to us about more brands.';
    else v = '<b>Pay per check wins.</b> Top up from $1 and run these when you want. Credit never expires.';
    out.verdict.innerHTML = v;
  };
  calc.addEventListener('input', update);
  update();
}
