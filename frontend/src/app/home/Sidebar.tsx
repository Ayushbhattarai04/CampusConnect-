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

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  return (
    <aside
      className={`fixed below-12 left-0 top-16 border-gray-900 bg-white h-[calc(100%-4rem)] shadow-lg z-30 flex flex-col transition-all duration-500 ${open ? "w-53" : "w-16"}`}
    >
      <ul className="space-y-11 mt-10 pl-3 pr-2">
        <li className="flex items-center cursor-pointer  text-gray-600 hover:text-gray-900 px-2">
          <Home className="h-6 w-6" />
          {open && <span className="ml-3">Feed</span>}
        </li>
        <li className="flex items-center cursor-pointer text-gray-600 hover:text-gray-900 px-2">
          <Users className="h-6 w-6" />
          {open && <span className="ml-3">Communities</span>}
        </li>
        <li className="flex items-center cursor-pointer text-gray-600 hover:text-gray-900 px-2">
          <Calendar className="h-6 w-6" />
          {open && <span className="ml-3">Events</span>}
        </li>
        <li className="flex items-center cursor-pointer text-gray-600 hover:text-gray-900 px-2">
          <MessageCircle className="h-6 w-6" />
          {open && <span className="ml-3">Chat</span>}
        </li>
        <li className="flex items-center cursor-pointer text-gray-600 hover:text-gray-900 px-2">
          <BookOpen className="h-6 w-6" />
          {open && <span className="ml-3">Tution</span>}
        </li>
        <li className="flex items-center cursor-pointer text-gray-600 hover:text-gray-900 px-2">
          <Briefcase className="h-6 w-6" />
          {open && <span className="ml-3">Career</span>}
        </li>
        <li
          className="flex items-center cursor-pointer text-gray-600 hover:text-gray-900 px-2"
          onClick={() => (window.location.href = "auth/register")}
        >
          <LogOut className="h-6 w-6" />
          {open && <span className="ml-3">signup</span>}
        </li>
        <li
          className="flex items-center cursor-pointer text-gray-600 hover:text-gray-900 px-2"
          onClick={() => (window.location.href = "auth/login")}
        >
          <LogOut className="h-6 w-6" />
          {open && <span className="ml-3">login</span>}
        </li>
        <li className="flex items-center cursor-pointer text-gray-600 hover:text-gray-900 px-2 pt-40">
          <Settings className="h-6 w-6" />
          {open && <span className="ml-3">Settings</span>}
        </li>
        {open && (
          <li>
            <h6 className="text-gray-600 text-sm"> © Campus Connect 2026</h6>
          </li>
        )}
      </ul>
    </aside>
  );
};

export default Sidebar;
