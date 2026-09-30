import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto py-24 text-center">
      <p className="text-[48px] font-black text-brand-primary tracking-tight">404</p>
      <h1 className="mt-2 text-[20px] font-extrabold text-brand-dark">페이지를 찾을 수 없습니다</h1>
      <p className="mt-1.5 text-[14px] text-brand-sub">주소가 바뀌었거나 없어진 화면입니다.</p>
      <Link href="/marketing" className="mt-6 inline-flex rounded-xl bg-brand-primary px-5 py-2.5 text-[14px] font-bold text-white hover:bg-brand-primary-hover">
        홈으로
      </Link>
    </div>
  );
}
