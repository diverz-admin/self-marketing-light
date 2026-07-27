"use client";

import { useState, useTransition } from "react";
import {
  Card, SectionHeader, TableShell, Th, Td, EmptyState, Badge, Button, Notice,
} from "@/components/admin/ui";
import {
  formatKRW, formatNumber, formatDate, formatDateTime, extensionStatusMeta, extensionTargetLabel,
} from "@/lib/admin-format";
import { setExtensionStatus } from "@/app/(platform)/admin/(console)/actions";

export type ExtensionRow = {
  id: string;
  targetType: string;
  targetLabel: string;
  userName: string;
  userEmail: string;
  addDays: number;
  addQty: number;
  amount: number;
  status: string;
  memo: string | null;
  createdAt: string;
  // 고객 "연장 안내" 화면과 같은 정보 (리워드 캠페인만 채워진다)
  keyword?: string;
  productTitle?: string;
  unitPrice?: number | null;
  currentEndDate?: string | null;
  // 리워드 연장 신청 표(variant="reward")에서만 쓰는 값들
  advertiser?: string;         // 가입 시 등록한 광고주(회사)명
  targetUrl?: string | null;   // 플레이스/상품 링크
  currentStartDate?: string | null;
  currentRank?: number | null;
};

/** 현재 종료일 + 연장 일수 = 연장 후 종료일 (고객 화면의 "연장 후 종료일") */
function addDaysTo(date: string | null | undefined, days: number) {
  if (!date || days <= 0) return null;
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * 기획서: "연장하기 버튼 클릭 시 캠페인 신청 페이지에 동일하게 노출".
 * 고객이 올린 연장 신청을 관리자가 승인하면 대상 캠페인의 기간·수량이 실제로 늘어난다.
 *
 * variant="reward" — 상위노출 연장 신청 표.
 *   광고주명 · 플레이스명 · 링크 · 키워드 · 현재 순위 · 캠페인 시작일 순으로 보여주고,
 *   처리는 "셋팅완료" 한 번으로 끝낸다(= 승인, 기간·수량이 실제로 늘어난다).
 */
export function ExtensionsPanel({ rows, title = "연장 신청", variant = "default" }: {
  rows: ExtensionRow[];
  title?: string;
  variant?: "default" | "reward";
}) {
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ id: string; text: string; ok: boolean } | null>(null);

  const act = (id: string, status: string) => {
    startTransition(async () => {
      const res = await setExtensionStatus(id, status);
      setMsg({ id, text: "error" in res ? res.error : "처리 완료", ok: !("error" in res) });
    });
  };

  if (variant === "reward") {
    return (
      <Card>
        <SectionHeader title={title} right={<span className="text-[13px] text-brand-sub">{rows.length}건</span>} />
        {rows.length ? (
          <TableShell
            head={
              <>
                <Th>광고주명</Th>
                <Th>플레이스명</Th>
                <Th>플레이스 링크</Th>
                <Th>키워드</Th>
                <Th className="text-center">현재 순위</Th>
                <Th>캠페인 시작일</Th>
                <Th className="text-center">연장 기간</Th>
                <Th className="text-right">연장 금액</Th>
                <Th>신청일</Th>
                <Th>상태</Th>
                <Th className="text-right">처리</Th>
              </>
            }
          >
            {rows.map((r) => {
              const meta = extensionStatusMeta[r.status] ?? { label: r.status, tone: "gray" as const };
              return (
                <tr key={r.id} className="hover:bg-brand-light/50 transition-colors">
                  <Td>
                    <div className="font-semibold text-brand-dark">{r.advertiser ?? r.userName}</div>
                    <div className="text-[12px] text-brand-muted">{r.userEmail}</div>
                    {msg?.id === r.id && <Notice ok={msg.ok}>{msg.text}</Notice>}
                  </Td>
                  <Td className="text-brand-dark">{r.targetLabel}</Td>
                  <Td>
                    {r.targetUrl ? (
                      <a
                        href={r.targetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[12.5px] text-brand-primary hover:underline break-all line-clamp-1 max-w-[180px]"
                      >
                        {r.targetUrl}
                      </a>
                    ) : (
                      <span className="text-brand-muted">-</span>
                    )}
                  </Td>
                  <Td className="text-brand-text">{r.keyword || "-"}</Td>
                  <Td className="text-center tabular-nums font-semibold text-brand-dark">
                    {r.currentRank != null ? `${r.currentRank}위` : "-"}
                  </Td>
                  <Td className="text-[12.5px] text-brand-sub whitespace-nowrap">
                    {r.currentStartDate ? formatDate(r.currentStartDate) : "-"}
                  </Td>
                  <Td className="text-center tabular-nums font-semibold text-brand-dark">
                    {r.addDays > 0 ? `${r.addDays}일` : "-"}
                  </Td>
                  <Td className="text-right">
                    <div className="tabular-nums font-semibold text-brand-dark">{formatKRW(r.amount)}</div>
                    {/* 고객 화면과 같은 계산식: 일 작업량 × 기간 × 건당 단가 */}
                    {r.unitPrice != null && r.addQty > 0 && r.addDays > 0 && (
                      <div className="text-[11.5px] text-brand-muted tabular-nums">
                        {formatNumber(r.addQty)}건 × {r.addDays}일 × {formatNumber(r.unitPrice)}원
                      </div>
                    )}
                  </Td>
                  <Td className="text-brand-sub whitespace-nowrap">{formatDateTime(r.createdAt)}</Td>
                  <Td>
                    <Badge tone={meta.tone}>{meta.label}</Badge>
                  </Td>
                  <Td className="text-right">
                    {r.status === "requested" ? (
                      <Button size="sm" disabled={pending} onClick={() => act(r.id, "approved")}>
                        셋팅완료
                      </Button>
                    ) : (
                      <span className="text-[12.5px] text-brand-muted">처리 완료</span>
                    )}
                  </Td>
                </tr>
              );
            })}
          </TableShell>
        ) : (
          <EmptyState message="연장 신청 내역이 없습니다." />
        )}
      </Card>
    );
  }

  return (
    <Card>
      <SectionHeader title={title} right={<span className="text-[13px] text-brand-sub">{rows.length}건</span>} />
      {rows.length ? (
        <TableShell
          head={
            <>
              <Th>대상 · 키워드</Th>
              <Th>상품</Th>
              <Th>신청 회원</Th>
              <Th className="text-center">일 작업량</Th>
              <Th className="text-center">연장 기간</Th>
              <Th>종료일</Th>
              <Th className="text-right">연장 금액</Th>
              <Th>신청일</Th>
              <Th>상태</Th>
              <Th className="text-right">처리</Th>
            </>
          }
        >
          {rows.map((r) => {
            const meta = extensionStatusMeta[r.status] ?? { label: r.status, tone: "gray" as const };
            const nextEnd = addDaysTo(r.currentEndDate, r.addDays);
            return (
              <tr key={r.id} className="hover:bg-brand-light/50 transition-colors">
                <Td>
                  <div className="font-semibold text-brand-dark">{r.targetLabel}</div>
                  <div className="text-[12px] text-brand-muted">
                    {r.keyword || (extensionTargetLabel[r.targetType] ?? r.targetType)}
                  </div>
                  {msg?.id === r.id && <Notice ok={msg.ok}>{msg.text}</Notice>}
                </Td>
                <Td className="text-[12.5px]">
                  <div className="text-brand-text">{r.productTitle ?? "-"}</div>
                  {r.unitPrice != null && (
                    <div className="text-brand-muted tabular-nums">건당 {formatKRW(r.unitPrice)}</div>
                  )}
                </Td>
                <Td>
                  <div className="text-brand-dark">{r.userName}</div>
                  <div className="text-[12.5px] text-brand-muted">{r.userEmail}</div>
                </Td>
                <Td className="text-center tabular-nums font-semibold text-brand-dark">
                  {r.addQty > 0 ? `${formatNumber(r.addQty)}건` : "-"}
                </Td>
                <Td className="text-center tabular-nums font-semibold text-brand-dark">
                  {r.addDays > 0 ? `${r.addDays}일` : "-"}
                </Td>
                <Td className="text-[12.5px] whitespace-nowrap">
                  {r.currentEndDate ? (
                    <>
                      <div className="text-brand-muted">{formatDate(r.currentEndDate)}</div>
                      {nextEnd && <div className="font-semibold text-brand-dark">→ {formatDate(nextEnd)}</div>}
                    </>
                  ) : (
                    <span className="text-brand-muted">-</span>
                  )}
                </Td>
                <Td className="text-right">
                  <div className="tabular-nums font-semibold text-brand-dark">{formatKRW(r.amount)}</div>
                  {/* 고객 화면과 같은 계산식: 일 작업량 × 기간 × 건당 단가 */}
                  {r.unitPrice != null && r.addQty > 0 && r.addDays > 0 && (
                    <div className="text-[11.5px] text-brand-muted tabular-nums">
                      {formatNumber(r.addQty)}건 × {r.addDays}일 × {formatNumber(r.unitPrice)}원
                    </div>
                  )}
                </Td>
                <Td className="text-brand-sub whitespace-nowrap">{formatDateTime(r.createdAt)}</Td>
                <Td>
                  <Badge tone={meta.tone}>{meta.label}</Badge>
                </Td>
                <Td className="text-right">
                  {r.status === "requested" ? (
                    <div className="flex gap-1.5 justify-end">
                      <Button size="sm" disabled={pending} onClick={() => act(r.id, "approved")}>
                        승인
                      </Button>
                      <Button size="sm" variant="danger" disabled={pending} onClick={() => act(r.id, "rejected")}>
                        반려
                      </Button>
                    </div>
                  ) : (
                    <span className="text-[12.5px] text-brand-muted">처리 완료</span>
                  )}
                </Td>
              </tr>
            );
          })}
        </TableShell>
      ) : (
        <EmptyState message="연장 신청 내역이 없습니다." />
      )}
    </Card>
  );
}
