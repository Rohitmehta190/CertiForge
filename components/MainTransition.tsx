"use client";

import { usePathname } from "next/navigation";

export default function MainTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div
      key={pathname}
      className="animate-fade-in-up"
      style={{ animationDuration: "0.35s" }}
    >
      {children}
    </div>
  );
}
