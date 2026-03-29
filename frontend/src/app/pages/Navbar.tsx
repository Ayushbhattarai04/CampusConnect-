"use client";
import React, { useState, useEffect } from "react";
import { Menu, ChevronDown, ChevronUp, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

type UserInfo = {
  userId: number;
  username: string;
  email: string;
  profilePicUrl: string;
  User?: { username?: string };
};

type Role = "user" | "college" | "admin";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

export default function Navbar({ onMenuClick }: { onMenuClick: () => void }) {
  const [users, setUsers] = useState<UserInfo | null>(null);
  const [username, setUsername] = useState("");
  const [role, setRole] = useState<Role | null>(null);
  const { id } = useParams();
  const [navDropdownOpen, setNavDropdownOpen] = useState(false);

  const getRoleFromToken = (): Role | null => {
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) return null;
      const parts = token.split(".");
      if (parts.length < 2) return null;
      const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
      const json = JSON.parse(atob(payload));
      const candidate = json?.role;
      if (
        candidate === "admin" ||
        candidate === "user" ||
        candidate === "college"
      ) {
        return candidate;
      }
      return null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        setUsername(parsed?.username || "");
        const storedRole = (parsed?.role as Role) || null;
        const tokenRole = getRoleFromToken();
        const finalRole = storedRole || tokenRole;
        setRole(finalRole);

        // Keep storage in sync for older sessions
        if (!storedRole && finalRole) {
          localStorage.setItem(
            "user",
            JSON.stringify({ ...parsed, role: finalRole }),
          );
        }
      } catch {}
    }

    const fetchProfileInfo = async () => {
      if (!id) return;
      try {
        const response = await fetch(`${API_BASE_URL}/api/profile/${id}`);
        if (!response.ok) throw new Error("Failed to fetch user info");
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };

    fetchProfileInfo();
  }, []);

  //nav drop down toggler
  const toggleNavDropdown = () => {
    setNavDropdownOpen((prev) => !prev);
  };

  return (
    <nav className="bg-slate-800 p-2 fixed w-full top-0  z-12 pt-14 shadow-lg border-gray-400 ">
      <div className="container flex items-center justify-between">
        {/* Menu Area */}
        <div
          className="text-white cursor-pointer ml-2  fixed top-5 hover:text-gray-500"
          onClick={onMenuClick}
        >
          <Menu />
        </div>

        {/*  Logo and Title */}
        <div className="items flex fixed left-20 top-2 items-center flex-row gap-2">
          <div>
            <img
              src="img/campuslogo.png"
              alt="CampusConnect Logo"
              className="h-12 w-12 "
            />
          </div>
          <div className="text-white text-lg font-bold cursor-pointer  hover:text-gray-600">
            CampusConnect
          </div>
        </div>

        <button
          onClick={toggleNavDropdown}
          className="fixed text-white ml-400 top-3"
        >
          {navDropdownOpen ? (
            <ChevronUp className="text-white font-sm hover:text-gray-500" />
          ) : (
            <ChevronDown className="text-gray-500" />
          )}
        </button>
        <a className="text-white text-sm fixed top-4 ml-360">{username}</a>
        {navDropdownOpen && (
          <div className="absolute top-16 right-4 w-64 z-20 rounded-xl border border-slate-600/60 bg-slate-800/95 backdrop-blur shadow-xl ring-1 ring-black/10 p-2">
            <div className="flex items-center gap-3 px-2 py-2">
              <img
                src={users?.profilePicUrl || "/default-profile.png"}
                alt="Profile"
                className="h-10 w-10 rounded-full object-cover ring-2 ring-slate-700"
              />
              <div className="min-w-0">
                <div className="text-sm font-bold text-white truncate">
                  {username || "Account"}
                </div>
                <div className="text-xs text-slate-300 truncate">
                  {role ? role.toUpperCase() : ""}
                </div>
              </div>
            </div>

            <div className="my-2 h-px bg-slate-700/70" />

            {(role === "admin" || role === "college") && (
              <Link
                href={role === "admin" ? "/admin/super" : "/admin/college"}
                onClick={() => setNavDropdownOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-white hover:bg-slate-700/60 transition"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
            )}

            <Link
              href="/profile"
              onClick={() => setNavDropdownOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-white hover:bg-slate-700/60 transition"
            >
              <span>View Profile</span>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
