"use client";

import { useState } from "react";
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
}

export default function FullscreenCertificate({ 
  certificate, 
  template, 
  showControls = true 
}: FullscreenCertificateProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const certificateContent = (
    <div className="w-full h-full bg-white flex items-center justify-center">
      <div className="w-full h-full max-w-none">
        <CertificateTemplate
          recipientName={certificate.name}
          courseName={certificate.course}
          date={certificate.date || new Date().toLocaleDateString()}
          certificateId={certificate.certificateId}
          template={template}
        />
      </div>
    </div>
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        {/* Fullscreen Certificate */}
        <div className="w-full h-full">
          {certificateContent}
        </div>

        {/* Fullscreen Controls */}
        {showControls && (
          <div className="absolute top-4 right-4 z-60">
            <button
              onClick={toggleFullscreen}
              className="p-3 bg-black/50 hover:bg-black/70 rounded-lg text-white transition-colors"
              title="Exit Fullscreen"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative bg-zinc-900 rounded-xl overflow-hidden">
      {/* Certificate Container */}
      <div className="aspect-[4/3] bg-white">
        {certificateContent}
      </div>

      {/* Fullscreen Button */}
      {showControls && (
        <button
          onClick={toggleFullscreen}
          className="absolute top-4 right-4 z-20 p-2 bg-black/50 hover:bg-black/70 rounded-lg text-white transition-colors"
          title="View Fullscreen"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>
      )}
    </div>
  );
}
