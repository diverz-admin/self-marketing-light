"use client";

const MOCK_ROOMS = [
  {
    id: 1,
    name: "DIVERZ 마케터 오픈채팅",
    desc: "마케팅 노하우 공유, 질문 환영",
    members: 1284,
    category: "마케팅 종합",
    color: "#FEE500",
    textColor: "#3A1D1D",
    icon: "💬",
    tag: "공식",
  },
  {
    id: 2,
    name: "네이버 광고 스터디",
    desc: "SA 광고, 쇼핑 광고, 플레이스 최적화",
    members: 763,
    category: "퍼포먼스",
    color: "#03C75A",
    textColor: "#FFFFFF",
    icon: "📈",
    tag: "인기",
  },
  {
    id: 3,
    name: "META / 인스타 광고 모임",
    desc: "FB·IG 광고 세팅 및 성과 공유",
    members: 541,
    category: "META 광고",
    color: "#1877F2",
    textColor: "#FFFFFF",
    icon: "📱",
    tag: "인기",
  },
  {
    id: 4,
    name: "쇼핑몰 셀러 마케팅방",
    desc: "쿠팡·스마트스토어 운영 & 마케팅 팁",
    members: 892,
    category: "이커머스",
    color: "#F97316",
    textColor: "#FFFFFF",
    icon: "🛒",
    tag: "",
  },
  {
    id: 5,
    name: "콘텐츠 마케터 모임",
    desc: "SNS 콘텐츠, 영상 제작, 바이럴 전략",
    members: 318,
    category: "콘텐츠",
    color: "#8B5CF6",
    textColor: "#FFFFFF",
    icon: "🎬",
    tag: "",
  },
];

export default function OpenChatPage() {
  return (
    <div className="max-w-3xl mx-auto py-8 space-y-6">

      {/* 헤더 */}
      <div>
        <p className="text-[12px] font-extrabold text-brand-muted uppercase tracking-widest mb-1">DIVERZ Community</p>
        <h1 className="text-[28px] font-extrabold text-brand-dark mb-2">오픈채팅</h1>
        <p className="text-[14px] text-brand-sub">마케터들과 실시간으로 소통하고 인사이트를 나눠보세요.</p>
      </div>

      {/* 안내 배너 */}
      <div
        className="rounded-2xl p-5 flex items-center gap-4"
        style={{ background: "linear-gradient(135deg,#FEE500 0%,#F5C800 100%)" }}
      >
        <div className="h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 bg-black/10 text-2xl">
          💬
        </div>
        <div className="flex-1">
          <p className="text-[14px] font-extrabold text-[#3A1D1D] mb-1">카카오 오픈채팅으로 연결됩니다</p>
          <p className="text-[12px] text-[#3A1D1D]/65 leading-relaxed">
            아래 채팅방을 클릭하면 카카오톡 오픈채팅으로 이동합니다. 카카오톡 앱이 필요합니다.
          </p>
        </div>
      </div>

      {/* 채팅방 목록 */}
      <div className="space-y-3">
        {MOCK_ROOMS.map((room) => (
          <div
            key={room.id}
            className="rounded-2xl border border-brand-border bg-white p-5 flex items-center gap-4 hover:shadow-md hover:border-brand-primary/30 transition-all cursor-pointer group"
          >
            {/* 아이콘 */}
            <div
              className="h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 text-xl"
              style={{ background: room.color }}
            >
              {room.icon}
            </div>

            {/* 정보 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[15px] font-bold text-brand-dark truncate">{room.name}</span>
                {room.tag && (
                  <span
                    className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                    style={{ background: room.color, color: room.textColor }}
                  >
                    {room.tag}
                  </span>
                )}
              </div>
              <p className="text-[12px] text-brand-sub truncate mb-1">{room.desc}</p>
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-brand-muted">{room.category}</span>
                <span className="text-[11px] text-brand-muted">·</span>
                <span className="text-[11px] text-brand-muted">멤버 {room.members.toLocaleString()}명</span>
              </div>
            </div>

            {/* 참여 버튼 */}
            <a
              href="/marketing/community"
              className="shrink-0 px-4 py-2 rounded-xl text-[12px] font-bold transition-all"
              style={{ background: room.color, color: room.textColor }}
            >
              참여하기
            </a>
          </div>
        ))}
      </div>

      {/* 오픈채팅 개설 안내 */}
      <div className="rounded-2xl border border-dashed border-brand-border p-6 text-center">
        <p className="text-[22px] mb-2">🙋</p>
        <p className="text-[14px] font-bold text-brand-dark mb-1">직접 채팅방을 만들고 싶으신가요?</p>
        <p className="text-[12px] text-brand-sub mb-4">마케팅 관련 주제라면 누구나 오픈채팅방을 등록할 수 있습니다.</p>
        <button className="px-5 py-2.5 rounded-xl text-[13px] font-bold bg-brand-dark text-white hover:bg-brand-dark/80 transition-colors">
          채팅방 등록 문의
        </button>
      </div>

    </div>
  );
}
