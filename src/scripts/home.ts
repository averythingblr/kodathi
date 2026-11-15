// Home page: one temple day, scroll as time.
import { gsap, ScrollTrigger, initScroll, initReveals, reduced, sound, getLenis } from './core';
import { Scrub } from './scrub';
import { steps, stepGroup, temple } from '../data/temple';

const $ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => r.querySelector<T>(s)!;
const $$ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => Array.from(r.querySelectorAll<T>(s));
const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const range = (p: number, a: number, b: number) => clamp((p - a) / (b - a));
const pad = (n: number) => String(n).padStart(2, '0');

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

/* ---------- tone + temple clock ---------- */
const clockT = $('[data-clock-t]');
const clockS = $('[data-clock-s]');
const toMin = (s: string) => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };
const chapters = $$('[data-time]');
chapters.forEach((ch, i) => {
  const a = toMin(ch.dataset.time!);
  const b = chapters[i + 1] ? toMin(chapters[i + 1].dataset.time!) : a + 30;
  ScrollTrigger.create({
    trigger: ch, start: 'top 55%', end: 'bottom 55%',
    onToggle: (s) => { if (s.isActive) { document.body.dataset.tone = ch.dataset.tone; clockS.textContent = ch.dataset.scene || ''; } },
    onUpdate: (s) => { const mm = Math.round(a + (b - a) * s.progress); clockT.textContent = `${pad(Math.floor(mm / 60))}:${pad(mm % 60)}`; },
  });
});
ScrollTrigger.create({ trigger: '.end', start: 'top 55%', onEnter: () => { document.body.dataset.tone = 'night'; }, onLeaveBack: () => {} });
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

// 04:30 lamps
film('nada', (p) => {
  const copy = $('#nada .stage__copy');
  gsap.set(copy, { opacity: 1 - range(p, 0.55, 0.85), y: -60 * range(p, 0.55, 0.85) });
  gsap.set('[data-cue]', { opacity: 1 - range(p, 0, 0.06) });
});

// 05:00 doors
let conched = false;
film('doors', (p) => {
  gsap.set('[data-doors-h], [data-doors-p]', { opacity: range(p, 0.08, 0.24) * (1 - range(p, 0.62, 0.76)), y: 30 * (1 - range(p, 0.08, 0.24)) });
  gsap.set('[data-flood]', { opacity: range(p, 0.74, 0.98) });
  if (p > 0.12 && !conched) { conched = true; sound.conch(); }
  if (p < 0.02) conched = false;
});

// 19:30 climb
const climbStep = $('[data-climb-step]');
const climbIntro = $('[data-climb-intro]');
const nEl = $('[data-step-n]'), nameEl = $('[data-step-name]'), skEl = $('[data-step-sk]'), grpEl = $('[data-step-grp]');
const rail = $$('[data-rail] li');
const summit = $('[data-summit]');
let stepIdx = -1;
let emb: { start(): void; stop(): void; rise(p: number): void; intensity(v: number): void } | null = null;
function setStep(i: number) {
  if (i === stepIdx) return;
  const up = i > stepIdx;
  stepIdx = i;
  nEl.textContent = pad(i + 1);
  nameEl.textContent = steps[i].n;
  skEl.textContent = steps[i].s;
  grpEl.textContent = stepGroup(i);
  rail.forEach((li, j) => li.classList.toggle('on', j <= i));
  if (!reduced) gsap.fromTo([nEl, nameEl, skEl], { y: up ? 18 : -18, opacity: 0.2 }, { y: 0, opacity: 1, duration: 0.5, ease: 'expo.out', stagger: 0.03, overwrite: true });
  sound.bell(0.22, 0.85 + i * 0.025);
}
film('climb', (p) => {
  gsap.set(climbIntro, { opacity: 1 - range(p, 0.03, 0.1), y: -40 * range(p, 0.03, 0.1) });
  const s = range(p, 0.08, 0.13) * (1 - range(p, 0.88, 0.93));
  gsap.set(climbStep, { opacity: s, y: 24 * (1 - range(p, 0.08, 0.13)) });
  const i = Math.min(17, Math.max(0, Math.floor(range(p, 0.1, 0.88) * 18)));
  if (p > 0.09) setStep(i); else if (stepIdx !== -1) { stepIdx = -1; rail.forEach((li) => li.classList.remove('on')); }
  gsap.set(summit, { opacity: range(p, 0.9, 0.98) });
  emb?.rise(p);
  emb?.intensity(1 - range(p, 0.9, 1) * 0.8);
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

// 21:00 lamps go out; the chant fades with them
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
  const items = rows.map((r) => ({ r, at: +r.dataset.at!, dur: +r.dataset.dur!, id: r.dataset.id!, name: $('.sched__n', r).childNodes[0].textContent || '' }));
  const open = (now >= toMin('04:30') && now < toMin('12:30')) || (now >= toMin('17:00') && now < toMin('21:00'));
  const nowItem = items.find((x) => x.dur > 0 && now >= x.at && now < x.at + x.dur);
  let next = items.find((x) => x.at > now);
  const tomorrow = !next;
  if (!next) next = items[0];
  rows.forEach((r) => r.classList.remove('is-now', 'is-next', 'is-past'));
  items.forEach((x) => { if (!tomorrow && x.at + Math.max(x.dur, 1) <= now) x.r.classList.add('is-past'); });
  nowItem?.r.classList.add('is-now');
  next.r.classList.add('is-next');
  const st = $('[data-status]');
  st.classList.toggle('is-closed', !open);
  $('[data-status-text]').textContent = nowItem ? `${nowItem.name} is happening now` : open ? 'The nada is open' : 'The nada is closed';
  let diff = next.at - now; if (diff <= 0) diff += 1440;
  const h = Math.floor(diff / 60), m = diff % 60;
  const when = h ? `${h} h ${pad(m)} min` : `${m} min`;
  $('[data-next]').innerHTML = `Next: <b>${next.name}</b> ${tomorrow ? 'tomorrow, ' : ''}in <b class="num">${when}</b>`;
}
updateToday();
setInterval(updateToday, 30000);

/* ---------- Mandala vratham beads + Makaravilakku countdown ---------- */
(function mandala() {
  const box = $('[data-vratham]');
  const beads = $('[data-beads]');
  const days = +box.dataset.days!;
  const start = new Date(box.dataset.start + 'T00:00:00+05:30').getTime();
  for (let i = 0; i < days; i++) beads.appendChild(document.createElement('i'));
  const DAY = 86400000;
  const txt = $('[data-vratham-txt]');
  const mk = $('[data-makara]');
  const mkAt = new Date(mk.dataset.at!).getTime();
  const fmtDate = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'long', timeZone: 'Asia/Kolkata' }).format(start);
  function tick() {
    const now = Date.now();
    const d = Math.floor((now - start) / DAY) + 1;
    const list = beads.children;
    for (let i = 0; i < days; i++) { list[i].className = i < d - 1 ? 'on' : i === d - 1 ? 'today' : ''; }
    if (d < 1) { const left = Math.ceil((start - now) / DAY); txt.textContent = `The season begins on ${fmtDate}, in ${left} day${left === 1 ? '' : 's'}. Wear the mala from that morning.`; }
    else if (d <= days) txt.textContent = `Day ${d} of ${days} of the vratham.`;
    else txt.textContent = 'This year’s Mandala season is complete.';
    let ms = Math.max(0, mkAt - now);
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

/* ---------- our padi pooja, real footage ---------- */
(function real() {
  const frame = $('[data-real-frame]');
  const v = $<HTMLVideoElement>('[data-real]');
  const btn = $<HTMLButtonElement>('[data-real-sound]');
  const lbl = $('[data-real-label]');
  new IntersectionObserver(([e]) => { if (e.isIntersecting) { v.preload = 'auto'; v.play().catch(() => {}); } else { v.pause(); } }, { threshold: 0.2 }).observe(frame);
  if (!reduced) {
    gsap.to(frame, { clipPath: 'inset(0% 0% 0% 0% round 6px)', ease: 'none', scrollTrigger: { trigger: '#ours', start: 'top 85%', end: 'center 55%', scrub: 0.5 } });
    gsap.fromTo('[data-numerals]', { yPercent: -30 }, { yPercent: 30, ease: 'none', scrollTrigger: { trigger: '#ours', start: 'top bottom', end: 'bottom top', scrub: true } });
  }
  btn.addEventListener('click', () => {
    const on = v.muted;
    v.muted = !on;
    if (on) { v.currentTime = 0; v.play().catch(() => {}); sound.duck(0.04); lbl.textContent = 'Mute'; }
    else { sound.duck(0.55); lbl.textContent = 'Play with sound'; }
  });
})();

/* ---------- darshan ---------- */
let darshanBell = false;
film('darshan', (p) => {
  gsap.set('[data-darshan-copy]', { opacity: range(p, 0.05, 0.22) * (1 - range(p, 0.6, 0.72)), y: 30 * (1 - range(p, 0.05, 0.22)) });
  gsap.set('[data-darshan-chorus]', { opacity: range(p, 0.62, 0.8), y: 40 * (1 - range(p, 0.62, 0.8)) });
  if (p > 0.65 && !darshanBell) { darshanBell = true; sound.bell(0.35, 1); }
  if (p < 0.5) darshanBell = false;
});

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
  const words = [temple.response.kn, temple.response.te, temple.response.en];
  type P = { x: number; y: number; vx: number; vy: number; s: number; a: number; t: string; r: number };
  let parts: P[] = [];
  let raf = 0, k = 0, calls = 0, busy = false;

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
        s: 14 + Math.random() * (innerWidth < 760 ? 22 : 40), a: 0, t: words[i % 3], r: (Math.random() - 0.5) * 0.25,
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
    if (!sound.on) sound.set(true);
    const v = temple.vili[k % temple.vili.length];
    show(v);
    btn.classList.add('is-calling');
    if (!reduced) gsap.fromTo(callEl, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out' });
    sound.duck(0.12, 0.4);
    const d = sound.play(k % 2 ? 'call2' : 'call', 1) || 1.4;
    await new Promise((res) => setTimeout(res, Math.min(d, 2.6) * 780));
    sound.play('answer', 1);
    if (!reduced) {
      gsap.fromTo(ansEl, { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(2)' });
      gsap.to(ansEl, { opacity: 0, duration: 1.2, delay: 2.2, ease: 'power2.in' });
      burst();
    } else ansEl.style.opacity = '1';
    calls++; k++;
    nextEl.textContent = temple.vili[k % temple.vili.length].en;
    countEl.textContent = calls === 1 ? 'The chorus answered. Call again with the next name.' : `You have called ${calls} times. Swamiye Sharanam.`;
    setTimeout(() => { btn.classList.remove('is-calling'); busy = false; }, 900);
    setTimeout(() => sound.duck(0.55, 1.5), 3800);
  });
})();

initReveals();
window.addEventListener('load', () => ScrollTrigger.refresh());
(window as any).__kodathi = { lenis: getLenis, ScrollTrigger };
