"use client";
import React, { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";

interface ProfileData {
  name: string;
  username: string;
  email: string;
  bio: string;
  institution: string;
  college: string;
  studId: string;
  profilePic: string;
}

const defaultProfile: ProfileData = {
  name: "Ayush bhattarai",
  username: "Ayush",
  email: "ayush@university.edu",
  bio: "Computer science student passionate about web development and database systems. Building cool things one commit at a time.",
  institution: "Tribhuvan University",
  college: "Institute of Engineering",
  studId: "TU-075-BCT-042",
  profilePic: "",
};
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
export default function Profile() {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState<number | null>(null);
  const [profile, setProfile] = useState<ProfileData>(defaultProfile);
  const [draft, setDraft] = useState<ProfileData>(defaultProfile);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  const handleSave = async () => {
    if (!userId) {
      setError("User not found. Please login again.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/profile/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: draft.username,
          email: draft.email,
          institution: draft.institution,
          studId: draft.studId,
          bio: draft.bio,
          profilePic: draft.profilePic,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save profile");
      }

      const data = await response.json();
      const merged: ProfileData = {
        ...draft,
        username: data?.User?.username ?? draft.username,
        email: data?.User?.email ?? draft.email,
        institution: data?.User?.institution ?? draft.institution,
        studId: data?.User?.studId ?? draft.studId,
        bio: data?.bio ?? draft.bio,
        profilePic: data?.profilePic ?? draft.profilePic,
      };

      setProfile(merged);
      setDraft(merged);

      const storedUserRaw = localStorage.getItem("user");
      if (storedUserRaw) {
        try {
          const storedUser = JSON.parse(storedUserRaw);
          const updatedUser = {
            ...storedUser,
            username: merged.username,
            email: merged.email,
            institution: merged.institution,
            studId: merged.studId,
          };
          localStorage.setItem("user", JSON.stringify(updatedUser));
          localStorage.setItem("username", updatedUser.username);
        } catch {}
      }

      setEditing(false);
    } catch (e: any) {
      setError(e?.message || "Could not save profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setDraft(profile);
    setEditing(false);
  };

  const initials = profile.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  useEffect(() => {
    const fetchProfile = async (id: number) => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`${API_BASE_URL}/api/profile/${id}`);
        if (!response.ok) throw new Error("Failed to load profile");
        const data = await response.json();

        const userRaw = localStorage.getItem("user");
        let localUser: any = null;
        if (userRaw) {
          try {
            localUser = JSON.parse(userRaw);
          } catch {}
        }

        const mapped: ProfileData = {
          name: localUser?.username || defaultProfile.name,
          username:
            data?.User?.username ||
            localUser?.username ||
            defaultProfile.username,
          email: data?.User?.email || localUser?.email || defaultProfile.email,
          bio: data?.bio || "",
          institution:
            data?.User?.institution ||
            localUser?.institution ||
            defaultProfile.institution,
          college: defaultProfile.college,
          studId:
            data?.User?.studId || localUser?.studId || defaultProfile.studId,
          profilePic: data?.profilePic || "",
        };

        setProfile(mapped);
        setDraft(mapped);
      } catch (e: any) {
        setError(e?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    const userRaw = localStorage.getItem("user");
    if (!userRaw) {
      setError("No logged-in user found. Please login again.");
      setLoading(false);
      return;
    }

    try {
      const parsed = JSON.parse(userRaw);
      if (!parsed?.id) {
        setError("Invalid user session. Please login again.");
        setLoading(false);
        return;
      }
      setUserId(parsed.id);
      fetchProfile(parsed.id);
    } catch {
      setError("Invalid user session. Please login again.");
      setLoading(false);
    }
  }, []);

  if (loading) {
    return <div className="w-full p-10 text-gray-600">Loading profile...</div>;
  }

  return (
    <div className="w-full max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-6 font-sans">
      <ArrowLeft
        className="top-1 h-6 w-6 text-gray-600 cursor-pointer mb-4"
        onClick={() => window.history.back()}
      />
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
          {error}
        </div>
      )}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        {/* Banner to add later */}
        <div className="h-40 bg-indigo-600" />

        <div className="px-4 sm:px-5 pb-5">
          {/* Profile pic row */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 -mt-7 mb-3">
            <div className="w-60 h-60 sm:w-50 sm:h-50 rounded-full bg-indigo-600 border-[3px] border-white flex items-center justify-center text-white text-xl font-semibold">
              {initials}
            </div>

            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="w-full sm:w-auto px-4 py-1.5 text-sm border border-indigo-500 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
              >
                Edit profile
              </button>
            ) : (
              <div className="flex w-full sm:w-auto gap-2">
                <button
                  onClick={handleCancel}
                  className="flex-1 sm:flex-none px-4 py-1.5 text-sm border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 sm:flex-none px-4 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            )}
          </div>

          {/* Name */}
          {editing ? (
            <input
              className="w-full mb-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-300"
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              placeholder="Full name"
            />
          ) : (
            <p className="text-lg font-semibold text-gray-900 mb-0.5">
              {profile.name}
            </p>
          )}

          <p className="text-sm text-indigo-500 mb-3">{profile.username}</p>

          {/* Bio */}
          {editing ? (
            <textarea
              className="w-full mb-4 px-3 py-1.5 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-300 resize-none h-16"
              value={draft.bio}
              onChange={(e) => setDraft({ ...draft, bio: e.target.value })}
              placeholder="Short bio"
            />
          ) : (
            <p className="text-sm text-gray-500 leading-relaxed mb-4 pb-4 border-b border-gray-100">
              {profile.bio}
            </p>
          )}

          {/* Section label */}
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500 mb-2">
            Profile
          </p>

          {/* Fields */}
          <Field
            label="Email"
            value={draft.email}
            display={profile.email}
            editing={editing}
            onChange={(v) => setDraft({ ...draft, email: v })}
          />
          <Field
            label="Institution"
            value={draft.institution}
            display={profile.institution}
            editing={editing}
            onChange={(v) => setDraft({ ...draft, institution: v })}
          />

          <Field
            label="Student ID"
            value={draft.studId}
            display={profile.studId}
            editing={editing}
            onChange={(v) => setDraft({ ...draft, studId: v })}
            badge
          />
        </div>
      </div>
      <div className="relative inline-block mt-8">
        {dropdownOpen && (
          <div className="absolute left-0 mt-7 w-44 sm:w-48 bg-white shadow-lg rounded-r-2xl z-10">
            <button className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
              Post
            </button>
            <button className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
              Events
            </button>
            <button className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
              Jobs
            </button>
            <button className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
              Classes
            </button>
            <button className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
              Community
            </button>
          </div>
        )}
        <button
          onClick={dropdownOpen ? () => setDropdownOpen(false) : () => setDropdownOpen((prev) => !prev)}
          className="px-4 py-2 text-indigo-600 hover:text-indigo-800 rounded-md"
        >
          Your Content
        </button>
        <div>pOST</div>
      </div>
    </div>
  );
}

interface FieldProps {
  label: string;
  value: string;
  display: string;
  editing: boolean;
  onChange: (v: string) => void;
  badge?: boolean;
}

function Field({
  label,
  value,
  display,
  editing,
  onChange,
  badge,
}: FieldProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-2 border-b border-gray-50 last:border-none">
      <span className="text-sm text-gray-400">{label}</span>
      {editing ? (
        <input
          className="w-full sm:w-auto sm:max-w-50 px-2 py-1 text-sm border border-gray-200 rounded-md outline-none focus:ring-2 focus:ring-indigo-300"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : badge ? (
        <span className="text-xs font-medium bg-indigo-50 text-indigo-600 px-3 py-0.5 rounded-full">
          {display}
        </span>
      ) : (
        <span className="text-sm font-medium text-gray-800">{display}</span>
      )}
    </div>
  );
}
