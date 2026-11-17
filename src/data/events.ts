// Dated events for the Events page and its calendar files: festivals and padi poojas in one list.
import { temple, festivals, padiPoojas, padiTitle, padiAbout, terms } from './temple';

export type Event = {
  id: string; name: string; kn: string; te: string; start: string; time?: string; ongoing: boolean;
  about: string; map?: string; mapLabel: string; location: string; padi: boolean;
};

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const templePlace = `${temple.name}, ${temple.address.join(', ')}`;

export const events: Event[] = [
  ...festivals.map((f) => ({
    id: f.id, name: f.name, kn: f.kn, te: f.te, start: f.start, time: f.time, ongoing: !!f.ongoing, about: f.about,
    map: temple.mapUrl, mapLabel: 'the temple', location: templePlace, padi: false,
  })),
  ...padiPoojas.map((p) => ({
    id: `padi-${p.date}-${slug(p.place)}`, name: padiTitle(p), kn: terms.padi.kn, te: terms.padi.te, start: p.date, time: p.time, ongoing: false,
    about: padiAbout(p), map: p.at === 'home' ? p.map : temple.mapUrl,
    mapLabel: padiTitle(p).replace(/^Padi pooja at /, ''), location: p.at === 'home' ? `${p.host}’s home, ${p.place}` : templePlace, padi: true,
  })),
].sort((a, b) => a.start.localeCompare(b.start));

/** Events that can go into a calendar: everything with a day of its own. */
export const dated = events.filter((e) => !e.ongoing);

/** "6:00 pm" from "18:00". */
export const clock = (t: string) => { const [h, m] = t.split(':').map(Number); return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h < 12 ? 'am' : 'pm'}`; };

// How long a calendar entry lasts: a padi pooja takes three hours (the temple, 17-11-2026); for festivals only the
// start is known, so they are kept for two.
const hours = (e: Event) => (e.padi ? 3 : 2);
const pad = (n: number) => String(n).padStart(2, '0');
const utc = (d: Date) => `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
const ymd = (d: Date) => `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}`;
/** Start and end as calendars want them: UTC stamps for a timed event, plain dates for an all-day one. */
export function span(e: Event): [string, string] {
  if (e.time) {
    const s = new Date(`${e.start}T${e.time}:00+05:30`);
    return [utc(s), utc(new Date(s.getTime() + hours(e) * 3600e3))];
  }
  const s = new Date(`${e.start}T00:00:00Z`);
  return [ymd(s), ymd(new Date(s.getTime() + 86400e3))];
}
const notes = (e: Event) => [e.about, e.map ? `Directions: ${e.map}` : '', 'Swamiye Sharanam Ayyappa'].filter(Boolean).join('\n');

/** Opens Google Calendar (the app on Android) with the event filled in. */
export function googleCalendar(e: Event) {
  const [a, b] = span(e);
  const q = new URLSearchParams({ action: 'TEMPLATE', text: e.name, dates: `${a}/${b}`, details: notes(e), location: e.location });
  if (e.time) q.set('ctz', 'Asia/Kolkata');
  return `https://calendar.google.com/calendar/render?${q}`;
}

const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/([,;])/g, '\\$1');
/** The same event as a calendar file, for iPhones and other calendars. */
export function ics(e: Event) {
  const [a, b] = span(e);
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Ayyappa Swamy Temple Kodathi//Events//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    'BEGIN:VEVENT', `UID:${e.id}@kodathi-ayyappa-temple`, `DTSTAMP:${a.length > 8 ? a : a + 'T000000Z'}`,
    e.time ? `DTSTART:${a}` : `DTSTART;VALUE=DATE:${a}`, e.time ? `DTEND:${b}` : `DTEND;VALUE=DATE:${b}`,
    `SUMMARY:${esc(e.name)}`, `DESCRIPTION:${esc(notes(e))}`, `LOCATION:${esc(e.location)}`, ...(e.map ? [`URL:${e.map}`] : []),
    'END:VEVENT', 'END:VCALENDAR', '',
  ].join('\r\n');
}
