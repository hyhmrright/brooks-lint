// Generates the "diagnostic pipeline" hero banner as one SVG per language.
// Layout is identical across languages; only the node text changes.
// Run: node scripts/gen-banner.mjs  → writes assets/banner-<lang>.svg
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
// Mirrored to both dirs, matching the repo's logo.svg / demo.gif convention:
// assets/ for the READMEs, docs/ for the GitHub Pages site.
const OUT_DIRS = ["assets", "docs"].map((d) => join(ROOT, d));

// Four-stage pipeline: input → sources → risks → output.
// Each node carries an accent dot color drawn from the logo palette.
const ACCENTS = ["#3b82f6", "#6366f1", "#b07d2b", "#22c55e"];

// main = short headline, sub = supporting detail. Kept short so centered
// text never overflows the fixed node width across scripts (CJK + Latin).
const LANGS = {
  "en": [
    { main: "Your code", sub: "PR or whole repo" },
    { main: "12 classics", sub: "Brooks · Fowler · Martin" },
    { main: "12 decay risks", sub: "R1–R6 · T1–T6" },
    { main: "Cited findings", sub: "Symptom → Remedy" },
  ],
  "zh-CN": [
    { main: "你的代码", sub: "PR 或整个仓库" },
    { main: "十二本经典", sub: "布鲁克斯 · 福勒 · 马丁" },
    { main: "十二类衰退风险", sub: "R1–R6 · T1–T6" },
    { main: "带出处的结论", sub: "症状 → 对策" },
  ],
  "zh-TW": [
    { main: "你的程式碼", sub: "PR 或整個儲存庫" },
    { main: "十二本經典", sub: "布魯克斯 · 福勒 · 馬丁" },
    { main: "十二類衰退風險", sub: "R1–R6 · T1–T6" },
    { main: "帶出處的結論", sub: "症狀 → 對策" },
  ],
  "ja": [
    { main: "あなたのコード", sub: "PR / リポジトリ全体" },
    { main: "古典12冊", sub: "Brooks · Fowler · Martin" },
    { main: "12の劣化リスク", sub: "R1–R6 · T1–T6" },
    { main: "出典付きの指摘", sub: "症状 → 対策" },
  ],
  "ko": [
    { main: "당신의 코드", sub: "PR / 전체 저장소" },
    { main: "고전 12권", sub: "Brooks · Fowler · Martin" },
    { main: "12가지 리스크", sub: "R1–R6 · T1–T6" },
    { main: "출처 있는 진단", sub: "증상 → 처방" },
  ],
  "es": [
    { main: "Tu código", sub: "PR o repo completo" },
    { main: "12 clásicos", sub: "Brooks · Fowler · Martin" },
    { main: "12 riesgos", sub: "de deterioro · R1–T6" },
    { main: "Hallazgos", sub: "Síntoma → Remedio" },
  ],
};

const W = 1040, H = 200;
const NODE_W = 210, NODE_H = 128, NODE_Y = 36;
const GAP = (W - 40 - NODE_W * 4) / 3; // even gaps, 20px outer margin
const FONT = `-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans", "Microsoft YaHei", "Malgun Gothic", sans-serif`;

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const nodeX = (i) => Math.round(20 + i * (NODE_W + GAP));

function node(i, { main, sub }) {
  const x = nodeX(i), cx = x + NODE_W / 2;
  return `
  <g>
    <rect x="${x}" y="${NODE_Y}" width="${NODE_W}" height="${NODE_H}" rx="16"
          fill="#fffdf8" stroke="#e3d8c2" stroke-width="1.5"/>
    <rect x="${x}" y="${NODE_Y + NODE_H - 4}" width="${NODE_W}" height="4" rx="2" fill="${ACCENTS[i]}"/>
    <circle cx="${cx}" cy="${NODE_Y + 30}" r="7" fill="${ACCENTS[i]}"/>
    <text x="${cx}" y="${NODE_Y + 72}" text-anchor="middle" font-family='${FONT}'
          font-size="19" font-weight="700" fill="#2a2520">${esc(main)}</text>
    <text x="${cx}" y="${NODE_Y + 98}" text-anchor="middle" font-family='${FONT}'
          font-size="13" fill="#5c5347">${esc(sub)}</text>
  </g>`;
}

function arrow(i) {
  const start = nodeX(i) + NODE_W, end = nodeX(i + 1);
  const y = NODE_Y + NODE_H / 2;
  const mid = (start + end) / 2;
  return `
  <g stroke="#b07d2b" stroke-width="2.5" fill="none" stroke-linecap="round">
    <line x1="${start + 6}" y1="${y}" x2="${end - 10}" y2="${y}"/>
    <polyline points="${end - 16},${y - 6} ${end - 8},${y} ${end - 16},${y + 6}" stroke-linejoin="round"/>
  </g>`;
}

function svg(nodes) {
  const body = nodes.map((n, i) => node(i, n)).join("") +
    [0, 1, 2].map(arrow).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="brooks-lint diagnostic pipeline">${body}
</svg>
`;
}

for (const [lang, nodes] of Object.entries(LANGS)) {
  const content = svg(nodes);
  for (const dir of OUT_DIRS) {
    const file = join(dir, `banner-${lang}.svg`);
    writeFileSync(file, content);
    console.log(`wrote ${file}`);
  }
}
