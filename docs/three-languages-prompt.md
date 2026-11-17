# Prompt: the site in three languages (English, Kannada, Telugu)

Paste this into Codex (or any coding agent) working on the GitHub repository techteamblr/kodathi.

---

You are working on the website of the Ayyappa Swamy Temple, Kodathi, Bengaluru (repository
techteamblr/kodathi, Astro). Read `CLAUDE.md` and `README.md` first and follow their rules: phones first
(mostly Android; check at 360 px, 412 px and Pixel 7), never invent facts, never show Kannada and Telugu on
the same screen, no sound that plays by itself, and don't touch the gate on the main site's home page.

There are two sites in one project:
- the calm site under `/simple/` (8 pages: `src/pages/simple/*`, `src/layouts/Simple.astro`,
  `src/styles/simple.css`, `src/scripts/simple.ts`, events list in `src/components/SEvents.astro`).
  **Do this one first.**
- the grand main site at `/` (`src/pages/*.astro`, `src/layouts/Base.astro`). Do it second, the same way.

## Goal

A Kannada-only or Telugu-only devotee can use the whole site in their language: the menu, buttons, page
text, timings, visit information, maala dharana guidance, sevas, events, the invite form and its messages.
English stays available. Today only some headings show Kannada/Telugu; the rest is English.

## 1. Plan first, then wait for approval

Write a short plan and stop for the owner's approval before building. Cover:
- **Language choice:** an explicit switch `ಕನ್ನಡ | తెలుగు | English` in the header and in the phone menu,
  remembered on the phone (reuse the `kodathi-script` localStorage key; add `en`). Each language gets its
  own address, e.g. `/simple/` (English), `/simple/kn/`, `/simple/te/`, so a link can be shared on WhatsApp
  in one language. Add `<html lang>` and `hreflang` links.
- **How it fits the current ಕ / తె switch:** on the Kannada site everything regional is Kannada, on the
  Telugu site everything is Telugu, never both on one screen. The English site keeps today's behaviour
  (English text with the chosen script's terms).
- **Where text lives:** one strings file per language (`src/i18n/en.ts`, `kn.ts`, `te.ts`), keyed by page
  and section, with English as the source. Content in `src/data/temple.ts` (sevas, festivals, about,
  kanne list, visit notes, swamys' lines, WhatsApp messages) gets the same keys.
- **Missing lines:** if a line has no translation yet, show the English line. Never leave a blank.
- **What never changes:** people's and place names, dates, times, the phone/WhatsApp number, and the texts
  in `src/data/texts.json` (108 sharanams, Harivarasanam etc. from Vaidika Vignanam, already in both
  scripts; never retype or "correct" them).
- **WhatsApp messages** the buttons prepare: in the page's language.
- **Fonts:** Kannada and Telugu body text must read well on cheap Android phones (the project has Noto Sans
  Kannada/Telugu and Tiro Kannada/Telugu). Long words must fit at 360 px with no sideways scroll.

## 2. Translations: draft them, mark them for review

The owner has decided you may draft the Kannada and Telugu text, and the owner will review it. So:
- Write natural, plain Kannada and Telugu as Ayyappa devotees in Karnataka and Andhra/Telangana speak:
  short sentences, everyday words, no literal word-for-word translation, no heavy Sanskrit where a common
  word exists.
- **Use these words exactly** where they apply (given by the temple): ಕನ್ನೆ ಸ್ವಾಮಿ / కన్నె స్వాములు,
  ನೆಯ್ಯಭಿಷೇಕ, ಅನ್ನದಾನ / అన్నదానం, ಶರಣು ಘೋಷ, ಮಣಿಕಂಠ, ಮಾಲಿಕಾಪುರತ್ತಮ್ಮ, ప్రాతఃకాల పూజ (morning pooja),
  సాయంకాల పూజ (evening pooja). Keep every Kannada/Telugu term already in `src/data/temple.ts`.
- Mark every line you drafted as `draft` in the strings files.
- Produce a **review sheet** the owner can read on a phone: `docs/translations-review.csv` with columns
  key, page, where it shows, English, Kannada, Telugu, status (draft / reviewed), notes. Put anything you
  are unsure of in notes.
- Add a script (`npm run translations`) that lists missing and still-draft lines per language.

## 3. Build (after approval)

The switch, the language addresses, the strings in every page and component (header, menu, footer,
buttons, aria-labels, form labels, form errors, the events list, the gallery viewer captions, the 41-day
counter's messages), English fallback, and the review sheet.

## 4. Test

Playwright in JavaScript, in plain language, phone first (Pixel 7, 360 px, 412 px), added to `tests/`:
- every page opens in all three languages with no console errors;
- the choice is remembered and the address changes;
- no screen shows Kannada and Telugu together;
- the menu, buttons and form labels are in the chosen language;
- a missing line falls back to English;
- Android back still closes the menu and the photo viewer;
- nothing scrolls sideways; every tap target is at least 44 px.
Run the whole suite (`npx playwright test`, about 11 minutes) and take phone screenshots of every page in
each language before saying it is done.

## 5. Deliver

Commit to the branch `claude/elegant-darwin-wzn3ps` with clear messages. Do not change `main` (the live
site) yourself: the owner reviews the translations first. End with a short summary: what was built, how
many lines are draft per language, and where the review sheet is.
