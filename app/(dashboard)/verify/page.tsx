"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function VerifyHomePage() {
  const [certificateId, setCertificateId] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const router = useRouter();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!certificateId.trim()) {
      alert("Please enter a certificate ID");
      return;
    }

    setIsVerifying(true);
    try {
      await router.push(`/verify/${encodeURIComponent(certificateId.trim())}`);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">Certificate Verification</h1>
        <p className="text-zinc-400">
          Enter a certificate ID to verify its authenticity
        </p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
        <form onSubmit={handleVerify} className="space-y-6">
          <div>
            <label htmlFor="certificateId" className="block text-sm font-medium text-zinc-300 mb-2">
              Certificate ID
            </label>
            <input
              type="text"
              id="certificateId"
              value={certificateId}
              onChange={(e) => setCertificateId(e.target.value)}
              placeholder="Enter certificate ID (e.g., CERT-ABC123-XYZ789)"
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent font-mono transition-shadow duration-200"
              required
            />
            <p className="mt-2 text-sm text-zinc-400">
              Certificate IDs are typically found at the bottom of issued certificates
            </p>
          </div>

          <button
            type="submit"
            disabled={isVerifying || !certificateId.trim()}
            className="w-full px-4 py-3 bg-white text-black rounded-lg hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-out font-medium active:scale-[0.99]"
          >
            {isVerifying ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-black"></div>
                <span>Verifying...</span>
              </div>
            ) : (
              "Verify Certificate"
            )}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-zinc-800">
          <h3 className="text-lg font-semibold text-white mb-4">How to Find Certificate ID</h3>
          <div className="space-y-3 text-sm text-zinc-400">
            <div className="flex items-start space-x-3">
              <span className="text-green-400 mt-1">•</span>
              <p>Look for a unique ID printed at the bottom of the certificate</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-green-400 mt-1">•</span>
              <p>Certificate IDs typically start with &quot;CERT-&quot; followed by alphanumeric characters</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-green-400 mt-1">•</span>
              <p>You can also scan the QR code on the certificate (if available)</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-green-400 mt-1">•</span>
              <p>Contact the certificate issuer if you cannot find the ID</p>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-zinc-800/50 rounded-lg">
          <p className="text-sm text-zinc-300 mb-2">Example Certificate ID:</p>
          <p className="font-mono text-xs text-zinc-400">CERT-1K2J3L4-M5N6O7P8</p>
        </div>
      </div>

      <div className="mt-8 bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Public Verification</h3>
        <p className="text-zinc-400 text-sm mb-4">
          Anyone can verify certificates without logging in. Share the verification link with employers or institutions.
        </p>
        <div className="bg-zinc-800/50 rounded-lg p-4">
          <p className="text-sm text-zinc-300 mb-2">Public Verification URL:</p>
          <p className="font-mono text-xs text-zinc-400 break-all">
            {typeof window !== "undefined"
              ? `${window.location.origin}/verify/[CERTIFICATE_ID]`
              : "/verify/[CERTIFICATE_ID]"}
          </p>
        </div>
      </div>
    </div>
  );
}
