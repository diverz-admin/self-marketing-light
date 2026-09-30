import Link from "next/link";

export const metadata = { title: "개인정보 처리방침 | BLUE EGG" };

/* 개발본과 같이 문구가 확정되기 전까지는 안내만 둔다 */
export default function Page() {
  return (
    <main className="min-h-screen bg-white px-5 py-16">
      <div className="mx-auto max-w-2xl">
        <Link href="/marketing" className="text-[13px] font-semibold text-brand-sub hover:text-brand-primary">← 돌아가기</Link>
        <h1 className="mt-6 text-[26px] font-extrabold text-brand-dark tracking-tight">개인정보 처리방침</h1>
        <div className="mt-6 rounded-2xl border border-brand-border bg-brand-lighter px-6 py-10 text-center">
          <p className="text-[15px] text-brand-sub">개인정보 처리방침 내용은 추후 확정되어 게시됩니다.</p>
        </div>
      </div>
    </main>
  );
}
