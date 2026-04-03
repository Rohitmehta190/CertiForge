"use client";

import BackButton from "@/components/BackButton";
import ImportedCertificateStudio from "@/components/ImportedCertificateStudio";

export default function ImportCertificatePage() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <BackButton to="/dashboard" label="Back to Dashboard" className="mb-3" />
        <h1 className="text-2xl font-bold text-white mb-1">Import Design</h1>
        <p className="text-sm text-slate-500">
          Upload an image or PDF of a certificate and edit text on top of your original design.
        </p>
      </div>
      <ImportedCertificateStudio />
    </div>
  );
}
