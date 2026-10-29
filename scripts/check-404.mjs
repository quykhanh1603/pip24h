#!/usr/bin/env node
// Verify that unknown URLs answer with a real HTTP 404 instead of a soft 404 (HTTP 200).
//
//   node scripts/check-404.mjs           Check the local build (runs after `npm run build`).
//   node scripts/check-404.mjs --live    Request random unknown paths on https://pip24h.com.
//
// Cloudflare Pages serves `/404.html` — with a 404 status — for any request that matches no
// asset and no `_redirects` rule, but only when that file exists in the output directory.
// Without it Pages falls back to `/index.html` and answers 200, so Google indexes junk URLs,
// the crawl budget is wasted, and broken inbound links look healthy to analytics.
//
// `/go/<slug>/` must keep redirecting (302) rather than falling into the 404 page, so the live
// run also replays one affiliate rule straight out of `dist/_redirects`.
//
// Exit code 1 when the 404 page is missing, not `noindex`, or a live unknown URL returns 200.

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DIST = join(ROOT, 'dist');
const BASE = 'https://pip24h.com';
// The 404 page marks its content so this check cannot be fooled by the homepage being served.
const MARKER = /id="not-found"/i;
const NOINDEX = /<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i;

const live = process.argv.includes('--live');

let ok = true;

if (!live) {
	const file = join(DIST, '404.html');
	if (!existsSync(file)) {
		console.log('FAIL dist/404.html is missing — Cloudflare Pages will answer unknown URLs with 200.');
		process.exit(1);
	}
	const html = readFileSync(file, 'utf8');

	console.log('OK   dist/404.html exists.');
	if (MARKER.test(html)) console.log('OK   dist/404.html renders the not-found content.');
	else {
		console.log('FAIL dist/404.html does not contain id="not-found".');
		ok = false;
	}
	if (NOINDEX.test(html)) console.log('OK   dist/404.html is noindex.');
	else {
		console.log('FAIL dist/404.html is indexable — add `noindex` to the layout props.');
		ok = false;
	}

	// A sitemap entry for the error page would invite Google to crawl it.
	const sitemap = join(DIST, 'sitemap-0.xml');
	if (existsSync(sitemap) && /<loc>[^<]*\/404\/?<\/loc>/i.test(readFileSync(sitemap, 'utf8'))) {
		console.log('WARN /404/ is listed in dist/sitemap-0.xml — it must not be.');
		ok = false;
	}

	// The affiliate rules are appended to `_redirects` at build time; their absence means
	// `/go/<slug>/` would start hitting the 404 page instead of the partner site.
	const redirects = join(DIST, '_redirects');
	const goRules = existsSync(redirects)
		? readFileSync(redirects, 'utf8').split('\n').filter((line) => /^\/go\/\S+\s+https?:\/\//.test(line))
		: [];
	if (goRules.length > 0) console.log(`OK   dist/_redirects carries ${goRules.length} affiliate rule(s).`);
	else {
		console.log('FAIL dist/_redirects has no /go/<slug>/ rule — affiliate links would 404.');
		ok = false;
	}
} else {
	const stamp = Date.now();
	const unknown = [`/__pip24h-404-${stamp}/`, `/en/__pip24h-404-${stamp}/`, `/ja/__pip24h-404-${stamp}/`];

	for (const path of unknown) {
		try {
			const res = await fetch(BASE + path, {
				redirect: 'manual',
				headers: { 'user-agent': 'pip24h-404-check' }
			});
			const body = await res.text();
			const good = res.status === 404 && MARKER.test(body);
			console.log(`${good ? 'OK  ' : 'FAIL'} ${BASE}${path}  HTTP ${res.status}`);
			ok = good && ok;
		} catch (error) {
			console.log(`FAIL ${BASE}${path}  ${error.message}`);
			ok = false;
		}
	}

	// One real affiliate rule, straight from the build, must still redirect off-site.
	const redirects = join(DIST, '_redirects');
	const match = existsSync(redirects)
		? readFileSync(redirects, 'utf8').match(/^(\/go\/\S+)\s+https?:\/\//m)
		: null;
	if (match) {
		try {
			const res = await fetch(BASE + match[1], {
				redirect: 'manual',
				headers: { 'user-agent': 'pip24h-404-check' }
			});
			const good = res.status >= 300 && res.status < 400;
			console.log(`${good ? 'OK  ' : 'FAIL'} ${BASE}${match[1]}  HTTP ${res.status}`);
			ok = good && ok;
		} catch (error) {
			console.log(`FAIL ${BASE}${match[1]}  ${error.message}`);
			ok = false;
		}
	} else {
		console.log('NOTE  No dist/_redirects affiliate rule found — skipped the /go/ check.');
	}
}

process.exit(ok ? 0 : 1);
