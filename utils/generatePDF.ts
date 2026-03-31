import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export const generatePDF = async () => {
  const element = document.getElementById("certificate");

  const canvas = await html2canvas(element);
  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF();
  pdf.addImage(imgData, "PNG", 0, 0);
  pdf.save("certificate.pdf");
};