import Image from "next/image";
import Navbar from "./home/Navbar";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans">
      <Navbar />
      <main className="flex w-full flex-col items-center justify-center gap-4 px-4 text-center"></main>
    </div>
  );
}
