"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import { db } from "@/firebase/config";
import { collection, getDocs, query } from "firebase/firestore";

interface Stats {
  totalCertificates: number;
  activeTemplates: number;
  totalRecipients: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalCertificates: 0,
    activeTemplates: 0,
    totalRecipients: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch certificates count
        const certificatesQuery = query(collection(db, "certificates"));
        const certificatesSnapshot = await getDocs(certificatesQuery);
        const totalCertificates = certificatesSnapshot.size;

        // Fetch templates count
        const templatesQuery = query(collection(db, "templates"));
        const templatesSnapshot = await getDocs(templatesQuery);
        const activeTemplates = templatesSnapshot.size;

        // Fetch unique recipients count
        const recipientsSet = new Set();
        certificatesSnapshot.forEach((doc) => {
          const data = doc.data() as { email?: string };
          if (data.email) {
            recipientsSet.add(data.email);
          }
        });
        const totalRecipients = recipientsSet.size;

        setStats({
          totalCertificates,
          activeTemplates,
          totalRecipients,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const StatCard = ({ title, value, icon, loading }: { 
    title: string; 
    value: number; 
    icon: string; 
    loading: boolean; 
  }) => (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-all duration-300 hover:shadow-lg hover:shadow-zinc-900/50">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-400 mb-1">{title}</p>
          <div className="text-3xl font-bold text-white">
            {loading ? (
              <div className="animate-pulse bg-zinc-800 h-8 w-20 rounded"></div>
            ) : (
              value.toLocaleString()
            )}
          </div>
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  );

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-zinc-400">Welcome back! Here's an overview of your certificate generation activity.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Total Certificates"
              value={stats.totalCertificates}
              icon="📜"
              loading={loading}
            />
            <StatCard
              title="Active Templates"
              value={stats.activeTemplates}
              icon="🎨"
              loading={loading}
            />
            <StatCard
              title="Total Recipients"
              value={stats.totalRecipients}
              icon="👥"
              loading={loading}
            />
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 hover:border-zinc-700 transition-all duration-300">
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-3">📤</span>
                <h3 className="text-xl font-semibold text-white">Upload CSV</h3>
              </div>
              <p className="text-zinc-400 mb-6">
                Upload a CSV file with recipient information to generate certificates in bulk.
              </p>
              <a
                href="/upload"
                className="inline-flex items-center px-4 py-2 bg-white text-black rounded-lg hover:bg-zinc-200 transition-colors font-medium"
              >
                Upload Now
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 hover:border-zinc-700 transition-all duration-300">
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-3">📜</span>
                <h3 className="text-xl font-semibold text-white">View Certificates</h3>
              </div>
              <p className="text-zinc-400 mb-6">
                Browse, search, and manage all your generated certificates.
              </p>
              <a
                href="/certificates"
                className="inline-flex items-center px-4 py-2 border border-zinc-700 text-white rounded-lg hover:bg-zinc-800 transition-colors font-medium"
              >
                View All
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
            <div className="text-center py-8">
              <span className="text-4xl mb-4 block">📊</span>
              <p className="text-zinc-400">No recent activity</p>
              <p className="text-zinc-400">Start generating certificates to see activity here</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
