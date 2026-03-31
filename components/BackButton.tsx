"use client";

import { useRouter } from "next/navigation";

interface BackButtonProps {
  to?: string;
  label?: string;
  className?: string;
}

export default function BackButton({ 
  to = "", 
  label = "Back", 
  className = "" 
}: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    console.log("🔙 Back button clicked");
    try {
      if (to) {
        router.push(to);
      } else {
        router.back();
      }
    } catch (error) {
      console.error("❌ Navigation failed, using fallback:", error);
      if (to) {
        router.push(to);
      } else {
        router.push("/dashboard");
      }
    }
  };

  return (
    <button
      onClick={handleBack}
      className={`flex items-center space-x-2 text-zinc-400 hover:text-white transition-colors group ${className}`}
    >
      <svg 
        className="w-5 h-5 group-hover:-translate-x-1 transition-transform" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M15 19l-7-7 7-7" 
        />
      </svg>
      <span>{label}</span>
    </button>
  );
}
