"use client";

import { useMemo, useState, useTransition } from "react";
import {
  Card, TableShell, Th, Td, EmptyState, Badge, Tabs, SearchInput,
  Button, Modal, ModalFooter, Field, Input, Select, Notice,
} from "@/components/admin/ui";
import { PricingPanel, type PricingRuleRow } from "@/components/admin/PricingPanel";
import { formatKRW, formatDateTime, rankPlatformMeta, rankDelta } from "@/lib/admin-format";
import {
  upsertRankKeyword, setKeywordBilling, updateKeywordRank, toggleKeywordActive, deleteRankKeyword,
  type RankKeywordInput,
} from "../actions";

export type RankKeywordRow = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  platform: string;
  keyword: string;
  targetName: string | null;
  targetUrl: string | null;
  isPaid: boolean;
  monthlyFee: number;
  currentRank: number | null;
  previousRank: number | null;
  lastCheckedAt: string | null;
  isActive: boolean;
};

export type UserOption = { id: string; name: string; email: string };

const VIEW_TABS = [
  { key: "keywords", label: "키워드 현황" },
  { key: "pricing", label: "과금 설정" },
];

const PLATFORM_TABS = [
  { key: "all", label: "전체" },
  { key: "place", label: "플레이스" },
  { key: "shopping", label: "네이버쇼핑" },
  { key: "coupang", label: "쿠팡" },
];

export function RankClient({
  rows,
  users,
  rules,
  presets,
}: {
  rows: RankKeywordRow[];
  users: UserOption[];
  rules: PricingRuleRow[];
  presets: { key: string; label: string; unit?: string }[];
}) {
  const [view, setView] = useState("keywords");
  const [platform, setPlatform] = useState("all");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<RankKeywordRow | "new" | null>(null);
  const [billingTarget, setBillingTarget] = useState<RankKeywordRow | null>(null);
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ id: string; text: string; ok: boolean } | null>(null);

  // 회원별 키워드 순번 — 1개째는 무료 대상임을 표시
  const keywordIndexByUser = useMemo(() => {
    const counter: Record<string, number> = {};
    const map: Record<string, number> = {};
    // 오래된 키워드가 먼저 등록된 것으로 보고 역순으로 번호 부여
    for (const r of [...rows].reverse()) {
      counter[r.userId] = (counter[r.userId] ?? 0) + 1;
      map[r.id] = counter[r.userId];
    }
    return map;
  }, [rows]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: rows.length };
    for (const r of rows) c[r.platform] = (c[r.platform] ?? 0) + 1;
    return c;
  }, [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (platform !== "all" && r.platform !== platform) return false;
      if (!q) return true;
      return (
        r.keyword.toLowerCase().includes(q) ||
        r.userName.toLowerCase().includes(q) ||
        (r.targetName ?? "").toLowerCase().includes(q)
      );
    });
  }, [rows, platform, query]);

  const act = (id: string, fn: () => Promise<{ success: true } | { error: string }>) => {
    startTransition(async () => {
      const res = await fn();
      setMsg({ id, text: "error" in res ? res.error : "변경됨", ok: !("error" in res) });
    });
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
        <Tabs tabs={VIEW_TABS} value={view} onChange={setView} />
        {view === "keywords" && (
          <div className="md:ml-auto flex gap-2">
            <SearchInput value={query} onChange={setQuery} placeholder="키워드 · 회원 검색" className="md:w-64" />
            <Button onClick={() => setEditing("new")}>키워드 등록</Button>
          </div>
        )}
      </div>

      {view === "pricing" ? (
        <PricingPanel
          title="키워드 과금 설정"
          description="키워드 1개는 무료로 제공하고, 2개째부터 아래 금액으로 과금합니다."
          category="rank"
          rows={rules}
          presets={presets}
        />
      ) : (
        <>
          <div className="mb-4">
            <Tabs tabs={PLATFORM_TABS.map((t) => ({ ...t, count: counts[t.key] ?? 0 }))} value={platform} onChange={setPlatform} />
          </div>

          <Card>
            {filtered.length ? (
              <TableShell
                head={
                  <>
                    <Th>키워드</Th>
                    <Th>회원</Th>
                    <Th>플랫폼</Th>
                    <Th className="text-center">현재 순위</Th>
                    <Th className="text-center">변동</Th>
                    <Th className="text-right">월 과금</Th>
                    <Th>상태</Th>
                    <Th className="text-right">관리</Th>
                  </>
                }
              >
                {filtered.map((r) => {
                  const pMeta = rankPlatformMeta[r.platform] ?? { label: r.platform, tone: "gray" as const };
                  const delta = rankDelta(r.currentRank, r.previousRank);
                  const seq = keywordIndexByUser[r.id];
                  return (
                    <tr key={r.id} className="hover:bg-brand-light/50 transition-colors">
                      <Td>
                        <div className="font-semibold text-brand-dark">{r.keyword}</div>
                        {r.targetName && <div className="text-[12.5px] text-brand-muted">{r.targetName}</div>}
                        {msg?.id === r.id && <Notice ok={msg.ok}>{msg.text}</Notice>}
                      </Td>
                      <Td>
                        <div className="text-brand-dark">{r.userName}</div>
                        <div className="text-[12px] text-brand-muted">
                          {seq === 1 ? "1번째 (무료 대상)" : `${seq}번째`}
                        </div>
                        {/* 정책(1개 무료 / 2개째부터 유료)과 실제 과금이 어긋나면 표시 */}
                        {seq === 1 && r.isPaid && (
                          <div className="text-[11.5px] text-brand-warning font-semibold">무료 대상인데 과금 중</div>
                        )}
                        {seq > 1 && !r.isPaid && (
                          <div className="text-[11.5px] text-brand-warning font-semibold">과금 대상인데 무료</div>
                        )}
                      </Td>
                      <Td>
                        <Badge tone={pMeta.tone}>{pMeta.label}</Badge>
                      </Td>
                      <Td className="text-center tabular-nums font-semibold text-brand-dark">
                        {r.currentRank != null ? `${r.currentRank}위` : "-"}
                        {r.lastCheckedAt && (
                          <div className="text-[11.5px] font-normal text-brand-muted">{formatDateTime(r.lastCheckedAt)}</div>
                        )}
                      </Td>
                      <Td className="text-center">
                        {delta ? <Badge tone={delta.tone}>{delta.label}</Badge> : <span className="text-brand-muted">-</span>}
                      </Td>
                      <Td className="text-right tabular-nums">
                        {r.isPaid ? (
                          <span className="font-semibold text-brand-dark">{formatKRW(r.monthlyFee)}</span>
                        ) : (
                          <Badge tone="green">무료</Badge>
                        )}
                      </Td>
                      <Td>
                        <Badge tone={r.isActive ? "green" : "gray"}>{r.isActive ? "추적중" : "중지"}</Badge>
                      </Td>
                      <Td className="text-right">
                        <div className="flex gap-1.5 justify-end">
                          <Button size="sm" variant="secondary" onClick={() => setBillingTarget(r)}>
                            과금
                          </Button>
                          <Button size="sm" variant="secondary" onClick={() => setEditing(r)}>
                            수정
                          </Button>
                          <Button size="sm" variant="ghost" disabled={pending} onClick={() => act(r.id, () => toggleKeywordActive(r.id, !r.isActive))}>
                            {r.isActive ? "중지" : "재개"}
                          </Button>
                          <Button size="sm" variant="danger" disabled={pending} onClick={() => act(r.id, () => deleteRankKeyword(r.id))}>
                            삭제
                          </Button>
                        </div>
                      </Td>
                    </tr>
                  );
                })}
              </TableShell>
            ) : (
              <EmptyState message="등록된 키워드가 없습니다." />
            )}
          </Card>
        </>
      )}

      {editing && (
        <KeywordModal keyword={editing === "new" ? null : editing} users={users} onClose={() => setEditing(null)} />
      )}
      {billingTarget && <BillingModal keyword={billingTarget} onClose={() => setBillingTarget(null)} />}
    </div>
  );
}

function KeywordModal({
  keyword,
  users,
  onClose,
}: {
  keyword: RankKeywordRow | null;
  users: UserOption[];
  onClose: () => void;
}) {
  const [form, setForm] = useState<RankKeywordInput>({
    id: keyword?.id,
    userId: keyword?.userId ?? "",
    platform: keyword?.platform ?? "place",
    keyword: keyword?.keyword ?? "",
    targetName: keyword?.targetName ?? "",
    targetUrl: keyword?.targetUrl ?? "",
    isPaid: keyword?.isPaid ?? false,
    monthlyFee: keyword ? String(keyword.monthlyFee) : "0",
  });
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const set = <K extends keyof RankKeywordInput>(key: K, value: RankKeywordInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = () => {
    setError(null);
    startTransition(async () => {
      const res = await upsertRankKeyword(form);
      if ("error" in res) setError(res.error);
      else onClose();
    });
  };

  return (
    <Modal
      title={keyword ? "키워드 수정" : "키워드 등록"}
      onClose={onClose}
      footer={<ModalFooter onClose={onClose} onSubmit={submit} pending={pending} />}
    >
      <Field label="회원">
        <Select value={form.userId} onChange={(e) => set("userId", e.target.value)} disabled={!!keyword}>
          <option value="">회원을 선택하세요</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name} ({u.email})
            </option>
          ))}
        </Select>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="플랫폼">
          <Select value={form.platform} onChange={(e) => set("platform", e.target.value)}>
            <option value="place">네이버 플레이스</option>
            <option value="shopping">네이버 쇼핑</option>
            <option value="coupang">쿠팡</option>
          </Select>
        </Field>
        <Field label="키워드">
          <Input value={form.keyword} onChange={(e) => set("keyword", e.target.value)} placeholder="강남 맛집" />
        </Field>
      </div>

      <Field label="업체명 / 상품명">
        <Input value={form.targetName} onChange={(e) => set("targetName", e.target.value)} />
      </Field>

      <Field label="대상 URL">
        <Input value={form.targetUrl} onChange={(e) => set("targetUrl", e.target.value)} placeholder="https://" />
      </Field>

      {error && <Notice ok={false}>{error}</Notice>}
    </Modal>
  );
}

function BillingModal({ keyword, onClose }: { keyword: RankKeywordRow; onClose: () => void }) {
  const [isPaid, setIsPaid] = useState(keyword.isPaid);
  const [monthlyFee, setMonthlyFee] = useState(String(keyword.monthlyFee));
  const [currentRank, setCurrentRank] = useState(keyword.currentRank != null ? String(keyword.currentRank) : "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const submit = () => {
    setError(null);
    startTransition(async () => {
      const billing = await setKeywordBilling(keyword.id, isPaid, monthlyFee);
      if ("error" in billing) {
        setError(billing.error);
        return;
      }
      if (currentRank !== "" && currentRank !== String(keyword.currentRank ?? "")) {
        const rank = await updateKeywordRank(keyword.id, currentRank);
        if ("error" in rank) {
          setError(rank.error);
          return;
        }
      }
      onClose();
    });
  };

  return (
    <Modal
      title="과금 · 순위 설정"
      description={`${keyword.keyword} · ${keyword.userName}`}
      onClose={onClose}
      footer={<ModalFooter onClose={onClose} onSubmit={submit} pending={pending} />}
    >
      <div className="flex gap-2">
        <Button variant={isPaid ? "ghost" : "primary"} className="flex-1" onClick={() => setIsPaid(false)}>
          무료
        </Button>
        <Button variant={isPaid ? "primary" : "ghost"} className="flex-1" onClick={() => setIsPaid(true)}>
          유료
        </Button>
      </div>

      {isPaid && (
        <Field label="월 과금액 (원)">
          <Input value={monthlyFee} onChange={(e) => setMonthlyFee(e.target.value)} inputMode="numeric" placeholder="30000" />
        </Field>
      )}

      <Field label="현재 순위" hint="입력 시 기존 순위가 이전 순위로 기록되어 변동이 계산됩니다.">
        <Input value={currentRank} onChange={(e) => setCurrentRank(e.target.value)} inputMode="numeric" placeholder="3" />
      </Field>

      {error && <Notice ok={false}>{error}</Notice>}
    </Modal>
  );
}
