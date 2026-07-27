"use client";

import { useEffect, useState, useTransition } from "react";
import {
  Modal, Button, Badge, Tabs, Textarea, Notice, EmptyState, Th, Td,
} from "@/components/admin/ui";
import {
  formatKRW, formatDate, formatDateTime,
  roleMeta, pointChargeStatusMeta, paymentStatusMeta, chargeMethodLabel,
} from "@/lib/admin-format";
import { getMemberDetail, updateMemberMemo, type MemberDetail } from "@/app/(platform)/admin/(console)/actions";

const fileSize = (bytes: number | null) => {
  if (!bytes) return "";
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)}MB` : `${Math.round(bytes / 1024)}KB`;
};

export function MemberDetailModal({ userId, onClose }: { userId: string; onClose: () => void }) {
  const [detail, setDetail] = useState<MemberDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState("profile");

  useEffect(() => {
    let alive = true;
    getMemberDetail(userId).then((res) => {
      if (!alive) return;
      if ("error" in res) setError(res.error);
      else setDetail(res);
    });
    return () => {
      alive = false;
    };
  }, [userId]);

  const title = detail ? detail.user.name : "회원 상세";
  const roleTone = detail ? (roleMeta[detail.user.role]?.tone ?? "gray") : "gray";

  return (
    <Modal
      title={title}
      description={detail ? detail.user.email : undefined}
      onClose={onClose}
      width="max-w-[760px]"
      footer={
        <Button variant="ghost" className="flex-1" onClick={onClose}>
          닫기
        </Button>
      }
    >
      {error && <Notice ok={false}>{error}</Notice>}
      {!detail && !error && <p className="text-[14px] text-brand-sub py-8 text-center">불러오는 중...</p>}

      {detail && (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={roleTone}>{roleMeta[detail.user.role]?.label ?? detail.user.role}</Badge>
            <span className="text-[13px] text-brand-sub">가입 {formatDate(detail.user.createdAt)}</span>
            <span className="ml-auto text-[13px] text-brand-sub">
              포인트 잔액 <b className="text-brand-dark">{formatKRW(detail.user.creditBalance)}</b>
            </span>
          </div>

          <Tabs
            tabs={[
              { key: "profile", label: "가입 정보" },
              { key: "charges", label: "포인트 충전", count: detail.charges.length },
              { key: "payments", label: "결제 내역", count: detail.payments.length },
              { key: "ledger", label: "포인트 원장", count: detail.ledger.length },
            ]}
            value={tab}
            onChange={setTab}
          />

          {tab === "profile" && <ProfileTab detail={detail} />}
          {tab === "charges" && <ChargesTab charges={detail.charges} />}
          {tab === "payments" && <PaymentsTab payments={detail.payments} />}
          {tab === "ledger" && <LedgerTab ledger={detail.ledger} />}

          <MemoSection userId={userId} initial={detail.profile?.adminMemo ?? ""} />
        </>
      )}
    </Modal>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-3 py-2 border-b border-brand-border last:border-0">
      <dt className="text-[13px] text-brand-sub shrink-0 w-[104px]">{label}</dt>
      <dd className="text-[13.5px] text-brand-dark break-all">{value || <span className="text-brand-muted">미등록</span>}</dd>
    </div>
  );
}

function ProfileTab({ detail }: { detail: MemberDetail }) {
  const p = detail.profile;
  const doc = detail.bizDoc;

  return (
    <div className="space-y-4">
      <section>
        <p className="text-[13px] font-bold text-brand-dark mb-1">계정 · 연락처</p>
        <dl>
          <Row label="아이디" value={p?.username} />
          <Row label="이름" value={detail.user.name} />
          <Row label="이메일" value={detail.user.email} />
          <Row label="연락처" value={p?.phone} />
          <Row label="약관 동의" value={p?.agreedAt ? formatDateTime(p.agreedAt) : null} />
        </dl>
      </section>

      <section>
        <p className="text-[13px] font-bold text-brand-dark mb-1">사업자 정보</p>
        <dl>
          <Row label="조직명" value={p?.orgName} />
          <Row label="조직 유형" value={p?.orgType} />
          <Row label="사업자등록번호" value={p?.bizNumber} />
          <Row label="업태" value={p?.bizCondition} />
          <Row label="업종" value={p?.bizCategory} />
        </dl>
      </section>

      <section>
        <p className="text-[13px] font-bold text-brand-dark mb-2">사업자등록증</p>
        {doc?.url ? (
          <div className="flex items-center gap-3 p-3 rounded-xl border border-brand-border bg-brand-light">
            <span className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[13.5px] font-semibold text-brand-dark truncate">{doc.fileName ?? "사업자등록증"}</p>
              <p className="text-[12px] text-brand-muted">
                {fileSize(doc.fileSize)}
                {doc.uploadedAt && ` · ${formatDate(doc.uploadedAt)} 첨부`}
              </p>
            </div>
            <a
              href={doc.url}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-lg bg-brand-primary text-white text-[13px] font-semibold whitespace-nowrap"
            >
              열기
            </a>
          </div>
        ) : (
          <div className="p-3 rounded-xl border border-dashed border-brand-border-strong text-[13px] text-brand-muted">
            첨부된 사업자등록증이 없습니다.
          </div>
        )}
        {doc?.url && (
          <p className="text-[11.5px] text-brand-muted mt-1.5">
            보안을 위해 10분간만 유효한 링크입니다. 만료되면 모달을 다시 열어주세요.
          </p>
        )}
      </section>
    </div>
  );
}

function MiniTable({ head, children }: { head: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="max-h-[260px] overflow-auto rounded-xl border border-brand-border">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr>{head}</tr>
        </thead>
        <tbody className="divide-y divide-brand-border">{children}</tbody>
      </table>
    </div>
  );
}

const stickyTh = "sticky top-0 z-10 bg-[#F5F6F8] border-b border-brand-border";

function ChargesTab({ charges }: { charges: MemberDetail["charges"] }) {
  if (!charges.length) return <EmptyState message="포인트 충전 내역이 없습니다." />;
  return (
    <MiniTable
      head={
        <>
          <Th className={stickyTh}>신청일</Th>
          <Th className={stickyTh}>수단</Th>
          <Th className={`${stickyTh} text-right`}>금액</Th>
          <Th className={stickyTh}>상태</Th>
          <Th className={stickyTh}>비고</Th>
        </>
      }
    >
      {charges.map((c) => {
        const meta = pointChargeStatusMeta[c.status] ?? { label: c.status, tone: "gray" as const };
        return (
          <tr key={c.id}>
            <Td className="whitespace-nowrap text-brand-sub">{formatDate(c.createdAt)}</Td>
            <Td>{chargeMethodLabel[c.method] ?? c.method}</Td>
            <Td className="text-right tabular-nums">
              <div className="font-semibold text-brand-dark">{formatKRW(c.amount)}</div>
              {c.bonusAmount > 0 && (
                <div className="text-[11.5px] text-brand-muted">보너스 +{formatKRW(c.bonusAmount)}</div>
              )}
            </Td>
            <Td>
              <Badge tone={meta.tone}>{meta.label}</Badge>
            </Td>
            <Td className="text-[12.5px] text-brand-sub">{c.memo ?? "-"}</Td>
          </tr>
        );
      })}
    </MiniTable>
  );
}

function PaymentsTab({ payments }: { payments: MemberDetail["payments"] }) {
  if (!payments.length) return <EmptyState message="결제 내역이 없습니다." />;
  return (
    <MiniTable
      head={
        <>
          <Th className={stickyTh}>결제일</Th>
          <Th className={stickyTh}>수단</Th>
          <Th className={`${stickyTh} text-right`}>금액</Th>
          <Th className={stickyTh}>상태</Th>
        </>
      }
    >
      {payments.map((o) => {
        const meta = paymentStatusMeta[o.status] ?? { label: o.status, tone: "gray" as const };
        return (
          <tr key={o.id}>
            <Td className="whitespace-nowrap text-brand-sub">{formatDate(o.createdAt)}</Td>
            <Td>{o.method ?? "-"}</Td>
            <Td className="text-right tabular-nums font-semibold text-brand-dark">{formatKRW(o.amount)}</Td>
            <Td>
              <Badge tone={meta.tone}>{meta.label}</Badge>
            </Td>
          </tr>
        );
      })}
    </MiniTable>
  );
}

function LedgerTab({ ledger }: { ledger: MemberDetail["ledger"] }) {
  if (!ledger.length) return <EmptyState message="포인트 원장 기록이 없습니다." />;
  return (
    <MiniTable
      head={
        <>
          <Th className={stickyTh}>일시</Th>
          <Th className={`${stickyTh} text-right`}>증감</Th>
          <Th className={stickyTh}>사유</Th>
        </>
      }
    >
      {ledger.map((l) => (
        <tr key={l.id}>
          <Td className="whitespace-nowrap text-brand-sub">{formatDateTime(l.createdAt)}</Td>
          <Td
            className={`text-right tabular-nums font-semibold ${
              l.delta >= 0 ? "text-brand-success" : "text-brand-error"
            }`}
          >
            {l.delta >= 0 ? "+" : "−"}
            {formatKRW(Math.abs(l.delta))}
          </Td>
          <Td className="text-[12.5px] text-brand-sub">{l.reason ?? "-"}</Td>
        </tr>
      ))}
    </MiniTable>
  );
}

function MemoSection({ userId, initial }: { userId: string; initial: string }) {
  const [memo, setMemo] = useState(initial);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [pending, startTransition] = useTransition();

  const save = () => {
    setMsg(null);
    startTransition(async () => {
      const res = await updateMemberMemo(userId, memo);
      setMsg({ text: "error" in res ? res.error : "저장되었습니다.", ok: !("error" in res) });
    });
  };

  return (
    <section className="pt-2 border-t border-brand-border">
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-[13px] font-bold text-brand-dark">비고사항</p>
        <Button size="sm" variant="secondary" disabled={pending || memo === initial} onClick={save}>
          {pending ? "저장 중..." : "저장"}
        </Button>
      </div>
      <Textarea
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
        className="min-h-[80px]"
        placeholder="관리자만 보는 메모입니다. (예: 세금계산서 발행 요청, 특이사항)"
      />
      {msg && <Notice ok={msg.ok}>{msg.text}</Notice>}
    </section>
  );
}
