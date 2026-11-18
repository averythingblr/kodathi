import { en } from '../src/i18n/en.ts';
import { kn } from '../src/i18n/kn.ts';
import { te } from '../src/i18n/te.ts';
import { writeFileSync } from 'node:fs';

const keys = Object.keys(en);
for (const [language, dictionary] of Object.entries({ kn, te })) {
  const missing = keys.filter((key) => !dictionary[key]?.text?.trim());
  const drafts = keys.filter((key) => dictionary[key]?.status === 'draft');
  console.log(`${language}: ${missing.length} missing, ${drafts.length} draft, ${keys.length - missing.length - drafts.length} reviewed`);
  if (missing.length) console.log('Missing:\n' + missing.join('\n'));
  if (drafts.length) console.log('Draft:\n' + drafts.join('\n'));
}
if (process.argv.includes('--review-sheet')) {
  const csv = (s) => '"' + String(s ?? '').replace(/"/g, '""') + '"';
  const rows = [['key', 'page', 'where it shows', 'English', 'Kannada', 'Telugu', 'status', 'notes']];
  for (const [key, source] of Object.entries(en)) rows.push([key, source.page, source.where, source.text, kn[key]?.text || '', te[key]?.text || '', kn[key]?.status === 'reviewed' && te[key]?.status === 'reviewed' ? 'reviewed' : 'draft', source.notes]);
  writeFileSync(new URL('../docs/translations-review.csv', import.meta.url), '\uFEFF' + rows.map((row) => row.map(csv).join(',')).join('\r\n') + '\r\n');
  console.log('Updated docs/translations-review.csv');
}
