"use client";
import Image from "next/image";
import Navbar from "./home/Navbar";
import AuthGuard from "./AuthGuard";

export default function Home() {
  return (
    <AuthGuard>
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans">
        <Navbar />
      </div>
    </AuthGuard>
  );
}
