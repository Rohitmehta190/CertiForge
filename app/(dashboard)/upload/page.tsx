"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CSVUploader from "@/components/CSVUploader";
import CSVPreview from "@/components/CSVPreview";
import { useToast } from "@/contexts/ToastContext";

interface CSVData {
  name: string;
  email: string;
  course: string;
  date?: string;
}

export default function UploadPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [csvData, setCsvData] = useState<CSVData[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem("selectedTemplate");
    if (saved) setSelectedTemplate(saved);
  }, []);

  const handleDataParsed = (data: CSVData[]) => {
    setCsvData(data);
    if (data.length > 0) {
      showToast(`${data.length} recipients loaded successfully`, "success");
    }
  };

  const currentStep = csvData.length === 0 ? 1 : !selectedTemplate ? 2 : 3;

  const handleGenerateCertificates = async () => {
    if (!selectedTemplate || csvData.length === 0) {
      showToast("Please select a template and upload CSV data", "warning");
      return;
    }

    setIsGenerating(true);
    setProgress(0);

    try {
      const { CertificateGenerator } = await import("@/utils/certificateGenerator");
      const { FirebaseService } = await import("@/utils/firebaseService");

      const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
      const options = { template: selectedTemplate, includeQR: true, baseUrl };

      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < csvData.length; i++) {
        try {
          const { certificateId, pdfBlob } = await CertificateGenerator.generateCertificate(
            { ...csvData[i], certificateId: `TEMP-${Date.now()}-${i}` },
            options
          );

          await FirebaseService.saveCertificate(
            { ...csvData[i], certificateId },
            pdfBlob
          );

          successCount++;
        } catch (error: unknown) {
          console.error(`Error generating certificate for ${csvData[i].name}:`, error);
          errorCount++;
        }
        setProgress(Math.round(((i + 1) / csvData.length) * 100));
      }

      if (successCount > 0) {
        showToast(`Successfully generated ${successCount} certificate${successCount > 1 ? "s" : ""}`, "success");
        if (errorCount > 0) {
          showToast(`${errorCount} certificate${errorCount > 1 ? "s" : ""} failed`, "warning");
        }
        router.push("/certificates");
      } else {
        showToast("Failed to generate any certificates. Please check your CSV data.", "error");
      }
    } catch (error: unknown) {
      console.error("Error in certificate generation:", error);
      showToast("An error occurred during certificate generation.", "error");
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-8">
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold text-white mb-1">Upload CSV</h1>
        <p className="text-sm text-slate-500">
          Upload a CSV file with recipient information to generate certificates in bulk.
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-2 animate-fade-in-up stagger-1">
        {[
          { n: 1, label: "Upload File" },
          { n: 2, label: "Select Template" },
          { n: 3, label: "Generate" },
        ].map((step, i) => (
          <div key={step.n} className="flex items-center gap-2">
            {i > 0 && (
              <div
                className="w-8 h-px"
                style={{
                  background: currentStep > i ? "var(--cf-accent-1)" : "rgba(255,255,255,0.06)",
                }}
              />
            )}
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-semibold transition-all duration-300"
                style={{
                  background:
                    currentStep >= step.n
                      ? "linear-gradient(135deg, var(--cf-accent-1), var(--cf-accent-2))"
                      : "rgba(255,255,255,0.04)",
                  color: currentStep >= step.n ? "white" : "var(--cf-text-muted)",
                  border: `1px solid ${currentStep >= step.n ? "transparent" : "rgba(255,255,255,0.06)"}`,
                }}
              >
                {currentStep > step.n ? (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step.n
                )}
              </div>
              <span
                className="text-xs font-medium hidden sm:inline transition-colors duration-200"
                style={{ color: currentStep >= step.n ? "var(--cf-text-primary)" : "var(--cf-text-muted)" }}
              >
                {step.label}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          {/* Step 1: Upload */}
          <div className="animate-fade-in-up stagger-2">
            <h2 className="text-base font-semibold text-white mb-3">1. Upload CSV File</h2>
            <CSVUploader onDataParsed={handleDataParsed} />
          </div>

          {/* Step 2: Template */}
          {csvData.length > 0 && (
            <div className="animate-fade-in-up">
              <h2 className="text-base font-semibold text-white mb-3">2. Select Template</h2>
              <div className="glass-card p-5">
                <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
                  Certificate Template
                </label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-shadow"
                  style={{
                    background: "rgba(15, 23, 42, 0.6)",
                    border: "1px solid rgba(99, 102, 241, 0.15)",
                  }}
                >
                  <option value="">Select a template</option>
                  <option value="default">Default Template</option>
                  <option value="modern">Modern Template</option>
                  <option value="classic">Classic Template</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 3: Generate */}
          {csvData.length > 0 && selectedTemplate && (
            <div className="animate-fade-in-up">
              <h2 className="text-base font-semibold text-white mb-3">3. Generate Certificates</h2>
              <div className="glass-card p-5">
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Recipients:</span>
                    <span className="text-sm text-white font-medium">{csvData.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Template:</span>
                    <span className="text-sm text-white font-medium capitalize">{selectedTemplate}</span>
                  </div>
                </div>

                {isGenerating && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-slate-500">Generating...</span>
                      <span className="text-xs text-indigo-400 font-medium">{progress}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(99,102,241,0.1)" }}>
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${progress}%`,
                          background: "linear-gradient(90deg, var(--cf-accent-1), var(--cf-accent-2))",
                        }}
                      />
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleGenerateCertificates}
                  disabled={isGenerating}
                  className="w-full px-4 py-3 rounded-xl text-sm font-semibold text-white gradient-btn disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isGenerating ? (
                      <>
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{
                            border: "2px solid transparent",
                            borderTopColor: "white",
                            animation: "spin-slow 0.8s linear infinite",
                          }}
                        />
                        Generating...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Generate Certificates
                      </>
                    )}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="animate-fade-in-up stagger-3">
            <h2 className="text-base font-semibold text-white mb-3">Preview</h2>
            <CSVPreview data={csvData} />
          </div>

          <div className="glass-card p-5 animate-fade-in-up stagger-4">
            <h3 className="text-sm font-semibold text-white mb-3">CSV Format Instructions</h3>
            <div className="space-y-2 text-xs text-slate-500">
              <p>Your CSV file should include the following columns:</p>
              <ul className="space-y-1 ml-3">
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-indigo-400" />
                  <span><strong className="text-slate-400">name:</strong> Full name of the recipient</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-indigo-400" />
                  <span><strong className="text-slate-400">email:</strong> Email address (must be unique)</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-indigo-400" />
                  <span><strong className="text-slate-400">course:</strong> Course or program name</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-violet-400" />
                  <span><strong className="text-slate-400">date:</strong> Completion date (optional)</span>
                </li>
              </ul>
              <div className="mt-3 p-3 rounded-lg" style={{ background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.08)" }}>
                <p className="font-mono text-[11px] text-slate-400 leading-relaxed">
                  name,email,course,date<br />
                  John Doe,john@example.com,Web Development,2024-03-15<br />
                  Jane Smith,jane@example.com,React Course,2024-03-16
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}