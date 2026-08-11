import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const brokers = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/brokers' }),
  schema: () =>
    z.object({
      name: z.string(),
      logo: z.string(),
      assetType: z.enum(['forex', 'crypto', 'both']),
      rating: z.number().min(0).max(5),
      summary: z.string(),
      foundedYear: z.number().optional(),
      minDeposit: z.string().optional(),
      spreadFrom: z.string().optional(),
      maxLeverage: z.string().optional(),
      instantWithdrawal: z.boolean().default(false),
      regulation: z.array(z.string()).default([]),
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
      category: z.enum(['basics', 'risk-management', 'technical-analysis', 'chart-patterns']),
      updatedDate: z.coerce.date()
    })
});

export const collections = { brokers, guides };
