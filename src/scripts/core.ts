// Shared runtime: smooth scroll, ScrollTrigger wiring, menu, sound.
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const finePointer = window.matchMedia('(pointer: fine)').matches;

let lenis: Lenis | null = null;

export function initScroll() {
  if (reduced) return null;
  lenis = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis?.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  // anchor links glide
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href')!;
      if (id.length < 2) return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      lenis?.scrollTo(el as HTMLElement, { offset: 0, duration: 1.6 });
    });
  });
  return lenis;
}
export const getLenis = () => lenis;

/* ---------------- sound ---------------- */
type Sound = {
  on: boolean;
  toggle: () => void;
  set: (v: boolean) => void;
  bell: (vol?: number, rate?: number) => void;
  conch: () => void;
  duck: (to: number, secs?: number) => void;
  subscribe: (fn: (on: boolean) => void) => void;
  /** play a named sample; returns its duration in seconds (0 when silent) */
  play: (name: string, vol?: number) => number;
  /** play a named sample that can be stopped early with a short fade */
  voice: (name: string, vol?: number) => { dur: number; stop: (fade?: number) => void };
  /** create the audio graph and fetch samples ahead of the first gesture */
  warm: () => void;
  /** resolve once a sample is decoded (or failed) */
  need: (name: string) => Promise<void>;
  /** 0..1 loudness of everything playing, for visuals */
  level: () => number;
};

function makeSound(): Sound {
  const base = (document.body.dataset.base || '/').replace(/\/?$/, '/');
  let ctx: AudioContext | null = null;
  let master: GainNode | null = null;
  let chantGain: GainNode | null = null;
  let chantEl: HTMLAudioElement | null = null;
  let analyser: AnalyserNode | null = null;
  let bins: Uint8Array<ArrayBuffer> | null = null;
  const buffers: Record<string, AudioBuffer> = {};
  const subs: ((on: boolean) => void)[] = [];
  const state = { on: false };

  const loading: Record<string, Promise<void>> = {};
  function load(name: string): Promise<void> {
    if (!ctx) return Promise.resolve();
    if (!loading[name]) loading[name] = (async () => {
      try {
        const r = await fetch(`${base}media/audio/${name}.mp3`);
        buffers[name] = await ctx!.decodeAudioData(await r.arrayBuffer());
      } catch { /* missing sample: stay silent */ }
    })();
    return loading[name];
  }
  function ensure() {
    if (ctx) return;
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
    analyser = ctx.createAnalyser(); analyser.fftSize = 256; analyser.smoothingTimeConstant = 0.8;
    bins = new Uint8Array(analyser.frequencyBinCount);
    master.connect(analyser);
    chantGain = ctx.createGain(); chantGain.gain.value = 0.55; chantGain.connect(master);
    chantEl = new Audio(`${base}media/audio/chant.mp3`);
    chantEl.loop = true; chantEl.crossOrigin = 'anonymous'; chantEl.preload = 'auto';
    ctx.createMediaElementSource(chantEl).connect(chantGain);
    ['bell', 'conch', 'vili-0', 'vili-1', 'vili-2', 'vili-3', 'vili-4'].forEach(load);
  }
  function set(v: boolean) {
    ensure();
    state.on = v;
    const t = ctx!.currentTime;
    if (v) { ctx!.resume(); chantEl!.play().catch(() => {}); }
    master!.gain.cancelScheduledValues(t);
    master!.gain.setTargetAtTime(v ? 1 : 0, t, v ? 0.6 : 0.25);
    if (!v) setTimeout(() => { if (!state.on) chantEl!.pause(); }, 1200);
    document.documentElement.classList.toggle('sound-on', v);
    try { sessionStorage.setItem('kodathi-sound', v ? '1' : '0'); } catch {}
    subs.forEach((f) => f(v));
  }
  function start(name: string, vol = 0.6, rate = 1) {
    if (!state.on || !ctx || !buffers[name]) return null;
    const s = ctx.createBufferSource(); s.buffer = buffers[name]; s.playbackRate.value = rate;
    const g = ctx.createGain(); g.gain.value = vol; s.connect(g).connect(master!); s.start();
    return { s, g, dur: buffers[name].duration / rate };
  }
  function play(name: string, vol = 0.6, rate = 1) {
    return start(name, vol, rate)?.dur ?? 0;
  }
  /** a voice that can be let go: fades out over `fade` seconds, then stops */
  function voice(name: string, vol = 0.9) {
    const v = start(name, vol);
    return {
      dur: v?.dur ?? 0,
      stop(fade = 0.25) {
        if (!v || !ctx) return;
        const t = ctx.currentTime;
        v.g.gain.cancelScheduledValues(t);
        v.g.gain.setValueAtTime(v.g.gain.value, t);
        v.g.gain.linearRampToValueAtTime(0, t + fade);
        try { v.s.stop(t + fade + 0.02); } catch { /* already stopped */ }
      },
    };
  }
  function level() {
    if (!analyser || !bins || !state.on) return 0;
    analyser.getByteFrequencyData(bins);
    let sum = 0; for (let i = 2; i < 40; i++) sum += bins[i];
    return Math.min(1, sum / (38 * 170));
  }
  return {
    get on() { return state.on; },
    toggle: () => set(!state.on),
    set,
    bell: (vol = 0.35, rate = 1) => play('bell', vol, rate),
    conch: () => play('conch', 0.7),
    duck: (to, secs = 0.8) => { if (chantGain && ctx) chantGain.gain.setTargetAtTime(to, ctx.currentTime, secs / 3); },
    subscribe: (fn) => subs.push(fn),
    play: (name, vol = 0.9) => play(name, vol),
    voice: (name, vol = 0.9) => voice(name, vol),
    warm: () => ensure(),
    need: (name) => { ensure(); return load(name); },
    level,
  } as Sound;
}

export const sound = makeSound();

export function initChrome() {
  // header steps aside while reading, returns on the way back up
  const head = document.querySelector<HTMLElement>('.head');
  let lastY = window.scrollY;
  const onScroll = () => {
    const y = window.scrollY;
    if (!head || document.querySelector('.menu.is-open')) return;
    // once off the top, the header gets a dark backing so it never sits on top of text
    head.classList.toggle('is-solid', y > 80);
    if (y < 200 || lastY - y > 6) head.classList.remove('is-hidden');
    else if (y - lastY > 6) head.classList.add('is-hidden');
    if (Math.abs(y - lastY) > 6) lastY = y;
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  // sound buttons
  document.querySelectorAll<HTMLButtonElement>('[data-sound-toggle]').forEach((b) => {
    b.addEventListener('click', () => sound.toggle());
  });
  sound.subscribe((on) => {
    document.querySelectorAll<HTMLButtonElement>('[data-sound-toggle]').forEach((b) => {
      b.setAttribute('aria-pressed', String(on));
      const l = b.querySelector('[data-sound-label]');
      if (l) l.textContent = on ? 'Sound on' : 'Sound off';
    });
  });
  // Kannada / Telugu script switch
  document.querySelectorAll<HTMLButtonElement>('[data-script-toggle]').forEach((b) => {
    b.addEventListener('click', () => {
      const next = document.documentElement.dataset.script === 'te' ? 'kn' : 'te';
      document.documentElement.dataset.script = next;
      try { localStorage.setItem('kodathi-script', next); } catch {}
      window.dispatchEvent(new CustomEvent('kodathi:script', { detail: next }));
    });
  });
  // remember choice across pages; browsers still need a gesture, so resume on first input
  let want = false;
  try { want = sessionStorage.getItem('kodathi-sound') === '1'; } catch {}
  if (want && !document.querySelector('[data-preloader]')) {
    const once = () => { sound.set(true); window.removeEventListener('pointerdown', once); window.removeEventListener('keydown', once); };
    window.addEventListener('pointerdown', once, { once: true });
    window.addEventListener('keydown', once, { once: true });
  }

  // menu
  const menu = document.querySelector<HTMLElement>('[data-menu]');
  const openers = document.querySelectorAll<HTMLButtonElement>('[data-menu-open]');
  const closer = document.querySelector<HTMLButtonElement>('[data-menu-close]');
  if (menu) {
    let last: HTMLElement | null = null;
    const open = () => {
      last = document.activeElement as HTMLElement;
      menu.classList.add('is-open'); menu.removeAttribute('inert');
      openers.forEach((o) => o.setAttribute('aria-expanded', 'true'));
      lenis?.stop();
      // Android back button closes the menu rather than leaving the page
      history.pushState({ ...(history.state || {}), menu: true }, '');
      setTimeout(() => menu.querySelector<HTMLElement>('a, button')?.focus(), 60);
    };
    const shut = () => {
      menu.classList.remove('is-open'); menu.setAttribute('inert', '');
      openers.forEach((o) => o.setAttribute('aria-expanded', 'false'));
      lenis?.start(); last?.focus();
    };
    const close = () => { if (history.state?.menu) history.back(); else shut(); };
    window.addEventListener('popstate', () => { if (menu.classList.contains('is-open')) shut(); });
    openers.forEach((o) => o.addEventListener('click', open));
    closer?.addEventListener('click', close);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && menu.classList.contains('is-open')) close(); });
    menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => { menu.classList.remove('is-open'); lenis?.start(); }));
  }
}

/** Reveal-on-enter for simple elements. Content is visible by default; motion only adds. */
export function initReveals(root: ParentNode = document) {
  if (reduced) return;
  root.querySelectorAll<HTMLElement>('[data-rise]').forEach((el) => {
    gsap.from(el, {
      y: 36, opacity: 0, duration: 1.1, ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  });
}

export { gsap, ScrollTrigger };
