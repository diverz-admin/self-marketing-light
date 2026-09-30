"use client";

import { useState } from "react";
import PageHeader from "@/components/marketing/PageHeader";
import { ListPager, useAutoPageSize } from "@/components/marketing/manage-ui";

export type ServiceInquiry = {
  id: string;
  serviceName: string;
  status: "requested" | "reviewing" | "quoted" | "in_progress" | "completed" | "canceled";
  /** 0 = 아직 견적 전 */
  quotedAmount: number;
  requestedAt: string;
};

const STATUS_CONFIG: Record<ServiceInquiry["status"], { label: string; cls: string }> = {
  requested: { label: "신청접수", cls: "bg-amber-50 text-amber-600" },
  reviewing: { label: "상담중", cls: "bg-green-50 text-green-700" },
  quoted: { label: "견적발송", cls: "bg-blue-50 text-[#2452EB]" },
  in_progress: { label: "진행중", cls: "bg-green-50 text-green-700" },
  completed: { label: "완료", cls: "bg-blue-50 text-[#2452EB]" },
  canceled: { label: "취소", cls: "bg-red-50 text-red-500" },
};

function StatusBadge({ status }: { status: ServiceInquiry["status"] }) {
  const st = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center whitespace-nowrap px-2.5 py-1 rounded-lg text-[12px] font-bold ${st.cls}`}>
      {st.label}
    </span>
  );
}

const amountText = (n: number) => (n > 0 ? `${n.toLocaleString()}P` : "-");

export default function ServiceInquiriesView({ items }: { items: ServiceInquiry[] }) {
  const [page, setPage] = useState(1);
  const [sizeOverride, setSizeOverride] = useState<number | null>(null);
  const autoSize = useAutoPageSize();
  const pageSize = sizeOverride ?? autoSize;

  const total = items.length;
  const curPage = Math.min(page, Math.max(1, Math.ceil(total / pageSize)));
  const pageItems = items.slice((curPage - 1) * pageSize, curPage * pageSize);

  return (
    <div className="w-full space-y-5">
      <PageHeader
        title="서비스 신청내역"
        subtitle="상담으로 접수한 추가 서비스의 진행 상태와 견적 내역입니다."
        iconPath={"M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"}
      />

      <div className="bg-white rounded-2xl border border-brand-border overflow-hidden">
        {total === 0 ? (
          <div className="px-4 py-16 text-center text-[15px] leading-relaxed text-brand-muted">
            아직 신청한 서비스가 없습니다.
            <br />
            추가 서비스 화면에서 상담을 신청하면 여기에 표시됩니다.
          </div>
        ) : (
          <>
            {/* 데스크톱 표 */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full min-w-[640px] text-left">
                <thead>
                  <tr className="border-b border-brand-border bg-brand-lighter">
                    {["서비스", "상태", "견적 금액", "신청일"].map((h) => (
                      <th key={h} className="px-5 py-3 text-[12px] font-bold text-brand-muted uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((r) => (
                    <tr key={r.id} className="border-b border-brand-border last:border-b-0 hover:bg-brand-lighter/40 transition-colors">
                      <td className="px-5 py-3.5 text-[15px] font-semibold text-brand-dark">{r.serviceName}</td>
                      <td className="px-5 py-3.5"><StatusBadge status={r.status} /></td>
                      <td className="px-5 py-3.5 text-[14px] font-bold text-brand-dark tabular-nums">{amountText(r.quotedAmount)}</td>
                      <td className="px-5 py-3.5 text-[13px] text-brand-sub tabular-nums whitespace-nowrap">{r.requestedAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 모바일 카드 */}
            <div className="md:hidden p-2 space-y-2">
              {pageItems.map((r) => (
                <div key={r.id} className="rounded-xl border border-brand-border bg-white">
                  <div className="flex items-center justify-between gap-2 px-3 py-2.5 border-b border-brand-border">
                    <span className="truncate text-[15px] font-extrabold text-brand-dark">{r.serviceName}</span>
                    <StatusBadge status={r.status} />
                  </div>
                  <dl className="px-3 py-2">
                    {[
                      ["견적 금액", amountText(r.quotedAmount)],
                      ["신청일", r.requestedAt],
                    ].map(([label, value]) => (
                      <div key={label} className="flex items-center justify-between gap-3 py-1.5">
                        <dt className="text-[12px] font-bold text-brand-muted">{label}</dt>
                        <dd className="text-[13px] font-semibold text-brand-dark tabular-nums">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}
            </div>

            <ListPager page={curPage} pageSize={pageSize} total={total} onPage={setPage}
              sizeValue={sizeOverride} onSizeChange={(n) => { setSizeOverride(n); setPage(1); }} />
          </>
        )}

        <div className="flex items-center justify-between gap-3 flex-wrap px-5 py-3 border-t border-brand-border">
          <p className="text-[13px] text-brand-muted">총 <span className="font-bold text-brand-dark">{total}</span>건</p>
          <p className="text-[12.5px] text-brand-muted">자세한 진행은 담당자가 채팅으로 안내합니다.</p>
        </div>
      </div>
    </div>
  );
}
