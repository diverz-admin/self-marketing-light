# BLUE EGG biz

셀프 마케팅 플랫폼. Next.js 16 (App Router) · Supabase 인증 · Drizzle ORM(Postgres).

## 구동

```bash
npm install                 # app/ 에 설치됩니다 (루트 package.json 이 위임)
cp .env.example app/.env.local
# app/.env.local 에 실제 값을 채웁니다 (아래 '환경변수' 참고)
npm run dev                 # http://localhost:8080
```

운영 빌드로 확인하려면:

```bash
npm run build
npm start
```

## 환경변수 (`app/.env.local`)

| 키 | 용도 |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL — 로그인/회원가입 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `DATABASE_URL` | Postgres 접속 문자열 — Drizzle ORM |

**값은 이 저장소에 없습니다.** 담당자에게 별도로 받아 주세요.

## DB

```bash
npm run db:push       # 스키마 반영
npm run db:studio     # Drizzle Studio
npm run db:generate   # 마이그레이션 생성
```

스키마: `app/src/db/schema.ts` · 마이그레이션: `app/drizzle/`

## 구조

```
app/src/app/(platform)/     로그인·회원가입·마케팅 플랫폼·어드민
app/src/app/(site)/         공개 홈페이지
app/src/components/         공용 컴포넌트
app/src/lib/                도메인 로직 (정책·포인트·캠페인 등)
app/src/db/                 Drizzle 스키마
app/src/app/globals.css     디자인 토큰 (컬러·타이포·라운드)
```

주요 화면 진입점

| 경로 | 화면 |
|---|---|
| `/` | 공개 홈페이지 |
| `/login`, `/signup` | 로그인 · 회원가입 |
| `/marketing` | 플랫폼 대시보드 |
| `/marketing/rank` | 통합 순위관리 |
| `/marketing/reward/*` | 리워드 마케팅 |
| `/marketing/review/*` | 리뷰·체험단 |
| `/admin` | 어드민 콘솔 |

## 목업 내보내기

디자인 검토용 정적 번들을 만드는 스크립트입니다. 앱 구동과는 무관합니다.

```bash
MOCKUP_EXPORT=1 npm run build
cd app && MOCKUP_EXPORT=1 PORT=4010 npm start   # 다른 창
node build-mockup.mjs                            # → BLUEEGG-목업.zip
```

`MOCKUP_EXPORT=1` 은 `next.config.ts` 에서 `images.unoptimized` 를 켭니다.
목업은 정적 파일로만 돌아서 `/_next/image` 최적화 엔드포인트가 없기 때문입니다.
**플래그 없이 빌드하면 운영 동작은 기존과 동일합니다.**

## 참고

- 운영정책 원문: `BLUEEGG_운영정책_rev11_20260902.pdf`
- 디자인 토큰을 직접 고치지 말고 `globals.css` 의 CSS 변수를 통해 바꾸세요.
