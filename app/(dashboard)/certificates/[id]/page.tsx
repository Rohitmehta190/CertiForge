"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { FirebaseService, CertificateRecord } from "@/utils/firebaseService";
import { useToast } from "@/contexts/ToastContext";
import FullscreenCertificate from "@/components/FullscreenCertificate";
import BackButton from "@/components/BackButton";
import ConfirmModal from "@/components/ConfirmModal";
import { downloadCertificatePdf } from "@/utils/downloadCertificatePdf";

export default function CertificateDetailPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const params = useParams();
  const router = useRouter();
  const [certificate, setCertificate] = useState<CertificateRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("default");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const certificateId = params.id as string;

  useEffect(() => {
    const fetchCertificate = async () => {
      if (!user || !certificateId) return;

      try {
        setLoading(true);
        setError("");

        let cert = await FirebaseService.getCertificateById(certificateId);

        if (!cert) {
          cert = await FirebaseService.getCertificateByDocumentId(certificateId);
        }

        if (!cert) {
          setError("Certificate not found");
        } else {
          setCertificate(cert);
        }
      } catch (err: unknown) {
        const error = err as { message?: string };
        setError(`Failed to load certificate: ${error?.message || "Unknown error"}`);
      } finally {
        setLoading(false);
      }
    };

    fetchCertificate();
  }, [user, certificateId]);

  useEffect(() => {
    const saved = localStorage.getItem("selectedTemplate");
    if (saved) setSelectedTemplate(saved);
  }, []);

  const handleDownload = async () => {
    if (!certificate) return;
    try {
      await downloadCertificatePdf(certificate.certificateId, certificate.fileUrl);
      showToast("Download started", "success");
    } catch {
      showToast("Could not download PDF. Try regenerating the certificate.", "error");
    }
  };

  const handleVerify = () => {
    if (certificate) {
      window.open(`/verify/${certificate.certificateId}`, "_blank");
    }
  };

  const handleCopyLink = () => {
    if (certificate) {
      const url = `${window.location.origin}/verify/${certificate.certificateId}`;
      navigator.clipboard.writeText(url);
      showToast("Verification link copied!", "success");
    }
  };

  const handleDelete = async () => {
    if (!certificate) return;
    try {
      await FirebaseService.deleteCertificate(certificate.id);
      showToast("Certificate deleted successfully", "success");
      router.push("/certificates");
    } catch (error) {
      console.error("Error deleting certificate:", error);
      showToast("Failed to delete certificate", "error");
    } finally {
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
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

  if (error || !certificate) {
    return (
      <div className="text-center py-16 animate-fade-in-up">
        <div className="glass-card p-8 max-w-sm mx-auto">
          <div
            className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: "rgba(239, 68, 68, 0.08)" }}
          >
            <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Certificate Not Found</h3>
          <p className="text-sm text-slate-500 mb-5">
            {error || "The certificate you're looking for doesn't exist."}
          </p>
          <button
            type="button"
            onClick={() => router.push("/certificates")}
            className="gradient-btn px-5 py-2.5 rounded-xl text-sm font-semibold active:scale-[0.97]"
          >
            <span className="relative z-10">Back to Certificates</span>
          </button>
        </div>
      </div>
    );
  }

  const infoItems = [
    { label: "Certificate ID", value: certificate.certificateId, mono: true },
    { label: "Recipient Name", value: certificate.name },
    { label: "Email", value: certificate.email },
    { label: "Course", value: certificate.course },
    ...(certificate.date ? [{ label: "Completion Date", value: certificate.date }] : []),
    { label: "Issue Date", value: certificate.createdAt?.toDate().toLocaleDateString() || "N/A" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fade-in-up">
        <BackButton to="/certificates" label="Back to Certificates" className="mb-3" />
        <h1 className="text-2xl font-bold text-white mb-1">Certificate Details</h1>
        <p className="text-sm text-slate-500">View and manage your certificate</p>
      </div>

      {/* Certificate Preview */}
      <div className="animate-fade-in-up stagger-1">
        <FullscreenCertificate
          certificate={{
            name: certificate.name,
            course: certificate.course,
            date: certificate.date,
            certificateId: certificate.certificateId,
          }}
          template={selectedTemplate}
          showControls={true}
          immersive
        />
      </div>

      {/* Info & Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in-up stagger-2">
        {/* Certificate Information */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Certificate Information
          </h3>
          <div className="space-y-3">
            {infoItems.map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-xs text-slate-500">{item.label}</span>
                <span className={`text-xs text-white ${item.mono ? "font-mono" : ""} max-w-[60%] truncate text-right`}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Actions
          </h3>
          <div className="space-y-2.5">
            <button type="button" onClick={handleDownload} className="w-full gradient-btn px-4 py-2.5 rounded-xl text-sm font-medium active:scale-[0.98]">
              <span className="relative z-10 flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download PDF
              </span>
            </button>
            <button
              type="button"
              onClick={handleVerify}
              className="w-full px-4 py-2.5 rounded-xl text-sm font-medium text-white active:scale-[0.98]"
              style={{ background: "rgba(16, 185, 129, 0.12)", border: "1px solid rgba(16, 185, 129, 0.2)" }}
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Verify Certificate
              </span>
            </button>
            <button
              type="button"
              onClick={handleCopyLink}
              className="w-full px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 border border-white/[0.06] hover:bg-white/[0.03] active:scale-[0.98]"
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                Copy Verification Link
              </span>
            </button>
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="w-full px-4 py-2.5 rounded-xl text-sm font-medium active:scale-[0.98]"
              style={{ color: "#ef4444", background: "rgba(239, 68, 68, 0.06)", border: "1px solid rgba(239, 68, 68, 0.1)" }}
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Certificate
              </span>
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete Certificate"
        description={`This will permanently delete the certificate for "${certificate.name}". This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
}
