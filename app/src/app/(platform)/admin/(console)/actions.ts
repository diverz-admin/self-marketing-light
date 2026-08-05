"use server";

import { db } from "@/db";
import {
  users,
  campaigns,
  products,
  orders,
  credits,
  pointCharges,
  coupons,
  notices,
  boardPosts,
  rankKeywords,
  pricingRules,
  guaranteedCampaigns,
  campaignExtensions,
  reviewCampaigns,
  reviewTasks,
  serviceRequests,
  memberProfiles,
  adminCartItems,
  purchaseOrders,
} from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { createClient } from "@/utils/supabase/server";
import { BIZ_DOC_BUCKET } from "@/lib/storage";
import { parseAttachments, type Attachment } from "@/lib/attachments";
import { ADMIN_CART_PRODUCTS, ADMIN_CART_TIERS } from "@/lib/admin-cart";
import { REVIEW_TYPES_BY_CHANNEL, reviewProductDefaults, reviewPriceRowLabel } from "@/lib/admin-format";

type Result = { success: true } | { error: string };

const ok = (): Result => ({ success: true });
const fail = (e: unknown, fallback: string): Result => ({
  error: e instanceof Error ? e.message : fallback,
});

// ── 상태값 화이트리스트 ──
const ROLES = ["advertiser", "supplier", "admin"] as const;
const CAMPAIGN_STATUSES = [
  "draft", "submitted", "reviewing", "scheduled", "running", "paused", "completed", "canceled", "refunded",
] as const;
// 반려는 사용하지 않는다 — 입금이 확인되지 않은 건은 "취소"로 처리한다.
// (enum 값 자체는 과거 데이터 호환을 위해 DB에 남겨 둔다)
const POINT_CHARGE_STATUSES = ["requested", "approved", "canceled"] as const;
const GUARANTEED_STATUSES = ["requested", "reviewing", "setting", "running", "completed", "canceled"] as const;
const EXTENSION_STATUSES = ["requested", "approved", "rejected"] as const;
const REVIEW_CAMPAIGN_STATUSES = [
  "requested", "paid", "setting", "recruiting", "running", "completed", "canceled",
] as const;
const REVIEW_TASK_STATUSES = ["waiting", "assigned", "writing", "submitted", "approved", "rejected"] as const;
const SERVICE_REQUEST_STATUSES = [
  "requested", "reviewing", "quoted", "in_progress", "completed", "canceled",
] as const;
const BOARD_TYPES = ["free", "review", "commerce", "qna", "tip"] as const;
const BOARD_CHANNELS = ["shopping", "place", "coupang"] as const;
const COUPON_DISCOUNT_TYPES = ["amount", "percent"] as const;
const RANK_PLATFORMS = ["place", "shopping", "coupang"] as const;
/** 리뷰 건별 가격을 매기는 채널 — products.channel 값과 같다 */
const REVIEW_PRICE_CHANNELS = ["place", "shopping", "coupang"] as const;
const REVIEW_PLATFORMS = ["place", "naver_shopping", "coupang"] as const;
const REVIEW_TYPES = [
  "blog_distribute", "receipt", "visitor", "reservation",
  "blog_experience", "blog_reporter", "product_provided", "product_not_provided",
] as const;

function pick<T extends readonly string[]>(list: T, value: string): T[number] | null {
  return (list as readonly string[]).includes(value) ? (value as T[number]) : null;
}

/** 빈 문자열을 null로 (선택 입력 필드용) */
const orNull = (v: string | null | undefined) => (v && v.trim() ? v.trim() : null);
/** 숫자 문자열 정규화 ("1,000" → "1000") */
const num = (v: string | number | null | undefined, fallback = "0") => {
  if (v == null || v === "") return fallback;
  const n = Number(String(v).replace(/,/g, ""));
  return Number.isFinite(n) ? String(n) : fallback;
};
const int = (v: string | number | null | undefined, fallback: number | null = null) => {
  if (v == null || v === "") return fallback;
  const n = Number(String(v).replace(/,/g, ""));
  return Number.isFinite(n) ? Math.round(n) : fallback;
};

// ============================================================
// 기본 > 회원관리
// ============================================================

export async function setUserRole(userId: string, role: string): Promise<Result> {
  try {
    await requireAdmin();
    const next = pick(ROLES, role);
    if (!next) return { error: "잘못된 역할입니다." };
    await db.update(users).set({ role: next, updatedAt: new Date() }).where(eq(users.id, userId));
    revalidatePath("/admin/users");
    return ok();
  } catch (e) {
    return fail(e, "역할 변경 실패");
  }
}

export async function adjustCredit(userId: string, delta: number, reason: string): Promise<Result> {
  try {
    await requireAdmin();
    if (!Number.isFinite(delta) || delta === 0) return { error: "0이 아닌 금액을 입력하세요." };
    await db.transaction(async (tx) => {
      await tx.insert(credits).values({ userId, delta: String(delta), reason: reason || "관리자 조정" });
      await tx
        .update(users)
        .set({ creditBalance: sql`${users.creditBalance} + ${delta}`, updatedAt: new Date() })
        .where(eq(users.id, userId));
    });
    revalidatePath("/admin/users");
    revalidatePath("/admin/points");
    return ok();
  } catch (e) {
    return fail(e, "크레딧 조정 실패");
  }
}

// ── 회원 상세 (가입정보 / 사업자등록증 / 포인트·결제 내역 / 비고) ──

export type MemberDetail = {
  user: { id: string; name: string; email: string; role: string; creditBalance: number; createdAt: string };
  profile: {
    username: string | null;
    phone: string | null;
    orgName: string | null;
    orgType: string | null;
    bizNumber: string | null;
    bizCondition: string | null;
    bizCategory: string | null;
    agreedAt: string | null;
    adminMemo: string | null;
  } | null;
  bizDoc: { fileName: string | null; fileSize: number | null; uploadedAt: string | null; url: string | null } | null;
  charges: { id: string; amount: number; bonusAmount: number; method: string; status: string; memo: string | null; createdAt: string }[];
  payments: { id: string; amount: number; method: string | null; status: string; createdAt: string }[];
  ledger: { id: string; delta: number; reason: string | null; createdAt: string }[];
};

export async function getMemberDetail(userId: string): Promise<MemberDetail | { error: string }> {
  try {
    await requireAdmin();

    const [userRow] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!userRow) return { error: "회원을 찾을 수 없습니다." };

    const [profileRow] = await db
      .select()
      .from(memberProfiles)
      .where(eq(memberProfiles.userId, userId))
      .limit(1);

    const [chargeRows, paymentRows, ledgerRows] = await Promise.all([
      db.select().from(pointCharges).where(eq(pointCharges.userId, userId)).orderBy(desc(pointCharges.createdAt)).limit(50),
      db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt)).limit(50),
      db.select().from(credits).where(eq(credits.userId, userId)).orderBy(desc(credits.createdAt)).limit(50),
    ]);

    // 사업자등록증은 비공개 버킷 → 만료 있는 서명 URL로만 노출
    let bizDoc: MemberDetail["bizDoc"] = null;
    if (profileRow?.bizFilePath) {
      const supabase = await createClient();
      const { data } = await supabase.storage
        .from(BIZ_DOC_BUCKET)
        .createSignedUrl(profileRow.bizFilePath, 60 * 10);
      bizDoc = {
        fileName: profileRow.bizFileName,
        fileSize: profileRow.bizFileSize,
        uploadedAt: profileRow.bizFileUploadedAt?.toISOString() ?? null,
        url: data?.signedUrl ?? null,
      };
    }

    return {
      user: {
        id: userRow.id,
        name: userRow.name,
        email: userRow.email,
        role: userRow.role,
        creditBalance: Number(userRow.creditBalance),
        createdAt: userRow.createdAt.toISOString(),
      },
      profile: profileRow
        ? {
            username: profileRow.username,
            phone: profileRow.phone,
            orgName: profileRow.orgName,
            orgType: profileRow.orgType,
            bizNumber: profileRow.bizNumber,
            bizCondition: profileRow.bizCondition,
            bizCategory: profileRow.bizCategory,
            agreedAt: profileRow.agreedAt?.toISOString() ?? null,
            adminMemo: profileRow.adminMemo,
          }
        : null,
      bizDoc,
      charges: chargeRows.map((c) => ({
        id: c.id,
        amount: Number(c.amount),
        bonusAmount: Number(c.bonusAmount),
        method: c.method,
        status: c.status,
        memo: c.memo,
        createdAt: c.createdAt.toISOString(),
      })),
      payments: paymentRows.map((o) => ({
        id: o.id,
        amount: Number(o.amount),
        method: o.method,
        status: o.status,
        createdAt: o.createdAt.toISOString(),
      })),
      ledger: ledgerRows.map((l) => ({
        id: l.id,
        delta: Number(l.delta),
        reason: l.reason,
        createdAt: l.createdAt.toISOString(),
      })),
    };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "회원 상세 조회 실패" };
  }
}

/** 관리자 비고사항 저장 (프로필 행이 없으면 만들어서 저장) */
export async function updateMemberMemo(userId: string, memo: string): Promise<Result> {
  try {
    await requireAdmin();
    await db
      .insert(memberProfiles)
      .values({ userId, adminMemo: orNull(memo) })
      .onConflictDoUpdate({
        target: memberProfiles.userId,
        set: { adminMemo: orNull(memo), updatedAt: new Date() },
      });
    revalidatePath("/admin/users");
    return ok();
  } catch (e) {
    return fail(e, "비고 저장 실패");
  }
}

// ============================================================
// 기본 > 포인트충전
// ============================================================

export type PointChargeInput = {
  userId: string;
  amount: string;
  bonusAmount?: string;
  method: string;
  depositorName?: string;
  receiptType?: string;
  memo?: string;
};

/** 관리자 수기 충전 신청 등록 */
export async function createPointCharge(input: PointChargeInput): Promise<Result> {
  try {
    await requireAdmin();
    if (!input.userId) return { error: "회원을 선택하세요." };
    if (Number(num(input.amount)) <= 0) return { error: "충전 금액을 입력하세요." };
    await db.insert(pointCharges).values({
      userId: input.userId,
      amount: num(input.amount),
      bonusAmount: num(input.bonusAmount),
      method: input.method || "bank_transfer",
      depositorName: orNull(input.depositorName),
      receiptType: orNull(input.receiptType),
      memo: orNull(input.memo),
    });
    revalidatePath("/admin/points");
    return ok();
  } catch (e) {
    return fail(e, "충전 신청 등록 실패");
  }
}

/**
 * 충전 상태 변경.
 * requested → approved 로 넘어갈 때만 실제 포인트(크레딧)를 지급한다.
 * 이미 approved인 건을 다시 승인해도 중복 지급되지 않는다.
 */
export async function setPointChargeStatus(
  chargeId: string,
  status: string,
  memo?: string,
): Promise<Result> {
  try {
    const admin = await requireAdmin();
    const next = pick(POINT_CHARGE_STATUSES, status);
    if (!next) return { error: "잘못된 상태입니다." };

    await db.transaction(async (tx) => {
      const rows = await tx.select().from(pointCharges).where(eq(pointCharges.id, chargeId)).limit(1);
      const charge = rows[0];
      if (!charge) throw new Error("충전 내역을 찾을 수 없습니다.");
      if (charge.status === next) return;

      const wasApproved = charge.status === "approved";
      const willApprove = next === "approved";

      // 승인 전환 → 지급 / 승인 취소 전환 → 회수
      if (willApprove && !wasApproved) {
        const total = Number(charge.amount) + Number(charge.bonusAmount);
        await tx.insert(credits).values({
          userId: charge.userId,
          delta: String(total),
          reason: "포인트 충전 승인",
          refId: charge.id,
        });
        await tx
          .update(users)
          .set({ creditBalance: sql`${users.creditBalance} + ${total}`, updatedAt: new Date() })
          .where(eq(users.id, charge.userId));
      } else if (wasApproved && !willApprove) {
        const total = Number(charge.amount) + Number(charge.bonusAmount);
        await tx.insert(credits).values({
          userId: charge.userId,
          delta: String(-total),
          reason: "포인트 충전 승인 취소",
          refId: charge.id,
        });
        await tx
          .update(users)
          .set({ creditBalance: sql`${users.creditBalance} - ${total}`, updatedAt: new Date() })
          .where(eq(users.id, charge.userId));
      }

      await tx
        .update(pointCharges)
        .set({
          status: next,
          memo: memo != null ? orNull(memo) : charge.memo,
          processedBy: admin.id,
          processedAt: new Date(),
        })
        .where(eq(pointCharges.id, chargeId));
    });

    revalidatePath("/admin/points");
    revalidatePath("/admin/users");
    revalidatePath("/admin");
    return ok();
  } catch (e) {
    return fail(e, "충전 상태 변경 실패");
  }
}

// ============================================================
// 기본 > 쿠폰
// ============================================================

export type CouponInput = {
  id?: string;
  code: string;
  name: string;
  description?: string;
  discountType: string;
  discountValue: string;
  minOrderAmount?: string;
  maxDiscountAmount?: string;
  totalQuota?: string;
  startsAt?: string;
  endsAt?: string;
  isActive?: boolean;
};

export async function upsertCoupon(input: CouponInput): Promise<Result> {
  try {
    await requireAdmin();
    const type = pick(COUPON_DISCOUNT_TYPES, input.discountType);
    if (!type) return { error: "잘못된 할인 유형입니다." };
    if (!input.code.trim()) return { error: "쿠폰 코드를 입력하세요." };
    if (!input.name.trim()) return { error: "쿠폰명을 입력하세요." };
    const value = Number(num(input.discountValue));
    if (value <= 0) return { error: "쿠폰 금액을 입력하세요." };
    if (type === "percent" && value > 100) return { error: "정률 할인은 100%를 넘을 수 없습니다." };

    const values = {
      code: input.code.trim().toUpperCase(),
      name: input.name.trim(),
      description: orNull(input.description),
      discountType: type,
      discountValue: String(value),
      minOrderAmount: num(input.minOrderAmount),
      maxDiscountAmount: input.maxDiscountAmount ? num(input.maxDiscountAmount) : null,
      totalQuota: int(input.totalQuota),
      startsAt: input.startsAt ? new Date(input.startsAt) : null,
      endsAt: input.endsAt ? new Date(input.endsAt) : null,
      isActive: input.isActive ?? true,
      updatedAt: new Date(),
    };

    if (input.id) {
      await db.update(coupons).set(values).where(eq(coupons.id, input.id));
    } else {
      await db.insert(coupons).values(values);
    }
    revalidatePath("/admin/coupons");
    return ok();
  } catch (e) {
    return fail(e, "쿠폰 저장 실패");
  }
}

export async function toggleCouponActive(couponId: string, isActive: boolean): Promise<Result> {
  try {
    await requireAdmin();
    await db.update(coupons).set({ isActive, updatedAt: new Date() }).where(eq(coupons.id, couponId));
    revalidatePath("/admin/coupons");
    return ok();
  } catch (e) {
    return fail(e, "쿠폰 상태 변경 실패");
  }
}

export async function deleteCoupon(couponId: string): Promise<Result> {
  try {
    await requireAdmin();
    await db.delete(coupons).where(eq(coupons.id, couponId));
    revalidatePath("/admin/coupons");
    return ok();
  } catch (e) {
    return fail(e, "쿠폰 삭제 실패");
  }
}

// ============================================================
// 기본 > 공지사항
// ============================================================

export type NoticeInput = {
  id?: string;
  title: string;
  content: string;
  category: string;
  isPinned?: boolean;
  isPublished?: boolean;
  attachments?: Attachment[];
};

export async function upsertNotice(input: NoticeInput): Promise<Result> {
  try {
    const admin = await requireAdmin();
    if (!input.title.trim()) return { error: "제목을 입력하세요." };
    if (!input.content.trim()) return { error: "내용을 입력하세요." };

    const isPublished = input.isPublished ?? true;
    const values = {
      title: input.title.trim(),
      content: input.content.trim(),
      category: input.category || "service",
      isPinned: input.isPinned ?? false,
      isPublished,
      attachments: parseAttachments(input.attachments),
      updatedAt: new Date(),
    };

    if (input.id) {
      await db.update(notices).set(values).where(eq(notices.id, input.id));
    } else {
      await db.insert(notices).values({
        ...values,
        authorId: admin.id,
        publishedAt: isPublished ? new Date() : null,
      });
    }
    revalidatePath("/admin/notices");
    return ok();
  } catch (e) {
    return fail(e, "공지 저장 실패");
  }
}

export async function toggleNoticePublished(noticeId: string, isPublished: boolean): Promise<Result> {
  try {
    await requireAdmin();
    await db
      .update(notices)
      .set({ isPublished, publishedAt: isPublished ? new Date() : null, updatedAt: new Date() })
      .where(eq(notices.id, noticeId));
    revalidatePath("/admin/notices");
    return ok();
  } catch (e) {
    return fail(e, "공지 상태 변경 실패");
  }
}

export async function toggleNoticePinned(noticeId: string, isPinned: boolean): Promise<Result> {
  try {
    await requireAdmin();
    await db.update(notices).set({ isPinned, updatedAt: new Date() }).where(eq(notices.id, noticeId));
    revalidatePath("/admin/notices");
    return ok();
  } catch (e) {
    return fail(e, "고정 설정 실패");
  }
}

export async function deleteNotice(noticeId: string): Promise<Result> {
  try {
    await requireAdmin();
    await db.delete(notices).where(eq(notices.id, noticeId));
    revalidatePath("/admin/notices");
    return ok();
  } catch (e) {
    return fail(e, "공지 삭제 실패");
  }
}

// ============================================================
// 기본 > 게시판
// ============================================================

export type BoardPostInput = {
  id?: string;
  boardType: string;
  channel?: string;
  title: string;
  content: string;
  authorName?: string;
  isPinned?: boolean;
  isPublished?: boolean;
  attachments?: Attachment[];
};

export async function upsertBoardPost(input: BoardPostInput): Promise<Result> {
  try {
    const admin = await requireAdmin();
    const type = pick(BOARD_TYPES, input.boardType);
    if (!type) return { error: "잘못된 게시판 종류입니다." };
    if (!input.title.trim()) return { error: "제목을 입력하세요." };
    if (!input.content.trim()) return { error: "내용을 입력하세요." };

    const values = {
      boardType: type,
      // 빈 값이면 채널 구분 없는 글 → 사용자 화면 전 탭에 노출
      channel: input.channel ? pick(BOARD_CHANNELS, input.channel) : null,
      title: input.title.trim(),
      content: input.content.trim(),
      authorName: orNull(input.authorName) ?? admin.name,
      isPinned: input.isPinned ?? false,
      isPublished: input.isPublished ?? true,
      attachments: parseAttachments(input.attachments),
      updatedAt: new Date(),
    };

    if (input.id) {
      await db.update(boardPosts).set(values).where(eq(boardPosts.id, input.id));
    } else {
      await db.insert(boardPosts).values({ ...values, authorId: admin.id });
    }
    revalidatePath("/admin/board");
    return ok();
  } catch (e) {
    return fail(e, "게시글 저장 실패");
  }
}

export async function toggleBoardBlinded(postId: string, isBlinded: boolean): Promise<Result> {
  try {
    await requireAdmin();
    await db.update(boardPosts).set({ isBlinded, updatedAt: new Date() }).where(eq(boardPosts.id, postId));
    revalidatePath("/admin/board");
    return ok();
  } catch (e) {
    return fail(e, "블라인드 처리 실패");
  }
}

export async function toggleBoardPinned(postId: string, isPinned: boolean): Promise<Result> {
  try {
    await requireAdmin();
    await db.update(boardPosts).set({ isPinned, updatedAt: new Date() }).where(eq(boardPosts.id, postId));
    revalidatePath("/admin/board");
    return ok();
  } catch (e) {
    return fail(e, "고정 설정 실패");
  }
}

export async function deleteBoardPost(postId: string): Promise<Result> {
  try {
    await requireAdmin();
    await db.delete(boardPosts).where(eq(boardPosts.id, postId));
    revalidatePath("/admin/board");
    return ok();
  } catch (e) {
    return fail(e, "게시글 삭제 실패");
  }
}

// ============================================================
// 통합순위관리
// ============================================================

export type RankKeywordInput = {
  id?: string;
  userId: string;
  platform: string;
  keyword: string;
  targetName?: string;
  targetUrl?: string;
  isPaid?: boolean;
  monthlyFee?: string;
};

export async function upsertRankKeyword(input: RankKeywordInput): Promise<Result> {
  try {
    await requireAdmin();
    const platform = pick(RANK_PLATFORMS, input.platform);
    if (!platform) return { error: "잘못된 플랫폼입니다." };
    if (!input.userId) return { error: "회원을 선택하세요." };
    if (!input.keyword.trim()) return { error: "키워드를 입력하세요." };

    const values = {
      userId: input.userId,
      platform,
      keyword: input.keyword.trim(),
      targetName: orNull(input.targetName),
      targetUrl: orNull(input.targetUrl),
      isPaid: input.isPaid ?? false,
      monthlyFee: num(input.monthlyFee),
    };

    if (input.id) {
      await db.update(rankKeywords).set(values).where(eq(rankKeywords.id, input.id));
    } else {
      await db.insert(rankKeywords).values(values);
    }
    revalidatePath("/admin/rank");
    return ok();
  } catch (e) {
    return fail(e, "키워드 저장 실패");
  }
}

/** 유료 전환 + 월 과금액 설정 (키워드 1개 무료 / 2개 이상 유료) */
export async function setKeywordBilling(
  keywordId: string,
  isPaid: boolean,
  monthlyFee: string,
): Promise<Result> {
  try {
    await requireAdmin();
    await db
      .update(rankKeywords)
      .set({ isPaid, monthlyFee: isPaid ? num(monthlyFee) : "0" })
      .where(eq(rankKeywords.id, keywordId));
    revalidatePath("/admin/rank");
    return ok();
  } catch (e) {
    return fail(e, "과금 설정 실패");
  }
}

export async function updateKeywordRank(keywordId: string, currentRank: string): Promise<Result> {
  try {
    await requireAdmin();
    const rank = int(currentRank);
    const rows = await db.select().from(rankKeywords).where(eq(rankKeywords.id, keywordId)).limit(1);
    if (!rows[0]) return { error: "키워드를 찾을 수 없습니다." };
    await db
      .update(rankKeywords)
      .set({ currentRank: rank, previousRank: rows[0].currentRank, lastCheckedAt: new Date() })
      .where(eq(rankKeywords.id, keywordId));
    revalidatePath("/admin/rank");
    return ok();
  } catch (e) {
    return fail(e, "순위 갱신 실패");
  }
}

export async function toggleKeywordActive(keywordId: string, isActive: boolean): Promise<Result> {
  try {
    await requireAdmin();
    await db.update(rankKeywords).set({ isActive }).where(eq(rankKeywords.id, keywordId));
    revalidatePath("/admin/rank");
    return ok();
  } catch (e) {
    return fail(e, "키워드 상태 변경 실패");
  }
}

export async function deleteRankKeyword(keywordId: string): Promise<Result> {
  try {
    await requireAdmin();
    await db.delete(rankKeywords).where(eq(rankKeywords.id, keywordId));
    revalidatePath("/admin/rank");
    return ok();
  } catch (e) {
    return fail(e, "키워드 삭제 실패");
  }
}

// ============================================================
// 금액 설정 (pricing_rules) — 기획서 "금액 설정 필요" 공통
// ============================================================

export type PricingRuleInput = {
  id?: string;
  category: string;
  key: string;
  label: string;
  unitPrice: string;
  unit?: string;
  options?: Record<string, unknown>;
  sortOrder?: number;
  isActive?: boolean;
};

export async function upsertPricingRule(input: PricingRuleInput): Promise<Result> {
  try {
    await requireAdmin();
    if (!input.category.trim()) return { error: "카테고리를 선택하세요." };
    if (!input.key.trim()) return { error: "항목 키를 입력하세요." };
    if (!input.label.trim()) return { error: "항목명을 입력하세요." };

    const values = {
      category: input.category.trim(),
      key: input.key.trim(),
      label: input.label.trim(),
      unitPrice: num(input.unitPrice),
      unit: input.unit || "건",
      options: input.options ?? {},
      sortOrder: input.sortOrder ?? 0,
      isActive: input.isActive ?? true,
      updatedAt: new Date(),
    };

    if (input.id) {
      await db.update(pricingRules).set(values).where(eq(pricingRules.id, input.id));
    } else {
      await db.insert(pricingRules).values(values);
    }
    revalidatePath("/admin/rank");
    revalidatePath("/admin/review/place");
    revalidatePath("/admin/review/shopping");
    revalidatePath("/admin/reward/guaranteed");
    return ok();
  } catch (e) {
    return fail(e, "금액 설정 저장 실패");
  }
}

export async function deletePricingRule(ruleId: string): Promise<Result> {
  try {
    await requireAdmin();
    await db.delete(pricingRules).where(eq(pricingRules.id, ruleId));
    revalidatePath("/admin/rank");
    revalidatePath("/admin/review/place");
    revalidatePath("/admin/review/shopping");
    revalidatePath("/admin/reward/guaranteed");
    return ok();
  } catch (e) {
    return fail(e, "금액 설정 삭제 실패");
  }
}

// ============================================================
// 리워드마케팅 > 상품등록
// ============================================================

export type ProductInput = {
  id?: string;
  category?: string;
  productType: string;
  title: string;
  description?: string;
  unit: string;
  unitPrice: string;
  /** 매입 원가 (선택) — 마진 계산용 */
  costPrice?: string;
  minQty?: string;
  maxQty?: string;
  estDurationDays?: string;
  channel?: string;
  efficiency?: string;
  avgRankUpRate?: string;
  subscriptionInfo?: string;
  // 사용자 상품 카드 표시값
  tier?: string;
  subtitle?: string;
  thumbnailUrl?: string | null;
  thumbnailPath?: string | null;
  badgeInitial?: string;
  badgeColor?: string;
  isSale?: boolean;
  isRecommended?: boolean;
  rankUpUserRate?: string;
  rankBefore?: string;
  rankAfter?: string;
  orderCutoffTime?: string;
  sameDayStart?: boolean;
  minRunDays?: string;
  // 리뷰/체험단 상품 전용
  reviewType?: string;
  reviewChars?: string;
  reviewImages?: string;
  blogGrade?: string;
  deliveryTiming?: string;
  originalPrice?: string;
  saleTag?: string;
  isActive?: boolean;
};

const PRODUCT_TYPES = [
  "place_traffic", "store_traffic", "store_action", "blog_review", "visit_review",
  "community_viral", "pr_media", "influencer", "rank_tracking",
] as const;
const PRODUCT_UNITS = ["per_visit_day", "per_item", "subscription"] as const;
const PRODUCT_CATEGORIES = [
  "reward_place", "reward_shopping", "reward_coupang",
  "place_blog_distribute", "place_receipt",
  "shopping_product_provided", "shopping_product_not_provided",
] as const;
// 리뷰 유형은 리뷰 캠페인과 같은 화이트리스트(REVIEW_TYPES)를 쓴다
const DELIVERY_TIMINGS = ["same_day", "next_day"] as const;

export async function upsertProduct(input: ProductInput): Promise<Result> {
  try {
    await requireAdmin();
    const type = pick(PRODUCT_TYPES, input.productType);
    const unit = pick(PRODUCT_UNITS, input.unit);
    if (!type) return { error: "잘못된 상품 유형입니다." };
    if (!unit) return { error: "잘못된 판매 단위입니다." };
    if (!input.title.trim()) return { error: "상품명을 입력하세요." };
    if (Number(num(input.unitPrice)) <= 0) return { error: "금액을 입력하세요." };

    const values = {
      // 미지정이면 "미분류"로 남겨 목록에서 누락되지 않게 한다
      category: input.category ? pick(PRODUCT_CATEGORIES, input.category) : null,
      productType: type,
      title: input.title.trim(),
      description: orNull(input.description),
      unit,
      unitPrice: num(input.unitPrice),
      costPrice: input.costPrice ? num(input.costPrice) : null,
      minQty: int(input.minQty, 1) ?? 1,
      maxQty: int(input.maxQty),
      estDurationDays: int(input.estDurationDays),
      channel: orNull(input.channel),
      efficiency: input.efficiency ? num(input.efficiency) : null,
      avgRankUpRate: input.avgRankUpRate ? num(input.avgRankUpRate) : null,
      subscriptionInfo: orNull(input.subscriptionInfo),
      tier: orNull(input.tier),
      subtitle: orNull(input.subtitle),
      thumbnailUrl: orNull(input.thumbnailUrl),
      thumbnailPath: orNull(input.thumbnailPath),
      // 썸네일이 없을 때만 쓰이는 대체 표시
      badgeInitial: orNull(input.badgeInitial)?.slice(0, 1) ?? null,
      badgeColor: orNull(input.badgeColor),
      isSale: input.isSale ?? false,
      isRecommended: input.isRecommended ?? false,
      rankUpUserRate: input.rankUpUserRate ? num(input.rankUpUserRate) : null,
      rankBefore: int(input.rankBefore),
      rankAfter: int(input.rankAfter),
      orderCutoffTime: orNull(input.orderCutoffTime),
      sameDayStart: input.sameDayStart ?? false,
      minRunDays: int(input.minRunDays),
      reviewType: pick(REVIEW_TYPES, input.reviewType ?? "") ?? null,
      reviewChars: int(input.reviewChars),
      reviewImages: int(input.reviewImages),
      blogGrade: orNull(input.blogGrade),
      deliveryTiming: pick(DELIVERY_TIMINGS, input.deliveryTiming ?? "") ?? null,
      originalPrice: input.originalPrice ? num(input.originalPrice) : null,
      saleTag: orNull(input.saleTag),
      isActive: input.isActive ?? true,
      updatedAt: new Date(),
    };

    if (input.id) {
      await db.update(products).set(values).where(eq(products.id, input.id));
    } else {
      await db.insert(products).values({ ...values, formSchema: {} });
    }
    revalidatePath("/admin/reward/products");
    revalidatePath("/admin/review/products");
    return ok();
  } catch (e) {
    return fail(e, "상품 저장 실패");
  }
}

export async function toggleProductActive(productId: string, isActive: boolean): Promise<Result> {
  try {
    await requireAdmin();
    await db.update(products).set({ isActive, updatedAt: new Date() }).where(eq(products.id, productId));
    revalidatePath("/admin/reward/products");
    revalidatePath("/admin/review/products");
    return ok();
  } catch (e) {
    return fail(e, "상품 상태 변경 실패");
  }
}

export async function deleteProduct(productId: string): Promise<Result> {
  try {
    await requireAdmin();
    await db.delete(products).where(eq(products.id, productId));
    revalidatePath("/admin/reward/products");
    revalidatePath("/admin/review/products");
    return ok();
  } catch (e) {
    return fail(e, "상품 삭제 실패 (연결된 캠페인이 있으면 삭제할 수 없습니다)");
  }
}

export type ReviewPriceInput = {
  /** 이미 있는 상품이면 그 상품을 갱신하고, 없으면 새로 만든다 */
  productId?: string;
  channel: string;
  reviewType: string;
  unitPrice: string;
  /** 매입 원가 (선택) */
  costPrice?: string;
  isActive: boolean;
};

/**
 * 리뷰 상품등록 — 채널 + 리뷰 유형별 "건별 가격" 한 줄을 저장한다.
 * 리뷰는 원고 조건이 유형으로 이미 정해져 있어 상품마다 다룰 값이 가격뿐이다.
 * 고객 신청 화면은 channel + reviewType 으로 상품을 찾으므로 저장할 때 두 값을 반드시 채운다.
 */
export async function saveReviewPrice(input: ReviewPriceInput): Promise<Result> {
  try {
    await requireAdmin();
    const channel = pick(REVIEW_PRICE_CHANNELS, input.channel);
    if (!channel) return { error: "잘못된 플랫폼입니다." };
    const allowed = REVIEW_TYPES_BY_CHANNEL[channel] ?? [];
    if (!allowed.includes(input.reviewType)) return { error: "해당 플랫폼에 없는 리뷰 유형입니다." };
    const reviewType = pick(REVIEW_TYPES, input.reviewType);
    if (!reviewType) return { error: "잘못된 리뷰 유형입니다." };

    const price = Number(num(input.unitPrice));
    if (!Number.isFinite(price) || price < 0) return { error: "건별 가격을 확인해주세요." };

    const defaults = reviewProductDefaults(channel, reviewType);
    const category = pick(PRODUCT_CATEGORIES, defaults.category);
    const productType = pick(PRODUCT_TYPES, defaults.productType) ?? "blog_review";

    if (input.productId) {
      await db
        .update(products)
        .set({
          // 기존 상품에 채널·유형이 비어 있으면 여기서 채워 고객 화면과 연결한다
          channel,
          reviewType,
          category,
          unitPrice: String(price),
          costPrice: input.costPrice ? num(input.costPrice) : null,
          isActive: input.isActive,
          updatedAt: new Date(),
        })
        .where(eq(products.id, input.productId));
    } else {
      await db.insert(products).values({
        productType,
        category,
        channel,
        reviewType,
        title: reviewPriceRowLabel(channel, reviewType),
        unit: "per_item",
        unitPrice: String(price),
        costPrice: input.costPrice ? num(input.costPrice) : null,
        isActive: input.isActive,
      });
    }

    revalidatePath("/admin/review/products");
    // 고객 신청 화면은 이 가격을 그대로 보여준다
    revalidatePath("/marketing/review/place/blog-reporter");
    revalidatePath("/marketing/review/place/receipt");
    revalidatePath("/marketing/review/shopping/product-experience");
    return ok();
  } catch (e) {
    return fail(e, "건별 가격 저장 실패");
  }
}

// ============================================================
// 리워드마케팅 > 캠페인
// ============================================================

export async function setCampaignStatus(campaignId: string, status: string): Promise<Result> {
  try {
    const admin = await requireAdmin();
    const next = pick(CAMPAIGN_STATUSES, status);
    if (!next) return { error: "잘못된 상태입니다." };
    await db
      .update(campaigns)
      // 단계를 넘긴 관리자가 담당자로 남는다
      .set({ status: next, assignedAdminId: admin.id, updatedAt: new Date() })
      .where(eq(campaigns.id, campaignId));
    revalidatePath("/admin/reward/campaigns/place");
    revalidatePath("/admin/reward/campaigns/shopping");
    revalidatePath("/admin");
    return ok();
  } catch (e) {
    return fail(e, "상태 변경 실패");
  }
}

/** 고객 캠페인 등록 건 셋팅 (기간/수량 확정) */
export async function updateCampaignSetting(
  campaignId: string,
  input: { dailyQty?: string; totalQty?: string; startDate?: string; endDate?: string },
): Promise<Result> {
  try {
    // 셋팅한 관리자가 곧 담당자다 — 별도로 지정하지 않는다
    const admin = await requireAdmin();
    await db
      .update(campaigns)
      .set({
        dailyQty: int(input.dailyQty),
        totalQty: int(input.totalQty, 0) ?? 0,
        startDate: orNull(input.startDate),
        endDate: orNull(input.endDate),
        assignedAdminId: admin.id,
        updatedAt: new Date(),
      })
      .where(eq(campaigns.id, campaignId));
    revalidatePath("/admin/reward/campaigns/place");
    revalidatePath("/admin/reward/campaigns/shopping");
    return ok();
  } catch (e) {
    return fail(e, "캠페인 셋팅 실패");
  }
}

// ============================================================
// 리워드마케팅 > 보장형 캠페인
// ============================================================

export async function setGuaranteedStatus(id: string, status: string): Promise<Result> {
  try {
    const admin = await requireAdmin();
    const next = pick(GUARANTEED_STATUSES, status);
    if (!next) return { error: "잘못된 상태입니다." };
    await db
      .update(guaranteedCampaigns)
      .set({ status: next, assignedAdminId: admin.id, updatedAt: new Date() })
      .where(eq(guaranteedCampaigns.id, id));
    revalidatePath("/admin/reward/guaranteed");
    return ok();
  } catch (e) {
    return fail(e, "상태 변경 실패");
  }
}

export type GuaranteedCampaignInput = {
  /** 없으면 신규 등록 */
  id?: string;
  /** 신규 등록에서만 쓴다 — 캠페인을 붙일 광고주 */
  userId?: string;
  platform?: string;
  /** 고객 화면의 "플레이스명" */
  targetName?: string;
  /** 고객 화면의 "플레이스 링크" */
  targetUrl?: string;
  keyword?: string;
  /** 상품 종류 (버즈빌·골든 등) — setting 에 담는다 */
  product?: string;
  /** 일 작업량 — setting 에 담는다 */
  dailyQty?: string;
  targetRank?: string;
  guaranteedDays?: string;
  achievedDays?: string;
  currentRank?: string;
  startDate?: string;
  endDate?: string;
  amount?: string;
  memo?: string;
};

/**
 * 보장형 캠페인 등록·셋팅 저장.
 * 보장형은 고객이 직접 셋팅하지 않고 관리자가 만들어 주므로 신규 등록도 여기서 처리한다.
 * 저장 값은 고객 화면(/marketing/reward/place/guaranteed/manage)의 항목과 1:1로 맞춘다.
 */
export async function upsertGuaranteedCampaign(input: GuaranteedCampaignInput): Promise<Result> {
  try {
    // 셋팅한 관리자가 곧 담당자다
    const admin = await requireAdmin();
    const platform = pick(RANK_PLATFORMS, input.platform ?? "place");
    if (!platform) return { error: "잘못된 플랫폼입니다." };

    const targetName = (input.targetName ?? "").trim();
    const keyword = (input.keyword ?? "").trim();
    if (!targetName) return { error: "업체명을 입력하세요." };
    if (!keyword) return { error: "키워드를 입력하세요." };

    const values = {
      platform,
      targetName,
      targetUrl: orNull(input.targetUrl),
      keyword,
      targetRank: int(input.targetRank, 1) ?? 1,
      guaranteedDays: int(input.guaranteedDays, 30) ?? 30,
      achievedDays: int(input.achievedDays, 0) ?? 0,
      currentRank: int(input.currentRank),
      startDate: orNull(input.startDate),
      endDate: orNull(input.endDate),
      amount: num(input.amount),
      // 스키마에 컬럼이 없는 셋팅 값(상품 종류·일 작업량)은 setting 에 담는다
      setting: {
        product: (input.product ?? "").trim(),
        dailyQty: int(input.dailyQty, 0) ?? 0,
      },
      memo: orNull(input.memo),
      assignedAdminId: admin.id,
      updatedAt: new Date(),
    };

    if (input.id) {
      await db.update(guaranteedCampaigns).set(values).where(eq(guaranteedCampaigns.id, input.id));
    } else {
      if (!input.userId) return { error: "회원을 선택하세요." };
      // 관리자가 만든 캠페인은 셋팅이 끝난 상태로 시작한다
      await db.insert(guaranteedCampaigns).values({ ...values, userId: input.userId, status: "setting" });
    }
    revalidatePath("/admin/reward/guaranteed");
    return ok();
  } catch (e) {
    return fail(e, "보장형 캠페인 저장 실패");
  }
}

export async function deleteGuaranteedCampaign(id: string): Promise<Result> {
  try {
    await requireAdmin();
    await db.delete(guaranteedCampaigns).where(eq(guaranteedCampaigns.id, id));
    revalidatePath("/admin/reward/guaranteed");
    return ok();
  } catch (e) {
    return fail(e, "보장형 캠페인 삭제 실패");
  }
}

// ============================================================
// 연장 신청 (리워드 / 보장형 / 리뷰 공통)
// ============================================================

/**
 * 연장 신청 처리.
 * 승인 시 대상 캠페인의 종료일/수량을 실제로 연장한다.
 */
export async function setExtensionStatus(extensionId: string, status: string): Promise<Result> {
  try {
    await requireAdmin();
    const next = pick(EXTENSION_STATUSES, status);
    if (!next) return { error: "잘못된 상태입니다." };

    await db.transaction(async (tx) => {
      const rows = await tx
        .select()
        .from(campaignExtensions)
        .where(eq(campaignExtensions.id, extensionId))
        .limit(1);
      const ext = rows[0];
      if (!ext) throw new Error("연장 신청을 찾을 수 없습니다.");
      if (ext.status === next) return;

      // 대기 → 승인 으로 넘어갈 때만 실제 연장 반영 (중복 방지)
      if (next === "approved" && ext.status !== "approved") {
        const days = ext.addDays;
        const qty = ext.addQty;
        if (ext.targetType === "campaign") {
          await tx
            .update(campaigns)
            .set({
              endDate: sql`COALESCE(${campaigns.endDate}, CURRENT_DATE) + ${days}`,
              totalQty: sql`${campaigns.totalQty} + ${qty}`,
              updatedAt: new Date(),
            })
            .where(eq(campaigns.id, ext.targetId));
        } else if (ext.targetType === "guaranteed") {
          await tx
            .update(guaranteedCampaigns)
            .set({
              endDate: sql`COALESCE(${guaranteedCampaigns.endDate}, CURRENT_DATE) + ${days}`,
              guaranteedDays: sql`${guaranteedCampaigns.guaranteedDays} + ${days}`,
              updatedAt: new Date(),
            })
            .where(eq(guaranteedCampaigns.id, ext.targetId));
        } else {
          await tx
            .update(reviewCampaigns)
            .set({
              endDate: sql`COALESCE(${reviewCampaigns.endDate}, CURRENT_DATE) + ${days}`,
              totalQty: sql`${reviewCampaigns.totalQty} + ${qty}`,
              updatedAt: new Date(),
            })
            .where(eq(reviewCampaigns.id, ext.targetId));
        }
      }

      await tx
        .update(campaignExtensions)
        .set({ status: next, processedAt: new Date() })
        .where(eq(campaignExtensions.id, extensionId));
    });

    revalidatePath("/admin/reward/campaigns");
    revalidatePath("/admin/reward/guaranteed");
    revalidatePath("/admin/review/place");
    revalidatePath("/admin/review/shopping");
    return ok();
  } catch (e) {
    return fail(e, "연장 처리 실패");
  }
}

// ============================================================
// 리뷰/체험단
// ============================================================

export async function setReviewCampaignStatus(id: string, status: string): Promise<Result> {
  try {
    // 단계를 넘긴 관리자가 담당자로 남는다
    const admin = await requireAdmin();
    const next = pick(REVIEW_CAMPAIGN_STATUSES, status);
    if (!next) return { error: "잘못된 상태입니다." };
    await db
      .update(reviewCampaigns)
      .set({ status: next, assignedAdminId: admin.id, updatedAt: new Date() })
      .where(eq(reviewCampaigns.id, id));
    revalidatePath("/admin/review/place");
    revalidatePath("/admin/review/shopping");
    return ok();
  } catch (e) {
    return fail(e, "상태 변경 실패");
  }
}

export type ReviewCampaignInput = {
  id?: string;
  userId?: string;
  platform: string;
  reviewType: string;
  storeName: string;
  targetUrl?: string;
  keyword?: string;
  totalQty?: string;
  unitPrice?: string;
  startDate?: string;
  endDate?: string;
  requestNote?: string;
  adminMemo?: string;
  guide?: string;
  mission?: string;
  provideDetail?: string;
};

/** 리뷰 캠페인 셋팅 저장 (결제 후 실제 셋팅해주는 페이지) */
export async function upsertReviewCampaign(input: ReviewCampaignInput): Promise<Result> {
  try {
    // 셋팅한 관리자가 곧 담당자다
    const admin = await requireAdmin();
    const platform = pick(REVIEW_PLATFORMS, input.platform);
    const type = pick(REVIEW_TYPES, input.reviewType);
    if (!platform) return { error: "잘못된 플랫폼입니다." };
    if (!type) return { error: "잘못된 리뷰 유형입니다." };
    if (!input.storeName.trim()) return { error: "업체명/상품명을 입력하세요." };

    const qty = int(input.totalQty, 0) ?? 0;
    const unitPrice = Number(num(input.unitPrice));

    const values = {
      platform,
      reviewType: type,
      storeName: input.storeName.trim(),
      targetUrl: orNull(input.targetUrl),
      keyword: orNull(input.keyword),
      totalQty: qty,
      unitPrice: String(unitPrice),
      totalAmount: String(unitPrice * qty),
      startDate: orNull(input.startDate),
      endDate: orNull(input.endDate),
      requestNote: orNull(input.requestNote),
      adminMemo: orNull(input.adminMemo),
      setting: {
        guide: input.guide ?? "",
        mission: input.mission ?? "",
        provideDetail: input.provideDetail ?? "",
      },
      assignedAdminId: admin.id,
      updatedAt: new Date(),
    };

    if (input.id) {
      await db.update(reviewCampaigns).set(values).where(eq(reviewCampaigns.id, input.id));
    } else {
      if (!input.userId) return { error: "회원을 선택하세요." };
      await db.insert(reviewCampaigns).values({ ...values, userId: input.userId });
    }
    revalidatePath("/admin/review/place");
    revalidatePath("/admin/review/shopping");
    return ok();
  } catch (e) {
    return fail(e, "리뷰 캠페인 저장 실패");
  }
}

export async function deleteReviewCampaign(id: string): Promise<Result> {
  try {
    await requireAdmin();
    await db.delete(reviewCampaigns).where(eq(reviewCampaigns.id, id));
    revalidatePath("/admin/review/place");
    revalidatePath("/admin/review/shopping");
    return ok();
  } catch (e) {
    return fail(e, "리뷰 캠페인 삭제 실패");
  }
}

export type ReviewTaskInput = {
  id?: string;
  reviewCampaignId: string;
  reviewerName?: string;
  reviewerContact?: string;
  status?: string;
  postUrl?: string;
  receiptUrl?: string;
  scheduledDate?: string;
  memo?: string;
};

/** 블로그 작성 / 영수증 진행현황 개별 건 저장 */
export async function upsertReviewTask(input: ReviewTaskInput): Promise<Result> {
  try {
    await requireAdmin();
    if (!input.reviewCampaignId) return { error: "캠페인을 선택하세요." };
    const status = pick(REVIEW_TASK_STATUSES, input.status ?? "waiting");
    if (!status) return { error: "잘못된 진행 상태입니다." };

    const values = {
      reviewCampaignId: input.reviewCampaignId,
      reviewerName: orNull(input.reviewerName),
      reviewerContact: orNull(input.reviewerContact),
      status,
      postUrl: orNull(input.postUrl),
      receiptUrl: orNull(input.receiptUrl),
      scheduledDate: orNull(input.scheduledDate),
      completedAt: status === "approved" ? new Date() : null,
      memo: orNull(input.memo),
      updatedAt: new Date(),
    };

    if (input.id) {
      await db.update(reviewTasks).set(values).where(eq(reviewTasks.id, input.id));
    } else {
      await db.insert(reviewTasks).values(values);
    }

    await syncReviewCampaignProgress(input.reviewCampaignId);
    revalidatePath("/admin/review/place");
    revalidatePath("/admin/review/shopping");
    return ok();
  } catch (e) {
    return fail(e, "진행현황 저장 실패");
  }
}

export async function deleteReviewTask(taskId: string, campaignId: string): Promise<Result> {
  try {
    await requireAdmin();
    await db.delete(reviewTasks).where(eq(reviewTasks.id, taskId));
    await syncReviewCampaignProgress(campaignId);
    revalidatePath("/admin/review/place");
    revalidatePath("/admin/review/shopping");
    return ok();
  } catch (e) {
    return fail(e, "진행현황 삭제 실패");
  }
}

/** 승인된 리뷰 건수를 캠페인 완료 수량에 반영 */
async function syncReviewCampaignProgress(campaignId: string) {
  const [row] = await db
    .select({ done: sql<number>`count(*) filter (where ${reviewTasks.status} = 'approved')::int` })
    .from(reviewTasks)
    .where(eq(reviewTasks.reviewCampaignId, campaignId));
  await db
    .update(reviewCampaigns)
    .set({ completedQty: row?.done ?? 0, updatedAt: new Date() })
    .where(eq(reviewCampaigns.id, campaignId));
}

// ============================================================
// 퍼포먼스 / 바이럴 / 콘텐츠 — 서비스 신청내역
// ============================================================

export async function setServiceRequestStatus(id: string, status: string): Promise<Result> {
  try {
    const admin = await requireAdmin();
    const next = pick(SERVICE_REQUEST_STATUSES, status);
    if (!next) return { error: "잘못된 상태입니다." };
    await db
      .update(serviceRequests)
      // 단계를 넘긴 관리자가 담당자로 남는다 (캠페인 관리와 같은 방식)
      .set({ status: next, assignedAdminId: admin.id, updatedAt: new Date() })
      .where(eq(serviceRequests.id, id));
    revalidatePath("/admin/requests");
    return ok();
  } catch (e) {
    return fail(e, "상태 변경 실패");
  }
}

export async function updateServiceRequest(
  id: string,
  input: { quotedAmount?: string; contact?: string; adminMemo?: string },
): Promise<Result> {
  try {
    // 상담 내용을 저장한 관리자가 곧 담당자다 — 별도로 지정하지 않는다
    const admin = await requireAdmin();
    await db
      .update(serviceRequests)
      .set({
        quotedAmount: num(input.quotedAmount),
        contact: orNull(input.contact),
        adminMemo: orNull(input.adminMemo),
        assignedAdminId: admin.id,
        updatedAt: new Date(),
      })
      .where(eq(serviceRequests.id, id));
    revalidatePath("/admin/requests");
    return ok();
  } catch (e) {
    return fail(e, "신청내역 저장 실패");
  }
}

// ============================================================
// 주문 / 정산
// ============================================================

// ============================================================
// 관리자가 담아주는 장바구니
// ============================================================

export type AdminCartItemInput = {
  userId: string;
  productKey: string;
  /** 등급이 있는 상품(콘텐츠 — 이미지 제작 제외)에서만 쓴다 */
  tier?: string;
  quantity?: string;
  amount?: string;
};

/**
 * 회원 장바구니에 상품을 담아 준다.
 * 문의로 들어온 건이라 단가표가 없어 관리자가 정한 금액을 그대로 저장한다.
 */
export async function addAdminCartItem(input: AdminCartItemInput): Promise<Result> {
  try {
    const admin = await requireAdmin();
    if (!input.userId) return { error: "회원을 선택하세요." };

    const product = ADMIN_CART_PRODUCTS.find((p) => p.key === input.productKey);
    if (!product) return { error: "잘못된 상품입니다." };

    // 등급이 나뉘는 상품은 어느 등급인지 없으면 고객이 무엇을 결제하는지 알 수 없다
    const tier = product.tiered ? input.tier : undefined;
    if (product.tiered && !ADMIN_CART_TIERS.some((t) => t === tier)) {
      return { error: "등급을 선택하세요." };
    }

    const quantity = Math.max(1, int(input.quantity, 1) ?? 1);
    const amount = Number(num(input.amount));
    if (!Number.isFinite(amount) || amount <= 0) return { error: "금액을 입력하세요." };

    await db.insert(adminCartItems).values({
      userId: input.userId,
      productKey: product.key,
      // 카탈로그가 바뀌어도 고객이 본 이름은 그대로 남기려고 담을 때 값을 박아 둔다
      title: tier ? `${product.label} ${tier}` : product.label,
      quantity,
      amount: String(amount),
      createdByAdminId: admin.id,
    });

    revalidatePath("/admin/cart");
    revalidatePath("/marketing/cart");
    return ok();
  } catch (e) {
    return fail(e, "장바구니 담기 실패");
  }
}

/** 담아준 건 회수 — 결제 전(pending)에만 지운다 */
export async function deleteAdminCartItem(id: string): Promise<Result> {
  try {
    await requireAdmin();
    const [row] = await db.select().from(adminCartItems).where(eq(adminCartItems.id, id)).limit(1);
    if (!row) return { error: "이미 삭제된 건입니다." };
    if (row.status === "ordered") return { error: "이미 결제된 건은 삭제할 수 없습니다." };

    await db.delete(adminCartItems).where(eq(adminCartItems.id, id));
    revalidatePath("/admin/cart");
    revalidatePath("/marketing/cart");
    return ok();
  } catch (e) {
    return fail(e, "장바구니 회수 실패");
  }
}

// ============================================================
// 정산 관리 > 매입(발주)
// ============================================================

const PURCHASE_STATUSES = ["draft", "ordered", "running", "done", "canceled"] as const;
const PURCHASE_SETTLE_STATUSES = ["unpaid", "scheduled", "paid"] as const;

const PURCHASE_SOURCE_TYPES = [
  "reward_place", "reward_shopping", "reward_coupang",
  "guaranteed", "review_place", "review_shopping", "etc",
] as const;

export type PurchaseOrderInput = {
  id?: string;
  /** 어느 신청 건에 대한 발주인지 */
  sourceType?: string;
  sourceId?: string;
  /** 결제 기록과의 연결 (선택) */
  orderId?: string;
  vendorName: string;
  vendorContact?: string;
  title: string;
  quantity?: string;
  purchaseAmount?: string;
  status?: string;
  settleStatus?: string;
  orderedAt?: string;
  settledAt?: string;
  memo?: string;
};

/** 발주 등록·수정 */
export async function upsertPurchaseOrder(input: PurchaseOrderInput): Promise<Result> {
  try {
    const admin = await requireAdmin();
    if (!input.vendorName.trim()) return { error: "발주처를 입력하세요." };
    if (!input.title.trim()) return { error: "발주 내용을 입력하세요." };

    const status = pick(PURCHASE_STATUSES, input.status ?? "draft");
    const settleStatus = pick(PURCHASE_SETTLE_STATUSES, input.settleStatus ?? "unpaid");
    if (!status) return { error: "잘못된 발주 상태입니다." };
    if (!settleStatus) return { error: "잘못된 정산 상태입니다." };

    const values = {
      sourceType: pick(PURCHASE_SOURCE_TYPES, input.sourceType ?? "etc") ?? "etc",
      sourceId: orNull(input.sourceId),
      orderId: orNull(input.orderId),
      vendorName: input.vendorName.trim(),
      vendorContact: orNull(input.vendorContact),
      title: input.title.trim(),
      quantity: Math.max(1, int(input.quantity, 1) ?? 1),
      purchaseAmount: num(input.purchaseAmount),
      status,
      settleStatus,
      orderedAt: orNull(input.orderedAt),
      // 지급 완료로 두면 지급일을 비워둘 수 없다 — 비어 있으면 오늘로 채운다
      settledAt: settleStatus === "paid" ? (orNull(input.settledAt) ?? todayYMD()) : orNull(input.settledAt),
      memo: orNull(input.memo),
      updatedAt: new Date(),
    };

    if (input.id) {
      await db.update(purchaseOrders).set(values).where(eq(purchaseOrders.id, input.id));
    } else {
      await db.insert(purchaseOrders).values({ ...values, createdByAdminId: admin.id });
    }
    revalidatePath("/admin/purchases");
    return ok();
  } catch (e) {
    return fail(e, "발주 저장 실패");
  }
}

/**
 * 원클릭 발주 완료.
 *
 * 엑셀을 뽑아 업체에 넘긴 뒤 "보냈다"는 사실만 빠르게 남기는 용도다.
 * 발주처·매입가는 이 시점에 모르는 경우가 많아 비워 두고, 나중에 수정에서 채운다.
 * (매입가가 0이라 원가·마진 집계에는 잡히지 않는다)
 */
export async function completePurchaseOrder(input: {
  sourceType: string;
  sourceId: string;
  title: string;
  quantity?: number;
}): Promise<Result> {
  try {
    const admin = await requireAdmin();
    const sourceType = pick(PURCHASE_SOURCE_TYPES, input.sourceType) ?? "etc";
    if (!input.sourceId) return { error: "대상을 찾을 수 없습니다." };

    await db.insert(purchaseOrders).values({
      sourceType,
      sourceId: input.sourceId,
      vendorName: "미지정",
      title: input.title.trim() || "발주",
      quantity: Math.max(1, input.quantity ?? 1),
      purchaseAmount: "0",
      status: "ordered",
      orderedAt: todayYMD(),
      createdByAdminId: admin.id,
    });

    revalidatePath("/admin/purchases");
    return ok();
  } catch (e) {
    return fail(e, "발주 완료 처리 실패");
  }
}

export async function deletePurchaseOrder(id: string): Promise<Result> {
  try {
    await requireAdmin();
    await db.delete(purchaseOrders).where(eq(purchaseOrders.id, id));
    revalidatePath("/admin/purchases");
    return ok();
  } catch (e) {
    return fail(e, "발주 삭제 실패");
  }
}

/** 오늘 (YYYY-MM-DD) — 지급일 기본값 */
function todayYMD() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// ============================================================
// 통합순위관리 > 멤버십
// ============================================================

/*
 * 멤버십은 고객이 통합순위 화면에서 보유 포인트로 직접 결제한다 (marketing/actions.ts).
 * 관리자가 부여·해지하던 기능은 없앴고, 어드민 화면은 현황 조회만 한다.
 */
