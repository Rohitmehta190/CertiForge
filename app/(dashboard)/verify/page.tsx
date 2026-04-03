"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function VerifyHomePage() {
  const [certificateId, setCertificateId] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const router = useRouter();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!certificateId.trim()) return;

    setIsVerifying(true);
    try {
      await router.push(`/verify/${encodeURIComponent(certificateId.trim())}`);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10 animate-fade-in-up">
        <div
          className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, var(--cf-accent-1), var(--cf-accent-2))" }}
        >
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Certificate Verification</h1>
        <p className="text-sm text-slate-500">Enter a certificate ID to verify its authenticity</p>
      </div>

      {/* Verify Form */}
      <div className="glass-card p-6 animate-fade-in-up stagger-1">
        <form onSubmit={handleVerify} className="space-y-5">
          <div>
            <label htmlFor="certificateId" className="block text-xs font-medium text-slate-500 mb-2 uppercase tracking-wider">
              Certificate ID
            </label>
            <input
              type="text"
              id="certificateId"
              value={certificateId}
              onChange={(e) => setCertificateId(e.target.value)}
              placeholder="Enter certificate ID (e.g., CERT-ABC123-XYZ789)"
              className="w-full px-4 py-3 rounded-xl text-sm font-mono text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-shadow"
              style={{ background: "rgba(15, 23, 42, 0.5)", border: "1px solid rgba(99, 102, 241, 0.12)" }}
              required
            />
            <p className="mt-1.5 text-xs text-slate-600">
              Certificate IDs are typically found at the bottom of issued certificates
            </p>
          </div>

          <button
            type="submit"
            disabled={isVerifying || !certificateId.trim()}
            className="w-full gradient-btn px-4 py-3 rounded-xl text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {isVerifying ? (
                <>
                  <div className="w-4 h-4 rounded-full" style={{ border: "2px solid transparent", borderTopColor: "white", animation: "spin-slow 0.8s linear infinite" }} />
                  Verifying...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Verify Certificate
                </>
              )}
            </span>
          </button>
        </form>

        {/* Help Section */}
        <div className="mt-6 pt-6 border-t border-white/[0.06]">
          <h3 className="text-sm font-semibold text-white mb-3">How to Find Certificate ID</h3>
          <div className="space-y-2">
            {[
              "Look for a unique ID printed at the bottom of the certificate",
              'Certificate IDs typically start with "CERT-" followed by alphanumeric characters',
              "You can also scan the QR code on the certificate (if available)",
              "Contact the certificate issuer if you cannot find the ID",
            ].map((tip, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div className="w-1 h-1 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                <p className="text-xs text-slate-500 leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 p-3 rounded-xl" style={{ background: "rgba(99, 102, 241, 0.04)", border: "1px solid rgba(99, 102, 241, 0.08)" }}>
          <p className="text-xs text-slate-500 mb-1">Example Certificate ID:</p>
          <p className="font-mono text-xs text-indigo-400">CERT-1K2J3L4-M5N6O7P8</p>
        </div>
      </div>

      {/* Public Verification Info */}
      <div className="glass-card p-5 mt-4 animate-fade-in-up stagger-2">
        <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
          <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Public Verification
        </h3>
        <p className="text-xs text-slate-500 mb-3">
          Anyone can verify certificates without logging in. Share the verification link with employers or institutions.
        </p>
        <div className="p-3 rounded-xl" style={{ background: "rgba(15, 23, 42, 0.4)", border: "1px solid rgba(99, 102, 241, 0.06)" }}>
          <p className="text-[11px] text-slate-600 mb-1">Public Verification URL:</p>
          <p className="font-mono text-[11px] text-slate-400 break-all">
            {typeof window !== "undefined"
              ? `${window.location.origin}/verify/[CERTIFICATE_ID]`
              : "/verify/[CERTIFICATE_ID]"}
          </p>
        </div>
      </div>
    </div>
  );
}
