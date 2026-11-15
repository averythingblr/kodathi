// Temple facts in one place. Anything marked `confirm` is a placeholder
// until the temple committee sends the real details.

export const temple = {
  name: 'Ayyappa Swamy Temple',
  place: 'Kodathi',
  address: ['Kodati–Sulikunte Road', 'Kodathi, Bengaluru', 'Karnataka 560035'],
  mapUrl: 'https://maps.app.goo.gl/xb1HwTQoCTHXkb1u9',
  // confirm: real booking number
  whatsapp: '919000000000',
  whatsappDisplay: '+91 90000 00000',
  phoneDisplay: '+91 90000 00000',
  chant: {
    ml: 'സ്വാമിയേ ശരണമയ്യപ്പാ',
    kn: 'ಸ್ವಾಮಿಯೇ ಶರಣಂ ಅಯ್ಯಪ್ಪ',
    en: 'Swamiye Sharanam Ayyappa',
  },
};

export type Pooja = {
  id: string;
  /** minutes after midnight */
  at: number;
  /** minutes the pooja lasts; nada-close entries use 0 */
  dur: number;
  name: string;
  ml: string;
  note: string;
  kind: 'open' | 'pooja' | 'close';
};

const t = (h: number, m = 0) => h * 60 + m;

// confirm: all timings below are placeholders
export const schedule: Pooja[] = [
  { id: 'nada-am', at: t(4, 30), dur: 0, kind: 'open', name: 'Nada opens', ml: 'നട തുറക്കൽ', note: 'The sanctum doors open with the conch and Nirmalyam darshan.' },
  { id: 'abhishekam', at: t(5), dur: 60, kind: 'pooja', name: 'Abhishekam', ml: 'അഭിഷേകം', note: 'Neyyabhishekam: ghee from the pilgrims’ irumudi is offered.' },
  { id: 'usha', at: t(7, 30), dur: 30, kind: 'pooja', name: 'Usha pooja', ml: 'ഉഷ പൂജ', note: 'The morning pooja.' },
  { id: 'ucha', at: t(12), dur: 30, kind: 'pooja', name: 'Ucha pooja', ml: 'ഉച്ച പൂജ', note: 'The noon pooja, followed by annadanam.' },
  { id: 'nada-noon', at: t(12, 30), dur: 0, kind: 'close', name: 'Nada closes', ml: 'നട അടയ്ക്കൽ', note: 'The sanctum rests until evening.' },
  { id: 'nada-pm', at: t(17), dur: 0, kind: 'open', name: 'Nada opens', ml: 'നട തുറക്കൽ', note: 'Evening darshan begins.' },
  { id: 'deeparadhana', at: t(18, 30), dur: 30, kind: 'pooja', name: 'Deeparadhana', ml: 'ദീപാരാധന', note: 'Lamps and camphor aarti at dusk.' },
  { id: 'padi', at: t(19, 30), dur: 45, kind: 'pooja', name: 'Padi pooja', ml: 'പടി പൂജ', note: 'The eighteen steps are lit and worshipped one by one.' },
  { id: 'athazham', at: t(20, 30), dur: 30, kind: 'pooja', name: 'Athazha pooja', ml: 'അത്താഴ പൂജ', note: 'The night pooja.' },
  { id: 'hari', at: t(21), dur: 0, kind: 'close', name: 'Harivarasanam', ml: 'ഹരിവരാസനം', note: 'The lullaby is sung and the nada closes for the night.' },
];

/** The eighteen steps and what each one stands for. */
export const steps = [
  { n: 'Sight', s: 'Kannu' }, { n: 'Hearing', s: 'Kaathu' }, { n: 'Smell', s: 'Mookku' }, { n: 'Taste', s: 'Naakku' }, { n: 'Touch', s: 'Thvakku' },
  { n: 'Desire', s: 'Kama' }, { n: 'Anger', s: 'Krodha' }, { n: 'Greed', s: 'Lobha' }, { n: 'Delusion', s: 'Moha' },
  { n: 'Pride', s: 'Mada' }, { n: 'Envy', s: 'Matsarya' }, { n: 'Jealousy', s: 'Asooya' }, { n: 'Arrogance', s: 'Dambha' },
  { n: 'Goodness', s: 'Sattva' }, { n: 'Passion', s: 'Rajas' }, { n: 'Inertia', s: 'Tamas' },
  { n: 'Knowledge', s: 'Vidya' }, { n: 'Ignorance', s: 'Avidya' },
];

export const stepGroup = (i: number) =>
  i < 5 ? 'The five senses' : i < 13 ? 'The eight passions' : i < 16 ? 'The three gunas' : 'Knowledge and ignorance';

export type Offering = { id: string; name: string; ml: string; what: string; when: string };

export const offerings: Offering[] = [
  { id: 'padi-pooja', name: 'Padi pooja', ml: 'പടി പൂജ', what: 'Each of the eighteen steps is decorated, lit and worshipped in turn by the priest, on your behalf.', when: 'Evenings, by advance booking' },
  { id: 'neyyabhishekam', name: 'Neyyabhishekam', ml: 'നെയ്യഭിഷേകം', what: 'Ghee abhishekam. Bring ghee in your irumudi or offer it at the counter.', when: 'Mornings, 5:00 to 6:00' },
  { id: 'archana', name: 'Archana', ml: 'അർച്ചന', what: 'Names and star chanted during the pooja for you or your family.', when: 'Any time the nada is open' },
  { id: 'pushpabhishekam', name: 'Pushpabhishekam', ml: 'പുഷ്പാഭിഷേകം', what: 'An offering of flowers: marigold, jasmine, lotus and tulsi.', when: 'Evenings' },
  { id: 'annadanam', name: 'Annadanam', ml: 'അന്നദാനം', what: 'Sponsor the noon meal served to every devotee who comes.', when: 'Daily after Ucha pooja' },
  { id: 'mala', name: 'Mala dharanam', ml: 'മാലയിടൽ', what: 'Wear the tulsi or rudraksha mala to begin the 41-day vratham.', when: 'Mornings during Mandala season' },
];

export type Festival = { id: string; name: string; ml: string; start: string; end?: string; about: string };

// confirm: dates follow the Malayalam calendar and need the committee's check
export const festivals: Festival[] = [
  { id: 'mandala-start', name: 'Mandala season begins', ml: 'മണ്ഡലകാലം', start: '2026-11-17', about: 'Vrischikam 1. Devotees wear the mala and begin the 41-day vratham: simple food, black clothes, the chant on their lips.' },
  { id: 'mandala-pooja', name: 'Mandala pooja', ml: 'മണ്ഡല പൂജ', start: '2026-12-27', about: 'The forty-first day. The season’s main pooja, with padi pooja through the evening.' },
  { id: 'makaravilakku', name: 'Makaravilakku', ml: 'മകരവിളക്ക്', start: '2027-01-14', about: 'Makara Sankranti. The night the light is seen on the hill. The temple stays lit until Harivarasanam.' },
  { id: 'vishu', name: 'Vishu', ml: 'വിഷു', start: '2027-04-14', about: 'Malayalam new year. Vishukkani darshan at dawn.' },
  { id: 'uthram', name: 'Panguni Uthram', ml: 'പങ്കുനി ഉത്രം', start: '2027-03-22', about: 'Ayyappa’s birth star. Special abhishekam and annadanam.' },
  { id: 'prathishta', name: 'Prathishta day', ml: 'പ്രതിഷ്ഠാ ദിനം', start: '2027-06-10', about: 'The anniversary of the temple’s consecration.' },
];

export const mandala = { start: '2026-11-17', days: 41, makaravilakku: '2027-01-14T18:30:00+05:30' };
