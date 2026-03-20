"use client";
import React, { useState, useEffect, use } from "react";
import { ArrowLeft } from "lucide-react";

type Profile = {
  userId: string;
  profilePicUrl: string;
  username: string;
  name: string;
  email: string;
  bio: string;
  institution: string;
  studId: string;
};
interface ProfileData {
  name: string;
  username: string;
  email: string;
  bio: string;
  institution: string;
  college: string;
  studId: string;
}


const defaultProfile: ProfileData = {
  name: "Ayush bhattarai",
  username: "Ayush",
  email: "ayush@university.edu",
  bio: "Computer science student passionate about web development and database systems. Building cool things one commit at a time.",
  institution: "Tribhuvan University",
  college: "Institute of Engineering",
  studId: "TU-075-BCT-042",
};

export default function Profile() {
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState<ProfileData>(defaultProfile);
  const [draft, setDraft] = useState<ProfileData>(defaultProfile);

  const handleSave = () => {
    setProfile(draft);
    setEditing(false);
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

  return (
    <div className="w-400 m-10 p-10 mr-10 font-sans">
      <ArrowLeft
        className="top-1 h-6 w-6 text-gray-600 cursor-pointer mb-4"
        onClick={() => window.history.back()}
      />
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        {/* Banner to add later */}
        <div className="h-20 bg-indigo-600" />

        <div className="px-5 pb-5">
          {/* Profile pic row */}
          <div className="flex items-end justify-between -mt-7 mb-3">
            <div className="w-50 h-50 rounded-full bg-indigo-600 border-[3px] border-white flex items-center justify-center text-white text-xl font-semibold">
              {initials}
            </div>

            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-1.5 text-sm border border-indigo-500 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
              >
                Edit profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleCancel}
                  className="px-4 py-1.5 text-sm border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Save
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
            label="College / School"
            value={draft.college}
            display={profile.college}
            editing={editing}
            onChange={(v) => setDraft({ ...draft, college: v })}
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
    <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-none">
      <span className="text-sm text-gray-400">{label}</span>
      {editing ? (
        <input
          className="px-2 py-1 text-sm border border-gray-200 rounded-md outline-none focus:ring-2 focus:ring-indigo-300 max-w-[200px]"
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
