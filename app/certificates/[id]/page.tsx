"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { FirebaseService, CertificateRecord } from "@/utils/firebaseService";

export default function CertificateDetailPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const [certificate, setCertificate] = useState<CertificateRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const certificateId = params.id as string;

  useEffect(() => {
    const fetchCertificate = async () => {
      if (!user || !certificateId) return;
      
      try {
        setLoading(true);
        setError("");
        
        console.log("🔍 Fetching certificate:", certificateId);
        const cert = await FirebaseService.getCertificateById(certificateId);
        
        if (!cert) {
          setError("Certificate not found");
          console.error("❌ Certificate not found:", certificateId);
        } else {
          setCertificate(cert);
          console.log("✅ Certificate found:", cert);
        }
      } catch (error: unknown) {
        const err = error as { name?: string; message?: string; stack?: string };
        console.error("💥 Error fetching certificate:", error);
        setError(`Failed to load certificate: ${err?.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchCertificate();
  }, [user, certificateId]);

  const handleDownload = async () => {
    if (!certificate) return;

    if (certificate.fileUrl) {
      // Handle both Firebase URLs and local blob URLs
      if (certificate.fileUrl.startsWith('blob:')) {
        // For local blob URLs, create a download link
        const link = document.createElement('a');
        link.href = certificate.fileUrl;
        link.download = `${certificate.certificateId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else if (certificate.fileUrl.startsWith('http')) {
        // For Firebase URLs, open in new tab
        window.open(certificate.fileUrl, '_blank');
      } else {
        // Try to get from localStorage for development
        const storedPdf = localStorage.getItem(`certificate_${certificate.certificateId}`);
        if (storedPdf) {
          const link = document.createElement('a');
          link.href = storedPdf;
          link.download = `${certificate.certificateId}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          alert('Certificate file not available. Please regenerate the certificate.');
        }
      }
    } else {
      alert('Certificate file not available. Please regenerate the certificate.');
    }
  };

  const handleVerify = () => {
    if (certificate) {
      window.open(`/verify/${certificate.certificateId}`, '_blank');
    }
  };

  const handleDelete = async () => {
    if (!certificate) return;
    
    if (confirm("Are you sure you want to delete this certificate?")) {
      try {
        await FirebaseService.deleteCertificate(certificate.id);
        alert("Certificate deleted successfully!");
        router.push("/certificates");
      } catch (error) {
        console.error("Error deleting certificate:", error);
        alert("Failed to delete certificate");
      }
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (error || !certificate) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="space-y-8">
            <div className="text-center py-12">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 max-w-md mx-auto">
                <div className="text-6xl mb-4">❌</div>
                <h3 className="text-xl font-semibold text-white mb-2">Certificate Not Found</h3>
                <p className="text-zinc-400 mb-6">
                  {error || "The certificate you're looking for doesn't exist or you don't have permission to view it."}
                </p>
                <button
                  onClick={() => router.push("/certificates")}
                  className="px-6 py-3 bg-white text-black rounded-lg hover:bg-zinc-200 transition-colors font-medium"
                >
                  Back to Certificates
                </button>
              </div>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => router.push("/certificates")}
                className="text-zinc-400 hover:text-white mb-2 transition-colors"
              >
                ← Back to Certificates
              </button>
              <h1 className="text-3xl font-bold text-white mb-2">Certificate Details</h1>
              <p className="text-zinc-400">
                View and manage your certificate
              </p>
            </div>
          </div>

          {/* Certificate Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="aspect-[4/3] bg-zinc-800 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">🎓</div>
                  <h2 className="text-2xl font-bold text-white">{certificate.name}</h2>
                  <p className="text-lg text-zinc-400">{certificate.course}</p>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Certificate Information */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Certificate Information</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Certificate ID:</span>
                      <span className="text-white font-mono">{certificate.certificateId}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Recipient Name:</span>
                      <span className="text-white">{certificate.name}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Email:</span>
                      <span className="text-white">{certificate.email}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Course:</span>
                      <span className="text-white">{certificate.course}</span>
                    </div>
                    
                    {certificate.date && (
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-400">Completion Date:</span>
                        <span className="text-white">{certificate.date}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Issue Date:</span>
                      <span className="text-white">{certificate.createdAt?.toDate().toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Actions</h3>
                  
                  <div className="space-y-4">
                    <button
                      onClick={handleDownload}
                      className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Download Certificate
                    </button>
                    
                    <button
                      onClick={handleVerify}
                      className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      Verify Certificate
                    </button>
                    
                    <button
                      onClick={handleDelete}
                      className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                    >
                      Delete Certificate
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
