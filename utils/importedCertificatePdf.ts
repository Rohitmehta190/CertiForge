import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export async function blobPdfFromCertificateElement(
  element: HTMLElement
): Promise<Blob> {
  if (typeof window !== "undefined") {
    (
      window as unknown as { __html2canvas_force_simplified_colors__?: boolean }
    ).__html2canvas_force_simplified_colors__ = true;
  }

  const w = element.offsetWidth;
  const h = element.offsetHeight;

  const canvas = await html2canvas(element, {
    width: w,
    height: h,
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: null,
    logging: false,
    ignoreElements: (el) => {
      const tag = el.tagName?.toLowerCase();
      return tag === "style" || tag === "link" || tag === "meta";
    },
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({
    orientation: w >= h ? "landscape" : "portrait",
    unit: "mm",
    format: "a4",
  });
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
  return pdf.output("blob");
}

export function generateCertificateId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `CERT-${timestamp}-${random}`.toUpperCase();
}
