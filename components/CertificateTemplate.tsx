"use client";

import { useRef } from "react";

interface CertificateTemplateProps {
  recipientName: string;
  courseName: string;
  date: string;
  certificateId: string;
  template: string;
  qrCodeUrl?: string;
}

export default function CertificateTemplate({
  recipientName,
  courseName,
  date,
  certificateId,
  template,
  qrCodeUrl
}: CertificateTemplateProps) {
  const certificateRef = useRef<HTMLDivElement>(null);

  const renderTemplate = () => {
    switch (template) {
      case "modern":
        return (
          <div className="relative w-full h-full bg-zinc-900 p-12">
            <div className="absolute inset-0" style={{ backgroundColor: '#27272a' }}></div>
            <div className="relative z-10 h-full flex flex-col justify-between">
              {/* Header */}
              <div className="text-center">
                <div className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#ffffff' }}>
                  <span className="text-4xl">🏆</span>
                </div>
                <h1 className="text-4xl font-bold text-white mb-2">Certificate of Achievement</h1>
                <div className="w-32 h-1 bg-white mx-auto"></div>
              </div>

              {/* Content */}
              <div className="text-center space-y-6">
                <p className="text-xl text-zinc-200">This is to certify that</p>
                <h2 className="text-5xl font-bold text-white">{recipientName}</h2>
                <p className="text-xl text-zinc-200">has successfully completed</p>
                <h3 className="text-3xl font-semibold text-white">{courseName}</h3>
                <p className="text-lg text-zinc-300">on {date}</p>
              </div>

              {/* Footer */}
              <div className="flex justify-between items-end">
                <div className="text-left">
                  <div className="w-32 h-0.5 bg-zinc-400 mb-2"></div>
                  <p className="text-sm text-zinc-400">Instructor Signature</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-zinc-400 mb-2">Certificate ID</p>
                  <p className="text-xs font-mono text-zinc-300">{certificateId}</p>
                </div>
                <div className="text-right">
                  <div className="w-32 h-0.5 bg-zinc-400 mb-2"></div>
                  <p className="text-sm text-zinc-400">Date Issued</p>
                </div>
              </div>
            </div>
          </div>
        );

      case "classic":
        return (
          <div className="relative w-full h-full bg-white border-8 border-double border-zinc-800 p-12">
            {/* Decorative corners */}
            <div className="absolute top-4 left-4 w-16 h-16 border-t-4 border-l-4 border-zinc-600"></div>
            <div className="absolute top-4 right-4 w-16 h-16 border-t-4 border-r-4 border-zinc-600"></div>
            <div className="absolute bottom-4 left-4 w-16 h-16 border-b-4 border-l-4 border-zinc-600"></div>
            <div className="absolute bottom-4 right-4 w-16 h-16 border-b-4 border-r-4 border-zinc-600"></div>

            <div className="h-full flex flex-col justify-between">
              {/* Header */}
              <div className="text-center">
                <h1 className="text-4xl font-serif font-bold text-zinc-900 mb-2">Certificate of Completion</h1>
                <div className="w-48 h-0.5 bg-zinc-600 mx-auto mb-4"></div>
                <p className="text-lg text-zinc-700 italic">Proudly presented to</p>
              </div>

              {/* Content */}
              <div className="text-center space-y-6">
                <h2 className="text-5xl font-serif font-bold text-zinc-900">{recipientName}</h2>
                <div className="w-64 h-0.5 bg-zinc-400 mx-auto"></div>
                <p className="text-xl text-zinc-800">For successfully completing</p>
                <h3 className="text-3xl font-serif text-zinc-900">{courseName}</h3>
                <p className="text-lg text-zinc-700">Completed on {date}</p>
              </div>

              {/* Footer */}
              <div className="flex justify-between items-end">
                <div className="text-center">
                  <div className="w-32 h-0.5 bg-zinc-600 mb-2"></div>
                  <p className="text-sm text-zinc-600">Authorized Signature</p>
                </div>
                <div className="text-center">
                  {qrCodeUrl && (
                    <div className="mb-2">
                      <img src={qrCodeUrl} alt="QR Code" className="w-20 h-20 mx-auto" />
                    </div>
                  )}
                  <p className="text-xs font-mono text-zinc-500">{certificateId}</p>
                </div>
                <div className="text-center">
                  <div className="w-32 h-0.5 bg-zinc-600 mb-2"></div>
                  <p className="text-sm text-zinc-600">Date of Issue</p>
                </div>
              </div>
            </div>
          </div>
        );

      default: // default template
        return (
          <div className="relative w-full h-full bg-blue-50 p-12">
            <div className="absolute inset-0" style={{ backgroundColor: '#ffffff' }}></div>
            <div className="relative z-10 h-full flex flex-col justify-between">
              {/* Header */}
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-3xl">🎓</span>
                </div>
                <h1 className="text-4xl font-bold text-zinc-900 mb-2">Certificate of Completion</h1>
                <div className="w-40 h-1 bg-blue-600 mx-auto"></div>
              </div>

              {/* Content */}
              <div className="text-center space-y-6">
                <p className="text-xl text-zinc-700">This certificate is awarded to</p>
                <h2 className="text-5xl font-bold text-zinc-900">{recipientName}</h2>
                <p className="text-xl text-zinc-700">for successfully completing</p>
                <h3 className="text-3xl font-semibold text-blue-900">{courseName}</h3>
                <p className="text-lg text-zinc-600">on {date}</p>
              </div>

              {/* Footer */}
              <div className="flex justify-between items-end">
                <div className="text-left">
                  <div className="w-32 h-0.5 bg-zinc-400 mb-2"></div>
                  <p className="text-sm text-zinc-600">Instructor</p>
                </div>
                <div className="text-center">
                  {qrCodeUrl && (
                    <div className="mb-2">
                      <img src={qrCodeUrl} alt="QR Code" className="w-16 h-16 mx-auto" />
                    </div>
                  )}
                  <p className="text-xs font-mono text-zinc-500">{certificateId}</p>
                </div>
                <div className="text-right">
                  <div className="w-32 h-0.5 bg-zinc-400 mb-2"></div>
                  <p className="text-sm text-zinc-600">Date</p>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div 
      ref={certificateRef}
      className="w-[800px] h-[600px] shadow-2xl"
      id="certificate"
    >
      {renderTemplate()}
    </div>
  );
}
