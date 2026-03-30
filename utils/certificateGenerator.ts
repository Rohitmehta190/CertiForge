import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import QRCode from "qrcode";

interface CertificateData {
  name: string;
  email: string;
  course: string;
  date?: string;
  certificateId: string;
}

interface CertificateOptions {
  template: string;
  includeQR: boolean;
  baseUrl: string;
}

interface CertificateResult {
  certificateId: string;
  pdfBlob: Blob;
}

export class CertificateGenerator {
  private static generateCertificateId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `CERT-${timestamp}-${random}`.toUpperCase();
  }

  private static async generateQRCode(text: string): Promise<string> {
    try {
      return await QRCode.toDataURL(text, {
        width: 80,
        margin: 1,
        color: {
          dark: "#000000",
          light: "#ffffff"
        }
      });
    } catch (error) {
      console.error("Error generating QR code:", error);
      return "";
    }
  }

  private static getCertificateHTML(data: CertificateData, template: string, qrCodeUrl: string): string {
    switch (template) {
      case "modern":
        return `
          <div class="relative w-full h-full bg-zinc-900 p-12" style="background-color: #27272a;">
            <div class="relative z-10 h-full flex flex-col justify-between">
              <div class="text-center">
                <div class="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center" style="background-color: #27272a;">
                  <span style="font-size: 4rem;">🏆</span>
                </div>
                <h1 class="text-4xl font-bold text-white mb-2">Certificate of Achievement</h1>
                <div class="w-32 h-1 bg-white mx-auto"></div>
              </div>
              <div class="text-center space-y-6">
                <p class="text-xl text-zinc-200">This is to certify that</p>
                <h2 class="text-5xl font-bold text-white">${data.name}</h2>
                <p class="text-xl text-zinc-200">has successfully completed</p>
                <h3 class="text-3xl font-semibold text-white">${data.course}</h3>
                <p class="text-lg text-zinc-300">on ${data.date}</p>
              </div>
              <div class="flex justify-between items-end">
                <div class="text-left">
                  <div class="w-32 h-0.5 bg-zinc-400 mb-2"></div>
                  <p class="text-sm text-zinc-400">Instructor Signature</p>
                </div>
                <div class="text-center">
                  <p class="text-sm text-zinc-400 mb-2">Certificate ID</p>
                  <p class="text-xs font-mono text-zinc-300">${data.certificateId}</p>
                </div>
                <div class="text-right">
                  <div class="w-32 h-0.5 bg-zinc-400 mb-2"></div>
                  <p class="text-sm text-zinc-400">Date Issued</p>
                </div>
              </div>
            </div>
          </div>
        `;

      case "classic":
        return `
          <div class="relative w-full h-full bg-amber-50 p-12" style="background-color: #fffbeb;">
            <div class="relative z-10 h-full flex flex-col justify-between">
              <div class="text-center">
                <div class="w-20 h-20 bg-amber-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span style="font-size: 3rem;">🎓</span>
                </div>
                <h1 class="text-4xl font-serif font-bold text-amber-900 mb-2">Certificate of Completion</h1>
                <div class="w-48 h-0.5 bg-amber-600 mx-auto mb-4"></div>
                <p class="text-lg text-amber-700 italic">Proudly presented to</p>
              </div>
              <div class="text-center space-y-6">
                <h2 class="text-5xl font-serif font-bold text-amber-900">${data.name}</h2>
                <div class="w-64 h-0.5 bg-amber-400 mx-auto"></div>
                <p class="text-xl text-amber-800">For successfully completing</p>
                <h3 class="text-3xl font-serif text-amber-900">${data.course}</h3>
                <p class="text-lg text-amber-700">Completed on ${data.date}</p>
              </div>
              <div class="flex justify-between items-end">
                <div class="text-center">
                  <div class="w-32 h-0.5 bg-amber-600 mb-2"></div>
                  <p class="text-sm text-amber-600">Authorized Signature</p>
                </div>
                <div class="text-center">
                  ${qrCodeUrl ? `<img src="${qrCodeUrl}" alt="QR Code" style="width: 80px; height: 80px; margin-bottom: 8px;" />` : ''}
                  <p class="text-xs font-mono text-amber-700">${data.certificateId}</p>
                </div>
                <div class="text-center">
                  <div class="w-32 h-0.5 bg-amber-600 mb-2"></div>
                  <p class="text-sm text-amber-600">Date of Issue</p>
                </div>
              </div>
            </div>
          </div>
        `;

      default: // default template
        return `
          <div class="relative w-full h-full bg-blue-50 p-12" style="background-color: #eff6ff;">
            <div class="relative z-10 h-full flex flex-col justify-between">
              <div class="text-center">
                <div class="w-20 h-20 bg-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span style="font-size: 3rem;">🎓</span>
                </div>
                <h1 class="text-4xl font-bold text-zinc-900 mb-2">Certificate of Completion</h1>
                <div class="w-40 h-1 bg-blue-600 mx-auto"></div>
              </div>
              <div class="text-center space-y-6">
                <p class="text-xl text-zinc-700">This certificate is awarded to</p>
                <h2 class="text-5xl font-bold text-zinc-900">${data.name}</h2>
                <p class="text-xl text-zinc-700">for successfully completing</p>
                <h3 class="text-3xl font-semibold text-blue-900">${data.course}</h3>
                <p class="text-lg text-zinc-600">on ${data.date}</p>
              </div>
              <div class="flex justify-between items-end">
                <div class="text-left">
                  <div class="w-32 h-0.5 bg-zinc-400 mb-2"></div>
                  <p class="text-sm text-zinc-600">Instructor</p>
                </div>
                <div class="text-center">
                  ${qrCodeUrl ? `<img src="${qrCodeUrl}" alt="QR Code" style="width: 80px; height: 80px; margin-bottom: 8px;" />` : ''}
                  <p class="text-xs font-mono text-zinc-500">${data.certificateId}</p>
                </div>
                <div class="text-right">
                  <div class="w-32 h-0.5 bg-zinc-400 mb-2"></div>
                  <p class="text-sm text-zinc-600">Date</p>
                </div>
              </div>
            </div>
          </div>
        `;
    }
  }

  private static async generateCertificatePDF(
    element: HTMLElement,
    data: CertificateData,
    options: CertificateOptions
  ): Promise<Blob> {
    try {
      // Inject CSS fix to prevent lab() color function errors
      if (typeof document !== 'undefined') {
        const style = document.createElement('style');
        style.textContent = `
          * { color-interpolation-filters: sRGB !important; }
          .bg-gradient-to-br, .bg-gradient-to-r, .bg-gradient-to-l, .bg-gradient-to-t,
          .bg-gradient-to-bl, .bg-gradient-to-tl, .bg-gradient-to-tr, .bg-gradient-to-b,
          .bg-gradient-to-br, .bg-gradient-to-l {
            background-image: none !important;
            background: #ffffff !important;
          }
          [class*="color-mix"], [class*="lab"], [class*="oklch"], [class*="lch"] {
            color: #000000 !important;
            background: #ffffff !important;
          }
        `;
        document.head.appendChild(style);
        
        // Clean up after generation
        setTimeout(() => {
          if (style.parentNode) {
            style.parentNode.removeChild(style);
          }
        }, 5000);
      }

      // Override html2canvas to prevent lab() color function errors
      if (typeof window !== 'undefined') {
        (window as any).__html2canvas_force_simplified_colors__ = true;
      }

      const canvas = await html2canvas(element, {
        width: 800,
        height: 600,
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false,
        // Filter out problematic elements
        ignoreElements: (element) => {
          const tagName = element.tagName?.toLowerCase();
          return tagName === 'style' || 
                 tagName === 'link' || 
                 tagName === 'meta';
        }
      });

      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      
      return pdf.output('blob');
    } catch (error) {
      console.error("Error generating PDF:", error);
      throw error;
    }
  }

  static async generateCertificate(
    data: CertificateData,
    options: CertificateOptions
  ): Promise<CertificateResult> {
    const certificateId = this.generateCertificateId();
    const qrCodeUrl = options.includeQR ? await this.generateQRCode(`${options.baseUrl}/verify/${certificateId}`) : "";
    
    const certificateElement = document.createElement('div');
    certificateElement.style.width = '800px';
    certificateElement.style.height = '600px';
    certificateElement.style.position = 'absolute';
    certificateElement.style.left = '-9999px';
    certificateElement.style.top = '-9999px';
    
    const certificateHTML = this.getCertificateHTML(data, options.template, qrCodeUrl);
    certificateElement.innerHTML = certificateHTML;
    
    document.body.appendChild(certificateElement);

    try {
      const pdfBlob = await this.generateCertificatePDF(certificateElement, data, options);
      return { certificateId, pdfBlob };
    } finally {
      document.body.removeChild(certificateElement);
    }
  }

  static async generateBulkCertificates(
    dataList: CertificateData[],
    options: CertificateOptions,
    onProgress?: (current: number, total: number) => void
  ): Promise<CertificateResult[]> {
    const results: CertificateResult[] = [];
    
    for (let i = 0; i < dataList.length; i++) {
      try {
        const result = await this.generateCertificate(dataList[i], options);
        results.push(result);
        
        if (onProgress) {
          onProgress(i + 1, dataList.length);
        }
        
        // Small delay to prevent overwhelming
        if (i < dataList.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      } catch (error) {
        console.error(`Error generating certificate for ${dataList[i].name}:`, error);
        // Continue with next certificate
      }
    }
    
    return results;
  }
}
