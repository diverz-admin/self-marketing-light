"use client";

import React, { useState, useTransition } from "react";
import { saveProject, deleteProject } from "@/app/dashboard/actions";
import { Project } from "@/db/schema";

interface ProjectsClientProps {
  initialProjects: Project[];
}

export default function ProjectsClient({ initialProjects }: ProjectsClientProps) {
  const [projectsList, setProjectsList] = useState<Project[]>(initialProjects);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProject, setCurrentProject] = useState<Partial<Project> | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // 새 프로젝트 폼 열기
  const handleNewProject = () => {
    setCurrentProject({
      title: "",
      description: "",
      content: "",
      projectUrl: "",
      githubUrl: "",
      imageUrl: "",
      tags: [],
      isFeatured: false,
    });
    setIsEditing(true);
    setError(null);
  };

  // 기존 프로젝트 수정 폼 열기
  const handleEditProject = (project: Project) => {
    setCurrentProject(project);
    setIsEditing(true);
    setError(null);
  };

  // 삭제 처리
  const handleDelete = async (id: string) => {
    if (!confirm("정말 이 프로젝트를 삭제하시겠습니까?")) return;

    startTransition(async () => {
      const result = await deleteProject(id);
      if (result.success) {
        setProjectsList(prev => prev.filter(p => p.id !== id));
      } else if (result.error) {
        alert(result.error);
      }
    });
  };

  // 저장 처리
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!currentProject?.title) {
      setError("프로젝트 제목은 필수입니다.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const tagsString = formData.get("tags") as string;
    const tagsArray = tagsString
      ? tagsString
          .split(",")
          .map(t => t.trim())
          .filter(Boolean)
      : [];

    const projectData = {
      id: currentProject.id,
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      content: formData.get("content") as string,
      projectUrl: formData.get("projectUrl") as string,
      githubUrl: formData.get("githubUrl") as string,
      imageUrl: formData.get("imageUrl") as string,
      tags: tagsArray,
      isFeatured: formData.get("isFeatured") === "true",
    };

    startTransition(async () => {
      const result = await saveProject(projectData);
      if (result.success) {
        // 성공 시 데이터 리로드 처리 (단순 페이지 리프레시로 서버 컴포넌트 갱신 유도)
        window.location.reload();
      } else if (result.error) {
        setError(result.error);
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Header and Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-extrabold text-slate-800">🚀 포트폴리오 관리</h1>
          <p className="text-sm text-slate-500 mt-1">자신의 작품과 프로젝트를 추가하고 소개해보세요.</p>
        </div>
        {!isEditing && (
          <button
            onClick={handleNewProject}
            className="px-5 py-3 bg-brand-primary text-white font-bold rounded-2xl hover:bg-brand-secondary hover:shadow-lg hover:shadow-indigo-500/25 active:scale-[0.98] transition-all duration-200 text-sm cursor-pointer"
          >
            + 새 프로젝트 추가
          </button>
        )}
      </div>

      {/* Editing Form */}
      {isEditing && currentProject && (
        <div className="bg-white border border-slate-100 shadow-xl rounded-3xl p-6 sm:p-8 space-y-6 animate-fadeIn">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="text-lg font-bold text-slate-800">
              {currentProject.id ? "프로젝트 수정" : "새 프로젝트 생성"}
            </h3>
            <button
              onClick={() => setIsEditing(false)}
              className="text-slate-400 hover:text-slate-600 transition-colors text-sm font-semibold"
            >
              닫기
            </button>
          </div>

          {error && (
            <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-2xl">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-500 mb-2">프로젝트명 *</label>
                <input
                  type="text"
                  name="title"
                  defaultValue={currentProject.title || ""}
                  placeholder="예: AI 기반 개인 일정 비서 서비스"
                  required
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-slate-50/50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all duration-200 text-sm"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-500 mb-2">프로젝트 요약 설명</label>
                <input
                  type="text"
                  name="description"
                  defaultValue={currentProject.description || ""}
                  placeholder="리스트 및 카드 뷰에 노출되는 한 줄 설명입니다."
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-slate-50/50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all duration-200 text-sm"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-500 mb-2">프로젝트 상세 소개 (Markdown 지원)</label>
                <textarea
                  name="content"
                  rows={5}
                  defaultValue={currentProject.content || ""}
                  placeholder="프로젝트 상세 설명, 적용 기술, 기여한 부분 등을 적어보세요."
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-slate-50/50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all duration-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2">대표 이미지 URL</label>
                <input
                  type="text"
                  name="imageUrl"
                  defaultValue={currentProject.imageUrl || ""}
                  placeholder="https://example.com/image.png"
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-slate-50/50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all duration-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2">기술 스택 태그 (쉼표로 구분)</label>
                <input
                  type="text"
                  name="tags"
                  defaultValue={currentProject.tags?.join(", ") || ""}
                  placeholder="React, Next.js, TailwindCSS"
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-slate-50/50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all duration-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2">배포(라이브) URL</label>
                <input
                  type="url"
                  name="projectUrl"
                  defaultValue={currentProject.projectUrl || ""}
                  placeholder="https://myproject.com"
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-slate-50/50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all duration-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2">GitHub URL</label>
                <input
                  type="url"
                  name="githubUrl"
                  defaultValue={currentProject.githubUrl || ""}
                  placeholder="https://github.com/myusername/project"
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-slate-50/50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all duration-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2">대표 작품 설정</label>
                <select
                  name="isFeatured"
                  defaultValue={currentProject.isFeatured ? "true" : "false"}
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-slate-50/50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all duration-200 text-sm"
                >
                  <option value="false">일반 프로젝트</option>
                  <option value="true">대표 프로젝트 (메인 최상단 전시)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-sm transition-all cursor-pointer"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-5 py-2.5 bg-brand-primary text-white font-bold rounded-2xl hover:bg-brand-secondary hover:shadow-lg hover:shadow-indigo-500/20 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 text-sm cursor-pointer"
              >
                {isPending ? "저장 중..." : "프로젝트 저장"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Projects List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projectsList.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white border border-slate-100 rounded-3xl text-slate-400 text-sm">
            등록된 프로젝트가 없습니다. 첫 프로젝트를 등록해 브랜딩을 시작해 보세요!
          </div>
        ) : (
          projectsList.map(project => (
            <div
              key={project.id}
              className="bg-white border border-slate-100 shadow-sm rounded-3xl p-6 hover:shadow-md hover:border-slate-200 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {project.isFeatured && (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-100">
                        ⭐ 대표
                      </span>
                    )}
                    {project.tags && project.tags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-brand-primary"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2 truncate">{project.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-4">
                  {project.description || "설명이 작성되지 않았습니다."}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-4">
                <span className="text-[10px] text-slate-400">
                  등록일: {new Date(project.createdAt).toLocaleDateString()}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditProject(project)}
                    className="px-3 py-1.5 bg-slate-50 hover:bg-indigo-50 hover:text-brand-primary text-slate-600 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="px-3 py-1.5 bg-slate-50 hover:bg-rose-50 hover:text-rose-600 text-slate-600 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    삭제
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
