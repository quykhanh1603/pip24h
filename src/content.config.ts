import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { regulatorKeys } from './data/regulators';

const brokers = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/brokers' }),
  schema: () =>
    z.object({
      name: z.string(),
      // Empty = no logo yet; components fall back to an initials tile.
      logo: z.string().default(''),
      // "review" = hands-on editorial review; "profile" = data profile compiled from public sources
      // (added by the daily automation in automation/). Profiles stay off the homepage.
      profileType: z.enum(['review', 'profile']).default('review'),
      website: z.string().optional(),
      sources: z.array(z.string()).default([]),
      // Thin profiles are kept out of search engines and the sitemap until they are filled in.
      noindex: z.boolean().default(false),
      assetType: z.enum(['forex', 'crypto', 'both']),
      rating: z.number().min(0).max(5),
      summary: z.string(),
      foundedYear: z.number().optional(),
      minDeposit: z.string().optional(),
      spreadFrom: z.string().optional(),
      maxLeverage: z.string().optional(),
      instantWithdrawal: z.boolean().default(false),
      regulation: z.array(z.string()).default([]),
      // Structured licences. When omitted, they are derived from `regulation` as "unverified".
      // Only needed on the `en/` entry — scores and licences are always read from English data.
      licenses: z
        .array(
          z.object({
            regulator: z.enum(regulatorKeys),
            number: z.string().optional(),
            entity: z.string().optional(),
            status: z.enum(['verified', 'unverified', 'revoked', 'clone-warning']).default('unverified'),
            verifiedDate: z.preprocess((v) => (v === '' || v === null ? undefined : v), z.coerce.date().optional())
          })
        )
        .optional(),
      // Manual 0–10 overrides for individual Pip24h Score indexes (see src/data/broker-score.ts).
      scoreOverrides: z
        .object({
          regulation: z.number().min(0).max(10).optional(),
          business: z.number().min(0).max(10).optional(),
          costs: z.number().min(0).max(10).optional(),
          platforms: z.number().min(0).max(10).optional(),
          editorial: z.number().min(0).max(10).optional()
        })
        .optional(),
      platforms: z.array(z.string()).default([]),
      pros: z.array(z.string()).default([]),
      cons: z.array(z.string()).default([]),
      category: z.array(z.enum(['scalping', 'beginners', 'ecn', 'low-deposit'])).default([]),
      badge: z.string().optional(),
      affiliateUrl: z.string().default('AFF_LINK_PLACEHOLDER'),
      featured: z.boolean().default(false),
      updatedDate: z.coerce.date()
    })
});

const guides = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/guides' }),
  schema: () =>
    z.object({
      title: z.string(),
      summary: z.string(),
      category: z.enum(['basics', 'risk-management', 'technical-analysis', 'chart-patterns', 'psychology', 'fundamentals']),
      updatedDate: z.coerce.date()
    })
});

const propfirms = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/propfirms' }),
	schema: () =>
		z.object({
			name: z.string(),
			logo: z.string(),
			market: z.enum(['forex-cfd', 'futures']).default('forex-cfd'),
			rating: z.number().min(0).max(5),
			summary: z.string(),
			badge: z.string().optional(),
			foundedYear: z.number().optional(),
			headquarters: z.string().optional(),
			accountSizes: z.string(),
			maxFunding: z.string().optional(),
			scalingUpTo: z.string().optional(),
			feeFrom: z.string(),
			profitSplit: z.string(),
			payoutFrequency: z.string().optional(),
			platforms: z.array(z.string()).default([]),
			newsTrading: z.enum(['allowed', 'restricted', 'not-allowed']).default('allowed'),
			weekendHolding: z.enum(['allowed', 'restricted', 'not-allowed']).default('allowed'),
			eaAllowed: z.boolean().default(true),
			trustpilotScore: z.number().min(0).max(5).optional(),
			programs: z
				.array(
					z.object({
						name: z.string(),
						type: z.enum(['1-step', '2-step', '3-step', 'instant']),
						profitTargets: z.array(z.number()).default([]),
						maxDailyLoss: z.number().optional(),
						maxLoss: z.number(),
						maxLossType: z.enum(['static', 'trailing']),
						minTradingDays: z.number().default(0),
						profitSplit: z.string(),
						feeRefundable: z.boolean().default(false),
						note: z.string().optional()
					})
				)
				.min(1),
			pros: z.array(z.string()).default([]),
			cons: z.array(z.string()).default([]),
			affiliateUrl: z.string().default('AFF_LINK_PLACEHOLDER'),
			featured: z.boolean().default(false),
			updatedDate: z.coerce.date()
		})
});

export const collections = { brokers, guides, propfirms };
