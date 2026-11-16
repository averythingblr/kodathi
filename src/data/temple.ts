// Temple facts in one place. Anything marked `confirm` is a placeholder
// until the temple committee sends the real details.
//
// Kannada and Telugu words: only words a published Kannada or Telugu source prints.
// Where no source was found the field is left empty ('') and the site shows English
// only, until the priest confirms the word. Sources are listed in README.md.

export type Sc = { kn: string; te: string };

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
  /** sharanam calls: the leader calls, everyone answers "Sharanam Ayyappa".
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

/** Terms swamys use, as printed in Kannada and Telugu sources. */
export const terms = {
  steps: { kn: '18 ಮೆಟ್ಟಿಲುಗಳು', te: '18 మెట్లు' },
  vow: { kn: 'ವ್ರತ', te: 'అయ్యప్ప దీక్ష' },
  mala: { kn: 'ಮಾಲಾಧಾರಣೆ', te: 'మాలధారణ' },
  padi: { kn: 'ಪಡಿಪೂಜೆ', te: 'పడిపూజ' },
  guruswamy: { kn: 'ಗುರುಸ್ವಾಮಿ', te: 'గురుస్వామి' },
  kanne: { kn: 'ಕನ್ನಿ ಸ್ವಾಮಿ', te: 'కన్నె స్వామి' },
  irumudi: { kn: 'ಇರುಮುಡಿ', te: 'ఇరుముడి' },
  bhajana: { kn: 'ಭಜನೆ', te: 'భజన' },
  sanctum: { kn: 'ಗರ್ಭಗುಡಿ', te: 'సన్నిధానం' },
  // confirm: no Kannada source found for the sharanam calls
  sharanuGhosha: { kn: '', te: 'శరణుఘోష' },
};

export type Pooja = {
  id: string;
  /** minutes after midnight */
  at: number;
  /** minutes the pooja lasts; open/close entries use 0 */
  dur: number;
  name: string;
  kn: string;
  te: string;
  note: string;
  kind: 'open' | 'pooja' | 'close';
};

const t = (h: number, m = 0) => h * 60 + m;

// confirm: timings are placeholders, and the names of the two daily poojas. The temple is open all day
// during the season. Padi pooja is not daily: see offerings and events.
export const openAllDay = true;
export const schedule: Pooja[] = [
  { id: 'morning', at: t(5), dur: 60, kind: 'pooja', name: 'Morning pooja', kn: '', te: '', note: 'The first pooja of the day.' },
  { id: 'evening', at: t(19), dur: 90, kind: 'pooja', name: 'Evening pooja', kn: '', te: '', note: 'Ends with Harivarasanam.' },
];

/** How swamys address each other in deeksha. Telugu: Sri Sastha Devasthanam, Khammam. confirm: Kannada words. */
export const address = [
  { who: 'Men', en: 'Swamy', kn: 'ಸ್ವಾಮಿ', te: 'స్వామి' },
  { who: 'Women', en: 'Matha', kn: '', te: 'మాత' },
  { who: 'Boys', en: 'Manikanta', kn: '', te: 'మణికంఠ' },
  { who: 'Girls', en: 'Malikapuram', kn: '', te: 'మాలికాపురం' },
];

/** What a kanne swamy brings for maala dharana, after Sri Sastha Devasthanam, Khammam (Deeksha Vidhanam). */
export const kanneBrings: [string, string][] = [
  ['Black clothes', 'Lungis, shirts, towels and a blanket, two of each. Wear only these for the 41 days.'],
  ['Two malas and the mudra', 'Choose two: tulsi, rudraksha, sandalwood, lotus seed or crystal. With them, the Ayyappa mudra (locket).'],
  ['For the pooja', '1 coconut, 6 bananas, 100 g sesame oil, agarbatti, sandal powder, vibhuti, kumkum, flowers, and a little cashew, raisins, sugar and camphor.'],
  ['On the morning', 'After your morning bath, the guruswamy does the pooja with these and puts the mala on you.'],
];

/** The eighteen steps, each language as its source lists them (order and words differ).
 *  Kannada: BoldSky Kannada (steps 1–13, 17–18) and TV9 Kannada (14–16).
 *  Telugu: Sri Sastha Devasthanam, Khammam. confirm: the priest says which order the temple teaches. */
export const stairs = {
  kn: {
    groups: [
      { from: 0, sc: 'ಪಂಚೇಂದ್ರಿಯಗಳು', en: 'The five senses' },
      { from: 5, sc: 'ಅಷ್ಟರಾಗಗಳು', en: 'The eight passions' },
      { from: 13, sc: 'ತ್ರಿಗುಣಗಳು', en: 'The three gunas' },
      { from: 16, sc: 'ವಿದ್ಯೆ, ಅವಿದ್ಯೆ', en: 'Knowledge and ignorance' },
    ],
    steps: [
      ['ಕಣ್ಣು', 'Eyes'], ['ಕಿವಿ', 'Ears'], ['ಮೂಗು', 'Nose'], ['ನಾಲಗೆ', 'Tongue'], ['ತ್ವಚೆ', 'Skin'],
      ['ಕಾಮ', 'Desire'], ['ಕ್ರೋಧ', 'Anger'], ['ಲೋಭ', 'Greed'], ['ಮೋಹ', 'Delusion'], ['ಮದ', 'Pride'], ['ಮತ್ಸರ', 'Envy'], ['ಅಸೂಯೆ', 'Jealousy'], ['ಕುತಂತ್ರ', 'Deceit'],
      ['ಸತ್ವ', 'Sattva'], ['ರಜೋ', 'Rajas'], ['ತಮೋ', 'Tamas'],
      ['ವಿದ್ಯೆ', 'Knowledge'], ['ಅವಿದ್ಯೆ', 'Ignorance'],
    ] as [string, string][],
  },
  te: {
    groups: [
      { from: 0, sc: 'అరిషడ్వర్గములు, రాగములు', en: 'The six enemies and two passions' },
      { from: 8, sc: 'పంచేంద్రియములు', en: 'The five senses' },
      { from: 13, sc: 'మూడు గుణములు', en: 'The three gunas' },
      { from: 16, sc: 'విద్య, అవిద్య', en: 'Knowledge and ignorance' },
    ],
    steps: [
      ['కామం', 'Desire'], ['క్రోధం', 'Anger'], ['లోభం', 'Greed'], ['మోహం', 'Delusion'], ['మదం', 'Pride'], ['మాత్సర్యం', 'Envy'], ['దంబం', 'Vanity'], ['అహంకారం', 'Ego'],
      ['నేత్రములు', 'Eyes'], ['చెవులు', 'Ears'], ['నాసిక', 'Nose'], ['జిహ్వ', 'Tongue'], ['స్పర్శ', 'Touch'],
      ['సత్వం', 'Sattva'], ['తామసం', 'Tamas'], ['రాజసం', 'Rajas'],
      ['విద్య', 'Knowledge'], ['అవిద్య', 'Ignorance'],
    ] as [string, string][],
  },
};
export const stairGroup = (lang: 'kn' | 'te', i: number) => [...stairs[lang].groups].reverse().find((g) => i >= g.from)!;

export type Offering = { id: string; name: string; kn: string; te: string; what: string; when: string; verb: 'Offer' | 'Ask about'; message: string };

export const offerings: Offering[] = [
  { id: 'mala', name: 'Maala dharana', kn: 'ಮಾಲಾಧಾರಣೆ', te: 'మాలధారణ', verb: 'Ask about', message: 'Swamiye Sharanam. I would like to take the mala.', what: 'Take the mala from a guruswamy to begin your 41 days. Maala dharana is going on since Monday 9 November 2026. Taking it for the first time? See what a kanne swamy brings, under Maala dharana.', when: 'Mornings during the season' },
  { id: 'padi-pooja', name: 'Padi pooja', kn: 'ಪಡಿಪೂಜೆ', te: 'పడిపూజ', verb: 'Offer', message: 'Swamiye Sharanam. I would like to offer padi pooja.', what: 'The eighteen steps are decorated with flowers and lamps and worshipped one by one, with bhajana. Offer it at the temple on a Thursday evening, or at your home.', when: 'Thursday evenings at the temple, and at your home on request' },
  { id: 'neyyabhishekam', name: 'Neyyabhishekam', kn: '', te: 'నెయ్యాభిషేకం', verb: 'Offer', message: 'Swamiye Sharanam. I would like to offer neyyabhishekam.', what: 'Ghee abhishekam. Bring ghee in your irumudi or offer it at the temple.', when: 'At the morning pooja' },
  { id: 'pushpabhishekam', name: 'Pushpabhishekam', kn: 'ಪುಷ್ಪಾಭಿಷೇಕ', te: 'పుష్పాభిషేకం', verb: 'Offer', message: 'Swamiye Sharanam. I would like to offer pushpabhishekam.', what: 'An offering of flowers: marigold, jasmine, lotus and tulsi.', when: 'At the evening pooja' },
  { id: 'annadanam', name: 'Annadanam', kn: '', te: '', verb: 'Offer', message: 'Swamiye Sharanam. I would like to offer annadanam.', what: 'Sponsor annadanam, the meal served to everyone who comes.', when: 'Ask on WhatsApp for a date' },
];

export type Festival = { id: string; name: string; kn: string; te: string; start: string; end?: string; ongoing?: boolean; about: string };

// confirm: dates need the committee's check
export const festivals: Festival[] = [
  { id: 'mala', name: 'Maala dharana', kn: 'ಮಾಲಾಧಾರಣೆ', te: 'మాలధారణ', start: '2026-11-09', ongoing: true, about: 'Going on since Monday 9 November. Each swamy’s 41 days begin the day they take the mala from a guruswamy.' },
  { id: 'mandala-pooja', name: 'Mandala pooja', kn: 'ಮಂಡಲ ಪೂಜೆ', te: 'మండలపూజ', start: '2026-12-27', about: 'The season’s main pooja at the end of the Mandala period.' },
  { id: 'makara-jyothi', name: 'Makara Jyothi', kn: 'ಮಕರಜ್ಯೋತಿ', te: 'మకరజ్యోతి', start: '2027-01-14', about: 'Makara Sankranti. The night the light is seen on the hill. The temple stays lit until Harivarasanam.' },
  { id: 'ugadi', name: 'Ugadi', kn: 'ಯುಗಾದಿ', te: 'ఉగాది', start: '2027-04-07', about: 'Kannada and Telugu new year. Special abhishekam at dawn and bevu-bella prasadam.' },
];

// confirm: Mandala pooja darshan time
export const mandala = { malaFrom: '2026-11-09', days: 41, darshan: '2026-12-27T18:30:00+05:30' };

/** The temple's own photos and videos, one album per event, newest first. Names as the temple gave them. */
export type Media = { type: 'photo' | 'video'; src: string; thumb: string; w: number; h: number; alt: string; label: string };
export type Album = { id: string; title: string; kn: string; te: string; date: string; kind: 'padi' | 'kanne' | 'festival'; items: Media[] };
const g = (album: string, f: string) => `gallery/${album}/${f}`;
const A = '2026-11-12-padi-pooja-temple', B = '2026-11-14-kanne-pooja-home';
export const albums: Album[] = [
  {
    // confirm: the regional spelling of "Kanne pooja" (no source used the term)
    id: B, title: 'Kanne Pooja, Home', kn: 'ಮನೆಯಲ್ಲಿ ಕನ್ನಿ ಪೂಜೆ', te: 'ఇంట్లో కన్నె పూజ', date: '2026-11-14', kind: 'kanne',
    items: [
      { type: 'photo', src: g(B, 'photo-2.jpg'), thumb: g(B, 'photo-2-sm.jpg'), w: 1200, h: 1600, label: 'Photo 2', alt: 'Rows of lamps laid on a decorated stair before the shrine, banana leaves and coconuts at its foot' },
      { type: 'photo', src: g(B, 'photo-4.jpg'), thumb: g(B, 'photo-4-sm.jpg'), w: 1200, h: 1600, label: 'Photo 4', alt: 'By lamplight, a swamy bends over the lamp rows' },
      { type: 'photo', src: g(B, 'photo-5.jpg'), thumb: g(B, 'photo-5-sm.jpg'), w: 1200, h: 1600, label: 'Photo 5', alt: 'A decorated offering between two rows of lit lamps' },
      { type: 'photo', src: g(B, 'photo-6.jpg'), thumb: g(B, 'photo-6-sm.jpg'), w: 1200, h: 1600, label: 'Photo 6', alt: 'The decorated stair of lamps with the shrine behind' },
    ],
  },
  {
    id: A, title: 'Padi Pooja at Temple', kn: 'ದೇವಸ್ಥಾನದಲ್ಲಿ ಪಡಿಪೂಜೆ', te: 'ఆలయంలో పడిపూజ', date: '2026-11-12', kind: 'padi',
    items: [
      { type: 'photo', src: g(A, 'photo-1.jpg'), thumb: g(A, 'photo-1-sm.jpg'), w: 1200, h: 1600, label: 'Photo 1', alt: 'The eighteen steps lit with a lamp on each, garlands down the centre, the idols at the top' },
      { type: 'photo', src: g(A, 'photo-3.jpg'), thumb: g(A, 'photo-3-sm.jpg'), w: 1200, h: 1600, label: 'Photo 3', alt: 'Looking up the lit steps with flower garlands and a raised hand' },
      { type: 'video', src: g(A, 'video-1.mp4'), thumb: g(A, 'video-1.jpg'), w: 480, h: 854, label: 'Video 1', alt: 'Padi pooja at the temple, video' },
      { type: 'video', src: g(A, 'video-2.mp4'), thumb: g(A, 'video-2.jpg'), w: 1280, h: 720, label: 'Video 2', alt: 'The priest performs aarti before the lit steps as swamys watch with folded hands, video' },
    ],
  },
];
