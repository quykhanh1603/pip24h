// @ts-check
import { defineConfig } from 'astro/config';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import tailwindcss from '@tailwindcss/vite';

import sitemap from '@astrojs/sitemap';

// A static `/go/<slug>/` page can only redirect with `<meta refresh>`, so the browser
// renders it first and the visitor sees a white "Redirecting to …" flash. Cloudflare
// Pages honours `_redirects`, so we emit real 302s for every affiliate slug at build
// time and the HTML page is never shown. Entries still on the AFF_LINK_PLACEHOLDER
// value are skipped, which keeps their HTML fallback (and its build warning) intact.
function affiliateRedirects() {
  return {
    name: 'pip24h:affiliate-redirects',
    hooks: {
      'astro:build:done': ({ dir, logger }) => {
        const outDir = fileURLToPath(dir);
        const goDir = path.join(outDir, 'go');
        if (!existsSync(goDir)) return;

        const rules = [];
        for (const entry of readdirSync(goDir, { withFileTypes: true })) {
          if (!entry.isDirectory()) continue;
          const page = path.join(goDir, entry.name, 'index.html');
          if (!existsSync(page)) continue;
          const html = readFileSync(page, 'utf8');
          const match = html.match(/<meta http-equiv="refresh" content="0;url=([^"]+)"/i);
          // Astro escapes `&` in attributes; `_redirects` needs the raw URL.
          const target = match?.[1]?.trim().replace(/&amp;/g, '&');
          if (!target || !/^https?:\/\//i.test(target)) continue;
          rules.push(`/go/${entry.name}/  ${target}  302`);
        }
        if (rules.length === 0) return;

        const file = path.join(outDir, '_redirects');
        const base = existsSync(file) ? readFileSync(file, 'utf8').replace(/\s*$/, '\n') : '';
        writeFileSync(
          file,
          `${base}# Affiliate click-throughs (generated from src/content/*/affiliateUrl at build time)\n${rules.join('\n')}\n`
        );
        logger.info(`_redirects: ${rules.length} affiliate 302 rule(s)`);
      }
    }
  };
}

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

  integrations: [sitemap({ filter: (page) => !noindexPages.has(new URL(page).pathname) }), affiliateRedirects()]
});
