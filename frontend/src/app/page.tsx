"use client";
import Image from "next/image";
import Navbar from "./home/Navbar";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans">
      <Navbar />
    </div>
  );
}
