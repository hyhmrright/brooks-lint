// Generates the README star-history chart from first-party GitHub data.
//
// GitHub restricted the public stargazers API to a repository's own admins and
// collaborators (announced 2026-06-30), which broke every third-party chart
// service — api.star-history.com now serves an error card instead of a chart.
// We own this repo, so we read the star data ourselves and commit the result,
// keeping the README free of any third-party image host.
//
// The committed dataset, not the drawing, is the source of truth: the SVG is a
// pure function of assets/star-history.json. That keeps the chart re-renderable
// with no credentials if the endpoint tightens further, keeps the weekly diff
// readable (dates, not shifted path coordinates), and lets `npm run validate`
// prove the two files agree.
//
// Run: node scripts/gen-star-history.mjs                → refetch, rewrite both files
//      node scripts/gen-star-history.mjs --render-only   → redraw the SVG offline
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
// README-only assets, so they live in assets/ alone — unlike the banners, the
// GitHub Pages site under docs/ does not render them.
const OUT = join(ROOT, "assets", "star-history.svg");
const DATA = join(ROOT, "assets", "star-history.json");

const REPO = process.env.GITHUB_REPOSITORY ?? "hyhmrright/brooks-lint";

const W = 800, H = 400;
const PAD = { top: 44, right: 24, bottom: 48, left: 64 };
const PLOT_W = W - PAD.left - PAD.right;
const PLOT_H = H - PAD.top - PAD.bottom;
const ACCENT = "#3b82f6"; // matches the logo palette used by gen-banner.mjs
const FONT = `-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif`;

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// The stargazers endpoint is no longer public: it needs credentials that can
// read this repo. CI supplies GITHUB_TOKEN; locally we borrow the gh CLI's.
function resolveToken() {
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN;
  try {
    return execFileSync("gh", ["auth", "token"], { encoding: "utf8" }).trim();
  } catch {
    throw new Error(
      "No GITHUB_TOKEN set and `gh auth token` failed. Since GitHub restricted " +
        "the stargazers API, this script needs credentials for a repo admin or collaborator.",
    );
  }
}

// Returns the raw starred_at strings, oldest first — exactly what we commit.
async function fetchStarTimestamps(token) {
  const stamps = [];
  for (let page = 1; ; page++) {
    const url = `https://api.github.com/repos/${REPO}/stargazers?per_page=100&page=${page}`;
    const res = await fetch(url, {
      headers: {
        // The star+json media type is what adds starred_at to each entry.
        Accept: "application/vnd.github.star+json",
        Authorization: `Bearer ${token}`,
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "brooks-lint-gen-star-history",
      },
    });
    // Past 400 pages GitHub answers 422 rather than paginating, so a repo above
    // 40,000 stars can no longer be read in full — the committed dataset is what
    // preserves the history when that day comes.
    if (!res.ok) {
      throw new Error(`GitHub API ${res.status} on page ${page}: ${(await res.text()).slice(0, 200)}`);
    }
    const batch = await res.json();
    for (const entry of batch) {
      // A missing starred_at means the star+json media type stopped being
      // honoured. Fail loudly rather than plot NaN coordinates.
      if (Number.isNaN(Date.parse(entry.starred_at))) {
        throw new Error(`Stargazer without a usable starred_at on page ${page}.`);
      }
      stamps.push(entry.starred_at);
    }
    if (batch.length < 100) return stamps.sort((a, b) => Date.parse(a) - Date.parse(b));
  }
}

export function readStamps() {
  return JSON.parse(readFileSync(DATA, "utf8")).starredAt;
}

function writeStamps(stamps) {
  // Deliberately no generated-at field: the file has to stay byte-identical when
  // no star was added, or the workflow's "commit only when it moved" guard would
  // fire every single run. Git already records when it last changed.
  writeFileSync(DATA, `${JSON.stringify({ repo: REPO, starredAt: stamps }, null, 2)}\n`);
}

// Round the axis maximum up to a 1/2/5 × 10ⁿ step so tick labels stay readable.
function niceStep(max, targetTicks) {
  const raw = max / targetTicks;
  const mag = 10 ** Math.floor(Math.log10(raw));
  for (const m of [1, 2, 5]) if (raw <= m * mag) return m * mag;
  return 10 * mag;
}

// One tick per month, thinned out so labels never collide on a long history.
function monthTicks(from, to) {
  const all = [];
  const cursor = new Date(from);
  cursor.setUTCDate(1);
  cursor.setUTCHours(0, 0, 0, 0);
  if (cursor.getTime() < from) cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  while (cursor.getTime() <= to) {
    all.push(cursor.getTime());
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }
  const stride = Math.ceil(all.length / 8) || 1;
  return all.filter((_, i) => i % stride === 0);
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function monthLabel(ms, showYear) {
  const d = new Date(ms);
  const month = MONTHS[d.getUTCMonth()];
  return showYear ? `${month} ${d.getUTCFullYear()}` : month;
}

// 1,392 points would bloat the committed SVG for no visible gain. Keep every
// nth sample plus the exact final point, so the headline count stays truthful.
function downsample(points, limit) {
  if (points.length <= limit) return points;
  const stride = Math.ceil(points.length / limit);
  const kept = points.filter((_, i) => i % stride === 0);
  if (kept.at(-1) !== points.at(-1)) kept.push(points.at(-1));
  return kept;
}

export function render(stamps) {
  const times = stamps.map((iso) => Date.parse(iso));
  const total = times.length;
  const t0 = times[0];
  // The axis ends at the newest star rather than at "now". Anchoring it to the
  // clock would shift every x coordinate on every run, so the workflow could
  // never tell a real change from a redraw and would commit noise weekly.
  const t1 = times.at(-1);
  // Stars are whole numbers, so never let a tiny repo produce fractional ticks.
  const step = Math.max(1, niceStep(total, 5));
  const yMax = Math.ceil(total / step) * step;

  const x = (ms) => PAD.left + ((ms - t0) / (t1 - t0)) * PLOT_W;
  const y = (n) => PAD.top + PLOT_H - (n / yMax) * PLOT_H;

  const points = downsample(
    times.map((ms, i) => [ms, i + 1]),
    300,
  );
  const line = points.map(([ms, n], i) => `${i === 0 ? "M" : "L"}${x(ms).toFixed(1)} ${y(n).toFixed(1)}`).join("");
  const area = `${line}L${x(t1).toFixed(1)} ${y(0).toFixed(1)}L${x(t0).toFixed(1)} ${y(0).toFixed(1)}Z`;

  const yTicks = [];
  for (let n = 0; n <= yMax; n += step) yTicks.push(n);

  const xTicks = monthTicks(t0, t1);
  const spansYears = new Date(t0).getUTCFullYear() !== new Date(t1).getUTCFullYear();

  const gridLines = yTicks
    .map(
      (n) =>
        `<line x1="${PAD.left}" y1="${y(n).toFixed(1)}" x2="${PAD.left + PLOT_W}" y2="${y(n).toFixed(1)}" class="grid"/>` +
        `<text x="${PAD.left - 10}" y="${(y(n) + 4).toFixed(1)}" class="tick" text-anchor="end">${n.toLocaleString("en-US")}</text>`,
    )
    .join("\n    ");

  const xLabels = xTicks
    .map(
      (ms, i) =>
        `<text x="${x(ms).toFixed(1)}" y="${PAD.top + PLOT_H + 22}" class="tick" text-anchor="middle">` +
        `${monthLabel(ms, spansYears || i === 0)}</text>`,
    )
    .join("\n    ");

  // Anchoring the axis to the newest star puts the final point exactly on the
  // right edge, so the callout always hangs back inside the plot.
  const lastX = PAD.left + PLOT_W;
  const lastY = y(total);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Star history for ${esc(REPO)}: ${total} stars">
  <style>
    .bg { fill: #ffffff; }
    .title { fill: #111827; font: 600 16px ${FONT}; }
    .sub { fill: #6b7280; font: 400 12px ${FONT}; }
    .tick { fill: #6b7280; font: 400 11px ${FONT}; }
    .grid { stroke: #e5e7eb; stroke-width: 1; }
    .axis { stroke: #d1d5db; stroke-width: 1; }
    .total { fill: ${ACCENT}; font: 600 13px ${FONT}; }
    @media (prefers-color-scheme: dark) {
      .bg { fill: #0d1117; }
      .title { fill: #e6edf3; }
      .sub, .tick { fill: #8b949e; }
      .grid { stroke: #21262d; }
      .axis { stroke: #30363d; }
    }
  </style>
  <defs>
    <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${ACCENT}" stop-opacity="0.28"/>
      <stop offset="100%" stop-color="${ACCENT}" stop-opacity="0.02"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" class="bg"/>
  <text x="${PAD.left}" y="26" class="title">Star History</text>
  <text x="${W - PAD.right}" y="26" class="sub" text-anchor="end">${esc(REPO)}</text>
  <g>
    ${gridLines}
  </g>
  <line x1="${PAD.left}" y1="${PAD.top + PLOT_H}" x2="${PAD.left + PLOT_W}" y2="${PAD.top + PLOT_H}" class="axis"/>
  <path d="${area}" fill="url(#fade)"/>
  <path d="${line}" fill="none" stroke="${ACCENT}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
  <circle cx="${lastX.toFixed(1)}" cy="${lastY.toFixed(1)}" r="4" fill="${ACCENT}"/>
  <text x="${(lastX - 12).toFixed(1)}" y="${(lastY + 4).toFixed(1)}" class="total" text-anchor="end">${total.toLocaleString("en-US")}</text>
  <g>
    ${xLabels}
  </g>
</svg>
`;
}

async function main() {
  const renderOnly = process.argv.includes("--render-only");
  const stamps = renderOnly ? readStamps() : await fetchStarTimestamps(resolveToken());
  // Two points are the minimum a time axis can span; one would divide by zero
  // and silently write a chart full of NaN coordinates.
  if (stamps.length < 2) throw new Error(`Only ${stamps.length} stargazer(s) for ${REPO} — refusing to write a chart.`);
  if (!renderOnly) writeStamps(stamps);
  writeFileSync(OUT, render(stamps));
  console.log(`Wrote ${OUT} — ${stamps.length} stars through ${stamps.at(-1).slice(0, 10)}`);
}

// Importable so `npm run validate` can re-render from the committed data and
// prove the SVG is in sync; only a direct run touches the network or disk.
if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
