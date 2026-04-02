"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { FirebaseService, CertificateRecord } from "@/utils/firebaseService";
import { downloadCertificatePdf } from "@/utils/downloadCertificatePdf";

export default function VerifyPage() {
  const params = useParams();
  const certificateId = params.certificateId as string;
  
  const [certificate, setCertificate] = useState<CertificateRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [isValid, setIsValid] = useState<boolean | null>(null);

  useEffect(() => {
    const verifyCertificate = async () => {
      try {
        setLoading(true);
        setError("");
        
        const result = await FirebaseService.getCertificateById(certificateId);
        
        if (result) {
          setCertificate(result);
          setIsValid(true);
        } else {
          setIsValid(false);
          setError("Certificate not found");
        }
      } catch (err) {
        setIsValid(false);
        setError("Error verifying certificate");
        console.error("Verification error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (certificateId) {
      verifyCertificate();
    }
  }, [certificateId]);

  const formatDate = (timestamp: { toDate?: () => Date }) => {
    return timestamp?.toDate?.()?.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) || "N/A";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Verifying certificate...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">Certificate Verification</h1>
            <p className="text-zinc-400">
              Verify the authenticity of a certificate using its unique ID
            </p>
          </div>

          {/* Verification Result */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
            {isValid === true && certificate ? (
              <div className="space-y-6">
                {/* Success Header */}
                <div className="text-center">
                  <div className="w-20 h-20 bg-green-500/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-green-500 mb-2">Valid Certificate</h2>
                  <p className="text-zinc-400">
                    This certificate has been verified and is authentic
                  </p>
                </div>

                {/* Certificate Details */}
                <div className="bg-zinc-800 rounded-lg p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Certificate Details</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-zinc-400 mb-1">Recipient Name</p>
                      <p className="text-white font-medium">{certificate.name}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-zinc-400 mb-1">Email Address</p>
                      <p className="text-white font-medium">{certificate.email}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-zinc-400 mb-1">Course/Program</p>
                      <p className="text-white font-medium">{certificate.course}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-zinc-400 mb-1">Completion Date</p>
                      <p className="text-white font-medium">{certificate.date || formatDate(certificate.createdAt)}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-zinc-400 mb-1">Certificate ID</p>
                      <p className="text-white font-mono text-sm">{certificate.certificateId}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-zinc-400 mb-1">Issue Date</p>
                      <p className="text-white font-medium">{formatDate(certificate.createdAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Verification Info */}
                <div className="bg-zinc-800/50 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-sm text-zinc-300">
                        This certificate was issued by CertiForge and can be verified at any time using the unique certificate ID.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    type="button"
                    onClick={() =>
                      void downloadCertificatePdf(
                        certificate.certificateId,
                        certificate.fileUrl
                      ).catch(() => {
                        alert(
                          "Could not download the PDF. If the certificate was created from your browser, sign in and open it in My Certificates, then download."
                        );
                      })
                    }
                    className="flex-1 px-4 py-2 bg-white text-black rounded-lg hover:bg-zinc-200 transition-colors font-medium text-center"
                  >
                    Download certificate PDF
                  </button>
                  <button
                    onClick={() => window.navigator.clipboard.writeText(window.location.href)}
                    className="flex-1 px-4 py-2 border border-zinc-700 text-white rounded-lg hover:bg-zinc-800 transition-colors font-medium"
                  >
                    Copy Verification Link
                  </button>
                </div>
              </div>
            ) : isValid === false ? (
              <div className="text-center space-y-6">
                {/* Invalid Certificate */}
                <div className="w-20 h-20 bg-red-500/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                
                <div>
                  <h2 className="text-2xl font-bold text-red-500 mb-2">Invalid Certificate</h2>
                  <p className="text-zinc-400 mb-4">
                    {error || "The certificate ID you entered is not valid or does not exist in our system."}
                  </p>
                  <p className="text-sm text-zinc-500">
                    Certificate ID: <span className="font-mono">{certificateId}</span>
                  </p>
                </div>

                <div className="bg-zinc-800/50 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-yellow-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <div>
                      <p className="text-sm text-zinc-300">
                        Please double-check the certificate ID and try again. Certificate IDs are case-sensitive and should be entered exactly as shown on the certificate.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => window.history.back()}
                  className="px-4 py-2 border border-zinc-700 text-white rounded-lg hover:bg-zinc-800 transition-colors font-medium"
                >
                  Go Back
                </button>
              </div>
            ) : null}
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-zinc-500 text-sm">
              Powered by CertiForge - Professional Certificate Generation Platform
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
