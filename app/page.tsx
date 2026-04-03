"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  }, [user, router]);

  return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: "var(--cf-bg-primary)" }}>
      <div className="flex flex-col items-center gap-4 animate-fade-in">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full" style={{ border: "2px solid rgba(99, 102, 241, 0.1)" }} />
          <div
            className="absolute inset-0 rounded-full"
            style={{
              border: "2px solid transparent",
              borderTopColor: "var(--cf-accent-1)",
              borderRightColor: "var(--cf-accent-2)",
              animation: "spin-slow 0.8s linear infinite",
            }}
          />
        </div>
      </div>
    </div>
  );
}