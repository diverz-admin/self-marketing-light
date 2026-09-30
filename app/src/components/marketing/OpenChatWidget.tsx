"use client";

import { useEffect, useRef, useState } from "react";

/* ── 실시간 오픈채팅 위젯 (대시보드 우측 레일 하단) ──
   주제별 채팅방으로 나뉘어 있으며, 각 방마다 목업 메시지가
   실시간처럼 흘러가고 사용자가 입력한 메시지도 즉시 반영된다. */

interface ChatMsg {
  id: number;
  user: string;
  color: string;
  text: string;
  me?: boolean;
}

interface Room {
  id: string;
  name: string;
  online: number;
  seed: Omit<ChatMsg, "id">[];
  stream: Omit<ChatMsg, "id">[];
}

const ROOMS: Room[] = [
  {
    id: "place",
    name: "플레이스 리워드",
    online: 1284,
    seed: [
      { user: "마포사장님", color: "#5EA0FF", text: "플레이스 순위 3위까지 올라왔어요 ㅎㅎ" },
      { user: "리뷰장인", color: "#F472B6", text: "체험단 모집 하루만에 마감됐어요 대박" },
      { user: "무사만루", color: "#FB7185", text: "이번 달 방문자 2배 됐습니다 감사합니다" },
      { user: "을지로맛집", color: "#5EA0FF", text: "보장형 캠페인 5순위 진입 확인!" },
    ],
    stream: [
      { user: "코인노래방", color: "#4ADE80", text: "플레이스 저장수 늘리는 팁 있나요" },
      { user: "왕십리미용실", color: "#38BDF8", text: "환급 정산 오늘 들어왔네요 굿" },
      { user: "홍대술집", color: "#5EA0FF", text: "리뷰 이벤트 진행하니 재방문 늘었어요" },
      { user: "신도림횟집", color: "#FBBF24", text: "방문자 리뷰 미션 효과 확실하네요" },
    ],
  },
  {
    id: "shopping",
    name: "쇼핑·쿠팡",
    online: 892,
    seed: [
      { user: "쇼핑덕후", color: "#4ADE80", text: "리워드 캠페인 효과 진짜 좋네요" },
      { user: "성수동카페", color: "#FBBF24", text: "쇼핑 상위노출 3일만에 됨 ㄷㄷ" },
      { user: "네일아트샵", color: "#C084FC", text: "블로그 리뷰 20건 들어왔어요 👍" },
    ],
    stream: [
      { user: "분식왕", color: "#4ADE80", text: "구매평이랑 같이 돌리니 전환 확 오르네요" },
      { user: "제주감귤농장", color: "#FB7185", text: "쿠팡 로켓 상품이 확실히 반응 좋아요" },
      { user: "홈리빙샵", color: "#38BDF8", text: "스마트스토어 순위 이번주 많이 올랐어요" },
    ],
  },
  {
    id: "ads",
    name: "광고 Q&A",
    online: 763,
    seed: [
      { user: "광고초보", color: "#FBBF24", text: "SA 광고 환급 신청 어디서 하나요?" },
      { user: "카페주인", color: "#C084FC", text: "다들 키워드 몇 개씩 돌리세요?" },
    ],
    stream: [
      { user: "떡볶이여신", color: "#F472B6", text: "포인트 충전 이벤트 언제까지죠?" },
      { user: "꽃집사장", color: "#C084FC", text: "카페 침투 마케팅 후기 궁금해요" },
      { user: "퍼포먼스장", color: "#5EA0FF", text: "META 픽셀 전환 이벤트 도메인 인증 꼭 하세요" },
    ],
  },
  {
    id: "free",
    name: "자유수다",
    online: 1103,
    seed: [
      { user: "헬스관장", color: "#38BDF8", text: "강남 헬스장 키워드 경쟁 빡세네요 ㅠ" },
      { user: "1년차마케터", color: "#FBBF24", text: "다들 오늘도 수고 많으십니다 🔥" },
    ],
    stream: [
      { user: "무사만루", color: "#FB7185", text: "다음 캠페인 뭐로 돌릴지 고민중" },
      { user: "홍대술집", color: "#5EA0FF", text: "여기 정보 공유 진짜 도움됩니다" },
      { user: "대표님", color: "#4ADE80", text: "이번 분기 목표 가즈아 ㅎㅎ" },
    ],
  },
];

const MY_COLOR = "#93C5FD";

export default function OpenChatWidget() {
  const [activeId, setActiveId] = useState<string>(ROOMS[0].id);
  const [byRoom, setByRoom] = useState<Record<string, ChatMsg[]>>(() => {
    let seq = 1;
    const init: Record<string, ChatMsg[]> = {};
    for (const r of ROOMS) init[r.id] = r.seed.map((m) => ({ ...m, id: seq++ }));
    return init;
  });
  const [onlineByRoom, setOnlineByRoom] = useState<Record<string, number>>(() =>
    Object.fromEntries(ROOMS.map((r) => [r.id, r.online]))
  );
  const [input, setInput] = useState("");
  const [noticeOpen, setNoticeOpen] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(1000);
  const streamRef = useRef<Record<string, number>>(Object.fromEntries(ROOMS.map((r) => [r.id, 0])));
  const activeRef = useRef(activeId);
  activeRef.current = activeId;

  const activeRoom = ROOMS.find((r) => r.id === activeId)!;
  const messages = byRoom[activeId] ?? [];
  const online = onlineByRoom[activeId] ?? activeRoom.online;

  // 실시간처럼 목업 메시지 자동 유입 (현재 보고 있는 방 기준)
  useEffect(() => {
    const t = setInterval(() => {
      const rid = activeRef.current;
      const room = ROOMS.find((r) => r.id === rid)!;
      const idx = streamRef.current[rid] % room.stream.length;
      streamRef.current[rid] += 1;
      const next = room.stream[idx];
      setByRoom((prev) => ({
        ...prev,
        [rid]: [...(prev[rid] ?? []), { ...next, id: idRef.current++ }].slice(-40),
      }));
      setOnlineByRoom((prev) => ({
        ...prev,
        [rid]: Math.max(500, (prev[rid] ?? room.online) + Math.floor(Math.random() * 7) - 3),
      }));
    }, 3200);
    return () => clearInterval(t);
  }, []);

  // 새 메시지·방 전환 시 맨 아래로 스크롤
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, activeId]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    const rid = activeId;
    setByRoom((prev) => ({
      ...prev,
      [rid]: [...(prev[rid] ?? []), { id: idRef.current++, user: "나", color: MY_COLOR, text, me: true }].slice(-40),
    }));
    setInput("");
  };

  return (
    <div className="rounded-2xl overflow-hidden flex flex-col h-full min-h-0" style={{ background: "#12151C", border: "1px solid #23283442" }}>
      {/* 헤더 */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22C55E]" />
          </span>
          <p className="text-[14px] font-bold text-white truncate">블루에그 오픈채팅</p>
        </div>
        <span className="text-[11px] font-semibold text-white/45 shrink-0">온라인 {online.toLocaleString()}</span>
      </div>

      {/* 채팅방 탭 */}
      <div className="flex gap-1.5 px-3 pt-2.5 pb-0.5 overflow-x-auto scrollbar-none shrink-0">
        {ROOMS.map((r) => {
          const on = r.id === activeId;
          return (
            <button
              key={r.id}
              onClick={() => setActiveId(r.id)}
              className={`shrink-0 px-2.5 py-1 rounded-full text-[12px] font-bold transition-colors ${
                on ? "text-white" : "text-white/50 hover:text-white/80"
              }`}
              style={on ? { background: "linear-gradient(135deg,#2452EB,#2764C7)" } : { background: "#1B2230", border: "1px solid #2A3140" }}
            >
              {r.name}
            </button>
          );
        })}
      </div>

      {/* 공지 배너 */}
      {noticeOpen && (
        <div className="mx-3 mt-2.5 flex items-start gap-2 rounded-lg px-3 py-2 shrink-0" style={{ background: "#1B2230", border: "1px solid #2A3550" }}>
          <span className="text-[12px] leading-relaxed text-[#9DBBF5] flex-1">
            🚩 실시간 마케팅 정보 공유방입니다. 광고·홍보 도배는 제한돼요.
          </span>
          <button onClick={() => setNoticeOpen(false)} className="text-white/40 hover:text-white/80 transition-colors shrink-0 leading-none">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}

      {/* 메시지 목록 */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-2 scrollbar-none">
        {messages.map((m) => (
          <div key={m.id} className="text-[13px] leading-snug flex gap-1.5">
            <span className="font-bold shrink-0" style={{ color: m.color }}>{m.user}</span>
            <span className="text-white/30 shrink-0">:</span>
            <span className={`min-w-0 break-words ${m.me ? "text-white font-medium" : "text-white/80"}`}>{m.text}</span>
          </div>
        ))}
      </div>

      {/* 입력창 */}
      <div className="px-3 py-3 border-t border-white/10 shrink-0">
        <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: "#1B2230", border: "1px solid #2A3140" }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") send(); }}
            placeholder={`${activeRoom.name} 방에 메시지 보내기...`}
            className="flex-1 min-w-0 bg-transparent text-[13px] text-white placeholder-white/35 focus:outline-none"
          />
          <button
            onClick={send}
            disabled={!input.trim()}
            className="shrink-0 h-7 w-7 rounded-lg flex items-center justify-center transition-colors disabled:opacity-40"
            style={{ background: "linear-gradient(135deg,#2452EB,#2764C7)" }}
            aria-label="전송"
          >
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
