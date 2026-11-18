import { browserLanguage } from '../i18n';

document.querySelectorAll<HTMLAnchorElement>('a[data-language]').forEach((link) => {
  link.addEventListener('click', () => {
    try { localStorage.setItem('kodathi-script', link.dataset.language!); } catch { /* private/blocked storage */ }
    // Keep an album or section when switching, without adding stale overlay history.
    link.hash = location.hash;
  });
});
document.documentElement.dataset.language = browserLanguage();
