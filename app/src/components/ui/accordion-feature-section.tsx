"use client";

/**
 * 아코디언 + 미리보기 블록 (21st.dev Feature197 기반).
 *
 * 원본은 shadcn 디자인 토큰(`text-muted-foreground`, `bg-muted` …)을 쓰는데
 * 이 저장소에는 그 토큰이 없다. 어두운 네이비 화면에 맞춰 색을 직접 지정했다.
 *
 * 왼쪽 목록에서 고른 항목의 이미지가 오른쪽에 뜬다. 좁은 화면에서는 오른쪽
 * 미리보기를 숨기고 펼친 항목 안에 이미지를 넣는다.
 */

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export interface FeatureItem {
  id: number;
  /** 01, 02 … 목록 앞에 붙는 번호 */
  no?: string;
  title: string;
  image: string;
  description: string;
  /** 항목 아래 해시태그 */
  tags?: string[];
  /** 메인 캡처 위에 겹쳐 띄우는 강조 이미지 */
  overlay?: string;
}

export function AccordionFeatures({
  features,
  accent = "#2A5EFF",
}: {
  features: FeatureItem[];
  /** 활성 항목 번호에 쓰는 키컬러 */
  accent?: string;
}) {
  const [activeId, setActiveId] = useState<number>(features[0]?.id ?? 1);
  const active = features.find((f) => f.id === activeId) ?? features[0];

  /* ── 5초마다 다음 항목으로 ──
     · 화면 밖이면 돌리지 않는다 — 안 보는 사이에 다 넘어가 있으면 소용이 없다.
     · 커서를 얹거나 직접 고르면 멈춘다. 읽는 중에 바뀌면 방해가 된다.
     · 움직임을 줄여 달라고 설정했으면 자동으로 넘기지 않는다. */
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [held, setHeld] = useState(false);
  const [stopped, setStopped] = useState(false);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      threshold: 0.3,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || held || stopped || features.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      setActiveId((cur) => {
        const i = features.findIndex((f) => f.id === cur);
        return features[(i + 1) % features.length].id;
      });
    }, 5000);
    return () => window.clearInterval(timer);
  }, [visible, held, stopped, features]);

  // 반반이 아니라 오른쪽 트랙을 넓게 잡는다. 컨테이너 안에서 나누므로
  // 모니터만 커지고 가로 스크롤은 생기지 않는다.
  return (
    <div
      ref={rootRef}
      className="grid gap-12 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:gap-16"
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
    >
      {/* 목록 뒤판 — About 패널과 같은 문법(반투명 면 + 가운데 파란 글로우).
          어두운 바탕에 글만 얹혀 있어 구획이 안 잡히던 걸 잡아 준다. */}
      <div
        className="relative overflow-hidden rounded-[40px] px-9 py-7 backdrop-blur-[30px]"
        /* 바탕이 거의 검정이라 5% 면으로는 구획이 안 보인다. 면을 한 단계 올리고
           옅은 테두리를 둘러 카드가 배경에서 떠 보이게 한다. */
        style={{
          background: "rgba(255,255,255,.09)",
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,.10)",
        }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
          style={{
            background:
              "radial-gradient(48% 42% at 50% 50%, rgba(42,94,255,.42), transparent 72%)",
          }}
        />

        <Accordion
        type="single"
        collapsible={false}
        className="relative w-full"
        value={`item-${activeId}`}
        onValueChange={(v) => {
          const next = Number(v.replace("item-", ""));
          if (!next) return;
          setActiveId(next);
          setStopped(true); // 직접 고른 뒤에는 자동으로 넘기지 않는다
        }}
      >
        {features.map((f) => {
          const on = f.id === activeId;
          return (
            <AccordionItem key={f.id} value={`item-${f.id}`}>
              <AccordionTrigger className="cursor-pointer py-6">
                <span className="flex items-baseline gap-4">
                  <span
                    className="text-[15px] font-bold tracking-tight transition-colors duration-300"
                    style={{ color: on ? accent : "rgba(255,255,255,.35)" }}
                  >
                    {f.no}
                  </span>
                  <span
                    className={`text-[20px] font-bold tracking-tight break-keep transition-colors duration-300 md:text-[24px] ${
                      on ? "text-white" : "text-white/45"
                    }`}
                  >
                    {f.title}
                  </span>
                </span>
              </AccordionTrigger>

              <AccordionContent>
                {/* 좁은 화면에서는 번호만큼 들여쓰지 않는다 — 46px 을 뺏기면 글이
                    한 줄에 두세 단어만 남아 문단이 깨진다. 문장 단위 줄바꿈도 접는다. */}
                <p className="whitespace-normal pl-0 text-[14px] font-medium leading-[1.7] text-white/55 break-keep md:whitespace-pre-line md:pl-[46px] md:text-[15px]">
                  {f.description}
                </p>

                {f.tags && (
                  <div className="mt-5 flex flex-wrap gap-x-2 gap-y-[5px] pl-0 md:pl-[46px]">
                    {f.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-full bg-white/10 px-3 py-[5px] text-[13px] font-medium text-white/55 md:text-[14px]"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}

                {/* 좁은 화면에서는 오른쪽 미리보기가 없으니 여기에 넣는다 */}
                <div className="relative mt-6 aspect-[1568/759] w-full overflow-hidden rounded-[20px] lg:hidden">
                  <Image
                    src={f.image}
                    alt=""
                    fill
                    sizes="100vw"
                    className="object-cover"
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
        </Accordion>
      </div>

      {/* 오른쪽 미리보기 — 고른 항목에 따라 바뀐다 */}
      {/* 오른쪽 미리보기 — 모니터 목업 안에 화면을 끼운다.
          왼쪽 목록과 같은 높이로 늘어나고(그리드 기본 stretch), 뒤 배경은 없다. */}
      <div className="relative hidden h-full min-h-[360px] w-full lg:block">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full">
            {/* 베젤 — 어두운 바탕에서 묻히지 않게 밝은 금속 톤으로 */}
            <div
              className="rounded-[14px] p-[10px] shadow-[0_26px_64px_rgba(0,0,0,.55)] ring-1 ring-white/60"
              style={{ background: "linear-gradient(180deg,#F4F7FC 0%,#DCE3F0 100%)" }}
            >
              {/* 화면 — 캡처 비율(1568×759) 그대로라 잘리지 않는다 */}
              <div className="relative aspect-[1568/759] overflow-hidden rounded-[6px] bg-white ring-1 ring-black/10">
                {features.map((f) => (
                  <div
                    key={f.id}
                    /* 모두 깔아 두고 투명도만 바꾼다 — 매번 새로 받으면 깜빡인다 */
                    className={`absolute inset-0 transition-opacity duration-500 ${
                      f.id === active.id ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <Image
                      src={f.image}
                      alt={f.title}
                      fill
                      sizes="(min-width: 1024px) 50vw, 100vw"
                      className="object-cover"
                    />

                    {/* 강조 이미지 — 화면 아래쪽에 걸쳐 띄워 시선을 모은다 */}
                    {f.overlay && (
                      <div className="absolute bottom-[6%] left-[6%] right-[6%] overflow-hidden rounded-[8px] shadow-[0_14px_36px_rgba(0,0,0,.5)] ring-1 ring-black/15">
                        <Image
                          src={f.overlay}
                          alt=""
                          width={1210}
                          height={430}
                          sizes="(min-width: 1024px) 44vw, 88vw"
                          className="h-auto w-full"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 목 · 받침 — 베젤과 같은 톤 */}
            <div
              className="mx-auto h-[16px] w-[104px]"
              style={{ background: "linear-gradient(180deg,#DCE3F0 0%,#C6CEDE 100%)" }}
            />
            <div
              className="mx-auto h-[9px] w-[240px] rounded-b-[5px] shadow-[0_10px_24px_rgba(0,0,0,.35)]"
              style={{ background: "linear-gradient(180deg,#D2D9E8 0%,#B8C1D4 100%)" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
