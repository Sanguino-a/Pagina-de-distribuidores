/**
 * Email Service for sending quotes via EmailJS
 * Supports both EmailJS integration and mailto fallback
 */

// EmailJS configuration (replace with your actual EmailJS credentials)
const EMAILJS_CONFIG = {
  SERVICE_ID: import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_quote',
  TEMPLATE_ID: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_quote',
  PUBLIC_KEY: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'your_public_key'
};

// Email templates
const EMAIL_TEMPLATES = {
  QUOTE_SENT: 'quote_sent',
  QUOTE_APPROVED: 'quote_approved',
  QUOTE_REJECTED: 'quote_rejected',
  QUOTE_REMINDER: 'quote_reminder'
};

/**
 * Send quote via EmailJS or mailto fallback
 */
export async function sendQuoteEmail(quoteData, options = {}) {
  const {
    to = '',
    subject = '',
    template = EMAIL_TEMPLATES.QUOTE_SENT,
    useEmailJS = true,
    customTemplateData = {}
  } = options;

  const emailData = {
    to,
    subject: subject || `Cotización ${quoteData.folio} - Loncheras+`,
    quoteData,
    template,
    customTemplateData
  };

  if (useEmailJS && isEmailJSConfigured()) {
    try {
      return await sendViaEmailJS(emailData);
    } catch (error) {
      console.warn('EmailJS failed, falling back to mailto:', error);
      return await sendViaMailto(emailData);
    }
  } else {
    return await sendViaMailto(emailData);
  }
}

/**
 * Send email via EmailJS
 */
async function sendViaEmailJS(emailData) {
  if (!window.emailjs) {
    throw new Error('EmailJS library not loaded');
  }

  const templateParams = generateEmailTemplateParams(emailData);
  
  const result = await window.emailjs.send(
    EMAILJS_CONFIG.SERVICE_ID,
    EMAILJS_CONFIG.TEMPLATE_ID,
    templateParams
  );

  return {
    success: true,
    method: 'emailjs',
    result
  };
}

/**
 * Send email via mailto (fallback)
 */
async function sendViaMailto(emailData) {
  const { to, subject, quoteData } = emailData;
  const body = generateEmailBody(quoteData);
  
  const mailtoLink = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  
  // Open mailto link
  window.open(mailtoLink, '_blank');
  
  return {
    success: true,
    method: 'mailto',
    message: 'Email client opened via mailto'
  };
}

/**
 * Check if EmailJS is properly configured
 */
function isEmailJSConfigured() {
  return (
    EMAILJS_CONFIG.SERVICE_ID !== 'service_quote' &&
    EMAILJS_CONFIG.TEMPLATE_ID !== 'template_quote' &&
    EMAILJS_CONFIG.PUBLIC_KEY !== 'your_public_key'
  );
}

/**
 * Generate email template parameters for EmailJS
 */
function generateEmailTemplateParams({ to, subject, quoteData, template, customTemplateData }) {
  const baseParams = {
    to_email: to,
    to_name: quoteData.clientName || 'Cliente',
    from_name: quoteData.creadoPor || 'Loncheras+',
    subject: subject,
    quote_folio: quoteData.folio,
    quote_total: formatCurrency(quoteData.total),
    quote_date: formatDate(quoteData.createdAt),
    reply_to: 'contacto@loncheras.com'
  };

  // Add template-specific parameters
  switch (template) {
    case EMAIL_TEMPLATES.QUOTE_SENT:
      return {
        ...baseParams,
        message: `Su cotización ${quoteData.folio} ha sido enviada. Por favor revísela y contáctenos si tiene alguna pregunta.`,
        template_type: 'quote_sent'
      };

    case EMAIL_TEMPLATES.QUOTE_APPROVED:
      return {
        ...baseParams,
        message: `¡Su cotización ${quoteData.folio} ha sido aprobada! Nos pondremos en contacto pronto para coordinar la entrega.`,
        template_type: 'quote_approved'
      };

    case EMAIL_TEMPLATES.QUOTE_REJECTED:
      return {
        ...baseParams,
        message: `Su cotización ${quoteData.folio} ha sido rechazada. Si desea hacer cambios, por favor contáctenos.`,
        template_type: 'quote_rejected'
      };

    case EMAIL_TEMPLATES.QUOTE_REMINDER:
      return {
        ...baseParams,
        message: `Recordatorio: Su cotización ${quoteData.folio} vence pronto. Por favor confirme su decisión.`,
        template_type: 'quote_reminder'
      };

    default:
      return {
        ...baseParams,
        message: 'Cotización de Loncheras+',
        template_type: 'default'
      };
  }
}

/**
 * Generate email body for mailto fallback
 */
function generateEmailBody(quoteData) {
  const { 
    folio, 
    creadoPor, 
    items = [], 
    total, 
    meta = {},
    clientInfo = {},
    createdAt 
  } = quoteData;

  let body = `Estimado/a ${clientInfo.name || 'Cliente'},\n\n`;
  body += `Le enviamos la cotización ${folio} con los siguientes detalles:\n\n`;
  body += `📋 INFORMACIÓN DE LA COTIZACIÓN\n`;
  body += `Folio: ${folio}\n`;
  body += `Proveedor: ${creadoPor}\n`;
  body += `Fecha: ${formatDate(createdAt)}\n`;
  body += `Total: ${formatCurrency(total)}\n\n`;

  if (meta.validezDias) {
    body += `Validez: ${meta.validezDias} días\n`;
  }
  if (meta.tiempoEntregaDias) {
    body += `Tiempo de entrega: ${meta.tiempoEntregaDias} días\n\n`;
  }

  body += `📦 PRODUCTOS COTIZADOS\n`;
  body += `${'─'.repeat(50)}\n`;
  
  items.forEach((item, index) => {
    body += `${index + 1}. ${item.producto}\n`;
    body += `   Cantidad: ${item.cantidad}\n`;
    body += `   Precio unitario: ${formatCurrency(item.valorUnitario)}\n`;
    body += `   Subtotal: ${formatCurrency(item.subtotal)}\n\n`;
  });

  body += `${'─'.repeat(50)}\n`;
  body += `TOTAL: ${formatCurrency(total)}\n\n`;

  body += `📞 CONTACTO\n`;
  body += `Para cualquier consulta o aprobación, contáctenos:\n`;
  body += `Email: contacto@loncheras.com\n`;
  body += `Teléfono: +57 300 123 4567\n`;
  body += `Web: www.loncheras.com\n\n`;

  body += `¡Gracias por confiar en Loncheras+!\n`;
  body += `Atentamente,\n${creadoPor}\n\n`;
  body += `---\n`;
  body += `Este es un mensaje automático de Loncheras+\n`;

  return body;
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

// Initialize EmailJS if available
export function initializeEmailJS() {
  if (typeof window !== 'undefined' && window.emailjs) {
    window.emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
    return true;
  }
  return false;
}

// Check if EmailJS is loaded
export function isEmailJSLoaded() {
  return typeof window !== 'undefined' && !!window.emailjs;
}