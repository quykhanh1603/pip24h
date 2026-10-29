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
// That property currently has a single web stream, for https://buysmartreviews.store/, so
// pip24h.com traffic lands in the same property; reports stay separable with the built-in
// `Hostname` (or `Stream name`) dimension until a dedicated stream is added.
const DEFAULT_GA_ID = 'G-T71RG8W1J3';

export const GA_MEASUREMENT_ID = ((import.meta.env.PUBLIC_GA_ID ?? '') || DEFAULT_GA_ID).trim();

/**
 * `G-XXXXXXX` only. An empty value, or a placeholder such as `G-XXXXXXXXXX`, disables
 * Google Analytics entirely: no `<script>`, no cookie consent banner, no network request.
 */
export const gaEnabled = /^G-[A-Z0-9]{4,}$/i.test(GA_MEASUREMENT_ID) && !/^G-X+$/i.test(GA_MEASUREMENT_ID);

