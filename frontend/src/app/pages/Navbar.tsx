"use client";
import React, { useState, useEffect } from "react";
import { Menu, Plus, Search, Users } from "lucide-react";
import Sidebar from "./Sidebar";
import Link from "next/link";
import { useParams } from "next/navigation";
type UserInfo = {
  userId: number;
  username: string;
  email: string;
  profilePicUrl: string;
  User?: { username?: string };
};
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

export default function Navbar({ onMenuClick }: { onMenuClick: () => void }) {
  const [users, setUsers] = useState<UserInfo | null>(null);
  const [username, setUsername] = useState("");
  const { id } = useParams();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        setUsername(parsed?.username || "");
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

        
        

        {/* Profile Area */}
        <div className="  fixed top-4 right-4 flex items-center gap-2">
          <Link href="/profile">
            <img
              src={users?.profilePicUrl || "/default-profile.png"}
              alt="Profile"
              className="h-10 w-10 rounded-full cursor-pointer   top-4 right-4 hover:ring-2 hover:ring-gray-300 transition duration-300"
            />
          </Link>

          <a className="text-white text-sm font-bold ml-2  top-14 right-4">{username}</a>
        </div>
      </div>
    </nav>
  );
}
