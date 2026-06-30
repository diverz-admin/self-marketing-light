"use client";

import { useEffect, useRef, useState } from "react";

type Msg = { id: number; user: string; avatarColor: string; text: string; time: string; me?: boolean };
type Topic = { id: string; name: string; emoji: string; color: string; online: number; desc: string };

const TOPICS: Topic[] = [
  { id: "place", name: "네이버 플레이스 리워드", emoji: "📍", color: "#03C75A", online: 142, desc: "방문·저장·예약 리워드 노하우" },
  { id: "shopping", name: "쇼핑·쿠팡 리워드", emoji: "🛍️", color: "#8B5CF6", online: 98, desc: "상위노출·구매평 전략" },
  { id: "insta", name: "인스타·릴스 마케팅", emoji: "📸", color: "#E1306C", online: 73, desc: "릴스·공동구매·체험단" },
  { id: "youtube", name: "유튜브 채널 성장", emoji: "▶️", color: "#FF0000", online: 51, desc: "쇼츠·협찬·알고리즘" },
  { id: "ads", name: "광고 세팅 Q&A", emoji: "🎯", color: "#0341C7", online: 64, desc: "META·네이버 SA 실시간 질문" },
  { id: "free", name: "자유 수다방", emoji: "💬", color: "#F59E0B", online: 210, desc: "마케터들의 편한 대화방" },
];

const INITIAL: Record<string, Msg[]> = {
  place: [
    { id: 1, user: "플레이스장인", avatarColor: "#03C75A", text: "방문자 리뷰 미션 진행하는데 저장수도 같이 올리니까 순위 확실히 오르네요 👍", time: "14:02" },
    { id: 2, user: "신규사장님", avatarColor: "#0341C7", text: "오 저도 이번 주에 시작했는데 며칠 정도면 효과 보이나요?", time: "14:05" },
    { id: 3, user: "플레이스장인", avatarColor: "#03C75A", text: "보통 3~5일이면 변동 보입니다. 키워드 경쟁도에 따라 다르긴 해요!", time: "14:06" },
  ],
  shopping: [
    { id: 1, user: "파워셀러", avatarColor: "#8B5CF6", text: "쇼핑 상위노출 캠페인 돌릴 때 구매평이랑 같이 가야 효율 좋습니다", time: "13:40" },
    { id: 2, user: "쿠팡러", avatarColor: "#EF4444", text: "쿠팡은 로켓배송 상품이 확실히 전환율 다르더라고요", time: "13:44" },
  ],
  insta: [
    { id: 1, user: "릴스마스터", avatarColor: "#E1306C", text: "릴스는 첫 3초 훅이 진짜 전부예요. 후킹 멘트 자료 공유드릴게요!", time: "12:10" },
    { id: 2, user: "공구하는언니", avatarColor: "#F59E0B", text: "공동구매 폼은 어떤 거 쓰세요? 추천 좀 🙏", time: "12:12" },
  ],
  youtube: [
    { id: 1, user: "쇼츠연구소", avatarColor: "#FF0000", text: "쇼츠 조회수 터지려면 업로드 시간대도 은근 중요합니다", time: "11:30" },
  ],
  ads: [
    { id: 1, user: "광고초보", avatarColor: "#0341C7", text: "META 픽셀 설치했는데 전환 이벤트가 안 잡혀요 ㅠㅠ 어디 봐야 하나요?", time: "15:01" },
    { id: 2, user: "퍼포먼스장", avatarColor: "#7C3AED", text: "이벤트 관리자에서 테스트 이벤트 탭 먼저 확인해보세요. 도메인 인증도 체크!", time: "15:03" },
  ],
  free: [
    { id: 1, user: "1년차마케터", avatarColor: "#F59E0B", text: "다들 오늘도 수고 많으십니다 🔥", time: "16:20" },
    { id: 2, user: "대표님", avatarColor: "#0341C7", text: "ㅎㅎ 화이팅입니다 이번 분기 목표 가즈아", time: "16:21" },
  ],
};

const REPLIES = [
  "오 좋은 정보 감사합니다! 👍",
  "저도 그 부분 궁금했는데 도움 됐어요!",
  "맞아요 그게 핵심인 것 같아요 ㅎㅎ",
  "혹시 관련 자료 있으면 공유 가능할까요?",
  "지금 바로 적용해봐야겠네요 🙏",
];

function nowTime() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function OpenChatPage() {
  const [activeId, setActiveId] = useState<string>("place");
  const [byTopic, setByTopic] = useState<Record<string, Msg[]>>(INITIAL);
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const seq = useRef(1000);

  const active = TOPICS.find((t) => t.id === activeId)!;
  const messages = byTopic[activeId] ?? [];

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, activeId]);

  function send() {
    const text = draft.trim();
    if (!text) return;
    const id = ++seq.current;
    setByTopic((prev) => ({
      ...prev,
      [activeId]: [...(prev[activeId] ?? []), { id, user: "나", avatarColor: "#0341C7", text, time: nowTime(), me: true }],
    }));
    setDraft("");

    // 실시간 느낌의 자동 응답
    const replyText = REPLIES[id % REPLIES.length];
    const topicId = activeId;
    setTimeout(() => {
      setByTopic((prev) => ({
        ...prev,
        [topicId]: [
          ...(prev[topicId] ?? []),
          { id: ++seq.current, user: "마케터B", avatarColor: "#8B5CF6", text: replyText, time: nowTime() },
        ],
      }));
    }, 1100);
  }

  return (
    <div className="max-w-6xl mx-auto py-8 space-y-6">

      {/* 헤더 */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-extrabold text-brand-muted uppercase tracking-widest mb-1">DIVERZ Community</p>
          <h1 className="text-[32px] font-extrabold text-brand-dark mb-2">오픈채팅</h1>
          <p className="text-[15px] text-brand-sub">주제별 채팅방에서 마케터들과 실시간으로 소통하세요.</p>
        </div>
        <div className="shrink-0 mt-2 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-green-50 border border-green-100">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
          </span>
          <span className="text-[13px] font-bold text-green-700">
            {TOPICS.reduce((s, t) => s + t.online, 0).toLocaleString()}명 접속 중
          </span>
        </div>
      </div>

      {/* 채팅 레이아웃 */}
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-5 h-[calc(100vh-300px)] min-h-[560px]">

        {/* 주제 목록 */}
        <div className="rounded-2xl border border-brand-border bg-white overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-brand-border shrink-0">
            <p className="text-[15px] font-extrabold text-brand-dark">주제별 채팅방</p>
            <p className="text-[12px] text-brand-sub mt-0.5">{TOPICS.length}개의 실시간 채팅방</p>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {TOPICS.map((t) => {
              const list = byTopic[t.id] ?? [];
              const last = list[list.length - 1];
              const on = activeId === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveId(t.id)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all ${
                    on ? "bg-[#EEF2FF]" : "hover:bg-brand-lighter"
                  }`}
                >
                  <span
                    className="h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 text-[20px]"
                    style={{ background: `${t.color}1A` }}
                  >
                    {t.emoji}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className={`block text-[14px] font-bold truncate ${on ? "text-brand-primary" : "text-brand-dark"}`}>
                      {t.name}
                    </span>
                    <span className="block text-[12px] text-brand-muted truncate">
                      {last ? `${last.me ? "나" : last.user}: ${last.text}` : t.desc}
                    </span>
                  </span>
                  <span className="shrink-0 flex flex-col items-end gap-1">
                    <span className="flex items-center gap-1 text-[10.5px] font-semibold text-green-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                      {t.online}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 채팅 창 */}
        <div className="rounded-2xl border border-brand-border bg-white overflow-hidden flex flex-col">
          {/* 채팅 헤더 */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-brand-border shrink-0">
            <span className="h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 text-[20px]" style={{ background: `${active.color}1A` }}>
              {active.emoji}
            </span>
            <div className="min-w-0">
              <p className="text-[16px] font-extrabold text-brand-dark truncate">{active.name}</p>
              <p className="text-[12px] text-green-600 font-semibold flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                {active.online}명 접속 중
              </p>
            </div>
            <button className="ml-auto shrink-0 px-3.5 py-2 rounded-lg text-[12px] font-semibold bg-brand-lighter text-brand-sub hover:bg-brand-border transition-colors">
              나가기
            </button>
          </div>

          {/* 메시지 영역 */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 bg-[#FAFBFC]">
            <div className="flex justify-center">
              <span className="text-[11px] text-brand-muted bg-white px-3 py-1 rounded-full border border-brand-border">
                {active.desc}
              </span>
            </div>
            {messages.map((m) =>
              m.me ? (
                <div key={m.id} className="flex justify-end items-end gap-2">
                  <span className="text-[10px] text-brand-muted mb-0.5">{m.time}</span>
                  <div className="max-w-[70%] px-4 py-2.5 rounded-2xl rounded-br-sm bg-brand-primary text-white text-[14px] leading-relaxed">
                    {m.text}
                  </div>
                </div>
              ) : (
                <div key={m.id} className="flex items-start gap-2.5">
                  <span
                    className="h-9 w-9 rounded-full flex items-center justify-center shrink-0 text-white text-[13px] font-bold"
                    style={{ background: m.avatarColor }}
                  >
                    {m.user.charAt(0)}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[12px] font-semibold text-brand-sub mb-1">{m.user}</p>
                    <div className="flex items-end gap-2">
                      <div className="max-w-[70%] px-4 py-2.5 rounded-2xl rounded-tl-sm bg-white border border-brand-border text-brand-dark text-[14px] leading-relaxed">
                        {m.text}
                      </div>
                      <span className="text-[10px] text-brand-muted mb-0.5 shrink-0">{m.time}</span>
                    </div>
                  </div>
                </div>
              )
            )}
            <div ref={endRef} />
          </div>

          {/* 입력창 */}
          <div className="border-t border-brand-border p-4 shrink-0">
            <div className="flex items-center gap-3">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder={`${active.name}에 메시지 보내기...`}
                className="flex-1 px-4 py-3 rounded-xl border border-brand-border bg-brand-lighter text-[14px] text-brand-dark placeholder:text-brand-muted focus:outline-none focus:border-brand-primary focus:bg-white transition-colors"
              />
              <button
                onClick={send}
                disabled={!draft.trim()}
                className="shrink-0 h-12 w-12 rounded-xl bg-brand-primary text-white flex items-center justify-center hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
