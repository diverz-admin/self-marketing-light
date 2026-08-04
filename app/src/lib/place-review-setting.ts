/**
 * 고객이 플레이스 리뷰 신청 폼에 채운 값을 어드민에서 읽기 위한 해석기.
 *
 * 폼마다 저장하는 항목이 다르다.
 *   · 블로그배포(blog_distribute) : 포스팅 유형 · 해시태그 · 업체 정보 · 이미지 전달 방식
 *   · 영수증리뷰(receipt)         : 영수증 첨부 여부 · 사업자번호 · 강조 내용
 * 두 폼 모두 발행 일수와 일발행량으로 총 건수를 만든다.
 */

export type DetailField = {
  label: string;
  /** text=한 줄, long=여러 줄, tags=칩 목록, link=새 창 링크 */
  kind: "text" | "long" | "tags" | "link";
  value: string;
  tags?: string[];
};

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const int = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : 0);

/** 발행 일수 × 일발행량 — 두 유형이 공통으로 쓰는 스케줄 */
export function placeReviewSchedule(setting: Record<string, unknown>) {
  const issueDays = int(setting.issueDays);
  const dailyVolume = int(setting.dailyVolume);
  return { issueDays, dailyVolume, total: issueDays * dailyVolume };
}

/** 유형별 신청 내용 — 값이 빈 항목은 아예 내보내지 않는다 */
export function placeReviewDetails(
  reviewType: string,
  setting: Record<string, unknown>,
): DetailField[] {
  const fields: DetailField[] = [];

  if (reviewType === "blog_distribute") {
    const postingType = str(setting.postingType);
    if (postingType) fields.push({ label: "포스팅 유형", kind: "text", value: postingType });

    const hashtags = Array.isArray(setting.hashtags)
      ? setting.hashtags.map((t) => String(t)).filter(Boolean)
      : [];
    if (hashtags.length) fields.push({ label: "해시태그", kind: "tags", value: "", tags: hashtags });

    const businessInfo = str(setting.businessInfo);
    if (businessInfo) fields.push({ label: "업체 정보", kind: "long", value: businessInfo });

    const useCustomImage = setting.useCustomImage === true;
    fields.push({
      label: "이미지",
      kind: "text",
      value: useCustomImage ? "직접 전달 (구글 드라이브)" : "플레이스 등록 이미지 사용",
    });
    const postingUrl = str(setting.postingUrl);
    if (useCustomImage && postingUrl) {
      fields.push({ label: "이미지 링크", kind: "link", value: postingUrl });
    }
    return fields;
  }

  if (reviewType === "receipt") {
    // 미첨부는 "작업으로 진행"이라 사업자번호가 필수다
    const attached = setting.receiptAttached !== false;
    fields.push({ label: "영수증 첨부", kind: "text", value: attached ? "첨부" : "미첨부" });

    const bizNumber = str(setting.bizNumber);
    if (!attached) {
      fields.push({ label: "사업자번호", kind: "text", value: bizNumber || "미입력" });
    }

    const emphasis = str(setting.emphasis);
    if (emphasis) fields.push({ label: "강조 내용", kind: "long", value: emphasis });
    return fields;
  }

  return fields;
}
