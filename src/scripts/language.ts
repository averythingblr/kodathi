import { browserLanguage } from '../i18n';

document.querySelectorAll<HTMLAnchorElement>('a[data-language]').forEach((link) => {
  link.addEventListener('click', () => {
    try { localStorage.setItem('kodathi-script', link.dataset.language!); } catch { /* private/blocked storage */ }
    // Keep an album or section when switching, without adding stale overlay history.
    link.hash = location.hash;
  });
});
document.documentElement.dataset.language = browserLanguage();

// The language row makes the fixed main header taller, especially on small phones.
// Keep the home hero below it as fonts load and the phone rotates.
const header = document.querySelector<HTMLElement>('.head');
if (header) {
  const measure = () => document.documentElement.style.setProperty('--temple-header-height', `${header.getBoundingClientRect().height + 24}px`);
  measure();
  new ResizeObserver(measure).observe(header);
}
