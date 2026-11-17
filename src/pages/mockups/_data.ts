// Shared real content for the five design mockups (no invented facts: everything comes from temple.ts / events.ts).
import { temple, terms, schedule, about, offerings, kanneBrings, albums, swamis } from '../../data/temple';
import { dated, clock } from '../../data/events';

export const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');
export const m = (p: string) => `${base}media/${p}`;
export const wa = (text: string) => `https://wa.me/${temple.whatsapp}?text=${encodeURIComponent(text)}`;
export const time = (min: number) => clock(`${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`);
const d = (s: string) => new Date(`${s}T12:00:00+05:30`);
const f = (o: Intl.DateTimeFormatOptions) => (s: string) => new Intl.DateTimeFormat('en-GB', { ...o, timeZone: 'Asia/Kolkata' }).format(d(s));
export const longDate = f({ day: 'numeric', month: 'long', year: 'numeric' });
export const dayNum = f({ day: 'numeric' });
export const monShort = f({ month: 'short' });
export const weekday = f({ weekday: 'long' });

export const [morning, evening] = schedule;
export const chief = swamis.find((s) => s.role === 'chief')!;
export const guru = swamis.find((s) => s.role === 'guruswamy')!;
export const longServing = swamis.filter((s) => s.role === 'swamy' && s.first);
export const since = (s: { since?: number; years?: number }) => s.years ? `Wearing the mala for ${s.years} years` : s.since ? `Wearing the mala since ${s.since}` : '';
export const sm = (p?: string) => (p ? p.replace(/\.jpg$/, '-sm.jpg') : '');
export const cover = (a: (typeof albums)[number]) => a.items.find((i) => i.loopPoster)?.loopPoster ?? a.items[0].thumb;
export const templeAlbum = albums.find((a) => a.id === '2026-11-12-padi-pooja-temple')!;
export const stepsPhoto = templeAlbum.items.find((i) => i.type === 'photo')!;
export const loop = templeAlbum.items.find((i) => i.loop)!;
export const askGuru = wa('Swamiye Sharanam. I would like to speak to a guruswamy.');
export { temple, terms, about, offerings, kanneBrings, albums, dated, clock };
