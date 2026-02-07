import React from "react";
import { Home, User, Settings, LogOut, X } from "lucide-react";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open }) => {
  return (
    <aside
      className={`fixed left-0 top-11 bg-violet-200 h-[calc(100%-4rem)] shadow-lg z-30 flex flex-col transition-all duration-300 ${open ? "w-64" : "w-16"}`}
    >
      <ul className="space-y-6 mt-2 pl-3">
        <li className="flex items-center cursor-pointer text-gray-600 hover:text-gray-900 px-2">
          <Home className="h-6 w-6" />
          {open && <span className="ml-3">Home</span>}
        </li>
        <li className="flex items-center cursor-pointer text-gray-600 hover:text-gray-900 px-2">
          <User className="h-6 w-6" />
          {open && <span className="ml-3">Profile</span>}
        </li>
        <li className="flex items-center cursor-pointer text-gray-600 hover:text-gray-900 px-2">
          <Settings className="h-6 w-6" />
          {open && <span className="ml-3">Settings</span>}
        </li>
        <li className="flex items-center cursor-pointer text-gray-600 hover:text-gray-900 px-2">
          <LogOut className="h-6 w-6" />
          {open && <span className="ml-3">Logout</span>}
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;
