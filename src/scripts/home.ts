// Home page: the temple day, from the first darshan to Harivarasanam.
import { gsap, ScrollTrigger, initScroll, initReveals, reduced, sound, getLenis } from './core';
import { Scrub } from './scrub';
import { stairs, stairGroup, temple, openAllDay } from '../data/temple';

const $ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => r.querySelector<T>(s)!;
const $$ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => Array.from(r.querySelectorAll<T>(s));
const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const range = (p: number, a: number, b: number) => clamp((p - a) / (b - a));
const pad = (n: number) => String(n).padStart(2, '0');
const script = () => (document.documentElement.dataset.script === 'te' ? 'te' : 'kn') as 'kn' | 'te';

if (reduced) document.documentElement.classList.add('rm');
const lenis = initScroll();

/* ---------- opening ---------- */
const pre = document.querySelector<HTMLElement>('[data-preloader]');
const heroLines = $$('[data-hero-line]');
function enter(withSound: boolean) {
  if (!pre) return;
  if (withSound) { sound.set(true); setTimeout(() => sound.conch(), 350); }
  pre.classList.add('is-gone');
  document.body.classList.remove('is-gated');
  lenis?.start();
  if (!reduced) {
    gsap.from(heroLines, { yPercent: 60, opacity: 0, duration: 1.4, ease: 'expo.out', stagger: 0.09, delay: 0.25 });
    gsap.from('[data-hero-sub]', { opacity: 0, y: 20, duration: 1.2, ease: 'expo.out', delay: 0.7 });
  }
  setTimeout(() => pre.remove(), 1300);
  (document.querySelector('#h-nada') as HTMLElement)?.setAttribute('tabindex', '-1');
}
if (pre) {
  document.body.classList.add('is-gated');
  lenis?.stop();
  const status = $('[data-pre-status]', pre);
  const go = $('[data-pre-go]', pre);
  requestAnimationFrame(() => pre.classList.add('is-lit'));
  const firstFilm = $<HTMLVideoElement>('#nada video');
  const ready = Promise.race([
    Promise.all([
      document.fonts?.ready ?? Promise.resolve(),
      new Promise<void>((res) => {
        if (reduced) return res();
        firstFilm.addEventListener('loadeddata', () => res(), { once: true });
        firstFilm.addEventListener('error', () => res(), { once: true });
      }),
      new Promise((r) => setTimeout(r, 1500)),
    ]),
    new Promise((r) => setTimeout(r, 7000)),
  ]);
  ready.then(() => {
    status.textContent = 'The lamp is lit';
    go.classList.add('is-ready');
    go.querySelector<HTMLButtonElement>('button')?.focus({ preventScroll: true });
  });
  $$<HTMLButtonElement>('[data-enter]', pre).forEach((b) => b.addEventListener('click', () => enter(b.dataset.enter === 'sound')));
}

/* ---------- page tone follows the day as you scroll ---------- */
const toMin = (s: string) => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };
$$('section[data-tone]').forEach((ch) => {
  ScrollTrigger.create({
    trigger: ch, start: 'top 55%', end: 'bottom 55%',
    onToggle: (s) => { if (s.isActive) document.body.dataset.tone = ch.dataset.tone; },
  });
});
ScrollTrigger.create({ trigger: '.end', start: 'top 55%', onEnter: () => { document.body.dataset.tone = 'night'; } });
document.body.dataset.tone = 'night';

/* ---------- film chapters ---------- */
function film(id: string, onP: (p: number) => void, ease?: number) {
  const sec = document.getElementById(id)!;
  const v = sec.querySelector<HTMLVideoElement>('[data-scrub]');
  if (reduced) { onP(0); return; }
  let scrub: Scrub | null = null;
  const boot = () => { if (!scrub && v) scrub = new Scrub(v, ease); };
  // load the next film a screen ahead
  ScrollTrigger.create({ trigger: sec, start: 'top 250%', once: true, onEnter: boot });
  ScrollTrigger.create({
    trigger: sec, start: 'top top', end: 'bottom bottom',
    onUpdate: (s) => { boot(); scrub?.set(s.progress); onP(s.progress); },
  });
  onP(0);
}

// the lamp is lit
film('nada', (p) => {
  const copy = $('#nada .stage__copy');
  gsap.set(copy, { opacity: 1 - range(p, 0.55, 0.85), y: -60 * range(p, 0.55, 0.85) });
  gsap.set('[data-cue]', { opacity: 1 - range(p, 0, 0.06) });
  gsap.set('[data-hero-cap]', { opacity: 1 - range(p, 0.55, 0.85) });
});

// the sanctum doors
let conched = false;
// the doors part onto the idol: Nirmalyam darshan, then daylight
const NADA = { titleIn: [0.03, 0.12], titleOut: [0.24, 0.32], darshanIn: [0.56, 0.66], darshanOut: [0.9, 0.95], flood: [0.93, 1] };
let nadaBell = false;
film('doors', (p) => {
  gsap.set('#doors .stage__copy:not(.nirmalyam)', { opacity: range(p, ...NADA.titleIn as [number, number]) * (1 - range(p, ...NADA.titleOut as [number, number])), y: 30 * (1 - range(p, ...NADA.titleIn as [number, number])) });
  gsap.set('[data-nirmalyam]', { opacity: range(p, ...NADA.darshanIn as [number, number]) * (1 - range(p, ...NADA.darshanOut as [number, number])), y: 24 * (1 - range(p, ...NADA.darshanIn as [number, number])) });
  gsap.set('[data-flood]', { opacity: range(p, ...NADA.flood as [number, number]) });
  if (p > NADA.darshanIn[0] && !nadaBell) { nadaBell = true; sound.bell(0.4, 1); }
  if (p < 0.5) nadaBell = false;
  if (p > 0.12 && !conched) { conched = true; sound.conch(); }
  if (p < 0.02) conched = false;
});

// padi pooja: the climb
const climbStep = $('[data-climb-step]');
const climbIntro = $('[data-climb-intro]');
const nEl = $('[data-step-n]');
const nameEl = { kn: $('[data-step-name] [data-sc="kn"]'), te: $('[data-step-name] [data-sc="te"]') };
const enEl = { kn: $('[data-step-en] [data-sc="kn"]'), te: $('[data-step-en] [data-sc="te"]') };
const grpEl = { kn: $('[data-step-grp] [data-sc="kn"]'), te: $('[data-step-grp] [data-sc="te"]') };
const rail = $$('[data-rail] li');
let stepIdx = -1;
let emb: { start(): void; stop(): void; rise(p: number): void; intensity(v: number): void } | null = null;
function setStep(i: number) {
  if (i === stepIdx) return;
  const up = i > stepIdx;
  stepIdx = i;
  nEl.textContent = pad(i + 1);
  // each language follows its own published list of the eighteen steps
  for (const k of ['kn', 'te'] as const) {
    nameEl[k].textContent = stairs[k].steps[i][0];
    enEl[k].textContent = stairs[k].steps[i][1];
    const gr = stairGroup(k, i);
    grpEl[k].innerHTML = `<span lang="${k}" class="sc">${gr.sc}</span> · ${gr.en}`;
  }
  rail.forEach((li, j) => li.classList.toggle('on', j <= i));
  if (!reduced) gsap.fromTo([nEl, $('[data-step-name]'), $('[data-step-en]')], { y: up ? 18 : -18, opacity: 0.2 }, { y: 0, opacity: 1, duration: 0.5, ease: 'expo.out', stagger: 0.03, overwrite: true });
  sound.bell(0.22, 0.85 + i * 0.025);
}
// the steps are counted on the way up; at the top the film enters the sanctum
const CLIMB = { stepsFrom: 0.1, stepsTo: 0.5, stepOut: [0.5, 0.55], darshanIn: [0.68, 0.76], chorusIn: [0.82, 0.92] };
let darshanBell = false;
film('climb', (p) => {
  gsap.set(climbIntro, { opacity: 1 - range(p, 0.03, 0.1), y: -40 * range(p, 0.03, 0.1) });
  const s = range(p, 0.08, 0.13) * (1 - range(p, CLIMB.stepOut[0], CLIMB.stepOut[1]));
  gsap.set(climbStep, { opacity: s, y: 24 * (1 - range(p, 0.08, 0.13)) });
  const i = Math.min(17, Math.max(0, Math.floor(range(p, CLIMB.stepsFrom, CLIMB.stepsTo) * 18)));
  if (p > 0.09) setStep(i); else if (stepIdx !== -1) { stepIdx = -1; rail.forEach((li) => li.classList.remove('on')); }
  gsap.set('[data-rail]', { opacity: 1 - range(p, CLIMB.stepOut[0], CLIMB.stepOut[1]) });
  // the caption gives way to the chant in the same place, so nothing covers the lamp before the idol
  gsap.set('[data-darshan-copy]', { opacity: range(p, CLIMB.darshanIn[0], CLIMB.darshanIn[1]) * (1 - range(p, CLIMB.chorusIn[0] - 0.03, CLIMB.chorusIn[0] + 0.03)), y: 30 * (1 - range(p, CLIMB.darshanIn[0], CLIMB.darshanIn[1])) });
  gsap.set('[data-darshan-chorus]', { opacity: range(p, CLIMB.chorusIn[0], CLIMB.chorusIn[1]), y: 30 * (1 - range(p, CLIMB.chorusIn[0], CLIMB.chorusIn[1])) });
  if (p > CLIMB.darshanIn[0] && !darshanBell) { darshanBell = true; sound.bell(0.4, 1); }
  if (p < CLIMB.stepOut[0]) darshanBell = false;
  emb?.rise(p);
  emb?.intensity(1 - range(p, CLIMB.stepOut[0], CLIMB.darshanIn[1]) * 0.75);
}, 0.1);
if (!reduced) {
  ScrollTrigger.create({
    trigger: '#climb', start: 'top bottom', end: 'bottom top',
    onToggle: async (s) => {
      if (s.isActive) {
        if (!emb) { const m = await import('./embers'); emb = m.embers($<HTMLCanvasElement>('[data-embers]')); }
        emb.start();
      } else emb?.stop();
    },
  });
}

// Harivarasanam: every lamp stays lit
film('hari', () => {});

/* ---------- looping films: load near view, play only while visible ---------- */
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    const v = e.target as HTMLVideoElement;
    if (e.isIntersecting) {
      if (!v.src) { const small = innerWidth < 760; v.src = (small && v.dataset.srcM) || v.dataset.src || ''; }
      if (!reduced) v.play().catch(() => {});
    } else v.pause();
  });
}, { rootMargin: '25% 0px' });
$$<HTMLVideoElement>('[data-loop]').forEach((v) => io.observe(v));

/* ---------- kolam: drawn at the threshold every dawn ---------- */
(function kolam() {
  const svg = $<SVGSVGElement>('[data-kolam]');
  const NS = 'http://www.w3.org/2000/svg';
  const g = document.createElementNS(NS, 'g');
  const n = 6, step = 80, off = 100;
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const c = document.createElementNS(NS, 'circle');
    c.setAttribute('cx', String(off + x * step)); c.setAttribute('cy', String(off + y * step)); c.setAttribute('r', '3.2');
    c.setAttribute('fill', 'currentColor'); g.appendChild(c);
  }
  // A sikku kolam: one unbroken line that loops around every dot. Traced as a
  // light ray bouncing inside a grid of dots (gcd(cols, rows) = 1 keeps it one line),
  // then smoothed so each bounce becomes a loop around the edge dot.
  g.replaceChildren();
  const cols = 5, rows = 6, u = 600 / (2 * Math.max(cols, rows) + 2);
  const ox = (600 - 2 * cols * u) / 2, oy = (600 - 2 * rows * u) / 2;
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
    const c = document.createElementNS(NS, 'circle');
    c.setAttribute('cx', String(ox + (2 * x + 1) * u)); c.setAttribute('cy', String(oy + (2 * y + 1) * u)); c.setAttribute('r', '3.4');
    c.setAttribute('fill', 'currentColor'); g.appendChild(c);
  }
  const pts: [number, number][] = [];
  let px = 0, py = 1, dx = 1, dy = 1;
  do {
    pts.push([px, py]);
    px += dx; py += dy;
    if (px === 0 || px === 2 * cols) dx = -dx;
    if (py === 0 || py === 2 * rows) dy = -dy;
  } while (!(px === 0 && py === 1 && dx === 1 && dy === 1) && pts.length < 2000);
  // pull wall points outward a little so the loops round the edge dots
  const P = pts.map(([x, y]) => {
    let X = x, Y = y;
    if (x === 0) X = -0.35; else if (x === 2 * cols) X = 2 * cols + 0.35;
    if (y === 0) Y = -0.35; else if (y === 2 * rows) Y = 2 * rows + 0.35;
    return [ox + X * u, oy + Y * u] as [number, number];
  });
  const n0 = P.length;
  let d = `M${P[0][0].toFixed(1)} ${P[0][1].toFixed(1)}`;
  for (let k = 0; k < n0; k++) {
    const p0 = P[(k - 1 + n0) % n0], p1 = P[k], p2 = P[(k + 1) % n0], p3 = P[(k + 2) % n0];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  const path = document.createElementNS(NS, 'path');
  path.setAttribute('d', d); path.setAttribute('fill', 'none'); path.setAttribute('stroke', 'currentColor');
  path.setAttribute('stroke-width', '1.6'); path.setAttribute('stroke-linecap', 'round'); path.setAttribute('stroke-linejoin', 'round');
  const T = 'translate(300 300) rotate(45) scale(.74) translate(-300 -300)';
  path.setAttribute('transform', T); g.setAttribute('transform', T);
  svg.appendChild(path); svg.appendChild(g);
  const len = path.getTotalLength();
  path.style.strokeDasharray = `${len}`;
  if (reduced) { path.style.strokeDashoffset = '0'; return; }
  path.style.strokeDashoffset = `${len}`;
  gsap.to(path, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: '#temple', start: 'top 85%', end: 'center 30%', scrub: 0.6 } });
  gsap.from(g.children, { scale: 0, transformOrigin: 'center', opacity: 0, stagger: { each: 0.015, from: 'center' }, duration: 0.6, ease: 'back.out(2)', scrollTrigger: { trigger: '#temple', start: 'top 80%', once: true } });
})();

/* ---------- collage parallax ---------- */
if (!reduced) {
  $$('[data-speed]').forEach((el) => {
    const s = parseFloat(el.dataset.speed || '0');
    gsap.fromTo(el, { y: () => -s * innerHeight }, { y: () => s * innerHeight, ease: 'none', scrollTrigger: { trigger: '.collage', start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true } });
  });
}

/* ---------- today at the temple (IST) ---------- */
function istNow() {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
  const h = +parts.find((p) => p.type === 'hour')!.value, m = +parts.find((p) => p.type === 'minute')!.value;
  return h * 60 + m;
}
const forceTime = new URLSearchParams(location.search).get('t'); // e.g. ?t=19:00 for testing
function updateToday() {
  const now = forceTime ? toMin(forceTime) : istNow();
  const rows = $$('[data-sched] li');
  const items = rows.map((r) => ({ r, at: +r.dataset.at!, dur: +r.dataset.dur!, id: r.dataset.id!, name: r.dataset.name || '' }));
  // the temple is open all day during the season
  const open = openAllDay;
  const nowItem = items.find((x) => x.dur > 0 && now >= x.at && now < x.at + x.dur);
  let next = items.find((x) => x.at > now);
  const tomorrow = !next;
  if (!next) next = items[0];
  rows.forEach((r) => r.classList.remove('is-now', 'is-next', 'is-past'));
  items.forEach((x) => { if (!tomorrow && x.at + Math.max(x.dur, 1) <= now) x.r.classList.add('is-past'); });
  nowItem?.r.classList.add('is-now');
  next.r.classList.add('is-next');
  const status = nowItem ? `${nowItem.name} is happening now` : open ? 'The temple is open' : 'The temple is closed';
  $('[data-status]').classList.toggle('is-closed', !open);
  $('[data-now-status]').classList.toggle('is-closed', !open);
  $('[data-status-text]').textContent = status;
  $('[data-now-status-text]').textContent = status;
  let diff = next.at - now; if (diff <= 0) diff += 1440;
  const h = Math.floor(diff / 60), m = diff % 60;
  const when = h ? `${h} h ${pad(m)} min` : `${m} min`;
  $('[data-next]').innerHTML = `Next: <b>${next.name}</b> ${tomorrow ? 'tomorrow, ' : ''}in <b class="num">${when}</b>`;
  $('[data-now-next]').innerHTML = `Next: <b>${next.name}</b> ${tomorrow ? 'tomorrow ' : ''}at <b class="num">${pad(Math.floor(next.at / 60))}:${pad(next.at % 60)}</b>, in <b class="num">${when}</b>`;
}
updateToday();
setInterval(updateToday, 30000);

/* ---------- maala dharana: each swamy's own day of 41, and the countdown to Mandala pooja darshan ---------- */
(function mala() {
  const box = $('[data-vratham]');
  const beads = $('[data-beads]');
  const input = $<HTMLInputElement>('[data-mala-date]');
  const txt = $('[data-vratham-txt]');
  const days = +box.dataset.days!;
  const DAY = 86400000;
  for (let i = 0; i < days; i++) beads.appendChild(document.createElement('i'));
  const istToday = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date()); // YYYY-MM-DD
  const at = (d: string) => new Date(d + 'T00:00:00+05:30').getTime();
  const fmtDay = (ms: number) => new Intl.DateTimeFormat('en-IN', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Asia/Kolkata' }).format(ms);
  const KEY = 'kodathi-mala-date';
  input.max = istToday();
  try { const saved = localStorage.getItem(KEY); if (saved) input.value = saved; } catch { /* storage blocked */ }
  function draw() {
    const list = beads.children;
    const v = input.value;
    if (!v) {
      for (let i = 0; i < days; i++) list[i].className = '';
      txt.textContent = 'Enter the day you took the mala to see your day of 41.';
      return;
    }
    const d = Math.floor((at(istToday()) - at(v)) / DAY) + 1;
    for (let i = 0; i < days; i++) list[i].className = i < d - 1 ? 'on' : i === d - 1 ? 'today' : '';
    const last = at(v) + (days - 1) * DAY;
    if (d < 1) txt.textContent = 'That day is still to come. Enter the day you took the mala.';
    else if (d < days) txt.textContent = `Day ${d} of ${days}. Your 41 days complete on ${fmtDay(last)}.`;
    else if (d === days) txt.textContent = 'Today is day 41, the last day of your deeksha. Swamiye Sharanam Ayyappa.';
    else txt.textContent = `Your 41 days completed on ${fmtDay(last)}. Swamiye Sharanam Ayyappa.`;
  }
  input.addEventListener('change', () => {
    try {
      if (input.value) localStorage.setItem(KEY, input.value);
      else localStorage.setItem(KEY, '');
    } catch { /* storage blocked */ }
    draw();
  });
  draw();

  const mk = $('[data-makara]');
  const mkAt = new Date(mk.dataset.at!).getTime();
  function tick() {
    let ms = Math.max(0, mkAt - Date.now());
    const dd = Math.floor(ms / DAY); ms -= dd * DAY;
    const hh = Math.floor(ms / 3600000); ms -= hh * 3600000;
    const mm = Math.floor(ms / 60000);
    $('[data-mk="d"]', mk).textContent = String(dd);
    $('[data-mk="h"]', mk).textContent = pad(hh);
    $('[data-mk="m"]', mk).textContent = pad(mm);
  }
  tick(); setInterval(tick, 30000);
  if (!reduced) gsap.from(beads.children, { scale: 0, opacity: 0, stagger: 0.02, duration: 0.5, ease: 'back.out(2)', scrollTrigger: { trigger: box, start: 'top 85%', once: true } });
})();

/* ---------- coming up: the next dated events, with days to go ---------- */
(function upcoming() {
  const today = new Date(new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date()) + 'T00:00:00+05:30').getTime();
  let shown = 0;
  const soon: HTMLElement[] = [];
  $$('[data-up-date]').forEach((row) => {
    const at = new Date(row.dataset.upDate + 'T00:00:00+05:30').getTime();
    const left = Math.round((at - today) / 86400000);
    if (left < 0 || shown >= 3) return;
    shown++;
    row.hidden = false;
    $('[data-up-in]', row).textContent = left === 0 ? 'Today' : left === 1 ? 'Tomorrow' : `In ${left} days`;
    // today's and tomorrow's events are highlighted and lead the list
    if (left <= 1) { row.classList.add('is-soon'); soon.push(row); }
  });
  soon.reverse().forEach((r) => r.parentElement!.prepend(r));
})();

/* ---------- offerings accordion ---------- */
$$<HTMLButtonElement>('.acc__btn').forEach((b) => {
  b.addEventListener('click', () => {
    const open = b.getAttribute('aria-expanded') === 'true';
    $$<HTMLButtonElement>('.acc__btn').forEach((o) => { o.setAttribute('aria-expanded', 'false'); document.getElementById(o.getAttribute('aria-controls')!)!.hidden = true; });
    if (!open) {
      b.setAttribute('aria-expanded', 'true');
      const panel = document.getElementById(b.getAttribute('aria-controls')!)!;
      panel.hidden = false;
      if (!reduced) gsap.from(panel.children, { y: 12, opacity: 0, duration: 0.5, stagger: 0.05, ease: 'expo.out' });
    }
    ScrollTrigger.refresh();
  });
});

/* ---------- gallery videos: play muted while in view, one at a time with sound ---------- */
(function galleryVideos() {
  const vids = $$<HTMLVideoElement>('[data-gal-video]');
  function setMuted(v: HTMLVideoElement, muted: boolean) {
    v.muted = muted;
    const b = v.parentElement!.querySelector<HTMLButtonElement>('[data-gal-sound]')!;
    b.setAttribute('aria-pressed', String(!muted));
    b.querySelector('[data-gal-label]')!.textContent = muted ? 'Play with sound' : 'Mute';
    sound.duck(vids.every((x) => x.muted) ? 0.55 : 0.04);
  }
  const watch = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      const v = e.target as HTMLVideoElement;
      if (e.isIntersecting) { if (!v.src) v.src = v.dataset.src || ''; if (!reduced) v.play().catch(() => {}); }
      else { v.pause(); if (!v.muted) setMuted(v, true); }
    });
  }, { rootMargin: '10% 0px' });
  vids.forEach((v) => watch.observe(v));
  $$<HTMLButtonElement>('[data-gal-sound]').forEach((b) => {
    const v = b.parentElement!.querySelector<HTMLVideoElement>('video')!;
    b.addEventListener('click', () => {
      if (!v.src) v.src = v.dataset.src || '';
      const turnOn = v.muted;
      vids.forEach((x) => { if (x !== v && !x.muted) setMuted(x, true); });
      setMuted(v, !turnOn);
      if (turnOn) { v.currentTime = 0; v.play().catch(() => {}); }
    });
  });
})();

/* ---------- chorus swells with the chant ---------- */
(function chorus() {
  const layers = $$('[data-chorus]');
  let amp = 0;
  gsap.ticker.add(() => {
    const target = sound.level();
    amp += (target - amp) * 0.12;
    if (amp < 0.002 && target === 0) amp = 0;
    layers.forEach((l) => l.style.setProperty('--amp', amp.toFixed(3)));
  });
})();

/* ---------- sharanam vili: call and response ---------- */
(function vili() {
  const sec = document.getElementById('vili')!;
  const btn = $<HTMLButtonElement>('[data-call]', sec);
  const callEl = $('[data-call-text]', sec);
  const ansEl = $('[data-answer-text]', sec);
  const nextEl = $('[data-call-next]', sec);
  const countEl = $('[data-call-count]', sec);
  const canvas = $<HTMLCanvasElement>('[data-burst]', sec);
  const ctx = canvas.getContext('2d')!;
  type P = { x: number; y: number; vx: number; vy: number; s: number; a: number; t: string; r: number };
  let parts: P[] = [];
  let raf = 0, k = 0, calls = 0, busy = false, callSeq = 0;
  let current: { stop: (fade?: number) => void } | null = null;

  ScrollTrigger.create({ trigger: sec, start: 'top 200%', once: true, onEnter: () => sound.warm() });

  // the litany bands drift, faster with scroll speed
  const bands = $$('[data-band]', sec).map((el) => ({ span: el.firstElementChild as HTMLElement, f: parseFloat(el.dataset.band || '1'), x: 0 }));
  let inView = false;
  ScrollTrigger.create({ trigger: sec, start: 'top bottom', end: 'bottom top', onToggle: (st) => { inView = st.isActive; } });
  if (!reduced) gsap.ticker.add(() => {
    if (!inView) return;
    const v = Math.abs(getLenis()?.velocity ?? 0);
    bands.forEach((b) => {
      const w = b.span.scrollWidth / 2 || 1;
      b.x -= b.f * (0.5 + v * 0.6);
      if (b.x <= -w) b.x += w;
      if (b.x > 0) b.x -= w;
      b.span.style.transform = `translate3d(${b.x}px,0,0)`;
    });
  });

  function size() {
    const r = canvas.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio, 2);
    canvas.width = r.width * dpr; canvas.height = r.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function burst(n = innerWidth < 760 ? 70 : 140) {
    size();
    const r = canvas.getBoundingClientRect();
    for (let i = 0; i < n; i++) {
      parts.push({
        x: r.width * (0.15 + Math.random() * 0.7), y: r.height * (0.6 + Math.random() * 0.45),
        vx: (Math.random() - 0.5) * 0.9, vy: -(1.2 + Math.random() * 2.6),
        s: 14 + Math.random() * (innerWidth < 760 ? 22 : 40), a: 0, t: i % 2 ? temple.response[script()] : temple.response.en, r: (Math.random() - 0.5) * 0.25,
      });
    }
    if (!raf) raf = requestAnimationFrame(draw);
  }
  function draw() {
    const r = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, r.width, r.height);
    parts = parts.filter((p) => p.y > -60 && p.a > -1);
    for (const p of parts) {
      p.x += p.vx; p.y += p.vy; p.vy *= 0.992;
      p.a = p.a < 1 && p.vy < -0.4 ? Math.min(1, p.a + 0.06) : p.a - 0.012;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r);
      ctx.globalAlpha = Math.max(0, p.a) * 0.85;
      ctx.font = `${p.s}px "Tiro Kannada","Tiro Telugu",Georgia,serif`;
      ctx.fillStyle = p.s > 34 ? '#ffd690' : '#ffc46a';
      ctx.shadowColor = 'rgba(255,170,60,.6)'; ctx.shadowBlur = 12;
      ctx.fillText(p.t, -ctx.measureText(p.t).width / 2, 0);
      ctx.restore();
    }
    raf = parts.length ? requestAnimationFrame(draw) : 0;
    if (!raf) ctx.clearRect(0, 0, r.width, r.height);
  }
  function show(v: { en: string; kn: string; te: string }) {
    callEl.querySelector('[lang="en"]')!.textContent = v.en;
    callEl.querySelector('[data-sc="kn"]')!.textContent = v.kn;
    callEl.querySelector('[data-sc="te"]')!.textContent = v.te;
  }
  btn.addEventListener('click', async () => {
    if (busy) return;
    busy = true;
    const i = k % temple.vili.length;
    const v = temple.vili[i];
    k++;
    nextEl.textContent = temple.vili[k % temple.vili.length].en;
    if (!sound.on) sound.set(true);
    show(v);
    btn.classList.add('is-calling');
    if (!reduced) gsap.fromTo(callEl, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out' });
    // each name has its own recording: the lead calls it, the chorus answers
    await Promise.race([sound.need(`vili-${i}`), new Promise((res) => setTimeout(res, 2500))]);
    sound.duck(0.08, 0.4);
    // let the previous caller's voice go before the next name is called
    current?.stop(0.25);
    current = sound.voice(`vili-${i}`, 1);
    await new Promise((res) => setTimeout(res, v.answerAt * 1000));
    if (!reduced) {
      gsap.fromTo(ansEl, { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(2)' });
      gsap.to(ansEl, { opacity: 0, duration: 1.2, delay: 2.2, ease: 'power2.in' });
      burst();
    } else ansEl.style.opacity = '1';
    calls++;
    countEl.textContent = calls === 1 ? 'The chorus answered. Call again with the next name.' : `You have called ${calls} times. Swamiye Sharanam.`;
    setTimeout(() => { btn.classList.remove('is-calling'); busy = false; }, 1400);
    const id = ++callSeq;
    setTimeout(() => { if (id === callSeq) sound.duck(0.55, 1.5); }, (7.2 - v.answerAt) * 1000);
  });
})();

initReveals();
window.addEventListener('load', () => ScrollTrigger.refresh());
(window as any).__kodathi = { lenis: getLenis, ScrollTrigger };
