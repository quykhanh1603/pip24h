// @ts-check
import { defineConfig } from 'astro/config';
import { readdirSync, readFileSync } from 'node:fs';

import tailwindcss from '@tailwindcss/vite';

import sitemap from '@astrojs/sitemap';

// Broker pages marked `noindex: true` (thin auto-added profiles) are left out of the sitemap.
const noindexPages = new Set();
for (const lang of ['en', 'ja']) {
  const dir = `./src/content/brokers/${lang}`;
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.md'))) {
    const frontmatter = readFileSync(`${dir}/${file}`, 'utf8').replace(/^﻿/, '').split(/^---\s*$/m)[1] ?? '';
    if (/^noindex:\s*true\s*$/m.test(frontmatter)) noindexPages.add(`/${lang}/reviews/${file.slice(0, -3)}/`);
  }
}

// https://astro.build/config
export default defineConfig({
  site: 'https://pip24h.com',

  i18n: {
    locales: ['en', 'ja'],
    defaultLocale: 'en',
    routing: {
      prefixDefaultLocale: true
    }
  },

  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [sitemap({ filter: (page) => !noindexPages.has(new URL(page).pathname) })]
});
