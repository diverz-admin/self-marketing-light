import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  return NextResponse.next({ request });
}

export const config = {
  matcher: [
    /*
     * 아래 경로들을 제외한 모든 요청에 대해 미들웨어 작동:
     * - _next/static (정적 자원)
     * - _next/image (이미지 최적화 자원)
     * - favicon.ico (파비콘)
     * - 이미지 확장자 정적 파일
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
