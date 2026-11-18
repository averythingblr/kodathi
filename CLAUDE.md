# Ayyappa Swamy Temple, Kodathi: project memory

Website for a local Ayyappa temple in Kodathi, Bengaluru (Kodati–Sulikunte Road). Used weekly by the
temple's swamys and devotees: what is happening, a gallery of each pooja, upcoming events, sevas, the
guruswamys and swamys. Awwwards-level craft, but it must stay a practical temple site.

Read `README.md` for the section table, sources and how to run things. This file is the decisions and
working rules from the build conversations; follow them.

## P0 rules

1. **Phones first, mainly Android.** Almost every visitor is on an Android phone; a computer is rare.
   Design, build and check at phone width first (Pixel 7 profile; also 360 px and 412 px). Tap targets
   ≥ 44 px, readable text, one-hand use, nothing off screen, no sideways scroll. The Android back button
   must close overlays (menu, photo viewer) rather than leave the page.
2. **One regional script at a time.** Kannada or Telugu, whichever the visitor picks (ಕ / తె switch,
   remembered). Never show both. Applies everywhere, including the 18 steps. English is always shown.
   Implementation: `src/components/Sc.astro` and `html[data-script]`; empty `kn`/`te` renders nothing.
3. **Real words only, never translated.** Use Kannada and Telugu words as Ayyappa devotees in Karnataka
   and Andhra/Telangana actually use them: from published sources or from the user. Do not invent or
   machine-translate. Where no word is known, leave it '' (English only) and list it as missing.
4. **Never invent facts** (dates, names, timings, what is offered). Earlier I invented a prathishta date
   and pooja names; the user caught it. Ask, or leave a clear placeholder.
5. **Don't touch the gate** (preloader with "Enter with sound" / "Enter quietly").

## The temple, as the user has described it

- Maala dharana is continuous; swamys have been taking the mala since **09-11-2026**.
- Daily: first pooja **5:00 am** (Telugu name ప్రాతఃకాల పూజ), evening pooja **7:00 pm**
  (సాయంకాల పూజ). Kannada names not yet given. The temple is open all day in the season, with
  washrooms, bathing and a place to sleep for swamys.
- **About the temple (user, 16-11-2026):** away from city noise, with greenery and a lake around; a Shiva linga
  is there along with Ayyappa Swamy; a good place to meditate; washrooms round the clock, bathing and
  changing places, plenty of room to sleep, a kitchen that serves the devotees. Swamys come from Kodathi,
  Mullur, Sarjapura Road, Kannali Road (spelling unconfirmed) and around. Start year and founders: the user
  will send them; write nothing about them until then. The user asked for plain wording that does not read
  as AI-written (no "nestled", "serene" and the like). Text lives in `about` in temple.ts.
- **The home page must be about OUR temple** (user's concern: it looked like a general religious site). The
  identity comes from the WORDS: the heading is the temple's name, the road under it, and a line about the
  temple. **The lamp film stays as the hero** (user, 16-11-2026: the padi pooja video does not go on the home
  hero; it opens the Gallery page instead). Real temple photos are to come from the user.
- Start time for home padi poojas and festivals: **6:00 pm** (user, 16-11-2026). Festival dates are confirmed.
  Ugadi has no time yet (its text says abhishekam at dawn), so it is all-day.
- **Padi pooja is not daily.** It happens when someone offers it: Thursday evenings at the temple, and
  at homes on request. Don't write "not every week", "usually" and the like.
- Families and other temples **invite our swamys** (guruswamys and swamys) for padi pooja or bhajana at
  their homes or temples. The guruswamy confirms personally. The site's invite form only prepares a
  WhatsApp message; it never "books" or confirms.
- **Our Guruswamys and Swamys**: the Chief Guruswamy, **Lokesh Reddy Swamy**, comes first (has worn the mala since 1998), then the
  Guruswamy, then a few long-serving swamys, then the other swamys. **Never write "senior swamy"**: the user
  rejected it and has no term yet, so they get no label (`first: true` in `swamis`). Only these 2-3 get large frames about the
  guruswamys' size; all other swamys are small round photos.
  No "priest". The Chief Guruswamy's name and photo are in (user, 16-11-2026). **Rambabu Swamy (Guruswamy) and Mahesh Swamy
  were removed from both sites at the user's request (17-11-2026)**, with their photos. The empty Guruswamy
  placeholder and the "This season's swamys … to come" box were removed too (user, 17-11-2026), so both sites
  show only Lokesh Reddy Swamy and Anjineyulu Swamy, Anjineyulu's photo about the size of the Chief
  Guruswamy's. Round photos use square crops that start at the top of the photo so the head is never cut:
  `<name>-sm.jpg` (320 px, main site rows) and `<name>-sq.jpg` (640 px, simple site; `sq()` in site.ts). Don't add Rambabu or Mahesh Swamy back unless the user says so; add a Guruswamy or more
  swamys as lines in `swamis` when the temple gives names and photos.
- **Long-serving swamy (user, 17-11-2026):** Anjineyulu Swamy (since 2010), photo IMG_9009. (Mahesh Swamy was
  removed; his name stays only in the Mullur padi pooja and its album, which are the temple's own names: the user
  confirmed keeping the album title "Padi Pooja, Mahesh Swamy's Home, Mullur", 17-11-2026.) The chief guruswamy's extra
  line (`note`) is confirmed by the user (17-11-2026).
- WhatsApp: **+91 99167 14933**. Mala names stay as they are. Padi pooja lasts **3 hours** (calendar).
- **Three full languages** (English, Kannada, Telugu page text, not only terms) is wanted after going live,
  done by a person who writes the languages, never machine-translated.
- **No note saying the films are AI-generated** (the user asked for it to be removed, 16-11-2026).
- Sevas, in order: Maala dharana, Padi pooja, Neyyabhishekam, Pushpabhishekam, Annadanam. No Archana.
  Use "Offer" / "Ask about" ... "on WhatsApp", never "Book". No mention of a temple office.
- Prasadam: don't name items (it varies). Don't use "Ucha pooja".
- Kanne swamy brings: black clothes (two of each), two malas and the mudra, basic pooja samagri
  (kumkum, turmeric, sandal powder, vibhuti, agarbatti, camphor, flowers). No coconut or bananas list, no
  source line. Then the "Not sure where to get these? … Ask the temple on WhatsApp" button.
- What to call someone wearing the mala: men Swamy, women Matha, boys Manikanta, girls Malikapuram.
  **Leave as it is; the user will fix it before going live, so remind them then** (on the checklist).
- Deity films: keep the grand arch; the lamp in front of Ayyappa must be visibly lit. The aarti film is
  option A. No clock or time display tied to scroll.

## Words the user gave (use exactly)

- Kanne swamy: ಕನ್ನೆ ಸ್ವಾಮಿ / కన్నె స్వాములు
- ನೆಯ್ಯಭಿಷೇಕ, ಅನ್ನದಾನ, ಶರಣು ಘೋಷ, ಮಣಿಕಂಠ, ಮಾಲಿಕಾಪುರತ್ತಮ್ಮ; Telugu అన్నదానం
- Matha in Kannada: the user typed ಮಠ (which reads as "monastery"); the site uses ಮಾತಾ. Unconfirmed.
- Photo names, in the temple's format "Name | dd-mm-yyyy":
  Photos 1, 3 and Videos 1, 2 are "Padi Pooja at Temple | 12-11-2026"; Photos 2, 4, 5, 6 are
  "Kanne Puja, Home | 14-11-2026".
  Album "Padi Pooja, Mahesh Swamy's Home, Mullur | 16-11-2026": six videos (IMG_8986–8994) from the temple's
  Google Drive folder. Video 4 is cut to its first 12 s (the phone turned sideways after that). Its lit-steps
  clip (video 5) gives the silent loop that now opens the Gallery page.
- Large files: the user shares a Google Drive folder ("Anyone with the link"); download it with gdown into the
  scratchpad, compress with ffmpeg (540 px wide, crf 27, faststart), make a still per video.

All other terms and their sources are in `src/data/temple.ts` and the README.

## Where things live

- All content: `src/data/temple.ts` (terms, schedule, address names, kanne list, 18 steps per language,
  offerings, festivals, `padiPoojas`, albums, WhatsApp number).
- Add a padi pooja: one line in `padiPoojas` (date, temple or home, host, place, when, optional map
  link). It shows highlighted in Coming up and Events, and in the scrolling "Today / Tomorrow" notice
  (`src/components/Ticker.astro`), then drops off after its day. Example entry: Mahesh Swamy's home,
  Mullur, 16-11-2026, with a map link.
- Add an album: files in `public/media/gallery/<date>-<event>/` (photo-N.jpg, photo-N-sm.jpg,
  video-N.mp4, video-N.jpg) plus one entry in `albums`.
- Pages: `src/pages/` (index, gallery, poojas, festivals = Events, swamis, resources, visit). Components:
  `Sc`, `Ticker`, `Invite`, `Footer`, `Logo` (lamp mark in the header; placeholder until the temple gives its emblem). Scripts: `src/scripts/` (core: Lenis, GSAP, menu, sound; home;
  scrub; embers).
- The user decided against a Google Sheet for events for now (maybe later).

## Live site

- Live at **https://ayyappatemple-kodathi.vercel.app** (Vercel; the old kodathi.vercel.app address was removed).
  `site` in `astro.config.mjs` is set to it.
- Vercel deploys from `main`. The repository is now **techteamblr/kodathi**.
- The live site only changes when `main` is updated. **The user said (17-11-2026): don't wait for permission; once a
  change is done and tested, update `main` so it goes live.** Run the full suite first; never push a red build.

## The simple site (/simple/)

- A second, calm website (user, 17-11-2026: the main site is the grand one, this is the simple one; **keep both**).
  The user asked for the calm look of a white, copper-and-serif temple-trust site, and said a single page is
  not acceptable, so it is **eight pages**: Home, Our Temple, Poojas and Sevas, Events, Maala Dharana,
  Guruswamys, Gallery, Visit (`src/pages/simple/*`, menu in `src/data/simpleNav.ts`).
- Look: white and soft grey bands, one copper (`--copper` for big headings, `--copper-ink` for small text,
  `--copper-btn` for buttons, all checked for contrast), Playfair Display headings with a short line under,
  Open Sans text, round photos, the calm events list (`src/components/SEvents.astro`), a copper strip on top
  (shows "Today: …" on the day), a white bar with a full-screen menu (a `<dialog>`; Android back closes it).
- Files: `src/layouts/Simple.astro`, `src/styles/simple.css`, `src/scripts/simple.ts`, `tests/simple.spec.js`.
  Shared helpers for it and the mockups: `src/data/site.ts`.
- **No gate**, no films, no GSAP or Lenis, **no sound unless a visitor taps** (sharanu ghosha on Poojas).
- Same data as the main site, so a padi pooja, swamy or album added once shows on both. Same P0 rules.
- Live at https://ayyappatemple-kodathi.vercel.app/simple/. A separate address needs the user to add a domain
  in Vercel; then add a `vercel.json` rewrite from `/` to `/simple/` for that host only.
- Header and phone menu are white and calm (user, 17-11-2026: the dark ones looked like the old site). The
  copper strip turns into a link to today's or tomorrow's event; that event is a warm panel with Directions,
  Add to calendar and Ask on WhatsApp buttons, and is highlighted when reached from the strip.
- The Guruswamys page says nothing about other swamys being "to come" (user asked to remove that line).
- The five design mockups were removed (user, 17-11-2026).
- From an outside review (user, 17-11-2026): home shows both pooja times under the first buttons; guruswamy
  buttons say "Message a guruswamy on WhatsApp"; Visit has "Before you come" (footwear, dress, photos from
  `visitNotes` in temple.ts, shared with the main Visit page); long text is left-aligned, headings centred;
  gallery numbers photos within each album; 320 px header shows the menu as an icon.
  "Call the temple" uses the same number as WhatsApp, calls 10:00 am to 4:00 pm (user, 17-11-2026;
  `temple.phone`, `temple.callHours`). The user said to leave the season and the sevas as they are.
  Still open: when annadanam is served to devotees. Full Kannada/Telugu pages: **the user decided (17-11-2026) that Codex drafts the translations and
  the user reviews them** (`docs/three-languages-prompt.md`); drafts are marked and never go live unreviewed. The reviewer's first-visit questions (landmark, parking, access) were
  set aside by the user.

## Working rules

- Branch: `claude/elegant-darwin-wzn3ps` in techteamblr/kodathi. Commit and push there. Don't open a
  pull request unless asked.
- Commit messages end with the attribution lines the session gives. Never put model names in commits or
  files. Never send the user's email or name to outside services.
- Testing: Playwright in JavaScript (the user's preference). The full suite was green at 289 passed (about 10 minutes; run it in the background).
  `npx playwright test` builds and starts the preview server; if it says the web server "exited
  early", run `npx astro preview --port 4321 --host 127.0.0.1` yourself first. Don't rebuild while a
  test run is using `dist/`. Add tests with every change, in plain language, including phone and
  Android cases.
- Check visually: take phone screenshots with Playwright (Pixel 7 and 360 px) and look at them before
  saying something is done. Animations fade content in, so don't freeze the clock with
  `setFixedTime` for screenshots; use `setSystemTime`.
- Preview: a static copy is published as an artifact at
  https://claude.ai/artifact/XdRBXk8siGMFoqC22EjChp (rebuild `dist`, convert it to relative paths, and
  republish the changed files to that same URL).
- ElevenLabs credits are almost used up, so fix films with ffmpeg rather than re-rendering.
- Plan big changes and get the user's approval first. Keep replies plain and short; the user reads them
  on the phone.

## Status and what's next

Done: home page (gate, films, now bar, today, maala dharana tracker, coming up, gallery preview,
guruswamys, sevas, sharanam calls, 18-step climb, visit), Gallery page (v3: film inside the word, a pinned photo where album covers slide over each other with a small caption (the user wants no giant names there), full-screen albums that peel on scroll; filter buttons hidden until 7 albums), lamp logo in the header, Poojas, Events
(with the Invite our swamys form), Visit, the scrolling notice, the phone review, Android back.

Events page done: padi pooja block, day and start time, Add to calendar (Google Calendar; .ics for iPhones),
Directions (`src/data/events.ts`, `tests/events.spec.js`).

Swamis page done (`/swamis/`, `swamis` in temple.ts, `tests/swamis.spec.js`): placeholders until the user sends
names and photos; then fill `name`/`photo` and add swamys as lines.

Home page reworked to be about our temple (temple name, road and a line about it over the lamp film, `about`
text, `tests/temple.spec.js`).
Not approved yet, only proposed: an "Our temple" block straight after the first screen, and moving the
generated films further down. The user also has a homepage mockup on their Mac; its review is set aside.

Resources page done (`/resources/`, `tests/resources.spec.js`): 108 sharanams with chant-along, ninaadalu,
Loka Veeram, namaskara shlokas, Ayyappa stotram, Harivarasanam, 18 steps, deeksha link. Texts come from Vaidika
Vignanam exactly as published (`scripts/sources/` → `scripts/build-texts.py` → `src/data/texts.json`); never
retype or "correct" them by hand. A guruswamy still has to check them.

Next:
1. Before going live: go through the checklist in README.md with the user, starting with the "what to
   call someone wearing the mala" names. Also the real WhatsApp number (placeholder now), guruswamy
   names and photos, the Kannada pooja names, and the priest's check of words and the 18-step order.
   Then deploy to the temple's own domain.
