"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FirebaseService, CertificateRecord } from "@/utils/firebaseService";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import CertificatePreview from "@/components/CertificatePreview";
import ConfirmModal from "@/components/ConfirmModal";
import { downloadCertificatePdf } from "@/utils/downloadCertificatePdf";

export default function CertificatesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [certificates, setCertificates] = useState<CertificateRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("default");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<CertificateRecord | null>(null);

  const fetchCertificates = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await FirebaseService.getCertificates(user.uid);
      setCertificates(data);
    } catch (error) {
      console.error("Error fetching certificates:", error);
      showToast("Failed to load certificates", "error");
    } finally {
      setLoading(false);
    }
  }, [user, showToast]);

  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  useEffect(() => {
    const saved = localStorage.getItem("selectedTemplate");
    if (saved) setSelectedTemplate(saved);
  }, []);

  const filtered = certificates.filter(
    (cert) =>
      cert.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.certificateId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await FirebaseService.deleteCertificate(deleteTarget.certificateId);
      setCertificates(certificates.filter((c) => c.certificateId !== deleteTarget.certificateId));
      showToast("Certificate deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting certificate:", error);
      showToast("Failed to delete certificate", "error");
    } finally {
      setDeleteTarget(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="skeleton h-7 w-48 mb-2" />
            <div className="skeleton h-4 w-72" />
          </div>
          <div className="skeleton h-9 w-32 rounded-xl" />
        </div>
        <div className="skeleton h-10 w-full rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card p-4">
              <div className="skeleton h-40 w-full rounded-lg mb-4" />
              <div className="skeleton h-5 w-36 mb-2" />
              <div className="skeleton h-4 w-48 mb-4" />
              <div className="flex gap-2">
                <div className="skeleton h-8 flex-1 rounded-lg" />
                <div className="skeleton h-8 flex-1 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">My Certificates</h1>
          <p className="text-sm text-slate-500">View and manage all your generated certificates</p>
        </div>
        <button
          type="button"
          onClick={() => router.push("/upload")}
          className="gradient-btn px-4 py-2 rounded-xl text-sm font-semibold active:scale-[0.97] shrink-0"
        >
          <span className="relative z-10 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Generate New
          </span>
        </button>
      </div>

      {/* Search */}
      {certificates.length > 0 && (
        <div className="relative animate-fade-in-up stagger-1">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by name, email, course, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
            style={{
              background: "rgba(15, 23, 42, 0.5)",
              border: "1px solid rgba(99, 102, 241, 0.1)",
            }}
          />
        </div>
      )}

      {/* Certificate Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((certificate, i) => (
          <div
            key={certificate.certificateId}
            role="link"
            tabIndex={0}
            className={`glass-card glass-card-hover overflow-hidden cursor-pointer animate-fade-in-up stagger-${Math.min(i + 1, 6)}`}
            onClick={() => router.push(`/certificates/${certificate.id}`)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                router.push(`/certificates/${certificate.id}`);
              }
            }}
          >
            <div className="aspect-[4/3] relative overflow-hidden" style={{ background: "rgba(15, 23, 42, 0.4)" }}>
              <div className="absolute inset-0">
                <CertificatePreview
                  certificate={{
                    name: certificate.name,
                    course: certificate.course,
                    date: certificate.date,
                    certificateId: certificate.certificateId,
                  }}
                  template={selectedTemplate}
                />
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-white truncate">{certificate.name}</h3>
                  <p className="text-xs text-slate-500 truncate">{certificate.email}</p>
                </div>
                <span
                  className="px-2 py-0.5 text-[10px] font-semibold rounded-full shrink-0 ml-2"
                  style={{
                    background: "rgba(16, 185, 129, 0.1)",
                    color: "#10b981",
                    border: "1px solid rgba(16, 185, 129, 0.15)",
                  }}
                >
                  Verified
                </span>
              </div>

              <div className="space-y-1.5 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-600">Course:</span>
                  <span className="text-[11px] text-slate-400 truncate max-w-[60%] text-right">{certificate.course}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-600">Date:</span>
                  <span className="text-[11px] text-slate-400">
                    {certificate.createdAt?.toDate().toLocaleDateString() || "N/A"}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    void downloadCertificatePdf(certificate.certificateId, certificate.fileUrl).catch(() => {
                      showToast("Could not download the PDF. Try again or regenerate.", "error");
                    });
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-all duration-200 active:scale-[0.97]"
                  style={{ background: "rgba(99, 102, 241, 0.15)", border: "1px solid rgba(99, 102, 241, 0.2)" }}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteTarget(certificate);
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 active:scale-[0.97]"
                  style={{ color: "#ef4444", background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.12)" }}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {certificates.length === 0 && (
        <div className="text-center py-16 animate-fade-in-up">
          <div className="glass-card p-8 max-w-sm mx-auto">
            <div
              className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{ background: "rgba(99, 102, 241, 0.08)" }}
            >
              <svg className="w-7 h-7 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No Certificates Yet</h3>
            <p className="text-sm text-slate-500 mb-5">Start generating certificates to see them here</p>
            <button
              type="button"
              onClick={() => router.push("/upload")}
              className="gradient-btn px-5 py-2.5 rounded-xl text-sm font-semibold active:scale-[0.97]"
            >
              <span className="relative z-10">Generate Your First Certificate</span>
            </button>
          </div>
        </div>
      )}

      {/* No Search Results */}
      {certificates.length > 0 && filtered.length === 0 && searchQuery && (
        <div className="text-center py-12 animate-fade-in">
          <p className="text-sm text-slate-500">No certificates match &ldquo;{searchQuery}&rdquo;</p>
        </div>
      )}

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Certificate"
        description={`Are you sure you want to delete the certificate for "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
