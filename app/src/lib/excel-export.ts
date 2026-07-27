"use client";

import * as XLSX from "xlsx";

/**
 * 관리 화면 공용 엑셀 내보내기.
 * 신청접수 건을 그대로 시트로 떨어뜨려 담당자 배정·정산 자료로 쓴다.
 * 헤더는 화면에 보이는 한글 컬럼명을 그대로 쓰고, 파일명에 날짜를 붙여 덮어쓰기를 막는다.
 */
export function exportToExcel({
  rows,
  fileName,
  sheetName = "신청접수",
}: {
  /** 한글 컬럼명 → 값. 키 순서가 곧 시트 컬럼 순서다 */
  rows: Record<string, string | number>[];
  fileName: string;
  sheetName?: string;
}) {
  const sheet = XLSX.utils.json_to_sheet(rows);

  // 컬럼 너비를 값 길이에 맞춰 잡아 준다 (한글은 대략 2칸)
  const width = (v: unknown) => String(v ?? "").replace(/[가-힣]/g, "aa").length;
  const headers = Object.keys(rows[0] ?? {});
  sheet["!cols"] = headers.map((h) => ({
    wch: Math.min(40, Math.max(width(h) + 2, ...rows.map((r) => width(r[h]) + 2))),
  }));

  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, sheetName);
  XLSX.writeFile(book, `${fileName}_${stamp()}.xlsx`);
}

/** 파일명용 날짜 (KST 기준 YYYYMMDD) */
function stamp() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  return parts.replace(/-/g, "");
}
