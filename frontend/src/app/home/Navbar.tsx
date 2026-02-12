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
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <nav className="bg-violet-800 p-2 fixed w-full top-0 left-0 z-12 pt-14 shadow-lg border-gray-400">
        <div className="container flex items-center justify-between">
          {/* Menu Area */}
          <div
            className="text-white cursor-pointer ml-2  fixed top-5 hover:text-gray-500"
            onClick={handleMenuClick}
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

          {/* Search bar area */}
          <div className="space-x-4 fixed top-4  right-150 flex items-center">
            <Search className="h-6 w-6 text-white cursor-pointer" />
          </div>

          {/* Profile area */}
          <div className="text-white cursor-pointer fixed right-0 top-0 m-3">
            profile
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
