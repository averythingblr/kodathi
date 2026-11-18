# Reviewing Kannada and Telugu

Both sites have English, Kannada and Telugu pages. The English URL has no language prefix.

- Calm site: `/simple/`, `/simple/kn/`, `/simple/te/`.
- Grand site: `/`, `/kn/`, `/te/`.

The language chooser keeps the same page and section. Shared URLs determine the page language; a saved preference cannot silently change a WhatsApp link. `kodathi-script` remembers `en`, `kn` or `te`. English keeps the earlier regional-script toggle. The chooser itself names both regional languages; page content uses only the selected regional script.

`src/i18n/en.ts` contains the English source keys, grouped by page and section. Shared content refers directly to `src/data/temple.ts`; `src/i18n/temple-keys.ts` lists that connection. `kn.ts` and `te.ts` contain the same keys with `text` and `status`. Every drafted regional line is marked `draft`. No line is considered reviewed simply because tests pass.

Open `docs/translations-review.csv` on your phone in a spreadsheet app. Review one page/section at a time. Keep names, dates, times and numbers unchanged. The notes call out uncertainty, including the Kannada daily-pooja names, Matha and the spelling of Kannali Road. The 18-step lists retain their existing terms and order. Sacred texts in `src/data/texts.json` and their English transliterations are displayed from the original source without changes.

After accepting a line, change its status to `reviewed` in the relevant language file. The CSV status is `reviewed` only when both languages have been reviewed. Regenerate the CSV from the files rather than losing reviewed states by copying a new draft over them:

```sh
npm run translations
npm run translations -- --review-sheet
npm run check
npx playwright test
```

Missing or empty translations show their English source. Static HTML is translated during Astro prerendering, including metadata, accessibility labels, event data and prepared WhatsApp links. Interactive messages use the same keys. The main home-page gate is excluded from translation and retains its original entry choices. An invitation prepares a WhatsApp message; it never confirms a booking.

The owner initially requested branch-only review, then explicitly requested all changes pushed live. Draft status remains visible in these review files after deployment.
