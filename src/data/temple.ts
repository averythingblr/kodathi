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
    kn: 'ಸ್ವಾಮಿಯೇ ಶರಣಂ ಅಯ್ಯಪ್ಪ',
    te: 'స్వామియే శరణం అయ్యప్ప',
    en: 'Swamiye Sharanam Ayyappa',
  },
  /** sharanam vili: the leader calls, everyone answers "Sharanam Ayyappa".
   *  Each line has its own recording (media/audio/vili-N.mp3); answerAt is when the chorus comes in. */
  vili: [
    { en: 'Swamiye', kn: 'ಸ್ವಾಮಿಯೇ', te: 'స్వామియే', answerAt: 3.3 },
    { en: 'Harihara sudhane', kn: 'ಹರಿಹರ ಸುತನೇ', te: 'హరిహర సుతనే', answerAt: 3.2 },
    { en: 'Kannimoola Ganapathi Bhagavane', kn: 'ಕನ್ನಿಮೂಲ ಗಣಪತಿ ಭಗವಾನನೇ', te: 'కన్నిమూల గణపతి భగవానే', answerAt: 3.85 },
    { en: 'Pathinettam padiye', kn: 'ಪದಿನೆಟ್ಟಾಂ ಪಡಿಯೇ', te: 'పదునెట్టాం పడియే', answerAt: 3.8 },
    { en: 'Sabarigiri vasane', kn: 'ಶಬರಿಗಿರಿ ವಾಸನೇ', te: 'శబరిగిరి వాసనే', answerAt: 3.95 },
  ],
  response: { en: 'Sharanam Ayyappa', kn: 'ಶರಣಂ ಅಯ್ಯಪ್ಪ', te: 'శరణం అయ్యప్ప' },
};

export type Pooja = {
  id: string;
  /** minutes after midnight */
  at: number;
  /** minutes the pooja lasts; nada-close entries use 0 */
  dur: number;
  name: string;
  kn: string;
  te: string;
  note: string;
  kind: 'open' | 'pooja' | 'close';
};

const t = (h: number, m = 0) => h * 60 + m;

// confirm: all timings below are placeholders
export const schedule: Pooja[] = [
  { id: 'nada-am', at: t(4, 30), dur: 0, kind: 'open', name: 'Nada opens', kn: 'ಬಾಗಿಲು ತೆರೆಯುವುದು', te: 'తలుపులు తెరవడం', note: 'The sanctum doors open with the conch and Nirmalyam darshan.' },
  { id: 'abhishekam', at: t(5), dur: 60, kind: 'pooja', name: 'Abhishekam', kn: 'ಅಭಿಷೇಕ', te: 'అభిషేకం', note: 'Neyyabhishekam: ghee from the pilgrims’ irumudi is offered.' },
  { id: 'usha', at: t(7, 30), dur: 30, kind: 'pooja', name: 'Usha pooja', kn: 'ಉಷಃ ಪೂಜೆ', te: 'ఉషః పూజ', note: 'The morning pooja.' },
  { id: 'ucha', at: t(12), dur: 30, kind: 'pooja', name: 'Ucha pooja', kn: 'ಮಧ್ಯಾಹ್ನ ಪೂಜೆ', te: 'మధ్యాహ్న పూజ', note: 'The noon pooja, followed by annadanam.' },
  { id: 'nada-noon', at: t(12, 30), dur: 0, kind: 'close', name: 'Nada closes', kn: 'ಬಾಗಿಲು ಮುಚ್ಚುವುದು', te: 'తలుపులు మూయడం', note: 'The sanctum rests until evening.' },
  { id: 'nada-pm', at: t(17), dur: 0, kind: 'open', name: 'Nada opens', kn: 'ಬಾಗಿಲು ತೆರೆಯುವುದು', te: 'తలుపులు తెరవడం', note: 'Evening darshan begins.' },
  { id: 'deeparadhana', at: t(18, 30), dur: 30, kind: 'pooja', name: 'Deeparadhana', kn: 'ದೀಪಾರಾಧನೆ', te: 'దీపారాధన', note: 'Lamps and camphor aarti at dusk.' },
  { id: 'padi', at: t(19, 30), dur: 45, kind: 'pooja', name: 'Padi pooja', kn: 'ಪಡಿ ಪೂಜೆ', te: 'పడి పూజ', note: 'The eighteen steps are lit and worshipped one by one.' },
  { id: 'athazham', at: t(20, 30), dur: 30, kind: 'pooja', name: 'Athazha pooja', kn: 'ರಾತ್ರಿ ಪೂಜೆ', te: 'రాత్రి పూజ', note: 'The night pooja.' },
  { id: 'hari', at: t(21), dur: 0, kind: 'close', name: 'Harivarasanam', kn: 'ಹರಿವರಾಸನಂ', te: 'హరివరాసనం', note: 'The lullaby is sung and the nada closes for the night.' },
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

export type Offering = { id: string; name: string; kn: string; te: string; what: string; when: string };

export const offerings: Offering[] = [
  { id: 'padi-pooja', name: 'Padi pooja', kn: 'ಪಡಿ ಪೂಜೆ', te: 'పడి పూజ', what: 'Each of the eighteen steps is decorated, lit and worshipped in turn by the priest, on your behalf.', when: 'Evenings, by advance booking' },
  { id: 'neyyabhishekam', name: 'Neyyabhishekam', kn: 'ತುಪ್ಪದ ಅಭಿಷೇಕ', te: 'నెయ్యి అభిషేకం', what: 'Ghee abhishekam. Bring ghee in your irumudi or offer it at the counter.', when: 'Mornings, 5:00 to 6:00' },
  { id: 'archana', name: 'Archana', kn: 'ಅರ್ಚನೆ', te: 'అర్చన', what: 'Names and star chanted during the pooja for you or your family.', when: 'Any time the nada is open' },
  { id: 'pushpabhishekam', name: 'Pushpabhishekam', kn: 'ಪುಷ್ಪಾಭಿಷೇಕ', te: 'పుష్పాభిషేకం', what: 'An offering of flowers: marigold, jasmine, lotus and tulsi.', when: 'Evenings' },
  { id: 'annadanam', name: 'Annadanam', kn: 'ಅನ್ನದಾನ', te: 'అన్నదానం', what: 'Sponsor the noon meal served to every devotee who comes.', when: 'Daily after Ucha pooja' },
  { id: 'mala', name: 'Mala dharanam', kn: 'ಮಾಲಾಧಾರಣೆ', te: 'మాలధారణ', what: 'Wear the tulsi or rudraksha mala to begin the 41-day vratham.', when: 'Mornings during Mandala season' },
];

export type Festival = { id: string; name: string; kn: string; te: string; start: string; end?: string; about: string };

// confirm: dates follow the Malayalam calendar and need the committee's check
export const festivals: Festival[] = [
  { id: 'mandala-start', name: 'Mandala season begins', kn: 'ಮಂಡಲ ಕಾಲ', te: 'మండల కాలం', start: '2026-11-17', about: 'Vrischikam 1. Devotees wear the mala and begin the 41-day vratham: simple food, black clothes, the chant on their lips.' },
  { id: 'mandala-pooja', name: 'Mandala pooja', kn: 'ಮಂಡಲ ಪೂಜೆ', te: 'మండల పూజ', start: '2026-12-27', about: 'The forty-first day. The season’s main pooja, with padi pooja through the evening.' },
  { id: 'makaravilakku', name: 'Makara Jyothi', kn: 'ಮಕರ ಜ್ಯೋತಿ', te: 'మకర జ్యోతి', start: '2027-01-14', about: 'Makara Sankranti. The night the light is seen on the hill. The temple stays lit until Harivarasanam.' },
  { id: 'ugadi', name: 'Ugadi', kn: 'ಯುಗಾದಿ', te: 'ఉగాది', start: '2027-04-07', about: 'Kannada and Telugu new year. Special abhishekam at dawn and bevu-bella prasadam.' },
  { id: 'uthram', name: 'Panguni Uthram', kn: 'ಪಂಗುನಿ ಉತ್ತರಂ', te: 'పంగుని ఉత్తరం', start: '2027-03-22', about: 'Ayyappa’s birth star. Special abhishekam and annadanam.' },
  { id: 'prathishta', name: 'Prathishta day', kn: 'ಪ್ರತಿಷ್ಠಾ ದಿನ', te: 'ప్రతిష్ఠా దినం', start: '2027-06-10', about: 'The anniversary of the temple’s consecration.' },
];

// confirm: Mandala pooja darshan time
export const mandala = { start: '2026-11-17', days: 41, darshan: '2026-12-27T18:30:00+05:30' };
