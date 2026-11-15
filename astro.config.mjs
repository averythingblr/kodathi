// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://kodathi.vercel.app',
  build: { inlineStylesheets: 'auto' },
  devToolbar: { enabled: false },
});
