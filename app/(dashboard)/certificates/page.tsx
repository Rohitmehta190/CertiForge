"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FirebaseService, CertificateRecord } from "@/utils/firebaseService";
import { useAuth } from "@/contexts/AuthContext";
import CertificatePreview from "@/components/CertificatePreview";
import BackButton from "@/components/BackButton";
import { downloadCertificatePdf } from "@/utils/downloadCertificatePdf";

export default function CertificatesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<CertificateRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("default");

  const fetchCertificates = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const data = await FirebaseService.getCertificates(user.uid);
      setCertificates(data);
    } catch (error) {
      console.error("Error fetching certificates:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  useEffect(() => {
    const saved = localStorage.getItem("selectedTemplate");
    if (saved) {
      setSelectedTemplate(saved);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <BackButton 
                to="/dashboard" 
                label="Back to Dashboard"
                className="mb-2"
              />
              <h1 className="text-3xl font-bold text-white mb-2">My Certificates</h1>
              <p className="text-zinc-400">
                View and manage all your generated certificates
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push("/upload")}
              className="px-4 py-2 bg-white text-black rounded-lg hover:bg-zinc-200 transition-all duration-200 ease-out font-medium active:scale-[0.98]"
            >
              Generate New
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((certificate) => (
              <div
                key={certificate.certificateId}
                role="link"
                tabIndex={0}
                className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-all duration-200 ease-out cursor-pointer"
                onClick={() => router.push(`/certificates/${certificate.id}`)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    router.push(`/certificates/${certificate.id}`);
                  }
                }}
              >
                <div className="aspect-[4/3] bg-zinc-800 relative overflow-hidden">
                  <div className="absolute inset-0">
                    <CertificatePreview
                      certificate={{
                        name: certificate.name,
                        course: certificate.course,
                        date: certificate.date,
                        certificateId: certificate.certificateId
                      }}
                      template={selectedTemplate}
                    />
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">{certificate.name}</h3>
                      <p className="text-sm text-zinc-400">{certificate.email}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-zinc-500">
                        {certificate.createdAt?.toDate().toLocaleDateString() || "N/A"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-400">Certificate ID:</span>
                      <span className="text-xs font-mono text-zinc-300">{certificate.certificateId}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-400">Course:</span>
                      <span className="text-sm text-zinc-300">{certificate.course}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-400">Status:</span>
                      <span className="text-sm text-green-400">Verified</span>
                    </div>
                  </div>

                  <div className="flex space-x-2 mt-4">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        void downloadCertificatePdf(
                          certificate.certificateId,
                          certificate.fileUrl
                        ).catch(() => {
                          alert(
                            "Could not download the PDF. Try again or regenerate the certificate."
                          );
                        });
                      }}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 ease-out text-sm active:scale-[0.98]"
                    >
                      Download
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(`/verify/${certificate.certificateId}`, "_blank");
                      }}
                      className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 ease-out text-sm active:scale-[0.98]"
                    >
                      Verify
                    </button>
                    <button
                      type="button"
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (confirm("Are you sure you want to delete this certificate?")) {
                          try {
                            await FirebaseService.deleteCertificate(certificate.certificateId);
                            setCertificates(certificates.filter(cert => cert.certificateId !== certificate.certificateId));
                            alert("Certificate deleted successfully!");
                          } catch (error) {
                            console.error("Error deleting certificate:", error);
                            alert("Failed to delete certificate");
                          }
                        }
                      }}
                      className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 ease-out text-sm active:scale-[0.98]"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {certificates.length === 0 && (
            <div className="text-center py-12">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 max-w-md mx-auto">
                <div className="text-6xl mb-4">📜</div>
                <h3 className="text-xl font-semibold text-white mb-2">No Certificates Yet</h3>
                <p className="text-zinc-400 mb-6">
                  Start generating certificates to see them here
                </p>
                <button
                  type="button"
                  onClick={() => router.push("/upload")}
                  className="px-6 py-3 bg-white text-black rounded-lg hover:bg-zinc-200 transition-all duration-200 ease-out font-medium active:scale-[0.98]"
                >
                  Generate Your First Certificate
                </button>
              </div>
            </div>
          )}
    </div>
  );
}
