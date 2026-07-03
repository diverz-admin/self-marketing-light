/**
 * 플랫폼(서비스) 도메인.
 * 홈페이지(self-marketing-light)에서 "무료로 시작하기 / 로그인" 등
 * 실제 서비스로 진입하는 링크는 이 도메인을 향한다.
 *
 * 배포 환경에서 도메인이 바뀌면 Vercel 환경변수 NEXT_PUBLIC_PLATFORM_URL 로 덮어쓸 수 있다.
 * 미설정 시 아래 기본값을 사용한다.
 */
export const PLATFORM_URL =
  process.env.NEXT_PUBLIC_PLATFORM_URL ?? "https://self-marketing-two.vercel.app";

/** 플랫폼 진입 기본 경로 (로그인/가입 후 도착 지점) */
export const PLATFORM_ENTRY = `${PLATFORM_URL}/marketing`;

/** 플랫폼 내 특정 경로로 향하는 절대 URL 생성 */
export function platformUrl(path = "/marketing") {
  return `${PLATFORM_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
