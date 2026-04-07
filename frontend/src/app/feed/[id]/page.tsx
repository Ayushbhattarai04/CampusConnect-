"use client";
import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Send,
  Clock,
  Trash2,
  Pencil,
  AlertCircle,
} from "lucide-react";
import AppShell from "../../pages/AppShell";

type Post = {
  postId: number | string;
  userId: number | string;
  content: string;
  imageUrl?: string;
  createdAt?: string;
  User?: { username?: string };
};

type Comment = {
  commentId: number | string;
  userId: number | string;
  postId: number | string;
  content: string;
  createdAt?: string;
  User?: { username?: string };
};

type Like = {
  likeId: number | string;
  userId: number | string;
  postId: number | string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";

export default function PostDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [likes, setLikes] = useState<Like[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const currentUser = useMemo(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }, []);

  const userId = currentUser?.id ? String(currentUser.id) : "";

  // Fetch posts
  useEffect(() => {
    if (!id) return;
    const fetchAll = async () => {
      setLoading(true);
      setError("");
      try {
        const rawId = Array.isArray(id) ? id[0] : id;

        const [postRes, commentsRes, likesRes] = await Promise.all([
          fetch(`${API_BASE}/api/post/${rawId}`),
          fetch(`${API_BASE}/api/comments/`),
          fetch(`${API_BASE}/api/likes/`),
        ]);

        const postData = await postRes.json();
        console.log("Post API response:", JSON.stringify(postData, null, 2));
        if (!postRes.ok) throw new Error("Post not found.");
        setPost(postData.data ?? postData);

        if (commentsRes.ok) {
          const c = await commentsRes.json();
          setComments(Array.isArray(c) ? c : []);
        }

        if (likesRes.ok) {
          const l = await likesRes.json();
          setLikes(Array.isArray(l) ? l : []);
        }
      } catch (e: any) {
        setError(e?.message || "Could not load post.");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id]);

  const postComments = comments.filter(
    (c) => String(c.postId) === String(post?.postId),
  );
  const likeCount = likes.filter(
    (l) => String(l.postId) === String(post?.postId),
  ).length;
  const hasLiked = likes.some(
    (l) =>
      String(l.postId) === String(post?.postId) && String(l.userId) === userId,
  );
  const isOwner = String(post?.userId) === userId;

  const handleLike = async () => {
    if (!post) return;
    if (hasLiked) {
      await fetch(`${API_BASE}/api/likes/${post.postId}/${userId}`, {
        method: "DELETE",
      });
    } else {
      await fetch(`${API_BASE}/api/likes/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, postId: post.postId }),
      });
    }
    const res = await fetch(`${API_BASE}/api/likes/`);
    if (res.ok) setLikes(await res.json());
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !post) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/comments/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          username: currentUser?.username,
          postId: post.postId,
          content: newComment,
        }),
      });
      if (!res.ok) throw new Error("Failed to post comment.");
      setNewComment("");
      const updated = await fetch(`${API_BASE}/api/comments/`);
      if (updated.ok) setComments(await updated.json());
    } catch (e: any) {
      setError(e?.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!post) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API_BASE}/api/post/${post.postId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete post.");
      router.push("/feed");
    } catch (e: any) {
      setError(e?.message);
    } finally {
      setDeleting(false);
    }
  };

  const avatarInitial = (name?: string) => name?.charAt(0).toUpperCase() ?? "U";

  //Loading state
  if (loading) {
    return (
      <AppShell>
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-slate-400">
            <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm">Loading post...</p>
          </div>
        </div>
      </AppShell>
    );
  }

  //Error state
  if (error || !post) {
    return (
      <AppShell>
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="bg-white border border-red-200 rounded-2xl p-8 max-w-sm text-center shadow-sm">
            <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <p className="text-slate-700 font-medium mb-1">
              Something went wrong
            </p>
            <p className="text-sm text-red-500 mb-4">
              {error || "Post not found."}
            </p>
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline mx-auto"
            >
              <ArrowLeft className="w-4 h-4" /> Go back
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="h-screen bg-slate-50">
        <div className=" mx-auto px-4 sm:px-6 py-8">
          {/* Back button*/}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Feed
          </button>

          <div className="grid grid-cols-1  lg:grid-cols-2 gap-6 items-start">
            {/* Left Column*/}
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                {/* Author */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-11 h-11 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-lg">
                    {avatarInitial(post.User?.username)}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">
                      {post.User?.username ?? `User ${post.userId}`}
                    </p>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {post.createdAt
                        ? new Date(post.createdAt).toLocaleString()
                        : "Unknown date"}
                    </p>
                  </div>

                  {/* Owner actions */}
                  {isOwner && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => router.push(`/feed/${post.postId}/edit`)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  )}
                </div>

                {/* Content */}
                <p className="text-slate-800 leading-relaxed text-[15px] mb-4 whitespace-pre-line">
                  {post.content}
                </p>

                {/* Image */}
                {post.imageUrl && (
                  <img
                    src={post.imageUrl}
                    alt="Post"
                    className="w-full rounded-xl object-cover max-h-80 mb-4"
                  />
                )}

                {/* Like */}
                <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
                  <button
                    onClick={handleLike}
                    className={`flex items-center gap-2 text-sm transition-colors ${
                      hasLiked
                        ? "text-red-500 hover:text-red-600"
                        : "text-slate-500 hover:text-red-500"
                    }`}
                  >
                    <Heart
                      className="w-5 h-5"
                      fill={hasLiked ? "currentColor" : "none"}
                    />
                    <span>
                      {likeCount} {likeCount === 1 ? "like" : "likes"}
                    </span>
                  </button>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <MessageCircle className="w-5 h-5" />
                    <span>
                      {postComments.length}{" "}
                      {postComments.length === 1 ? "comment" : "comments"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Delete confirm */}
              {showDeleteConfirm && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <p className="text-sm font-medium">
                      Delete this post? This cannot be undone.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      className="px-3 py-1.5 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      {deleting ? "Deleting..." : "Yes, delete"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT COLOUMN*/}
            <div
              className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col"
              style={{ minHeight: "500px" }}
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-100">
                <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-blue-500" />
                  Comments
                  {postComments.length > 0 && (
                    <span className="ml-1 text-xs bg-blue-50 text-blue-600 font-medium px-2 py-0.5 rounded-full">
                      {postComments.length}
                    </span>
                  )}
                </h2>
              </div>

              {/* Comment list */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {postComments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12">
                    <MessageCircle className="w-10 h-10 text-slate-200 mb-3" />
                    <p className="text-slate-500 text-sm">No comments yet.</p>
                    <p className="text-slate-400 text-xs mt-1">
                      Be the first to leave a comment!
                    </p>
                  </div>
                ) : (
                  postComments.map((comment) => (
                    <div key={comment.commentId} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-semibold text-sm shrink-0">
                        {avatarInitial(comment.User?.username)}
                      </div>
                      <div className="flex-1">
                        <div className="bg-slate-50 rounded-2xl rounded-tl-none px-4 py-3">
                          <p className="font-semibold text-slate-800 text-sm mb-1">
                            {comment.User?.username ?? `User ${comment.userId}`}
                          </p>
                          <p className="text-slate-700 text-sm leading-relaxed">
                            {comment.content}
                          </p>
                        </div>
                        {comment.createdAt && (
                          <p className="text-xs text-slate-400 mt-1 ml-2">
                            {new Date(comment.createdAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Comment input */}
              <div className="px-6 py-4 border-t border-slate-100">
                {currentUser ? (
                  <div className="flex gap-3 items-end">
                    <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm shrink-0">
                      {avatarInitial(currentUser.username)}
                    </div>
                    <div className="flex-1 relative">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSubmitComment();
                          }
                        }}
                        placeholder="Write a comment... (Enter to post)"
                        rows={2}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none pr-12"
                      />
                      <button
                        onClick={handleSubmitComment}
                        disabled={!newComment.trim() || submitting}
                        className="absolute bottom-2.5 right-2.5 p-1.5 rounded-lg bg-blue-600 text-white disabled:bg-slate-200 disabled:text-slate-400 hover:bg-blue-700 transition-colors"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 text-center py-2">
                    Log in to leave a comment.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
