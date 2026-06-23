import fs from "fs";
import path from "path";

const BASE_URL = "http://localhost:4000";
const OUTPUT_DIR = "./html-export";

// 저장할 페이지 목록
const PAGES = [
  "/marketing",
  "/marketing/review/place",
  "/marketing/review/place/visitor",
  "/marketing/review/place/reservation",
  "/marketing/review/place/blog-experience",
  "/marketing/review/place/blog-reporter",
  "/marketing/review/place/manage",
  "/marketing/review/place/manage/visitor",
  "/marketing/review/place/manage/reservation",
  "/marketing/review/place/manage/blog-experience",
  "/marketing/review/shopping",
  "/marketing/review/shopping/blog-experience",
  "/marketing/review/shopping/blog-reporter",
  "/marketing/review/shopping/product-experience",
  "/marketing/review/shopping/manage",
  "/marketing/review/shopping/manage/blog-experience",
  "/marketing/review/shopping/manage/product-experience",
  "/marketing/review/coupang",
  "/marketing/review/coupang/manage",
  "/marketing/reward/place",
  "/marketing/reward/place/manage",
  "/marketing/reward/shopping",
  "/marketing/reward/shopping/manage",
  "/marketing/reward/coupang",
  "/marketing/reward/coupang/manage",
  "/marketing/reward/google",
  "/marketing/reward/google/manage",
  "/marketing/ads/meta",
  "/marketing/ads/naver-cpc",
  "/marketing/ads/naver-cpc-refund",
  "/marketing/community",
  "/marketing/community/board",
  "/marketing/community/cafe",
  "/marketing/community/chatroom",
  "/marketing/community/openchat",
  "/marketing/content/branding",
  "/marketing/content/detail",
  "/marketing/content/homepage",
  "/marketing/content/image",
  "/marketing/content/video",
  "/marketing/experience/blog",
  "/marketing/my/campaigns",
  "/marketing/my/charge",
  "/marketing/notices",
  "/marketing/rank",
];

async function savePage(pagePath) {
  const url = BASE_URL + pagePath;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.log(`  ⚠️  ${pagePath} → HTTP ${res.status}`);
      return;
    }
    let html = await res.text();

    // 상대 경로를 절대 경로로 변환 (오프라인 뷰용)
    html = html.replace(/\/_next\//g, `${BASE_URL}/_next/`);

    // 저장 경로 생성
    const filePath = path.join(OUTPUT_DIR, pagePath, "index.html");
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, html, "utf-8");
    console.log(`  ✅ ${pagePath}`);
  } catch (e) {
    console.log(`  ❌ ${pagePath} → ${e.message}`);
  }
}

async function main() {
  console.log(`\n🚀 HTML 저장 시작 → ${OUTPUT_DIR}\n`);
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  for (const page of PAGES) {
    await savePage(page);
  }

  console.log(`\n✅ 완료! html-export/ 폴더를 확인하세요.\n`);
}

main();
