import React from "react";
import ProfileForm from "@/components/ProfileForm";

export default function DashboardPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-extrabold text-brand-dark">프로필 설정</h1>
        <p className="text-sm text-brand-sub mt-1">방문자에게 보여지는 첫인상 카드를 관리하세요.</p>
      </div>
      <ProfileForm initialProfile={null} />
    </div>
  );
}
