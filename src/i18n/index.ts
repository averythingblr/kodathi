import { en } from './en.ts';
import { kn } from './kn.ts';
import { te } from './te.ts';

export type Language = 'en' | 'kn' | 'te';
export type Translation = { text: string; status: 'draft' | 'reviewed' };
export const languages = ['kn', 'te', 'en'] as const;
export const dictionaries: Record<Language, Record<string, { text: string }>> = { en, kn, te };
export const languageFromPath = (path: string): Language => /^(?:\/simple)?\/(kn|te)(?:\/|$)/.exec(path)?.[1] as Language || 'en';
export function languagePath(path: string, lang: Language) {
  const url = new URL(path, 'https://temple.invalid');
  const simple = url.pathname.startsWith('/simple/');
  const tail = url.pathname.replace(simple ? /^\/simple\/(kn\/|te\/)?/ : /^\/(kn\/|te\/)?/, '');
  return `${simple ? '/simple/' : '/'}${lang === 'en' ? '' : lang + '/'}${tail}${url.search}${url.hash}`;
}

/** A blank or missing translation always returns the English source. Drafts remain usable for review. */
export function translate(key: string, lang: Language, values: Record<string, string | number> = {}, dictionary = dictionaries[lang]) {
  const source = dictionaries.en[key]?.text || key;
  const text = dictionary[key]?.text.trim() || source;
  return text.replace(/\{(\w+)\}/g, (_, name) => String(values[name] ?? `{${name}}`));
}
const normalize = (s: string) => s.replace(/\s+/g, ' ').trim();
const exact = new Map(Object.entries(en).map(([key, v]) => [normalize(v.text).toLowerCase(), key]));
const templates = Object.entries(en).filter(([, v]) => /\{\w+\}/.test(v.text)).map(([key, v]) => {
  const names: string[] = [];
  const pattern = normalize(v.text).split(/(\{\w+\})/).map((part) => {
    if (/^\{/.test(part)) {
      const name = part.slice(1, -1); names.push(name);
      if (['n', 'total', 'year', 'years'].includes(name)) return '([0-9]+)';
      if (name === 'phone') return '(\\+?[0-9][0-9 +()-]+)';
      if (name === 'when') return '(Evening|Morning)';
      if (name === 'what') return '(padi pooja|bhajana|a pooja)';
      if (name === 'person') return '([^,;:!?|\\n]{1,80})';
      if (name === 'place') return '([^,.;:!?|\\n]{1,100})';
      if (name === 'type') return '(photo|video)';
      if (name === 'count') return '([0-9]+ (?:photos?|videos?)(?: [·,] [0-9]+ (?:photos?|videos?))*)';
      if (name === 'album') return '(Padi Pooja(?: at Temple|, [^,]+’s Home, [^,]+)|Kanne Pooja, Home)';
      return '(.+?)';
    }
    return part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }).join('');
  return { key, names, regex: new RegExp(`^${pattern}$`, 'i'), weight: v.text.replace(/\{\w+\}/g, '').length };
}).sort((a, b) => b.weight - a.weight);

/** Rendered prose and data use the same page/section keys. No substring replacement inside names. */
export function textInLanguage(source: string, lang: Language, depth = 0): string {
  if (lang === 'en' || !source.trim() || depth > 4) return source;
  const s = normalize(source);
  let result: string | undefined;
  const key = exact.get(s.toLowerCase());
  if (key) result = translate(key, lang);
  else {
    for (const t of templates) {
      const m = t.regex.exec(s);
      if (!m) continue;
      const values = Object.fromEntries(t.names.map((name, i) => [name, ['person', 'phone', 'name', 'note', 'location', 'year', 'years', 'n', 'total'].includes(name) ? m[i + 1] : textInLanguage(m[i + 1], lang, depth + 1)]));
      result = translate(t.key, lang, values); break;
    }
  }
  if (!result && /[·✦|]/.test(s) && s.length > 1) result = s.split(/(\s*[·✦|]\s*)/).map((part) => /^[\s·✦|]*$/.test(part) ? part : textInLanguage(part, lang, depth + 1)).join('');
  if (!result && /^[0-9]+ (?:photos?|videos?), [0-9]+ (?:photos?|videos?)$/.test(s)) result = s.split(', ').map((part) => textInLanguage(part, lang, depth + 1)).join(', ');
  // Dates retain their actual value and digits. Only English calendar words change.
  if (/\d/.test(result || s)) {
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const weekdays = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    let date = result || s;
    for (const [i, month] of months.entries()) date = date.replace(new RegExp(`\\b(${month}|${month.slice(0,3)})\\b`, 'g'), new Intl.DateTimeFormat(lang + '-IN', { month: 'long' }).format(new Date(2026, i, 1)));
    for (const [i, day] of weekdays.entries()) date = date.replace(new RegExp(`\\b(${day}|${day.slice(0,3)})\\b`, 'g'), new Intl.DateTimeFormat(lang + '-IN', { weekday: 'long' }).format(new Date(2026, 10, 15 + i)));
    if (date !== s) result = date;
  }
  if (!result) return source;
  return source.replace(source.trim(), result);
}

export const browserLanguage = (): Language => typeof document === 'undefined' ? 'en' : (document.documentElement.lang as Language) || 'en';
export const tr = (source: string) => textInLanguage(source, browserLanguage());

export function trHTML(source: string) {
  if (browserLanguage() === 'en') return source;
  const template = document.createElement('template');
  template.innerHTML = source;
  const walker = document.createTreeWalker(template.content, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) walker.currentNode.textContent = tr(walker.currentNode.textContent || '');
  return template.innerHTML;
}
