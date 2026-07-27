"use client";

import { Badge } from "@/components/admin/ui";
import type { Attachment } from "@/lib/attachments";

/** 목록에서 첨부 구성(이미지 n · 영상 n)을 한눈에 */
export function AttachmentBadge({ items }: { items: Attachment[] }) {
  if (!items.length) return null;
  const images = items.filter((a) => a.kind === "image").length;
  const videos = items.length - images; // video + embed
  const parts = [images ? `이미지 ${images}` : null, videos ? `영상 ${videos}` : null].filter(Boolean);
  return <Badge tone="blue">{parts.join(" · ")}</Badge>;
}
