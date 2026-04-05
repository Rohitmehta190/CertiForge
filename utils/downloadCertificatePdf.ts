import html2canvas from "html2canvas";
import jsPDF from "jspdf";

/**
 * Download a certificate PDF reliably:
 * 1. Tries to fetch the fileUrl (Firebase, Blob, etc.).
 * 2. If it fails, falls back to generating the PDF dynamically from the DOM element.
 * 3. Falls back to localStorage data URLs if all else fails.
 */
export async function downloadCertificatePdf(
  certificateId: string,
  fileUrl?: string | null,
  elementId: string = "certificate"
): Promise<void> {
  const filename = `${certificateId}.pdf`;

  const fromLocalStorage =
    typeof window !== "undefined"
      ? localStorage.getItem(`certificate_${certificateId}`)
      : null;

  const triggerDownload = (href: string) => {
    const a = document.createElement("a");
    a.href = href;
    a.download = filename;
    a.rel = "noopener";
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const tryOpenUrl = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const tryFetchBlobDownload = async (url: string) => {
    const res = await fetch(url, { mode: "cors", credentials: "omit" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    try {
      triggerDownload(objectUrl);
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  };

  const generateFromDom = async (): Promise<boolean> => {
    const element = document.getElementById(elementId);
    if (!element) return false;
    
    try {
      // Add a slight delay for fonts/images to render
      await new Promise(resolve => setTimeout(resolve, 500));
      const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: "#18181b" });
      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(filename);
      return true;
    } catch (err) {
      console.error("DOM to PDF generation failed:", err);
      return false;
    }
  };

  if (fileUrl?.startsWith("http://") || fileUrl?.startsWith("https://")) {
    try {
      await tryFetchBlobDownload(fileUrl);
      return;
    } catch {
      const generated = await generateFromDom();
      if (generated) return;
      if (fromLocalStorage?.startsWith("data:")) {
        triggerDownload(fromLocalStorage);
        return;
      }
      tryOpenUrl(fileUrl);
      return;
    }
  }

  if (fileUrl?.startsWith("data:")) {
    triggerDownload(fileUrl);
    return;
  }

  if (fileUrl?.startsWith("blob:")) {
    try {
      await tryFetchBlobDownload(fileUrl);
      return;
    } catch {
      const generated = await generateFromDom();
      if (generated) return;
      if (fromLocalStorage?.startsWith("data:")) {
        triggerDownload(fromLocalStorage);
        return;
      }
      throw new Error("LINK_EXPIRED");
    }
  }

  const generated = await generateFromDom();
  if (generated) return;

  if (fromLocalStorage?.startsWith("data:")) {
    triggerDownload(fromLocalStorage);
    return;
  }

  throw new Error("NO_FILE");
}
