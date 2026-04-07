"use client";
import React, { useEffect, useRef, useState } from "react";
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
  const dropdownRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!navDropdownOpen) return;
      const target = event.target as Node | null;
      if (!target) return;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setNavDropdownOpen(false);
      }
    };

    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [navDropdownOpen]);

  //nav drop down toggler
  const toggleNavDropdown = () => {
    setNavDropdownOpen((prev) => !prev);
  };

  return (
    <nav className="fixed inset-x-0 top-0 p-2 z-50 border-b border-gray-200 bg-white shadow-sm">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          {/* Left: Menu and logo */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="text-slate-500 mr-1 hover:text-gray-500 cursor-pointer p-1 rounded-md focus:outline-none  "
              onClick={onMenuClick}
              aria-label="Open menu"
            >
              <Menu />
            </button>

            <Link href="/" className="flex items-center gap-2">
              <span className="text-purple-800 text-xl sm:text-2xl tracking-tighter font-bold hover:text-gray-600">
                CampusConnect
              </span>
              <img
                src="/img/campuslogo.png"
                alt="CampusConnect Logo"
                className="h-9 w-9"
              />
            </Link>
          </div>

          {/* Right: Account dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={toggleNavDropdown}
              className="flex items-center gap-2 rounded-full border border-slate-300 bg-white px-2 py-1 shadow-sm hover:bg-slate-100"
              aria-haspopup="menu"
              aria-expanded={navDropdownOpen}
            >
              <img
                src={users?.profilePicUrl || "/default-profile.png"}
                alt="Profile"
                className="h-8 w-8 rounded-full object-cover ring-2 ring-slate-700"
              />
              <span className="hidden sm:block max-w-40 truncate text-slate-600 text-sm font-bold">
                {username}
              </span>
              {navDropdownOpen ? (
                <ChevronUp className="text-slate-500" />
              ) : (
                <ChevronDown className="text-gray-500" />
              )}
            </button>

            {navDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 z-20 rounded-xl border border-slate-600/60 bg-slate-800/95 backdrop-blur shadow-xl ring-1 ring-black/10 p-2">
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
        </div>
      </div>
    </nav>
  );
}
