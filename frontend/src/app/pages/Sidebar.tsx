import React from "react";
import {
  Home,
  Users,
  MessageCircle,
  Settings,
  Calendar,
  BookOpen,
  Briefcase,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { title } from "process";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  const items = [
    { label: "Feed", href: "/feed", Icon: Home, title: "Feed" },
    {
      label: "Communities",
      href: "/communities",
      Icon: Users,
      title: "Communities",
    },
    { label: "Events", href: "/events", Icon: Calendar, title: "Events" },
    { label: "Chat", href: "/chat", Icon: MessageCircle, title: "Chat" },
    { label: "Tution", href: "/tutions", Icon: BookOpen, title: "Tution" },
    { label: "Career", href: "/career", Icon: Briefcase, title: "Career" },
  ] as const;

  const isActive = (href: string) => {
    if (!pathname) return false;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <aside
      className={`border-gray-900 bg-slate-100 shadow-lg z-2 pb-265flex flex-col transition-all duration-500 ${open ? "w-57 " : "w-16"} fixed top-18 left-0 h-screen overflow-hidden`}
    >
      <div>
        {open && (
          <a className="text-bg font-monrope tracking-tighter m-1">Connect</a>
        )}
      </div>
      <ul className="space-y-11 mt-10 pl-3 pr-2">
        {items.map(({ label, href, Icon }) => (
          <li key={href}>
            <Link
              href={href}
              onClick={onClose}
              className={`flex items-center cursor-pointer px-2  hover:text-orange-600 ${
                isActive(href) ? "text-orange-600" : "text-slate-600"
              }`}
              aria-current={isActive(href) ? "page" : undefined}
            >
              <Icon className="h-6 w-6" />
              {open && <span className="ml-3">{label}</span>}
            </Link>
          </li>
        ))}

        <li className="mt-70">
          <Link
            href="/setting"
            onClick={onClose}
            className={`flex items-center cursor-pointer px-2 hover:text-orange-600 ${
              isActive("/setting") ? "text-orange-600" : "text-slate-600"
            }`}
            aria-current={isActive("/setting") ? "page" : undefined}
          >
            <Settings className="h-6 w-6" />
            {open && <span className="ml-3">Settings</span>}
          </Link>
        </li>
        {open && (
          <li className="mt-25">
            <h6 className="text-slate-600 text-sm hover:underline">
              {" "}
              © Campus Connect 2026
            </h6>
          </li>
        )}
      </ul>
    </aside>
  );
}
