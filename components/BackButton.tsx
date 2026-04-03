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
  className = "",
}: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    try {
      if (to) {
        router.push(to);
      } else {
        router.back();
      }
    } catch {
      router.push(to || "/dashboard");
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className={`group inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-200 transition-all duration-200 active:scale-[0.97] ${className}`}
    >
      <svg
        className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200"
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
