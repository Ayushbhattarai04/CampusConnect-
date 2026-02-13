import React, { useState } from "react";
import { Heart, MessageCircle, Plus, X, Send } from "lucide-react";

const Feed = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);

  // Dummy posts data for layout
  const posts = [
    {
      id: 1,
      userId: 1,
      title: "My first post",
      body: "This is the content of my first post. I'm excited to share this with everyone!",
      likes: 42,
      liked: false,
      commentCount: 5,
    },
    {
      id: 2,
      userId: 2,
      title: "Another amazing day",
      body: "Just wanted to share some thoughts about this wonderful day. The weather is great and I'm feeling productive!",
      likes: 18,
      liked: true,
      commentCount: 3,
    },
    {
      id: 3,
      userId: 3,
      title: "Learning something new",
      body: "Today I learned about React hooks and state management. It's fascinating how everything works together!",
      likes: 67,
      liked: false,
      commentCount: 12,
    },
  ];

  // Dummy comments for the modal
  const comments = [
    {
      id: 1,
      name: "John Doe",
      body: "This is a great post! Thanks for sharing.",
    },
    {
      id: 2,
      name: "Jane Smith",
      body: "I completely agree with this perspective.",
    },
    {
      id: 3,
      name: "Mike Johnson",
      body: "Very insightful, looking forward to more content like this.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Feed</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6"
            >
              {/* Post Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                  {post.userId}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    User {post.userId}
                  </p>
                  <p className="text-sm text-gray-500">Just now</p>
                </div>
              </div>

              {/* Post Content */}
              <h2 className="text-xl font-bold text-gray-900 mb-2 capitalize">
                {post.title}
              </h2>
              <p className="text-gray-700 mb-4">{post.body}</p>

              {/* Post Actions */}
              <div className="flex items-center gap-6 pt-4 border-t">
                <button
                  className={`flex items-center gap-2 transition-colors ${
                    post.liked
                      ? "text-red-600"
                      : "text-gray-600 hover:text-red-600"
                  }`}
                >
                  <Heart
                    size={20}
                    className={post.liked ? "fill-current" : ""}
                  />
                  <span className="font-medium">{post.likes}</span>
                </button>

                <button
                  onClick={() => setShowCommentModal(true)}
                  className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <MessageCircle size={20} />
                  <span className="font-medium">{post.commentCount}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Create Button */}
      <button
        onClick={() => setShowCreateModal(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all hover:scale-110 flex items-center justify-center"
      >
        <Plus size={28} />
      </button>

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-white/10 backdrop-blur-md  flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Create Post</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  placeholder="Enter post title..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content
                </label>
                <textarea
                  placeholder="What's on your mind?"
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Cancel
                </button>
                <button className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comments Modal */}
      {showCommentModal && (
        <div className="fixed inset-0 bg-white/10 backdrop-blur-md  flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-black border-b">
              <h2 className="text-2xl font-bold text-gray-900">Comments</h2>
              <button
                onClick={() => setShowCommentModal(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X size={24} />
              </button>
            </div>

            {/* Post Preview */}
            <div className="p-6 border-b bg-gray-50">
              <h3 className="font-bold text-gray-900 mb-2 capitalize">
                My first post
              </h3>
              <p className="text-gray-700 text-sm">
                This is the content of my first post. I'm excited to share this
                with everyone!
              </p>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {comment.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 text-sm">
                          {comment.name}
                        </p>
                        <p className="text-gray-700 text-sm mt-1">
                          {comment.body}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Comment */}
            <div className="p-6 border-t">
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Write a comment..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
                  <Send size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Feed;
