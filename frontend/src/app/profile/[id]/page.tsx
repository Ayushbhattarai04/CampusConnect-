"use client";
import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Mail,
  Building2,
  Hash,
  UserPlus,
  UserCheck,
  MessageCircle,
} from "lucide-react";

interface UserProfileData {
  name: string;
  username: string;
  email: string;
  bio: string;
  institution: string;
  studId: string;
  profilepic?: string;
  postCount?: number;
  followerCount?: number;
  followingCount?: number;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

export default function UserProfile({ userId }: { userId: number }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "Posts" | "Events" | "Jobs" | "Tutions" | "Communities"
  >("Posts");
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/profile/${userId}`);
        if (!res.ok) throw new Error("Failed to load profile");
        const data = await res.json();

        const mapped: UserProfileData = {
          name: data?.User?.username || "",
          username: data?.User?.username || "",
          email: data?.User?.email || "",
          bio: data?.bio || "",
          institution: data?.User?.institution || "",
          studId: data?.User?.studId || "",
          profilepic: data?.User?.profilepic || "",
          postCount: data?.postCount ?? 0,
          followerCount: data?.followerCount ?? 0,
          followingCount: data?.followingCount ?? 0,
        };
        setProfile(mapped);

        const stored = localStorage.getItem("user");
        if (stored) {
          const me = JSON.parse(stored);
          const followRes = await fetch(
            `${API_BASE_URL}/api/follow/status?followerId=${me.id}&followingId=${userId}`,
          );
          if (followRes.ok) {
            const followData = await followRes.json();
            setIsFollowing(followData?.isFollowing ?? false);
          }
        }
      } catch (e: any) {
        setError(e?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const handleFollow = async () => {
    const stored = localStorage.getItem("user");
    if (!stored) return;
    const me = JSON.parse(stored);

    setFollowLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/follow`, {
        method: isFollowing ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followerId: me.id, followingId: userId }),
      });
      if (!res.ok) throw new Error("Failed to update follow");
      setIsFollowing(!isFollowing);
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              followerCount: (prev.followerCount ?? 0) + (isFollowing ? -1 : 1),
            }
          : prev,
      );
    } catch (e: any) {
      setError(e?.message || "Could not update follow status.");
    } finally {
      setFollowLoading(false);
    }
  };

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

        {profile && (
          <div className="bg-stone-50 pt-10 overflow-hidden">
            <div className="px-6 pb-6">
              {/* Avatar + actions */}
              <div className="flex items-end justify-between -mt-9 mb-4">
                <div className="w-20 h-20 rounded-full bg-slate-900 flex items-center justify-center text-white text-lg font-semibold shadow-md shrink-0">
                  {profile.profilepic || initials}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleFollow}
                    disabled={followLoading}
                    className={`flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-xl transition-all disabled:opacity-50 ${
                      isFollowing
                        ? "border border-gray-200 text-slate-900 hover:bg-stone-100"
                        : "bg-slate-900 text-white hover:opacity-90"
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <UserCheck className="w-3.5 h-3.5" />
                        Following
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" />
                        Follow
                      </>
                    )}
                  </button>
                  <button className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium border border-gray-200 text-slate-900 rounded-xl hover:bg-stone-100 transition-all">
                    <MessageCircle className="w-3.5 h-3.5" />
                    Message
                  </button>
                </div>
              </div>

              {/* Name + username */}
              <div className="mb-3">
                <h1 className="text-lg font-semibold text-slate-900">
                  {profile.name || "—"}
                </h1>
                <p className="text-sm text-gray-400">
                  @{profile.username || "—"}
                </p>
              </div>

              {/* Bio */}
              <p className="text-sm text-gray-500 leading-relaxed mb-5">
                {profile.bio || (
                  <span className="italic text-gray-400">No bio</span>
                )}
              </p>

              {/* Stats */}
              <div className="flex gap-6 mb-6">
                {[
                  { label: "Posts", value: profile.postCount ?? 0 },
                  { label: "Followers", value: profile.followerCount ?? 0 },
                  { label: "Following", value: profile.followingCount ?? 0 },
                ].map(({ label, value }) => (
                  <div key={label} className="text-center">
                    <p className="text-sm font-semibold text-slate-900">
                      {value}
                    </p>
                    <p className="text-[11px] text-gray-400">{label}</p>
                  </div>
                ))}
              </div>

              <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400 mb-4">
                Details
              </h2>

              {/* Read-only detail fields */}
              <div className="space-y-0.5">
                <DetailField icon={Mail} label="Email" value={profile.email} />
                <DetailField
                  icon={Building2}
                  label="Institution"
                  value={profile.institution}
                />
                <DetailField
                  icon={Hash}
                  label="Student ID"
                  value={profile.studId}
                  mono
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="w-full max-w-380 mx-auto border-b border-gray-400 border-1" />

      {/* Tabs */}
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
    </div>
  );
}

function DetailField({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
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
        <p
          className={`text-sm text-slate-900 truncate ${mono ? "font-mono" : "font-medium"}`}
          style={mono ? { fontSize: "0.8rem" } : {}}
        >
          {value || "—"}
        </p>
      </div>
    </div>
  );
}
