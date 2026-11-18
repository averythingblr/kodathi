import { parse, serialize } from 'parse5';
import type { DefaultTreeAdapterMap } from 'parse5';
import { languageFromPath, languagePath, textInLanguage, type Language } from './index.ts';
type Node = DefaultTreeAdapterMap['node'];

/** Prerender translation also covers attributes, data read by scripts and WhatsApp/calendar drafts. */
export function localizeHTML(html: string, path: string) {
  const lang = languageFromPath(path);
  if (lang === 'en') return html;
  const tree = parse(html);
  const visit = (node: Node, preserve = false) => {
    if ('tagName' in node) {
      const attrs = node.attrs;
      const get = (name: string) => attrs.find((a) => a.name === name)?.value;
      const cls = (get('class') || '').split(' ');
      // Source prayers, their English transliterations, scripts, styles and gate are never rewritten.
      preserve ||= get('data-preloader') !== undefined || get('data-i18n-preserve') !== undefined || cls.some((c) => ['rx-en', 'rx-sc', 'rx-text__sc', 'rx-head__sc', 'pre'].includes(c)) || ['style', 'script'].includes(node.tagName);
      if (!preserve) {
        for (const attr of attrs) {
          if (['aria-label', 'title', 'alt', 'placeholder', 'data-name', 'data-title', 'data-alt', 'data-album', 'data-when'].includes(attr.name)) attr.value = textInLanguage(attr.value, lang);
          if (attr.name === 'content' && ['description', 'og:title', 'og:description'].includes(get('name') || get('property') || '')) attr.value = textInLanguage(attr.value, lang);
          if ((attr.name === 'href' || attr.name === 'data-events-page') && !attrs.some((a) => a.name === 'data-language')) attr.value = localizeLink(attr.value, lang);
          if (attr.name === 'lang' && attr.value === 'en' && !get('data-language')) attr.value = lang;
        }
      }
      // Keep data-sc nodes for interactive scripts and the original lists. CSS selects one script.
      if ('content' in node) visit(node.content, preserve);
    }
    if (node.nodeName === '#text' && 'value' in node && !preserve) node.value = textInLanguage(node.value, lang);
    if ('childNodes' in node) for (const child of node.childNodes) visit(child, preserve);
  };
  visit(tree);
  return serialize(tree);
}

export function localizeLink(href: string, lang: Language) {
  if (/^\/(?:simple\/)?(?:$|(?:kn\/|te\/)?(?:temple|poojas|events|maala-dharana|swamis|gallery|visit|festivals|resources)\/)/.test(href)) return languagePath(href, lang);
  if (href.startsWith('https://wa.me/') || href.startsWith('https://calendar.google.com/')) {
    const url = new URL(href);
    for (const key of ['text', 'details']) if (url.searchParams.has(key)) url.searchParams.set(key, url.searchParams.get(key)!.split('\n').map((line) => textInLanguage(line, lang)).join('\n'));
    return url.href;
  }
  return href;
}
