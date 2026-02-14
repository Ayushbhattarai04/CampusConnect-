"use client";
import React, { useState } from "react";
import { MessageCircle, Plus, X } from "lucide-react";

type Post = {
  postId: number | string;
  userId: number | string;
  content: string;
  imageUrl?: string;
  createdAt?: string;
  User?: {
    username?: string;
  };
};

import { useEffect } from "react";

type Comment = {
  commentId: number | string;
  userId: number | string;
  postId: number | string;
  content: string;
  createdAt?: string;
  User?: {
    username?: string;
  };
};

const Feed = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [activePostId, setActivePostId] = useState<number | string | null>(
    null,
  );
  const [newComment, setNewComment] = useState("");
  const [likes, setLikes] = useState<any[]>([]);

  const userData =
    typeof window !== "undefined" ? localStorage.getItem("user") : null;
  let userId = "";
  let username = "";
  if (userData) {
    try {
      const parsed = JSON.parse(userData);
      userId = parsed.id;
      username = parsed.username;
    } catch {}
  }

  // Fetch posts on mount
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/post/");
        if (res.ok) {
          const data = await res.json();
          setPosts(data);
        }
      } catch (err) {
        console.error("Failed to fetch posts:", err);
      }
    };
    fetchPosts();
  }, []);

  // form state
  const [newPost, setNewPost] = useState({
    content: "",
    imageUrl: "",
  });

  // CREATE POST
  const handleSubmitPost = async () => {
    if (!newPost.content.trim()) return;
    try {
      const response = await fetch("http://localhost:5000/api/post/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          username,
          content: newPost.content,
          imageUrl: newPost.imageUrl,
        }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to create post:", errorText);
        return;
      }
      const createdPost = await response.json();
      setPosts((prev) => [createdPost, ...prev]);
      setNewPost({ content: "", imageUrl: "" });
      setShowCreateModal(false);
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  // Helper to fetch all comments (could be optimized to fetch only for a post)
  const fetchComments = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/comments/");
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (err) {
      console.error("Failed to fetch comments:", err);
    }
  };

  const handleSubmitComment = async (postId: number | string) => {
    if (!newComment.trim()) return;
    try {
      const response = await fetch("http://localhost:5000/api/comments/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          username,
          postId,
          content: newComment,
        }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to create comment:", errorText);
        return;
      }
      setNewComment("");
      await fetchComments(); 
    } catch (error) {
      console.error("Error creating comment:", error);
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      {/* HEADER */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Feed</h1>
        </div>
      </div>

      {/* POSTS */}
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        {posts.map((post: any) => (
          <div key={post.postId} className="bg-white rounded-xl shadow-sm p-6">
            {/* USER */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                {post.User?.username?.charAt(0).toUpperCase() ||
                  post.username?.charAt(0).toUpperCase() ||
                  "U"}
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  {post.User?.username ||
                    post.username ||
                    `User ${post.userId}`}
                </p>
                <p className="text-sm text-gray-500">
                  {post.createdAt
                    ? new Date(post.createdAt).toLocaleString()
                    : ""}
                </p>
              </div>
            </div>
            {/* CONTENT */}
            <p className="text-gray-700 mb-4">{post.content}</p>
            {/* IMAGE */}
            {post.imageUrl && (
              <img
                src={post.imageUrl}
                alt="Post"
                className="max-w-full rounded-lg mb-4"
              />
            )}
            {/* ACTIONS */}
            <div className="flex items-center gap-4 pt-4 border-t mt-4">
              <button
                className="flex items-center gap-2 text-gray-600 hover:text-blue-600"
                onClick={() => {
                  setActivePostId(post.postId);
                  setShowCommentModal(true);
                }}
              >
                <MessageCircle size={20} />
                Comment
              </button>
            </div>
            {/* COMMENTS MODAL */}
            {showCommentModal && activePostId === post.postId && (
              <div className="fixed inset-0 bg-white/10 backdrop-blur-md flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl max-w-lg w-full p-6">
                  {/* MODAL HEADER */}
                  <div className="flex justify-between mb-6">
                    <h2 className="text-2xl font-bold">Comments</h2>
                    <button onClick={() => setShowCommentModal(false)}>
                      <X size={24} />
                    </button>
                  </div>
                  {/* COMMENT LIST */}
                  <div className="space-y-4 max-h-60 overflow-y-auto">
                    {comments
                      .filter((c) => c.postId === post.postId)
                      .map((comment) => (
                        <div
                          key={comment.commentId}
                          className="bg-gray-100 rounded-lg p-4"
                        >
                          <p className="font-semibold text-gray-900">
                            {comment.User?.username || `User ${comment.userId}`}
                          </p>
                          <p className="text-gray-700">{comment.content}</p>
                          <p className="text-sm text-gray-500">
                            {comment.createdAt
                              ? new Date(comment.createdAt).toLocaleString()
                              : ""}
                          </p>
                        </div>
                      ))}
                  </div>
                  {/* ADD COMMENT FORM */}
                  <div className="flex gap-2 mt-4">
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-lg"
                    />
                    <button
                      onClick={() => handleSubmitComment(post.postId)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                    >
                      Post
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* FLOATING CREATE BUTTON */}
      <button
        onClick={() => setShowCreateModal(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 flex items-center justify-center"
      >
        <Plus size={28} />
      </button>

      {/* CREATE POST MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-white/10 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6">
            {/* MODAL HEADER */}
            <div className="flex justify-between mb-6">
              <h2 className="text-2xl font-bold">Create Post</h2>
              <button onClick={() => setShowCreateModal(false)}>
                <X size={24} />
              </button>
            </div>

            {/* CONTENT */}
            <textarea
              placeholder="What's on your mind?"
              rows={5}
              value={newPost.content}
              onChange={(e) =>
                setNewPost({ ...newPost, content: e.target.value })
              }
              className="w-full px-4 py-3 border rounded-lg mb-4"
            />

            {/* IMAGE URL */}
            <input
              type="text"
              placeholder="Paste image URL (optional)"
              value={newPost.imageUrl}
              onChange={(e) =>
                setNewPost({ ...newPost, imageUrl: e.target.value })
              }
              className="w-full px-4 py-3 border rounded-lg mb-4"
            />

            {/* ACTIONS */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 border rounded-lg py-3"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmitPost}
                className="flex-1 bg-blue-600 text-white rounded-lg py-3"
              >
                Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Feed;
