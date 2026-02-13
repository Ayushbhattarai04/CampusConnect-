"use client";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [avatar, setAvatar] = useState("/img/profile-default.png");

  useEffect(() => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    if (!token) {
      setError("You are not logged in.");
      setLoading(false);
      return;
    }

    fetch("http://localhost:5000/api/auth/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        setUser(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Could not load profile. Please try again.");
        setLoading(false);
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    window.location.href = "/login";
  };

  const handleAvatarChange = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(URL.createObjectURL(file));
    }
  };

  const copyStudentId = () => {
    navigator.clipboard.writeText(user.studId || "");
    alert("Student ID copied!");
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600 text-lg">
        Loading profile...
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 text-lg">
        {error}
      </div>
    );

  if (!user)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 text-lg">
        No user data found.
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-100 via-purple-100 to-violet-200 p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* HEADER */}
        <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-8 text-white text-center">
          <div className="relative w-28 h-28 mx-auto mb-3">
            <img
              src={avatar}
              className="w-full h-full rounded-full object-cover border-4 border-white shadow-lg"
            />

            <label className="absolute bottom-0 right-0 bg-white text-xs px-2 py-1 rounded-full cursor-pointer shadow">
              Edit
              <input
                type="file"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </label>
          </div>

          <h1 className="text-3xl font-bold">{user.username}</h1>
          <p className="opacity-90">{user.email}</p>
        </div>

        {/* BODY */}
        <div className="p-8 space-y-6">
          {/* INFO GRID */}
          <div className="grid md:grid-cols-2 gap-6">
            <InfoCard title="Institution" value={user.institution || "N/A"} />

            <InfoCard
              title="Student ID"
              value={
                <div className="flex items-center gap-2">
                  {user.studId || "N/A"}
                  {user.studId && (
                    <button
                      onClick={copyStudentId}
                      className="text-xs bg-gray-100 px-2 py-1 rounded hover:bg-gray-200"
                    >
                      Copy
                    </button>
                  )}
                </div>
              }
            />

            <InfoCard title="Account Status" value="Active" />
            <InfoCard title="Member Since" value="2025" />
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex gap-4 pt-4">
            <button className="flex-1 bg-violet-600 text-white py-3 rounded-xl font-semibold hover:bg-violet-700 transition">
              Edit Profile
            </button>

            <button
              onClick={handleLogout}
              className="flex-1 bg-red-500 text-white py-3 rounded-xl font-semibold hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ title, value }: any) {
  return (
    <div className="bg-gray-50 rounded-xl p-5 shadow-sm border border-gray-100">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-lg font-semibold text-gray-800 mt-1">{value}</p>
    </div>
  );
}
