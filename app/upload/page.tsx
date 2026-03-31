"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import CSVUploader from "@/components/CSVUploader";
import CSVPreview from "@/components/CSVPreview";

interface CSVData {
  name: string;
  email: string;
  course: string;
  date?: string;
}

export default function UploadPage() {
  const [csvData, setCsvData] = useState<CSVData[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("selectedTemplate");
    if (saved) {
      setSelectedTemplate(saved);
    }
  }, []);

  const handleDataParsed = (data: CSVData[]) => {
    setCsvData(data);
  };

  const handleGenerateCertificates = async () => {
    if (!selectedTemplate || csvData.length === 0) {
      alert("Please select a template and upload CSV data");
      return;
    }

    setIsGenerating(true);
    
    try {
      const { CertificateGenerator } = await import("../../utils/certificateGenerator");
      const { FirebaseService } = await import("../../utils/firebaseService");

      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const options = {
        template: selectedTemplate,
        includeQR: true,
        baseUrl
      };

      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < csvData.length; i++) {
        try {
          const { certificateId, pdfBlob } = await CertificateGenerator.generateCertificate(
            {
              ...csvData[i],
              certificateId: `TEMP-${Date.now()}-${i}`
            },
            options
          );

          await FirebaseService.saveCertificate(
            {
              ...csvData[i],
              certificateId
            },
            pdfBlob
          );

          successCount++;
        } catch (error: unknown) {
          console.error(`Error generating certificate for ${csvData[i].name}:`, error);
          errorCount++;
        }
      }

      if (successCount > 0) {
        alert(`Successfully generated ${successCount} certificate${successCount > 1 ? 's' : ''}`);
        window.location.href = "/certificates";
      } else {
        alert("Failed to generate any certificates. Please check your CSV data and try again.");
      }
    } catch (error: unknown) {
      console.error("Error in certificate generation:", error);
      alert("An error occurred during certificate generation. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Upload CSV</h1>
            <p className="text-zinc-400">
              Upload a CSV file with recipient information to generate certificates in bulk.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">1. Upload CSV File</h2>
                <CSVUploader onDataParsed={handleDataParsed} />
              </div>

              {csvData.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-white mb-4">2. Select Template</h2>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Certificate Template
                    </label>
                    <select
                      value={selectedTemplate}
                      onChange={(e) => setSelectedTemplate(e.target.value)}
                      className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                    >
                      <option value="">Select a template</option>
                      <option value="default">Default Template</option>
                      <option value="modern">Modern Template</option>
                      <option value="classic">Classic Template</option>
                    </select>
                  </div>
                </div>
              )}

              {csvData.length > 0 && selectedTemplate && (
                <div>
                  <h2 className="text-xl font-semibold text-white mb-4">3. Generate Certificates</h2>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-300">Recipients to process:</span>
                        <span className="text-white font-medium">{csvData.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-300">Selected template:</span>
                        <span className="text-white font-medium capitalize">{selectedTemplate}</span>
                      </div>
                      <button
                        onClick={handleGenerateCertificates}
                        disabled={isGenerating}
                        className="w-full px-4 py-3 bg-white text-black rounded-lg hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                      >
                        {isGenerating ? (
                          <div className="flex items-center justify-center space-x-2">
                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-black"></div>
                            <span>Generating Certificates...</span>
                          </div>
                        ) : (
                          "Generate Certificates"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">Preview</h2>
                <CSVPreview data={csvData} />
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">CSV Format Instructions</h3>
                <div className="space-y-3 text-sm text-zinc-400">
                  <p>Your CSV file should include the following columns:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li><strong>name:</strong> Full name of the recipient</li>
                    <li><strong>email:</strong> Email address (must be unique)</li>
                    <li><strong>course:</strong> Course or program name</li>
                    <li><strong>date:</strong> Completion date (optional)</li>
                  </ul>
                  <div className="mt-4 p-3 bg-zinc-800 rounded-lg">
                    <p className="font-mono text-xs">
                      name,email,course,date<br/>
                      John Doe,john@example.com,Web Development,2024-03-15<br/>
                      Jane Smith,jane@example.com,React Course,2024-03-16
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}