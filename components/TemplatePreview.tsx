"use client";

import { useState } from "react";
import CertificateTemplate from "./CertificateTemplate";

interface TemplatePreviewProps {
  onSelectTemplate: (template: string) => void;
  selectedTemplate: string;
}

export default function TemplatePreview({ onSelectTemplate, selectedTemplate }: TemplatePreviewProps) {
  const [fullscreenTemplate, setFullscreenTemplate] = useState<string | null>(null);

  const templates = [
    {
      id: "default",
      name: "Classic Blue",
      description: "Traditional blue certificate with elegant design",
      preview: {
        recipientName: "John Doe",
        courseName: "Web Development",
        date: "March 15, 2024",
        certificateId: "CERT-DEMO-001"
      }
    },
    {
      id: "modern",
      name: "Modern Dark",
      description: "Contemporary dark theme with minimalist design",
      preview: {
        recipientName: "Jane Smith",
        courseName: "React Course",
        date: "March 16, 2024",
        certificateId: "CERT-DEMO-002"
      }
    },
    {
      id: "classic",
      name: "Elegant Gold",
      description: "Premium gold certificate with traditional styling",
      preview: {
        recipientName: "Robert Johnson",
        courseName: "Data Science",
        date: "March 17, 2024",
        certificateId: "CERT-DEMO-003"
      }
    }
  ];

  const openFullscreen = (templateId: string) => {
    setFullscreenTemplate(templateId);
  };

  const closeFullscreen = () => {
    setFullscreenTemplate(null);
  };

  const selectedTemplateData = templates.find(t => t.id === selectedTemplate);
  const fullscreenTemplateData = templates.find(t => t.id === fullscreenTemplate);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Choose Your Certificate Template</h2>
        <p className="text-zinc-400 text-lg">Select a template style for your certificates</p>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {templates.map((template) => (
          <div
            key={template.id}
            className={`group relative cursor-pointer transition-all duration-500 ${
              selectedTemplate === template.id
                ? "ring-4 ring-white scale-105 shadow-2xl"
                : "hover:scale-105 hover:shadow-xl"
            }`}
            onClick={() => onSelectTemplate(template.id)}
          >
            {/* Template Card */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden transition-all duration-300 group-hover:border-zinc-700">
              {/* Preview Container */}
              <div className="relative aspect-[4/3] bg-gradient-to-br from-zinc-100 to-zinc-200 p-4">
                {/* Fullscreen Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openFullscreen(template.id);
                  }}
                  className="absolute top-2 right-2 z-20 p-2 bg-black/50 hover:bg-black/70 rounded-lg text-white transition-colors"
                  title="View Fullscreen"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                </button>

                {/* Certificate Preview */}
                <div className="w-full h-full transform scale-40 origin-top-left">
                  <CertificateTemplate
                    recipientName={template.preview.recipientName}
                    courseName={template.preview.courseName}
                    date={template.preview.date}
                    certificateId={template.preview.certificateId}
                    template={template.id}
                  />
                </div>

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>

              {/* Template Info */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold text-white">{template.name}</h3>
                  {selectedTemplate === template.id && (
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
                <p className="text-zinc-400 mb-4 leading-relaxed">{template.description}</p>
                
                <div className="flex space-x-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectTemplate(template.id);
                    }}
                    className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                      selectedTemplate === template.id
                        ? "bg-white text-black shadow-lg"
                        : "bg-zinc-800 text-white hover:bg-zinc-700"
                    }`}
                  >
                    {selectedTemplate === template.id ? "Selected" : "Select Template"}
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openFullscreen(template.id);
                    }}
                    className="px-4 py-3 bg-zinc-800 text-white rounded-xl hover:bg-zinc-700 transition-all duration-300"
                    title="View Fullscreen"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Template Info */}
      {selectedTemplate && selectedTemplateData && (
        <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 border border-zinc-700 rounded-2xl p-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Template Selected</h3>
              <p className="text-zinc-300 text-lg">
                You have selected the <span className="text-white font-bold">
                  {selectedTemplateData.name}
                </span> template. This template will be used for all generated certificates.
              </p>
            </div>
            <div className="text-right">
              <a
                href="/upload"
                className="inline-block px-6 py-3 bg-white text-black rounded-xl hover:bg-zinc-200 transition-all duration-300 font-semibold shadow-lg"
              >
                Generate Certificates →
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Modal */}
      {fullscreenTemplate && fullscreenTemplateData && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center"
          onClick={closeFullscreen}
        >
          <div 
            className="relative w-full h-full flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closeFullscreen}
              className="absolute top-4 right-4 z-60 p-3 bg-black/50 hover:bg-black/70 rounded-lg text-white transition-colors"
              title="Close Fullscreen"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Fullscreen Certificate Container */}
            <div className="relative w-full h-full max-w-[90vw] max-h-[90vh] flex items-center justify-center">
              <div className="relative w-full h-full bg-white rounded-lg shadow-2xl overflow-hidden">
                {/* Certificate with proper aspect ratio but filling container */}
                <div className="w-full h-full flex items-center justify-center p-8">
                  <div className="relative w-full h-full max-w-none">
                    <CertificateTemplate
                      recipientName={fullscreenTemplateData.preview.recipientName}
                      courseName={fullscreenTemplateData.preview.courseName}
                      date={fullscreenTemplateData.preview.date}
                      certificateId={fullscreenTemplateData.preview.certificateId}
                      template={fullscreenTemplateData.id}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Fullscreen Controls */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-60">
              <div className="bg-black/80 backdrop-blur-sm rounded-2xl p-4 flex items-center space-x-4">
                <div className="text-white">
                  <h3 className="text-lg font-bold">{fullscreenTemplateData.name}</h3>
                  <p className="text-sm text-zinc-300">{fullscreenTemplateData.description}</p>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      onSelectTemplate(fullscreenTemplateData.id);
                      closeFullscreen();
                    }}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                      selectedTemplate === fullscreenTemplateData.id
                        ? "bg-white text-black"
                        : "bg-zinc-700 text-white hover:bg-zinc-600"
                    }`}
                  >
                    {selectedTemplate === fullscreenTemplateData.id ? "Selected" : "Select"}
                  </button>
                  
                  <button
                    onClick={closeFullscreen}
                    className="px-4 py-2 bg-zinc-700 text-white rounded-lg hover:bg-zinc-600 transition-all duration-300"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
