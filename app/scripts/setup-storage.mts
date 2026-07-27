// 사업자등록증 보관용 비공개 버킷 + RLS 정책.
// 사업자등록증은 민감정보이므로 공개 버킷을 쓰지 않는다.
// - 본인: 자기 폴더(<uid>/...)에만 업로드/열람
// - 관리자: 전체 열람
// 어드민 화면에서는 서명 URL(만료 있음)로만 노출한다.
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!, { prepare: false, max: 1 });

const BUCKET = "business-docs";

await sql`
  insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  values (
    ${BUCKET}::text, ${BUCKET}::text, false, 10485760,
    array['image/png','image/jpeg','image/webp','application/pdf']::text[]
  )
  on conflict (id) do update
    set public = false,
        file_size_limit = excluded.file_size_limit,
        allowed_mime_types = excluded.allowed_mime_types
`;

// 정책 DDL에는 바인드 파라미터를 쓸 수 없어 버킷명을 리터럴로 넣는다.
// (BUCKET은 이 파일 안에서 고정된 상수이므로 주입 위험 없음)
const policies: { name: string; ddl: string }[] = [
  {
    name: "business-docs: 본인 업로드",
    ddl: `create policy "business-docs: 본인 업로드" on storage.objects
          for insert to authenticated
          with check (bucket_id = '${BUCKET}' and (storage.foldername(name))[1] = auth.uid()::text)`,
  },
  {
    name: "business-docs: 본인 열람",
    ddl: `create policy "business-docs: 본인 열람" on storage.objects
          for select to authenticated
          using (bucket_id = '${BUCKET}' and (storage.foldername(name))[1] = auth.uid()::text)`,
  },
  {
    name: "business-docs: 관리자 전체 열람",
    ddl: `create policy "business-docs: 관리자 전체 열람" on storage.objects
          for select to authenticated
          using (
            bucket_id = '${BUCKET}'
            and exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
          )`,
  },
];

for (const p of policies) {
  await sql.unsafe(`drop policy if exists "${p.name}" on storage.objects`);
  await sql.unsafe(p.ddl);
  console.log("  정책 생성:", p.name);
}

// ── 공지사항 / 게시판 첨부 이미지·영상 ──
// 게시물은 사용자에게 공개되는 콘텐츠라 공개 버킷을 쓴다.
// 쓰기는 관리자만, 읽기는 누구나.
const POST_BUCKET = "post-media";

await sql`
  insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  values (
    ${POST_BUCKET}::text, ${POST_BUCKET}::text, true, 52428800,
    array[
      'image/png','image/jpeg','image/webp','image/gif',
      'video/mp4','video/webm','video/quicktime'
    ]::text[]
  )
  on conflict (id) do update
    set public = true,
        file_size_limit = excluded.file_size_limit,
        allowed_mime_types = excluded.allowed_mime_types
`;

const postPolicies: { name: string; ddl: string }[] = [
  {
    name: "post-media: 전체 열람",
    ddl: `create policy "post-media: 전체 열람" on storage.objects
          for select to public
          using (bucket_id = '${POST_BUCKET}')`,
  },
  {
    name: "post-media: 관리자 업로드",
    ddl: `create policy "post-media: 관리자 업로드" on storage.objects
          for insert to authenticated
          with check (
            bucket_id = '${POST_BUCKET}'
            and exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
          )`,
  },
  {
    name: "post-media: 관리자 삭제",
    ddl: `create policy "post-media: 관리자 삭제" on storage.objects
          for delete to authenticated
          using (
            bucket_id = '${POST_BUCKET}'
            and exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
          )`,
  },
];

for (const p of postPolicies) {
  await sql.unsafe(`drop policy if exists "${p.name}" on storage.objects`);
  await sql.unsafe(p.ddl);
  console.log("  정책 생성:", p.name);
}

const buckets = await sql`
  select id, public, file_size_limit from storage.buckets where id in (${BUCKET}, ${POST_BUCKET}) order by id
`;
console.log("\n버킷:");
for (const b of buckets) console.log("  ", JSON.stringify(b));
await sql.end();
process.exit(0);
