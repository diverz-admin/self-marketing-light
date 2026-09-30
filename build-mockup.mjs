/**
 * BLUE EGG 목업 번들 — 개발자·검토자 전달용.
 *
 * 운영 빌드(next build → next start)를 띄운 뒤 각 화면과 그 화면이 부르는
 * 스크립트·CSS·이미지를 그대로 받아 정적 파일로 굳힌다.
 *
 * 왜 운영 빌드인가 — 개발 빌드는 HMR·온디맨드 컴파일에 기대서 오프라인에서
 * 하이드레이션이 깨진다. 운영 빌드 청크는 그대로 실행되므로 필터·탭·아코디언·
 * 접이식 메뉴·폼 입력이 실제로 동작한다.
 *
 * 왜 서버가 필요한가 — 화면이 /_next/... 절대경로로 스크립트를 부른다. 그래서
 * index.html 직접 열기로는 안 되고, 번들에 동봉한 「열기.command」로 띄워야 한다.
 *
 * 쓰는 법:  npm run build && PORT=4010 npm start   (다른 창)
 *           node build-mockup.mjs
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const BASE = process.env.BASE_URL ?? "http://localhost:4010";
const ROOT = "./mockup";
const ZIP = "./BLUEEGG-목업.zip";

const PAGES = [
  // 진입 화면 — 로그인·회원가입은 플랫폼 밖(레이아웃 없음)이라 따로 적는다
  "/login",
  "/signup",

  // 공개 홈페이지
  "/",
  "/pricing",
  "/about",
  "/contact",

  // 어드민
  "/admin/login",
  "/admin",

  // 마케팅 플랫폼
  "/marketing",
  "/marketing/my/campaigns", "/marketing/my/charge", "/marketing/cart",
  "/marketing/notices", "/marketing/community/board", "/marketing/community/cafe",
  "/marketing/policy", "/marketing/support",

  "/marketing/rank", "/marketing/rank/place", "/marketing/rank/shopping", "/marketing/rank/coupang",

  "/marketing/reward/place", "/marketing/reward/place/manage",
  "/marketing/reward/place/guaranteed", "/marketing/reward/place/guaranteed/manage",
  "/marketing/reward/shopping", "/marketing/reward/shopping/manage",
  "/marketing/reward/coupang", "/marketing/reward/coupang/manage",

  "/marketing/review/place", "/marketing/review/place/blog-reporter",
  "/marketing/review/place/receipt", "/marketing/review/place/visitor",
  "/marketing/review/place/reservation", "/marketing/review/place/blog-experience",
  "/marketing/review/place/manage", "/marketing/review/place/manage/receipt",
  "/marketing/review/shopping", "/marketing/review/shopping/blog-reporter",
  "/marketing/review/shopping/blog-experience", "/marketing/review/shopping/product-experience",
  "/marketing/review/shopping/manage",

  "/marketing/ads/naver-cpc", "/marketing/ads/naver-cpc-refund",
  "/marketing/content/image", "/marketing/content/branding",
  "/marketing/content/homepage", "/marketing/content/detail", "/marketing/content/video",
];

// 이전 빌드의 청크가 남아 섞이지 않도록 매번 비우고 시작한다
fs.rmSync(ROOT, { recursive: true, force: true });


/**
 * 목업 가드 — 붙을 서버가 없어서 생기는 막다른 화면을 막는다.
 *
 *  · Server Action 폼(로그아웃·신청·결제)은 POST 를 쏘는데 정적 서버가 받지 못해
 *    "This page couldn't load" 가 뜬다. 제출을 막고 안내를 띄운다.
 *  · 번들에 담기지 않은 화면으로 가는 링크도 같은 이유로 404 가 된다.
 *
 * document 레벨 리스너만 걸어 DOM 을 건드리지 않는다 — 하이드레이션에 영향이 없다.
 */
const GUARD = `<script>
(function () {
  var PAGES = ${JSON.stringify(PAGES)};
  function toast(msg) {
    var t = document.createElement("div");
    t.textContent = msg;
    t.style.cssText = "position:fixed;left:50%;bottom:32px;transform:translateX(-50%);z-index:2147483647;" +
      "background:#111D37;color:#fff;padding:13px 20px;border-radius:12px;font-size:14px;font-weight:600;" +
      "box-shadow:0 14px 34px rgba(3,10,40,.35);opacity:0;transition:opacity .2s;max-width:92vw;text-align:center";
    document.body.appendChild(t);
    requestAnimationFrame(function () { t.style.opacity = "1"; });
    setTimeout(function () { t.style.opacity = "0"; setTimeout(function () { t.remove(); }, 250); }, 2600);
  }
  /* next/image 되돌리기 — HTML 은 고쳐 두었지만 하이드레이션 후 next/image 가
     다시 /_next/image?url=... 로 바꿔 놓는다. 정적 서버엔 그 엔드포인트가 없어 404 다.
     DOM 을 계속 지켜보며 원본 public 경로로 되돌린다. */
  function fixImg(img) {
    var src = img.getAttribute("src") || "";
    var m = src.match(/\\/_next\\/image\\?url=([^&]+)/);
    if (m) {
      try {
        var dec = decodeURIComponent(m[1]);
        if (dec.charAt(0) === "/") img.setAttribute("src", dec);
      } catch (err) {}
    }
    var ss = img.getAttribute("srcset") || "";
    if (ss.indexOf("/_next/image") > -1) img.removeAttribute("srcset");
  }
  function sweep(root) {
    if (!root || !root.querySelectorAll) return;
    if (root.tagName === "IMG") fixImg(root);
    root.querySelectorAll("img").forEach(fixImg);
  }
  sweep(document);
  new MutationObserver(function (muts) {
    muts.forEach(function (mu) {
      if (mu.type === "attributes") fixImg(mu.target);
      else mu.addedNodes.forEach(sweep);
    });
  }).observe(document.documentElement, {
    subtree: true, childList: true, attributes: true, attributeFilter: ["src", "srcset"],
  });

  document.addEventListener("submit", function (e) {
    e.preventDefault(); e.stopPropagation();
    toast("목업입니다 — 로그아웃·신청·결제 같은 서버 동작은 실행되지 않습니다.");
  }, true);
  document.addEventListener("click", function (e) {
    var a = e.target && e.target.closest && e.target.closest("a[href]");
    if (!a) return;
    var href = a.getAttribute("href") || "";
    if (href.charAt(0) !== "/") return;
    var p = href.split("?")[0].split("#")[0].replace(/\\/$/, "");
    if (PAGES.indexOf(p) === -1) {
      e.preventDefault(); e.stopPropagation();
      toast("이 화면은 목업에 담겨 있지 않습니다 — " + p);
    }
  }, true);
})();
</script>`;

const seen = new Set();

/** /_next/... 등 절대경로 자원을 같은 경로 구조로 받아 둔다 */
async function mirror(url) {
  if (seen.has(url)) return;
  seen.add(url);
  const res = await fetch(BASE + url);
  if (!res.ok) return;
  const buf = Buffer.from(await res.arrayBuffer());
  const file = path.join(ROOT, decodeURIComponent(url.split("?")[0]));
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, buf);

  // CSS 안의 url(...) 도 따라간다 (폰트 등)
  if (url.endsWith(".css")) {
    const css = buf.toString("utf-8");
    for (const m of css.matchAll(/url\((["']?)(\/[^)"']+)\1\)/g)) await mirror(m[2]);
  }
}

/* public/ 전체를 그대로 담는다.
   캐러셀 2·3번 슬라이드처럼 클릭 후에야 DOM 에 나타나는 이미지는
   첫 HTML 에 참조가 없어 크롤만으로는 빠진다. */
fs.cpSync("./app/public", ROOT, { recursive: true });

const results = [];
for (const route of PAGES) {
  try {
    const res = await fetch(BASE + route, { redirect: "follow" });
    if (!res.ok) { results.push({ route, ok: false, note: "HTTP " + res.status }); continue; }
    let html = await res.text();

    // next/image 의 최적화 엔드포인트(/_next/image?url=...)는 정적 서버가 처리하지 못한다.
    // 원본 public 경로로 되돌려 이미지가 깨지지 않게 한다. (srcset 항목도 함께 걸린다)
    html = html.replace(/\/_next\/image\?url=([^"&\s]+)[^"\s]*/g, (m, enc) => {
      try {
        const dec = decodeURIComponent(enc);
        return dec.startsWith("/") ? dec : m;
      } catch { return m; }
    });

    // 이 화면이 부르는 자원을 전부 받아 둔다 — 스크립트는 지우지 않는다
    for (const m of html.matchAll(/(?:src|href)="(\/_next\/[^"]+)"/g)) await mirror(m[1]);
    for (const m of html.matchAll(/(?:src|href)="(\/[^"/][^"]*\.(?:png|jpg|jpeg|svg|webp|ico|woff2?))"/g)) await mirror(m[1]);

    // 서버가 없는 번들이라, 서버로 가는 동작을 막아 막다른 오류 화면을 없앤다
    const guarded = html.replace("</head>", GUARD + "</head>");

    const file = path.join(ROOT, route === "/marketing" ? "/marketing/index.html" : route + "/index.html");
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, guarded, "utf-8");
    results.push({ route, ok: true, bytes: Buffer.byteLength(guarded) });
  } catch (e) {
    results.push({ route, ok: false, note: e.message });
  }
}

const ok = results.filter((r) => r.ok);

/* 여는 도구 — /_next/ 절대경로 때문에 서버가 필요하다 */
fs.writeFileSync(path.join(ROOT, "열기.command"), `#!/bin/bash
cd "$(dirname "$0")"
PORT=8123
echo "BLUE EGG 목업 — http://localhost:$PORT/marketing/ 로 엽니다."
echo "다 보시면 이 창에서 Control+C 를 누르거나 창을 닫으세요."
(sleep 1; open "http://localhost:$PORT/marketing/") &
python3 -m http.server $PORT
`, { mode: 0o755 });

fs.writeFileSync(path.join(ROOT, "읽어보기.txt"), `BLUE EGG 목업
=============

■ 여는 법
  「열기.command」를 더블클릭하세요. 브라우저가 자동으로 열립니다.
  (창이 하나 뜹니다. 다 보고 나면 그 창에서 Control+C 를 누르거나 창을 닫으세요.)

  ※ index.html 을 직접 더블클릭하면 동작하지 않습니다.
    화면이 /_next/... 절대경로로 스크립트를 부르기 때문에 서버가 필요합니다.

■ 되는 것
  · ${ok.length}개 화면 · 사이드바로 자유롭게 이동
  · 상태 필터 카드, 기간 칩, 탭, 아코디언, 접이식 메뉴, 폼 입력 — 실제로 동작합니다

■ 안 되는 것
  · 저장·결제·신청처럼 서버에 쓰는 동작 (붙을 서버가 없습니다)
  · 담기지 않은 화면으로 가는 링크
  · 로그인이 필요한 실데이터 — 비로그인 상태로 수집해 포인트·사용자명이 비어 있고,
    목록은 화면에 내장된 샘플 데이터로 보입니다.

■ 어떻게 만들었나
  운영 빌드(next build)를 띄운 뒤 각 화면과 스크립트를 그대로 받아 정적 파일로
  굳혔습니다. 개발용 핫리로드가 없는 운영 빌드라 오프라인에서도 하이드레이션이
  정상 동작합니다.  (생성 스크립트: build-mockup.mjs)
`, "utf-8");

for (const r of results) {
  console.log(r.ok ? `  OK   ${r.route}` : `  FAIL ${r.route}  ${r.note}`);
}

fs.rmSync(ZIP, { force: true });
execSync(`zip -qr "${ZIP}" mockup -x "*.DS_Store"`, { stdio: "inherit" });
const kb = (fs.statSync(ZIP).size / 1024 / 1024).toFixed(1);
console.log(`\n${ok.length}/${results.length} 화면 · 자원 ${seen.size}개 → ${ZIP} (${kb}MB)\n`);
