#!/usr/bin/env node
// Verify that the Cloudflare Web Analytics (RUM) beacon is present.
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
// Exit code 1 when the beacon is missing, so this can gate a deploy check.

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DIST = join(ROOT, 'dist');
const BEACON = /static\.cloudflareinsights\.com\/beacon(?:\.min)?\.js/i;
const TOKEN = /"token"\s*:\s*"([0-9a-f]{16,})"/i;

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
	// `public, no-transform` prevents Cloudflare from modifying the response, so the beacon
	// is never injected — the only build artifact that can break this layer.
	const headers = join(DIST, '_headers');
	if (existsSync(headers) && /no-transform/i.test(readFileSync(headers, 'utf8'))) {
		console.log('WARN  dist/_headers contains `no-transform` — the beacon will not be injected.');
		ok = false;
	}
}

process.exit(ok ? 0 : 1);
