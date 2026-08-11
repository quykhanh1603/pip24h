/**
 * Decap CMS OAuth provider for the "github" backend, running as a Cloudflare Worker.
 * Implements the two endpoints Decap CMS expects:
 *   GET /auth      -> redirects to GitHub's OAuth authorize screen
 *   GET /callback  -> exchanges the code for a token and hands it back to the CMS popup
 *
 * Required secrets (set via `wrangler secret put`):
 *   GITHUB_CLIENT_ID
 *   GITHUB_CLIENT_SECRET
 */

export default {
	async fetch(request, env) {
		const url = new URL(request.url);

		if (url.pathname === '/auth') {
			return handleAuth(url, env);
		}
		if (url.pathname === '/callback') {
			return handleCallback(url, request, env);
		}
		return new Response('Decap CMS OAuth provider is running.', { status: 200 });
	}
};

async function handleAuth(url, env) {
	const state = crypto.randomUUID();
	const params = new URLSearchParams({
		client_id: env.GITHUB_CLIENT_ID,
		redirect_uri: `${url.origin}/callback`,
		scope: 'repo,user',
		state
	});

	const headers = new Headers({
		Location: `https://github.com/login/oauth/authorize?${params.toString()}`
	});
	headers.append(
		'Set-Cookie',
		`oauth_state=${state}; HttpOnly; Secure; Path=/; Max-Age=600; SameSite=Lax`
	);

	return new Response(null, { status: 302, headers });
}

async function handleCallback(url, request, env) {
	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');
	const cookieHeader = request.headers.get('Cookie') || '';
	const savedState = cookieHeader.match(/oauth_state=([^;]+)/)?.[1] ?? null;

	if (!code || !state || state !== savedState) {
		return new Response('Invalid or missing OAuth state.', { status: 400 });
	}

	const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
		body: JSON.stringify({
			client_id: env.GITHUB_CLIENT_ID,
			client_secret: env.GITHUB_CLIENT_SECRET,
			code,
			redirect_uri: `${url.origin}/callback`
		})
	});

	const tokenData = await tokenRes.json();

	if (tokenData.error) {
		return new Response(`GitHub OAuth error: ${tokenData.error_description || tokenData.error}`, {
			status: 400
		});
	}

	const payload = JSON.stringify({ token: tokenData.access_token, provider: 'github' });

	const html = `<!doctype html>
<html>
	<body>
		<script>
			(function () {
				function receiveMessage(e) {
					window.opener.postMessage(
						'authorization:github:success:${payload}',
						e.origin
					);
					window.removeEventListener('message', receiveMessage, false);
				}
				window.addEventListener('message', receiveMessage, false);
				window.opener.postMessage('authorizing:github', '*');
			})();
		</script>
	</body>
</html>`;

	return new Response(html, {
		headers: { 'Content-Type': 'text/html; charset=utf-8' }
	});
}
