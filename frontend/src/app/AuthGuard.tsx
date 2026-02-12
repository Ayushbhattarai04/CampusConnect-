import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      router.replace("/auth/notLogged");
    }
  }, [router]);

  return <>{children}</>;
}
