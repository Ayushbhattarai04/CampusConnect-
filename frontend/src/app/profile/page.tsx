"use client";
import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  PenLine,
  X,
  Check,
  Mail,
  Building2,
  Hash,
} from "lucide-react";

interface ProfileData {
  name: string;
  username: string;
  email: string;
  bio: string;
  institution: string;
  studId: string;
  profilepic?: string;
}

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

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

export default function Profile() {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState<number | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [activeTab, setActiveTab] = useState<
    "Posts" | "Events" | "Jobs" | "Tutions" | "Communities"
  >("Posts");

  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postsError, setPostsError] = useState("");
  const [likes, setLikes] = useState<number>(0);
  const [draft, setDraft] = useState<ProfileData>({
    name: "",
    username: "",
    email: "",
    bio: "",
    institution: "",
    studId: "",
  });

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/profile/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: draft.username,
          email: draft.email,
          institution: draft.institution,
          studId: draft.studId,
          bio: draft.bio,
          profilepic: draft.profilepic,
        }),
      });
      if (!res.ok) throw new Error("Failed to save profile");
      const data = await res.json();
      const merged: ProfileData = {
        name: draft.name,
        username: data?.User?.username ?? draft.username,
        email: data?.User?.email ?? draft.email,
        institution: data?.User?.institution ?? draft.institution,
        studId: data?.User?.studId ?? draft.studId,
        bio: data?.bio ?? draft.bio,
        profilepic: data?.User?.profilepic ?? draft.profilepic,
      };
      setProfile(merged);
      setDraft(merged);
      setEditing(false);

      const stored = localStorage.getItem("user");
      if (stored) {
        try {
          const u = JSON.parse(stored);
          const updated = {
            ...u,
            username: merged.username,
            email: merged.email,
            institution: merged.institution,
            studId: merged.studId,
            profilepic: merged.profilepic,
          };
          localStorage.setItem("user", JSON.stringify(updated));
          localStorage.setItem("username", updated.username);
        } catch (e) {
          console.warn("Could not update localStorage user:", e);
        }
      }
    } catch (e: any) {
      setError(e?.message || "Could not save profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) setDraft(profile);
    setEditing(false);
  };

  useEffect(() => {
    const fetchProfile = async (id: number) => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/profile/${id}`);
        if (!res.ok) throw new Error("Failed to load profile");
        const data = await res.json();

        let local: any = null;
        const stored = localStorage.getItem("user");
        if (stored) {
          try {
            local = JSON.parse(stored);
          } catch (e) {
            console.warn("Could not parse localStorage user:", e);
          }
        }

        const mapped: ProfileData = {
          name: local?.username || data?.User?.username || "",
          username: data?.User?.username || local?.username || "",
          email: data?.User?.email || local?.email || "",
          bio: data?.bio || "",
          institution: data?.User?.institution || local?.institution || "",
          studId: data?.User?.studId || local?.studId || "",
          profilepic: data?.User?.profilepic || local?.profilepic || "",
        };
        setProfile(mapped);
        setDraft(mapped);
      } catch (e: any) {
        setError(e?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    const stored = localStorage.getItem("user");
    if (!stored) {
      setError("Please login to view your profile.");
      setLoading(false);
      return;
    }
    try {
      const parsed = JSON.parse(stored);
      if (!parsed?.id) {
        setError("Invalid session. Please login again.");
        setLoading(false);
        return;
      }
      setUserId(parsed.id);
      fetchProfile(parsed.id);
    } catch {
      setError("Invalid session. Please login again.");
      setLoading(false);
    }
  }, []);

  // Fetch user's posts
  useEffect(() => {
    const fetchMyPosts = async () => {
      if (!userId) return;
      setPostsLoading(true);
      setPostsError("");
      try {
        const res = await fetch(`${API_BASE_URL}/api/post/`);
        if (!res.ok) throw new Error("Failed to fetch posts");
        const data = await res.json();
        const allPosts: Post[] = Array.isArray(data) ? data : [];
        setPosts(allPosts.filter((p) => String(p.userId) === String(userId)));
      } catch (e: any) {
        setPostsError(e?.message || "Could not load posts.");
      } finally {
        setPostsLoading(false);
      }
    };

    fetchMyPosts();
  }, [userId]);

  const initials =
    (profile?.name || "")
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "?";

  const tabs = ["Posts", "Events", "Jobs", "Tutions", "Communities"] as const;

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="w-7 h-7 border-2 border-gray-200 border-t-orange-400 rounded-full animate-spin" />
      </div>
    );
  }

  // const [posts, setPosts] = useState([]);
  // const [events, setEvents] = useState([]);
  // const [jobs, setJobs] = useState([]);
  // const [tutions, setTutions] = useState([]);
  // const [communities, setCommunities] = useState([]);

  // Fetch users posts
  // useEffect(() => {
  //   const fetchUserPosts = async () => {
  //     if (!userId) return;
  //     try {
  //       const res = await fetch(`${API_BASE_URL}/api/posts/user/${userId}`);
  //       if (!res.ok) throw new Error("Failed to fetch posts");
  //       const data = await res.json();
  //       setPosts(data.posts || []);
  //     } catch (e) {
  //       console.error("Error fetching posts:", e);
  //     }
  //   };

  //   fetchUserPosts();
  // }, [userId]);

  // Fetch users events


  // if no profile and there's an error, just show the error
  if (!profile) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="w-full max-w-7xl">
        <button
          onClick={() => window.history.back()}
          className="p-1.5 -ml-1.5 rounded-lg hover:bg-gray-200/60 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-5 pt-6 pb-16">
        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="bg-stone-50 pt-10 overflow-hidden">
          <div className="px-6 pb-6">
            {/* Avatar + actions */}
            <div className="flex items-end justify-between -mt-9 mb-4">
              <div className="w-20 h-20 rounded-full bg-slate-900 flex items-center justify-center text-white text-lg font-semibold shadow-md">
                {profile.profilepic || initials}
              </div>

              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium border border-gray-200 text-slate-900 rounded-xl hover:bg-stone-50 transition-all"
                >
                  <PenLine className="w-3.5 h-3.5" />
                  Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium border border-gray-200 text-gray-500 rounded-xl hover:bg-stone-50 transition-all"
                  >
                    <X className="w-3.5 h-3.5" /> Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-slate-900 text-white rounded-xl hover:opacity-90 transition-all disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5" />
                    {saving ? "Saving..." : "Save"}
                  </button>
                </div>
              )}
            </div>

            {/* Name + username */}
            {editing ? (
              <div className="space-y-2 mb-3">
                <input
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-400/30"
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  placeholder="Username"
                />
              </div>
            ) : (
              <div className="mb-3">
                <h1 className="text-lg font-semibold text-slate-900">
                  {profile.name || "—"}
                </h1>
                <p className="text-sm text-gray-400">
                  @{profile.username || "—"}
                </p>
              </div>
            )}

            {/* Bio */}
            {editing ? (
              <textarea
                className="w-full mb-5 px-3 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-400/30 resize-none h-20"
                value={draft.bio}
                onChange={(e) => setDraft({ ...draft, bio: e.target.value })}
                placeholder="Short bio..."
              />
            ) : (
              <p className="text-sm text-gray-500 leading-relaxed mb-5">
                {profile.bio || (
                  <span className="italic text-gray-400">No bio</span>
                )}
              </p>
            )}

            <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400 mb-4">
              Details
            </h2>

            <div className="space-y-0.5">
              <DetailField
                icon={Mail}
                label="Email"
                value={draft.email}
                display={profile.email}
                editing={editing}
                onChange={(v) => setDraft({ ...draft, email: v })}
              />
              <DetailField
                icon={Building2}
                label="Institution"
                value={draft.institution}
                display={profile.institution}
                editing={editing}
                onChange={(v) => setDraft({ ...draft, institution: v })}
              />
              <DetailField
                icon={Hash}
                label="Student ID"
                value={draft.studId}
                display={profile.studId}
                editing={editing}
                onChange={(v) => setDraft({ ...draft, studId: v })}
                mono
              />
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-380 mx-auto border-b border-gray-400 border" />

      {/* Tabs — fixed active state */}
      <div className="mt-5 mx-auto max-w-7xl bg-stone-50">
        {tabs.map((tab) => (
          <label key={tab} className="text-xl m-20 text-gray-500">
            <button
              onClick={() => setActiveTab(tab)}
              className={`transition-all duration-300 ${
                activeTab === tab
                  ? "text-orange-500 text-2xl"
                  : "hover:text-orange-400"
              }`}
            >
              {tab}
            </button>
          </label>
        ))}
      </div>

      {/* Tab Content */}
      <div className="max-w-4xl mx-auto px-5 pb-16">
        {activeTab === "Posts" && (
          <div className="mt-6 space-y-4">
            {postsLoading && (
              <div className="flex items-center justify-center py-10">
                <div className="w-7 h-7 border-2 border-gray-200 border-t-orange-400 rounded-full animate-spin" />
              </div>
            )}

            {!postsLoading && postsError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {postsError}
              </div>
            )}

            {!postsLoading && !postsError && posts.length === 0 && (
              <div className="rounded-xl border border-gray-200 bg-white px-4 py-6 text-sm text-gray-500 text-center">
                No posts yet.
              </div>
            )}

            {!postsLoading &&
              !postsError &&
              posts.map((post) => {
                const postUsername =
                  post.User?.username || profile?.username || "User";
                const avatarLetter =
                  postUsername?.charAt(0)?.toUpperCase?.() || "U";

                return (
                  <div
                    key={post.postId}
                    className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold">
                        {avatarLetter}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {postUsername}
                        </p>
                        <p className="text-sm text-gray-500">
                          {post.createdAt
                            ? new Date(post.createdAt).toLocaleString()
                            : ""}
                        </p>
                      </div>
                    </div>

                    <p className="text-sm text-gray-800 whitespace-pre-line">
                      {post.content}
                    </p>

                    {post.imageUrl && (
                      <img
                        src={post.imageUrl}
                        alt="Post image"
                        className="mt-4 w-full max-h-105 object-cover rounded-xl border border-gray-100"
                      />
                    )}
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}

function DetailField({
  icon: Icon,
  label,
  value,
  display,
  editing,
  onChange,
  mono,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  display: string;
  editing: boolean;
  onChange: (v: string) => void;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-stone-50 last:border-none">
      <div className="w-8 h-8 rounded-lg bg-stone-50 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-gray-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-0.5">
          {label}
        </p>
        {editing ? (
          <input
            className="w-full px-2 py-1 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-400/30"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        ) : (
          <p
            className={`text-sm text-slate-900 truncate ${mono ? "font-mono" : "font-medium"}`}
            style={mono ? { fontSize: "0.8rem" } : {}}
          >
            {display || "—"}
          </p>
        )}
      </div>
    </div>
  );
}
