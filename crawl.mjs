import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const BASE = "http://localhost:4000";
const OUT  = "/Users/hanalcho/Desktop/self-marketing/html-export";

const PAGES = [
  "/marketing",
  "/marketing/notices",
  "/marketing/my/campaigns",
  "/marketing/my/charge",
  "/marketing/community",
  "/marketing/community/board",
  "/marketing/community/openchat",
  "/marketing/community/chatroom",
  "/marketing/content/branding",
  "/marketing/content/homepage",
  "/marketing/content/detail",
  "/marketing/content/video",
  "/marketing/ads/naver-cpc",
  "/marketing/ads/meta",
  "/marketing/rank",
  "/marketing/reward/place",
  "/marketing/reward/shopping",
  "/marketing/reward/coupang",
  "/marketing/reward/google",
  "/marketing/review/place",
  "/marketing/review/shopping",
  "/marketing/review/coupang",
  "/marketing/community/cafe",
  "/marketing/experience/blog",
];

const assets = new Set();

async function fetchPage(path) {
  const url = BASE + path;
  const res = await fetch(url);
  if (!res.ok) { console.log(`SKIP ${path} (${res.status})`); return; }
  let html = await res.text();

  // collect _next asset URLs
  const assetMatches = html.matchAll(/\/_next\/[^"' ]+/g);
  for (const m of assetMatches) assets.add(m[0]);

  // rewrite absolute paths to relative
  html = html.replace(/href="(\/[^"]*)"/g, (_, p) => {
    const rel = p.replace(/^\//, "");
    return `href="${rel}"`;
  });

  const outPath = join(OUT, path === "/" ? "index.html" : path + "/index.html");
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, html, "utf-8");
  console.log(`✓ ${path}`);
}

async function fetchAsset(assetPath) {
  const url = BASE + assetPath;
  try {
    const res = await fetch(url);
    if (!res.ok) return;
    const buf = await res.arrayBuffer();
    const outPath = join(OUT, assetPath);
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, Buffer.from(buf));
  } catch {}
}

console.log("📄 HTML 페이지 크롤링 중...");
for (const page of PAGES) {
  try { await fetchPage(page); } catch (e) { console.log(`ERR ${page}: ${e.message}`); }
}

console.log(`\n📦 에셋 다운로드 중 (${assets.size}개)...`);
let i = 0;
for (const a of assets) {
  await fetchAsset(a);
  i++;
  if (i % 20 === 0) process.stdout.write(`  ${i}/${assets.size}\r`);
}

console.log(`\n✅ 완료 → ${OUT}`);
