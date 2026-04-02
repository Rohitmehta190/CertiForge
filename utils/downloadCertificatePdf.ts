/**
 * Download a certificate PDF reliably:
 * - HTTPS (Firebase Storage, etc.): fetch → Blob → temporary object URL so `download=` works cross-origin.
 * - data: URLs: direct anchor download.
 * - blob: URLs: fetch in-page to verify, then download (falls back to localStorage if revoked).
 * - Missing / expired: localStorage base64 from dev `saveCertificateLocal`.
 */
export async function downloadCertificatePdf(
  certificateId: string,
  fileUrl?: string | null
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
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    try {
      triggerDownload(objectUrl);
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  };

  if (fileUrl?.startsWith("http://") || fileUrl?.startsWith("https://")) {
    try {
      await tryFetchBlobDownload(fileUrl);
      return;
    } catch {
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
      if (fromLocalStorage?.startsWith("data:")) {
        triggerDownload(fromLocalStorage);
        return;
      }
      throw new Error("LINK_EXPIRED");
    }
  }

  if (fromLocalStorage?.startsWith("data:")) {
    triggerDownload(fromLocalStorage);
    return;
  }

  throw new Error("NO_FILE");
}
