"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { FirebaseService, CertificateRecord } from "@/utils/firebaseService";
import FullscreenCertificate from "@/components/FullscreenCertificate";
import BackButton from "@/components/BackButton";
import { downloadCertificatePdf } from "@/utils/downloadCertificatePdf";

export default function CertificateDetailPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const [certificate, setCertificate] = useState<CertificateRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("default");

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
          // Try to find by document ID if certificateId field search failed
          console.log("🔄 Trying to fetch by document ID...");
          const certByDocId = await FirebaseService.getCertificateByDocumentId(certificateId);
          
          if (!certByDocId) {
            setError("Certificate not found");
            console.error("❌ Certificate not found:", certificateId);
          } else {
            setCertificate(certByDocId);
            console.log("✅ Certificate found by document ID:", certByDocId);
          }
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

  useEffect(() => {
    const saved = localStorage.getItem("selectedTemplate");
    if (saved) {
      setSelectedTemplate(saved);
    }
  }, []);

  const handleDownload = async () => {
    if (!certificate) return;
    try {
      await downloadCertificatePdf(
        certificate.certificateId,
        certificate.fileUrl
      );
    } catch {
      alert(
        "Could not download the PDF. Try again, or regenerate the certificate. (Saved blob links from another session cannot be downloaded.)"
      );
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
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="space-y-8">
        <div className="text-center py-12">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 max-w-md mx-auto">
            <div className="text-6xl mb-4">❌</div>
            <h3 className="text-xl font-semibold text-white mb-2">Certificate Not Found</h3>
            <p className="text-zinc-400 mb-6">
              {error || "The certificate you're looking for doesn't exist or you don't have permission to view it."}
            </p>
            <button
              type="button"
              onClick={() => router.push("/certificates")}
              className="px-6 py-3 bg-white text-black rounded-lg hover:bg-zinc-200 transition-all duration-200 ease-out font-medium active:scale-[0.98]"
            >
              Back to Certificates
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <BackButton 
                to="/certificates" 
                label="Back to Certificates"
                className="mb-2"
              />
              <h1 className="text-3xl font-bold text-white mb-2">Certificate Details</h1>
              <p className="text-zinc-400">
                View and manage your certificate
              </p>
            </div>
          </div>

          {/* Certificate — immersive preview (fills viewport, no white mat) */}
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
                    type="button"
                    onClick={handleDownload}
                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 ease-out font-medium active:scale-[0.99]"
                  >
                    Download Certificate
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleVerify}
                    className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 ease-out font-medium active:scale-[0.99]"
                  >
                    Verify Certificate
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 ease-out font-medium active:scale-[0.99]"
                  >
                    Delete Certificate
                  </button>
                </div>
              </div>
            </div>
          </div>
    </div>
  );
}
