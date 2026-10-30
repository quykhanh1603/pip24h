// Financial regulators used by the Pip24h Score and the regulator directory.
// Tier drives the Regulation index (see broker-score.ts):
//   1 = top-tier (strict capital rules, client-money segregation, compensation scheme)
//   2 = strong (MiFID / onshore regulators with solid enforcement)
//   3 = offshore (light-touch, low capital requirements, little investor protection)
// `aliases` match the start of the free-text `regulation` strings in broker frontmatter.
// `website` points at the regulator's own site or public register — double-check before relying on it.

export type Tier = 1 | 2 | 3;

export interface Regulator {
	key: string;
	abbr: string;
	name: { en: string; ja: string };
	country: { en: string; ja: string };
	tier: Tier;
	website: string;
	aliases: RegExp[];
}

export const regulators: Regulator[] = [
	{
		key: 'fca',
		abbr: 'FCA',
		name: { en: 'Financial Conduct Authority', ja: '金融行為監督機構' },
		country: { en: 'United Kingdom', ja: 'イギリス' },
		tier: 1,
		website: 'https://register.fca.org.uk/',
		aliases: [/^FCA\b/i]
	},
	{
		key: 'asic',
		abbr: 'ASIC',
		name: { en: 'Australian Securities and Investments Commission', ja: 'オーストラリア証券投資委員会' },
		country: { en: 'Australia', ja: 'オーストラリア' },
		tier: 1,
		website: 'https://asic.gov.au/online-services/search-asic-s-registers/',
		aliases: [/^ASIC\b/i]
	},
	{
		key: 'nfa',
		abbr: 'CFTC/NFA',
		name: { en: 'Commodity Futures Trading Commission / National Futures Association', ja: '米商品先物取引委員会／全米先物協会' },
		country: { en: 'United States', ja: 'アメリカ' },
		tier: 1,
		website: 'https://www.nfa.futures.org/BasicNet/',
		aliases: [/^(CFTC|NFA)\b/i]
	},
	{
		key: 'jfsa',
		abbr: 'JFSA',
		name: { en: 'Financial Services Agency', ja: '金融庁' },
		country: { en: 'Japan', ja: '日本' },
		tier: 1,
		website: 'https://www.fsa.go.jp/',
		aliases: [/^J?FSA \((Japan|日本)/i, /^金融庁/]
	},
	{
		key: 'bafin',
		abbr: 'BaFin',
		name: { en: 'Federal Financial Supervisory Authority', ja: 'ドイツ連邦金融監督庁' },
		country: { en: 'Germany', ja: 'ドイツ' },
		tier: 1,
		website: 'https://www.bafin.de/',
		aliases: [/^BaFin\b/i]
	},
	{
		key: 'cbi',
		abbr: 'CBI',
		name: { en: 'Central Bank of Ireland', ja: 'アイルランド中央銀行' },
		country: { en: 'Ireland', ja: 'アイルランド' },
		tier: 1,
		website: 'https://registers.centralbank.ie/',
		aliases: [/^(CBI\b|Central Bank of Ireland)/i]
	},
	{
		key: 'mas',
		abbr: 'MAS',
		name: { en: 'Monetary Authority of Singapore', ja: 'シンガポール金融管理局' },
		country: { en: 'Singapore', ja: 'シンガポール' },
		tier: 1,
		website: 'https://eservices.mas.gov.sg/fid',
		aliases: [/^MAS\b/i]
	},
	{
		key: 'finma',
		abbr: 'FINMA',
		name: { en: 'Swiss Financial Market Supervisory Authority', ja: 'スイス金融市場監督機構' },
		country: { en: 'Switzerland', ja: 'スイス' },
		tier: 1,
		website: 'https://www.finma.ch/',
		aliases: [/^FINMA\b/i]
	},
	{
		key: 'cysec',
		abbr: 'CySEC',
		name: { en: 'Cyprus Securities and Exchange Commission', ja: 'キプロス証券取引委員会' },
		country: { en: 'Cyprus', ja: 'キプロス' },
		tier: 2,
		website: 'https://www.cysec.gov.cy/en-GB/entities/investment-firms/cypriot/',
		aliases: [/^CySEC\b/i]
	},
	{
		key: 'dfsa',
		abbr: 'DFSA',
		name: { en: 'Dubai Financial Services Authority', ja: 'ドバイ金融サービス機構' },
		country: { en: 'United Arab Emirates', ja: 'アラブ首長国連邦' },
		tier: 2,
		website: 'https://www.dfsa.ae/public-register',
		aliases: [/^DFSA\b/i]
	},
	{
		key: 'fsra',
		abbr: 'FSRA',
		name: { en: 'Financial Services Regulatory Authority (ADGM)', ja: 'アブダビ・グローバル・マーケット金融サービス規制庁' },
		country: { en: 'United Arab Emirates (Abu Dhabi)', ja: 'アラブ首長国連邦（アブダビ）' },
		tier: 2,
		website: 'https://www.adgm.com/public-registers/fsra',
		aliases: [/^(ADGM\b|FSRA\b)/i]
	},
	{
		key: 'mfsa',
		abbr: 'MFSA',
		name: { en: 'Malta Financial Services Authority', ja: 'マルタ金融サービス庁' },
		country: { en: 'Malta', ja: 'マルタ' },
		tier: 2,
		website: 'https://www.mfsa.mt/financial-services-register/',
		aliases: [/^MFSA\b/i]
	},
	{
		key: 'knf',
		abbr: 'KNF',
		name: { en: 'Polish Financial Supervision Authority', ja: 'ポーランド金融監督庁' },
		country: { en: 'Poland', ja: 'ポーランド' },
		tier: 2,
		website: 'https://www.knf.gov.pl/',
		aliases: [/^KNF\b/i]
	},
	{
		key: 'fsca',
		abbr: 'FSCA',
		name: { en: 'Financial Sector Conduct Authority', ja: '南アフリカ金融行為監督機構' },
		country: { en: 'South Africa', ja: '南アフリカ' },
		tier: 2,
		website: 'https://www.fsca.co.za/',
		aliases: [/^FSCA\b/i]
	},
	{
		key: 'fsc-mu',
		abbr: 'FSC',
		name: { en: 'Financial Services Commission (Mauritius)', ja: 'モーリシャス金融サービス委員会' },
		country: { en: 'Mauritius', ja: 'モーリシャス' },
		tier: 3,
		website: 'https://www.fscmauritius.org/',
		aliases: [/^FSC \((Mauritius|モーリシャス)/i]
	},
	{
		key: 'fsa-sc',
		abbr: 'FSA',
		name: { en: 'Financial Services Authority (Seychelles)', ja: 'セーシェル金融サービス庁' },
		country: { en: 'Seychelles', ja: 'セーシェル' },
		tier: 3,
		website: 'https://fsaseychelles.sc/',
		aliases: [/^FS[AC] \((Seychelles|セーシェル)/i]
	},
	{
		key: 'ifsc',
		abbr: 'IFSC',
		name: { en: 'International Financial Services Commission', ja: 'ベリーズ国際金融サービス委員会' },
		country: { en: 'Belize', ja: 'ベリーズ' },
		tier: 3,
		website: 'https://www.ifsc.gov.bz/',
		aliases: [/^IFSC\b/i]
	},
	{
		key: 'vfsc',
		abbr: 'VFSC',
		name: { en: 'Vanuatu Financial Services Commission', ja: 'バヌアツ金融サービス委員会' },
		country: { en: 'Vanuatu', ja: 'バヌアツ' },
		tier: 3,
		website: 'https://www.vfsc.vu/',
		aliases: [/^VFSC\b/i]
	},
	{
		key: 'svgfsa',
		abbr: 'SVGFSA',
		name: { en: 'Financial Services Authority (St. Vincent & the Grenadines)', ja: 'セントビンセント・グレナディーン金融サービス庁' },
		country: { en: 'St. Vincent & the Grenadines', ja: 'セントビンセント・グレナディーン' },
		tier: 3,
		website: 'https://svgfsa.com/',
		aliases: [/^SVGFSA\b/i, /^FSC \(Saint Vincent/i]
	},
	{
		key: 'misa',
		abbr: 'MISA',
		name: { en: 'Mwali International Services Authority', ja: 'ムワリ国際サービス庁' },
		country: { en: 'Comoros (Mwali)', ja: 'コモロ（ムワリ）' },
		tier: 3,
		website: 'https://mwaliregulator.com/',
		aliases: [/^MISA\b/i]
	},
	{
		key: 'bvifsc',
		abbr: 'BVI FSC',
		name: { en: 'British Virgin Islands Financial Services Commission', ja: '英領ヴァージン諸島金融サービス委員会' },
		country: { en: 'British Virgin Islands', ja: '英領ヴァージン諸島' },
		tier: 3,
		website: 'https://www.bvifsc.vg/',
		aliases: [/^BVI FSC\b/i]
	},
	{
		key: 'labuan',
		abbr: 'Labuan FSA',
		name: { en: 'Labuan Financial Services Authority', ja: 'ラブアン金融サービス庁' },
		country: { en: 'Malaysia (Labuan)', ja: 'マレーシア（ラブアン）' },
		tier: 3,
		website: 'https://www.labuanfsa.gov.my/',
		aliases: [/^Labuan FSA\b/i]
	},
	{
		key: 'cima',
		abbr: 'CIMA',
		name: { en: 'Cayman Islands Monetary Authority', ja: 'ケイマン諸島金融庁' },
		country: { en: 'Cayman Islands', ja: 'ケイマン諸島' },
		tier: 3,
		website: 'https://www.cima.ky/',
		aliases: [/^CIMA\b/i]
	},
	{
		key: 'ciro',
		abbr: 'CIRO',
		name: { en: 'Canadian Investment Regulatory Organization', ja: 'カナダ投資規制機構' },
		country: { en: 'Canada', ja: 'カナダ' },
		tier: 1,
		website: 'https://www.ciro.ca/',
		aliases: [/^(CIRO|IIROC)\b/i]
	},
	{
		key: 'finra',
		abbr: 'SEC/FINRA',
		name: { en: 'Securities and Exchange Commission / Financial Industry Regulatory Authority', ja: '米証券取引委員会／米金融取引業規制機構' },
		country: { en: 'United States', ja: 'アメリカ' },
		tier: 1,
		website: 'https://brokercheck.finra.org/',
		aliases: [/^(FINRA\b|SEC\b[^(]*FINRA|SEC \((USA|US|United States|アメリカ|米国))/i]
	},
	{
		key: 'sfc',
		abbr: 'SFC',
		name: { en: 'Securities and Futures Commission', ja: '香港証券先物委員会' },
		country: { en: 'Hong Kong', ja: '香港' },
		tier: 1,
		website: 'https://apps.sfc.hk/publicregWeb/',
		aliases: [/^SFC \((Hong Kong|HK|香港)/i]
	},
	{
		key: 'consob',
		abbr: 'CONSOB',
		name: { en: 'Commissione Nazionale per le Società e la Borsa', ja: 'イタリア証券取引委員会' },
		country: { en: 'Italy', ja: 'イタリア' },
		tier: 2,
		website: 'https://www.consob.it/',
		aliases: [/^CONSOB\b/i]
	},
	{
		key: 'amf',
		abbr: 'AMF',
		name: { en: 'Autorité des marchés financiers', ja: 'フランス金融市場庁' },
		country: { en: 'France', ja: 'フランス' },
		tier: 2,
		website: 'https://www.amf-france.org/',
		aliases: [/^AMF \((France|フランス)/i]
	},
	{
		key: 'cnmv',
		abbr: 'CNMV',
		name: { en: 'Comisión Nacional del Mercado de Valores', ja: 'スペイン証券市場委員会' },
		country: { en: 'Spain', ja: 'スペイン' },
		tier: 2,
		website: 'https://www.cnmv.es/',
		aliases: [/^CNMV\b/i]
	},
	{
		key: 'afm',
		abbr: 'AFM',
		name: { en: 'Authority for the Financial Markets', ja: 'オランダ金融市場庁' },
		country: { en: 'Netherlands', ja: 'オランダ' },
		tier: 2,
		website: 'https://www.afm.nl/en/sector/registers',
		aliases: [/^AFM\b/i]
	},
	{
		key: 'spk',
		abbr: 'SPK (CMB)',
		name: { en: 'Capital Markets Board of Türkiye', ja: 'トルコ資本市場委員会' },
		country: { en: 'Türkiye', ja: 'トルコ' },
		tier: 2,
		website: 'https://spk.gov.tr/',
		aliases: [/^(SPK|CMB)\b/i]
	},
	{
		key: 'fma-nz',
		abbr: 'FMA',
		name: { en: 'Financial Markets Authority (New Zealand)', ja: 'ニュージーランド金融市場庁' },
		country: { en: 'New Zealand', ja: 'ニュージーランド' },
		tier: 2,
		website: 'https://www.fma.govt.nz/',
		aliases: [/^FMA \((New Zealand|NZ|ニュージーランド)/i]
	},
	{
		key: 'sca',
		abbr: 'SCA',
		name: { en: 'Securities and Commodities Authority', ja: 'UAE証券商品庁' },
		country: { en: 'United Arab Emirates', ja: 'アラブ首長国連邦' },
		tier: 2,
		website: 'https://www.sca.gov.ae/',
		aliases: [/^SCA\b/i]
	},
	{
		key: 'bappebti',
		abbr: 'Bappebti',
		name: { en: 'Commodity Futures Trading Regulatory Agency', ja: 'インドネシア商品先物取引監督庁' },
		country: { en: 'Indonesia', ja: 'インドネシア' },
		tier: 2,
		website: 'https://bappebti.go.id/',
		aliases: [/^Bappebti\b/i]
	},
	{
		key: 'ojk',
		abbr: 'OJK',
		name: { en: 'Financial Services Authority (Indonesia)', ja: 'インドネシア金融庁' },
		country: { en: 'Indonesia', ja: 'インドネシア' },
		tier: 2,
		website: 'https://www.ojk.go.id/',
		aliases: [/^OJK\b/i]
	},
	{
		key: 'cma-ke',
		abbr: 'CMA',
		name: { en: 'Capital Markets Authority (Kenya)', ja: 'ケニア資本市場庁' },
		country: { en: 'Kenya', ja: 'ケニア' },
		tier: 2,
		website: 'https://www.cma.or.ke/',
		aliases: [/^CMA \((Kenya|ケニア)/i]
	},
	{
		key: 'cvm',
		abbr: 'CVM',
		name: { en: 'Securities and Exchange Commission of Brazil', ja: 'ブラジル証券取引委員会' },
		country: { en: 'Brazil', ja: 'ブラジル' },
		tier: 2,
		website: 'https://www.gov.br/cvm/',
		aliases: [/^CVM\b/i]
	},
	{
		key: 'cnbv',
		abbr: 'CNBV',
		name: { en: 'National Banking and Securities Commission', ja: 'メキシコ銀行証券委員会' },
		country: { en: 'Mexico', ja: 'メキシコ' },
		tier: 2,
		website: 'https://www.gob.mx/cnbv',
		aliases: [/^CNBV\b/i]
	},
	{
		key: 'scb',
		abbr: 'SCB',
		name: { en: 'Securities Commission of The Bahamas', ja: 'バハマ証券委員会' },
		country: { en: 'Bahamas', ja: 'バハマ' },
		tier: 3,
		website: 'https://www.scb.gov.bs/',
		aliases: [/^(SCB\b|Securities Commission of (The )?Bahamas)/i]
	},
	{
		key: 'cbcs',
		abbr: 'CBCS',
		name: { en: 'Central Bank of Curaçao and Sint Maarten', ja: 'キュラソー・シントマールテン中央銀行' },
		country: { en: 'Curaçao', ja: 'キュラソー' },
		tier: 3,
		website: 'https://www.centralbank.cw/',
		aliases: [/^(CBCS\b|Central Bank of Cura)/i]
	},
	{
		key: 'bma',
		abbr: 'BMA',
		name: { en: 'Bermuda Monetary Authority', ja: 'バミューダ金融庁' },
		country: { en: 'Bermuda', ja: 'バミューダ' },
		tier: 3,
		website: 'https://www.bma.bm/',
		aliases: [/^BMA\b/i]
	}
];

export const regulatorKeys = regulators.map((r) => r.key) as [string, ...string[]];

const byKey = new Map(regulators.map((r) => [r.key, r]));

export function getRegulator(key: string) {
	return byKey.get(key);
}

/** Best-effort match of a free-text `regulation` entry like "CySEC (Cyprus) - License 340/17". */
export function matchRegulator(text: string) {
	const trimmed = text.trim();
	return regulators.find((r) => r.aliases.some((re) => re.test(trimmed)));
}
