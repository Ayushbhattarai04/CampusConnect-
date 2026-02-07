"use client";
import React, { useState } from "react";
import { Menu, Search } from "lucide-react";
import Sidebar from "./Sidebar";

const Navbar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const handleMenuClick = () => {
    setSidebarOpen((prev) => !prev);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <nav className="bg-white p-2 fixed w-full top-0 left-0 z-10 shadow-lg border-gray-400">
        <div className="container flex items-center justify-between">
          <div
            className="text-gray-600 cursor-pointer ml-2 hover:text-gray-900"
            onClick={handleMenuClick}
          >
            <Menu />
          </div>
          <div className="text-gray-800 text-lg font-bold cursor-pointer hover:text-gray-600">
            CampusConnect
          </div>
          <div className="space-x-4">
            <Search className="h-6 w-6 text-gray-900 cursor-pointer" />
          </div>
          <div className="text-black cursor-pointer">profile</div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
