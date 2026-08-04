/**
 * 로그인 없이 둘러보는 모드.
 *
 * 기획 검토용으로 화면을 열어 두기 위해 로그인 게이트를 걷어 둔 상태다.
 *   · 고객 화면 : 미로그인 방문자에게 데모 회원의 데이터를 보여준다
 *   · 어드민    : 로그인 없이 콘솔에 들어갈 수 있다
 *
 * 로그인을 다시 켜려면 환경변수 REQUIRE_LOGIN=1 을 넣는다 (코드 수정 불필요).
 *   vercel env add REQUIRE_LOGIN production   → 값 1
 *
 * 주의: 켜져 있는 동안에는 URL 을 아는 누구나 어드민 콘솔에 접근할 수 있다.
 */
export const LOGIN_DISABLED = process.env.REQUIRE_LOGIN !== "1";
