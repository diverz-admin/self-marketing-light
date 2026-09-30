# 블루에그비즈 랜딩 — 단일 HTML

개발자 전달용으로 뽑은 정적 사본입니다. 프레임워크·빌드 도구 없이 그대로 열립니다.

```
landing-standalone/
├─ index.html        ← 마크업 + CSS + JS 전부 포함 (약 265KB)
├─ assets/
│  ├─ hero-movie-v5.mp4      히어로 배경 영상 (17MB)
│  ├─ blue-egg-logo.png
│  └─ platform/*.jpg         서비스 아코디언 미리보기 5종 + 순위 상세 1종
└─ README.md
```

## 여는 법

- `index.html` 더블클릭 → 바로 열립니다.
- 영상이 안 뜨면(브라우저가 `file://` 자동재생을 막는 경우) 폴더에서 로컬 서버로 여세요.
  ```bash
  npx serve .        # 또는  python3 -m http.server 8080
  ```

## 들어 있는 동작

원본(Next.js + React)의 동작을 바닐라 JS로 옮겼습니다. `index.html` 아래쪽 `<script>` 한 곳에 모여 있습니다.

| 동작 | 설명 |
|---|---|
| 헤더 배경 전환 | 40px 이상 스크롤하면 포인트 그라디언트 바탕이 올라옵니다 |
| 스크롤 등장 | 블록이 화면에 20% 들어오면 한 번만 올라오며 나타납니다 (`.rise-in` / 지표 바는 `.slide-in`) |
| 숫자 롤링 | 지표 바 숫자가 0에서 목표값까지 1.5초 동안 올라갑니다 |
| 히어로 카피 채움 | 스크롤 진행도에 맞춰 글자가 왼쪽부터 흰색으로 차오릅니다 (`--fill`) |
| 서비스 아코디언 | 5초마다 자동 전환 · 커서를 올리면 멈춤 · 직접 고르면 자동 전환 중단 |
| 타깃 롤링 패널 | 3.6초마다 브랜드사 → 사장님 → 대행사 순환, 노드 클릭으로 즉시 이동 |
| 에그 커서 | 마우스를 따라다니는 점 알(canvas). 마우스가 없는 기기에서는 뜨지 않습니다 |

`prefers-reduced-motion`이 켜져 있으면 위 움직임은 모두 꺼지고 최종 상태만 보여줍니다.

## 원본과 다른 점

- 스타일은 Tailwind가 **이미 컴파일한 CSS**가 `<style>`로 들어 있습니다. 클래스명을 고쳐도 새 유틸리티는 생기지 않습니다 — 디자인을 이어서 수정하려면 원본 소스(`app/src/app/(site)/`)에서 작업하는 편이 빠릅니다.
- 이미지는 `next/image` 최적화를 거치지 않은 **원본 파일**입니다 (srcset 없음).
- 링크(로그인·회원가입·무료 체험하기)는 실제 서비스 주소를 그대로 가리킵니다.

## 원본 위치

| 화면 요소 | 소스 |
|---|---|
| 페이지 전체 | `app/src/app/(site)/page.tsx` |
| 헤더 | `app/src/app/(site)/_components/SiteHeader.tsx` |
| 서비스 아코디언 | `app/src/components/ui/accordion-feature-section.tsx` |
| 에그 커서 | `app/src/app/(site)/_components/EggCursor.tsx` + `app/src/components/ui/particle-egg.tsx` |
| 전역 스타일·애니메이션 | `app/src/app/globals.css` |
