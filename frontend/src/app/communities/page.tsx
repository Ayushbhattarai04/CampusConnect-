"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search, Users, X } from "lucide-react";
import AppShell from "../pages/AppShell";

type CommunityItem = {
  communityId?: number;
  userId: number;
  name: string;
  description?: string | null;
  affiliation?: string | null;
  comProfileUrl?: string | null;
  BannerUrl?: string | null;
  isPublic?: "Public" | "Private";
  membersCount?: number;
  createdAt?: string;
  updatedAt?: string;
};

type CreateCommunityForm = {
  name: string;
  description: string;
  affiliation: string;
  isPublic: boolean;
};

type CommunityPosts = {
  communityPostsId?: number;
  communityId: number | null;
  userId?: number;
  content: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  Community?: {
    communityId?: number;
    name?: string;
  };
  User?: {
    id: number;
    username?: string;
    profileUrl?: string | null;
  };
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:5000";

export default function Community() {
  const [communities, setCommunities] = useState<CommunityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [memberCommunities, setMemberCommunities] = useState<CommunityItem[]>(
    [],
  );
  const [memberLoading, setMemberLoading] = useState(false);
  const [memberError, setMemberError] = useState("");

  const [query, setQuery] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [activeTab, setActiveTab] = useState<"posts" | "communities">("posts");
  const [posts, setPosts] = useState<CommunityPosts[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [createPosts, setcreatePosts] = useState({ content: "", imageUrl: "" });

  const [form, setForm] = useState<CreateCommunityForm>({
    name: "",
    description: "",
    affiliation: "",
    isPublic: true,
  });

  const currentUserId = useMemo(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return null;
      const user = JSON.parse(raw);
      return Number(user?.id) || null;
    } catch {
      return null;
    }
  }, []);

  const fetchMemberCommunities = async (userId: number) => {
    setMemberLoading(true);
    setMemberError("");
    try {
      const res = await fetch(
        `${API_BASE}/api/communities/user/${userId}/communities`,
      );
      if (!res.ok) {
        throw new Error(`Failed to load memberships (${res.status})`);
      }
      const data = await res.json();
      const list: CommunityItem[] = Array.isArray(data)
        ? data
        : (data?.data ?? []);
      setMemberCommunities(list);
    } catch (e: any) {
      setMemberError(e?.message || "Could not load your communities.");
      setMemberCommunities([]);
    } finally {
      setMemberLoading(false);
    }
  };
  //fetching communities from the backend
  const fetchCommunities = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/communities`);
      if (!res.ok)
        throw new Error(`Failed to load communities (${res.status})`);
      const data = await res.json();
      const list: CommunityItem[] = Array.isArray(data)
        ? data
        : (data?.data ?? []);
      setCommunities(list);
    } catch (e: any) {
      setError(e?.message || "Could not load communities.");
      setCommunities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunities();
  }, []);

  useEffect(() => {
    if (!currentUserId) {
      setMemberCommunities([]);
      return;
    }
    fetchMemberCommunities(currentUserId);
  }, [currentUserId]);

  const { myCommunities, joinedCommunities } = useMemo(() => {
    if (!currentUserId) {
      return { myCommunities: [], joinedCommunities: [] };
    }

    const byName = (a: CommunityItem, b: CommunityItem) =>
      a.name.localeCompare(b.name);

    const mine = memberCommunities
      .filter((c) => c.userId === currentUserId)
      .slice()
      .sort(byName);

    const joined = memberCommunities
      .filter((c) => c.userId !== currentUserId)
      .slice()
      .sort(byName);

    return { myCommunities: mine, joinedCommunities: joined };
  }, [currentUserId, memberCommunities]);

  const userCommunitiesPanel = (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-slate-900">
          Your communities
        </h3>
        {memberLoading ? (
          <span className="text-xs text-slate-500">Loading…</span>
        ) : null}
      </div>

      {memberError ? (
        <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {memberError}
        </div>
      ) : null}

      <div className="mt-4">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          My communities(Owned)
        </p>
        {myCommunities.length === 0 ? (
          <p className="mt-2 text-sm text-slate-600">None yet.</p>
        ) : (
          <div className="mt-2 space-y-1">
            {myCommunities.map((c) => {
              const id = c.communityId;
              const content = <span className="truncate">{c.name}</span>;
              return id ? (
                <Link
                  key={`my-${id}`}
                  href={`/communities/${id}`}
                  className="flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm text-slate-800 hover:bg-slate-50"
                >
                  {content}
                  {typeof c.membersCount === "number" ? (
                    <span className="text-xs text-slate-500">
                      {c.membersCount}
                    </span>
                  ) : null}
                </Link>
              ) : (
                <div
                  key={`my-${c.userId}-${c.name}`}
                  className="flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm text-slate-800"
                >
                  {content}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-5">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          Joined
        </p>
        {joinedCommunities.length === 0 ? (
          <p className="mt-2 text-sm text-slate-600">None yet.</p>
        ) : (
          <div className="mt-2 space-y-1">
            {joinedCommunities.map((c) => {
              const id = c.communityId;
              const content = <span className="truncate">{c.name}</span>;
              return id ? (
                <Link
                  key={`joined-${id}`}
                  href={`/communities/${id}`}
                  className="flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm text-slate-800 hover:bg-slate-50"
                >
                  {content}
                  {typeof c.membersCount === "number" ? (
                    <span className="text-xs text-slate-500">
                      {c.membersCount}
                    </span>
                  ) : null}
                </Link>
              ) : (
                <div
                  key={`joined-${c.userId}-${c.name}`}
                  className="flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm text-slate-800"
                >
                  {content}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  //filtering communities for the search bar
  const filtered = useMemo(() => {
    const text = query.trim().toLowerCase();
    if (!text) return communities;
    return communities.filter((c) => {
      const haystack = [c.name, c.affiliation, c.description]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(text);
    });
  }, [communities, query]);

  //handling form changes for the create community form
  const onFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  //handling the creation of a new community and sending the data to the backend
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!currentUserId) {
      setFormError("You must be logged in to create a community.");
      return;
    }

    const name = form.name.trim();
    if (!name) {
      setFormError("Community name is required.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/communities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUserId,
          name,
          description: form.description?.trim() || "",
          affiliation: form.affiliation?.trim() || "",
          isPublic: form.isPublic,
        }),
      });

      if (!res.ok) {
        let message = "Failed to create community.";
        try {
          const data = await res.json();
          message = data?.error || data?.message || message;
        } catch {}
        throw new Error(message);
      }

      setForm({ name: "", description: "", affiliation: "", isPublic: true });
      setShowCreate(false);
      await fetchCommunities();
      if (currentUserId) {
        await fetchMemberCommunities(currentUserId);
      }
    } catch (e: any) {
      setFormError(e?.message || "Could not create community.");
    } finally {
      setSubmitting(false);
    }
  };

  //fetch posts
  useEffect(() => {
    if (activeTab === "posts") {
      // Fetch posts for the communities tab
      const fetchPosts = async () => {
        setPostsLoading(true);
        try {
          const res = await fetch(`${API_BASE}/api/community-posts`);
          if (!res.ok) throw new Error(`Failed to load posts (${res.status})`);
          const data = await res.json();
          setPosts(Array.isArray(data) ? data : data?.data || []);
        } catch (e) {
          // Handle post loading errors if needed
          setPosts([]);
        } finally {
          setPostsLoading(false);
        }
      };

      fetchPosts();
    }
  }, [activeTab]);

  const sortedPosts = useMemo(() => {
    return [...posts].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [posts]);

  //Create posts
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId) {
      setFormError("You must be logged in to create a post.");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/community-posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUserId,
          content: createPosts.content.trim(),
          imageUrl: createPosts.imageUrl.trim() || null,
        }),
      });
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  return (
    <AppShell>
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-7 h-7 text-slate-600" />
                Communities
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Discover communities or create your own.
              </p>
              <div className="mt-6 flex items-center justify-center">
                <div className="inline-flex rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
                  <button
                    type="button"
                    onClick={() => setActiveTab("posts")}
                    aria-pressed={activeTab === "posts"}
                    className={[
                      "px-5 py-2 rounded-2xl text-sm font-semibold transition-colors",
                      "focus:outline-none focus:ring-2 focus:ring-orange-400/40",
                      activeTab === "posts"
                        ? "bg-slate-900 text-white"
                        : "text-slate-700 hover:bg-slate-50 hover:text-orange-600",
                    ].join(" ")}
                  >
                    Posts
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("communities")}
                    aria-pressed={activeTab === "communities"}
                    className={[
                      "px-5 py-2 rounded-2xl text-sm font-semibold transition-colors",
                      "focus:outline-none focus:ring-2 focus:ring-orange-400/40",
                      activeTab === "communities"
                        ? "bg-slate-900 text-white"
                        : "text-slate-700 hover:bg-slate-50 hover:text-orange-600",
                    ].join(" ")}
                  >
                    Communities
                  </button>
                </div>
              </div>
              {activeTab === "communities" && (
                <div className="mt-4 relative w-full max-w-xl">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search communities by name, affiliation..."
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-slate-800"
                  />
                  {query.trim() && (
                    <button
                      type="button"
                      onClick={() => setQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      aria-label="Clear search"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
            {activeTab === "communities" && (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setFormError("");
                    setShowCreate((prev) => !prev);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-600 text-white hover:bg-orange-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create
                </button>
                <button
                  type="button"
                  onClick={fetchCommunities}
                  className="px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Refresh
                </button>
              </div>
            )}
          </div>
          {activeTab === "communities" && (
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 space-y-4">
                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                {loading ? (
                  <div className="bg-white rounded-xl shadow-sm p-10 text-center text-slate-500">
                    Loading communities...
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-sm p-10 text-center">
                    <p className="text-slate-700 font-semibold">
                      No communities found
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Try a different search or create a new community.
                    </p>
                  </div>
                ) : (
                  filtered.map((c, idx) => {
                    const key = c.communityId ?? `${c.userId}-${c.name}-${idx}`;
                    const privacy =
                      c.isPublic === "Private" ? "Private" : "Public";
                    const members =
                      typeof c.membersCount === "number" ? c.membersCount : 0;

                    const cardClassName =
                      "bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow";

                    if (c.communityId) {
                      return (
                        <Link
                          key={key}
                          href={`/communities/${c.communityId}`}
                          className={`${cardClassName} block cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                                {c.name}
                              </h2>
                              {c.affiliation ? (
                                <p className="mt-0.5 text-sm text-slate-500">
                                  {c.affiliation}
                                </p>
                              ) : null}
                            </div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-xs px-2 py-1 rounded-full border ${
                                  privacy === "Public"
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                    : "border-slate-200 bg-slate-50 text-slate-700"
                                }`}
                              >
                                {privacy}
                              </span>
                              <span className="text-xs px-2 py-1 rounded-full border border-slate-200 bg-slate-50 text-slate-700">
                                {members} member{members === 1 ? "" : "s"}
                              </span>
                            </div>
                          </div>

                          {c.description ? (
                            <p className="mt-3 text-sm text-slate-700 leading-relaxed">
                              {c.description}
                            </p>
                          ) : (
                            <p className="mt-3 text-sm text-slate-500">
                              No description provided.
                            </p>
                          )}
                        </Link>
                      );
                    }

                    return (
                      <div key={key} className={cardClassName}>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                              {c.name}
                            </h2>
                            {c.affiliation ? (
                              <p className="mt-0.5 text-sm text-slate-500">
                                {c.affiliation}
                              </p>
                            ) : null}
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs px-2 py-1 rounded-full border ${
                                privacy === "Public"
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                  : "border-slate-200 bg-slate-50 text-slate-700"
                              }`}
                            >
                              {privacy}
                            </span>
                            <span className="text-xs px-2 py-1 rounded-full border border-slate-200 bg-slate-50 text-slate-700">
                              {members} member{members === 1 ? "" : "s"}
                            </span>
                          </div>
                        </div>

                        {c.description ? (
                          <p className="mt-3 text-sm text-slate-700 leading-relaxed">
                            {c.description}
                          </p>
                        ) : (
                          <p className="mt-3 text-sm text-slate-500">
                            No description provided.
                          </p>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              <div className="space-y-4 lg:sticky lg:top-6 self-start">
                {userCommunitiesPanel}

                {showCreate && (
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-base font-semibold text-slate-900">
                        Create a community
                      </h3>
                      <button
                        type="button"
                        onClick={() => {
                          setFormError("");
                          setShowCreate(false);
                        }}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600"
                        aria-label="Close"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {formError && (
                      <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                        {formError}
                      </div>
                    )}

                    <form onSubmit={handleCreate} className="mt-4 space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-slate-700">
                          Name
                        </label>
                        <input
                          name="name"
                          value={form.name}
                          onChange={onFormChange}
                          placeholder="e.g. CSIT Club"
                          className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-slate-800"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700">
                          Affiliation (optional)
                        </label>
                        <input
                          name="affiliation"
                          value={form.affiliation}
                          onChange={onFormChange}
                          placeholder="e.g. Your college / department"
                          className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-slate-800"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700">
                          Description (optional)
                        </label>
                        <textarea
                          name="description"
                          value={form.description}
                          onChange={onFormChange}
                          placeholder="What is this community about?"
                          rows={3}
                          className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-slate-800"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 text-sm text-slate-700">
                          <input
                            type="checkbox"
                            checked={form.isPublic}
                            onChange={(e) =>
                              setForm((prev) => ({
                                ...prev,
                                isPublic: e.target.checked,
                              }))
                            }
                            className="rounded border-slate-300"
                          />
                          Public community
                        </label>
                      </div>

                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full px-4 py-2.5 rounded-xl bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-60 transition-colors"
                      >
                        {submitting ? "Creating..." : "Create community"}
                      </button>
                    </form>
                  </div>
                )}

                {!showCreate && (
                  <div className="bg-white rounded-xl shadow-sm p-5">
                    <p className="text-sm text-slate-600">
                      Use the <span className="font-semibold">Create</span>{" "}
                      button to start a community.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
          {activeTab === "posts" && (
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 space-y-3">
                {postsLoading ? (
                  <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                    Loading posts...
                  </div>
                ) : sortedPosts.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                    <p className="text-gray-500">
                      No posts yet. Be the first to share something!
                    </p>
                  </div>
                ) : (
                  sortedPosts.map((p, idx) => (
                    <div
                      key={
                        p.communityPostsId ??
                        `${p.communityId ?? "c"}-${p.createdAt}-${idx}`
                      }
                      className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold cursor-pointer">
                          {p.User?.username?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate">
                            {p.User?.username || "Unknown user"}
                          </p>
                          <div className="flex items-center gap-2 flex-wrap">
                            {p.Community?.name && p.Community?.communityId ? (
                              <Link
                                href={`/communities/${p.Community.communityId}`}
                                className="text-sm text-gray-500 hover:text-blue-600 transition-colors"
                              >
                                {p.Community.name}
                              </Link>
                            ) : p.Community?.name ? (
                              <p className="text-sm text-gray-500">
                                {p.Community.name}
                              </p>
                            ) : null}
                            <p className="text-sm text-gray-500">
                              {p.createdAt
                                ? new Date(p.createdAt).toLocaleString()
                                : ""}
                            </p>
                          </div>
                        </div>
                      </div>

                      {p.communityPostsId ? (
                        <Link
                          href={`/community-posts/${p.communityPostsId}`}
                          className="block"
                        >
                          <p className="text-gray-700 mb-4 whitespace-pre-wrap">
                            {p.content}
                          </p>
                          {p.imageUrl ? (
                            <img
                              src={p.imageUrl}
                              alt="Post"
                              className="max-w-full rounded-lg mb-4"
                            />
                          ) : null}
                        </Link>
                      ) : (
                        <>
                          <p className="text-gray-700 mb-4 whitespace-pre-wrap">
                            {p.content}
                          </p>
                          {p.imageUrl ? (
                            <img
                              src={p.imageUrl}
                              alt="Post"
                              className="max-w-full rounded-lg mb-4"
                            />
                          ) : null}
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>

              <div className="space-y-4 lg:sticky lg:top-6 self-start">
                {userCommunitiesPanel}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
