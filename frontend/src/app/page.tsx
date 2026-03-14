"use client";
import Navbar from "./pages/Navbar";
import AuthGuard from "./AuthGuard";
import Sidebar from "./pages/Sidebar";
import { useState } from "react";
import Setting from "./setting/page";
import Feed from "./feed/page";
import PostDetailPage from "./feed/[id]/page";
import Tution from "./tutions/page";
import Career from "./career/page";
import Events from "./events/page";
import Chat from "./chat/page";
import Community from "./communities/page";

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState("Feed");
  const handleMenuClick = () => setSidebarOpen((prev) => !prev);
  return (
    <AuthGuard>
      <div className="flex h-screen bg-white text-gray-800">
        <div className=" h-full  bg-slate-800">
          <Navbar onMenuClick={handleMenuClick} />
        </div>
        <div className=" flex-1 mt-16 bg-white">
          <Sidebar
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            onSelectSection={setSelectedSection}
          />
          <main
            className={`flex-1 transition-all duration-500  ${sidebarOpen ? "ml-53" : "ml-16 "}`}
          >
            {selectedSection === "Feed" && <Feed />}
            {selectedSection === "Communities" && <Community />}
            {selectedSection === "Events" && <Events/>}
            {selectedSection === "Chat" && <Chat/>}
            {selectedSection === "Tution" && <Tution />}
            {selectedSection === "Career" && <Career />}
            {selectedSection === "Settings" && <Setting />}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
