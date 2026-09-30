"use client";

/**
 * 그룹 묶어보기 UI — 목록 화면이 공유한다.
 *
 * 통합순위관리에만 있던 기능을 캠페인 관리 화면들로 옮기면서 공용으로 뺐다.
 * 상태와 저장은 `lib/item-groups.ts` 가 맡고, 여기는 화면만 그린다.
 *
 * 항목 편성은 드래그가 아니라 체크박스 모달로 한다. 목록이 <table> 이라
 * 행을 그룹 헤더로 끌어다 놓는 동작이 터치 기기에서 특히 불안정하고,
 * 여러 건을 한 번에 옮길 때도 모달 쪽이 빠르다.
 */

import { useEffect, useState } from "react";
import type { ItemGroup } from "@/lib/item-groups";

/* ────────────────────────────────────────────────────────────
   그룹 바 — 목록 위에 놓는 줄
──────────────────────────────────────────────────────────── */

export function ItemGroupBar({
  groups,
  onAdd,
  className = "",
}: {
  groups: ItemGroup[];
  onAdd: (name: string) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");

  const submit = () => {
    if (!name.trim()) return;
    onAdd(name);
    setName("");
    setOpen(false);
  };

  return (
    <div
      /* 모바일에서는 위 필터 블록과 아래 표 사이에 끼어 경계가 흐려진다.
         라이트 그레이를 깔아 한 덩어리로 읽히게 한다.
         데스크톱은 표 헤더가 이미 같은 회색이라 맞붙으면 구분이 사라져 흰 배경을 유지한다. */
      className={`flex items-center justify-start md:justify-end gap-3 flex-wrap bg-brand-lighter md:bg-transparent ${className}`}
    >
      <p className="text-[13px] text-brand-sub">
        {groups.length > 0 ? (
          <>
            <b className="font-bold text-brand-dark">{groups.length}개 그룹</b>으로 묶어 보고 있습니다
          </>
        ) : (
          <b className="font-bold text-brand-dark">키워드별로 그룹 만들기</b>
        )}
      </p>

      {open ? (
        <div className="flex items-center gap-1.5">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
              if (e.key === "Escape") { setOpen(false); setName(""); }
            }}
            maxLength={20}
            placeholder="예: 강남점 · 여름 시즌"
            className="w-[180px] px-3 py-2 rounded-lg border border-brand-border text-[13px] bg-white focus:outline-none focus:border-[#2452EB]"
          />
          <button
            onClick={submit}
            className="px-3 py-2 rounded-lg text-[13px] font-bold text-white"
            style={{ background: "var(--gradient-point)" }}
          >
            만들기
          </button>
          <button
            onClick={() => { setOpen(false); setName(""); }}
            className="px-3 py-2 rounded-lg text-[13px] font-semibold border border-brand-border text-brand-sub hover:bg-brand-lighter"
          >
            취소
          </button>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="px-3.5 py-2 rounded-lg text-[13px] font-bold border border-brand-border bg-white text-brand-text hover:bg-brand-lighter transition-colors"
        >
          + 그룹 만들기
        </button>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   그룹 머리글 — 표 안에 한 줄로 들어간다
──────────────────────────────────────────────────────────── */

export function ItemGroupHeaderRow({
  colSpan,
  name,
  count,
  unitLabel = "건",
  onPick,
  onRename,
  onRemove,
}: {
  colSpan: number;
  /** null 이면 미분류 */
  name: string | null;
  count: number;
  unitLabel?: string;
  onPick?: () => void;
  onRename?: () => void;
  onRemove?: () => void;
}) {
  const isNone = name === null;
  return (
    <tr>
      <td colSpan={colSpan} className="px-5 md:px-6 pt-4 pb-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="h-6 w-6 rounded-md bg-brand-lighter flex items-center justify-center shrink-0">
            <svg className="w-3.5 h-3.5 text-brand-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.9}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
            </svg>
          </span>
          <p className={`text-[13.5px] font-bold ${isNone ? "text-brand-muted" : "text-brand-dark"}`}>
            {isNone ? "미분류" : name}
          </p>
          <span className="text-[12px] text-brand-muted">· {count}{unitLabel}</span>

          {/* 미분류는 이름을 바꾸거나 지울 수 없다 — 그룹이 아니라 "남은 것"이다 */}
          <div className="ml-auto flex items-center gap-1">
            {onPick && (
              <button onClick={onPick}
                className="px-2 py-1 rounded-md text-[11.5px] font-bold bg-brand-lighter text-brand-text hover:bg-brand-border/60 transition-colors">
                편성
              </button>
            )}
            {!isNone && onRename && (
              <button onClick={onRename}
                className="px-2 py-1 rounded-md text-[11.5px] font-bold bg-brand-lighter text-brand-text hover:bg-brand-border/60 transition-colors">
                이름
              </button>
            )}
            {!isNone && onRemove && (
              <button onClick={onRemove}
                className="px-2 py-1 rounded-md text-[11.5px] font-bold text-red-500 hover:bg-red-50 transition-colors">
                삭제
              </button>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
}

/* ────────────────────────────────────────────────────────────
   편성 모달 — 이 그룹에 넣을 항목을 고른다
──────────────────────────────────────────────────────────── */

export function ItemGroupPicker<T>({
  groupName,
  groupId,
  items,
  idOf,
  labelOf,
  subLabelOf,
  assign,
  unitLabel = "건",
  onApply,
  onClose,
}: {
  groupName: string;
  groupId: number;
  items: T[];
  idOf: (item: T) => string;
  labelOf: (item: T) => string;
  subLabelOf?: (item: T) => string;
  assign: Record<string, number>;
  unitLabel?: string;
  /** 고른 항목을 이 그룹으로, 뺀 항목을 미분류로 */
  onApply: (add: string[], remove: string[]) => void;
  onClose: () => void;
}) {
  const initial = items.filter((it) => assign[idOf(it)] === groupId).map(idOf);
  const [picked, setPicked] = useState<Set<string>>(new Set(initial));

  // ESC 로 닫기 — 모달은 키보드로도 빠져나갈 수 있어야 한다
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const toggle = (id: string) =>
    setPicked((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });

  const apply = () => {
    const add = [...picked].filter((id) => assign[id] !== groupId);
    const remove = initial.filter((id) => !picked.has(id));
    onApply(add, remove);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button className="absolute inset-0 bg-black/40" onClick={onClose} aria-label="닫기" />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-brand-border">
          <p className="text-[16px] font-bold text-brand-dark">{groupName} · 편성</p>
          <p className="text-[13px] text-brand-sub mt-0.5">이 그룹에 넣을 항목을 고르세요.</p>
        </div>

        <div className="max-h-[52vh] overflow-y-auto p-2">
          {items.length === 0 && (
            <p className="px-3 py-10 text-center text-[13.5px] text-brand-muted">편성할 항목이 없습니다.</p>
          )}
          {items.map((it) => {
            const id = idOf(it);
            const mine = picked.has(id);
            // 다른 그룹에 있는 항목도 고를 수 있다 — 고르면 이쪽으로 옮겨온다
            const other = assign[id] != null && assign[id] !== groupId;
            return (
              <label
                key={id}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-brand-lighter transition-colors"
              >
                <input type="checkbox" checked={mine} onChange={() => toggle(id)} className="h-4 w-4 shrink-0 accent-[#2452EB]" />
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-semibold text-brand-dark truncate">{labelOf(it)}</span>
                  {subLabelOf && <span className="block text-[12px] text-brand-muted truncate">{subLabelOf(it)}</span>}
                </span>
                {other && (
                  <span className="shrink-0 text-[11px] font-bold px-1.5 py-0.5 rounded-md bg-brand-lighter text-brand-muted">
                    다른 그룹
                  </span>
                )}
              </label>
            );
          })}
        </div>

        <div className="flex items-center gap-2 px-5 py-4 border-t border-brand-border">
          <span className="text-[13px] text-brand-sub">{picked.size}{unitLabel} 선택</span>
          <button onClick={onClose}
            className="ml-auto px-4 py-2 rounded-lg text-[13.5px] font-semibold border border-brand-border text-brand-sub hover:bg-brand-lighter">
            취소
          </button>
          <button onClick={apply}
            className="px-4 py-2 rounded-lg text-[13.5px] font-bold text-white"
            style={{ background: "var(--gradient-point)" }}>
            적용
          </button>
        </div>
      </div>
    </div>
  );
}
