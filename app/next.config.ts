import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["*.loca.lt"],

  /*
   * 목업 내보내기 전용 스위치.
   *
   * 목업은 정적 파일로만 도는데, next/image 는 하이드레이션 후 /_next/image?url=... 로
   * 최적화 엔드포인트를 부른다. 서버가 없으니 전부 404 가 되어 이미지가 통째로 깨진다.
   * MOCKUP_EXPORT=1 로 빌드하면 원본 public 경로를 그대로 쓴다.
   *
   * 운영 빌드에는 영향이 없다 — 플래그가 없으면 기존대로 최적화한다.
   */
  images: { unoptimized: process.env.MOCKUP_EXPORT === "1" },

  /*
   * 소개·요금·문의는 홈 한 화면 안의 섹션으로 합쳤다(원페이지).
   * 예전 주소로 들어오는 링크가 죽지 않게 해당 앵커로 넘긴다.
   */
  async redirects() {
    return [
      { source: "/about", destination: "/#about", permanent: false },
      { source: "/pricing", destination: "/#pricing", permanent: false },
      { source: "/contact", destination: "/#contact", permanent: false },
    ];
  },
};

export default nextConfig;
