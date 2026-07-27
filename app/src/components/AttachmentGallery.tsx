import type { Attachment } from "@/lib/attachments";

/**
 * 공지사항 / 게시판 본문 아래에 붙는 이미지·영상.
 * 서버에서 그대로 렌더되도록 클라이언트 상태를 두지 않는다.
 */
export function AttachmentGallery({
  items,
  className = "",
}: {
  items: Attachment[];
  className?: string;
}) {
  if (!items.length) return null;

  return (
    <div className={`space-y-3 ${className}`}>
      {items.map((a, i) => {
        if (a.kind === "image") {
          return (
            // 사용자 업로드 이미지는 크기가 제각각이라 next/image 최적화 대상에서 제외
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={`${a.url}-${i}`}
              src={a.url}
              alt={a.name ?? "첨부 이미지"}
              loading="lazy"
              className="w-full max-w-full rounded-xl border border-brand-border"
            />
          );
        }
        if (a.kind === "video") {
          return (
            <video
              key={`${a.url}-${i}`}
              src={a.url}
              controls
              preload="metadata"
              className="w-full rounded-xl border border-brand-border bg-black"
            />
          );
        }
        return (
          <div key={`${a.url}-${i}`} className="relative w-full aspect-video rounded-xl overflow-hidden border border-brand-border">
            <iframe
              src={a.url}
              title={a.name ?? "첨부 영상"}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>
        );
      })}
    </div>
  );
}
