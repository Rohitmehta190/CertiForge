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
          <div className="relative w-full h-full p-8 md:p-14 overflow-hidden" style={{ background: '#0f172a' }}>
            {/* Glowing Orbs Background */}
            <div className="absolute -top-[50%] -left-[20%] w-[100%] h-[150%] rounded-[100%] blur-[120px] pointer-events-none" style={{ background: 'rgba(37, 99, 235, 0.3)' }} />
            <div className="absolute -bottom-[50%] -right-[20%] w-[100%] h-[150%] rounded-[100%] blur-[120px] pointer-events-none" style={{ background: 'rgba(79, 70, 229, 0.3)' }} />
            
            {/* Elegant Inner Border */}
            <div className="absolute inset-4 md:inset-6 rounded-2xl border-2 z-0" style={{ borderColor: 'rgba(99, 102, 241, 0.3)', background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)' }}></div>
            
            <div className="relative z-10 h-full flex flex-col justify-between" style={{ fontFamily: "'Inter', sans-serif" }}>
              {/* Header */}
              <div className="text-center mt-6">
                <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-2xl shadow-lg" style={{ background: 'linear-gradient(to top right, #4f46e5, #3b82f6)', boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.3)' }}>
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text tracking-tight uppercase mb-2" style={{ backgroundImage: 'linear-gradient(to right, #ffffff, #c7d2fe, #ffffff)' }}>Certificate of Excellence</h1>
                <div className="w-24 h-1 mx-auto" style={{ background: 'linear-gradient(to right, transparent, #6366f1, transparent)' }}></div>
              </div>

              {/* Content */}
              <div className="text-center space-y-6">
                <p className="text-lg md:text-xl font-medium tracking-widest uppercase" style={{ color: 'rgba(165, 180, 252, 0.8)' }}>Proudly Presented To</p>
                <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tight">{recipientName}</h2>
                <div className="flex items-center justify-center gap-4">
                  <div className="h-px w-16" style={{ background: '#334155' }} />
                  <p className="text-base md:text-xl" style={{ color: '#94a3b8' }}>For successfully completing</p>
                  <div className="h-px w-16" style={{ background: '#334155' }} />
                </div>
                <h3 className="text-2xl md:text-4xl font-semibold text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(to right, #a5b4fc, #93c5fd)' }}>{courseName}</h3>
              </div>

              {/* Footer */}
              <div className="flex justify-between items-end mb-4 px-4 md:px-8">
                <div className="text-center w-40">
                   <div className="h-12 flex justify-center items-end mb-2">
                     <span className="sm:text-3xl text-xl text-white transform -rotate-6" style={{ fontFamily: "'Brush Script MT', cursive" }}>C. Forge</span>
                   </div>
                  <div className="w-full h-px mb-2" style={{ background: 'rgba(99, 102, 241, 0.5)' }}></div>
                  <p className="text-xs tracking-widest uppercase" style={{ color: '#94a3b8' }}>Director Signature</p>
                </div>

                <div className="text-center flex flex-col items-center">
                  <div className="bg-white p-1.5 rounded-lg mb-2 shadow-lg">
                    {qrCodeUrl ? (
                      <img src={qrCodeUrl} alt="QR Code" className="w-16 h-16 md:w-20 md:h-20" />
                    ) : (
                      <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center text-xs" style={{ background: '#f1f5f9', color: '#94a3b8' }}>QR</div>
                    )}
                  </div>
                  <p className="text-[10px] uppercase tracking-widest" style={{ color: '#64748b' }}>Certificate ID</p>
                  <p className="text-xs font-mono px-2 py-0.5 rounded mt-1" style={{ color: '#a5b4fc', background: 'rgba(30, 27, 75, 0.5)' }}>{certificateId}</p>
                </div>

                <div className="text-center w-40">
                   <div className="h-12 flex justify-center items-end mb-2">
                     <span className="text-lg text-white font-medium">{date}</span>
                   </div>
                  <div className="w-full h-px mb-2" style={{ background: 'rgba(99, 102, 241, 0.5)' }}></div>
                  <p className="text-xs tracking-widest uppercase" style={{ color: '#94a3b8' }}>Issue Date</p>
                </div>
              </div>
            </div>
          </div>
        );

      case "classic":
        return (
          <div className="relative w-full h-full p-8 md:p-14 overflow-hidden" style={{ background: '#f8f5ee' }}>
            {/* Intricate Border Layering */}
            <div className="absolute inset-4 md:inset-5 border-[6px] border-double" style={{ borderColor: '#b89947' }}></div>
            <div className="absolute inset-6 md:inset-7 border border-solid opacity-30" style={{ borderColor: '#b89947' }}></div>

            {/* Corner Details */}
            <div className="absolute top-4 left-4 w-12 h-12 border-t-[6px] border-l-[6px]" style={{ borderColor: '#b89947' }}></div>
            <div className="absolute top-4 right-4 w-12 h-12 border-t-[6px] border-r-[6px]" style={{ borderColor: '#b89947' }}></div>
            <div className="absolute bottom-4 left-4 w-12 h-12 border-b-[6px] border-l-[6px]" style={{ borderColor: '#b89947' }}></div>
            <div className="absolute bottom-4 right-4 w-12 h-12 border-b-[6px] border-r-[6px]" style={{ borderColor: '#b89947' }}></div>

            <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.03, backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>

            <div className="relative z-10 h-full flex flex-col justify-between" style={{ fontFamily: "'Playfair Display', serif" }}>
              {/* Header */}
              <div className="text-center mt-2">
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight uppercase" style={{ color: '#1a1a1a' }}>Certificate of Completion</h1>
                <h2 className="text-lg md:text-xl italic mt-2" style={{ color: '#595959' }}>This proudly certifies that</h2>
              </div>

              {/* Content */}
              <div className="text-center space-y-4">
                <p className="text-5xl md:text-7xl font-bold italic" style={{ color: '#1a1a1a' }}>{recipientName}</p>
                <div className="flex items-center justify-center gap-4">
                  <div className="w-32 h-[1px]" style={{ backgroundColor: '#b89947' }}></div>
                  <div className="w-2 h-2 rounded-full rotate-45" style={{ backgroundColor: '#b89947' }}></div>
                  <div className="w-32 h-[1px]" style={{ backgroundColor: '#b89947' }}></div>
                </div>
                <p className="text-xl md:text-2xl pt-2" style={{ color: '#595959' }}>Has successfully completed the requirements for</p>
                <h3 className="text-3xl md:text-4xl font-bold" style={{ color: '#1a1a1a' }}>{courseName}</h3>
              </div>

              {/* Footer */}
              <div className="flex justify-between items-end mb-2 px-8">
                <div className="text-center relative">
                  <div className="w-40 h-[1px] mb-2" style={{ backgroundColor: '#1a1a1a' }}></div>
                  <p className="text-sm font-sans uppercase tracking-widest" style={{ color: '#475569' }}>Authorized Signature</p>
                  {/* Fake Signature */}
                  <div className="absolute bottom-6 left-0 right-0 flex justify-center opacity-60">
                    <span className="sm:text-4xl text-2xl -rotate-6" style={{ color: '#1a1a1a', fontFamily: "'Brush Script MT', cursive" }}>CertiForge</span>
                  </div>
                </div>

                {qrCodeUrl && (
                  <div className="relative -bottom-4">
                    <div className="p-2 border-2 rounded-lg bg-white" style={{ borderColor: '#b89947' }}>
                      <img src={qrCodeUrl} alt="QR Code" className="w-20 h-20 md:w-24 md:h-24" />
                    </div>
                  </div>
                )}

                <div className="text-center relative">
                  <div className="flex items-end justify-center h-16 w-40 mb-2">
                    <p className="text-xl" style={{ color: '#1a1a1a' }}>{date}</p>
                  </div>
                  <div className="w-40 h-[1px] mb-2" style={{ backgroundColor: '#1a1a1a' }}></div>
                  <p className="text-sm font-sans uppercase tracking-widest" style={{ color: '#475569' }}>Date Issued</p>
                  <p className="absolute -bottom-6 w-full text-[10px] font-mono" style={{ color: '#94a3b8' }}>{certificateId}</p>
                </div>
              </div>
            </div>
          </div>
        );

      default: // default template (Vibrant Mesh)
        return (
          <div className="relative w-full h-full p-8 md:p-14 overflow-hidden bg-white">
            {/* Premium Mesh Background */}
            <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.8, background: 'radial-gradient(at 0% 0%, #fef08a 0px, transparent 50%), radial-gradient(at 100% 0%, #fbcfe8 0px, transparent 50%), radial-gradient(at 100% 100%, #bfdbfe 0px, transparent 50%), radial-gradient(at 0% 100%, #c7d2fe 0px, transparent 50%)' }}></div>

            {/* Glass Container */}
            <div className="relative z-10 w-full h-full rounded-3xl border flex flex-col justify-between shadow-2xl" style={{ border: '1px solid rgba(255, 255, 255, 0.6)', background: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(12px)', boxShadow: '0 25px 50px -12px rgba(99, 102, 241, 0.1)', fontFamily: "'Outfit', sans-serif" }}>
              <div className="p-8 flex flex-col h-full justify-between">
                {/* Top Details */}
                <div className="flex justify-between items-center mb-8">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: '#f87171' }}></div>
                    <div className="w-3 h-3 rounded-full" style={{ background: '#fbbf24' }}></div>
                    <div className="w-3 h-3 rounded-full" style={{ background: '#34d399' }}></div>
                  </div>
                  <div className="px-4 py-1.5 rounded-full text-white text-xs font-bold uppercase tracking-widest shadow-md" style={{ background: '#4f46e5' }}>
                    Official Completion
                  </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                   <div className="inline-flex items-center justify-center bg-white p-4 rounded-2xl shadow-lg mb-6">
                      <span className="text-5xl">🎓</span>
                   </div>
                   <h2 className="text-lg md:text-xl font-medium uppercase tracking-[0.2em] mb-2" style={{ color: '#64748b' }}>Certificate Of Award</h2>
                   <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-none mb-6" style={{ color: '#0f172a' }}>{recipientName}</h1>
                   <p className="text-lg md:text-xl max-w-lg mb-4" style={{ color: '#475569' }}>Has fully and diligently completed the comprehensive program in</p>
                   <h3 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(to right, #2563eb, #4f46e5)' }}>{courseName}</h3>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.6)' }}>
                   <div className="w-1/3">
                      <p className="font-semibold text-lg" style={{ color: '#1e293b' }}>{date}</p>
                      <p className="text-xs uppercase tracking-widest mt-1" style={{ color: '#64748b' }}>Date Achieved</p>
                   </div>
                   <div className="w-1/3 flex flex-col items-center">
                      {qrCodeUrl && (
                        <div className="p-1.5 bg-white rounded-xl shadow-md" style={{ border: '1px solid #f1f5f9' }}>
                           <img src={qrCodeUrl} alt="QR Code" className="w-16 h-16 pointer-events-none" />
                        </div>
                      )}
                   </div>
                   <div className="w-1/3 text-right">
                      <p className="font-mono text-xs inline-block px-2 py-1 rounded-md" style={{ color: '#64748b', background: 'rgba(255, 255, 255, 0.5)' }}>{certificateId}</p>
                      <p className="text-xs uppercase tracking-widest mt-2" style={{ color: '#64748b' }}>Verification ID</p>
                   </div>
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
      className="w-full max-w-full aspect-[4/3] shadow-2xl overflow-hidden rounded-md bg-white select-none transition-transform duration-500"
      id="certificate"
    >
      {renderTemplate()}
    </div>
  );
}
