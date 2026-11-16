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
- **Padi pooja is not daily.** It happens when someone offers it: Thursday evenings at the temple, and
  at homes on request. Don't write "not every week", "usually" and the like.
- Families and other temples **invite our swamys** (guruswamys and swamys) for padi pooja or bhajana at
  their homes or temples. The guruswamy confirms personally. The site's invite form only prepares a
  WhatsApp message; it never "books" or confirms.
- **Our Guruswamys and Swamys**: the Chief Guruswamy comes first (has worn the mala since 1998), then the
  Guruswamy, then the swamys. No "priest". Names and photos still to come, so keep the placeholders.
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
- Pages: `src/pages/` (index, gallery, poojas, festivals = Events, visit). Components:
  `Sc`, `Ticker`, `Invite`, `Footer`. Scripts: `src/scripts/` (core: Lenis, GSAP, menu, sound; home;
  scrub; embers).
- The user decided against a Google Sheet for events for now (maybe later).

## Working rules

- Branch: `claude/elegant-darwin-wzn3ps` in averythingblr/kodathi. Commit and push there. Don't open a
  pull request unless asked.
- Commit messages end with the attribution lines the session gives. Never put model names in commits or
  files. Never send the user's email or name to outside services.
- Testing: Playwright in JavaScript (the user's preference). The full suite was green at 197 passed.
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
guruswamys, sevas, sharanam calls, 18-step climb, visit), Gallery page (v2 motion), Poojas, Events
(with the Invite our swamys form), Visit, the scrolling notice, the phone review, Android back.

Next, in order:
1. Events page: Thursday padi poojas, home poojas, festivals, "Add to calendar", Directions.
2. Swamis page: Chief Guruswamy, Guruswamy, swamys (placeholders until the user sends names and photos).
3. Resources page: sharanu ghosha, shlokas, ninaadalu, the deeksha, the 18 steps. Published Kannada and
   Telugu texts with sources, showing only the selected language.
4. Before going live: go through the checklist in README.md with the user, starting with the "what to
   call someone wearing the mala" names. Also the real WhatsApp number (placeholder now), guruswamy
   names and photos, the Kannada pooja names, and the priest's check of words and the 18-step order.
   Then deploy to the temple's own domain.
