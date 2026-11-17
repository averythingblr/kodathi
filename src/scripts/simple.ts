// The simple site: small, plain scripts. No smooth-scroll library, no sound until a visitor taps.
const $ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => r.querySelector(s) as T | null;
const $$ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => Array.from(r.querySelectorAll(s)) as T[];
const base = (document.body.dataset.base || '/').replace(/\/?$/, '/');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const DAY = 86400000;
const istToday = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date()); // YYYY-MM-DD
const at = (d: string) => new Date(d + 'T00:00:00+05:30').getTime();
const daysTo = (d: string) => Math.round((at(d) - at(istToday())) / DAY);

/* ---------- Kannada or Telugu, remembered (shared with the main site) ---------- */
$$<HTMLButtonElement>('[data-script-toggle]').forEach((b) => {
  b.addEventListener('click', () => {
    const next = document.documentElement.dataset.script === 'te' ? 'kn' : 'te';
    document.documentElement.dataset.script = next;
    try { localStorage.setItem('kodathi-script', next); } catch { /* storage blocked */ }
  });
});

/* ---------- the next dated event, and the notice bar for today or tomorrow ---------- */
(function next() {
  const rows = $$('[data-next-date]');
  const row = rows.find((r) => daysTo(r.dataset.nextDate!) >= 0);
  if (row) {
    const left = daysTo(row.dataset.nextDate!);
    row.hidden = false;
    $('[data-next-in]', row)!.textContent = left === 0 ? 'Today' : left === 1 ? 'Tomorrow' : 'Coming up';
    if (left <= 1) row.classList.add('is-soon');
  }
  const note = $('[data-note-text]');
  const soon = rows.filter((r) => { const l = daysTo(r.dataset.nextDate!); return l === 0 || l === 1; });
  if (note && soon.length) {
    note.textContent = soon.map((r) => `${daysTo(r.dataset.nextDate!) === 0 ? 'Today' : 'Tomorrow'}: ${$('h3', r)!.firstChild!.textContent!.trim()}`).join(' · ');
    $('[data-note]')!.classList.add('is-soon');
  }
})();

/* ---------- the opening clip: silent, plays only while on screen, never with reduced motion ---------- */
(function hero() {
  const v = $<HTMLVideoElement>('[data-hero]');
  if (!v || reduced) return;
  new IntersectionObserver(([e]) => { if (e.isIntersecting) v.play().catch(() => {}); else v.pause(); }, { threshold: 0.25 }).observe(v);
})();

/* ---------- each swamy's own day of 41 ---------- */
(function deeksha() {
  const box = $('[data-deeksha]');
  if (!box) return;
  const input = $<HTMLInputElement>('[data-mala-date]', box)!;
  const txt = $('[data-mala-txt]', box)!;
  const beads = $$('[data-beads] rect', box);
  const days = +box.dataset.days!;
  const KEY = 'kodathi-mala-date';
  const fmt = (ms: number) => new Intl.DateTimeFormat('en-IN', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Asia/Kolkata' }).format(ms);
  input.max = istToday();
  try { const saved = localStorage.getItem(KEY); if (saved) input.value = saved; } catch { /* storage blocked */ }
  const say = (b: string, s: string) => { txt.innerHTML = ''; const bb = document.createElement('b'); bb.textContent = b; const ss = document.createElement('span'); ss.textContent = s; txt.append(bb, ss); };
  function draw() {
    const v = input.value;
    beads.forEach((r) => r.removeAttribute('class'));
    if (!v) return say('Your journey', 'Your day count will appear here.');
    const d = Math.floor((at(istToday()) - at(v)) / DAY) + 1;
    beads.forEach((r, i) => { if (i < d - 1) r.setAttribute('class', 'on'); else if (i === d - 1) r.setAttribute('class', 'today'); });
    const last = at(v) + (days - 1) * DAY;
    if (d < 1) say('Not yet', 'That day is still to come.');
    else if (d < days) say(`Day ${d} of ${days}`, `Your 41 days complete on ${fmt(last)}.`);
    else if (d === days) say(`Day ${days} of ${days}`, 'The last day of your deeksha. Swamiye Sharanam Ayyappa.');
    else say('Completed', `Your 41 days completed on ${fmt(last)}. Swamiye Sharanam Ayyappa.`);
  }
  input.addEventListener('change', () => { try { localStorage.setItem(KEY, input.value); } catch { /* storage blocked */ } draw(); });
  draw();
})();

/* ---------- sevas: one open at a time ---------- */
$$<HTMLButtonElement>('[data-acc]').forEach((b, _, all) => {
  b.addEventListener('click', () => {
    const open = b.getAttribute('aria-expanded') === 'true';
    all.forEach((o) => { o.setAttribute('aria-expanded', 'false'); document.getElementById(o.getAttribute('aria-controls')!)!.hidden = true; });
    if (!open) { b.setAttribute('aria-expanded', 'true'); document.getElementById(b.getAttribute('aria-controls')!)!.hidden = false; }
  });
});

/* ---------- take a moment: tabs ---------- */
(function tabs() {
  const list = $$<HTMLButtonElement>('[data-tab]');
  const pick = (t: HTMLButtonElement) => {
    list.forEach((o) => {
      const on = o === t;
      o.setAttribute('aria-selected', String(on));
      o.tabIndex = on ? 0 : -1;
      document.getElementById(o.getAttribute('aria-controls')!)!.hidden = !on;
    });
  };
  list.forEach((t, i) => {
    t.addEventListener('click', () => pick(t));
    t.addEventListener('keydown', (e) => {
      const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      const n = list[(i + d + list.length) % list.length];
      pick(n); n.focus();
    });
  });
})();

/* ---------- the eighteen steps, one at a time ---------- */
(function steps() {
  const box = $('[data-steps]');
  if (!box) return;
  let i = 0;
  const show = () => {
    $$('[data-step]', box).forEach((li) => { li.hidden = +li.dataset.step! !== i; });
    $$('[data-stair]', box).forEach((r) => r.classList.toggle('on', +r.dataset.stair! <= i));
    $('[data-step-n]', box)!.textContent = String(i + 1).padStart(2, '0');
    $<HTMLButtonElement>('[data-step-prev]', box)!.disabled = i === 0;
    $('[data-step-next]', box)!.textContent = i === 17 ? 'Start again' : 'Next step';
  };
  $('[data-step-next]', box)!.addEventListener('click', () => { i = i === 17 ? 0 : i + 1; show(); });
  $('[data-step-prev]', box)!.addEventListener('click', () => { if (i > 0) i--; show(); });
  show();
})();

/* ---------- sharanu ghosha: each tap plays one call and its answer, never more than one at once ---------- */
(function ghosha() {
  const box = $('[data-ghosha]');
  if (!box) return;
  const lines = JSON.parse($('[data-vili]', box)!.textContent || '[]') as { en: string; kn: string; te: string }[];
  const btn = $<HTMLButtonElement>('[data-call]', box)!;
  let k = 0;
  let audio: HTMLAudioElement | null = null;
  const set = (n: number) => {
    const l = lines[n];
    $('[data-call-en]', box)!.textContent = l.en;
    const kn = $('.s-call__sc [data-sc="kn"]', box), te = $('.s-call__sc [data-sc="te"]', box);
    if (kn) kn.textContent = l.kn;
    if (te) te.textContent = l.te;
  };
  btn.addEventListener('click', () => {
    audio?.pause();
    set(k);
    audio = new Audio(`${base}media/audio/vili-${k}.mp3`);
    audio.play().catch(() => {});
    k = (k + 1) % lines.length;
    $('[data-call-n]', box)!.textContent = String(k + 1);
  });
  // leaving the tab or the page stops the sound
  $$('[data-tab]').forEach((t) => t.addEventListener('click', () => audio?.pause()));
  document.addEventListener('visibilitychange', () => { if (document.hidden) audio?.pause(); });
})();
