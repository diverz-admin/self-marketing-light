"use client";

import React, { useState } from "react";

type MockProject = {
  id: string;
  title: string;
  description: string;
  content: string;
  projectUrl: string;
  githubUrl: string;
  imageUrl: string;
  tags: string[];
  isFeatured: boolean;
  createdAt: Date;
};

const inputClass = "w-full px-4 py-3 border border-brand-border rounded-xl bg-brand-lighter text-brand-dark placeholder-brand-muted focus:outline-none focus:bg-white focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-sm";
const labelClass = "block text-sm font-semibold text-brand-dark mb-2";

export default function ProjectsClient({ initialProjects }: { initialProjects: MockProject[] }) {
  const [projectsList, setProjectsList] = useState<MockProject[]>(initialProjects);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProject, setCurrentProject] = useState<Partial<MockProject> | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNew = () => {
    setCurrentProject({ title: "", description: "", content: "", projectUrl: "", githubUrl: "", imageUrl: "", tags: [], isFeatured: false });
    setIsEditing(true);
    setError(null);
  };

  const handleEdit = (project: MockProject) => {
    setCurrentProject(project);
    setIsEditing(true);
    setError(null);
  };

  const handleDelete = (id: string) => {
    if (!confirm("이 프로젝트를 삭제하시겠습니까?")) return;
    setProjectsList((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (!currentProject?.title) { setError("프로젝트 제목은 필수입니다."); return; }
    setIsPending(true);
    const formData = new FormData(e.currentTarget);
    const tags = (formData.get("tags") as string)?.split(",").map((t) => t.trim()).filter(Boolean) || [];
    await new Promise((r) => setTimeout(r, 300));
    const saved: MockProject = {
      id: currentProject.id || Date.now().toString(),
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      content: formData.get("content") as string,
      projectUrl: formData.get("projectUrl") as string,
      githubUrl: formData.get("githubUrl") as string,
      imageUrl: formData.get("imageUrl") as string,
      tags,
      isFeatured: formData.get("isFeatured") === "true",
      createdAt: currentProject.createdAt || new Date(),
    };
    if (currentProject.id) {
      setProjectsList((prev) => prev.map((p) => (p.id === currentProject.id ? saved : p)));
    } else {
      setProjectsList((prev) => [saved, ...prev]);
    }
    setIsPending(false);
    setIsEditing(false);
    setCurrentProject(null);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-dark">포트폴리오 관리</h1>
          <p className="text-sm text-brand-sub mt-1">작품과 프로젝트를 추가하고 소개하세요.</p>
        </div>
        {!isEditing && (
          <button onClick={handleNew} className="px-4 py-2.5 bg-brand-primary text-white text-sm font-bold rounded-xl hover:bg-brand-primary-hover transition-colors cursor-pointer">+ 새 프로젝트</button>
        )}
      </div>

      {isEditing && currentProject && (
        <div className="bg-white border border-brand-border rounded-2xl p-6 space-y-5">
          <div className="flex justify-between items-center border-b border-brand-border pb-3">
            <h3 className="text-sm font-bold text-brand-dark">{currentProject.id ? "프로젝트 수정" : "새 프로젝트 추가"}</h3>
            <button onClick={() => setIsEditing(false)} className="text-xs font-semibold text-brand-sub hover:text-brand-text transition-colors">닫기</button>
          </div>
          {error && <div className="p-3.5 text-sm text-brand-error bg-brand-error-bg border border-red-100 rounded-xl">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className={labelClass}>프로젝트명 *</label>
                <input type="text" name="title" defaultValue={currentProject.title || ""} placeholder="예: AI 기반 개인 일정 비서 서비스" required className={inputClass} />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>요약 설명</label>
                <input type="text" name="description" defaultValue={currentProject.description || ""} placeholder="카드에 노출되는 한 줄 설명" className={inputClass} />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>상세 소개 (Markdown 지원)</label>
                <textarea name="content" rows={5} defaultValue={currentProject.content || ""} placeholder="기술 스택, 기여 부분, 성과를 적어보세요." className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>대표 이미지 URL</label>
                <input type="text" name="imageUrl" defaultValue={currentProject.imageUrl || ""} placeholder="https://example.com/image.png" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>기술 스택 태그 (쉼표 구분)</label>
                <input type="text" name="tags" defaultValue={currentProject.tags?.join(", ") || ""} placeholder="React, Next.js, TailwindCSS" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>배포 URL</label>
                <input type="url" name="projectUrl" defaultValue={currentProject.projectUrl || ""} placeholder="https://myproject.com" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>GitHub URL</label>
                <input type="url" name="githubUrl" defaultValue={currentProject.githubUrl || ""} placeholder="https://github.com/user/project" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>대표 작품 설정</label>
                <select name="isFeatured" defaultValue={currentProject.isFeatured ? "true" : "false"} className={inputClass}>
                  <option value="false">일반 프로젝트</option>
                  <option value="true">대표 프로젝트</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-3 border-t border-brand-border">
              <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2.5 bg-brand-light text-brand-text text-sm font-semibold rounded-xl hover:bg-brand-border transition-colors cursor-pointer">취소</button>
              <button type="submit" disabled={isPending} className="px-4 py-2.5 bg-brand-primary text-white text-sm font-bold rounded-xl hover:bg-brand-primary-hover disabled:opacity-50 transition-colors cursor-pointer">{isPending ? "저장 중..." : "저장하기"}</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projectsList.length === 0 ? (
          <div className="col-span-full py-14 text-center bg-white border border-brand-border rounded-2xl text-sm text-brand-sub">등록된 프로젝트가 없습니다. 첫 프로젝트를 등록해 보세요.</div>
        ) : (
          projectsList.map((project) => (
            <div key={project.id} className="bg-white border border-brand-border rounded-2xl p-5 hover:border-brand-primary/30 transition-colors">
              <div className="flex items-start gap-2 mb-3 flex-wrap">
                {project.isFeatured && (<span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-100">대표</span>)}
                {project.tags?.slice(0, 3).map((tag, idx) => (<span key={idx} className="text-[11px] font-medium px-2 py-0.5 rounded bg-blue-50 text-brand-primary">{tag}</span>))}
              </div>
              <h3 className="text-sm font-bold text-brand-dark mb-1.5 truncate">{project.title}</h3>
              <p className="text-xs text-brand-sub leading-relaxed line-clamp-2 mb-4">{project.description || "설명이 없습니다."}</p>
              <div className="flex items-center justify-between pt-3 border-t border-brand-border">
                <span className="text-[11px] text-brand-sub">{new Date(project.createdAt).toLocaleDateString()}</span>
                <div className="flex gap-1.5">
                  <button onClick={() => handleEdit(project)} className="px-3 py-1.5 bg-brand-light hover:bg-blue-50 hover:text-brand-primary text-brand-sub rounded-lg text-xs font-semibold transition-colors cursor-pointer">수정</button>
                  <button onClick={() => handleDelete(project.id)} className="px-3 py-1.5 bg-brand-light hover:bg-red-50 hover:text-brand-error text-brand-sub rounded-lg text-xs font-semibold transition-colors cursor-pointer">삭제</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
