"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function RegisterPage() {
  const { user, loginWithGoogle, loading } = useAuth();
  const router = useRouter();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    if (user && !loading) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  const handleRegister = async () => {
    try {
      setIsLoggingIn(true);
      // Firebase auth uses the same Google auth provider for both login and signup
      await loginWithGoogle();
    } catch (error) {
      console.error("Registration failed:", error);
      setIsLoggingIn(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--cf-bg-primary)" }}>
         <div className="w-12 h-12 rounded-full border-t-2 border-r-2 border-indigo-400 animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: "var(--cf-bg-primary)" }}>
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full blur-3xl opacity-50" style={{ background: "radial-gradient(circle, rgba(236, 72, 153, 0.12) 0%, transparent 70%)" }} />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full blur-3xl opacity-50" style={{ background: "radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, transparent 70%)" }} />
      </div>

      <div className="relative z-10 w-full max-w-md px-6 animate-fade-in-up">
        
        {/* Back navigation */}
        <div className="mb-8">
           <Link href="/" className="text-sm font-medium text-slate-400 hover:text-white transition-colors flex items-center gap-2">
             &larr; Back to Home
           </Link>
        </div>

        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center shadow-lg shadow-pink-500/20" style={{ background: "linear-gradient(135deg, var(--cf-accent-2), var(--cf-accent-1))" }}>
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-indigo-400 mb-2 font-outfit">Create Free Account</h1>
          <p className="text-slate-400 text-sm">Join CertiForge Pro today to launch your events.</p>
        </div>

        {/* Card */}
        <div className="glass-card p-8 mb-6" style={{ background: "rgba(15, 23, 42, 0.6)", border: "1px solid rgba(236, 72, 153, 0.12)" }}>
          <div className="text-center mb-6">
             <p className="text-sm text-slate-400">We currently support quick authentication via Google.</p>
          </div>

          <button
            onClick={handleRegister}
            disabled={isLoggingIn}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl font-bold transition-all duration-250 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed hover:scale-105"
            style={{ background: "rgba(255, 255, 255, 0.95)", color: "#1a1a2e" }}
          >
            {isLoggingIn ? (
              <div className="flex items-center gap-2">
                 <div className="w-5 h-5 rounded-full border-t-2 border-r-2 border-slate-900 animate-spin"></div>
                <span>Creating account...</span>
              </div>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Sign up with Google
              </>
            )}
          </button>
          
          <div className="mt-6 text-center text-xs text-slate-500">
             By signing up, you agree to the Terms of Service and Privacy Policy.
          </div>
        </div>

        <div className="text-center text-sm text-slate-400">
           Already have an account? <Link href="/login" className="text-indigo-400 font-medium hover:text-indigo-300">Sign in directly</Link>
        </div>
      </div>
    </div>
  );
}
