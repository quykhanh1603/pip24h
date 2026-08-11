const UPSTREAM_URL = 'https://nfs.faireconomy.media/ff_calendar_thisweek.json';
const CACHE_TTL_SECONDS = 3600;

export default {
	async fetch(request) {
		if (request.method !== 'GET') {
			return new Response('Method not allowed', { status: 405 });
		}

		try {
			const upstreamResponse = await fetch(UPSTREAM_URL, {
				cf: {
					cacheTtl: CACHE_TTL_SECONDS,
					cacheEverything: true
				}
			});

			if (!upstreamResponse.ok) {
				return new Response(
					JSON.stringify({ error: 'Upstream unavailable', status: upstreamResponse.status, statusText: upstreamResponse.statusText }),
					{
						status: 502,
						headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*' }
					}
				);
			}

			const body = await upstreamResponse.text();
			return new Response(body, {
				status: 200,
				headers: {
					'content-type': 'application/json',
					'access-control-allow-origin': '*',
					'cache-control': `public, max-age=${CACHE_TTL_SECONDS}`
				}
			});
		} catch (err) {
			return new Response(JSON.stringify({ error: 'Fetch failed', message: String(err) }), {
				status: 502,
				headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*' }
			});
		}
	}
};
