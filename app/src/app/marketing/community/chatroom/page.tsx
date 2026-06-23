"use client";

import { useState } from "react";

const MOCK_ROOMS = [
  {
    id: 1,
    name: "공식 마케팅 채널",
    platform: "카카오",
    members: 1284,
    status: "활성",
    lastMessage: "안녕하세요! 새로운 캠페인 안내드립니다.",
    lastTime: "10분 전",
    unread: 3,
    color: "#FEE500",
    textColor: "#3A1D1D",
  },
  {
    id: 2,
    name: "쇼핑 리워드 VIP",
    platform: "카카오",
    members: 92,
    status: "활성",
    lastMessage: "이번 달 리워드 지급 완료됐습니다.",
    lastTime: "1시간 전",
    unread: 0,
    color: "#FEE500",
    textColor: "#3A1D1D",
  },
  {
    id: 3,
    name: "플레이스 리워드 알림",
    platform: "네이버",
    members: 348,
    status: "활성",
    lastMessage: "오늘 방문 미션 리워드가 지급되었습니다.",
    lastTime: "3시간 전",
    unread: 1,
    color: "#03C75A",
    textColor: "#FFFFFF",
  },
  {
    id: 4,
    name: "META 캠페인 리포트",
    platform: "카카오",
    members: 27,
    status: "일시정지",
    lastMessage: "이번 주 리포트를 확인해주세요.",
    lastTime: "2일 전",
    unread: 0,
    color: "#FEE500",
    textColor: "#3A1D1D",
  },
];

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  활성: { bg: "bg-green-50", text: "text-green-600" },
  일시정지: { bg: "bg-amber-50", text: "text-amber-600" },
  종료: { bg: "bg-gray-100", text: "text-gray-400" },
};

export default function ChatroomPage() {
  const [activeTab, setActiveTab] = useState<"all" | "kakao" | "naver">("all");

  const filtered = MOCK_ROOMS.filter((r) => {
    if (activeTab === "kakao") return r.platform === "카카오";
    if (activeTab === "naver") return r.platform === "네이버";
    return true;
  });

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-6">

      {/* 헤더 */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-extrabold text-brand-muted uppercase tracking-widest mb-1">DIVERZ Community</p>
          <h1 className="text-[28px] font-extrabold text-brand-dark mb-2">채팅방 관리</h1>
          <p className="text-[14px] text-brand-sub">운영 중인 채팅방을 한곳에서 관리하세요.</p>
        </div>
        <button className="shrink-0 mt-1 px-4 py-2.5 rounded-xl text-[13px] font-bold bg-brand-primary text-white hover:bg-blue-600 transition-colors">
          + 채팅방 추가
        </button>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "전체 채팅방", value: MOCK_ROOMS.length, unit: "개", color: "text-brand-dark" },
          { label: "활성 채팅방", value: MOCK_ROOMS.filter((r) => r.status === "활성").length, unit: "개", color: "text-green-600" },
          { label: "전체 멤버", value: MOCK_ROOMS.reduce((s, r) => s + r.members, 0).toLocaleString(), unit: "명", color: "text-brand-primary" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-brand-border bg-white p-4 text-center">
            <p className={`text-[22px] font-extrabold leading-tight ${stat.color}`}>{stat.value}<span className="text-[13px] font-medium text-brand-muted ml-0.5">{stat.unit}</span></p>
            <p className="text-[11px] text-brand-sub mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* 탭 필터 */}
      <div className="flex gap-1.5">
        {(["all", "kakao", "naver"] as const).map((tab) => {
          const labels = { all: "전체", kakao: "카카오", naver: "네이버" };
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-[12px] font-semibold transition-all ${
                activeTab === tab
                  ? "bg-brand-primary text-white"
                  : "bg-brand-lighter text-brand-sub hover:bg-brand-border"
              }`}
            >
              {labels[tab]}
            </button>
          );
        })}
      </div>

      {/* 채팅방 목록 */}
      <div className="space-y-3">
        {filtered.map((room) => {
          const statusColor = STATUS_COLORS[room.status] ?? STATUS_COLORS["종료"];
          return (
            <div
              key={room.id}
              className="rounded-2xl border border-brand-border bg-white p-5 hover:shadow-md hover:border-brand-primary/30 transition-all"
            >
              <div className="flex items-start gap-4">
                {/* 플랫폼 아이콘 */}
                <div
                  className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0 text-lg font-extrabold"
                  style={{ background: room.color, color: room.textColor }}
                >
                  {room.platform === "카카오" ? "K" : "N"}
                </div>

                {/* 정보 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[14px] font-bold text-brand-dark truncate">{room.name}</span>
                    <span className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${statusColor.bg} ${statusColor.text}`}>
                      {room.status}
                    </span>
                    {room.unread > 0 && (
                      <span className="shrink-0 h-5 min-w-5 px-1.5 rounded-full bg-brand-primary text-white text-[10px] font-bold flex items-center justify-center">
                        {room.unread}
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] text-brand-sub truncate mb-2">{room.lastMessage}</p>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-brand-muted">{room.platform}</span>
                    <span className="text-[11px] text-brand-muted">·</span>
                    <span className="text-[11px] text-brand-muted">멤버 {room.members.toLocaleString()}명</span>
                    <span className="text-[11px] text-brand-muted">·</span>
                    <span className="text-[11px] text-brand-muted">{room.lastTime}</span>
                  </div>
                </div>

                {/* 액션 버튼 */}
                <div className="shrink-0 flex flex-col gap-2">
                  <button className="px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-brand-lighter text-brand-sub hover:bg-brand-border transition-colors">
                    입장
                  </button>
                  <button className="px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-brand-lighter text-brand-sub hover:bg-brand-border transition-colors">
                    설정
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 채팅방 추가 안내 */}
      <div className="rounded-2xl border border-dashed border-brand-border p-6 text-center">
        <p className="text-[22px] mb-2">➕</p>
        <p className="text-[14px] font-bold text-brand-dark mb-1">채팅방을 추가하세요</p>
        <p className="text-[12px] text-brand-sub mb-4">카카오 오픈채팅 또는 네이버 카페 채팅방을 연결하여 한 곳에서 관리할 수 있습니다.</p>
        <button className="px-5 py-2.5 rounded-xl text-[13px] font-bold bg-brand-dark text-white hover:bg-brand-dark/80 transition-colors">
          채팅방 연결하기
        </button>
      </div>

    </div>
  );
}
