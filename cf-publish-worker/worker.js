const REPO = 'quykhanh1603/pip24h';
const BRANCH = 'master';
const GITHUB_API = 'https://api.github.com';

const CORS_HEADERS = {
	'access-control-allow-origin': '*',
	'access-control-allow-methods': 'POST, OPTIONS',
	'access-control-allow-headers': 'content-type, x-publish-secret'
};

function json(data, status = 200) {
	return new Response(JSON.stringify(data), {
		status,
		headers: { 'content-type': 'application/json', ...CORS_HEADERS }
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
		if (request.method === 'OPTIONS') {
			return new Response(null, { headers: CORS_HEADERS });
		}
		if (request.method !== 'POST') {
			return json({ success: false, error: 'Method not allowed' }, 405);
		}

		let payload;
		try {
			payload = await request.json();
		} catch {
			return json({ success: false, error: 'Invalid JSON body' }, 400);
		}

		const providedSecret = request.headers.get('x-publish-secret') || '';
		if (!env.PUBLISH_SECRET || providedSecret !== env.PUBLISH_SECRET) {
			return json({ success: false, error: 'Sai mật khẩu đăng bài' }, 401);
		}

		const { lang, name, logoBase64, logoExt } = payload;
		if (lang !== 'vi' && lang !== 'en') {
			return json({ success: false, error: 'Ngôn ngữ không hợp lệ' }, 400);
		}
		if (!name || !payload.summary || payload.rating === undefined) {
			return json({ success: false, error: 'Thiếu trường bắt buộc (tên sàn / mô tả / điểm)' }, 400);
		}

		const slug = payload.slug ? slugify(payload.slug) : slugify(name);
		if (!slug) {
			return json({ success: false, error: 'Không tạo được slug từ tên sàn' }, 400);
		}

		try {
			let logoPath = `/images/brokers/${slug}/logo.png`;
			if (logoBase64 && logoExt) {
				const ext = logoExt.replace(/[^a-z0-9]/gi, '').toLowerCase() || 'png';
				logoPath = `/images/brokers/${slug}/logo.${ext}`;
				await putFile(
					env,
					`public/images/brokers/${slug}/logo.${ext}`,
					logoBase64,
					`chore: upload logo for ${slug} via publish form`
				);
			}

			const markdown = buildMarkdown(payload, logoPath);
			const contentPath = `src/content/brokers/${lang}/${slug}.md`;
			await putFile(env, contentPath, toBase64(markdown), `content: publish ${slug} (${lang}) via publish form`);

			return json({ success: true, slug, path: contentPath });
		} catch (err) {
			return json({ success: false, error: String(err.message || err) }, 502);
		}
	}
};
