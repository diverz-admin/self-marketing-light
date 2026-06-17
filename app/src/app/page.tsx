import React from "react";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* Background glowing blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-400/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-violet-400/20 blur-[150px] pointer-events-none" />

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-white/60 backdrop-blur-md transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-8 w-8 rounded-lg bg-gradient-to-tr from-brand-primary to-brand-secondary flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/30">
              M
            </span>
            <span className="font-display font-extrabold text-xl tracking-tight bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
              SelfMarketing
            </span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-brand-dark/70">
            <a href="#profile" className="hover:text-brand-primary transition-colors duration-200">프로필</a>
            <a href="#projects" className="hover:text-brand-primary transition-colors duration-200">포트폴리오</a>
            <a href="#posts" className="hover:text-brand-primary transition-colors duration-200">블로그</a>
          </nav>

          <div className="flex items-center gap-4">
            <button className="px-4 py-2 rounded-full text-xs font-semibold bg-brand-primary text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all duration-300">
              시작하기
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12 md:py-24 flex flex-col gap-16 relative z-10">
        <section className="text-center flex flex-col items-center max-w-3xl mx-auto gap-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-brand-primary text-xs font-semibold animate-pulse">
            ✨ 나만의 브랜딩 공간 만들기
          </div>
          
          <h1 className="text-4xl md:text-6xl font-display font-black tracking-tight text-brand-dark leading-tight">
            당신의 가치를 <br className="md:hidden"/>
            <span className="bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent bg-clip-text text-transparent">
              가장 아름답게
            </span> 증명하세요
          </h1>
          
          <p className="text-base md:text-lg text-brand-dark/60 max-w-xl leading-relaxed">
            포트폴리오 등록, 경력 관리, 나만의 인사이트 블로그까지.
            쉽고 감각적인 디자인으로 스스로를 브랜딩하고 더 많은 기회를 연결해 드립니다.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 mt-4 w-full justify-center">
            <button className="w-full sm:w-auto px-8 py-3 rounded-full text-sm font-bold bg-brand-dark text-white hover:bg-brand-primary hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer">
              내 프로필 만들기
            </button>
            <button className="w-full sm:w-auto px-8 py-3 rounded-full text-sm font-bold bg-white text-brand-dark border border-brand-border hover:bg-brand-light hover:-translate-y-0.5 transition-all duration-300 cursor-pointer">
              템플릿 둘러보기
            </button>
          </div>
        </section>

        {/* Feature Dashboard Preview Card */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6">
          {/* Card 1 */}
          <div className="group p-8 rounded-3xl bg-white/70 border border-white/60 shadow-xl shadow-slate-100/50 backdrop-blur-sm hover:border-brand-primary/20 hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all duration-300">
            <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-brand-primary text-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
              💼
            </div>
            <h3 className="text-lg font-bold mb-2">경력 및 프로필 관리</h3>
            <p className="text-sm text-brand-dark/60 leading-relaxed">
              자신만의 직무 능력과 소개글을 카드 형태로 깔끔하게 정리하여 외부에 링크 한 장으로 전송할 수 있습니다.
            </p>
          </div>

          {/* Card 2 */}
          <div className="group p-8 rounded-3xl bg-white/70 border border-white/60 shadow-xl shadow-slate-100/50 backdrop-blur-sm hover:border-brand-secondary/20 hover:shadow-violet-500/5 hover:-translate-y-1 transition-all duration-300">
            <div className="h-12 w-12 rounded-2xl bg-violet-50 flex items-center justify-center text-brand-secondary text-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
              🚀
            </div>
            <h3 className="text-lg font-bold mb-2">포트폴리오 프로젝트</h3>
            <p className="text-sm text-brand-dark/60 leading-relaxed">
              사용했던 스택 태그와 상세 작업 내용을 시각적인 갤러리 형태로 등록해 자신의 성과를 극대화해 보여줍니다.
            </p>
          </div>

          {/* Card 3 */}
          <div className="group p-8 rounded-3xl bg-white/70 border border-white/60 shadow-xl shadow-slate-100/50 backdrop-blur-sm hover:border-brand-accent/20 hover:shadow-pink-500/5 hover:-translate-y-1 transition-all duration-300">
            <div className="h-12 w-12 rounded-2xl bg-pink-50 flex items-center justify-center text-brand-accent text-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
              ✍️
            </div>
            <h3 className="text-lg font-bold mb-2">인사이트 포스팅</h3>
            <p className="text-sm text-brand-dark/60 leading-relaxed">
              개발, 기획, 마케팅 등 업무 중 겪었던 배움과 문제 해결 과정을 나만의 아티클로 정교하게 작성하고 공유합니다.
            </p>
          </div>
        </section>

        {/* Dynamic Project Showcase Section Preview */}
        <section id="projects" className="flex flex-col gap-8 mt-12">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl md:text-3xl font-display font-extrabold tracking-tight">전시 중인 대표 포트폴리오</h2>
              <p className="text-sm text-brand-dark/60 mt-1">유저들이 브랜딩에 성공한 프로젝트 예시들입니다.</p>
            </div>
            <button className="text-sm font-semibold text-brand-primary hover:text-brand-secondary transition-colors duration-200 hidden sm:block">
              더 많은 프로젝트 보기 &rarr;
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="group relative overflow-hidden rounded-3xl bg-white border border-brand-border shadow-md hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500 flex flex-col">
              <div className="h-48 w-full bg-gradient-to-br from-indigo-500 to-violet-600 relative overflow-hidden flex items-center justify-center text-white">
                <span className="text-5xl font-black opacity-10 absolute right-4 bottom-0 select-none scale-150">PORTFOLIO</span>
                <span className="text-3xl">📱 AI Work</span>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-brand-primary">React Native</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-50 text-brand-secondary">AI Service</span>
                  </div>
                  <h4 className="text-lg font-bold mb-2 group-hover:text-brand-primary transition-colors duration-200">AI 기반 일정 최적화 비서 어플리케이션</h4>
                  <p className="text-xs text-brand-dark/60 leading-relaxed">
                    캘린더 일정 및 투두 리스트를 분석하여 사용자의 컨디션에 따른 지능형 집중 태스크 추천 엔진 설계 및 출시.
                  </p>
                </div>
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-brand-border text-xs text-brand-dark/40">
                  <span>작성자: 김진서 (AI 엔지니어)</span>
                  <span className="font-semibold text-brand-primary group-hover:translate-x-1 transition-transform duration-200">자세히 보기 &rarr;</span>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-3xl bg-white border border-brand-border shadow-md hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500 flex flex-col">
              <div className="h-48 w-full bg-gradient-to-br from-pink-500 to-rose-600 relative overflow-hidden flex items-center justify-center text-white">
                <span className="text-5xl font-black opacity-10 absolute right-4 bottom-0 select-none scale-150">BRANDING</span>
                <span className="text-3xl">💻 DevLog</span>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-50 text-brand-accent">Next.js 16</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">SEO Optimized</span>
                  </div>
                  <h4 className="text-lg font-bold mb-2 group-hover:text-brand-accent transition-colors duration-200">개발자를 위한 초경량 블로그 템플릿 제작</h4>
                  <p className="text-xs text-brand-dark/60 leading-relaxed">
                    최신 Next.js App Router 기술과 Tailwind v4를 적용하여 라이트하우스 100점 만점을 기록한 셀프 브랜딩용 템플릿.
                  </p>
                </div>
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-brand-border text-xs text-brand-dark/40">
                  <span>작성자: 이소민 (프론트엔드)</span>
                  <span className="font-semibold text-brand-accent group-hover:translate-x-1 transition-transform duration-200">자세히 보기 &rarr;</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-brand-border py-12 mt-24 bg-white relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-brand-dark/50">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded bg-brand-primary flex items-center justify-center text-white font-bold text-xs">
              M
            </span>
            <span className="font-display font-bold text-brand-dark">SelfMarketing</span>
          </div>
          <div>
            &copy; {new Date().getFullYear()} SelfMarketing Platform. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
