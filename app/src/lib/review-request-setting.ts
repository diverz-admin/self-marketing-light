/**
 * 고객이 리뷰 신청 폼에 채운 값을 어드민에서 읽기 위한 해석기.
 *
 * 폼마다 저장하는 항목이 다르다.
 *   · 블로그배포(blog_distribute)        : 포스팅 유형 · 해시태그 · 업체 정보 · 이미지 전달 방식
 *   · 영수증리뷰(receipt)                : 영수증 첨부 여부 · 사업자번호 · 강조 내용
 *   · 제품제공/미제공(product_*)         : 채널 · 제목 유형 · 포토리뷰 · 작성 가이드
 *
 * 스케줄 표기도 폼마다 다르다.
 *   · 플레이스 : 발행 일수 × 일발행량
 *   · 쇼핑     : 일 작업량만
 */

export type DetailField = {
  label: string;
  /** text=한 줄, long=여러 줄, tags=칩 목록, link=새 창 링크 */
  kind: "text" | "long" | "tags" | "link";
  value: string;
  tags?: string[];
  /** 고객이 채우지 않은 항목 — 화면에서 "미입력"으로 흐리게 보여준다 */
  empty?: boolean;
};

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const int = (v: unknown) => {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() && Number.isFinite(Number(v))) return Number(v);
  return 0;
};

/** 목록에 한 줄로 얹는 스케줄 표기 — 없으면 null */
export function reviewScheduleText(setting: Record<string, unknown>): string | null {
  const issueDays = int(setting.issueDays);
  const dailyVolume = int(setting.dailyVolume);
  if (issueDays > 0 && dailyVolume > 0) return `${issueDays}일 × ${dailyVolume.toLocaleString()}건`;

  // 쇼핑 폼은 일 작업량만 받는다
  const dailyCount = int(setting.dailyCount);
  if (dailyCount > 0) return `일 ${dailyCount.toLocaleString()}건`;
  return null;
}

/** 상세 패널의 스케줄 한 줄 — 총 건수까지 덧붙인다 */
export function reviewScheduleDetail(setting: Record<string, unknown>): string | null {
  const issueDays = int(setting.issueDays);
  const dailyVolume = int(setting.dailyVolume);
  if (issueDays > 0 && dailyVolume > 0) {
    const total = issueDays * dailyVolume;
    return `${issueDays}일 × ${dailyVolume.toLocaleString()}건 = 총 ${total.toLocaleString()}건`;
  }
  const dailyCount = int(setting.dailyCount);
  if (dailyCount > 0) return `일 ${dailyCount.toLocaleString()}건`;
  return null;
}

const text = (label: string, value: string): DetailField => ({
  label,
  kind: "text",
  value: value || "미입력",
  empty: !value,
});

const long = (label: string, value: string): DetailField => ({
  label,
  kind: value ? "long" : "text",
  value: value || "미입력",
  empty: !value,
});

/**
 * 유형별 신청 내용.
 * 값이 비어도 항목은 남긴다 — 무엇이 안 채워졌는지 보이는 편이 셋팅에 도움이 된다.
 * (조건부로만 존재하는 항목은 조건이 맞을 때만 넣는다)
 */
export function reviewRequestDetails(
  reviewType: string,
  setting: Record<string, unknown>,
  /** 폼의 자유 입력 — 쇼핑은 작성 가이드가 여기로 들어온다 */
  requestNote?: string | null,
): DetailField[] {
  if (reviewType === "blog_distribute") {
    const hashtags = Array.isArray(setting.hashtags)
      ? setting.hashtags.map((t) => String(t)).filter(Boolean)
      : [];
    const useCustomImage = setting.useCustomImage === true;
    const postingUrl = str(setting.postingUrl);

    const fields: DetailField[] = [
      text("포스팅 유형", str(setting.postingType)),
      hashtags.length
        ? { label: "해시태그", kind: "tags", value: "", tags: hashtags }
        : { label: "해시태그", kind: "text", value: "미입력", empty: true },
      long("업체 정보", str(setting.businessInfo)),
      {
        label: "이미지",
        kind: "text",
        value: useCustomImage ? "직접 전달 (구글 드라이브)" : "플레이스 등록 이미지 사용",
      },
    ];
    // 직접 전달일 때만 드라이브 링크가 의미 있다
    if (useCustomImage) {
      fields.push(
        postingUrl
          ? { label: "이미지 링크", kind: "link", value: postingUrl }
          : { label: "이미지 링크", kind: "text", value: "미입력", empty: true },
      );
    }
    return fields;
  }

  if (reviewType === "receipt") {
    // 미첨부는 "작업으로 진행"이라 사업자번호가 필수다
    const attached = setting.receiptAttached !== false;
    const fields: DetailField[] = [
      { label: "영수증 첨부", kind: "text", value: attached ? "첨부" : "미첨부" },
    ];
    if (!attached) fields.push(text("사업자번호", str(setting.bizNumber)));
    fields.push(long("강조 내용", str(setting.emphasis)));
    return fields;
  }

  if (reviewType === "product_provided" || reviewType === "product_not_provided") {
    const photoReview = setting.photoReview === true;
    const postingUrl = str(setting.postingUrl);

    const fields: DetailField[] = [
      text("채널", str(setting.channel)),
      text("제목 유형", str(setting.titleType)),
      { label: "포토리뷰", kind: "text", value: photoReview ? "사용" : "사용 안 함" },
    ];
    // 포토리뷰를 쓸 때만 이미지 링크가 의미 있다
    if (photoReview) {
      fields.push(
        postingUrl
          ? { label: "이미지 링크", kind: "link", value: postingUrl }
          : { label: "이미지 링크", kind: "text", value: "미입력", empty: true },
      );
    }
    fields.push(long("작성 가이드", str(requestNote)));
    return fields;
  }

  return [];
}
