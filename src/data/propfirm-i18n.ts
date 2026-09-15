import type { CollectionEntry } from 'astro:content';

export type Lang = 'en' | 'ja';
type Program = CollectionEntry<'propfirms'>['data']['programs'][number];

export const propText = {
	en: {
		navLabel: 'Prop Firms',
		listTitle: 'Best Forex & CFD Prop Firms 2026',
		listIntro:
			'We compare prop firm evaluations on the rules that decide whether you get paid: drawdown limits, profit split, fees, refunds and payout record.',
		tableTitle: 'Prop firm comparison',
		featuredTitle: 'In-depth reviews',
		methodTitle: 'How we rank prop firms',
		method: [
			['Payout record & time in business', 'Weighted most. 80+ prop firms closed or halted payouts between 2020 and 2026, so longevity and on-time rewards come first.'],
			['Fairness of the rules', 'Static vs trailing drawdown, consistency or best-day rules, news and weekend restrictions.'],
			['Cost', 'Entry fee relative to account size, and whether the fee is refunded.'],
			['Profit split & payout speed', 'Headline split, how it scales, and how often rewards can be requested.'],
			['Trader reputation', 'Trustpilot score and community feedback.']
		],
		all: 'All',
		refundable: 'Refundable fee',
		rank: 'Rank',
		firm: 'Prop firm',
		score: 'Score',
		evaluation: 'Evaluation',
		feeFrom: 'Fee from',
		maxFunding: 'Max funding',
		dailyLoss: 'Daily loss',
		maxLoss: 'Max loss',
		profitSplit: 'Profit split',
		payout: 'Payouts',
		start: 'Start Challenge',
		readReview: 'Read Review',
		founded: 'Founded',
		headquarters: 'Headquarters',
		accountSizes: 'Account sizes',
		scaling: 'Scaling up to',
		platforms: 'Platforms',
		trustpilot: 'Trustpilot',
		programsTitle: 'Evaluation programs',
		profitTarget: 'Profit target',
		minDays: 'Min. trading days',
		feeRefund: 'Fee refunded',
		static: 'static',
		trailing: 'trailing',
		yes: 'Yes',
		no: 'No',
		none: 'None',
		rulesTitle: 'Trading rules on the funded account',
		news: 'News trading',
		weekend: 'Weekend holding',
		ea: 'Expert Advisors (EA)',
		pros: 'Pros',
		cons: 'Cons',
		back: '← All prop firms',
		permission: { allowed: 'Allowed', restricted: 'Restricted', 'not-allowed': 'Not allowed' },
		type: { '1-step': '1-Step', '2-step': '2-Step', '3-step': '3-Step', instant: 'Instant' },
		noticeTitle: 'Simulated capital, real fees',
		notice:
			'Prop firm “funded accounts” trade simulated capital: rewards are paid from your simulated results, and the money you actually put at risk is the evaluation fee. Most traders do not pass. Prop firms are not brokers and are generally not regulated as investment firms.'
	},
	ja: {
		navLabel: 'プロップファーム',
		listTitle: '2026年 おすすめFX・CFDプロップファーム',
		listIntro:
			'報酬を受け取れるかどうかを左右するルール、つまり損失上限、利益配分、参加費、返金、支払い実績でプロップファームの評価を比較しています。',
		tableTitle: 'プロップファーム比較表',
		featuredTitle: '詳細レビュー',
		methodTitle: 'ランキングの評価方法',
		method: [
			['支払い実績と運営年数', '最も重視します。2020〜2026年に80社以上のプロップファームが閉鎖や支払い停止に至っているため、継続性と期日どおりの報酬支払いを最優先しています。'],
			['ルールの公平さ', '固定式かトレーリング式の損失上限か、コンシステンシーやベストデイのルール、指標発表時・週末の制限など。'],
			['費用', '口座サイズに対する参加費と、返金の有無。'],
			['利益配分と支払いスピード', '基本の配分率、その引き上げ方、報酬を申請できる頻度。'],
			['トレーダーの評判', 'Trustpilotのスコアとコミュニティの声。']
		],
		all: 'すべて',
		refundable: '参加費返金あり',
		rank: '順位',
		firm: 'プロップファーム',
		score: '評価',
		evaluation: '評価方式',
		feeFrom: '参加費',
		maxFunding: '最大資金',
		dailyLoss: '1日の損失上限',
		maxLoss: '最大損失',
		profitSplit: '利益配分',
		payout: '報酬の支払い',
		start: 'チャレンジを始める',
		readReview: 'レビューを見る',
		founded: '設立年',
		headquarters: '本社',
		accountSizes: '口座サイズ',
		scaling: 'スケーリング上限',
		platforms: 'プラットフォーム',
		trustpilot: 'Trustpilot',
		programsTitle: '評価プログラム',
		profitTarget: '利益目標',
		minDays: '最低取引日数',
		feeRefund: '参加費の返金',
		static: '固定式',
		trailing: 'トレーリング式',
		yes: 'あり',
		no: 'なし',
		none: 'なし',
		rulesTitle: '資金提供口座での取引ルール',
		news: '指標発表時の取引',
		weekend: '週末の持ち越し',
		ea: 'EA（自動売買）',
		pros: 'メリット',
		cons: 'デメリット',
		back: '← プロップファーム一覧',
		permission: { allowed: '可', restricted: '制限あり', 'not-allowed': '不可' },
		type: { '1-step': '1ステップ', '2-step': '2ステップ', '3-step': '3ステップ', instant: '即時資金提供' },
		noticeTitle: '資金はシミュレーション、参加費は本物',
		notice:
			'プロップファームの「資金提供口座」はシミュレーション（模擬）資金で取引します。報酬は模擬取引の成績にもとづいて支払われ、実際にリスクにさらすお金は参加費です。多くのトレーダーは合格できません。プロップファームはブローカーではなく、一般に投資会社としての規制も受けていません。'
	}
} as const;

/** "3–5%" style range across a firm's programs; `none` when no program sets a value. */
export function percentRange(values: (number | undefined)[], none: string) {
	const nums = values.filter((v): v is number => typeof v === 'number');
	if (nums.length === 0) return none;
	const min = Math.min(...nums);
	const max = Math.max(...nums);
	return min === max ? `${min}%` : `${min}–${max}%`;
}

export function programTypes(programs: Program[]) {
	return [...new Set(programs.map((p) => p.type))];
}

export function slugOf(entry: CollectionEntry<'propfirms'>) {
	return entry.id.split('/').slice(1).join('/');
}
