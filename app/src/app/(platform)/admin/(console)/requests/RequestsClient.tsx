"use client";

import { useMemo, useState, useTransition } from "react";
import {
  Card, TableShell, Th, Td, EmptyState, Badge, Tabs, SearchInput,
  Button, InlineSelect, Modal, ModalFooter, Field, Input, Textarea, Notice,
} from "@/components/admin/ui";
import { PeriodPicker } from "@/components/admin/PeriodPicker";
import type { PeriodParams } from "@/lib/period-filter";
import {
  formatKRW, formatDateTime, serviceRequestStatusMeta, serviceCategoryMeta,
} from "@/lib/admin-format";
import { setServiceRequestStatus, updateServiceRequest } from "../actions";

export type ServiceRequestRow = {
  id: string;
  userName: string;
  userEmail: string;
  category: string;
  serviceKey: string;
  serviceName: string;
  inputs: Record<string, unknown>;
  quotedAmount: number;
  status: string;
  /** 담당자 = 상담·처리를 맡은 관리자 (미지정이면 빈 값) */
  assignedAdminName: string;
  contact: string | null;
  adminMemo: string | null;
  createdAt: string;
};

const CATEGORY_TABS = [
  { key: "all", label: "전체" },
  { key: "performance", label: "퍼포먼스" },
  { key: "viral", label: "바이럴" },
  { key: "content", label: "콘텐츠" },
];

const STATUS_TABS = [
  { key: "all", label: "전체" },
  { key: "requested", label: "신청접수" },
  { key: "reviewing", label: "상담중" },
  { key: "quoted", label: "견적발송" },
  { key: "in_progress", label: "진행중" },
  { key: "completed", label: "완료" },
];

const ALL_STATUSES = ["requested", "reviewing", "quoted", "in_progress", "completed", "canceled"];

// 손이 필요한 신청접수부터 — 전체 탭에서도 이 순서로 쌓인다
const STATUS_PRIORITY: Record<string, number> = {
  requested: 0, reviewing: 1, quoted: 2, in_progress: 3, completed: 4, canceled: 5,
};
const priorityOf = (s: string) => STATUS_PRIORITY[s] ?? 9;

export function RequestsClient({
  rows,
  years,
  period,
}: {
  rows: ServiceRequestRow[];
  /** 신청 데이터가 있는 연도 (서버 집계) */
  years: number[];
  /** URL 로 전달된 연/월/일 조회 조건 */
  period: PeriodParams;
}) {
  const [category, setCategory] = useState("all");
  // 화면을 열면 처리해야 할 신청접수부터 보이게 한다
  const [status, setStatus] = useState("requested");
  const [query, setQuery] = useState("");
  const [detail, setDetail] = useState<ServiceRequestRow | null>(null);
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ id: string; text: string; ok: boolean } | null>(null);

  const categoryCounts = useMemo(() => {
    const c: Record<string, number> = { all: rows.length };
    for (const r of rows) c[r.category] = (c[r.category] ?? 0) + 1;
    return c;
  }, [rows]);

  const statusCounts = useMemo(() => {
    const c: Record<string, number> = { all: rows.length };
    for (const r of rows) c[r.status] = (c[r.status] ?? 0) + 1;
    return c;
  }, [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (category !== "all" && r.category !== category) return false;
      if (status !== "all" && r.status !== status) return false;
      if (!q) return true;
      return r.serviceName.toLowerCase().includes(q) || r.userName.toLowerCase().includes(q);
    })
      // 신청접수 건이 항상 맨 위, 같은 상태 안에서는 최근 신청 순
      .sort((a, b) =>
        priorityOf(a.status) - priorityOf(b.status) || b.createdAt.localeCompare(a.createdAt),
      );
  }, [rows, category, status, query]);

  const change = (id: string, next: string) => {
    startTransition(async () => {
      const res = await setServiceRequestStatus(id, next);
      setMsg({ id, text: "error" in res ? res.error : "상태 변경됨", ok: !("error" in res) });
    });
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-3">
        <Tabs tabs={CATEGORY_TABS.map((t) => ({ ...t, count: categoryCounts[t.key] ?? 0 }))} value={category} onChange={setCategory} />
        <SearchInput value={query} onChange={setQuery} placeholder="서비스 · 회원 검색" className="md:ml-auto md:w-72" />
      </div>

      <div className="mb-4">
        <Tabs tabs={STATUS_TABS.map((t) => ({ ...t, count: statusCounts[t.key] ?? 0 }))} value={status} onChange={setStatus} />
      </div>

      <Card className="overflow-hidden">
        {/* 신청일 연/월/일 조회 — 서버에서 신청일(KST) 기준으로 걸러 온다 */}
        <PeriodPicker years={years} value={period} count={filtered.length} label="신청일 조회" />

        {filtered.length ? (
          <TableShell
            head={
              <>
                <Th>서비스</Th>
                <Th>신청 회원</Th>
                <Th>분류</Th>
                <Th className="text-right">견적 금액</Th>
                <Th>신청일시</Th>
                <Th>담당자</Th>
                <Th>상태</Th>
                <Th className="text-right">처리</Th>
              </>
            }
          >
            {filtered.map((r) => {
              const meta = serviceRequestStatusMeta[r.status] ?? { label: r.status, tone: "gray" as const };
              const cMeta = serviceCategoryMeta[r.category] ?? { label: r.category, tone: "gray" as const };
              return (
                <tr key={r.id} className="hover:bg-brand-light/50 transition-colors">
                  <Td>
                    <div className="font-semibold text-brand-dark">{r.serviceName}</div>
                    <div className="text-[12px] text-brand-muted font-mono">{r.serviceKey}</div>
                    {msg?.id === r.id && <Notice ok={msg.ok}>{msg.text}</Notice>}
                  </Td>
                  <Td>
                    <div className="text-brand-dark">{r.userName}</div>
                    <div className="text-[12.5px] text-brand-muted">{r.contact || r.userEmail}</div>
                  </Td>
                  <Td>
                    <Badge tone={cMeta.tone}>{cMeta.label}</Badge>
                  </Td>
                  <Td className="text-right tabular-nums font-semibold text-brand-dark">
                    {r.quotedAmount > 0 ? formatKRW(r.quotedAmount) : "-"}
                  </Td>
                  <Td className="text-brand-sub whitespace-nowrap">{formatDateTime(r.createdAt)}</Td>
                  {/* 담당자 = 상태 변경·상담 저장을 처리한 관리자 (처리 시 자동으로 기록된다) */}
                  <Td className="text-[13px] whitespace-nowrap">
                    {r.assignedAdminName ? (
                      <span className="text-brand-text">{r.assignedAdminName}</span>
                    ) : (
                      <span className="text-brand-muted">미지정</span>
                    )}
                  </Td>
                  <Td>
                    <Badge tone={meta.tone}>{meta.label}</Badge>
                  </Td>
                  <Td>
                    <div className="flex items-center justify-end gap-1.5">
                      <Button size="sm" variant="secondary" onClick={() => setDetail(r)}>
                        상세
                      </Button>
                      <InlineSelect value={r.status} disabled={pending} onChange={(e) => change(r.id, e.target.value)}>
                        {ALL_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {serviceRequestStatusMeta[s]?.label ?? s}
                          </option>
                        ))}
                      </InlineSelect>
                    </div>
                  </Td>
                </tr>
              );
            })}
          </TableShell>
        ) : (
          <EmptyState message="해당 조건의 신청 내역이 없습니다." />
        )}
      </Card>

      {detail && <RequestModal request={detail} onClose={() => setDetail(null)} />}
    </div>
  );
}

function RequestModal({ request, onClose }: { request: ServiceRequestRow; onClose: () => void }) {
  const [quotedAmount, setQuotedAmount] = useState(String(request.quotedAmount));
  const [contact, setContact] = useState(request.contact ?? "");
  const [adminMemo, setAdminMemo] = useState(request.adminMemo ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const inputEntries = Object.entries(request.inputs);

  const submit = () => {
    setError(null);
    startTransition(async () => {
      const res = await updateServiceRequest(request.id, { quotedAmount, contact, adminMemo });
      if ("error" in res) setError(res.error);
      else onClose();
    });
  };

  return (
    <Modal
      title={request.serviceName}
      description={`${request.userName} · ${request.userEmail}`}
      onClose={onClose}
      width="max-w-[560px]"
      footer={<ModalFooter onClose={onClose} onSubmit={submit} pending={pending} />}
    >
      {inputEntries.length > 0 && (
        <div className="rounded-xl border border-brand-border bg-brand-light p-4">
          <p className="text-[13px] font-semibold text-brand-dark mb-2">신청 내용</p>
          <dl className="space-y-1.5">
            {inputEntries.map(([key, value]) => (
              <div key={key} className="flex gap-3 text-[13px]">
                <dt className="text-brand-sub shrink-0 min-w-[90px]">{key}</dt>
                <dd className="text-brand-dark break-all">{String(value)}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Field label="견적 금액 (원)">
          <Input value={quotedAmount} onChange={(e) => setQuotedAmount(e.target.value)} inputMode="numeric" />
        </Field>
        <Field label="연락처">
          <Input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="010-0000-0000" />
        </Field>
      </div>

      <Field label="상담 메모">
        <Textarea value={adminMemo} onChange={(e) => setAdminMemo(e.target.value)} className="min-h-[100px]" />
      </Field>

      {error && <Notice ok={false}>{error}</Notice>}
    </Modal>
  );
}
