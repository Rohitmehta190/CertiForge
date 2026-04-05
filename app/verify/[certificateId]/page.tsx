"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { FirebaseService, CertificateRecord, TicketRecord, EventRecord } from "@/utils/firebaseService";
import { downloadCertificatePdf } from "@/utils/downloadCertificatePdf";

export default function VerifyPage() {
  const params = useParams();
  const certificateId = params.certificateId as string;

  const [record, setRecord] = useState<{type: 'certificate', data: CertificateRecord} | {type: 'ticket', data: TicketRecord, event: EventRecord | null} | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const verifyDocument = async () => {
      try {
        setLoading(true);
        setError("");
        
        // 1. Check if it's a certificate
        const certResult = await FirebaseService.getCertificateById(certificateId);
        if (certResult) {
          setRecord({ type: 'certificate', data: certResult });
          setIsValid(true);
          return;
        }

        // 2. Check if it's a ticket
        const ticketResult = await FirebaseService.getTicketById(certificateId);
        if (ticketResult) {
          const eventRecord = await FirebaseService.getEventById(ticketResult.eventId);
          setRecord({ type: 'ticket', data: ticketResult, event: eventRecord });
          setIsValid(true);
          return;
        }
        
        // Neither found
        setIsValid(false);
        setError("Document not found");
      } catch (err) {
        setIsValid(false);
        setError("Error verifying document");
        console.error("Verification error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (certificateId) verifyDocument();
  }, [certificateId]);

  const formatDate = (timestamp: { toDate?: () => Date }) => {
    return (
      timestamp?.toDate?.()?.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }) || "N/A"
    );
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--cf-bg-primary)" }}>
        <div className="text-center animate-fade-in">
          <div className="relative w-12 h-12 mx-auto mb-4">
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
          <p className="text-sm text-slate-500">Verifying document natively...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--cf-bg-primary)" }}>
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -left-40 w-96 h-96 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(99, 102, 241, 0.06) 0%, transparent 70%)" }}
        />
        <div
          className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(139, 92, 246, 0.05) 0%, transparent 70%)" }}
        />
      </div>

      <div className="relative container mx-auto px-4 py-12">
        <div className="max-w-xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10 animate-fade-in-up">
            <div
              className="w-10 h-10 rounded-xl mx-auto mb-4 flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, var(--cf-accent-1), var(--cf-accent-2))" }}
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">Global Verification Record</h1>
            <p className="text-sm text-slate-500">Verify the authenticity of any certiforge document</p>
          </div>

          {/* Result */}
          <div className="glass-card p-6 animate-fade-in-up stagger-1">
            {isValid === true && record ? (
              <div className="space-y-6">
                {/* Success Icon */}
                <div className="text-center">
                  <div
                    className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                    style={{ background: "rgba(16, 185, 129, 0.1)" }}
                  >
                    <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ strokeDasharray: 36, animation: "drawCheck 0.5s ease 0.3s both" }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-emerald-400 mb-1">Authentic Record Found</h2>
                  <p className="text-xs text-slate-500">This document is verified and authenticated by our system</p>
                </div>

                {/* Document Details */}
                <div className="p-4 rounded-xl space-y-3" style={{ background: "rgba(15, 23, 42, 0.4)", border: "1px solid rgba(99, 102, 241, 0.06)" }}>
                  <h3 className="text-sm font-semibold text-white mb-3">
                    {record.type === 'certificate' ? 'Certificate' : 'Event Ticket'} Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {record.type === 'certificate' ? (
                      <>
                        <div key="Recipient Name"><p className="text-[10px] text-slate-600 mb-0.5 uppercase tracking-wider">Recipient Name</p><p className="text-sm text-white ">{record.data.name}</p></div>
                        <div key="Course/Program"><p className="text-[10px] text-slate-600 mb-0.5 uppercase tracking-wider">Course/Program</p><p className="text-sm text-white ">{record.data.course}</p></div>
                        <div key="Completion Date"><p className="text-[10px] text-slate-600 mb-0.5 uppercase tracking-wider">Completion Date</p><p className="text-sm text-white ">{record.data.date || formatDate(record.data.createdAt)}</p></div>
                        <div key="Certificate ID"><p className="text-[10px] text-slate-600 mb-0.5 uppercase tracking-wider">Certificate ID</p><p className="text-sm text-white font-mono text-xs">{record.data.certificateId}</p></div>
                      </>
                    ) : (
                      <>
                        <div key="Attendee Name"><p className="text-[10px] text-slate-600 mb-0.5 uppercase tracking-wider">Attendee Name</p><p className="text-sm text-white ">{record.data.attendeeName}</p></div>
                        <div key="Event"><p className="text-[10px] text-slate-600 mb-0.5 uppercase tracking-wider">Event Name</p><p className="text-sm text-white ">{record.event?.title || "Unknown Event"}</p></div>
                        <div key="Ticket Type"><p className="text-[10px] text-slate-600 mb-0.5 uppercase tracking-wider">Ticket Type</p><p className="text-sm text-white ">{record.data.ticketType}</p></div>
                        <div key="Ticket ID"><p className="text-[10px] text-slate-600 mb-0.5 uppercase tracking-wider">Ticket ID</p><p className="text-sm text-white font-mono text-xs">{record.data.ticketId}</p></div>
                        <div key="Status"><p className="text-[10px] text-slate-600 mb-0.5 uppercase tracking-wider">Check-in Status</p><p className="text-sm text-white ">{record.data.status === 'checked-in' ? '✅ Checked In' : 'Pending'}</p></div>
                      </>
                    )}
                  </div>
                </div>

                {/* Info Box */}
                <div className="flex items-start gap-2.5 p-3 rounded-xl" style={{ background: "rgba(99, 102, 241, 0.04)", border: "1px solid rgba(99, 102, 241, 0.08)" }}>
                  <svg className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    This document was officially issued by CertiForge. Its blockchain-analog ID provides cryptographic verification of its authenticity.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  {record.type === 'certificate' && (
                    <button
                      type="button"
                      onClick={() =>
                        void downloadCertificatePdf(record.data.certificateId, record.data.fileUrl).catch(() => {})
                      }
                      className="flex-1 gradient-btn px-4 py-2.5 rounded-xl text-sm font-medium active:scale-[0.98]"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download PDF
                      </span>
                    </button>
                  )}
                  <button
                    onClick={handleCopy}
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 border border-white/[0.08] hover:bg-white/[0.03] transition-all active:scale-[0.98]"
                  >
                    {copied ? (
                      <span className="flex items-center justify-center gap-2 text-emerald-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Copied!
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                        Copy Shareable Link
                      </span>
                    )}
                  </button>
                </div>
              </div>
            ) : isValid === false ? (
              <div className="text-center space-y-5">
                {/* Invalid Icon */}
                <div
                  className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                  style={{ background: "rgba(239, 68, 68, 0.08)" }}
                >
                  <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-red-400 mb-1">Invalid Document</h2>
                  <p className="text-sm text-slate-500 mb-2">
                    {error || "The ID you provided does not exist in our systems."}
                  </p>
                  <p className="text-xs text-slate-600">
                    Supplied ID: <span className="font-mono text-slate-400">{certificateId}</span>
                  </p>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-xl text-left" style={{ background: "rgba(245, 158, 11, 0.04)", border: "1px solid rgba(245, 158, 11, 0.1)" }}>
                  <svg className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Double-check the certificate or ticket ID. It is case-sensitive.
                  </p>
                </div>

                <button
                  onClick={() => window.history.back()}
                  className="px-5 py-2 rounded-xl text-sm font-medium text-slate-400 border border-white/[0.08] hover:bg-white/[0.03] transition-all active:scale-[0.98]"
                >
                  Go Back
                </button>
              </div>
            ) : null}
          </div>

          {/* Footer */}
          <div className="text-center mt-8 animate-fade-in-up stagger-3">
            <p className="text-xs text-slate-600">
              Powered by <span className="gradient-text font-semibold">CertiForge Pro Event Suite</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
