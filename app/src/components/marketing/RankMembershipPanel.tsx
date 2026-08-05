"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { purchaseRankMembership } from "@/app/(platform)/marketing/actions";

const won = (n: number) => `₩${Math.round(n).toLocaleString("ko-KR")}`;

/**
 * 멤버십 현황 + 결제.
 * 결제는 보유 포인트에서 바로 빠지고 그 자리에서 이용이 시작된다 — 승인 대기가 없다.
 */
export function RankMembershipPanel({
  live,
  endDate,
  daysLeft,
  fee,
  balance,
  keywordCount,
  freeLimit,
}: {
  live: boolean;
  endDate: string | null;
  /** 만료까지 남은 일수 (무기한이면 null) */
  daysLeft: number | null;
  fee: number;
  balance: number;
  keywordCount: number;
  freeLimit: number;
}) {
  const router = useRouter();
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [pending, startTransition] = useTransition();

  const enough = balance >= fee;
  const locked = Math.max(0, keywordCount - freeLimit);

  const buy = () => {
    setMsg(null);
    startTransition(async () => {
      const res = await purchaseRankMembership();
      if ("error" in res) {
        setMsg({ text: res.error, ok: false });
        return;
      }
      setMsg({
        text: `멤버십이 ${res.extended ? "연장" : "시작"}되었습니다. ${res.endDate}까지 이용할 수 있습니다.`,
        ok: true,
      });
      router.refresh();
    });
  };

  return (
    <div className="px-6 md:px-10 pt-6 md:pt-10">
      <div
        className={`rounded-2xl border p-5 flex items-start justify-between gap-5 flex-wrap ${
          live ? "border-brand-border bg-white" : "border-brand-primary/25 bg-brand-lighter/60"
        }`}
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-1 rounded-lg text-[12px] font-bold ${
                live ? "bg-emerald-50 text-emerald-600" : "bg-brand-lighter text-brand-sub"
              }`}
            >
              {live ? "멤버십 이용중" : "멤버십 없음"}
            </span>
            <p className="text-[15px] font-extrabold text-brand-dark">통합순위관리 멤버십</p>
          </div>

          <p className="text-[13.5px] text-brand-sub mt-2 leading-relaxed">
            {live ? (
              <>
                키워드를 개수 제한 없이 추적하고 있습니다.
                {endDate && (
                  <>
                    {" "}
                    <span className="font-semibold text-brand-dark">{endDate}</span>까지
                    {daysLeft != null && daysLeft <= 3 && (
                      <span className="text-red-500 font-semibold"> (D-{Math.max(0, daysLeft)})</span>
                    )}
                  </>
                )}
              </>
            ) : (
              <>
                키워드 <span className="font-semibold text-brand-dark">{freeLimit}개</span>는 무료이고,
                그 이상은 멤버십이 있어야 추적됩니다.
                {locked > 0 && (
                  <span className="text-red-500 font-semibold">
                    {" "}
                    지금 {locked}개가 잠겨 있습니다.
                  </span>
                )}
              </>
            )}
          </p>

          {msg && (
            <p className={`text-[13px] font-semibold mt-2 ${msg.ok ? "text-emerald-600" : "text-red-500"}`}>
              {msg.text}
            </p>
          )}
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="text-right">
            <p className="text-[12px] text-brand-muted font-semibold">
              월 이용료 <span className="text-brand-dark font-bold">{won(fee)}</span>
            </p>
            <p className="text-[12px] text-brand-muted mt-0.5">
              보유 포인트 <span className={enough ? "text-brand-dark font-bold" : "text-red-500 font-bold"}>{won(balance)}</span>
            </p>
          </div>

          {enough ? (
            <button
              onClick={buy}
              disabled={pending}
              className="px-4 py-2.5 rounded-xl text-[14px] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ background: "linear-gradient(135deg,#1B3160,#2E6BE0)" }}
            >
              {pending ? "결제 중..." : live ? "1개월 연장" : "포인트로 결제"}
            </button>
          ) : (
            // 포인트가 모자라면 결제 버튼을 눌러 봐야 실패한다 — 충전으로 바로 보낸다
            <Link
              href="/marketing/my/charge"
              className="px-4 py-2.5 rounded-xl text-[14px] font-bold text-white transition-opacity hover:opacity-90"
              style={{ background: "linear-gradient(135deg,#1B3160,#2E6BE0)" }}
            >
              포인트 충전하기
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
