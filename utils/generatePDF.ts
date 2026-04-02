import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export const generatePDF = async () => {
  const element = document.getElementById("certificate");
  if (!element) {
    throw new Error('Missing element with id "certificate"');
  }

  const canvas = await html2canvas(element);
  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF({
    orientation: canvas.width >= canvas.height ? "landscape" : "portrait",
    unit: "px",
    format: [canvas.width, canvas.height],
  });
  pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
  pdf.save("certificate.pdf");
};