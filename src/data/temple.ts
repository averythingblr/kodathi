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
  // confirm: placeholder until the temple sends its WhatsApp number
  whatsapp: '919916714933',
  whatsappDisplay: '+91 99167 14933',
  // calls go to the same number (user, 17-11-2026), between these hours
  phone: '+919916714933',
  callHours: '10:00 am to 4:00 pm',
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
  // given by the temple
  kanne: { kn: 'ಕನ್ನೆ ಸ್ವಾಮಿ', te: 'కన్నె స్వాములు' },
  irumudi: { kn: 'ಇರುಮುಡಿ', te: 'ఇరుముడి' },
  bhajana: { kn: 'ಭಜನೆ', te: 'భజన' },
  sanctum: { kn: 'ಗರ್ಭಗುಡಿ', te: 'సన్నిధానం' },
  sharanuGhosha: { kn: 'ಶರಣು ಘೋಷ', te: 'శరణుఘోష' },
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

// Telugu names of the two daily poojas as the temple gave them. confirm: Kannada names, timings. The temple is open all day during the season. Padi pooja is not daily: see padiPoojas.
export const openAllDay = true;
export const schedule: Pooja[] = [
  { id: 'morning', at: t(5), dur: 60, kind: 'pooja', name: 'Morning pooja', kn: '', te: 'ప్రాతఃకాల పూజ', note: 'Deeparadhana, sharanu ghosha and karpoora harathi.' },
  { id: 'evening', at: t(19), dur: 90, kind: 'pooja', name: 'Evening pooja', kn: '', te: 'సాయంకాల పూజ', note: 'Sharanu ghosha and bhajana, ending with Harivarasanam.' },
];

/** What to call someone who is wearing the mala. Telugu: Sri Sastha Devasthanam, Khammam. Kannada: given by the temple. */
export const address = [
  { who: 'Men', en: 'Swamy', kn: 'ಸ್ವಾಮಿ', te: 'స్వామి' },
  { who: 'Women', en: 'Matha', kn: 'ಮಾತಾ', te: 'మాత' },
  { who: 'Boys', en: 'Manikanta', kn: 'ಮಣಿಕಂಠ', te: 'మణికంఠ' },
  { who: 'Girls', en: 'Malikapuram', kn: 'ಮಾಲಿಕಾಪುರತ್ತಮ್ಮ', te: 'మాలికాపురం' },
];

/** What to know before visiting, shown on both sites' Visit pages. The first three are the customs (footwear, dress, photos). */
export const visitNotes: [string, string][] = [
  ['Footwear', 'Leave footwear at the stand by the entrance before you step inside.'],
  ['Dress', 'Traditional or modest clothes. Men usually wear a dhoti for the sanctum.'],
  ['Photos', 'Please do not photograph the sanctum. Photos of the steps and courtyard are welcome outside pooja times.'],
  ['Prasadam', 'Prasadam is given after the poojas. What is offered varies.'],
  ['Stay', 'The temple is open all day during the season. Swamys can use the washrooms and bathing area, and sleep at the temple.'],
  ['Annadanam', 'Annadanam is open to everyone.'],
  ['Groups', 'Coming as a group, or to tie your irumudi? Message us on WhatsApp so we can plan.'],
];

/** What a kanne swamy brings for maala dharana. */
export const kanneBrings: [string, string][] = [
  ['Black clothes', 'Lungis, shirts, towels and a blanket, two of each. Wear only these for the 41 days.'],
  ['Two malas and the mudra', 'Choose two: tulsi, rudraksha, sandalwood, lotus seed or crystal. With them, the Ayyappa mudra (locket).'],
  ['Pooja samagri', 'The basic pooja items: kumkum, turmeric, sandal powder, vibhuti, agarbatti, camphor and flowers.'],
  ['On the day', 'Come after your morning bath. Your guruswamy does the pooja with these and puts the mala on you.'],
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
  { id: 'padi-pooja', name: 'Padi pooja', kn: 'ಪಡಿಪೂಜೆ', te: 'పడిపూజ', verb: 'Offer', message: 'Swamiye Sharanam. I would like to offer padi pooja.', what: 'The eighteen steps are decorated with flowers and lamps and worshipped one by one, with bhajana. Offer it at the temple on a Thursday evening, or invite our swamys to your home: see Invite our swamys on the Events page.', when: 'Thursday evenings at the temple, and at your home on request' },
  { id: 'neyyabhishekam', name: 'Neyyabhishekam', kn: 'ನೆಯ್ಯಭಿಷೇಕ', te: 'నెయ్యాభిషేకం', verb: 'Offer', message: 'Swamiye Sharanam. I would like to offer neyyabhishekam.', what: 'Ghee abhishekam. Bring ghee in your irumudi or offer it at the temple.', when: 'At the morning pooja' },
  { id: 'pushpabhishekam', name: 'Pushpabhishekam', kn: 'ಪುಷ್ಪಾಭಿಷೇಕ', te: 'పుష్పాభిషేకం', verb: 'Offer', message: 'Swamiye Sharanam. I would like to offer pushpabhishekam.', what: 'An offering of flowers: marigold, jasmine, lotus and tulsi.', when: 'At the evening pooja' },
  { id: 'annadanam', name: 'Annadanam', kn: 'ಅನ್ನದಾನ', te: 'అన్నదానం', verb: 'Offer', message: 'Swamiye Sharanam. I would like to offer annadanam.', what: 'Sponsor annadanam, the meal served to everyone who comes.', when: 'Ask on WhatsApp for a date' },
];

/** `time` is the start, 24-hour IST ('18:00'); leave it out for an all-day entry. */
export type Festival = { id: string; name: string; kn: string; te: string; start: string; end?: string; ongoing?: boolean; about: string; time?: string };

// Dates confirmed by the temple (16-11-2026). Start time 6:00 pm as the temple gave it; Ugadi has no time yet.
export const festivals: Festival[] = [
  { id: 'mala', name: 'Maala dharana', kn: 'ಮಾಲಾಧಾರಣೆ', te: 'మాలధారణ', start: '2026-11-09', ongoing: true, about: 'Going on since Monday 9 November. Each swamy’s 41 days begin the day they take the mala from a guruswamy.' },
  { id: 'mandala-pooja', name: 'Mandala pooja', kn: 'ಮಂಡಲ ಪೂಜೆ', te: 'మండలపూజ', start: '2026-12-27', time: '18:00', about: 'The season’s main pooja at the end of the Mandala period.' },
  { id: 'makara-jyothi', name: 'Makara Jyothi', kn: 'ಮಕರಜ್ಯೋತಿ', te: 'మకరజ్యోతి', start: '2027-01-14', time: '18:00', about: 'Makara Sankranti. The night the light is seen on the hill. The temple stays lit until Harivarasanam.' },
  { id: 'ugadi', name: 'Ugadi', kn: 'ಯುಗಾದಿ', te: 'ఉగాది', start: '2027-04-07', about: 'Kannada and Telugu new year. Special abhishekam at dawn and bevu-bella prasadam.' },
];

/** Padi poojas as they are offered: at the temple on a Thursday evening, or at a swamy's home on request.
 *  Add one line per padi pooja; it shows on the home page and Events until its day has passed. */
export type PadiPooja = { date: string; at: 'temple' | 'home'; host?: string; place: string; when: string; map?: string; /** start, 24-hour IST; home padi poojas begin at 6:00 pm unless told otherwise */ time?: string };
export const padiPoojas: PadiPooja[] = [
  { date: '2026-11-16', at: 'home', host: 'Mahesh Swamy', place: 'Mullur', when: 'Evening', time: '18:00', map: 'https://maps.app.goo.gl/ojYMhbLgjpkRx9qNA' },
  // the user did not know whose home (17-11-2026): no host, so only the place is shown
  { date: '2026-11-17', at: 'home', place: 'Kudlu', when: 'Evening', time: '18:00', map: 'https://maps.app.goo.gl/oinPCm499mcU5vAv5' },
];
/** a home padi pooja without a host (the temple did not say whose home) shows only the place */
export const padiTitle = (p: PadiPooja) => (p.at === 'home' ? (p.host ? `Padi pooja at ${p.host}’s home, ${p.place}` : `Padi pooja at ${p.place}`) : 'Padi pooja at the temple');
/** WhatsApp message a first-time swamy sends for help with what to bring. */
export const kanneAsk = 'Swamiye Sharanam. I am taking the mala for the first time. Can you help me with what to bring and where to get it?';
export const padiAbout = (p: PadiPooja) => (p.at === 'home' ? (p.host ? `${p.when}, at ${p.host}’s home in ${p.place}.` : `${p.when}, in ${p.place}.`) : `${p.when}, on the eighteen steps at the temple.`);

// confirm: Mandala pooja darshan time
export const mandala = { malaFrom: '2026-11-09', days: 41, darshan: '2026-12-27T18:30:00+05:30' };

/** About our temple, from what the temple told us (16-11-2026). confirm: the year it began and who began it
 *  are still to come; add nothing here that the temple has not said. "Kannali Road" is spelled as it was given. */
export const about = {
  place: 'Our temple stands on Kodati–Sulikunte Road, away from the noise and rush of the city, with trees all around and the lake close by.',
  worship: 'A Shiva linga is worshipped here along with Ayyappa Swamy, and there is a quiet place to sit and meditate.',
  swamys: 'Swamys come here from Kodathi, Mullur, Sarjapura Road, Kannali Road and the places around. For anyone wearing the mala there are washrooms open day and night, places to bathe and change, plenty of room to sleep, and a kitchen that cooks for the devotees.',
  /** what a visitor finds here, for a quick look on a phone */
  has: [
    ['Ayyappa Swamy and a Shiva linga', 'Both are worshipped here.'],
    ['Trees and the lake', 'Away from city noise.'],
    ['A place to meditate', 'Quiet, any time of day.'],
    ['Washrooms day and night', 'Open round the clock.'],
    ['Bathing and changing', 'Separate places for both.'],
    ['Room to sleep', 'Plenty of space for swamys.'],
    ['A kitchen', 'It cooks for the devotees.'],
  ] as [string, string][],
};

/** Our Guruswamys and Swamys, in this order: the Chief Guruswamy, the Guruswamy, then the swamys.
 *  confirm: names and photos are still to come from the temple. Leave `name` '' until then (the page shows a
 *  placeholder). Photos go in public/media/swamis/ and `photo` is the file name, e.g. 'chief.jpg'.
 *  Add each swamy as one line with role 'swamy'.
 *  The swamys who have worn the mala longest come before the others. The temple has no word for them and does not
 *  want "senior swamy", so the page gives them NO label: mark the two or three of them `first: true` and they
 *  are shown first in large frames near the guruswamys' size; every other swamy is a small round photo.
 *  Each can show "Wearing the mala since <year>" if `since` is given. */
export type Swami = { role: 'chief' | 'guruswamy' | 'swamy'; name: string; photo?: string; since?: number; /** as the temple said it, e.g. 23 → "for 23 years" */ years?: number; first?: boolean; /** one line about him */ note?: string };
export const swamis: Swami[] = [
  // name as the temple gave it (16-11-2026); photo from a padi pooja at a home, cropped and brightened
  { role: 'chief', name: 'Lokesh Reddy Swamy', photo: 'chief.jpg', since: 1998,
    note: 'He has led the swamys here for many seasons. Swamys come to him to take the mala and to tie the irumudi, and he leads the padi pooja at the temple and at homes.' },
  // Rambabu Swamy (Guruswamy) and Mahesh Swamy were removed at the user's request (17-11-2026), and so was the
  // empty Guruswamy placeholder. Add a { role: 'guruswamy', name, photo } line when the temple gives one.
  // long-serving swamys, as the temple named them (17-11-2026); photo IMG_9009
  { role: 'swamy', name: 'Anjineyulu Swamy', photo: 'anjineyulu.jpg', since: 2010, first: true },
];
export const swamiRole = { chief: 'Chief Guruswamy', guruswamy: 'Guruswamy', swamy: 'Swamy' } as const;

/** The temple's own photos and videos, one album per event, newest first. Names as the temple gave them. */
export type Media = { type: 'photo' | 'video'; src: string; thumb: string; w: number; h: number; alt: string; label: string; /** videos only: a short silent cut that can open the gallery page, and its still */ loop?: string; loopPoster?: string };
export type Album = { id: string; title: string; kn: string; te: string; date: string; kind: 'padi' | 'kanne' | 'festival'; items: Media[] };
const g = (album: string, f: string) => `gallery/${album}/${f}`;
const A = '2026-11-12-padi-pooja-temple', B = '2026-11-14-kanne-pooja-home', C = '2026-11-16-padi-pooja-mullur';
export const albums: Album[] = [
  {
    // name as the temple gave it; videos from the temple's Google Drive folder, 16-11-2026 (IMG_8986 to IMG_8994).
    // Video 4 keeps only its first 12 seconds: after that the phone was turned and the picture lies on its side.
    id: C, title: 'Padi Pooja, Mahesh Swamy’s Home, Mullur', kn: terms.padi.kn, te: terms.padi.te, date: '2026-11-16', kind: 'padi',
    items: [
      { type: 'video', src: g(C, 'video-1.mp4'), thumb: g(C, 'video-1.jpg'), w: 540, h: 960, label: 'Video 1', alt: 'Swamys sing and clap beside the decorated steps, video' },
      { type: 'video', src: g(C, 'video-2.mp4'), thumb: g(C, 'video-2.jpg'), w: 540, h: 960, label: 'Video 2', alt: 'The Chief Guruswamy stands before the altar as the swamys clap and sing, video' },
      { type: 'video', src: g(C, 'video-3.mp4'), thumb: g(C, 'video-3.jpg'), w: 540, h: 960, label: 'Video 3', alt: 'The swamys sing along, the Chief Guruswamy standing before the altar, video' },
      { type: 'video', src: g(C, 'video-4.mp4'), thumb: g(C, 'video-4.jpg'), w: 540, h: 960, label: 'Video 4', alt: 'The hall full of swamys before the altar, video' },
      { type: 'video', src: g(C, 'video-5.mp4'), thumb: g(C, 'video-5.jpg'), w: 540, h: 960, label: 'Video 5', alt: 'A swamy in orange at the steps lit with lamps, video', loop: g(C, 'loop-1.mp4'), loopPoster: g(C, 'loop-1.jpg') },
      { type: 'video', src: g(C, 'video-6.mp4'), thumb: g(C, 'video-6.jpg'), w: 540, h: 960, label: 'Video 6', alt: 'Swamys gather in the dimmed hall before the lit altar, video' },
    ],
  },
  {
    id: B, title: 'Kanne Pooja, Home', kn: 'ಮನೆಯಲ್ಲಿ ಕನ್ನೆ ಪೂಜೆ', te: 'ఇంట్లో కన్నె పూజ', date: '2026-11-14', kind: 'kanne',
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
      { type: 'video', src: g(A, 'video-1.mp4'), thumb: g(A, 'video-1.jpg'), w: 480, h: 854, label: 'Video 1', alt: 'Padi pooja at the temple, video', loop: g(A, 'loop-1.mp4'), loopPoster: g(A, 'loop-1.jpg') },
      { type: 'video', src: g(A, 'video-2.mp4'), thumb: g(A, 'video-2.jpg'), w: 1280, h: 720, label: 'Video 2', alt: 'The priest performs aarti before the lit steps as swamys watch with folded hands, video' },
    ],
  },
];
