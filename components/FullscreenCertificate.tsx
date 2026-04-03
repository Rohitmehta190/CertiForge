"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import CertificateTemplate from "./CertificateTemplate";

interface FullscreenCertificateProps {
  certificate: {
    name: string;
    course: string;
    date?: string;
    certificateId: string;
  };
  template: string;
  showControls?: boolean;
  immersive?: boolean;
}

export default function FullscreenCertificate({
  certificate,
  template,
  showControls = true,
  immersive = false,
}: FullscreenCertificateProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const certificateContent = (
    <CertificateTemplate
      recipientName={certificate.name}
      courseName={certificate.course}
      date={certificate.date || new Date().toLocaleDateString()}
      certificateId={certificate.certificateId}
      template={template}
    />
  );

  const fullscreenContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-8"
      style={{ background: "var(--cf-bg-primary)", animation: "fadeIn 0.2s ease both" }}
    >
      <div className="w-full max-w-[min(100%,calc((100dvh-2rem)*4/3))] max-h-[calc(100dvh-2rem)]">
        <CertificateTemplate
          recipientName={certificate.name}
          courseName={certificate.course}
          date={certificate.date || new Date().toLocaleDateString()}
          certificateId={certificate.certificateId}
          template={template}
        />
      </div>

      {showControls && (
        <div className="absolute top-4 right-4 z-[10000]">
          <button
            onClick={toggleFullscreen}
            className="p-3 rounded-xl text-white transition-all duration-200 hover:scale-105 active:scale-95"
            style={{ background: "rgba(15, 23, 42, 0.8)", border: "1px solid rgba(99, 102, 241, 0.15)" }}
            title="Exit Fullscreen"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );

  if (isFullscreen && mounted) {
    return createPortal(fullscreenContent, document.body);
  }

  if (immersive) {
    return (
      <div className="relative glass-card overflow-hidden min-h-[calc(100dvh-11rem)] flex flex-col">
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 min-h-[min(calc(100dvh-12rem),900px)]">
          <div className="w-full max-w-[min(100%,calc((100dvh-11rem)*4/3))] shrink-0">
            {certificateContent}
          </div>
        </div>

        {showControls && (
          <button
            onClick={toggleFullscreen}
            className="absolute top-3 right-3 z-20 p-2.5 rounded-xl text-white transition-all duration-200 hover:scale-105 active:scale-95"
            style={{ background: "rgba(15, 23, 42, 0.8)", border: "1px solid rgba(99, 102, 241, 0.15)" }}
            title="True full screen"
            type="button"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="relative glass-card overflow-hidden">
      <div className="max-w-xl mx-auto p-3 sm:p-4">
        {certificateContent}
      </div>

      {showControls && (
        <button
          onClick={toggleFullscreen}
          className="absolute top-3 right-3 z-20 p-2 rounded-lg text-white transition-all duration-200 hover:scale-105 active:scale-95"
          style={{ background: "rgba(15, 23, 42, 0.8)", border: "1px solid rgba(99, 102, 241, 0.15)" }}
          title="View Fullscreen"
          type="button"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>
      )}
    </div>
  );
}
