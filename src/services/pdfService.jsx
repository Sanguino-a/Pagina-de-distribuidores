/**
 * PDF Service for generating quotes
 * Uses jsPDF and autoTable for structured quotes
 */

import jsPDF from 'jspdf';
import 'jspdf-autotable';

// PDF configuration
const PDF_CONFIG = {
  format: 'a4',
  orientation: 'portrait',
  unit: 'mm',
  margins: {
    top: 20,
    right: 20,
    bottom: 20,
    left: 20
  },
  colors: {
    primary: '#0ea5a6',
    secondary: '#6b7280',
    text: '#374151',
    border: '#d1d5db'
  }
};

/**
 * Generate PDF for a single quote
 */
export async function generateQuotePDF(quoteData, options = {}) {
  const {
    filename = `cotizacion_${quoteData.folio}_${new Date().toISOString().split('T')[0]}.pdf`,
    includeHeader = true,
    includeFooter = true,
    includeLogo = false,
    logoUrl = '',
    companyInfo = {},
    customStyles = {}
  } = options;

  try {
    const doc = new jsPDF({
      orientation: PDF_CONFIG.orientation,
      unit: PDF_CONFIG.unit,
      format: PDF_CONFIG.format
    });

    // Set document properties
    doc.setProperties({
      title: `Cotización ${quoteData.folio}`,
      subject: 'Cotización de Loncheras+',
      author: quoteData.creadoPor || 'Loncheras+',
      keywords: 'cotización, loncheras, presupuesto',
      creator: 'Loncheras+ PDF Generator'
    });

    // Add content
    if (includeHeader) {
      addPDFHeader(doc, quoteData, companyInfo, logoUrl);
    }

    addQuoteContent(doc, quoteData, customStyles);

    if (includeFooter) {
      addPDFFooter(doc);
    }

    // Save and return
    doc.save(filename);
    
    return {
      success: true,
      filename,
      message: 'PDF generado exitosamente'
    };

  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error(`Error al generar PDF: ${error.message}`);
  }
}

/**
 * Add header to PDF
 */
function addPDFHeader(doc, quoteData, companyInfo, logoUrl) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = PDF_CONFIG.margins.left;

  // Company logo (if provided)
  if (logoUrl) {
    try {
      doc.addImage(logoUrl, 'PNG', margin, 10, 30, 20);
    } catch (error) {
      console.warn('Could not add logo to PDF:', error);
    }
  }

  // Company info
  const companyName = companyInfo.name || 'Loncheras+';
  const companyAddress = companyInfo.address || 'Bogotá, Colombia';
  const companyPhone = companyInfo.phone || '+57 300 123 4567';
  const companyEmail = companyInfo.email || 'contacto@loncheras.com';

  doc.setFontSize(16);
  doc.setTextColor(PDF_CONFIG.colors.primary);
  doc.setFont('helvetica', 'bold');
  
  if (!logoUrl) {
    doc.text(companyName, margin, 25);
  } else {
    doc.text(companyName, margin + 35, 20);
  }

  doc.setFontSize(10);
  doc.setTextColor(PDF_CONFIG.colors.text);
  doc.setFont('helvetica', 'normal');
  
  if (!logoUrl) {
    doc.text(companyAddress, margin, 35);
    doc.text(`Tel: ${companyPhone}`, margin, 42);
    doc.text(`Email: ${companyEmail}`, margin, 49);
  } else {
    doc.text(companyAddress, margin + 35, 30);
    doc.text(`Tel: ${companyPhone}`, margin + 35, 37);
    doc.text(`Email: ${companyEmail}`, margin + 35, 44);
  }

  // Quote title
  doc.setFontSize(20);
  doc.setTextColor(PDF_CONFIG.colors.primary);
  doc.setFont('helvetica', 'bold');
  doc.text('COTIZACIÓN', pageWidth - margin - 40, 25);

  // Quote details box
  const quoteBoxY = 55;
  const quoteBoxHeight = 25;
  
  doc.setDrawColor(PDF_CONFIG.colors.border);
  doc.setFillColor(248, 250, 252);
  doc.rect(margin, quoteBoxY, pageWidth - 2 * margin, quoteBoxHeight, 'FD');

  doc.setFontSize(12);
  doc.setTextColor(PDF_CONFIG.colors.text);
  doc.setFont('helvetica', 'bold');

  // Quote info
  const date = formatDate(quoteData.createdAt);
  const validityDays = quoteData.meta?.validezDias || 'N/A';
  const deliveryDays = quoteData.meta?.tiempoEntregaDias || 'N/A';

  doc.text(`Folio: ${quoteData.folio}`, margin + 5, quoteBoxY + 8);
  doc.text(`Fecha: ${date}`, margin + 5, quoteBoxY + 16);
  doc.text(`Validez: ${validityDays} días`, pageWidth / 2 - 20, quoteBoxY + 8);
  doc.text(`Entrega: ${deliveryDays} días`, pageWidth / 2 - 20, quoteBoxY + 16);

  // Client info
  const clientY = quoteBoxY + quoteBoxHeight + 15;
  if (quoteData.clientInfo) {
    doc.setFontSize(14);
    doc.setTextColor(PDF_CONFIG.colors.primary);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMACIÓN DEL CLIENTE', margin, clientY);

    doc.setFontSize(10);
    doc.setTextColor(PDF_CONFIG.colors.text);
    doc.setFont('helvetica', 'normal');
    
    let clientTextY = clientY + 8;
    if (quoteData.clientInfo.name) {
      doc.text(`Nombre: ${quoteData.clientInfo.name}`, margin, clientTextY);
      clientTextY += 6;
    }
    if (quoteData.clientInfo.email) {
      doc.text(`Email: ${quoteData.clientInfo.email}`, margin, clientTextY);
      clientTextY += 6;
    }
    if (quoteData.clientInfo.phone) {
      doc.text(`Teléfono: ${quoteData.clientInfo.phone}`, margin, clientTextY);
    }
  }

  return clientY + 25; // Return next Y position
}

/**
 * Add quote content (items table)
 */
function addQuoteContent(doc, quoteData, customStyles) {
  const startY = 95; // After header

  // Prepare table data
  const tableColumns = [
    { header: 'Producto', dataKey: 'producto' },
    { header: 'Cantidad', dataKey: 'cantidad' },
    { header: 'Precio Unit.', dataKey: 'precio' },
    { header: 'Subtotal', dataKey: 'subtotal' }
  ];

  const tableRows = quoteData.items?.map((item, index) => ({
    producto: `${index + 1}. ${item.producto}`,
    cantidad: item.cantidad.toString(),
    precio: formatCurrency(item.valorUnitario),
    subtotal: formatCurrency(item.subtotal)
  })) || [];

  // Add table
  doc.autoTable({
    columns: tableColumns,
    body: tableRows,
    startY: startY,
    margin: { left: PDF_CONFIG.margins.left, right: PDF_CONFIG.margins.right },
    theme: 'striped',
    headStyles: {
      fillColor: [14, 165, 166], // --accent color
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 10
    },
    bodyStyles: {
      fontSize: 9,
      cellPadding: 3
    },
    columnStyles: {
      producto: { cellWidth: 80 },
      cantidad: { halign: 'center', cellWidth: 25 },
      precio: { halign: 'right', cellWidth: 35 },
      subtotal: { halign: 'right', cellWidth: 35, fontStyle: 'bold' }
    },
    didDrawPage: (data) => {
      // Add table header on new pages
      if (data.pageNumber > 1) {
        doc.setFontSize(8);
        doc.setTextColor(PDF_CONFIG.colors.secondary);
        doc.text(`Cotización ${quoteData.folio} - Página ${data.pageNumber}`, 
                PDF_CONFIG.margins.left, 10);
      }
    }
  });

  // Add totals
  const finalY = doc.lastAutoTable.finalY + 10;
  addTotalsSection(doc, quoteData, finalY);

  // Add terms and conditions
  if (quoteData.terms || quoteData.meta?.terms) {
    addTermsSection(doc, quoteData.terms || quoteData.meta.terms, finalY + 40);
  }
}

/**
 * Add totals section
 */
function addTotalsSection(doc, quoteData, startY) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = PDF_CONFIG.margins.left;
  
  // Total box
  const totalBoxWidth = 80;
  const totalBoxX = pageWidth - margin - totalBoxWidth;
  
  doc.setDrawColor(PDF_CONFIG.colors.primary);
  doc.setFillColor(249, 250, 251);
  doc.rect(totalBoxX, startY, totalBoxWidth, 20, 'FD');
  
  doc.setFontSize(12);
  doc.setTextColor(PDF_CONFIG.colors.text);
  doc.setFont('helvetica', 'bold');
  
  doc.text('TOTAL:', totalBoxX + 5, startY + 8);
  doc.setFontSize(14);
  doc.setTextColor(PDF_CONFIG.colors.primary);
  doc.text(formatCurrency(quoteData.total), totalBoxX + 5, startY + 16);
  
  // Additional info
  doc.setFontSize(8);
  doc.setTextColor(PDF_CONFIG.colors.secondary);
  doc.setFont('helvetica', 'normal');
  doc.text('Precios en pesos colombianos (COP)', margin, startY + 8);
  doc.text('IVA incluido cuando aplique', margin, startY + 14);
}

/**
 * Add terms and conditions
 */
function addTermsSection(doc, terms, startY) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = PDF_CONFIG.margins.left;
  
  doc.setFontSize(12);
  doc.setTextColor(PDF_CONFIG.colors.primary);
  doc.setFont('helvetica', 'bold');
  doc.text('TÉRMINOS Y CONDICIONES', margin, startY);
  
  doc.setFontSize(9);
  doc.setTextColor(PDF_CONFIG.colors.text);
  doc.setFont('helvetica', 'normal');
  
  // Split long text into lines
  const lines = doc.splitTextToSize(terms, pageWidth - 2 * margin);
  doc.text(lines, margin, startY + 8);
}

/**
 * Add footer to PDF
 */
function addPDFFooter(doc) {
  const pageCount = doc.internal.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = PDF_CONFIG.margins.left;

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    // Footer line
    doc.setDrawColor(PDF_CONFIG.colors.border);
    doc.setLineWidth(0.5);
    doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
    
    // Footer text
    doc.setFontSize(8);
    doc.setTextColor(PDF_CONFIG.colors.secondary);
    doc.setFont('helvetica', 'normal');
    
    doc.text('Loncheras+ - Cotizaciones nutritivas a domicilio', margin, pageHeight - 8);
    doc.text(`Página ${i} de ${pageCount}`, pageWidth - margin - 20, pageHeight - 8);
  }
}

/**
 * Generate PDF for multiple quotes (batch)
 */
export async function generateBatchQuotesPDF(quotes, options = {}) {
  const {
    filename = `cotizaciones_${new Date().toISOString().split('T')[0]}.pdf`,
    includeIndex = true
  } = options;

  try {
    const doc = new jsPDF({
      orientation: PDF_CONFIG.orientation,
      unit: PDF_CONFIG.unit,
      format: PDF_CONFIG.format
    });

    let currentY = 20;

    // Add index if requested
    if (includeIndex && quotes.length > 1) {
      addBatchIndex(doc, quotes);
      doc.addPage();
      currentY = 20;
    }

    // Add each quote
    for (let i = 0; i < quotes.length; i++) {
      if (i > 0) {
        doc.addPage();
        currentY = 20;
      }

      const quote = quotes[i];
      addQuoteToBatch(doc, quote, currentY, i + 1, quotes.length);
      
      // Add page break between quotes (except last)
      if (i < quotes.length - 1) {
        currentY = 280; // Force page break
      }
    }

    doc.save(filename);
    
    return {
      success: true,
      filename,
      message: `PDF de ${quotes.length} cotizaciones generado exitosamente`
    };

  } catch (error) {
    console.error('Error generating batch PDF:', error);
    throw new Error(`Error al generar PDF en lote: ${error.message}`);
  }
}

/**
 * Add index for batch PDF
 */
function addBatchIndex(doc, quotes) {
  doc.setFontSize(18);
  doc.setTextColor(PDF_CONFIG.colors.primary);
  doc.setFont('helvetica', 'bold');
  doc.text('ÍNDICE DE COTIZACIONES', 20, 30);

  doc.setFontSize(10);
  doc.setTextColor(PDF_CONFIG.colors.text);
  doc.setFont('helvetica', 'normal');

  let y = 50;
  quotes.forEach((quote, index) => {
    const date = formatDate(quote.createdAt);
    doc.text(`${index + 1}. ${quote.folio} - ${quote.creadoPor} (${date})`, 20, y);
    y += 8;
    
    if (y > 250) {
      doc.addPage();
      y = 30;
    }
  });
}

/**
 * Add single quote to batch PDF
 */
function addQuoteToBatch(doc, quote, startY, quoteNumber, totalQuotes) {
  // Quote header
  doc.setFontSize(16);
  doc.setTextColor(PDF_CONFIG.colors.primary);
  doc.setFont('helvetica', 'bold');
  doc.text(`Cotización ${quote.folio} (${quoteNumber}/${totalQuotes})`, 20, startY);

  // Basic info
  doc.setFontSize(10);
  doc.setTextColor(PDF_CONFIG.colors.text);
  doc.setFont('helvetica', 'normal');
  doc.text(`Proveedor: ${quote.creadoPor}`, 20, startY + 10);
  doc.text(`Fecha: ${formatDate(quote.createdAt)}`, 20, startY + 17);
  doc.text(`Total: ${formatCurrency(quote.total)}`, 20, startY + 24);

  // Items table (simplified)
  const tableStartY = startY + 35;
  const tableData = quote.items?.slice(0, 5).map((item, idx) => [
    `${idx + 1}. ${item.producto}`,
    item.cantidad.toString(),
    formatCurrency(item.subtotal)
  ]) || [];

  if (tableData.length > 0) {
    doc.autoTable({
      head: [['Producto', 'Cant.', 'Subtotal']],
      body: tableData,
      startY: tableStartY,
      margin: { left: 20, right: 20 },
      theme: 'grid',
      headStyles: {
        fillColor: [14, 165, 166],
        textColor: 255,
        fontSize: 8
      },
      bodyStyles: {
        fontSize: 7,
        cellPadding: 2
      },
      columnStyles: {
        0: { cellWidth: 100 },
        1: { halign: 'center', cellWidth: 20 },
        2: { halign: 'right', cellWidth: 30 }
      }
    });
  }
}

/**
 * Generate quote preview PDF (for email attachments)
 */
export async function generateQuotePreview(quoteData) {
  return await generateQuotePDF(quoteData, {
    filename: `preview_${quoteData.folio}.pdf`,
    includeHeader: true,
    includeFooter: true,
    companyInfo: {
      name: 'Loncheras+',
      address: 'Bogotá, Colombia',
      phone: '+57 300 123 4567',
      email: 'contacto@loncheras.com'
    }
  });
}

// Utility functions
function formatCurrency(amount) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(amount || 0);
}

function formatDate(date) {
  if (!date) return 'No especificada';
  
  const dateObj = date.toDate ? date.toDate() : new Date(date);
  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(dateObj);
}

// Export PDF service configuration
export const pdfConfig = PDF_CONFIG;