# Prompt: the site in three languages (English, Kannada, Telugu)

Paste this into a new Claude Code session on techteamblr/kodathi.

---

Read CLAUDE.md and README.md first and follow them (P0 rules: phones first, mainly Android; one regional
script at a time; real words only, never translated; never invent facts; don't touch the gate).

Goal: the whole site (all page text, not only the terms) can be read in English, Kannada or Telugu.
The translations are written by a person who writes these languages. **You never translate, machine-
translate or "improve" any Kannada or Telugu text.** Your job is the structure, the translator's sheet,
and putting their words in exactly as given.

1. **Plan first, and wait for my approval before building.** In the plan, cover:
   - How the language is chosen: a clear switch (English / ಕನ್ನಡ / తెలుగు) in the header and the menu,
     remembered on the phone, with its own address per language (for example `/`, `/kn/`, `/te/`) so a
     link can be shared on WhatsApp in one language.
   - How it fits the ಕ / తె script switch we have now: on the Kannada site everything regional is in
     Kannada, on the Telugu site in Telugu, never both on one screen. English pages keep today's behaviour.
   - Where the text lives: one file of strings per language (English as the source), keyed by page and
     section, with `src/data/temple.ts` content (sevas, festivals, about, kanne list, swamys' lines)
     moved or keyed the same way.
   - What happens to a line with no translation yet: show the English line, and list it as missing.
     Never leave a blank and never fill it in yourself.
   - What stays as it is: names of people and places, dates, times, the WhatsApp number, the 108 sharanams
     and other texts from Vaidika Vignanam (`src/data/texts.json`, already in both scripts from source).
   - The WhatsApp messages the buttons prepare: say whether they follow the language.
   - Fonts for Kannada and Telugu body text that read well on cheap Android phones, and that long
     Kannada and Telugu words still fit at 360 px with no sideways scroll.

2. **Make the translator's sheet.** A spreadsheet (one row per line: key, page, where it shows, English,
   Kannada, Telugu, notes) that the translator can fill on a phone or computer, plus a script that reads
   it back into the string files. Put the Kannada and Telugu words we already have from the user
   (CLAUDE.md, "Words the user gave") in their cells, marked as given by the user.

3. **Build it** after approval: the switch, the language addresses, English fallback, a "missing
   translations" report (`npm run missing` or similar) for me to send to the translator.

4. **Test** with Playwright in JavaScript, in plain language, phone first (Pixel 7, 360 px, 412 px):
   each page opens in all three languages; the choice is remembered; Android back still closes the
   menu and the photo viewer; no screen shows Kannada and Telugu together; nothing goes off screen;
   tap targets stay at least 44 px; a missing line shows the English one. Run the full suite in the
   background and take phone screenshots of every page in each language before saying it is done.

5. Commit and push to the working branch. Do not update `main` (the live site) until I say "go live".

Keep replies plain and short; I read them on my phone.
