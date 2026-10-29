const REPO = 'quykhanh1603/pip24h';
const BRANCH = 'master';
const GITHUB_API = 'https://api.github.com';

const DEFAULT_ALLOWED_ORIGINS = ['https://pip24h.com', 'https://www.pip24h.com'];

const LIMITS = {
	maxRequestBytes: 3 * 1024 * 1024,
	maxLogoBase64Chars: 2 * 1024 * 1024,
	maxBodyChars: 20000
};

const RATE_LIMIT = {
	windowMs: 60 * 1000,
	maxFailuresPerWindow: 8,
	lockoutMs: 15 * 60 * 1000,
	maxTrackedIps: 2000
};

const ALLOWED_LOGO_EXT = new Set(['png', 'jpg', 'jpeg', 'webp']);

// Defence in depth only: the real protection is the secret + Cloudflare Access.
// Blocks the realistic XSS payloads that could ride along in a markdown body.
const UNSAFE_MARKDOWN = /<\s*(script|iframe|object|embed|style|link|meta)\b|javascript\s*:|data:text\/html|on[a-z]+\s*=/i;

// Per-isolate brute-force state. Workers isolates are recycled, so this slows an
// attacker down rather than hard-stopping them; pair it with Cloudflare Access.
const ipState = new Map();

function getAllowedOrigins(env) {
	const raw = typeof env.ALLOWED_ORIGINS === 'string' ? env.ALLOWED_ORIGINS : '';
	const list = raw
		.split(',')
		.map((origin) => origin.trim())
		.filter((origin) => origin.length > 0);
	return list.length > 0 ? list : DEFAULT_ALLOWED_ORIGINS;
}

function corsHeaders(request, env) {
	const origin = request.headers.get('origin') || '';
	const headers = {
		'access-control-allow-methods': 'POST, OPTIONS',
		'access-control-allow-headers': 'content-type, x-publish-secret',
		'access-control-max-age': '600',
		vary: 'Origin'
	};
	if (getAllowedOrigins(env).includes(origin)) {
		headers['access-control-allow-origin'] = origin;
	}
	return headers;
}

function getClientIp(request) {
	const direct = request.headers.get('cf-connecting-ip');
	if (direct) return direct;
	const forwarded = request.headers.get('x-forwarded-for');
	return forwarded ? forwarded.split(',')[0].trim() : 'unknown';
}

function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

function stateFor(ip) {
	const now = Date.now();
	let state = ipState.get(ip);
	if (!state) {
		if (ipState.size >= RATE_LIMIT.maxTrackedIps) {
			const oldest = ipState.keys().next();
			if (!oldest.done) ipState.delete(oldest.value);
		}
		state = { windowStart: now, failures: 0, lockedUntil: 0 };
		ipState.set(ip, state);
	}
	if (!state.lockedUntil && now - state.windowStart > RATE_LIMIT.windowMs) {
		state.windowStart = now;
		state.failures = 0;
	}
	return state;
}

function lockoutRemaining(ip) {
	const state = stateFor(ip);
	const now = Date.now();
	if (state.lockedUntil && now < state.lockedUntil) {
		return Math.ceil((state.lockedUntil - now) / 1000);
	}
	if (state.lockedUntil) {
		state.lockedUntil = 0;
		state.failures = 0;
		state.windowStart = now;
	}
	return 0;
}

function recordFailure(ip) {
	const state = stateFor(ip);
	state.failures += 1;
	if (state.failures >= RATE_LIMIT.maxFailuresPerWindow) {
		state.lockedUntil = Date.now() + RATE_LIMIT.lockoutMs;
		state.failures = 0;
	}
}

function clearFailures(ip) {
	ipState.delete(ip);
}

// Hash both sides first so the comparison neither leaks the length nor lets the
// runtime short-circuit on the first differing character.
async function secretMatches(provided, expected) {
	if (typeof expected !== 'string' || expected.length === 0) return false;
	if (typeof provided !== 'string' || provided.length === 0) return false;
	const encoder = new TextEncoder();
	const [a, b] = await Promise.all([
		crypto.subtle.digest('SHA-256', encoder.encode(provided)),
		crypto.subtle.digest('SHA-256', encoder.encode(expected))
	]);
	const left = new Uint8Array(a);
	const right = new Uint8Array(b);
	let diff = 0;
	for (let i = 0; i < left.length; i += 1) diff |= left[i] ^ right[i];
	return diff === 0;
}

function isHttpUrl(value) {
	try {
		const url = new URL(String(value));
		return url.protocol === 'https:' || url.protocol === 'http:';
	} catch {
		return false;
	}
}

function json(data, status = 200, extraHeaders = {}) {
	return new Response(JSON.stringify(data), {
		status,
		headers: {
			'content-type': 'application/json; charset=utf-8',
			'cache-control': 'no-store',
			...extraHeaders
		}
	});
}

function slugify(name) {
	return name
		.toLowerCase()
		.replace(/đ/g, 'd')
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.replace(/[^a-z0-9]+/g, '')
		.trim();
}

function yamlString(value) {
	return `"${String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

function yamlList(key, items) {
	const arr = (items || []).filter((s) => String(s).trim().length > 0);
	if (arr.length === 0) return `${key}: []`;
	return `${key}:\n${arr.map((item) => `  - ${yamlString(item)}`).join('\n')}`;
}

function buildMarkdown(data, logoPath) {
	const lines = ['---'];
	lines.push(`name: ${yamlString(data.name)}`);
	lines.push(`logo: ${yamlString(logoPath)}`);
	lines.push(`assetType: ${yamlString(data.assetType)}`);
	lines.push(`rating: ${Number(data.rating)}`);
	lines.push(`summary: ${yamlString(data.summary)}`);
	if (data.foundedYear) lines.push(`foundedYear: ${Number(data.foundedYear)}`);
	if (data.minDeposit) lines.push(`minDeposit: ${yamlString(data.minDeposit)}`);
	if (data.spreadFrom) lines.push(`spreadFrom: ${yamlString(data.spreadFrom)}`);
	if (data.maxLeverage) lines.push(`maxLeverage: ${yamlString(data.maxLeverage)}`);
	lines.push(`instantWithdrawal: ${!!data.instantWithdrawal}`);
	lines.push(yamlList('category', data.category));
	if (data.badge) lines.push(`badge: ${yamlString(data.badge)}`);
	lines.push(yamlList('regulation', data.regulation));
	lines.push(yamlList('platforms', data.platforms));
	lines.push(yamlList('pros', data.pros));
	lines.push(yamlList('cons', data.cons));
	lines.push(`affiliateUrl: ${yamlString(data.affiliateUrl || 'AFF_LINK_PLACEHOLDER')}`);
	lines.push(`featured: ${!!data.featured}`);
	lines.push(`updatedDate: ${new Date().toISOString().slice(0, 10)}`);
	lines.push('---');
	lines.push('');
	lines.push(data.body || '');
	return lines.join('\n');
}

function toBase64(str) {
	const bytes = new TextEncoder().encode(str);
	let binary = '';
	bytes.forEach((b) => (binary += String.fromCharCode(b)));
	return btoa(binary);
}

async function githubRequest(env, path, options = {}) {
	const res = await fetch(`${GITHUB_API}${path}`, {
		...options,
		headers: {
			Authorization: `Bearer ${env.GITHUB_PAT}`,
			Accept: 'application/vnd.github+json',
			'User-Agent': 'pip24h-publish-worker',
			...(options.headers || {})
		}
	});
	return res;
}

async function getExistingSha(env, path) {
	const res = await githubRequest(env, `/repos/${REPO}/contents/${path}?ref=${BRANCH}`);
	if (res.status === 200) {
		const data = await res.json();
		return data.sha;
	}
	return null;
}

async function putFile(env, path, base64Content, message) {
	const sha = await getExistingSha(env, path);
	const res = await githubRequest(env, `/repos/${REPO}/contents/${path}`, {
		method: 'PUT',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({
			message,
			content: base64Content,
			branch: BRANCH,
			...(sha ? { sha } : {})
		})
	});
	if (!res.ok) {
		const errText = await res.text();
		throw new Error(`GitHub API error (${res.status}) for ${path}: ${errText}`);
	}
	return res.json();
}

export default {
	async fetch(request, env) {
		const cors = corsHeaders(request, env);

		if (request.method === 'OPTIONS') {
			return new Response(null, { status: 204, headers: cors });
		}
		if (request.method !== 'POST') {
			return json({ success: false, error: 'Method not allowed' }, 405, cors);
		}

		const ip = getClientIp(request);
		const lockedFor = lockoutRemaining(ip);
		if (lockedFor > 0) {
			return json(
				{
					success: false,
					error: `Quá nhiều lần sai mật khẩu. Thử lại sau ${Math.ceil(lockedFor / 60)} phút.`
				},
				429,
				{ ...cors, 'retry-after': String(lockedFor) }
			);
		}

		const declaredLength = Number(request.headers.get('content-length') || 0);
		if (declaredLength > LIMITS.maxRequestBytes) {
			return json({ success: false, error: 'Payload quá lớn' }, 413, cors);
		}
		const rawBody = await request.text();
		if (rawBody.length > LIMITS.maxRequestBytes) {
			return json({ success: false, error: 'Payload quá lớn' }, 413, cors);
		}

		let payload;
		try {
			payload = JSON.parse(rawBody);
		} catch {
			return json({ success: false, error: 'Invalid JSON body' }, 400, cors);
		}
		if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
			return json({ success: false, error: 'Invalid JSON body' }, 400, cors);
		}

		const providedSecret = request.headers.get('x-publish-secret') || '';
		const authorized = await secretMatches(providedSecret, env.PUBLISH_SECRET);
		if (!authorized) {
			recordFailure(ip);
			await sleep(400);
			return json({ success: false, error: 'Sai mật khẩu đăng bài' }, 401, cors);
		}
		clearFailures(ip);

		const { lang, name, logoBase64, logoExt } = payload;
		if (lang !== 'ja' && lang !== 'en') {
			return json({ success: false, error: 'Ngôn ngữ không hợp lệ' }, 400, cors);
		}
		if (typeof name !== 'string' || !name.trim() || typeof payload.summary !== 'string' || !payload.summary.trim()) {
			return json({ success: false, error: 'Thiếu trường bắt buộc (tên sàn / mô tả / điểm)' }, 400, cors);
		}
		if (payload.rating === undefined) {
			return json({ success: false, error: 'Thiếu trường bắt buộc (tên sàn / mô tả / điểm)' }, 400, cors);
		}
		const rating = Number(payload.rating);
		if (!Number.isFinite(rating) || rating < 0 || rating > 10) {
			return json({ success: false, error: 'Điểm đánh giá phải trong khoảng 0-10' }, 400, cors);
		}
		if (typeof payload.body === 'string') {
			if (payload.body.length > LIMITS.maxBodyChars) {
				return json({ success: false, error: 'Nội dung bài viết quá dài' }, 413, cors);
			}
			if (UNSAFE_MARKDOWN.test(payload.body)) {
				return json(
					{
						success: false,
						error: 'Nội dung chứa HTML/JS không được phép (script, iframe, javascript:, on*=)'
					},
					400,
					cors
				);
			}
		}
		if (payload.affiliateUrl && !isHttpUrl(payload.affiliateUrl)) {
			return json(
				{ success: false, error: 'Link affiliate phải bắt đầu bằng http:// hoặc https://' },
				400,
				cors
			);
		}
		if (logoBase64 && typeof logoBase64 !== 'string') {
			return json({ success: false, error: 'Logo không hợp lệ' }, 400, cors);
		}
		if (typeof logoBase64 === 'string' && logoBase64.length > LIMITS.maxLogoBase64Chars) {
			return json({ success: false, error: 'Ảnh logo quá lớn' }, 413, cors);
		}

		const slug = payload.slug ? slugify(payload.slug) : slugify(name);
		if (!slug) {
			return json({ success: false, error: 'Không tạo được slug từ tên sàn' }, 400, cors);
		}

		const contentPath = `src/content/brokers/${lang}/${slug}.md`;

		try {
			let logoPath = `/images/brokers/${slug}/logo.png`;
			if (logoBase64 && logoExt) {
				const ext = String(logoExt).replace(/[^a-z0-9]/gi, '').toLowerCase() || 'png';
				if (!ALLOWED_LOGO_EXT.has(ext)) {
					return json({ success: false, error: 'Logo chỉ hỗ trợ png, jpg hoặc webp' }, 400, cors);
				}
				logoPath = `/images/brokers/${slug}/logo.${ext}`;
			}

			const existingSha = await getExistingSha(env, contentPath);
			if (existingSha && payload.overwrite !== true) {
				return json(
					{
						success: false,
						error: `Bài "${slug}" (${lang}) đã tồn tại — gửi kèm "overwrite": true nếu thật sự muốn ghi đè.`
					},
					409,
					cors
				);
			}

			if (logoBase64 && logoExt) {
				const ext = String(logoExt).replace(/[^a-z0-9]/gi, '').toLowerCase() || 'png';
				await putFile(
					env,
					`public/images/brokers/${slug}/logo.${ext}`,
					logoBase64,
					`chore: upload logo for ${slug} via publish form`
				);
			}

			const markdown = buildMarkdown({ ...payload, rating }, logoPath);
			await putFile(env, contentPath, toBase64(markdown), `content: publish ${slug} (${lang}) via publish form`);

			return json({ success: true, slug, path: contentPath }, 200, cors);
		} catch (err) {
			console.error('publish failed:', err && err.stack ? err.stack : err);
			return json(
				{ success: false, error: 'Lỗi máy chủ khi ghi nội dung. Xem log worker pip24h-publish.' },
				502,
				cors
			);
		}
	}
};
