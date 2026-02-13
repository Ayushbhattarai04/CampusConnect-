"use client";
import React, { useState, useEffect } from "react";
import { Menu, Plus, Search } from "lucide-react";
import Sidebar from "./Sidebar";
import createPost from "../posts/page";
import Link from "next/link";

export default function Navbar({ onMenuClick }: { onMenuClick: () => void }) {
  const [localUsername, setLocalUsername] = useState("Profile");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUsername = localStorage.getItem("username");
      console.log("Navbar localStorage username:", storedUsername);
      if (storedUsername) setLocalUsername(storedUsername);
    }
  }, []);

  const handleProfileClick = () => {
    console.log("Profile button clicked, username:", localUsername);
    if (
      localUsername &&
      localUsername !== "Profile" &&
      localUsername !== "undefined"
    ) {
      window.location.href = `/profile/${encodeURIComponent(localUsername)}`;
    } else {
      alert("You are not logged in!");
    }
  };

  return (
    <nav className="bg-violet-800 p-2 fixed w-full top-0 left-0 z-12 pt-14 shadow-lg border-gray-400">
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

        {/* Search bar area */}
        <div className="space-x-10 fixed top-4  right-150 flex items-center">
          <input
            type="text"
            placeholder="Search..."
            className=" px-40 py-1 rounded-2xl   bg-gray-200 focus:outline-none focus:ring-1 focus:ring-red-500 focus:ring-offset-1 focus:ring-offset-gray-200 transition duration-300"
          />
        </div>
        {/* Search bar button */}
        <div className="space-x-4 fixed top-4  right-140 flex items-center">
          <Search className="h-6 w-6 text-white cursor-pointer" />
        </div>

        {/* Createpost area */}
        <div className="fixed right-10 top-4">
          <button
            className="text-white hover:text-gray-500"
            onClick={handleProfileClick}
          >
            {localUsername}
          </button>
        </div>
      </div>
    </nav>
  );
}
