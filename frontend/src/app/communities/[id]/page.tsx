"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Lock, Users, ChevronDown, ChevronUp } from "lucide-react";
import AppShell from "../../pages/AppShell";

type CommunityItem = {
  communityId?: number;
  userId: number;
  name: string;
  description?: string | null;
  affiliation?: string | null;
  verified?: "verified" | "unverified" | null;
  comProfileUrl?: string | null;
  BannerUrl?: string | null;
  isPublic?: "Public" | "Private";
  membersCount?: number;
  createdAt?: string;
  updatedAt?: string;
};

type JoinRequestStatus = "pending" | "accepted" | "rejected";

type JoinRequestItem = {
  requestId: number;
  communityId: number;
  userId: number;
  status: JoinRequestStatus;
  createdAt?: string;
  updatedAt?: string;
  User?: {
    id: number;
    username: string;
    email: string;
  };
};

type CommunityMemberItem = {
  memberId?: number;
  communityId?: number;
  userId: number;
  role: "admin" | "moderator" | "member";
  user?: {
    id: number;
    username: string;
    email: string;
  };
  profilePic?: string | null;
};

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

export default function CommunityDetailsPage() {
  const { id } = useParams();

  const communityId = useMemo(() => {
    const raw = Array.isArray(id) ? id[0] : id;
    const numeric = Number(raw);
    return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
  }, [id]);

  const [community, setCommunity] = useState<CommunityItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState("");
  const [isMember, setIsMember] = useState(false);
  const [memberRole, setMemberRole] = useState<string | null>(null);
  const [joinRequestStatus, setJoinRequestStatus] =
    useState<JoinRequestStatus | null>(null);

  const [joinRequests, setJoinRequests] = useState<JoinRequestItem[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestsError, setRequestsError] = useState("");

  const [manageOpen, setManageOpen] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersError, setMembersError] = useState("");
  const [members, setMembers] = useState<CommunityMemberItem[]>([]);

  const [editing, setEditing] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    affiliation: "",
    isPublic: "Public" as "Public" | "Private",
  });

  const [createpostOpen, setCreatePostOpen] = useState(false);

  const [postContent, setPostContent] = useState("");
  const [postImageUrl, setPostImageUrl] = useState("");
  const [postSubmitting, setPostSubmitting] = useState(false);
  const [postError, setPostError] = useState("");

  const [communityPosts, setCommunityPosts] = useState<CommunityPostDetails[]>(
    [],
  );
  const [communityPostsLoading, setCommunityPostsLoading] = useState(false);
  const [communityPostsError, setCommunityPostsError] = useState("");

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

  useEffect(() => {
    if (!communityId) {
      setLoading(false);
      setError("Invalid community id.");
      return;
    }

    const fetchCommunity = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API_BASE}/api/communities/${communityId}`);
        if (!res.ok)
          throw new Error(`Failed to load community (${res.status})`);
        const data = await res.json();
        const item: CommunityItem = data?.data ?? data;
        setCommunity(item);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Could not load community.");
        setCommunity(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCommunity();
  }, [communityId]);

  const fetchCommunityPosts = async () => {
    if (!communityId) return;
    setCommunityPostsLoading(true);
    setCommunityPostsError("");
    try {
      const res = await fetch(`${API_BASE}/api/community-posts/${communityId}`);
      if (!res.ok) {
        throw new Error(`Failed to load posts (${res.status})`);
      }
      const data = await res.json();
      const list: CommunityPostDetails[] = Array.isArray(data)
        ? data
        : (data?.data ?? []);
      setCommunityPosts(list);
    } catch (e: unknown) {
      setCommunityPostsError(
        e instanceof Error ? e.message : "Could not load posts.",
      );
      setCommunityPosts([]);
    } finally {
      setCommunityPostsLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunityPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [communityId]);

  const sortedCommunityPosts = useMemo(() => {
    return [...communityPosts].sort(
      (a, b) =>
        new Date(b.createdAt ?? 0).getTime() -
        new Date(a.createdAt ?? 0).getTime(),
    );
  }, [communityPosts]);

  useEffect(() => {
    if (!communityId || !currentUserId) return;
    const fetchMembership = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/communities/${communityId}/membership/${currentUserId}`,
        );
        if (!res.ok) return;
        const data = await res.json();
        setIsMember(Boolean(data?.isMember));
        setMemberRole(data?.role ?? null);
      } catch {
        // ignore
      }
    };
    fetchMembership();
  }, [communityId, currentUserId]);

  const isModerator = useMemo(() => {
    if (!currentUserId || !community) return false;
    return (
      community.userId === currentUserId ||
      memberRole === "admin" ||
      memberRole === "moderator"
    );
  }, [currentUserId, community, memberRole]);

  const isOwnerOrAdmin = useMemo(() => {
    if (!currentUserId || !community) return false;
    return community.userId === currentUserId || memberRole === "admin";
  }, [currentUserId, community, memberRole]);

  const canSeeCreatePost = useMemo(() => {
    if (!community || !currentUserId) return false;
    return isMember || community.userId === currentUserId;
  }, [community, currentUserId, isMember]);

  useEffect(() => {
    if (!community) return;
    setEditForm({
      name: community.name ?? "",
      description: community.description ?? "",
      affiliation: community.affiliation ?? "",
      isPublic: community.isPublic ?? "Public",
    });
  }, [community]);

  useEffect(() => {
    if (!communityId || !currentUserId || !community) return;
    if (isMember) {
      setJoinRequestStatus(null);
      return;
    }
    if (community.isPublic !== "Private") {
      setJoinRequestStatus(null);
      return;
    }

    const fetchJoinRequestStatus = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/communities/${communityId}/join-requests/status/${currentUserId}`,
        );
        if (!res.ok) return;
        const data = await res.json();
        setJoinRequestStatus((data?.status as JoinRequestStatus) ?? null);
      } catch {
        // ignore
      }
    };

    fetchJoinRequestStatus();
  }, [communityId, currentUserId, community, isMember]);

  useEffect(() => {
    if (!communityId || !currentUserId || !community) return;
    if (community.isPublic !== "Private" || !isModerator) {
      setJoinRequests([]);
      return;
    }

    const fetchJoinRequests = async () => {
      setRequestsLoading(true);
      setRequestsError("");
      try {
        const res = await fetch(
          `${API_BASE}/api/communities/${communityId}/join-requests?actorUserId=${currentUserId}&status=pending`,
        );
        if (!res.ok) {
          throw new Error(`Failed to load join requests (${res.status})`);
        }
        const data = await res.json();
        setJoinRequests(Array.isArray(data?.requests) ? data.requests : []);
      } catch (e: unknown) {
        setRequestsError(
          e instanceof Error ? e.message : "Could not load join requests.",
        );
        setJoinRequests([]);
      } finally {
        setRequestsLoading(false);
      }
    };

    fetchJoinRequests();
  }, [communityId, currentUserId, community, isModerator]);

  const handleJoin = async () => {
    setJoinError("");
    if (!communityId) {
      setJoinError("Invalid community.");
      return;
    }
    if (!currentUserId) {
      setJoinError("You must be logged in to join.");
      return;
    }

    setJoinLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/communities/${communityId}/join`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: currentUserId }),
        },
      );

      if (!res.ok) {
        let message = `Failed to join community (${res.status}).`;
        try {
          const raw = await res.text();
          try {
            const data: unknown = JSON.parse(raw);
            if (typeof data === "object" && data !== null) {
              const maybeError = (
                data as { error?: unknown; message?: unknown }
              ).error;
              const maybeMessage = (
                data as { error?: unknown; message?: unknown }
              ).message;
              if (typeof maybeError === "string" && maybeError.trim()) {
                message = maybeError;
              } else if (
                typeof maybeMessage === "string" &&
                maybeMessage.trim()
              ) {
                message = maybeMessage;
              }
            }
          } catch {
            if (typeof raw === "string" && raw.trim()) message = raw;
          }
        } catch {}
        throw new Error(message);
      }

      const data = await res.json().catch(() => ({}));

      if (data?.membership) {
        setIsMember(true);
        setMemberRole(data?.membership?.role ?? "member");
        setJoinRequestStatus(null);
        if (typeof data?.membersCount === "number") {
          setCommunity((prev) =>
            prev ? { ...prev, membersCount: data.membersCount } : prev,
          );
        }
      } else if (data?.joinRequest?.status) {
        setJoinRequestStatus(data.joinRequest.status as JoinRequestStatus);
      }
    } catch (e: unknown) {
      setJoinError(
        e instanceof Error ? e.message : "Could not join community.",
      );
    } finally {
      setJoinLoading(false);
    }
  };

  const handleReviewRequest = async (
    requestId: number,
    action: "accept" | "reject",
  ) => {
    if (!communityId || !currentUserId) return;
    setRequestsError("");
    try {
      const res = await fetch(
        `${API_BASE}/api/communities/${communityId}/join-requests/${requestId}/${action}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ actorUserId: currentUserId }),
        },
      );

      if (!res.ok) {
        let message = `Failed to ${action} request (${res.status}).`;
        try {
          const data = await res.json();
          message = data?.error || data?.message || message;
        } catch {}
        throw new Error(message);
      }

      const data = await res.json().catch(() => ({}));
      setJoinRequests((prev) => prev.filter((r) => r.requestId !== requestId));
      if (typeof data?.membersCount === "number") {
        setCommunity((prev) =>
          prev ? { ...prev, membersCount: data.membersCount } : prev,
        );
      }
    } catch (e: unknown) {
      setRequestsError(
        e instanceof Error
          ? e.message
          : `Could not ${action} the join request.`,
      );
    }
  };

  const fetchMembers = async () => {
    if (!communityId || !currentUserId) return;
    setMembersLoading(true);
    setMembersError("");
    try {
      const res = await fetch(
        `${API_BASE}/api/communities/${communityId}/members?actorUserId=${currentUserId}`,
      );
      if (!res.ok) {
        let message = `Failed to load members (${res.status}).`;
        try {
          const data = await res.json();
          message = data?.error || data?.message || message;
        } catch {}
        throw new Error(message);
      }
      const data = await res.json();
      setMembers(Array.isArray(data?.members) ? data.members : []);
    } catch (e: unknown) {
      setMembersError(
        e instanceof Error ? e.message : "Could not load members.",
      );
      setMembers([]);
    } finally {
      setMembersLoading(false);
    }
  };

  const handleToggleMembers = async () => {
    const next = !showMembers;
    setShowMembers(next);
    setManageOpen(false);
    if (next) await fetchMembers();
  };

  const handleKick = async (memberUserId: number) => {
    if (!communityId || !currentUserId) return;
    setMembersError("");
    try {
      const res = await fetch(
        `${API_BASE}/api/communities/${communityId}/members/${memberUserId}?actorUserId=${currentUserId}`,
        { method: "DELETE" },
      );
      if (!res.ok) {
        let message = `Failed to kick member (${res.status}).`;
        try {
          const data = await res.json();
          message = data?.error || data?.message || message;
        } catch {}
        throw new Error(message);
      }
      const data = await res.json().catch(() => ({}));
      setMembers((prev) => prev.filter((m) => m.userId !== memberUserId));
      if (typeof data?.membersCount === "number") {
        setCommunity((prev) =>
          prev ? { ...prev, membersCount: data.membersCount } : prev,
        );
      }
    } catch (e: unknown) {
      setMembersError(
        e instanceof Error ? e.message : "Could not kick member.",
      );
    }
  };

  const handleSetMemberRole = async (
    memberUserId: number,
    role: "moderator" | "member",
  ) => {
    if (!communityId || !currentUserId) return;
    setMembersError("");
    try {
      const res = await fetch(
        `${API_BASE}/api/communities/${communityId}/members/${memberUserId}/role?actorUserId=${currentUserId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ actorUserId: currentUserId, role }),
        },
      );

      if (!res.ok) {
        let message = `Failed to update role (${res.status}).`;
        try {
          const data = await res.json();
          message = data?.error || data?.message || message;
        } catch {}
        throw new Error(message);
      }

      setMembers((prev) =>
        prev.map((m) => (m.userId === memberUserId ? { ...m, role } : m)),
      );
    } catch (e: unknown) {
      setMembersError(
        e instanceof Error ? e.message : "Could not update member role.",
      );
    }
  };

  const handleStartEdit = () => {
    setEditError("");
    setEditing(true);
    setManageOpen(false);
  };

  const handleCancelEdit = () => {
    setEditError("");
    setEditing(false);
    if (community) {
      setEditForm({
        name: community.name ?? "",
        description: community.description ?? "",
        affiliation: community.affiliation ?? "",
        isPublic: community.isPublic ?? "Public",
      });
    }
  };

  const handleSaveEdit = async () => {
    if (!communityId || !currentUserId) return;
    setEditError("");
    const name = editForm.name.trim();
    if (!name) {
      setEditError("Community name is required.");
      return;
    }

    setEditSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/communities/${communityId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actorUserId: currentUserId,
          name,
          description: editForm.description,
          affiliation: editForm.affiliation,
          isPublic: editForm.isPublic,
        }),
      });

      if (!res.ok) {
        let message = `Failed to update community (${res.status}).`;
        try {
          const data = await res.json();
          message = data?.error || data?.message || message;
        } catch {}
        throw new Error(message);
      }

      const data = await res.json();
      const updated: CommunityItem = data?.data ?? data;
      setCommunity(updated);
      setEditing(false);
    } catch (e: unknown) {
      setEditError(
        e instanceof Error ? e.message : "Could not update community.",
      );
    } finally {
      setEditSaving(false);
    }
  };

  const handleDeleteCommunity = async () => {
    if (!communityId || !currentUserId) return;
    setManageOpen(false);

    const ok = window.confirm(
      "Delete this community? This action cannot be undone.",
    );
    if (!ok) return;

    try {
      const res = await fetch(
        `${API_BASE}/api/communities/${communityId}?actorUserId=${currentUserId}`,
        { method: "DELETE" },
      );
      if (!res.ok) {
        let message = `Failed to delete community (${res.status}).`;
        try {
          const data = await res.json();
          message = data?.error || data?.message || message;
        } catch {}
        throw new Error(message);
      }
      window.location.href = "/communities";
    } catch (e: unknown) {
      setJoinError(
        e instanceof Error ? e.message : "Could not delete community.",
      );
    }
  };

  const handleToggleCreatePost = () => {
    if (!canSeeCreatePost) return;
    setPostError("");
    setCreatePostOpen((v) => !v);
  };

  const handleCreateCommunityPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!communityId) {
      setPostError("Invalid community.");
      return;
    }
    if (!currentUserId) {
      setPostError("You must be logged in to create a post.");
      return;
    }
    if (!canSeeCreatePost) {
      setPostError("Join the community to create a post.");
      return;
    }

    const content = postContent.trim();
    if (!content) {
      setPostError("Post content is required.");
      return;
    }

    setPostSubmitting(true);
    setPostError("");
    try {
      const res = await fetch(`${API_BASE}/api/community-posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          communityId,
          userId: currentUserId,
          content,
          imageUrl: postImageUrl.trim() || null,
        }),
      });

      if (!res.ok) {
        let message = `Failed to create post (${res.status}).`;
        try {
          const data = await res.json();
          message = data?.error || data?.message || message;
        } catch {}
        throw new Error(message);
      }

      setPostContent("");
      setPostImageUrl("");
      setCreatePostOpen(false);
      await fetchCommunityPosts();
    } catch (e: unknown) {
      setPostError(e instanceof Error ? e.message : "Could not create post.");
    } finally {
      setPostSubmitting(false);
    }
  };

  const handleLeave = async () => {
    if (!communityId || !currentUserId || !community) return;
    setJoinError("");

    const ok = window.confirm("Leave this community?");
    if (!ok) return;

    setJoinLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/communities/${communityId}/leave?actorUserId=${currentUserId}`,
        { method: "DELETE" },
      );

      if (!res.ok) {
        let message = `Failed to leave community (${res.status}).`;
        try {
          const data = await res.json();
          message = data?.error || data?.message || message;
        } catch {}
        throw new Error(message);
      }

      const data = await res.json().catch(() => ({}));
      setIsMember(false);
      setMemberRole(null);
      setJoinRequestStatus(null);
      if (typeof data?.membersCount === "number") {
        setCommunity((prev) =>
          prev ? { ...prev, membersCount: data.membersCount } : prev,
        );
      }
    } catch (e: unknown) {
      setJoinError(
        e instanceof Error ? e.message : "Could not leave community.",
      );
    } finally {
      setJoinLoading(false);
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="w-7 h-7 border-2 border-gray-200 border-t-orange-400 rounded-full animate-spin" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between gap-3">
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
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-7 h-7 text-slate-600" />
                  {community?.name || "Community"}
                </h1>
                {community?.affiliation ? (
                  <p className="mt-1 text-sm text-slate-500">
                    {community.affiliation}
                  </p>
                ) : (
                  <p className="mt-1 text-sm text-slate-500">
                    Community details
                  </p>
                )}
              </div>
            </div>

            {community && isOwnerOrAdmin && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setManageOpen((v) => !v)}
                  className="px-3 py-2 rounded-xl text-sm font-semibold border border-slate-200 bg-white hover:bg-slate-50"
                >
                  Manage
                </button>

                {manageOpen && (
                  <div className="absolute right-0 mt-2 w-44 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <button
                      type="button"
                      onClick={handleStartEdit}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteCommunity}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50"
                    >
                      Delete
                    </button>
                    <button
                      type="button"
                      onClick={handleToggleMembers}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50"
                    >
                      Members list
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {error && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {!error && !community && (
            <div className="mt-6 bg-white rounded-xl shadow-sm p-10 text-center">
              <p className="text-slate-700 font-semibold">
                Community not found
              </p>
              <p className="mt-1 text-sm text-slate-500">
                It may have been removed or the link is incorrect.
              </p>
            </div>
          )}

          {community && (
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                        About
                      </h2>
                      {editing ? (
                        <div className="mt-3 space-y-3">
                          {editError && (
                            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                              {editError}
                            </div>
                          )}

                          <div>
                            <p className="text-xs text-slate-500">Name</p>
                            <input
                              value={editForm.name}
                              onChange={(e) =>
                                setEditForm((p) => ({
                                  ...p,
                                  name: e.target.value,
                                }))
                              }
                              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                            />
                          </div>

                          <div>
                            <p className="text-xs text-slate-500">
                              Description
                            </p>
                            <textarea
                              value={editForm.description}
                              onChange={(e) =>
                                setEditForm((p) => ({
                                  ...p,
                                  description: e.target.value,
                                }))
                              }
                              rows={4}
                              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <p className="text-xs text-slate-500">
                                Affiliation
                              </p>
                              <input
                                value={editForm.affiliation}
                                onChange={(e) =>
                                  setEditForm((p) => ({
                                    ...p,
                                    affiliation: e.target.value,
                                  }))
                                }
                                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                              />
                            </div>
                            <div>
                              <p className="text-xs text-slate-500">
                                Community Privacy
                              </p>
                              <select
                                value={editForm.isPublic}
                                onChange={(e) =>
                                  setEditForm((p) => ({
                                    ...p,
                                    isPublic: e.target.value as
                                      | "Public"
                                      | "Private",
                                  }))
                                }
                                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                              >
                                <option value="Public">Public</option>
                                <option value="Private">Private</option>
                              </select>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={handleSaveEdit}
                              disabled={editSaving}
                              className="px-4 py-2 rounded-xl font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
                            >
                              {editSaving ? "Saving..." : "Save"}
                            </button>
                            <button
                              type="button"
                              onClick={handleCancelEdit}
                              disabled={editSaving}
                              className="px-4 py-2 rounded-xl font-semibold bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 disabled:opacity-60"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="mt-2 text-sm text-slate-700 leading-relaxed">
                          {community.description?.trim()
                            ? community.description
                            : "No description provided."}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-2 py-1 rounded-full border ${
                          community.isPublic === "Private"
                            ? "border-slate-200 bg-slate-50 text-slate-700"
                            : "border-emerald-200 bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        {community.isPublic === "Private" ? (
                          <span className="inline-flex items-center gap-1">
                            <Lock className="w-3.5 h-3.5" /> Private
                          </span>
                        ) : (
                          "Public"
                        )}
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full border border-slate-200 bg-slate-50 text-slate-700">
                        {Number(community.membersCount ?? 0)} member
                        {Number(community.membersCount ?? 0) === 1 ? "" : "s"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Create posts section */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    {isMember ? (
                      <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                        Create a post in {community.name}
                      </h2>
                    ) : (
                      <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                        Join {community.name} to create a post
                      </h2>
                    )}

                    {canSeeCreatePost && (
                      <button
                        type="button"
                        onClick={handleToggleCreatePost}
                        className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                        aria-label={createpostOpen ? "Collapse" : "Expand"}
                      >
                        {createpostOpen ? (
                          <ChevronUp size={20} className="text-slate-700" />
                        ) : (
                          <ChevronDown size={20} className="text-slate-700" />
                        )}
                      </button>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-slate-700">
                    {isMember
                      ? "Start sharing updates, resources, and discussions with your community members by creating posts."
                      : "Join the community to start creating posts and engaging with other members."}
                  </p>

                  {/* Create post form */}
                  {canSeeCreatePost && createpostOpen && (
                    <form onSubmit={handleCreateCommunityPost} className="mt-4">
                      {postError && (
                        <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                          {postError}
                        </div>
                      )}

                      <div className="space-y-3">
                        <div>
                          <label className="text-xs text-slate-500">
                            Content
                          </label>
                          <textarea
                            value={postContent}
                            onChange={(e) => setPostContent(e.target.value)}
                            rows={4}
                            placeholder={
                              isMember
                                ? "Write something..."
                                : "Join to create a post"
                            }
                            disabled={!canSeeCreatePost || postSubmitting}
                            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm disabled:bg-slate-50"
                          />
                        </div>

                        <div>
                          <label className="text-xs text-slate-500">
                            Image URL (optional)
                          </label>
                          <input
                            value={postImageUrl}
                            onChange={(e) => setPostImageUrl(e.target.value)}
                            placeholder="https://..."
                            disabled={!canSeeCreatePost || postSubmitting}
                            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm disabled:bg-slate-50"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="submit"
                            disabled={!canSeeCreatePost || postSubmitting}
                            className="px-4 py-2 rounded-xl font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
                          >
                            {postSubmitting ? "Posting..." : "Post"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setCreatePostOpen(false)}
                            disabled={postSubmitting}
                            className="px-4 py-2 rounded-xl font-semibold bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 disabled:opacity-60"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </form>
                  )}
                </div>

                {/* Posts list (same card style as main feed) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                      Posts
                    </h2>
                    <button
                      type="button"
                      onClick={fetchCommunityPosts}
                      className="px-3 py-2 rounded-xl text-sm font-semibold border border-slate-200 bg-white hover:bg-slate-50"
                    >
                      Refresh
                    </button>
                  </div>

                  {communityPostsError ? (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                      {communityPostsError}
                    </div>
                  ) : null}

                  {communityPostsLoading ? (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                      Loading posts...
                    </div>
                  ) : sortedCommunityPosts.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                      <p className="text-gray-500">No posts yet.</p>
                    </div>
                  ) : (
                    sortedCommunityPosts.map((p, idx) => (
                      <div
                        key={
                          p.communityPostsId ??
                          `${p.communityId}-${p.createdAt ?? "t"}-${idx}`
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
                              {community?.name && communityId ? (
                                <Link
                                  href={`/communities/${communityId}`}
                                  className="text-sm text-gray-500 hover:text-blue-600 transition-colors"
                                >
                                  {community.name}
                                </Link>
                              ) : null}
                              <p className="text-sm text-gray-500">
                                {p.createdAt
                                  ? new Date(p.createdAt).toLocaleString()
                                  : ""}
                              </p>
                            </div>
                          </div>
                        </div>

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
                      </div>
                    ))
                  )}
                </div>
              </div>
              {/* Membership section with leave button */}
              <div className="space-y-4">
                <div className="bg-white rounded-xl shadow-sm p-5">
                  <p className="text-sm font-semibold text-slate-800">
                    Membership
                  </p>

                  {joinError && (
                    <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                      {joinError}
                    </div>
                  )}

                  <div className="mt-4 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleJoin}
                      disabled={
                        joinLoading ||
                        isMember ||
                        joinRequestStatus === "pending"
                      }
                      className={[
                        "px-4 py-2 rounded-xl font-semibold transition-colors",
                        isMember
                          ? "bg-slate-100 text-slate-600 border border-slate-200"
                          : "bg-emerald-600 text-white hover:bg-emerald-700",
                        "disabled:opacity-60",
                      ].join(" ")}
                    >
                      {isMember
                        ? memberRole
                          ? `Joined (${memberRole})`
                          : "Joined"
                        : joinRequestStatus === "pending"
                          ? "Request sent"
                          : joinLoading
                            ? "Joining..."
                            : community?.isPublic === "Private"
                              ? "Request to join"
                              : "Join"}
                    </button>

                    {isMember &&
                      currentUserId &&
                      community &&
                      currentUserId !== community.userId && (
                        <button
                          type="button"
                          onClick={handleLeave}
                          disabled={joinLoading}
                          className="px-4 py-2 rounded-xl font-semibold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 disabled:opacity-60"
                        >
                          Leave
                        </button>
                      )}
                  </div>

                  {community?.isPublic === "Private" && !isMember && (
                    <p className="mt-3 text-xs text-slate-500">
                      This is a private community — an admin/moderator must
                      approve your request.
                    </p>
                  )}
                </div>

                {/* Join request section for the owner/admins  */}
                {community?.isPublic === "Private" && isModerator && (
                  <div className="bg-white rounded-xl shadow-sm p-5">
                    <p className="text-sm font-semibold text-slate-800">
                      Join requests
                    </p>

                    {requestsError && (
                      <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                        {requestsError}
                      </div>
                    )}

                    {requestsLoading ? (
                      <div className="mt-3 text-sm text-slate-600">
                        Loading requests...
                      </div>
                    ) : joinRequests.length === 0 ? (
                      <div className="mt-3 text-sm text-slate-600">
                        No pending requests.
                      </div>
                    ) : (
                      <div className="mt-3 space-y-2">
                        {joinRequests.map((r) => (
                          <div
                            key={r.requestId}
                            className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                          >
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-900 truncate">
                                {r.User?.username || `User #${r.userId}`}
                              </p>
                              {r.User?.email && (
                                <p className="text-xs text-slate-500 truncate">
                                  {r.User.email}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() =>
                                  handleReviewRequest(r.requestId, "accept")
                                }
                                className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700"
                              >
                                Accept
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleReviewRequest(r.requestId, "reject")
                                }
                                className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200"
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {/* Members lists and management for owner/admins */}
                {isOwnerOrAdmin && showMembers && (
                  <div className="bg-white rounded-xl shadow-sm p-5">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-800">
                        Members
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowMembers(false)}
                        className="text-sm font-semibold text-slate-600 hover:text-slate-900"
                      >
                        Close
                      </button>
                    </div>
                    {/* error handling and loading  */}
                    {membersError && (
                      <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                        {membersError}
                      </div>
                    )}

                    {membersLoading ? (
                      <div className="mt-3 text-sm text-slate-600">
                        Loading members...
                      </div>
                    ) : members.length === 0 ? (
                      <div className="mt-3 text-sm text-slate-600">
                        No members found.
                      </div>
                    ) : (
                      // Users list with role management and kick options for owner/admins
                      <div className="mt-3 space-y-2">
                        {members.map((m) => {
                          const displayName =
                            m.user?.username || `User #${m.userId}`;
                          const imgSrc =
                            m.profilePic && m.profilePic.trim()
                              ? m.profilePic
                              : "/img/stud.jpg";
                          const isOwner =
                            community && m.userId === community.userId;
                          const canKick = community && !isOwner;
                          const canMod =
                            community && !isOwner && m.role !== "admin";

                          const badgeLabel = isOwner
                            ? "Owner"
                            : m.role === "moderator"
                              ? "Moderator"
                              : "Member";
                          const badgeClass = isOwner
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : m.role === "moderator"
                              ? "border-slate-200 bg-white text-slate-700"
                              : "border-slate-200 bg-slate-50 text-slate-700";

                          return (
                            <div
                              key={m.userId}
                              className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <img
                                  src={imgSrc}
                                  alt={displayName}
                                  className="w-9 h-9 rounded-full object-cover border border-slate-200 bg-white"
                                />
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-slate-900 truncate">
                                    {displayName}
                                  </p>
                                  <div className="mt-1 flex items-center gap-2">
                                    <span
                                      className={[
                                        "text-xs px-2 py-0.5 rounded-full border",
                                        badgeClass,
                                      ].join(" ")}
                                    >
                                      {badgeLabel}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleSetMemberRole(
                                      m.userId,
                                      m.role === "moderator"
                                        ? "member"
                                        : "moderator",
                                    )
                                  }
                                  disabled={!canMod}
                                  className={[
                                    "px-3 py-1.5 rounded-lg text-sm font-semibold border",
                                    canMod
                                      ? "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                                      : "bg-slate-100 text-slate-400 border-slate-200",
                                  ].join(" ")}
                                >
                                  {m.role === "moderator" ? "Unmod" : "Mod"}
                                </button>
                                {/* kick button for Members management */}
                                <button
                                  type="button"
                                  onClick={() => handleKick(m.userId)}
                                  disabled={!canKick}
                                  className={[
                                    "px-3 py-1.5 rounded-lg text-sm font-semibold border",
                                    canKick
                                      ? "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                                      : "bg-slate-100 text-slate-400 border-slate-200",
                                  ].join(" ")}
                                >
                                  Kick
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
