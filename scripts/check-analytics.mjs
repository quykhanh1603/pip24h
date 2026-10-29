#!/usr/bin/env node
// Verify the analytics layers: the Cloudflare Web Analytics (RUM) beacon and Google Analytics 4.
//
//   node scripts/check-analytics.mjs                 Check the local build (dist/) — runs after `npm run build`.
//   node scripts/check-analytics.mjs --live          Check https://pip24h.com/{en,ja}/ after a Pages deploy.
//   node scripts/check-analytics.mjs --live <url…>   Check specific URLs.
//
// The beacon is injected by Cloudflare Pages *at the edge*, never by Astro, so `/go/<slug>/`
// (a 302 served from `_redirects`) can never be measured — affiliate clicks need their own
// server-side counter. `dist/` therefore only confirms the site can be instrumented (no
// `Cache-Control: no-transform` header blocking the injection).
//
// Google Analytics is the opposite: it comes from `src/components/GoogleAnalytics.astro` and is
// only emitted when PUBLIC_GA_ID is set at build time, so an absent tag is reported as INFO
// (not a failure) — what fails is a tag that loads *before* the Consent Mode v2 defaults.
//
// Exit code 1 when the beacon is missing, injected twice, or GA violates consent ordering.

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DIST = join(ROOT, 'dist');
const BEACON = /static\.cloudflareinsights\.com\/beacon(?:\.min)?\.js/i;
const TOKEN = /"token"\s*:\s*"([0-9a-f]{16,})"/i;
const GA_LOADER = /googletagmanager\.com\/gtag\/js\?id=(G-[A-Za-z0-9]+)/i;
// Matches both `gtag('consent', 'default', …)` and the layout's `window.gtag('consent', 'default', …)`.
const GA_CONSENT_DEFAULT = /['"]consent['"]\s*,\s*['"]default['"]/i;

const args = process.argv.slice(2);
const live = args.includes('--live');
const urls = args.filter((a) => !a.startsWith('--'));
if (live && urls.length === 0) urls.push('https://pip24h.com/en/', 'https://pip24h.com/ja/');

/** Walk a directory and return every .html file. */
function htmlFiles(dir) {
	const out = [];
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const full = join(dir, entry.name);
		if (entry.isDirectory()) out.push(...htmlFiles(full));
		else if (entry.name.endsWith('.html')) out.push(full);
	}
	return out;
}

function report(label, html) {
	const count = [...html.matchAll(new RegExp(BEACON.source, 'gi'))].length;
	const token = html.match(TOKEN)?.[1];
	const has = count > 0;
	console.log(`${has ? 'OK  ' : 'MISS'} ${label}${token ? `  (token ${token})` : ''}`);
	// Exactly one snippet per page: a manual copy in Layout.astro *plus* edge injection would
	// double-count every pageview.
	if (count > 1) console.log(`WARN ${label}  beacon present ${count}× — remove the manual snippet from the layout`);
	return has && count === 1;
}

/**
 * Consent defaults must be pushed before the tag is fetched. Our layout injects the loader
 * dynamically (`createElement('script')` after the commands are queued), so the only ordering
 * that can still be violated is a hand-written static `<script src="…gtag/js">` placed earlier.
 */
function consentBeforeLoader(html) {
	const consentAt = html.search(GA_CONSENT_DEFAULT);
	if (consentAt === -1) return false;
	const staticAt = html.search(/<script[^>]+src=["'][^"']*googletagmanager\.com\/gtag\/js/i);
	return staticAt === -1 || consentAt < staticAt;
}

/**
 * Google Analytics: `INFO` when the tag is simply not configured, `WARN`/failure when it is
 * fetched before the Consent Mode v2 defaults (that would set `_ga` without permission).
 */
function reportGa(label, html) {
	const loader = html.match(GA_LOADER);
	if (!loader) {
		console.log(`INFO GA not configured: ${label}`);
		return true;
	}
	if (!consentBeforeLoader(html)) {
		console.log(`WARN ${label}  GA loads before the Consent Mode v2 defaults`);
		return false;
	}
	console.log(`OK   GA ${label}  (${loader[1]}, consent defaults before loader)`);
	return true;
}

let ok = true;

if (live) {
	for (const url of urls) {
		try {
			const res = await fetch(url, { headers: { 'user-agent': 'pip24h-analytics-check' } });
			if (!res.ok) {
				console.log(`FAIL ${url}  HTTP ${res.status}`);
				ok = false;
				continue;
			}
			const html = await res.text();
			ok = report(url, html) && ok;
			ok = reportGa(url, html) && ok;
			// A page served with `public, no-transform` can never receive the injected beacon.
			const cc = res.headers.get('cache-control');
			if (cc?.includes('no-transform')) console.log(`WARN ${url}  Cache-Control: ${cc} blocks beacon injection`);
		} catch (error) {
			console.log(`FAIL ${url}  ${error.message}`);
			ok = false;
		}
	}
} else {
	if (!existsSync(DIST)) {
		console.log('FAIL dist/ not found — run `npm run build` first.');
		process.exit(1);
	}
	const files = htmlFiles(DIST);
	const hits = files.filter((file) => BEACON.test(readFileSync(file, 'utf8')));
	console.log(`dist/: ${files.length} HTML file(s), ${hits.length} with the beacon.`);
	if (hits.length === 0) {
		console.log('NOTE  Expected: Pages injects the snippet at the edge, so a clean build has none.');
		console.log('      Run with --live after enabling Web Analytics and deploying to verify.');
	} else {
		for (const file of hits.slice(0, 5)) console.log(`      ${file.replace(ROOT, '.')}`);
		if (hits.length > 5) console.log(`      … and ${hits.length - 5} more`);
	}
	// Google Analytics is baked in by Astro, so an unset PUBLIC_GA_ID shows up right here.
	// `/go/`, `/admin/`, `/publish/` and the root redirect are out of scope on purpose: they are
	// not content pages, and `/go/` never even reaches the browser (`_redirects` answers first).
	const contentPages = files.filter((file) => /[\\/](en|ja)[\\/]/.test(file));
	const gaPages = contentPages.filter((file) => GA_LOADER.test(readFileSync(file, 'utf8')));
	if (gaPages.length === 0) {
		console.log('dist/: no Google Analytics tag (PUBLIC_GA_ID was empty for this build).');
	} else {
		const id = readFileSync(gaPages[0], 'utf8').match(GA_LOADER)[1];
		console.log(`dist/: ${gaPages.length}/${contentPages.length} content page(s) with GA (${id}).`);
		const unsafe = gaPages.filter((file) => !consentBeforeLoader(readFileSync(file, 'utf8')));
		if (unsafe.length > 0) {
			console.log(`WARN  ${unsafe.length} page(s) load GA before the Consent Mode v2 defaults.`);
			ok = false;
		}
		if (gaPages.length !== contentPages.length) {
			console.log('WARN  Some content pages carry no GA tag — they do not render through Layout.astro.');
			ok = false;
		}
	}

	// `public, no-transform` prevents Cloudflare from modifying the response, so the beacon
	// is never injected — the only build artifact that can break this layer.
	const headers = join(DIST, '_headers');
	if (existsSync(headers) && /no-transform/i.test(readFileSync(headers, 'utf8'))) {
		console.log('WARN  dist/_headers contains `no-transform` — the beacon will not be injected.');
		ok = false;
	}
}

process.exit(ok ? 0 : 1);
