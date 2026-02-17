"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  MessageCircle,
  Plus,
  X,
  Users,
  Briefcase,
  TrendingUp,
  Heart,
  Calendar,
  EllipsisVertical,
  Link,
  Trash,
  Pencil,
} from "lucide-react";

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

type Like = {
  likeId: number | string;
  userId: number | string;
  postId: number | string;
  createdAt?: string;
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
  const [likes, setLikes] = useState<Like[]>([]);

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

  // Fetch posts
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

  // Form state
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

  // Fetch comments for a specific post
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

  // Submit comment and refresh comments immediately
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
      // Immediately fetch updated comments
      await fetchComments();
    } catch (error) {
      console.error("Error creating comment:", error);
    }
  };

  // Fetch comments when modal opens
  const handleOpenCommentModal = async (postId: number | string) => {
    setActivePostId(postId);
    setShowCommentModal(true);
    await fetchComments();
  };

  useEffect(() => {
    fetchComments();
    fetchLikes();
  }, []);

  // Fetch all likes from database
  const fetchLikes = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/likes/");
      if (res.ok) {
        const data = await res.json();
        setLikes(data);
      }
    } catch (err) {
      console.error("Failed to fetch likes:", err);
    }
  };

  // Get like count for a post (count from array)
  const getLikeCount = (postId: number | string) => {
    return likes.filter((like) => like.postId === postId).length;
  };

  // Check if current user has liked a post
  const hasUserLiked = (postId: number | string) => {
    return likes.some(
      (like) =>
        like.postId === postId && String(like.userId) === String(userId),
    );
  };

  // Handle like/unlike toggle
  const handleLike = async (postId: number | string) => {
    const userHasLiked = hasUserLiked(postId);

    if (userHasLiked) {
      // Unlike: DELETE the row from database
      try {
        const response = await fetch(
          `http://localhost:5000/api/likes/${postId}/${userId}`,
          {
            method: "DELETE",
          },
        );
        if (!response.ok) {
          console.error("Failed to unlike post");
        }
      } catch (error) {
        console.error("Error unliking post:", error);
      } finally {
        await fetchLikes();
      }
    } else {
      // Like: CREATE a new row in database
      try {
        const response = await fetch("http://localhost:5000/api/likes/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            postId,
          }),
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error("Failed to like post", errorData);
        }
      } catch (error) {
        console.error("Error liking post:", error);
      } finally {
        await fetchLikes();
      }
    }
  };

  // Get comment count for a post
  const getCommentCount = (postId: number | string) => {
    return comments.filter((c) => c.postId === postId).length;
  };

  //toggle dropdown menue for post actions such as edit, delete, copy link etc
 const [openDropdownPostId, setOpenDropdownPostId] = useState<number | string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const toggleDropdown = (postId: number | string) => {
    setOpenDropdownPostId(openDropdownPostId === postId ? null : postId);
  };
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpenDropdownPostId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside as EventListener);
    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside as EventListener,
      );
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* MAIN PAGE */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN - POSTS */}
          <div className="lg:col-span-2 space-y-4  overflow-y-auto">
            {posts.map((post: any) => (
              <div
                key={post.postId}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
              >
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

                  {/* Dropdown menu */}
                  <div className="ml-auto">
                    <button
                      onClick={() => toggleDropdown(post.postId)}
                      className="text-gray-500 hover:text-gray-700 hover:transition-colors"
                    >
                      <EllipsisVertical size={24} />
                    </button>
                  </div>
                  {/* ACTION */}
                  {openDropdownPostId === post.postId && (
                    <div className="absolute  mt-30 ml-140 w-48 bg-white rounded-md shadow-lg z-10">
                      <div className="py-1">
                        <a
                          href="#"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <Link size={16} className="inline mr-2" />
                          Copy Link
                        </a>
                        <a
                          href="#"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <Trash size={16} className="inline mr-2" />
                          Delete Post
                        </a>
                        <a
                          href="#"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <Pencil size={16} className="inline mr-2" />
                          Edit Post
                        </a>
                        
                      </div>
                    </div>
                  )}
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
                    className={`flex items-center gap-2 transition-colors ${
                      hasUserLiked(post.postId)
                        ? "text-red-500 hover:text-red-600"
                        : "text-gray-600 hover:text-red-500"
                    }`}
                    onClick={() => handleLike(post.postId)}
                  >
                    <Heart
                      size={20}
                      fill={hasUserLiked(post.postId) ? "currentColor" : "none"}
                    />
                    <span>{getLikeCount(post.postId)}</span>
                  </button>
                  <button
                    className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
                    onClick={() => handleOpenCommentModal(post.postId)}
                  >
                    <MessageCircle size={20} />
                    <span>
                      Comment{" "}
                      {getCommentCount(post.postId) > 0 &&
                        `(${getCommentCount(post.postId)})`}
                    </span>
                  </button>
                </div>
              </div>
            ))}

            {posts.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <p className="text-gray-500">
                  No posts yet. Be the first to share something!
                </p>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN - SIDEBAR */}
          <div className="lg:col-span-1 space-y-4 max-h-[calc(100vh-120px)] sticky overflow-y-auto custom-scrollbar">
            {/* COMMUNITIES CARD */}
            <div className="bg-white rounded-xl shadow-sm p-6  top-0">
              <div className="flex items-center gap-2 mb-4">
                <Users className="text-blue-600" size={24} />
                <h2 className="text-lg font-bold text-gray-900">Communities</h2>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                  <p className="font-semibold text-gray-900">
                    Tech Enthusiasts
                  </p>
                  <p className="text-sm text-gray-500">1.2k members</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                  <p className="font-semibold text-gray-900">
                    Design Community
                  </p>
                  <p className="text-sm text-gray-500">856 members</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                  <p className="font-semibold text-gray-900">Startups</p>
                  <p className="text-sm text-gray-500">2.3k members</p>
                </div>
              </div>
              <button className="w-full mt-4 py-2 text-blue-600 font-semibold hover:bg-blue-50 rounded-lg transition-colors">
                View All
              </button>
            </div>

            {/* JOBS CARD */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <Briefcase className="text-green-600" size={24} />
                <h2 className="text-lg font-bold text-gray-900">
                  Job Opportunities
                </h2>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                  <p className="font-semibold text-gray-900">
                    Frontend Developer
                  </p>
                  <p className="text-sm text-gray-500">TechCorp • Remote</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                  <p className="font-semibold text-gray-900">UI/UX Designer</p>
                  <p className="text-sm text-gray-500">DesignHub • Hybrid</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                  <p className="font-semibold text-gray-900">Product Manager</p>
                  <p className="text-sm text-gray-500">StartupXYZ • On-site</p>
                </div>
              </div>
              <button className="w-full mt-4 py-2 text-green-600 font-semibold hover:bg-green-50 rounded-lg transition-colors">
                View All Jobs
              </button>
            </div>

            {/* EVENTS CARD */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="text-purple-600" size={24} />
                <h2 className="text-lg font-bold text-gray-900">Events</h2>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                  <p className="font-semibold text-gray-900">
                    Tech Conference 2026
                  </p>
                  <p className="text-sm text-gray-500">3.2k registers</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                  <p className="font-semibold text-gray-900">#AIandML</p>
                  <p className="text-sm text-gray-500">2.8k registers</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                  <p className="font-semibold text-gray-900">Hackathon</p>
                  <p className="text-sm text-gray-500">1.9k registers</p>
                </div>
              </div>
            </div>
            {/* TRENDING CARD */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="text-purple-600" size={24} />
                <h2 className="text-lg font-bold text-gray-900">
                  Trending Topics
                </h2>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                  <p className="font-semibold text-gray-900">#WebDevelopment</p>
                  <p className="text-sm text-gray-500">3.2k posts</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                  <p className="font-semibold text-gray-900">#AIandML</p>
                  <p className="text-sm text-gray-500">2.8k posts</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                  <p className="font-semibold text-gray-900">#RemoteWork</p>
                  <p className="text-sm text-gray-500">1.9k posts</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FLOATING CREATE BUTTON */}
      <button
        onClick={() => setShowCreateModal(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 hover:scale-110 transition-all flex items-center justify-center"
      >
        <Plus size={28} />
      </button>

      {/* CREATE POST MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            {/* MODAL HEADER */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Create Post</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full transition-colors"
              >
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />

            {/* IMAGE URL */}
            <input
              type="text"
              placeholder="Paste image URL (optional)"
              value={newPost.imageUrl}
              onChange={(e) =>
                setNewPost({ ...newPost, imageUrl: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />

            {/* BUTTONS */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 border border-gray-300 rounded-lg py-3 hover:bg-gray-50 font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitPost}
                className="flex-1 bg-blue-600 text-white rounded-lg py-3 hover:bg-blue-700 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!newPost.content.trim()}
              >
                Post
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COMMENTS MODAL */}
      {showCommentModal && activePostId !== null && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl max-h-[80vh] flex flex-col">
            {/* MODAL HEADER */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Comments</h2>
              <button
                onClick={() => setShowCommentModal(false)}
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* COMMENT LIST */}
            <div className="space-y-4 overflow-y-auto flex-1 mb-4">
              {comments
                .filter((c) => c.postId === activePostId)
                .map((comment) => (
                  <div
                    key={comment.commentId}
                    className="bg-gray-50 rounded-lg p-4"
                  >
                    <p className="font-semibold text-gray-900 mb-1">
                      {comment.User?.username || `User ${comment.userId}`}
                    </p>
                    <p className="text-gray-700 mb-2">{comment.content}</p>
                    <p className="text-xs text-gray-500">
                      {comment.createdAt
                        ? new Date(comment.createdAt).toLocaleString()
                        : ""}
                    </p>
                  </div>
                ))}
              {comments.filter((c) => c.postId === activePostId).length ===
                0 && (
                <p className="text-center text-gray-500 py-8">
                  No comments yet. Be the first to comment!
                </p>
              )}
            </div>

            {/* ADD COMMENT FORM */}
            <div className="flex gap-2 pt-4 border-t">
              <input
                type="text"
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && newComment.trim()) {
                    handleSubmitComment(activePostId);
                  }
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              <button
                onClick={() => handleSubmitComment(activePostId)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!newComment.trim()}
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
