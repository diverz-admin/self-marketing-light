"use client";

import { useRef, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button, Input, Notice } from "@/components/admin/ui";
import {
  POST_MEDIA_BUCKET,
  MAX_ATTACHMENT_BYTES,
  toEmbedUrl,
  formatBytes,
  type Attachment,
} from "@/lib/attachments";

/**
 * 공지사항 / 게시판 본문에 붙일 이미지·영상 첨부기.
 * - 이미지/영상 파일은 공개 버킷에 업로드 (쓰기 권한은 관리자만)
 * - 영상은 용량이 커서 유튜브·Vimeo 링크 임베드도 지원
 */
export function MediaUploader({
  value,
  onChange,
  folder,
}: {
  value: Attachment[];
  onChange: (next: Attachment[]) => void;
  folder: string; // "notices" | "board"
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [embedUrl, setEmbedUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const pickFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setError(null);
    setUploading(true);
    const supabase = createClient();
    const added: Attachment[] = [];

    try {
      for (const file of Array.from(files)) {
        if (file.size > MAX_ATTACHMENT_BYTES) {
          setError(`${file.name}: 50MB를 넘어 업로드할 수 없습니다.`);
          continue;
        }
        const isVideo = file.type.startsWith("video/");
        const ext = file.name.includes(".") ? file.name.split(".").pop() : "bin";
        // 파일명 충돌을 피하려 임의 접두사를 붙인다
        const path = `${folder}/${crypto.randomUUID()}.${ext}`;

        const { error: upErr } = await supabase.storage
          .from(POST_MEDIA_BUCKET)
          .upload(path, file, { contentType: file.type || undefined, upsert: false });

        if (upErr) {
          setError(`${file.name}: ${upErr.message}`);
          continue;
        }

        const { data } = supabase.storage.from(POST_MEDIA_BUCKET).getPublicUrl(path);
        added.push({
          kind: isVideo ? "video" : "image",
          url: data.publicUrl,
          path,
          name: file.name,
          size: file.size,
          mime: file.type,
        });
      }
      if (added.length) onChange([...value, ...added]);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const addEmbed = () => {
    setError(null);
    const url = toEmbedUrl(embedUrl);
    if (!url) {
      setError("유튜브 또는 Vimeo 주소를 넣어주세요.");
      return;
    }
    onChange([...value, { kind: "embed", url, name: embedUrl.trim() }]);
    setEmbedUrl("");
  };

  const remove = async (index: number) => {
    const target = value[index];
    onChange(value.filter((_, i) => i !== index));
    // 업로드본이면 스토리지에서도 정리 (실패해도 목록에서는 이미 빠진 상태)
    if (target.path) {
      const supabase = createClient();
      await supabase.storage.from(POST_MEDIA_BUCKET).remove([target.path]);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
          multiple
          className="hidden"
          onChange={(e) => pickFiles(e.target.files)}
        />
        <Button size="sm" variant="secondary" disabled={uploading} onClick={() => fileRef.current?.click()}>
          {uploading ? "업로드 중..." : "이미지 · 영상 첨부"}
        </Button>
        <span className="text-[12px] text-brand-muted">개당 최대 50MB</span>
      </div>

      <div className="flex gap-2 mt-2">
        <Input
          value={embedUrl}
          onChange={(e) => setEmbedUrl(e.target.value)}
          placeholder="유튜브 · Vimeo 링크 붙여넣기"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addEmbed();
            }
          }}
        />
        <Button size="sm" variant="ghost" onClick={addEmbed} className="shrink-0">
          링크 추가
        </Button>
      </div>

      {error && <Notice ok={false}>{error}</Notice>}

      {value.length > 0 && (
        <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
          {value.map((a, i) => (
            <li key={`${a.url}-${i}`} className="relative rounded-xl border border-brand-border overflow-hidden bg-brand-light">
              <AttachmentThumb attachment={a} />
              <button
                onClick={() => remove(i)}
                aria-label="첨부 삭제"
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/55 text-white text-[14px] leading-none hover:bg-black/75"
              >
                ×
              </button>
              <p className="px-2 py-1.5 text-[11.5px] text-brand-sub truncate">
                {a.kind === "embed" ? "영상 링크" : a.name}
                {a.size ? ` · ${formatBytes(a.size)}` : ""}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AttachmentThumb({ attachment: a }: { attachment: Attachment }) {
  if (a.kind === "image") {
    // 사용자 업로드 이미지는 next/image 최적화 대상이 아니라 img를 쓴다
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={a.url} alt={a.name ?? "첨부 이미지"} className="w-full h-24 object-cover" />;
  }
  if (a.kind === "video") {
    return <video src={a.url} className="w-full h-24 object-cover" muted playsInline />;
  }
  return (
    <div className="w-full h-24 flex items-center justify-center bg-brand-dark/5">
      <svg className="w-7 h-7 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
  );
}
