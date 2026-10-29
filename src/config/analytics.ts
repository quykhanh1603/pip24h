// Google Analytics 4 configuration.
//
// The measurement ID is not a secret (it ships in the page source anyway), but keeping it
// in one env-driven place means the site still builds and ships without analytics when the
// variable is missing — e.g. a local `npm run build` on a machine without the ID.
//
// Cloudflare Pages → Settings → Environment variables → PUBLIC_GA_ID = G-XXXXXXXXXX
// (Astro only exposes build-time variables prefixed with `PUBLIC_`; the env var wins over the
// default below, so a dedicated pip24h stream can be switched on without touching the code.)

// GA4 property "PIP24H → Buy Smart Reviews" (accounts/405935278, properties/551494296).
// Stream layout:
//   properties/551494296/dataStreams/15495673643  → https://buysmartreviews.store/  G-T71RG8W1J3
//   properties/551494296/dataStreams/16228640027  → https://pip24h.com              G-N0XRLVLWXB
// This site reports through the pip24h.com stream; both live in one property, so GA4 separates
// them by the built-in `Hostname` (or `Stream name`) dimension.
const DEFAULT_GA_ID = 'G-N0XRLVLWXB';

export const GA_MEASUREMENT_ID = ((import.meta.env.PUBLIC_GA_ID ?? '') || DEFAULT_GA_ID).trim();

/**
 * `G-XXXXXXX` (GA4 measurement ID) or `GT-XXXXXXX` (Google tag ID — what GA shows as "Tag ID" for
 * newer web streams; both address the same stream). An empty value, or a placeholder such as
 * `G-XXXXXXXXXX`, disables Google Analytics entirely: no `<script>`, no consent banner, no request.
 */
export const gaEnabled = /^(GT|G)-[A-Z0-9]{4,}$/i.test(GA_MEASUREMENT_ID) && !/^(GT|G)-X+$/i.test(GA_MEASUREMENT_ID);


