// Scroll-scrubbed video. Clips are encoded with a keyframe every 3 frames
// so seeking stays smooth; currentTime eases toward the scroll target.
import { gsap } from 'gsap';

export class Scrub {
  v: HTMLVideoElement;
  target = 0;
  cur = 0;
  ready = false;
  active = false;
  private ease: number;

  constructor(v: HTMLVideoElement, ease = 0.14) {
    this.v = v;
    this.ease = ease;
    const small = window.innerWidth < 760;
    const src = (small && v.dataset.srcM) || v.dataset.src;
    if (src && !v.src) { v.src = src; v.load(); }
    v.muted = true; v.playsInline = true; v.preload = 'auto';
    const ok = () => { this.ready = true; v.classList.add('is-ready'); };
    if (v.readyState >= 2) ok(); else v.addEventListener('loadeddata', ok, { once: true });
    // iOS needs a play/pause before seeking paints frames
    v.play().then(() => v.pause()).catch(() => {});
    gsap.ticker.add(this.tick);
  }

  /** p in 0..1 */
  set(p: number) { this.target = Math.max(0, Math.min(1, p)); this.active = true; }

  tick = () => {
    if (!this.ready || !this.active) return;
    const d = this.v.duration || 0;
    if (!d) return;
    const goal = this.target * (d - 0.05);
    this.cur += (goal - this.cur) * this.ease;
    if (Math.abs(goal - this.cur) < 0.002) this.cur = goal;
    if (!this.v.seeking && Math.abs(this.v.currentTime - this.cur) > 0.01) this.v.currentTime = this.cur;
  };

  destroy() { gsap.ticker.remove(this.tick); }
}
