"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const { user, loginWithGoogle, loading } = useAuth();
  const router = useRouter();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    if (user && !loading) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  const handleLogin = async () => {
    try {
      setIsLoggingIn(true);
      await loginWithGoogle();
    } catch (error) {
      console.error("Login failed:", error);
      setIsLoggingIn(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--cf-bg-primary)" }}>
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
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: "var(--cf-bg-primary)" }}>
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -left-40 w-96 h-96 rounded-full blur-3xl"
          style={{
            background: "radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, transparent 70%)",
            animation: "float 8s ease-in-out infinite",
          }}
        />
        <div
          className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full blur-3xl"
          style={{
            background: "radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)",
            animation: "float 10s ease-in-out infinite 2s",
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl"
          style={{
            background: "radial-gradient(circle, rgba(99, 102, 241, 0.06) 0%, transparent 70%)",
            animation: "float 12s ease-in-out infinite 1s",
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md px-6 animate-fade-in-up">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center animate-pulse-glow"
            style={{
              background: "linear-gradient(135deg, var(--cf-accent-1), var(--cf-accent-2))",
            }}
          >
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold gradient-text mb-2">CertiForge</h1>
          <p className="text-slate-500 text-sm">Professional Certificate Generation Platform</p>
        </div>

        {/* Login Card */}
        <div
          className="glass-card p-8 mb-6"
          style={{
            background: "rgba(15, 23, 42, 0.6)",
            border: "1px solid rgba(99, 102, 241, 0.12)",
          }}
        >
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-white mb-1">Welcome Back</h2>
            <p className="text-sm text-slate-500">Sign in to access your dashboard</p>
          </div>

          <button
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-250 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              background: "rgba(255, 255, 255, 0.95)",
              color: "#1a1a2e",
            }}
            onMouseEnter={(e) => {
              if (!isLoggingIn) (e.currentTarget.style.background = "rgba(255, 255, 255, 1)");
            }}
            onMouseLeave={(e) => {
              (e.currentTarget.style.background = "rgba(255, 255, 255, 0.95)");
            }}
          >
            {isLoggingIn ? (
              <div className="flex items-center gap-2">
                <div
                  className="w-5 h-5 rounded-full"
                  style={{
                    border: "2px solid transparent",
                    borderTopColor: "#1a1a2e",
                    animation: "spin-slow 0.8s linear infinite",
                  }}
                />
                <span>Signing in...</span>
              </div>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </>
            )}
          </button>
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: "⚡", label: "Bulk Generation" },
            { icon: "🔒", label: "Verified & Secure" },
            { icon: "🎨", label: "Custom Templates" },
          ].map((feature) => (
            <div
              key={feature.label}
              className="glass-card flex flex-col items-center gap-2 py-3 px-2 text-center"
              style={{
                background: "rgba(15, 23, 42, 0.4)",
                border: "1px solid rgba(99, 102, 241, 0.08)",
              }}
            >
              <span className="text-lg">{feature.icon}</span>
              <span className="text-[11px] text-slate-500 font-medium">{feature.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
