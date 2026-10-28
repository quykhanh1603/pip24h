import type { Lang } from './propfirm-i18n';

export type { Lang };

export const brokerText = {
	en: {
		reviewTitle: (name: string) => `${name} Review 2026 — Licences, Score & Fees | Pip24h`,
		open: (name: string) => `Open account at ${name}`,
		score: 'Pip24h Score',
		editorialRating: 'Editorial rating',
		band: { excellent: 'Excellent', good: 'Good', average: 'Average', weak: 'Weak' },
		indexes: {
			regulation: 'Regulation',
			business: 'Track record',
			costs: 'Trading costs',
			platforms: 'Platforms',
			editorial: 'Editorial review'
		},
		howScored: 'How the score works',
		licensesTitle: 'Licences & regulation',
		licensesIntro: 'Each licence links to the regulator so you can check it yourself on the official register.',
		regulator: 'Regulator',
		tierLabel: 'Tier',
		tier: { 1: 'Top tier', 2: 'Strong', 3: 'Offshore' } as Record<1 | 2 | 3, string>,
		licenseNo: 'Licence no.',
		entity: 'Entity',
		status: 'Status',
		statusLabel: {
			verified: 'Verified',
			unverified: 'Declared',
			revoked: 'Revoked',
			'clone-warning': 'Clone warning'
		},
		statusHint: {
			verified: 'Checked by Pip24h on the official register',
			unverified: 'Declared by the broker, not yet checked by Pip24h on the register',
			revoked: 'The regulator has revoked or suspended this licence',
			'clone-warning': 'The regulator has warned about a firm impersonating this licence holder'
		},
		checkRegister: 'Check register',
		unknownRegulator: 'Not in our regulator directory',
		noLicenses: 'No licence information on file.',
		warnings: {
			revoked: 'At least one of this broker’s licences has been revoked or suspended.',
			'clone-warning': 'A regulator has issued a clone-firm warning related to this broker. Make sure you are on the official website.',
			'offshore-only': 'This broker is only regulated offshore. Investor protection is limited compared with top-tier regulators.',
			unrecognized: 'This broker’s registrations are not with a regulator in our directory, so we could not rate them. Check each registration yourself before depositing.',
			unregulated: 'We could not find a valid licence for this broker. Trading with an unregulated broker is very risky.'
		},
		facts: {
			founded: 'Founded',
			minDeposit: 'Min deposit',
			spreadFrom: 'Spread from',
			maxLeverage: 'Max leverage',
			instantWithdrawal: 'Instant withdrawal',
			assetType: 'Markets'
		},
		assetType: { forex: 'Forex', crypto: 'Crypto', both: 'Forex & Crypto' },
		yes: 'Yes',
		no: 'No',
		platforms: 'Trading platforms',
		pros: 'Pros',
		cons: 'Cons',
		updated: 'Last updated',
		website: 'Official website',
		sources: 'Sources',
		profileNotice:
			'This is a data profile compiled from public sources — the broker’s own website and regulator registers — not a hands-on review with a real account. Figures can change; confirm them with the broker before opening an account.',
		back: '← All broker reviews',
		risk: 'Trading forex and CFDs on leverage carries a high risk of losing money. Licence data is provided for information only — always confirm it on the regulator’s own register before depositing.',
		methodology: {
			title: 'How the Pip24h Score Works',
			description: 'The transparent formula behind the Pip24h broker score: five indexes, published weights and licence verification.',
			intro:
				'Every broker on Pip24h gets a score from 0 to 10, calculated automatically from five indexes. The formula is the same for every broker and is published in full below.',
			independence:
				'Whether a broker pays us an affiliate commission is not an input to the score. Brokers cannot pay to change their score.',
			weight: 'Weight',
			details: {
				regulation: 'Points per regulator: Top tier 5, Strong 3.5, Offshore 1.5 (capped at 10). A licence we have verified on the official register counts in full; a licence only declared by the broker counts 85%; a revoked licence or clone warning counts 0. Several licences from the same regulator count once. Registrations with bodies outside our directory (such as crypto VASP registrations) earn a flat 1 point in total.',
				business: 'Years in operation: 2 points plus 0.4 per year since founding (25+ years = 10). Unknown founding year = 3.',
				costs: 'Lowest advertised spread. Forex: ≤0.2 pips = 9, ≤0.5 = 8, ≤0.9 = 7, ≤1.5 = 5, higher = 3. Crypto exchanges use the lowest trading fee: ≤0.02% = 9, ≤0.05% = 8, ≤0.1% = 7, higher = 5.',
				platforms: 'Base 2, plus 2 for each of MetaTrader 4, MetaTrader 5, cTrader and TradingView, plus 1 for each other platform (up to 3). Crypto exchanges: 4 plus 2 per platform.',
				editorial: 'Our editorial star rating (0–5) converted to a 0–10 scale. It covers what the numbers miss: support quality, deposit and withdrawal experience, transparency.'
			},
			tiersTitle: 'Regulator tiers',
			tiersIntro: 'We group regulators by how much protection they give retail clients:',
			tiers: {
				1: 'Strict capital requirements, segregated client money, compensation schemes and active enforcement.',
				2: 'Solid onshore or EU (MiFID) regulation with meaningful enforcement.',
				3: 'Offshore jurisdictions with light-touch rules, low capital requirements and limited recourse for clients.'
			},
			statusTitle: 'Licence status',
			overridesTitle: 'Manual adjustments',
			overrides:
				'When a formula clearly misrepresents a broker (for example, an advertised 0.0-pip spread that carries a high commission), our editors can override an individual index. Every override is recorded in the broker’s data file.',
			bandsTitle: 'Score bands',
			bands: '8.0+ Excellent · 6.5–7.9 Good · 5.0–6.4 Average · below 5.0 Weak'
		},
		regulatorsPage: {
			title: 'Forex Regulators Directory',
			description: 'Financial regulators that license the forex and CFD brokers we review, grouped by tier, with links to their official registers.',
			intro:
				'A broker is only as safe as the regulator that supervises it. Here are the regulators behind the brokers in our database, grouped by tier, with links to each official register.',
			brokers: 'Brokers licensed',
			none: 'No brokers in our database yet.',
			website: 'Official register / website'
		}
	},
	ja: {
		reviewTitle: (name: string) => `${name}の評判・金融ライセンス・スコア【2026年】 — Pip24h`,
		open: (name: string) => `${name}で口座開設`,
		score: 'Pip24hスコア',
		editorialRating: '編集部評価',
		band: { excellent: '非常に良い', good: '良い', average: '普通', weak: '注意' },
		indexes: {
			regulation: '規制',
			business: '運営実績',
			costs: '取引コスト',
			platforms: 'プラットフォーム',
			editorial: '編集部評価'
		},
		howScored: 'スコアの算出方法',
		licensesTitle: '金融ライセンスと規制',
		licensesIntro: '各ライセンスは規制当局のサイトにリンクしています。公式の登録簿でご自身でも確認できます。',
		regulator: '規制当局',
		tierLabel: 'ランク',
		tier: { 1: 'トップティア', 2: '信頼性高', 3: 'オフショア' } as Record<1 | 2 | 3, string>,
		licenseNo: 'ライセンス番号',
		entity: '法人名',
		status: 'ステータス',
		statusLabel: {
			verified: '確認済み',
			unverified: '申告',
			revoked: '取消',
			'clone-warning': 'クローン警告'
		},
		statusHint: {
			verified: 'Pip24hが公式登録簿で確認済み',
			unverified: 'ブローカーの申告による情報で、Pip24hによる登録簿の確認はまだです',
			revoked: '規制当局がこのライセンスを取り消し、または停止しています',
			'clone-warning': 'このライセンス保有者を装う業者について、規制当局が警告を出しています'
		},
		checkRegister: '登録簿を確認',
		unknownRegulator: '当サイトの規制当局一覧に未掲載',
		noLicenses: 'ライセンス情報はありません。',
		warnings: {
			revoked: 'このブローカーのライセンスのうち、少なくとも1つが取り消しまたは停止されています。',
			'clone-warning': 'このブローカーに関連して、規制当局がクローン業者の警告を出しています。公式サイトであることを必ず確認してください。',
			'offshore-only': 'このブローカーはオフショアの規制のみを受けています。トップティアの規制当局と比べ、投資家保護は限定的です。',
			unrecognized: 'このブローカーの登録先は当サイトの規制当局一覧に含まれていないため、評価できませんでした。入金前に、各登録をご自身でご確認ください。',
			unregulated: '有効なライセンスを確認できませんでした。無登録のブローカーとの取引は非常に危険です。'
		},
		facts: {
			founded: '設立年',
			minDeposit: '最低入金額',
			spreadFrom: '最小スプレッド',
			maxLeverage: '最大レバレッジ',
			instantWithdrawal: '即時出金',
			assetType: '取扱商品'
		},
		assetType: { forex: 'FX', crypto: '暗号資産', both: 'FX・暗号資産' },
		yes: 'あり',
		no: 'なし',
		platforms: '取引プラットフォーム',
		pros: 'メリット',
		cons: 'デメリット',
		updated: '最終更新',
		website: '公式サイト',
		sources: '情報源',
		profileNotice:
			'このページは、ブローカーの公式サイトや規制当局の登録簿など公開情報をもとにまとめたデータプロフィールです。実際の口座を使ったレビューではありません。数値は変わることがあるため、口座開設前にブローカーにご確認ください。',
		back: '← ブローカーレビュー一覧',
		risk: 'レバレッジを用いたFX・CFD取引には、元本を失う高いリスクがあります。ライセンス情報は参考情報です。入金前に、必ず規制当局の公式登録簿でご確認ください。',
		methodology: {
			title: 'Pip24hスコアの算出方法',
			description: 'Pip24hのブローカースコアの算出式を公開しています。5つの指標、公開された配点、ライセンスの確認方法。',
			intro:
				'Pip24hに掲載しているすべてのブローカーには、5つの指標から自動計算される0〜10のスコアがついています。計算式は全ブローカー共通で、以下にすべて公開しています。',
			independence:
				'ブローカーから当サイトにアフィリエイト報酬が支払われるかどうかは、スコアに一切影響しません。ブローカーがお金を払ってスコアを変えることはできません。',
			weight: '配点',
			details: {
				regulation: '規制当局ごとの点数：トップティア5点、信頼性高3.5点、オフショア1.5点（上限10点）。Pip24hが公式登録簿で確認したライセンスは満点、ブローカーの申告のみのライセンスは85%、取消やクローン警告のあるライセンスは0点として計算します。同じ規制当局のライセンスが複数あっても1つとして数えます。当サイトの一覧にない機関への登録（暗号資産のVASP登録など）は、まとめて1点とします。',
				business: '運営年数：2点＋設立からの年数×0.4点（25年以上で10点）。設立年が不明な場合は3点。',
				costs: '公表されている最小スプレッド。FX：0.2pips以下＝9点、0.5以下＝8点、0.9以下＝7点、1.5以下＝5点、それ以上＝3点。暗号資産取引所は最小取引手数料：0.02%以下＝9点、0.05%以下＝8点、0.1%以下＝7点、それ以上＝5点。',
				platforms: '基本2点＋MetaTrader 4、MetaTrader 5、cTrader、TradingViewが各2点＋その他のプラットフォームが各1点（最大3点）。暗号資産取引所は4点＋プラットフォームごとに2点。',
				editorial: '編集部の星評価（0〜5）を0〜10に換算したもの。サポートの質、入出金のしやすさ、情報の透明性など、数値だけでは測れない点を反映します。'
			},
			tiersTitle: '規制当局のランク',
			tiersIntro: '個人投資家をどれだけ保護しているかによって、規制当局を3つのランクに分けています。',
			tiers: {
				1: '厳しい自己資本規制、顧客資金の分別管理、投資者補償制度、積極的な法執行。',
				2: 'しっかりとした国内規制またはEU（MiFID）規制と、実効性のある法執行。',
				3: 'ルールが緩く、必要資本も少ないオフショア地域。顧客が救済を受けられる手段は限られます。'
			},
			statusTitle: 'ライセンスのステータス',
			overridesTitle: '手動での調整',
			overrides:
				'計算式がブローカーの実態を明らかに反映していない場合（例：スプレッドは0.0pipsでも手数料が高いなど）、編集部が個別の指標を調整することがあります。調整内容はすべてブローカーのデータファイルに記録されます。',
			bandsTitle: 'スコアの目安',
			bands: '8.0以上 非常に良い · 6.5〜7.9 良い · 5.0〜6.4 普通 · 5.0未満 注意'
		},
		regulatorsPage: {
			title: 'FX規制当局一覧',
			description: '当サイトでレビューしているFX・CFDブローカーにライセンスを与えている規制当局をランク別にまとめ、公式登録簿へのリンクを掲載しています。',
			intro:
				'ブローカーの安全性は、それを監督する規制当局によって決まります。当サイトのデータベースに掲載しているブローカーの規制当局をランク別にまとめ、それぞれの公式登録簿へのリンクを掲載しています。',
			brokers: 'ライセンスを持つブローカー',
			none: 'まだ掲載しているブローカーはありません。',
			website: '公式登録簿・ウェブサイト'
		}
	}
} as const;
