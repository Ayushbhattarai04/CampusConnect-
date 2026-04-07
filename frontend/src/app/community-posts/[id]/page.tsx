"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import AppShell from "../../pages/AppShell";

type CommunityPostDetails = {
  communityPostsId: number;
  communityId: number;
  userId: number;
  content: string;
  imageUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
  User?: {
    id: number;
    username?: string;
    email?: string;
  };
  Community?: {
    communityId?: number;
    name?: string;
  };
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:5000";

export default function CommunityPostDetailsPage() {
  const { id } = useParams();

  const postId = useMemo(() => {
    const raw = Array.isArray(id) ? id[0] : id;
    const numeric = Number(raw);
    return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
  }, [id]);

  const [post, setPost] = useState<CommunityPostDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!postId) {
      setLoading(false);
      setError("Invalid post id.");
      return;
    }

    const fetchPost = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(
          `${API_BASE}/api/community-posts/post/${postId}`,
        );
        if (!res.ok) throw new Error(`Failed to load post (${res.status})`);
        const data = await res.json();
        setPost(data);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Could not load post.");
        setPost(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  return (
    <AppShell>
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="p-1.5 -ml-1.5 rounded-lg hover:bg-gray-200/60 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-gray-500" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Community post
              </h1>
              <p className="mt-1 text-sm text-slate-500">Post details</p>
            </div>
          </div>

          {loading ? (
            <div className="mt-6 bg-white rounded-xl shadow-sm p-12 text-center">
              Loading...
            </div>
          ) : error ? (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          ) : !post ? (
            <div className="mt-6 bg-white rounded-xl shadow-sm p-12 text-center">
              <p className="text-gray-500">Post not found.</p>
            </div>
          ) : (
            <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
              {/* USER */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold cursor-pointer">
                  {post.User?.username?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 truncate">
                    {post.User?.username || `User ${post.userId}`}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {post.Community?.name && post.communityId ? (
                      <Link
                        href={`/communities/${post.communityId}`}
                        className="text-sm text-gray-500 hover:text-blue-600 transition-colors"
                      >
                        {post.Community.name}
                      </Link>
                    ) : null}
                    <p className="text-sm text-gray-500">
                      {post.createdAt
                        ? new Date(post.createdAt).toLocaleString()
                        : ""}
                    </p>
                  </div>
                </div>
              </div>

              {/* CONTENT */}
              <p className="text-gray-700 mb-4 whitespace-pre-wrap">
                {post.content}
              </p>

              {/* IMAGE */}
              {post.imageUrl ? (
                <img
                  src={post.imageUrl}
                  alt="Post"
                  className="max-w-full rounded-lg mb-4"
                />
              ) : null}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
