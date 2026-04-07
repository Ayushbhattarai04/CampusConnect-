"use client";

import { useState } from "react";
import AuthGuard from "../AuthGuard";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleMenuClick = () => setSidebarOpen((prev) => !prev);

  return (
    <AuthGuard>
      <div className="flex text-gray-800">
        <div className="h-full bg-slate-800">
          <Navbar onMenuClick={handleMenuClick} />
        </div>

        <div className="flex-1 mt-16 bg-slate-50 flex">
          <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

          <main
            className={`flex-1 transition-all duration-500  ${
              sidebarOpen ? "ml-53" : "ml-16 "
            }`}
          >
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
