"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { purchaseRankMembership } from "@/app/(platform)/marketing/actions";
import { MEMBERSHIP_MONTHS, RENEWAL_NOTICE_DAYS } from "@/lib/rank-membership";

// 접미 "원" — U+20A9(₩)는 가로 획이 뒤 숫자에 닿아 취소선처럼 보인다 (admin-format.ts 참고)
const won = (n: number) => `${Math.round(n).toLocaleString("ko-KR")}원`;

/**
 * 멤버십 현황 + 결제.
 * 결제는 보유 포인트에서 바로 빠지고 그 자리에서 이용이 시작된다 — 승인 대기가 없다.
 *
 * 오른쪽 결제 박스는 쇼핑몰 상품 구매 박스를 따라간다 — 가격 / 보유·차감 내역 / 결제 버튼 순서.
 * 규정은 길어서 항상 펼쳐 두면 결제 정보를 덮어 버리므로 모달로 뺐다.
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
  const [rulesOpen, setRulesOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const enough = balance >= fee;
  const locked = Math.max(0, keywordCount - freeLimit);
  const shortfall = Math.max(0, fee - balance);

  /* 규정 문구는 lib/rank-membership.ts 의 실제 규칙과 1:1 로 맞춘다. */
  const RULES: { title: string; body: string }[] = [
    {
      title: "이용료와 결제 수단",
      body: `월 이용료는 ${won(fee)}이며 ${MEMBERSHIP_MONTHS}개월 단위로 결제합니다. 결제는 보유 포인트에서만 가능하고, 결제 즉시 포인트가 차감됩니다.`,
    },
    {
      title: "이용 시작 시점",
      body: "승인 대기가 없습니다. 결제가 끝나는 즉시 이용이 시작됩니다.",
    },
    {
      title: "무료 제공 범위",
      body: `회원가입만 하면 키워드 ${freeLimit}개는 무료로 추적됩니다. ${freeLimit + 1}개째부터는 멤버십이 있어야 등록·추적할 수 있습니다.`,
    },
    {
      title: "이용중 혜택",
      body: "멤버십을 이용하는 동안에는 네이버 플레이스·네이버 쇼핑·쿠팡 키워드를 개수 제한 없이 추적할 수 있습니다.",
    },
    {
      title: "이용 기간과 연장",
      body: `이용 종료일은 결제일로부터 ${MEMBERSHIP_MONTHS}개월 뒤입니다. 이용중에 연장하면 남은 기간이 사라지지 않고 그 뒤에 이어집니다.`,
    },
    {
      title: "만료 안내",
      body: `만료 ${RENEWAL_NOTICE_DAYS}일 전부터 이 화면에 연장 안내가 표시됩니다.`,
    },
    {
      title: "만료 후 처리",
      body: `연장하지 않으면 가장 먼저 등록한 키워드 ${freeLimit}개만 남고 나머지는 추적이 중지됩니다. 등록 내용은 지워지지 않으므로, 다시 결제하면 그대로 추적이 재개됩니다.`,
    },
  ];

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
    <div>
      <div
        className="rounded-2xl border border-white/10 px-5 py-6 md:px-6 md:py-7 flex flex-col gap-5 md:flex-row md:items-center md:justify-between"
        /*
         * 대시보드 Welcome 배너와 같은 그라디언트를 쓴다.
         *
         * 값을 베껴 오지 않고 토큰(--gradient-point-wide)을 그대로 참조한다 —
         * 두 배너는 같은 자리(본문 최상단 가로 배너)에 쓰이므로, 한쪽만 바뀌어
         * 어긋나는 일이 없어야 한다.
         *
         * 왼쪽이 가장 어둡고(#152C9E) 오른쪽이 가장 밝다(#2A5EFF). 흰 제목·설명은
         * 어두운 왼쪽에, 결제 박스(흰 카드)는 밝은 오른쪽에 놓여 대비가 유지된다.
         */
        style={{ background: "var(--gradient-point-wide)" }}
      >
        {/* ── 좌: 페이지 제목 + 멤버십 현황 ──
            페이지 헤더를 따로 두면 "통합 순위관리"와 "통합순위관리 멤버십"이 두 번
            나와 어느 쪽이 화면 이름인지 흐려진다. 하나로 합쳐 제목을 여기 둔다. */}
        <div className="min-w-0 flex-1 flex items-start gap-3.5">
          <span
            className="h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 bg-white/10 border border-white/12"
          >
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.9}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
          </span>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-[22px] font-extrabold text-white leading-tight">통합 순위관리</h1>
              <span
                className={`px-2.5 py-1 rounded-lg text-[12.5px] font-bold ${
                  live ? "bg-emerald-400/15 text-emerald-300" : "bg-white/10 text-white/60"
                }`}
              >
                {live ? "이용중" : "미가입"}
              </span>
            </div>

            <p className="text-[13.5px] text-white/55 mt-1.5">
              네이버 플레이스·쇼핑, 쿠팡 키워드 순위를 한 페이지에서 추적하세요.
            </p>

            <p className="text-[13.5px] text-white/70 mt-2 leading-relaxed">
              {live ? (
                <>
                  키워드를 개수 제한 없이 추적하고 있습니다.
                  {endDate && (
                    <>
                      {" "}
                      <span className="font-semibold text-white">{endDate}</span>까지
                      {daysLeft != null && daysLeft <= RENEWAL_NOTICE_DAYS && (
                        <span className="text-red-300 font-semibold"> (D-{Math.max(0, daysLeft)})</span>
                      )}
                    </>
                  )}
                </>
              ) : (
                <>
                  키워드 <span className="font-semibold text-white">{freeLimit}개</span>는 무료이고,
                  그 이상은 멤버십이 있어야 추적됩니다.
                  {locked > 0 && (
                    <span className="text-red-300 font-semibold"> 지금 {locked}개가 잠겨 있습니다.</span>
                  )}
                </>
              )}
            </p>

            {msg && (
              <p className={`text-[14px] font-semibold mt-2 ${msg.ok ? "text-emerald-300" : "text-red-300"}`}>
                {msg.text}
              </p>
            )}

            <button
              type="button"
              onClick={() => setRulesOpen(true)}
              className="mt-3.5 inline-flex items-center gap-1 text-[14px] font-bold text-[#8FB0FF] hover:underline"
            >
              이용 규정 자세히 보기
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── 우: 결제 박스 ──
            제목 옆에 놓이면서 폭이 줄었다. 세로로 쌓으면 배너만 혼자 길어져
            왼쪽 제목과 높이가 어긋나므로, 가로 한 줄로 눕힌다. */}
        <div className="w-full md:w-auto md:shrink-0 rounded-xl border border-brand-border bg-white px-5 py-4 flex flex-wrap items-center justify-between gap-4 md:justify-start md:gap-5">
          <div className="shrink-0">
            <p className="text-[12px] font-bold text-brand-sub leading-none mb-1.5">월 이용료</p>
            <p className="leading-none">
              <span className="text-[22px] font-extrabold text-brand-dark tabular-nums">{won(fee)}</span>
              <span className="ml-1 text-[12px] font-semibold text-brand-muted">/ {MEMBERSHIP_MONTHS}개월</span>
            </p>
          </div>

          <div className="hidden xl:block shrink-0 pl-4 border-l border-dashed border-brand-border text-[12.5px] leading-[1.7]">
            <div className="flex items-center justify-between gap-3">
              <span className="text-brand-sub">보유</span>
              <span className="font-bold text-brand-dark tabular-nums">{won(balance)}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-brand-sub">{enough ? "결제 후" : "부족"}</span>
              <span className={`font-bold tabular-nums ${enough ? "text-brand-dark" : "text-red-500"}`}>
                {enough ? won(balance - fee) : `-${won(shortfall)}`}
              </span>
            </div>
          </div>

          <div className="shrink-0">
            <button
              onClick={buy}
              disabled={pending}
              className="px-5 py-2.5 rounded-lg text-[14px] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60 whitespace-nowrap"
              style={{ background: "var(--gradient-point)", boxShadow: "var(--shadow-point)" }}
            >
              {pending ? "결제 중..." : live ? `${MEMBERSHIP_MONTHS}개월 연장하기` : "포인트로 결제하기"}
            </button>
            <p className="mt-1.5 text-center text-[11px] text-brand-muted whitespace-nowrap">
              결제 즉시 차감 · 바로 이용
            </p>
          </div>
        </div>
      </div>

      {rulesOpen && <RulesModal rules={RULES} onClose={() => setRulesOpen(false)} />}
    </div>
  );
}

/** 이용 규정 모달 — 배경 클릭·ESC 로 닫는다. */
function RulesModal({
  rules,
  onClose,
}: {
  rules: { title: string; body: string }[];
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    // 뒤 화면이 같이 스크롤되면 규정을 읽는 도중 위치를 잃는다
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="통합순위관리 멤버십 이용 규정"
        className="relative w-full max-w-lg max-h-[85vh] flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        <div
          className="flex items-start justify-between gap-3 px-6 py-5"
          style={{ background: "var(--gradient-point)" }}
        >
          <div>
            <p className="text-[20px] font-extrabold text-white leading-tight">통합순위관리 멤버십 이용 규정</p>
            <p className="text-[14px] text-white/70 mt-1">결제 전에 확인해 주세요</p>
          </div>
          <button
            onClick={onClose}
            aria-label="닫기"
            className="h-7 w-7 rounded-full flex items-center justify-center shrink-0 text-white/80 hover:text-white hover:bg-white/15 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <ol className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {rules.map((r, i) => (
            <li key={r.title} className="flex items-start gap-3">
              <span
                className="h-6 w-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-[12.5px] font-bold text-white"
                style={{ background: "var(--gradient-point)" }}
              >
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className="text-[16px] font-bold text-brand-dark">{r.title}</p>
                <p className="text-[14px] text-brand-sub leading-relaxed mt-1">{r.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="px-6 py-4 border-t border-brand-border">
          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-xl text-[16px] font-bold text-white transition-opacity hover:opacity-90"
            style={{ background: "var(--gradient-point)" }}
          >
            확인했습니다
          </button>
        </div>
      </div>
    </div>
  );
}
