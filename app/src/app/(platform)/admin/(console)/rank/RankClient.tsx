"use client";

import { useMemo, useState, useTransition } from "react";
import {
  Card, TableShell, Th, Td, EmptyState, Badge, Tabs, SearchInput,
  Button, Modal, ModalFooter, Field, Input, Select, Notice,
} from "@/components/admin/ui";
import { PricingPanel, type PricingRuleRow } from "@/components/admin/PricingPanel";
import { formatKRW, formatDate, formatDateTime, rankPlatformMeta, rankDelta } from "@/lib/admin-format";
import {
  FREE_KEYWORD_LIMIT, MEMBERSHIP_MONTHLY_FEE, MEMBERSHIP_STATUS_META, RENEWAL_NOTICE_DAYS,
  type MembershipView,
} from "@/lib/rank-membership";
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
  /** 멤버십이 없어 추적이 잠긴 키워드 (처음 등록한 1개만 무료) */
  locked: boolean;
};

export type UserOption = { id: string; name: string; email: string };

/** 회원 한 줄 — 멤버십과 키워드 사용량을 함께 본다 */
export type MemberRow = {
  userId: string;
  userName: string;
  userEmail: string;
  orgName: string | null;
  phone: string | null;
  keywordCount: number;
  /** 지금 멤버십이 살아 있는지 (상태 + 만료일 반영) */
  live: boolean;
  /** 무료 한도를 넘겨 추적이 멈춘 키워드 수 */
  overLimit: number;
  /** 만료 3일 전 — 연장 안내 대상 */
  renewalDue: boolean;
  /** 만료까지 남은 일수 (무기한이면 null) */
  daysLeft: number | null;
  membership: MembershipView | null;
};

const VIEW_TABS = [
  { key: "members", label: "멤버십" },
  { key: "keywords", label: "키워드 현황" },
  { key: "pricing", label: "과금 설정" },
];

/** 멤버십 여부로 거르는 필터 */
const MEMBER_FILTERS = [
  { key: "all", label: "전체" },
  { key: "renewal", label: `연장 안내 (D-${RENEWAL_NOTICE_DAYS})` },
  { key: "live", label: "멤버십" },
  { key: "free", label: "무료" },
];

const PLATFORM_TABS = [
  { key: "all", label: "전체" },
  { key: "place", label: "플레이스" },
  { key: "shopping", label: "네이버쇼핑" },
  { key: "coupang", label: "쿠팡" },
];

export function RankClient({
  rows,
  members,
  users,
  rules,
  presets,
}: {
  rows: RankKeywordRow[];
  members: MemberRow[];
  users: UserOption[];
  rules: PricingRuleRow[];
  presets: { key: string; label: string; unit?: string }[];
}) {
  // 멤버십 관리가 이 화면의 주 업무라 기본 탭으로 둔다
  const [view, setView] = useState("members");
  const [memberFilter, setMemberFilter] = useState("all");
  const [memberQuery, setMemberQuery] = useState("");
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

  const memberCounts = useMemo(
    () => ({
      all: members.length,
      renewal: members.filter((m) => m.renewalDue).length,
      live: members.filter((m) => m.live).length,
      free: members.filter((m) => !m.live).length,
    }),
    [members],
  );

  const visibleMembers = useMemo(() => {
    const q = memberQuery.trim().toLowerCase();
    return members
      .filter((m) => {
        if (memberFilter === "renewal" && !m.renewalDue) return false;
        if (memberFilter === "live" && !m.live) return false;
        if (memberFilter === "free" && m.live) return false;
        if (!q) return true;
        return (
          m.userName.toLowerCase().includes(q) ||
          m.userEmail.toLowerCase().includes(q) ||
          (m.orgName ?? "").toLowerCase().includes(q) ||
          (m.phone ?? "").includes(q)
        );
      })
      // 손이 필요한 순서: 연장 임박 → 잠긴 키워드 → 멤버십 → 키워드 많은 순
      .sort((a, b) => {
        const renewal = (b.renewalDue ? 1 : 0) - (a.renewalDue ? 1 : 0);
        if (renewal !== 0) return renewal;
        const over = (b.overLimit > 0 ? 1 : 0) - (a.overLimit > 0 ? 1 : 0);
        if (over !== 0) return over;
        if (a.live !== b.live) return a.live ? -1 : 1;
        return b.keywordCount - a.keywordCount;
      });
  }, [members, memberFilter, memberQuery]);

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
        {view === "members" && (
          <div className="md:ml-auto flex gap-2">
            <SearchInput
              value={memberQuery}
              onChange={setMemberQuery}
              placeholder="회원 · 회사명 · 연락처 검색"
              className="md:w-64"
            />
          </div>
        )}
      </div>

      {view === "members" ? (
        <MembersPanel
          members={visibleMembers}
          filter={memberFilter}
          onFilter={setMemberFilter}
          counts={memberCounts}
        />
      ) : view === "pricing" ? (
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
                    <tr
                      key={r.id}
                      className={`hover:bg-brand-light/50 transition-colors ${
                        r.locked
                          ? "bg-red-50/40 [&>td:first-child]:border-l-[3px] [&>td:first-child]:border-red-400"
                          : ""
                      }`}
                    >
                      <Td>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-brand-dark">{r.keyword}</span>
                        </div>
                        {r.targetName && <div className="text-[12.5px] text-brand-muted">{r.targetName}</div>}
                        {msg?.id === r.id && <Notice ok={msg.ok}>{msg.text}</Notice>}
                      </Td>
                      <Td>
                        <div className="text-brand-dark">{r.userName}</div>
                        <div className="text-[12px] text-brand-muted">
                          {seq === 1 ? "1번째 (무료 대상)" : `${seq}번째`}
                        </div>
                        {r.locked && (
                          <div className="text-[11.5px] font-semibold text-red-500">멤버십 없음 · 추적 중지</div>
                        )}
                        {/* 정책(1개 무료 / 2개째부터 유료)과 실제 과금이 어긋나면 표시 */}
                        {!r.locked && seq === 1 && r.isPaid && (
                          <div className="text-[11.5px] text-brand-warning font-semibold">무료 대상인데 과금 중</div>
                        )}
                        {!r.locked && seq > 1 && !r.isPaid && (
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
                        <Badge tone={r.locked ? "red" : r.isActive ? "green" : "gray"}>
                          {r.locked ? "잠김" : r.isActive ? "추적중" : "중지"}
                        </Badge>
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

/**
 * 멤버십 현황 — 회원 한 명이 한 줄.
 * 무료 한도(1개)를 넘겼는데 멤버십이 없는 회원이 곧 처리 대상이라 맨 위로 올린다.
 */
function MembersPanel({
  members,
  filter,
  onFilter,
  counts,
}: {
  members: MemberRow[];
  filter: string;
  onFilter: (key: string) => void;
  counts: Record<string, number>;
}) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-brand-border flex-wrap">
        {MEMBER_FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => onFilter(f.key)}
            className={`px-3 py-1.5 rounded-xl text-[13px] font-bold transition-all ${
              filter === f.key
                ? "bg-brand-primary text-white"
                : "bg-brand-light text-brand-sub hover:bg-brand-border"
            }`}
          >
            {f.label}
            <span className="ml-1.5 tabular-nums opacity-70">{counts[f.key] ?? 0}</span>
          </button>
        ))}
        {/* 부여 버튼이 없는 이유를 화면에 적어 둔다 — 결제는 고객이 직접 한다 */}
        <span className="ml-auto text-[12.5px] text-brand-muted">
          멤버십은 고객이 포인트로 직접 결제합니다 · 월{" "}
          <span className="font-bold text-brand-dark">{formatKRW(MEMBERSHIP_MONTHLY_FEE)}</span>
        </span>
      </div>

      {/* 만료 3일 전 회원 — 연장 안내를 보내야 하는 대상 */}
      {(counts.renewal ?? 0) > 0 && filter !== "renewal" && (
        <button
          onClick={() => onFilter("renewal")}
          className="w-full flex items-center gap-2 px-5 py-3 bg-amber-50 border-b border-amber-200 text-left hover:bg-amber-100 transition-colors"
        >
          <span className="text-[13px] font-bold text-amber-700">
            연장 안내 대상 {counts.renewal}명
          </span>
          <span className="text-[12.5px] text-amber-600">
            멤버십 만료 {RENEWAL_NOTICE_DAYS}일 전입니다. 연장하지 않으면 처음 등록한 키워드 1개만 남고 나머지는 잠깁니다.
          </span>
          <span className="ml-auto text-[12.5px] font-bold text-amber-700">보기 →</span>
        </button>
      )}

      {members.length ? (
        <>
          <TableShell
            head={
              <>
                <Th>회원</Th>
                <Th>연락처</Th>
                <Th className="text-center">키워드</Th>
                <Th>멤버십</Th>
                <Th>결제일</Th>
                <Th>이용 기간</Th>
                <Th className="text-right">월 요금</Th>
              </>
            }
          >
            {members.map((m) => (
              <MemberRowView key={m.userId} member={m} />
            ))}
          </TableShell>
          <div className="px-5 py-3 border-t border-brand-border text-[12.5px] text-brand-muted">
            총 <span className="font-bold text-brand-dark">{members.length}</span>명
          </div>
        </>
      ) : (
        <EmptyState message="해당 조건의 회원이 없습니다." />
      )}
    </Card>
  );
}

// 멤버십은 고객이 포인트로 직접 결제한다 — 어드민에서는 손대지 않고 현황만 본다
function MemberRowView({ member }: { member: MemberRow }) {
  const m = member.membership;
  const meta = m ? MEMBERSHIP_STATUS_META[m.status] : null;

  return (
    <tr
      className={`hover:bg-brand-light/50 transition-colors align-top ${
        member.renewalDue
          ? "[&>td:first-child]:border-l-[3px] [&>td:first-child]:border-amber-400"
          : member.overLimit > 0
            ? "[&>td:first-child]:border-l-[3px] [&>td:first-child]:border-red-400"
            : ""
      }`}
    >
      <Td>
        <div className="font-semibold text-brand-dark">{member.orgName ?? member.userName}</div>
        <div className="text-[12px] text-brand-muted">{member.userEmail}</div>
      </Td>
      <Td className="text-[13px] text-brand-text tabular-nums">
        {member.phone || <span className="text-brand-muted">미등록</span>}
      </Td>
      <Td className="text-center">
        <div className="tabular-nums font-semibold text-brand-dark">
          {member.keywordCount}
          <span className="text-[12px] font-medium text-brand-muted">
            {member.live ? " / 무제한" : ` / ${FREE_KEYWORD_LIMIT}`}
          </span>
        </div>
        {/* 멤버십이 없는데 무료 한도를 넘긴 건 — 추적이 멈춘 상태라 눈에 띄어야 한다 */}
        {member.overLimit > 0 && (
          <div className="text-[12px] font-semibold text-red-500">{member.overLimit}개 잠김</div>
        )}
      </Td>
      <Td>
        {member.live && meta ? (
          <Badge tone={meta.tone}>{meta.label}</Badge>
        ) : m ? (
          <Badge tone={MEMBERSHIP_STATUS_META[m.status]?.tone ?? "gray"}>
            {m.status === "active" ? "만료" : (MEMBERSHIP_STATUS_META[m.status]?.label ?? m.status)}
          </Badge>
        ) : (
          <Badge tone="gray">무료</Badge>
        )}
      </Td>
      {/* 사용자가 직접 결제하므로 언제 냈는지가 갱신 판단의 기준이 된다 */}
      <Td className="text-[12.5px] whitespace-nowrap">
        {m?.paidAt ? (
          <span className="font-semibold text-brand-dark">{formatDate(m.paidAt)}</span>
        ) : (
          <span className="text-brand-muted">{m ? "미기록" : "-"}</span>
        )}
      </Td>
      <Td className="text-[12.5px] text-brand-sub whitespace-nowrap">
        {m ? (
          <>
            {formatDate(m.startDate)}
            <br />~ {m.endDate ? formatDate(m.endDate) : "무기한"}
            {/* 만료 3일 전부터 연장 안내가 나간다 */}
            {member.renewalDue && member.daysLeft != null && (
              <div className="mt-0.5 text-[12px] font-bold text-amber-600">
                {member.daysLeft === 0 ? "오늘 만료" : `D-${member.daysLeft} 연장 안내`}
              </div>
            )}
          </>
        ) : (
          <span className="text-brand-muted">-</span>
        )}
      </Td>
      <Td className="text-right tabular-nums text-brand-dark">
        {m ? formatKRW(m.monthlyFee) : <span className="text-brand-muted">-</span>}
      </Td>
    </tr>
  );
}
