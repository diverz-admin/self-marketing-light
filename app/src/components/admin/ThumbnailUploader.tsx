"use client";

import { useRef, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button, Notice } from "@/components/admin/ui";
import { POST_MEDIA_BUCKET } from "@/lib/attachments";

const MAX_BYTES = 5 * 1024 * 1024; // 썸네일은 작게 — 목록·카드에서만 쓰인다

/**
 * 상품 썸네일 (1장).
 * 게시물 미디어와 같은 공개 버킷의 products/ 폴더를 쓴다 (쓰기는 관리자만).
 */
export function ThumbnailUploader({
  url,
  onChange,
  fallbackText,
}: {
  url: string | null;
  onChange: (next: { url: string | null; path: string | null }) => void;
  /** 썸네일이 없을 때 미리보기에 띄울 글자 */
  fallbackText?: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pick = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    setError(null);

    if (!file.type.startsWith("image/")) {
      setError("이미지 파일만 올릴 수 있습니다.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("5MB 이하 이미지만 올릴 수 있습니다.");
      return;
    }

    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.includes(".") ? file.name.split(".").pop() : "png";
      const path = `products/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from(POST_MEDIA_BUCKET)
        .upload(path, file, { contentType: file.type, upsert: false });

      if (upErr) {
        setError(upErr.message);
        return;
      }
      const { data } = supabase.storage.from(POST_MEDIA_BUCKET).getPublicUrl(path);
      onChange({ url: data.publicUrl, path });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3">
        <span className="w-16 h-16 rounded-xl shrink-0 overflow-hidden border border-brand-border bg-brand-light flex items-center justify-center">
          {url ? (
            // 사용자 업로드 이미지는 next/image 최적화 대상이 아니라 img를 쓴다
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="상품 썸네일" className="w-full h-full object-cover" />
          ) : (
            <span className="text-[18px] font-black text-brand-muted">
              {(fallbackText || "?").slice(0, 1)}
            </span>
          )}
        </span>

        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => pick(e.target.files)}
        />
        <Button size="sm" variant="secondary" disabled={uploading} onClick={() => fileRef.current?.click()}>
          {uploading ? "업로드 중..." : url ? "이미지 변경" : "이미지 업로드"}
        </Button>
        {url && (
          <Button size="sm" variant="ghost" onClick={() => onChange({ url: null, path: null })}>
            제거
          </Button>
        )}
        <span className="text-[12px] text-brand-muted">정사각형 권장 · 5MB 이하</span>
      </div>
      {error && <Notice ok={false}>{error}</Notice>}
    </div>
  );
}
