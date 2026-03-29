"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useMemo } from "react";
import { ChevronDown, LogOut } from "lucide-react";

const manageItems = [
  "Users",
  "Moderation",
  "Content",
  "Jobs / Events / Tutions",
];
const systemItems = ["Analytics", "Logs", "Settings"];

type MenuKey = "manage" | "system";

export default function AdminNavbar() {
  const router = useRouter();
  const [openMenu, setOpenMenu] = useState<MenuKey | null>(null);
  const navRef = useRef<HTMLDivElement | null>(null);

  const menuGroups: Array<{ key: MenuKey; items: string[] }> = useMemo(
    () => [
      { key: "manage", items: manageItems },
      { key: "system", items: systemItems },
    ],
    [],
  );

  const username = useMemo(() => {
    if (typeof window === "undefined") return "";
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return "";
      return (JSON.parse(raw) as { username?: string } | null)?.username || "";
    } catch {
      return "";
    }
  }, []);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (!navRef.current) return;
      if (!navRef.current.contains(e.target as Node)) setOpenMenu(null);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpenMenu(null);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, []);

  const logout = () => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("username");
      sessionStorage.removeItem("token");
    } catch {}
    router.replace("/auth/login");
  };

  return (
    <div ref={navRef} className="fixed top-0 left-0 right-0 z-50">
      <div className="bg-slate-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/super" className="font-bold tracking-wide">
              Admin
            </Link>

            <nav className="hidden md:flex items-center gap-1 ml-4">
              <Link
                href="/admin/super"
                className="px-3 py-2 rounded-md text-sm font-semibold hover:text-gray-300"
              >
                Dashboard
              </Link>

              {menuGroups.map(({ key, items }) => (
                <div key={key} className="relative">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenMenu((prev) => (prev === key ? null : key))
                    }
                    className="px-3 py-2 rounded-md text-sm font-semibold hover:text-gray-300 inline-flex items-center gap-1 capitalize"
                  >
                    {key}
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {openMenu === key && (
                    <div className="absolute left-0 mt-2 w-56 rounded-xl border border-slate-700 bg-slate-800 shadow-lg overflow-hidden">
                      {items.map((item) => (
                        <div
                          key={item}
                          className="px-4 py-3 text-sm text-slate-300 cursor-not-allowed"
                          title="Coming soon"
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {username && (
              <span className="hidden sm:block text-sm text-slate-200">
                @{username}
              </span>
            )}
            <button
              type="button"
              onClick={logout}
              className="px-3 py-2 rounded-md text-sm font-semibold hover:text-gray-300 inline-flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
            <button
                type="button"   
                onClick={() => router.push("/")}
                className="px-3 py-2 rounded-md text-sm font-semibold hover:text-gray-300 inline-flex items-center gap-2"
              >
                Home
              </button>
          </div>
        </div>
      </div>
    </div>
  );
}
