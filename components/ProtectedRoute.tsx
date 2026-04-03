"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--cf-bg-primary)" }}>
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          {/* Gradient spinner */}
          <div className="relative w-12 h-12">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                border: "2px solid rgba(99, 102, 241, 0.1)",
              }}
            />
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
          <p className="text-sm text-slate-500 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
