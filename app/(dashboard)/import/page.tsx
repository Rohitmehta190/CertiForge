"use client";

import BackButton from "@/components/BackButton";
import ImportedCertificateStudio from "@/components/ImportedCertificateStudio";

export default function ImportCertificatePage() {
  return (
    <div className="space-y-6">
      <BackButton to="/dashboard" label="Back to Dashboard" className="mb-2" />
      <ImportedCertificateStudio />
    </div>
  );
}
