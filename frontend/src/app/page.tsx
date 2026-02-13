"use client";
import Image from "next/image";
import Navbar from "./pages/Navbar";
import AuthGuard from "./AuthGuard";
import Sidebar from "./pages/Sidebar";
import { useState } from "react";
import Link from "next/link";
import Setting from "./setting/page";
import Feed from "./feed/page";

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState("Feed");
  const handleMenuClick = () => setSidebarOpen((prev) => !prev);
  return (
    <AuthGuard>
      <div className="flex  justify-center h-screen  bg-white text-gray-800">
        <Navbar onMenuClick={handleMenuClick} />

        <div className="flex flex-1 pt-20 bg-white">
          <Sidebar
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            onSelectSection={setSelectedSection}
          />
          <main
            className={`flex-1 transition-all duration-500 p-auto ${sidebarOpen ? "ml-53" : "ml-16 "}`}
          >
            {selectedSection === "Feed" && <Feed />}
            {selectedSection === "Communities" && (
              <div>Communities content here</div>
            )}
            {selectedSection === "Events" && <div>Events content here</div>}
            {selectedSection === "Chat" && <div>Chat content here</div>}
            {selectedSection === "Tution" && <div>Tution content here</div>}
            {selectedSection === "Career" && <div>Career content here</div>}
            {selectedSection === "Settings" && <Setting />}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
