# Ayyappa Swamy Temple, Kodathi

Website for the Ayyappa Swamy Temple on Kodati–Sulikunte Road, Bengaluru.

The home page follows the temple day as you scroll, from the first darshan to
Harivarasanam at night. The colour deepens from dawn to night; there is no clock.

| Section | What it does |
|---------|--------------|
| Gate | The lamp lights; enter with sound or quietly |
| First screen | The temple's name and road over its own padi pooja video (silent loops cut with ffmpeg: upright on phones, wide on large screens), the chant in the chosen script above |
| The sanctum opens | The doors open onto Lord Ayyappa (Nirmalyam darshan), then the page turns to daylight |
| Now and next | Temple open or closed, the next daily pooja, directions and WhatsApp |
| Today | Live schedule in IST of the daily poojas (padi pooja is not daily) |
| Maala dharana | Going on since 9 November; each swamy enters their mala date and sees their day of 41 on the beads; countdown to Mandala pooja darshan |
| Coming up | Maala dharana, Thursday padi poojas, and the next three dated events, including padi poojas booked at swamys' homes (`padiPoojas` in `src/data/temple.ts`) |
| The temple | "Our temple in Kodathi": what the temple told us about itself (`about` in `src/data/temple.ts`) and a quick list of what is there, a kolam that draws itself, and the gallery albums with the temple's own photos and videos, linking to the full gallery |
| Our Guruswamys and Swamys | Chief Guruswamy first; placeholder cards until the temple sends names and photos |
| Sevas | Maala dharana first, padi pooja second; each seva opens WhatsApp with a prefilled message |
| Sharanam calls | Call-and-response: each press of Call sings the next name of Ayyappa and the chorus answers |
| Padi pooja | The climb: the 18 steps, pinned, counted and named in the chosen language, with a WebGL ember layer; at the top the film enters the sanctum for darshan |
| Visit | Address, hours, directions |
| Harivarasanam | The whole courtyard lit, every lamp burning |

Inner pages: `/gallery/`, `/poojas/`, `/festivals/`, `/swamis/`, `/visit/`.

`/gallery/` opens on a short silent loop of the newest pooja video playing inside the word GALLERY; scrolling
flies through the letters into the film, with "Watch with sound" to open the full video. Then a light screen saying
what the gallery holds, then one photo held in the middle of the screen where each album's cover slides up over
the last as you scroll (small caption: number, name, date; tap to go to the album), and each album as a full screen where its photos peel away one by one as you scroll, with pill
markers, a counter and Open. Filter buttons by kind of pooja appear once there are 7 or more albums. A full-screen viewer:
arrow keys, swipe on phones (down to close), videos with sound, and a link of its own for each photo
(`/gallery/#<album>/<n>`) that the Share button sends. With reduced motion or on data saver, albums are plain grids
and the film stays a still. The opening loop is a 10-second cut made with ffmpeg (`loop` on a video in `albums`).
To add an album, put the files in
`public/media/gallery/<date>-<event>/` and add one entry to `albums` in `src/data/temple.ts`.

To add a padi pooja, add one line to `padiPoojas` in `src/data/temple.ts`; it shows on the home page and
Events until its day has passed, highlighted and in the scrolling notice (`src/components/Ticker.astro`) on its day
and the day before, with a Directions link when it has `map`.

**Our Guruswamys and Swamys** (`/swamis/`): the Chief Guruswamy first, then the Guruswamy, then the swamys, from
`swamis` in `src/data/temple.ts`. Until the temple sends names and photos each card shows an empty frame and
"Name and photo to come from the temple". To fill one in, set `name` and put the photo in `public/media/swamis/`
(`photo: 'chief.jpg'`); add each swamy as one line with role `'swamy'`. The swamys who have worn the mala longest come
before the others: mark those two or three `first: true` and they are shown first in large frames near the guruswamys' size, with no
title; all the other swamys are small round photos (the temple has no
word for them and does not want "senior swamy"). Below: what to go to a guruswamy for
(maala dharana, the irumudi, inviting our swamys) and what to call someone wearing the mala.

**Events** (`/festivals/`): a padi pooja block (Thursday evenings at the temple and at homes, when someone
offers it, with WhatsApp and invite buttons), then every dated event with its day and start time, **Add to
calendar** and Directions. Add to calendar opens Google Calendar with the name, time, place and map link filled
in; iPhones get a calendar file instead (`/cal/<id>.ics`, built by `src/pages/cal/[id].ics.ts`). Events come from
`src/data/events.ts`, which joins `festivals` and `padiPoojas`; `time` is the start in 24-hour IST (leave it out
for an all-day entry). The temple gave only start times, so calendar entries are kept for two hours. A padi pooja
drops off the list after its day.

**Invite our swamys** (`src/components/Invite.astro`, on `/festivals/#invite`): a family or another temple
fills in the date, place and contact, and the form opens WhatsApp with the invitation for the guruswamy to
confirm. Nothing is stored. Evenings already in `padiPoojas` are listed, and picking one warns.

The header carries a lamp logo (`src/components/Logo.astro`) beside the temple name; swap it for the temple's
own emblem if it has one.

## Design priority (P0): phones first

Almost everyone will use this site on a phone, and mostly on Android; a computer is rare. Every page and feature is designed,
built and checked at phone width first (Pixel 7 in the tests), with large tap targets and one-hand use.
The desktop layout is the adaptation, not the other way round.
Tests run on a Pixel 7 profile and at 360 px and 412 px widths (`tests/phone.spec.js`). The Android back
button closes the menu and the photo viewer instead of leaving the page (`tests/android.spec.js`).

## Before going live

Checklist to go through with the temple before launch:

- [ ] **What to call someone wearing the mala** (Swamy, Matha, Manikanta, Malikapuram): the temple will
      fix the names and who each is for. Left as it is until then (`address` in `src/data/temple.ts`).
- [ ] The year the temple began and who began it; photos of the temple itself (outside, entrance, steps by day).
- [ ] Spelling of "Kannali Road" in the about text.
- [ ] Real WhatsApp number (`temple.whatsapp` in `src/data/temple.ts`; placeholder now).
- [ ] Names and photos of the Chief Guruswamy, Guruswamy and swamys.
- [ ] Kannada names of the morning and evening poojas; timings.
- [ ] Ugadi start time (the page says abhishekam at dawn; no time is shown yet). How long a padi pooja lasts
      (calendar entries assume two hours).
- [ ] Priest's check of the Kannada and Telugu words and the order of the 18 steps.

## Stack

- [Astro](https://astro.build) static site
- [Lenis](https://github.com/darkroomengineering/lenis) smooth scroll, [GSAP](https://gsap.com) ScrollTrigger
- [Three.js](https://threejs.org) for the real-time ember layer in the climb (loaded only when reached)
- Native cross-document View Transitions between pages
- Fonts: Tiro Kannada, Tiro Telugu, Hind (self-hosted via Fontsource)
- One regional script at a time: every Kannada/Telugu word is stored in both scripts, and the ಕ / తె switch in the header shows only the chosen one, on every page, and remembers it

## Editing content

All temple details live in [`src/data/temple.ts`](src/data/temple.ts): address,
WhatsApp number, the daily schedule, sevas, festivals, maala dharana, the 18 steps and the gallery albums.
**Timings, dates, the WhatsApp number and some customs are placeholders** and are
marked `confirm` in that file. Pages show a small note wherever placeholder
information appears.

## Media

`public/media/film/` holds the film sequences. They are AI-generated
(Seedream 5 Pro stills animated with Kling 4) and art-directed. The darshan
follows the traditional Sabarimala iconography; swap in a photo of the temple's own
idol (`film/darshan-poster.jpg` and the clip) if the committee prefers. Scroll-scrubbed clips are encoded with a keyframe every
3 frames so seeking stays smooth:

```sh
ffmpeg -i in.mp4 -vf scale=1280:-2 -c:v libx264 -crf 25 -g 3 -keyint_min 3 -bf 0 \
  -pix_fmt yuv420p -movflags +faststart -an out.mp4
```

Each clip has a `-m.mp4` phone version (854 px) and a `-poster.jpg`.
`public/media/gallery/<date>-<event>/` holds the temple's own photos and videos, one folder per album, named as the temple named them. Each photo has a `-sm.jpg` thumbnail (640 px).
`public/media/audio/` holds the chorus chant loop (call-and-response), one recording per litany line cut from it (`vili-0` to `vili-4`, each a call and its chorus answer), bell and conch.

### Kannada and Telugu words

Only words that a published Kannada or Telugu source prints are used. Where no source
was found the field is empty in `src/data/temple.ts` and the site shows English only,
until the priest confirms the word. Words the temple gave directly: ಕನ್ನೆ ಸ್ವಾಮಿ /
కన్నె స్వాములు, ನೆಯ್ಯಭಿಷೇಕ, ಅನ್ನದಾನ, ಶರಣು ಘೋಷ, ಮಣಿಕಂಠ, and Matha (ಮಾತಾ). The
Telugu deeksha texts give no separate names for the morning and evening poojas (they
say ఉదయం / సాయంత్రం and list దీపారాధన, శరణుఘోష, కర్పూర హారతి, భజన, హరివరాసనం),
so those stay "Morning pooja" and "Evening pooja". The 18 steps follow each
language's own source, which differ in order and words.

Sources: [Sri Sastha Devasthanam, Khammam](http://ayyappatemplekmm.com/18Steps.html),
[Kerala Tourism, Telugu](https://www.keralatourism.org/sabarimala/telugu/special-poojas) and
[Kannada](https://www.keralatourism.org/sabarimala/kannada/rituals),
[Namasthe Telangana](https://www.ntnews.com/devotional/ayyappa-mandal-deeksha-started-1367890),
[ETV Bharat Telugu](https://www.etvbharat.com/telugu/telangana/bharat/significance-of-ayyappa-swamy-18-steps-at-sabarimala-temple-to-know-full-details-here/na20231207101635179179238),
[Bhakti Deepam](https://bhaktideepam.com/ayyappa-swamy-mala-deeksha-pooja-vidhanam-telugu/),
[TV9 Kannada](https://tv9kannada.com/horoscope/daily-devotional-the-deep-spiritual-meaning-behind-sabarimalas-18-holy-steps-1123687.html),
[BoldSky Kannada](https://kannada.boldsky.com/inspiration/short-story/spiritual-significance-of-18-sacred-steps-of-sabarimala-ayyappa-temple-in-kannada-026095.html),
[Public TV](https://publictv.in/a-small-story-about-ayyappa-swamy-deeksha-mala-dharana-life-style-etc/),
[Asianet Kannada](https://kannada.asianetnews.com/festivals/sabarimala-ayyappa-swamy-padi-pooja-held-at-gurumitkal-in-yadgir-grg-rn95fv),
[Hari Ome](https://hariome.com/ayyappa-deeksha-eternal-rules/),
[TeluguOne](https://teluguone.com/devotional/amp/content/ayyappa-deeksha-676-7347.html),
[Telugu Bharath](https://www.telugubharath.com/2023/12/ayyappa-swamy-pooja-method.html),
[Khammam Deeksha Vidhanam](http://ayyappatemplekmm.com/DeekshaVidanam.html).
The priest or a guruswamy should still check them before launch.

## Develop

```sh
npm install
npm run dev        # http://localhost:4321
npm run build      # static output in dist/
```

Append `?t=19:40` to the home page URL to see the "Today" panel at a given IST time.

## Tests

End-to-end tests use Playwright (JavaScript) at desktop and phone sizes:

```sh
npx playwright test
```

They cover every page loading without console errors, broken requests or
sideways scroll; the gate and sound controls; colour changes on scroll with no
clock; the 18-step counter in each language; video seeking; the seva booking
links; the live schedule and the now bar at several times of day; padi pooja
staying off the daily schedule; the maala dharana day-of-41 tracker; coming up;
the gallery page in detail (`tests/gallery.spec.js`: filters, the viewer's
buttons, keys, focus, swipe, video sound, share links); padi poojas at homes
appearing and expiring by date; the scrolling notice and highlights
(`tests/round7.spec.js`); the invitation form and its WhatsApp message
(`tests/invite.spec.js`); the one-script rule on every page (no
Telugu letters visible with Kannada chosen, and the reverse); the sharanam call
button in detail (`tests/vili.spec.js`); and the reduced-motion layout.

## Deploy

Any static host works. On Vercel, import the repo; the defaults
(`npm run build`, output `dist`) are correct.
