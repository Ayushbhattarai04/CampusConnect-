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
      <nav className="bg-violet-800 p-2 fixed w-full top-0 left-0 z-12 pt-2 shadow-lg border-gray-400">
        <div className="container flex items-center justify-between">
          <div
            className="text-white cursor-pointer ml-2 hover:text-gray-900"
            onClick={handleMenuClick}
          >
            <Menu />
          </div>
          <div className="items flex  items-center flex-row gap-2">
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
          <div className="space-x-4 ">
            <Search className="h-6 w-6 text-gray-900 cursor-pointer" />
          </div>
          <div className="text-black cursor-pointer">profile</div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
