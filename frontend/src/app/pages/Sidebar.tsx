import React from "react";
import {
  Home,
  Users,
  MessageCircle,
  Settings,
  Calendar,
  BookOpen,
  Briefcase,
  LogOut,
} from "lucide-react";
import Setting from "../setting/page";
import Link from "next/link";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  onSelectSection?: (section: string) => void;
}

export default function Sidebar({
  open,
  onClose,
  onSelectSection,
}: SidebarProps) {
  return (
    <aside
      className={`border-gray-900 bg-white shadow-lg z-2 pb-25 flex flex-col transition-all duration-500 ${open ? "w-53 " : "w-16"} fixed top-15 left-0 h-screen overflow-hidden`}
    >
      <ul className="space-y-11 mt-10 pl-3 pr-2">
        <li
          className="flex items-center cursor-pointer  text-violet-600 hover:text-violet-900  px-2"
          onClick={() => {
            if (typeof onSelectSection === "function") onSelectSection("Feed");
          }}
        >
          <Home className="h-6 w-6" />
          {open && <span className="ml-3">Feed</span>}
        </li>
        <li
          className="flex items-center cursor-pointer text-violet-600 hover:text-violet-900 px-2"
          onClick={() => {
            if (typeof onSelectSection === "function")
              onSelectSection("Communities");
          }}
        >
          <Users className="h-6 w-6" />
          {open && <span className="ml-3">Communities</span>}
        </li>
        <li
          className="flex items-center cursor-pointer text-violet-600 hover:text-violet-900 px-2"
          onClick={() => {
            if (typeof onSelectSection === "function")
              onSelectSection("Events");
          }}
        >
          <Calendar className="h-6 w-6" />
          {open && <span className="ml-3">Events</span>}
        </li>
        <li
          className="flex items-center cursor-pointer text-violet-600 hover:text-violet-900 px-2"
          onClick={() => {
            if (typeof onSelectSection === "function") onSelectSection("Chat");
          }}
        >
          <MessageCircle className="h-6 w-6" />
          {open && <span className="ml-3">Chat</span>}
        </li>
        <li
          className="flex items-center cursor-pointer text-violet-600 hover:text-violet-900 px-2"
          onClick={() => {
            if (typeof onSelectSection === "function")
              onSelectSection("Tution");
          }}
        >
          <BookOpen className="h-6 w-6" />
          {open && <span className="ml-3">Tution</span>}
        </li>
        <li
          className="flex items-center cursor-pointer text-violet-600 hover:text-violet-900 px-2"
          onClick={() => {
            if (typeof onSelectSection === "function")
              onSelectSection("Career");
          }}
        >
          <Briefcase className="h-6 w-6" />
          {open && <span className="ml-3">Career</span>}
        </li>

        <li
          className="flex items-center cursor-pointer text-violet-600 hover:text-violet-900 px-2 mt-70"
          onClick={() => {
            if (typeof onSelectSection === "function")
              onSelectSection("Settings");
          }}
        >
          
            <Settings className="h-6 w-6" />
          {open && <span className="ml-3">Settings</span>}
          
          
        </li>
        {open && (
          <li className="mt-30">
            <h6 className="text-blue-600 text-sm"> © Campus Connect 2026</h6>
          </li>
        )}
      </ul>
    </aside>
  );
}
