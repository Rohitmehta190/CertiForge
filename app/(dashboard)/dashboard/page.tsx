"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/firebase/config";
import { collection, getDocs, query, where } from "firebase/firestore";

interface Stats {
  totalCertificates: number;
  activeTemplates: number;
  totalRecipients: number;
}

function useCountUp(target: number, duration = 1200) {
  const [count, setCount] = useState(0);
  const raf = useRef<number>(0);
  const startTime = useRef<number>(0);

  useEffect(() => {
    if (target === 0) { setCount(0); return; }
    startTime.current = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setCount(Math.round(ease * target));
      if (progress < 1) raf.current = requestAnimationFrame(animate);
    };

    raf.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);

  return count;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalCertificates: 0,
    activeTemplates: 0,
    totalRecipients: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      try {
        const certificatesQuery = query(
          collection(db, "certificates"),
          where("userId", "==", user.uid)
        );
        const certificatesSnapshot = await getDocs(certificatesQuery);
        const totalCertificates = certificatesSnapshot.size;

        const templatesQuery = query(collection(db, "templates"));
        const templatesSnapshot = await getDocs(templatesQuery);
        const activeTemplates = templatesSnapshot.size;

        const recipientsSet = new Set<string>();
        certificatesSnapshot.forEach((doc) => {
          const data = doc.data() as { email?: string };
          if (data.email) recipientsSet.add(data.email);
        });

        setStats({
          totalCertificates,
          activeTemplates,
          totalRecipients: recipientsSet.size,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good Morning";
    if (h < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const certCount = useCountUp(loading ? 0 : stats.totalCertificates);
  const templateCount = useCountUp(loading ? 0 : stats.activeTemplates);
  const recipientCount = useCountUp(loading ? 0 : stats.totalRecipients);

  const statCards = [
    {
      title: "Total Certificates",
      value: certCount,
      gradient: "linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(139, 92, 246, 0.08))",
      iconBg: "linear-gradient(135deg, #6366f1, #8b5cf6)",
      icon: (
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      title: "Active Templates",
      value: templateCount,
      gradient: "linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(52, 211, 153, 0.08))",
      iconBg: "linear-gradient(135deg, #10b981, #34d399)",
      icon: (
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm0 8a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z" />
        </svg>
      ),
    },
    {
      title: "Total Recipients",
      value: recipientCount,
      gradient: "linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(251, 191, 36, 0.08))",
      iconBg: "linear-gradient(135deg, #f59e0b, #fbbf24)",
      icon: (
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  const quickActions = [
    {
      title: "Upload CSV",
      desc: "Upload recipients and generate certificates in bulk.",
      href: "/upload",
      gradient: "linear-gradient(135deg, var(--cf-accent-1), var(--cf-accent-2))",
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      ),
      btnLabel: "Upload Now",
      primary: true,
    },
    {
      title: "Import Design",
      desc: "Upload an image or PDF and overlay text on your certificate design.",
      href: "/import",
      gradient: "linear-gradient(135deg, #10b981, #34d399)",
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      btnLabel: "Open Importer",
      primary: false,
    },
    {
      title: "View Certificates",
      desc: "Browse, search, and manage all your generated certificates.",
      href: "/certificates",
      gradient: "linear-gradient(135deg, #f59e0b, #fbbf24)",
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      btnLabel: "View All",
      primary: false,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Greeting Banner */}
      <div
        className="glass-card p-6 animate-fade-in-up"
        style={{
          background: "linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(139, 92, 246, 0.04))",
          border: "1px solid rgba(99, 102, 241, 0.12)",
        }}
      >
        <h1 className="text-2xl font-bold text-white mb-1">
          {greeting()}, {user?.displayName?.split(" ")[0] || "there"} 👋
        </h1>
        <p className="text-slate-500 text-sm">
          Here&apos;s an overview of your certificate generation activity.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statCards.map((card, i) => (
          <div
            key={card.title}
            className={`glass-card glass-card-hover p-5 animate-fade-in-up stagger-${i + 1}`}
            style={{ background: card.gradient }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">{card.title}</p>
                <div className="text-3xl font-bold text-white">
                  {loading ? (
                    <div className="skeleton h-8 w-16" />
                  ) : (
                    card.value.toLocaleString()
                  )}
                </div>
              </div>
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: card.iconBg }}
              >
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickActions.map((action, i) => (
          <div
            key={action.title}
            className={`glass-card glass-card-hover p-6 animate-fade-in-up stagger-${i + 2}`}
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
              style={{ background: action.gradient }}
            >
              {action.icon}
            </div>
            <h3 className="text-base font-semibold text-white mb-2">{action.title}</h3>
            <p className="text-sm text-slate-500 mb-5 leading-relaxed">{action.desc}</p>
            <Link
              href={action.href}
              prefetch
              className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 active:scale-[0.97] ${
                action.primary
                  ? "gradient-btn"
                  : "text-slate-300 border border-white/[0.08] hover:bg-white/[0.04] hover:border-white/[0.15]"
              }`}
            >
              <span className="relative z-10">{action.btnLabel}</span>
              <svg className="w-4 h-4 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="glass-card p-6 animate-fade-in-up stagger-6">
        <h3 className="text-base font-semibold text-white mb-4">Recent Activity</h3>
        <div className="text-center py-8">
          <div
            className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: "rgba(99, 102, 241, 0.08)" }}
          >
            <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm text-slate-500 mb-1">No recent activity</p>
          <p className="text-xs text-slate-600">Start generating certificates to see activity here</p>
        </div>
      </div>
    </div>
  );
}
