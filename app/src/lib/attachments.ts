/** 공지사항 / 게시판 첨부 미디어 */
export type Attachment = {
  kind: "image" | "video" | "embed"; // embed = 유튜브 등 외부 영상
  url: string;                        // 표시용 URL (embed면 임베드 주소)
  path?: string;                      // 스토리지 객체 경로 (업로드본만)
  name?: string;
  size?: number;
  mime?: string;
};

/** 게시물 첨부 보관 버킷 (공개 — 게시물은 사용자에게 노출되는 콘텐츠) */
export const POST_MEDIA_BUCKET = "post-media";

export const MAX_ATTACHMENT_BYTES = 50 * 1024 * 1024; // 버킷 제한과 동일

/**
 * 유튜브 / Vimeo 주소를 임베드 URL로 변환한다.
 * 영상 파일 업로드는 용량이 커서, 외부 링크도 함께 지원한다.
 */
export function toEmbedUrl(raw: string): string | null {
  const input = raw.trim();
  if (!input) return null;

  let u: URL;
  try {
    u = new URL(input);
  } catch {
    return null;
  }

  const host = u.hostname.replace(/^www\./, "");

  if (host === "youtu.be") {
    const id = u.pathname.slice(1);
    return id ? `https://www.youtube.com/embed/${id}` : null;
  }
  if (host === "youtube.com" || host === "m.youtube.com") {
    if (u.pathname === "/watch") {
      const id = u.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (u.pathname.startsWith("/embed/") || u.pathname.startsWith("/shorts/")) {
      const id = u.pathname.split("/")[2];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
  }
  if (host === "vimeo.com") {
    const id = u.pathname.split("/").filter(Boolean)[0];
    return id && /^\d+$/.test(id) ? `https://player.vimeo.com/video/${id}` : null;
  }
  return null;
}

export function formatBytes(bytes?: number) {
  if (!bytes) return "";
  return bytes >= 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)}MB`
    : `${Math.max(1, Math.round(bytes / 1024))}KB`;
}

/** DB의 jsonb 값을 안전하게 Attachment[]로 (형식이 어긋난 항목은 버린다) */
export function parseAttachments(value: unknown): Attachment[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((v) => {
    if (!v || typeof v !== "object") return [];
    const a = v as Record<string, unknown>;
    const kind = a.kind;
    const url = a.url;
    if (typeof url !== "string") return [];
    if (kind !== "image" && kind !== "video" && kind !== "embed") return [];
    return [
      {
        kind,
        url,
        path: typeof a.path === "string" ? a.path : undefined,
        name: typeof a.name === "string" ? a.name : undefined,
        size: typeof a.size === "number" ? a.size : undefined,
        mime: typeof a.mime === "string" ? a.mime : undefined,
      },
    ];
  });
}
