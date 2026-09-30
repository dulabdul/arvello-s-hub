import jsPDF from "jspdf";
import { formatCurrency, InvoiceItem } from "./calculator";
import { BCA_LOGO, JAGO_LOGO } from "../../constants/banks";

interface InvoicePDFData {
  number: string;
  clientName: string;
  clientCompany?: string | null;
  clientEmail?: string | null;
  projectName: string;
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  currency: string;
  status: string;
}

export function generateInvoicePDF(data: InvoicePDFData): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Minimalist Off-White Background
  doc.setFillColor(249, 249, 246);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  let currentY = 30;

  // Header: ARVELLO CREATIVE
  doc.setFont("helvetica", "bold");
  doc.setFontSize(36);
  doc.setTextColor(17, 17, 17); // Dark Charcoal
  doc.text("ARVELLO CREATIVE", 20, currentY);

  currentY += 10;

  // Contact Info
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("+6289675293838        HELLO@ARVELLOCREATIVE.COM        ARVELLOCREATIVE.COM", 20, currentY);

  currentY += 30;

  // INVOICE Title
  doc.setFontSize(18);
  doc.text("INVOICE", 20, currentY);

  currentY += 8;

  // Left: Date & No
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`${data.date}`, 20, currentY);
  currentY += 5;
  doc.text(`No. ${data.number}`, 20, currentY);

  // Right: Billing to
  doc.text("Billing to", pageWidth - 20, currentY - 5, { align: "right" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);

  // If clientName is basically a phone number (no letters) and we have a company name, use the company name instead.
  const hasLetters = /[a-zA-Z]/.test(data.clientName);
  let primaryName = data.clientName;
  let secondaryName = data.clientCompany;

  if (!hasLetters && data.clientCompany) {
    primaryName = data.clientCompany;
    secondaryName = null; // Don't show company name twice if we used it as primary
  }

  doc.text(primaryName, pageWidth - 20, currentY, { align: "right" });
  if (secondaryName) {
    currentY += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(secondaryName, pageWidth - 20, currentY, { align: "right" });
  }
  if (data.clientEmail) {
    currentY += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(data.clientEmail, pageWidth - 20, currentY, { align: "right" });
  }

  currentY += 25;

  // Table Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("SERVICES", 20, currentY);
  doc.text("PRICE", pageWidth - 80, currentY, { align: "center" });
  doc.text("QUANTITY", pageWidth - 50, currentY, { align: "center" });
  doc.text("TOTAL", pageWidth - 20, currentY, { align: "right" });

  currentY += 5;
  doc.setDrawColor(17, 17, 17);
  doc.setLineWidth(0.5);
  doc.line(20, currentY, pageWidth - 20, currentY);

  currentY += 8;

  // Table Items
  doc.setFont("helvetica", "normal");
  data.items.forEach((item) => {
    doc.text(item.description || "-", 20, currentY);
    doc.text(formatCurrency(item.rate, data.currency), pageWidth - 80, currentY, { align: "center" });
    doc.text(String(item.quantity || 1), pageWidth - 50, currentY, { align: "center" });
    doc.text(formatCurrency(item.amount, data.currency), pageWidth - 20, currentY, { align: "right" });

    currentY += 5;
    doc.line(20, currentY, pageWidth - 20, currentY);
    currentY += 8;
  });

  const calculatedTax = data.tax;
  const finalTotal = data.subtotal - data.discount + calculatedTax;

  // Totals Section (Right aligned)
  const summaryLeft = pageWidth - 80;

  doc.setFont("helvetica", "bold");
  doc.text("SUBTOTAL", summaryLeft, currentY);
  doc.setFont("helvetica", "normal");
  doc.text(formatCurrency(data.subtotal, data.currency), pageWidth - 20, currentY, { align: "right" });

  if (data.discount > 0) {
    currentY += 7;
    doc.setFont("helvetica", "bold");
    doc.text("DISCOUNT", summaryLeft, currentY);
    doc.setFont("helvetica", "normal");
    doc.text(`-${formatCurrency(data.discount, data.currency)}`, pageWidth - 20, currentY, { align: "right" });
  }

  if (calculatedTax > 0) {
    currentY += 7;
    doc.setFont("helvetica", "bold");
    doc.text("TAXES", summaryLeft, currentY);
    doc.setFont("helvetica", "normal");
    doc.text(formatCurrency(calculatedTax, data.currency), pageWidth - 20, currentY, { align: "right" });
  }

  currentY += 5;
  doc.line(summaryLeft, currentY, pageWidth - 20, currentY);

  currentY += 7;
  doc.setFont("helvetica", "bold");
  doc.text("GRAND TOTAL", summaryLeft, currentY);
  doc.text(formatCurrency(finalTotal, data.currency), pageWidth - 20, currentY, { align: "right" });

  currentY += 5;
  doc.line(summaryLeft, currentY, pageWidth - 20, currentY);

  // Payment Information
  currentY += 30;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("PAYMENT INFORMATION", 20, currentY);

  currentY += 10;

  // BCA
  doc.addImage(BCA_LOGO, "PNG", 20, currentY - 9, 18, 13.5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("8650439890 ABDUL RAHMAN", 42, currentY);

  currentY += 12;

  // JAGO
  doc.addImage(JAGO_LOGO, "PNG", 20, currentY - 6, 18, 7.6);
  doc.text("107414610604 ABDUL RAHMAN", 42, currentY);

  currentY += 16;
  doc.setFontSize(8);
  doc.text("HARAP SELESAIKAN PEMBAYARAN KE ARVELLO CREATIVE", 20, currentY);
  currentY += 4;
  doc.text("TERIMA KASIH ATAS KERJASAMANYA!", 20, currentY);

  // Thank You Cursive (simulated with Times Italic)
  doc.setFont("times", "italic");
  doc.setFontSize(36);
  doc.text("Thank You", pageWidth - 20, currentY, { align: "right" });

  return doc;
}
