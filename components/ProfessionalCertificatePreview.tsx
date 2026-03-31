"use client";

import { useState } from "react";
import CertificateTemplate from "./CertificateTemplate";

interface ProfessionalCertificatePreviewProps {
  certificate: {
    name: string;
    course: string;
    date?: string;
    certificateId: string;
  };
  template: string;
  showZoom?: boolean;
}

export default function ProfessionalCertificatePreview({ 
  certificate, 
  template, 
  showZoom = true 
}: ProfessionalCertificatePreviewProps) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className="relative bg-zinc-900 rounded-xl overflow-hidden">
      {/* Zoom Controls */}
      {showZoom && (
        <div className="absolute top-4 right-4 z-20 flex items-center space-x-2 bg-black/50 backdrop-blur-sm rounded-lg p-2">
          <button
            onClick={handleZoomOut}
            className="p-2 text-white hover:bg-white/20 rounded transition-colors"
            title="Zoom Out"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          
          <button
            onClick={handleResetZoom}
            className="px-2 py-1 text-white hover:bg-white/20 rounded text-sm font-medium transition-colors"
            title="Reset Zoom"
          >
            {Math.round(zoomLevel * 100)}%
          </button>
          
          <button
            onClick={handleZoomIn}
            className="p-2 text-white hover:bg-white/20 rounded transition-colors"
            title="Zoom In"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          
          <button
            onClick={toggleFullscreen}
            className="p-2 text-white hover:bg-white/20 rounded transition-colors"
            title="Fullscreen"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
        </div>
      )}

      {/* Certificate Container */}
      <div 
        className={`
          relative bg-white overflow-hidden transition-transform duration-300 ease-in-out
          ${isFullscreen ? 'fixed inset-0 z-50' : 'aspect-[4/3]'}
        `}
        style={{ transform: `scale(${zoomLevel})` }}
      >
        {/* Fullscreen Close Button */}
        {isFullscreen && (
          <button
            onClick={toggleFullscreen}
            className="absolute top-4 left-4 z-30 p-3 bg-black/50 hover:bg-black/70 rounded-lg text-white transition-colors"
            title="Exit Fullscreen"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Certificate Content */}
        <div className="w-full h-full flex items-center justify-center p-4">
          <div className="w-full h-full max-w-4xl">
            <CertificateTemplate
              recipientName={certificate.name}
              courseName={certificate.course}
              date={certificate.date || new Date().toLocaleDateString()}
              certificateId={certificate.certificateId}
              template={template}
            />
          </div>
        </div>
      </div>

      {/* Certificate Info Bar */}
      <div className="bg-zinc-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div>
            <p className="text-white font-medium">{certificate.name}</p>
            <p className="text-zinc-400 text-sm">{certificate.course}</p>
          </div>
          <div className="text-zinc-500 text-sm">
            ID: {certificate.certificateId}
          </div>
        </div>
        
        {showZoom && (
          <div className="flex items-center space-x-2 text-zinc-400 text-sm">
            <span>Template:</span>
            <span className="text-white capitalize">{template}</span>
          </div>
        )}
      </div>
    </div>
  );
}
