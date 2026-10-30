import { getCollection, type CollectionEntry } from 'astro:content';
import { getRegulator, matchRegulator, type Regulator, type Tier } from './regulators';

// Pip24h Score — a transparent 0–10 broker score built from five indexes.
// The formula is published on /[lang]/methodology/; keep that page in sync when changing anything here.
// Affiliate status is deliberately NOT an input.

type Broker = CollectionEntry<'brokers'>;
export type LicenseStatus = 'verified' | 'unverified' | 'revoked' | 'clone-warning';
export type IndexKey = 'regulation' | 'business' | 'costs' | 'platforms' | 'editorial';

export interface License {
	regulator?: Regulator;
	/** Original text, used when the regulator is not in our directory. */
	label: string;
	number?: string;
	entity?: string;
	status: LicenseStatus;
	verifiedDate?: Date;
}

export interface BrokerScore {
	total: number;
	indexes: Record<IndexKey, number>;
	licenses: License[];
	warnings: ('revoked' | 'clone-warning' | 'offshore-only' | 'unrecognized' | 'unregulated')[];
}

export const weights: Record<IndexKey, number> = {
	regulation: 0.35,
	business: 0.2,
	costs: 0.15,
	platforms: 0.15,
	editorial: 0.15
};

export const tierPoints: Record<Tier, number> = { 1: 5, 2: 3.5, 3: 1.5 };
/** Flat credit for declared registrations we can't map to a regulator (e.g. crypto VASP registrations), counted once. */
export const unrecognizedPoints = 1;
export const statusFactor: Record<LicenseStatus, number> = { verified: 1, unverified: 0.85, revoked: 0, 'clone-warning': 0 };
export const majorPlatforms = ['MetaTrader 4', 'MetaTrader 5', 'cTrader', 'TradingView'];

const clamp = (n: number) => Math.min(10, Math.max(0, n));
const round1 = (n: number) => Math.round(n * 10) / 10;

export function slugOf(entry: Broker) {
	return entry.id.split('/').slice(1).join('/');
}

export function getLicenses(broker: Broker): License[] {
	const { licenses, regulation } = broker.data;
	const declared = regulation.map((text) => ({
		regulator: matchRegulator(text),
		label: text,
		number: text.match(/License\s+([A-Z0-9/-]+)/i)?.[1],
		status: 'unverified' as const
	}));
	// An empty list (Decap CMS saves one by default) falls back to `regulation` too.
	if (!licenses?.length) return declared;
	// Structured licences replace `regulation` entries for the same regulator. Entries for any other
	// body (outside our directory, or added to it after the structured list was written) are kept.
	const structuredKeys = new Set(licenses.map((l) => l.regulator));
	return [
		...licenses.map((l) => {
			const regulator = getRegulator(l.regulator);
			return { ...l, regulator, label: regulator?.abbr ?? l.regulator };
		}),
		...declared.filter((l) => !l.regulator || !structuredKeys.has(l.regulator.key))
	];
}

function regulationIndex(licenses: License[]) {
	// One regulator counts once (its best-status licence), so duplicate entities don't inflate the score.
	const best = new Map<string, number>();
	for (const l of licenses) {
		const key = l.regulator?.key ?? '_unrecognized';
		const points = (l.regulator ? tierPoints[l.regulator.tier] : unrecognizedPoints) * statusFactor[l.status];
		best.set(key, Math.max(best.get(key) ?? 0, points));
	}
	return clamp([...best.values()].reduce((a, b) => a + b, 0));
}

function businessIndex(foundedYear?: number) {
	if (!foundedYear) return 3;
	const years = new Date().getFullYear() - foundedYear;
	return clamp(2 + years * 0.4);
}

function costsIndex(spreadFrom?: string) {
	if (!spreadFrom) return 5;
	const pips = spreadFrom.match(/([\d.]+)\s*pips?/i);
	if (pips) {
		const v = parseFloat(pips[1]);
		return v <= 0.2 ? 9 : v <= 0.5 ? 8 : v <= 0.9 ? 7 : v <= 1.5 ? 5 : 3;
	}
	const pct = spreadFrom.match(/([\d.]+)\s*%/);
	if (pct) {
		const v = parseFloat(pct[1]);
		return v <= 0.02 ? 9 : v <= 0.05 ? 8 : v <= 0.1 ? 7 : 5;
	}
	return 5;
}

function platformsIndex(platforms: string[], assetType: Broker['data']['assetType']) {
	// Crypto exchanges don't offer MetaTrader, so their own web/app platforms are weighted higher.
	if (assetType === 'crypto') return clamp(4 + platforms.length * 2);
	const majors = platforms.filter((p) => majorPlatforms.includes(p)).length;
	const others = Math.min(3, platforms.length - majors);
	return clamp(2 + majors * 2 + others);
}

/** Score a broker. Always pass the `en/` entry — it holds the canonical, untranslated data. */
export function scoreBroker(broker: Broker): BrokerScore {
	const d = broker.data;
	const licenses = getLicenses(broker);
	const computed: Record<IndexKey, number> = {
		regulation: regulationIndex(licenses),
		business: businessIndex(d.foundedYear),
		costs: costsIndex(d.spreadFrom),
		platforms: platformsIndex(d.platforms, d.assetType),
		editorial: clamp(d.rating * 2)
	};
	const indexes = Object.fromEntries(
		(Object.keys(computed) as IndexKey[]).map((k) => [k, round1(d.scoreOverrides?.[k] ?? computed[k])])
	) as Record<IndexKey, number>;
	const total = round1((Object.keys(weights) as IndexKey[]).reduce((sum, k) => sum + indexes[k] * weights[k], 0));

	const warnings: BrokerScore['warnings'] = [];
	if (licenses.some((l) => l.status === 'revoked')) warnings.push('revoked');
	if (licenses.some((l) => l.status === 'clone-warning')) warnings.push('clone-warning');
	const active = licenses.filter((l) => statusFactor[l.status] > 0);
	const recognized = active.filter((l) => l.regulator);
	if (active.length === 0) warnings.push('unregulated');
	else if (recognized.length === 0) warnings.push('unrecognized');
	else if (recognized.every((l) => l.regulator!.tier === 3)) warnings.push('offshore-only');

	return { total, indexes, licenses, warnings };
}

let cache: Promise<Map<string, { entry: Broker; score: BrokerScore }>> | undefined;

/** Scores for every broker, keyed by slug, computed once per build from the English entries. */
export function getBrokerScores() {
	cache ??= getCollection('brokers', (e) => e.id.startsWith('en/')).then(
		(entries) => new Map(entries.map((entry) => [slugOf(entry), { entry, score: scoreBroker(entry) }]))
	);
	return cache;
}

export function scoreBand(total: number) {
	return total >= 8 ? 'excellent' : total >= 6.5 ? 'good' : total >= 5 ? 'average' : 'weak';
}
