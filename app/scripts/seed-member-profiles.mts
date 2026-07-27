// 회원 상세 모달 확인용 가입정보 샘플.
// clear-admin-sample.mts 로 함께 정리된다.
import { db } from "../src/db/index.js";
import { users, memberProfiles } from "../src/db/schema.js";
import { asc } from "drizzle-orm";

const rows = await db.select().from(users).orderBy(asc(users.createdAt));

const ORGS: Record<string, { org: string; type: string; cond: string; cat: string }> = {
  advertiser: { org: "", type: "광고주", cond: "서비스업", cat: "음식점업" },
  supplier: { org: "", type: "대행사", cond: "서비스업", cat: "광고대행업" },
  admin: { org: "주식회사 블루에그", type: "본사", cond: "서비스업", cat: "광고대행업" },
};

// 순위·리뷰 샘플에서 각 회원이 쓰는 업체와 조직명을 일치시킨다.
// (예: 김서준은 "미도인 강남점" 키워드를 돌리고 있으므로 조직명도 미도인)
const ORG_BY_EMAIL: Record<string, string> = {
  "seojun.kim@example.com": "미도인 에프앤비",
  "hayoon.lee@example.com": "사운드랩",
  "doyoon.park@example.com": "아웃도어랩",
  "jiwoo.choi@example.com": "커피살롱",
  "minseo.jung@example.com": "스위트랩",
  "yeeun.kang@example.com": "리틀우드",
  "blogger.han@example.com": "한블로그 미디어",
  "influ.yoon@example.com": "윤인플루언서",
  "cafe.jang@example.com": "장카페 네트웍스",
};

const bizNo = (i: number) => {
  const a = String(100 + i).slice(0, 3);
  const b = String(10 + (i % 80)).padStart(2, "0");
  const c = String(10000 + i * 137).slice(0, 5);
  return `${a}-${b}-${c}`;
};

let n = 0;
for (const u of rows) {
  const base = ORGS[u.role] ?? ORGS.advertiser;
  const orgName = u.role === "admin" ? base.org : (ORG_BY_EMAIL[u.email] ?? "");
  const username = u.email.split("@")[0].replace(/\./g, "_");

  await db
    .insert(memberProfiles)
    .values({
      userId: u.id,
      username,
      phone: `010-${String(1000 + n * 137).slice(0, 4)}-${String(2000 + n * 311).slice(0, 4)}`,
      orgName,
      orgType: base.type,
      bizNumber: bizNo(n + 1),
      bizCondition: base.cond,
      bizCategory: base.cat,
      agreedAt: u.createdAt,
      // 사업자등록증 파일은 실제 업로드가 있어야 하므로 비워 둔다 (모달에 "첨부 없음"으로 표시)
      adminMemo:
        n === 1 ? "세금계산서 매월 말일 발행 요청" : n === 3 ? "장기 계약 검토 중 (담당: 김대리)" : null,
    })
    .onConflictDoUpdate({
      target: memberProfiles.userId,
      set: {
        username,
        orgName,
        orgType: base.type,
        bizNumber: bizNo(n + 1),
        bizCondition: base.cond,
        bizCategory: base.cat,
        updatedAt: new Date(),
      },
    });
  n++;
}

console.log(`가입정보 샘플 ${n}건 반영 완료`);
process.exit(0);
