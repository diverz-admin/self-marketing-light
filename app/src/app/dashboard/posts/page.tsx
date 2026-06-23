import React from "react";
import PostsClient from "@/components/PostsClient";

export default function DashboardPostsPage() {
  return (
    <div>
      <PostsClient initialPosts={[]} />
    </div>
  );
}
