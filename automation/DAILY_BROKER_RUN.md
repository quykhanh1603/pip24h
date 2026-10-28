# Daily broker intake — instructions for the scheduled agent

Each run adds up to **10** brokers from `automation/broker-queue.csv` as *data profiles*
(`profileType: "profile"`), then builds the site and pushes to `master` (Cloudflare Pages deploys it).
Work unattended: never stop to ask questions. When unsure, leave a field out or skip the broker — never guess.

## 1. Setup

```sh
npm ci
node scripts/add-brokers.mjs next 10
```

`next` prints the pending rows (`url`, `aff`, `slug`, `logoCandidates`). If it prints `[]`, the queue is
finished: stop without committing anything.

## 2. Research each broker

Use web search and page fetches. Prefer, in order:
1. The broker's own site: legal/regulation page and footer, account types, platforms, deposit page.
2. The regulator's own register (links in `src/data/regulators.ts`) to confirm licence numbers and entities.
3. Reputable secondary sources only to fill gaps, and cite them.

Rules:
- **No invented data.** If a figure is not stated by a source you actually read, omit the field.
- Licence `status: "verified"` only if you saw the licence on the regulator's register during this run
  (set `verifiedDate` to today). Otherwise `"unverified"`. Use `"revoked"` only when the register says so.
- `regulator` must be a key from `src/data/regulators.ts`; for any other regulator use `null` and describe it in `text`.
- If a regulator's **warning list** names the firm (FCA, CONSOB, AMF, ASIC, CySEC, etc.): add a licence-free
  note in `cons` and the body, worded factually ("The FCA lists … on its warning list (checked YYYY-MM-DD)"),
  link it in `sources`, and cap `rating` at 2.0. Never write "scam" or "fraud" yourself.
- `spreadFrom`: lowest advertised spread as "X.X pips" (forex) or "X.XX% maker/taker fee" (crypto exchanges).
- `assetType`: `forex` (forex/CFDs), `crypto` (crypto exchange), `both`.
- `category` (optional): `scalping`, `beginners`, `ecn`, `low-deposit` (min deposit ≤ $10) — only when clearly supported.
- `logo`: use a `logoCandidates` entry only if it is clearly the same brand; otherwise `""`.

### Skip the broker (`"status": "skip"` with `skipReason`) when
- the site is dead, parked or redirects to an unrelated business;
- it is not a retail broker/exchange (prop firm, software vendor, signal service, IB portal, news site);
- it is the same company as an existing broker in `src/content/brokers/en/` under another domain.

## 3. Editorial rating (decide it yourself, 1.0–4.5, one decimal)

Start at 3.0, then:
- +0.5 holds a top-tier licence (tier 1 in `regulators.ts`); else +0.25 for a tier-2 licence
- −0.5 if only offshore (tier 3) licences; −1.0 if no licence found at all
- +0.25 operating 10+ years; −0.25 under 3 years
- +0.25 fees and account specs clearly published; −0.25 if key information is missing
- ±0.25 for clear reputation evidence (e.g. Trustpilot ≥ 4.2 with 500+ reviews / widespread withdrawal complaints)
- regulator warning list: cap at 2.0

4.6–5.0 is reserved for hands-on reviews; profiles never exceed 4.5.

## 4. Write the content

Write one JSON file per broker to `automation/inbox/<slug>.json`, in the format of
`automation/broker-schema.example.json`. Always set `queueUrl` to the queue `url`. Keep the queue's `slug`
unless it doesn't read as the brand (e.g. `forex` for FOREX.com → `forexcom`, `z` for z.com → `gmoclick`);
a new slug must be lowercase, unique and not already in `src/content/brokers/en/`.

- `en.body`: 200–400 words of neutral, factual Markdown with `##` headings: regulation and safety,
  trading conditions, platforms, who it suits. Do **not** claim Pip24h opened an account or tested anything.
- `ja`: natural Japanese written for Japanese readers, same facts, no added claims. Localise `minDeposit` /
  `maxLeverage` wording if helpful (e.g. "最大500倍").
- `summary`: one sentence. `pros` / `cons`: 2–4 items each, each backed by the facts above.

## 5. Import, build, publish

```sh
node scripts/add-brokers.mjs import
```

`import` validates each JSON, writes `src/content/brokers/{en,ja}/<slug>.md`, marks the queue row
`done` / `skipped`, archives the JSON to `automation/processed/<date>/`, and auto-adds `noindex: true` to thin
profiles. Files that fail validation stay in `automation/inbox/` with the reason printed — fix and re-run `import`.

Then:

```sh
npm run build
```

If the build fails because of a new broker file, fix that file; if it can't be fixed, delete its two `.md`
files, set its queue row to `failed` with a short note, and build again. Never edit other site code in this run.

Finally commit only `src/content/brokers/`, `automation/` and push:

```sh
git add src/content/brokers automation
git commit -m "content: add broker profiles (YYYY-MM-DD)"
git pull --rebase origin master   # the calendar workflow commits every 6 hours
git push origin master
```

If nothing was added or skipped, do not commit.
