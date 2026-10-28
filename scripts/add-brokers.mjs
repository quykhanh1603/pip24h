#!/usr/bin/env node
// Broker intake pipeline for the daily automation (see automation/DAILY_BROKER_RUN.md).
//
//   node scripts/add-brokers.mjs seed <file>   Append URLs (txt: one per line; csv: url[,aff]) to the queue.
//   node scripts/add-brokers.mjs next [n]      Print the next n pending queue rows as JSON (default 10),
//                                              with logo candidates from public/images/brokers/.
//   node scripts/add-brokers.mjs import        Turn automation/inbox/*.json into en/ja broker files,
//                                              update the queue and archive the JSON.
//   node scripts/add-brokers.mjs stats         Queue counts by status.
//
// Research JSON format: automation/broker-schema.example.json.

import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const p = (...parts) => join(ROOT, ...parts);
const QUEUE = p('automation', 'broker-queue.csv');
const INBOX = p('automation', 'inbox');
const PROCESSED = p('automation', 'processed');
const BROKERS = p('src', 'content', 'brokers');
const LOGOS = p('public', 'images', 'brokers');
const QUEUE_HEADER = ['url', 'aff', 'slug', 'status', 'date', 'note'];

const today = () => new Date().toISOString().slice(0, 10);

// ---------- CSV ----------

function parseCsv(text) {
	const rows = [];
	let row = [];
	let field = '';
	let quoted = false;
	for (let i = 0; i < text.length; i++) {
		const c = text[i];
		if (quoted) {
			if (c === '"' && text[i + 1] === '"') (field += '"'), i++;
			else if (c === '"') quoted = false;
			else field += c;
		} else if (c === '"') quoted = true;
		else if (c === ',') row.push(field), (field = '');
		else if (c === '\n' || c === '\r') {
			if (c === '\r' && text[i + 1] === '\n') i++;
			row.push(field), rows.push(row), (row = []), (field = '');
		} else field += c;
	}
	if (field || row.length) row.push(field), rows.push(row);
	return rows.filter((r) => r.some((f) => f.trim()));
}

const csvField = (v = '') => (/[",\n\r]/.test(v) ? `"${String(v).replace(/"/g, '""')}"` : String(v));

function readQueue() {
	if (!existsSync(QUEUE)) return [];
	const [header, ...rows] = parseCsv(readFileSync(QUEUE, 'utf8'));
	return rows.map((r) => Object.fromEntries(header.map((h, i) => [h.trim(), (r[i] ?? '').trim()])));
}

function writeQueue(rows) {
	const lines = [QUEUE_HEADER.join(','), ...rows.map((r) => QUEUE_HEADER.map((h) => csvField(r[h])).join(','))];
	writeFileSync(QUEUE, lines.join('\n') + '\n');
}

// ---------- slugs & existing data ----------

const SUBDOMAINS = new Set(['www', 'my', 'en', 'int', 'global', 'secure', 'portal', 'client', 'clients', 'app', 'go', 'trade', 'eu', 'uk']);
const SECOND_LEVEL = new Set(['com', 'co', 'net', 'org', 'ltd', 'gov']);

export function slugFromUrl(url) {
	const host = new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`).hostname.toLowerCase();
	const labels = host.split('.');
	labels.pop(); // TLD
	if (labels.length > 1 && SECOND_LEVEL.has(labels.at(-1))) labels.pop(); // e.g. .com.au
	while (labels.length > 1 && SUBDOMAINS.has(labels[0])) labels.shift();
	return labels.at(-1).replace(/[^a-z0-9-]/g, '');
}

const normalize = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

function existingSlugs() {
	const slugs = new Set();
	for (const dir of [join(BROKERS, 'en'), p('src', 'content', 'propfirms', 'en')]) {
		for (const f of readdirSync(dir)) if (f.endsWith('.md')) slugs.add(f.slice(0, -3));
	}
	return slugs;
}

function logoCandidates(slug) {
	const n = normalize(slug);
	return readdirSync(LOGOS, { withFileTypes: true })
		.filter((d) => d.isDirectory())
		.map((d) => d.name)
		.filter((name) => {
			const m = normalize(name);
			return m === n || (m.length >= 4 && (n.startsWith(m) || m.startsWith(n)));
		})
		.flatMap((name) =>
			readdirSync(join(LOGOS, name))
				.filter((f) => /^logo\.(png|jpe?g|webp|svg)$/i.test(f))
				.map((f) => `/images/brokers/${name}/${f}`)
		);
}

function regulatorKeys() {
	const src = readFileSync(p('src', 'data', 'regulators.ts'), 'utf8');
	return new Set([...src.matchAll(/^\t\tkey: '([^']+)'/gm)].map((m) => m[1]));
}

// ---------- commands ----------

function seed(file) {
	if (!file) throw new Error('Usage: seed <file>');
	const text = readFileSync(file, 'utf8');
	const rows = file.toLowerCase().endsWith('.csv') ? parseCsv(text) : text.split(/\r?\n/).map((l) => [l]);
	const queue = readQueue();
	const taken = new Set([...existingSlugs(), ...queue.map((r) => r.slug)]);
	let added = 0;
	const dupes = [];
	const bad = [];
	for (const [rawUrl = '', aff = ''] of rows) {
		const url = rawUrl.trim();
		if (!url || /^url$/i.test(url)) continue;
		let slug;
		try {
			slug = slugFromUrl(url);
		} catch {
			bad.push(url);
			continue;
		}
		if (taken.has(slug)) {
			dupes.push(`${slug} (${url})`);
			continue;
		}
		taken.add(slug);
		queue.push({ url, aff: aff.trim(), slug, status: 'pending', date: '', note: '' });
		added++;
	}
	writeQueue(queue);
	console.log(`Added ${added} brokers to the queue. Skipped ${dupes.length} duplicates, ${bad.length} invalid URLs.`);
	if (dupes.length) console.log('Duplicates:\n  ' + dupes.join('\n  '));
	if (bad.length) console.log('Invalid:\n  ' + bad.join('\n  '));
}

function next(n = 10) {
	const pending = readQueue()
		.filter((r) => r.status === 'pending')
		.slice(0, Number(n));
	console.log(JSON.stringify(pending.map((r) => ({ ...r, logoCandidates: logoCandidates(r.slug) })), null, 2));
}

function stats() {
	const counts = {};
	for (const r of readQueue()) counts[r.status] = (counts[r.status] ?? 0) + 1;
	console.log(counts);
}

// ---------- import ----------

const y = (v) => `"${String(v).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\r?\n/g, ' ')}"`;
const yList = (key, items) => {
	const arr = (items ?? []).map((s) => String(s).trim()).filter(Boolean);
	return arr.length ? `${key}:\n${arr.map((i) => `  - ${y(i)}`).join('\n')}` : `${key}: []`;
};

const ASSET_TYPES = ['forex', 'crypto', 'both'];
const CATEGORIES = ['scalping', 'beginners', 'ecn', 'low-deposit'];
const STATUSES = ['verified', 'unverified', 'revoked', 'clone-warning'];

function validate(b, keys) {
	const errors = [];
	if (!b.slug || !/^[a-z0-9-]+$/.test(b.slug)) errors.push('slug must be lowercase letters, digits and hyphens');
	if (b.status === 'skip') return errors;
	if (!b.name) errors.push('name is required');
	if (!ASSET_TYPES.includes(b.assetType)) errors.push(`assetType must be one of ${ASSET_TYPES}`);
	if (typeof b.rating !== 'number' || b.rating < 1 || b.rating > 4.5) errors.push('rating must be a number from 1 to 4.5');
	if (b.foundedYear !== undefined && !(Number.isInteger(b.foundedYear) && b.foundedYear > 1900 && b.foundedYear <= new Date().getFullYear()))
		errors.push('foundedYear must be a plausible year');
	if ((b.category ?? []).some((c) => !CATEGORIES.includes(c))) errors.push(`category items must be in ${CATEGORIES}`);
	for (const l of b.licenses ?? []) {
		if (!l.text) errors.push('every licence needs `text`, e.g. "ASIC (Australia)"');
		if (l.regulator && !keys.has(l.regulator)) errors.push(`unknown regulator key "${l.regulator}" (use null for regulators outside src/data/regulators.ts)`);
		if (l.status && !STATUSES.includes(l.status)) errors.push(`licence status must be one of ${STATUSES}`);
		if (l.status === 'verified' && !l.verifiedDate) errors.push('verified licences need verifiedDate');
	}
	if (!b.sources?.length) errors.push('at least one source URL is required');
	if (b.logo && !existsSync(p('public', b.logo))) errors.push(`logo ${b.logo} does not exist`);
	for (const lang of ['en', 'ja']) {
		const c = b[lang];
		if (!c?.summary || !c?.body) errors.push(`${lang}.summary and ${lang}.body are required`);
	}
	return errors;
}

function isThin(b) {
	const facts = [b.foundedYear, b.minDeposit, b.spreadFrom, b.maxLeverage, b.platforms?.length].filter(Boolean).length;
	const words = b.en.body.split(/\s+/).filter(Boolean).length;
	return !(b.licenses ?? []).length || facts < 3 || words < 120;
}

function markdown(b, lang, noindex) {
	const c = b[lang];
	const regulation = (b.licenses ?? []).map((l) => (l.number ? `${l.text} - License ${l.number}` : l.text));
	const structured = (b.licenses ?? []).filter((l) => l.regulator);
	const lines = [
		'---',
		`name: ${y(b.name)}`,
		`logo: ${y(b.logo ?? '')}`,
		'profileType: "profile"',
		...(b.website ? [`website: ${y(b.website)}`] : []),
		`assetType: ${y(b.assetType)}`,
		`rating: ${b.rating}`,
		`summary: ${y(c.summary)}`,
		...(b.foundedYear ? [`foundedYear: ${b.foundedYear}`] : []),
		...['minDeposit', 'spreadFrom', 'maxLeverage'].filter((k) => c[k] ?? b[k]).map((k) => `${k}: ${y(c[k] ?? b[k])}`),
		`instantWithdrawal: ${b.instantWithdrawal === true}`,
		yList('category', b.category),
		yList('regulation', regulation)
	];
	if (structured.length) {
		lines.push('licenses:');
		for (const l of structured) {
			lines.push(`  - regulator: ${y(l.regulator)}`);
			if (l.number) lines.push(`    number: ${y(l.number)}`);
			if (l.entity) lines.push(`    entity: ${y(l.entity)}`);
			lines.push(`    status: ${y(l.status ?? 'unverified')}`);
			if (l.verifiedDate) lines.push(`    verifiedDate: ${l.verifiedDate}`);
		}
	}
	lines.push(
		yList('platforms', b.platforms),
		yList('pros', c.pros),
		yList('cons', c.cons),
		yList('sources', b.sources),
		`affiliateUrl: ${y(b.affiliateUrl || `AFF_LINK_PLACEHOLDER_${b.slug.toUpperCase().replace(/-/g, '_')}`)}`,
		'featured: false',
		...(noindex ? ['noindex: true'] : []),
		`updatedDate: ${today()}`,
		'---',
		'',
		c.body.trim(),
		''
	);
	return lines.join('\n');
}

function importInbox() {
	mkdirSync(INBOX, { recursive: true });
	const files = readdirSync(INBOX).filter((f) => f.endsWith('.json'));
	const queue = readQueue();
	const taken = existingSlugs();
	const keys = regulatorKeys();
	const archive = join(PROCESSED, today());
	const report = { added: [], skipped: [], failed: [] };

	for (const file of files) {
		const b = JSON.parse(readFileSync(join(INBOX, file), 'utf8'));
		// Match by URL first: the run may rename a slug that doesn't read as the brand.
		const row = queue.find((r) => r.url === b.queueUrl) ?? queue.find((r) => r.slug === b.slug);
		const errors = validate(b, keys);
		if (!errors.length && b.status !== 'skip' && taken.has(b.slug)) errors.push(`slug "${b.slug}" already exists`);
		if (errors.length) {
			report.failed.push(`${file}: ${errors.join('; ')}`);
			continue; // left in the inbox so the run can fix it
		}
		if (b.status === 'skip') {
			if (row) Object.assign(row, { status: 'skipped', date: today(), note: b.skipReason ?? '' });
			report.skipped.push(`${b.slug}: ${b.skipReason ?? ''}`);
		} else {
			b.affiliateUrl ||= row?.aff;
			const noindex = isThin(b);
			for (const lang of ['en', 'ja']) writeFileSync(join(BROKERS, lang, `${b.slug}.md`), markdown(b, lang, noindex));
			if (row) Object.assign(row, { slug: b.slug, status: 'done', date: today(), note: noindex ? 'noindex (thin)' : '' });
			taken.add(b.slug);
			report.added.push(`${b.slug}${noindex ? ' (noindex)' : ''}`);
		}
		mkdirSync(archive, { recursive: true });
		renameSync(join(INBOX, file), join(archive, file));
	}
	writeQueue(queue);
	console.log(JSON.stringify(report, null, 2));
	if (report.failed.length) process.exitCode = 1;
}

const [cmd, arg] = process.argv.slice(2);
const commands = { seed: () => seed(arg), next: () => next(arg), import: importInbox, stats };
if (!commands[cmd]) {
	console.error('Usage: node scripts/add-brokers.mjs <seed <file>|next [n]|import|stats>');
	process.exit(1);
}
commands[cmd]();
