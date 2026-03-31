"use client";

import FullscreenCertificate from "./FullscreenCertificate";

interface CertificatePreviewProps {
  certificate: {
    name: string;
    course: string;
    date?: string;
    certificateId: string;
  };
  template: string;
}

export default function CertificatePreview({ certificate, template }: CertificatePreviewProps) {
  return (
    <FullscreenCertificate
      certificate={certificate}
      template={template}
      showControls={false}
    />
  );
}
