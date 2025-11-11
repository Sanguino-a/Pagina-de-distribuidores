import {
  addDoc, collection, serverTimestamp, onSnapshot,
  query, orderBy, getDocs, where, updateDoc, doc,
  arrayUnion, arrayRemove, increment, getDoc, deleteDoc
} from "firebase/firestore";
import { db } from "./firebase";

// Quote status constants
export const QUOTE_STATUS = {
  DRAFT: 'draft',
  SENT: 'sent',
  VIEWED: 'viewed',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled',
  PENDING: 'pending'
};

export const QUOTE_STATUS_LABELS = {
  [QUOTE_STATUS.DRAFT]: 'Borrador',
  [QUOTE_STATUS.SENT]: 'Enviado',
  [QUOTE_STATUS.VIEWED]: 'Visto',
  [QUOTE_STATUS.APPROVED]: 'Aprobado',
  [QUOTE_STATUS.REJECTED]: 'Rechazado',
  [QUOTE_STATUS.EXPIRED]: 'Expirado',
  [QUOTE_STATUS.CANCELLED]: 'Cancelado',
  [QUOTE_STATUS.PENDING]: 'Pendiente'
};

export const QUOTE_STATUS_COLORS = {
  [QUOTE_STATUS.DRAFT]: '#6b7280',
  [QUOTE_STATUS.SENT]: '#3b82f6',
  [QUOTE_STATUS.VIEWED]: '#f59e0b',
  [QUOTE_STATUS.APPROVED]: '#10b981',
  [QUOTE_STATUS.REJECTED]: '#ef4444',
  [QUOTE_STATUS.EXPIRED]: '#dc2626',
  [QUOTE_STATUS.CANCELLED]: '#6b7280',
  [QUOTE_STATUS.PENDING]: '#f59e0b'
};

// Valid status transitions
export const VALID_STATUS_TRANSITIONS = {
  [QUOTE_STATUS.DRAFT]: [QUOTE_STATUS.SENT, QUOTE_STATUS.CANCELLED, QUOTE_STATUS.APPROVED, QUOTE_STATUS.REJECTED],
  [QUOTE_STATUS.SENT]: [QUOTE_STATUS.VIEWED, QUOTE_STATUS.EXPIRED, QUOTE_STATUS.CANCELLED, QUOTE_STATUS.APPROVED, QUOTE_STATUS.REJECTED],
  [QUOTE_STATUS.VIEWED]: [QUOTE_STATUS.APPROVED, QUOTE_STATUS.REJECTED, QUOTE_STATUS.EXPIRED],
  [QUOTE_STATUS.APPROVED]: [QUOTE_STATUS.CANCELLED],
  [QUOTE_STATUS.REJECTED]: [QUOTE_STATUS.SENT, QUOTE_STATUS.CANCELLED],
  [QUOTE_STATUS.EXPIRED]: [QUOTE_STATUS.SENT, QUOTE_STATUS.CANCELLED],
  [QUOTE_STATUS.CANCELLED]: [],
  [QUOTE_STATUS.PENDING]: [QUOTE_STATUS.SENT, QUOTE_STATUS.CANCELLED, QUOTE_STATUS.APPROVED, QUOTE_STATUS.REJECTED]
};

export async function folioExists(folio) {
  const ref = collection(db, "quotes");
  const q = query(ref, where("folio", "==", folio.trim()));
  const snap = await getDocs(q);
  return !snap.empty;
}

export async function addQuote({
  folio,
  userProfile,
  items = [],
  meta = {},
  status = QUOTE_STATUS.DRAFT,
  clientInfo = {}
}) {
  const ref = collection(db, "quotes");

  const existe = await folioExists(folio);
  if (existe) {
    const err = new Error(`El folio "${folio}" ya existe en la base de datos.`);
    err.code = "folio-duplicado";
    throw err;
  }

  const lineas = items
    .filter(r => r?.nombre && Number(r?.cantidad) > 0)
    .map(r => {
      const cantidad = Number(r.cantidad) || 0;
      const valorUnitario = Number(r.precio) || 0;
      const subtotal = cantidad * valorUnitario;
      return { producto: r.nombre, cantidad, valorUnitario, subtotal };
    });

  const total = lineas.reduce((a, l) => a + l.subtotal, 0);

  // Use actual user profile or fallback
  const creatorName = userProfile?.displayName ||
                     userProfile?.nombre ||
                     userProfile?.email ||
                     "Usuario Anónimo";
  const creatorEmail = userProfile?.email || "";
  const creatorUid = userProfile?.uid || "";

  // Create status history entry
  const statusHistory = [{
    status,
    timestamp: new Date(),
    userId: creatorUid || 'system',
    userName: creatorName,
    notes: 'Cotización creada'
  }];

  // Save to Firestore with user information
  const quoteData = {
    folio: folio.trim(),
    creadoPor: creatorName,
    creadoPorEmail: creatorEmail,
    creadoPorUid: creatorUid,
    items: lineas,
    total,
    status,
    statusHistory,
    ...meta,
    clientInfo,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  const docRef = await addDoc(ref, quoteData);
  return { id: docRef.id, ...quoteData };
}

export function watchQuotes(cb, { statusFilter = null, userFilter = null } = {}) {
  const ref = collection(db, "quotes");
  let constraints = [];
  
  // Add user filter if provided
  if (userFilter) {
    constraints.push(where("creadoPorUid", "==", userFilter));
  }
  
  // Add status filter if provided
  if (statusFilter) {
    constraints.push(where("status", "==", statusFilter));
  }
  
  // Add ordering
  constraints.push(orderBy("createdAt", "desc"));
  
  const q = query(ref, ...constraints);
  
  return onSnapshot(q, (snap) => {
    const quotes = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    cb(quotes);
  });
}

export async function updateQuoteStatus(
  quoteId, 
  newStatus, 
  userInfo = {}, 
  notes = '',
  metadata = {}
) {
  const quoteRef = doc(db, "quotes", quoteId);
  
  // Get current quote to validate transition
  const currentQuote = await getCurrentQuote(quoteId);
  if (!currentQuote) {
    throw new Error('Cotización no encontrada');
  }

  // Validate status transition
  if (!isValidStatusTransition(currentQuote.status, newStatus)) {
    throw new Error(`Transición de estado no válida: ${currentQuote.status} → ${newStatus}`);
  }

  const statusHistoryEntry = {
    status: newStatus,
    timestamp: new Date(),
    userId: userInfo.userId || 'system',
    userName: userInfo.userName || 'Usuario',
    notes: notes || `Estado cambiado de ${currentQuote.status} a ${newStatus}`,
    ...metadata
  };

  const updateData = {
    status: newStatus,
    statusHistory: arrayUnion(statusHistoryEntry),
    updatedAt: serverTimestamp()
  };

  // Add status-specific metadata
  switch (newStatus) {
    case QUOTE_STATUS.VIEWED:
      updateData.viewedAt = serverTimestamp();
      break;
    case QUOTE_STATUS.APPROVED:
      updateData.approvedAt = serverTimestamp();
      break;
    case QUOTE_STATUS.REJECTED:
      updateData.rejectedAt = serverTimestamp();
      break;
    case QUOTE_STATUS.EXPIRED:
      updateData.expiredAt = serverTimestamp();
      break;
  }

  await updateDoc(quoteRef, updateData);
  return { ...currentQuote, ...updateData, id: quoteId };
}

export async function getCurrentQuote(quoteId) {
  const quoteRef = doc(db, "quotes", quoteId);
  const docSnap = await getDoc(quoteRef);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
}

export function isValidStatusTransition(currentStatus, newStatus) {
  const validTransitions = VALID_STATUS_TRANSITIONS[currentStatus] || [];
  return validTransitions.includes(newStatus);
}

export function getQuoteStatusInfo(status) {
  return {
    label: QUOTE_STATUS_LABELS[status] || status,
    color: QUOTE_STATUS_COLORS[status] || '#6b7280',
    isValidTransition: (fromStatus) => isValidStatusTransition(fromStatus, status)
  };
}

export async function getQuoteStatusHistory(quoteId) {
  // This would fetch the status history for a specific quote
  // Implementation depends on your Firestore structure
  return [];
}

export async function bulkUpdateQuoteStatus(quoteIds, newStatus, userInfo = {}, notes = '') {
  const results = {
    successful: [],
    failed: []
  };

  for (const quoteId of quoteIds) {
    try {
      const result = await updateQuoteStatus(quoteId, newStatus, userInfo, notes);
      results.successful.push(result);
    } catch (error) {
      results.failed.push({ quoteId, error: error.message });
    }
  }

  return results;
}

export function filterQuotesByStatus(quotes, status) {
  if (!status) return quotes;
  return quotes.filter(quote => quote.status === status);
}

export function getQuoteStatistics(quotes) {
  const stats = {};
  
  Object.values(QUOTE_STATUS).forEach(status => {
    stats[status] = quotes.filter(q => q.status === status).length;
  });

  const totalValue = quotes.reduce((sum, q) => sum + (q.total || 0), 0);
  const approvedValue = quotes
    .filter(q => q.status === QUOTE_STATUS.APPROVED)
    .reduce((sum, q) => sum + (q.total || 0), 0);

  return {
    byStatus: stats,
    totalQuotes: quotes.length,
    totalValue,
    approvedValue,
    conversionRate: stats[QUOTE_STATUS.APPROVED] && quotes.length > 0
      ? (stats[QUOTE_STATUS.APPROVED] / quotes.length * 100).toFixed(1)
      : 0
  };
}

export async function deleteQuote(quoteId, userInfo = {}) {
  const quoteRef = doc(db, "quotes", quoteId);
  
  try {
    await deleteDoc(quoteRef);
    console.log('Quote deleted successfully:', quoteId);
    return { success: true, id: quoteId, deletedAt: new Date() };
  } catch (error) {
    console.error('Error deleting quote:', error);
    throw new Error(`Error al eliminar cotización: ${error.message}`);
  }
}

export async function approveQuote(quoteId, userInfo = {}) {
  // For analysts, skip normal state validation and directly approve
  const quoteRef = doc(db, "quotes", quoteId);
  const currentQuote = await getCurrentQuote(quoteId);
  
  if (!currentQuote) {
    throw new Error('Cotización no encontrada');
  }

  const statusHistoryEntry = {
    status: QUOTE_STATUS.APPROVED,
    timestamp: new Date(),
    userId: userInfo.userId || 'system',
    userName: userInfo.userName || 'Usuario',
    notes: 'Cotización aprobada por analista',
    source: 'AnalystApproval'
  };

  const updateData = {
    status: QUOTE_STATUS.APPROVED,
    statusHistory: arrayUnion(statusHistoryEntry),
    approvedAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  await updateDoc(quoteRef, updateData);
  return { ...currentQuote, ...updateData, id: quoteId };
}

export async function rejectAndDeleteQuote(quoteId, userInfo = {}, reason = '') {
  // For analysts, first update status to rejected (with special handling)
  const quoteRef = doc(db, "quotes", quoteId);
  const currentQuote = await getCurrentQuote(quoteId);
  
  if (!currentQuote) {
    throw new Error('Cotización no encontrada');
  }

  const statusHistoryEntry = {
    status: QUOTE_STATUS.REJECTED,
    timestamp: new Date(),
    userId: userInfo.userId || 'system',
    userName: userInfo.userName || 'Usuario',
    notes: reason || 'Cotización rechazada por analista - será eliminada',
    source: 'AnalystRejection'
  };

  const updateData = {
    status: QUOTE_STATUS.REJECTED,
    statusHistory: arrayUnion(statusHistoryEntry),
    rejectedAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  await updateDoc(quoteRef, updateData);
  
  // Wait a moment to ensure status update is completed
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Then delete the quote
  return await deleteQuote(quoteId, userInfo);
}

export function canAnalystModify(quote, userProfile = {}) {
  // Check if user has analyst role
  if (userProfile.rol !== 'analista') {
    return false;
  }
  
  // Analysts can only modify quotes from distributors (not their own)
  if (quote.creadoPorUid === userProfile.uid) {
    return false;
  }
  
  // Analysts can modify quotes that are not yet approved
  if (quote.status === QUOTE_STATUS.APPROVED) {
    return false;
  }

  // Analysts can modify quotes in any other status
  return true;
}

export function canAnalystDelete(quote, userProfile = {}) {
  // Check if user has analyst role and can modify
  if (!canAnalystModify(quote, userProfile)) {
    return false;
  }
  
  // Analysts can delete quotes in most statuses except approved
  const deletableStatuses = [
    QUOTE_STATUS.REJECTED,
    QUOTE_STATUS.EXPIRED,
    QUOTE_STATUS.CANCELLED,
    QUOTE_STATUS.DRAFT,
    QUOTE_STATUS.SENT,
    QUOTE_STATUS.VIEWED,
    QUOTE_STATUS.PENDING
  ];
  
  return deletableStatuses.includes(quote.status);
}

export function getAnalystWorkflowInfo(quote) {
  // Provide workflow guidance based on current quote status
  const info = {
    canApprove: false,
    canRejectDelete: false,
    currentStatus: quote.status,
    statusDescription: '',
    recommendation: ''
  };

  switch (quote.status) {
    case QUOTE_STATUS.DRAFT:
      info.canApprove = true;
      info.canRejectDelete = true;
      info.statusDescription = 'Cotización en borrador';
      info.recommendation = 'Puede ser aprobada directamente o rechazada y eliminada';
      break;
    
    case QUOTE_STATUS.SENT:
      info.canApprove = true;
      info.canRejectDelete = true;
      info.statusDescription = 'Cotización enviada';
      info.recommendation = 'Pendiente de revisión por analista';
      break;
    
    case QUOTE_STATUS.VIEWED:
      info.canApprove = true;
      info.canRejectDelete = true;
      info.statusDescription = 'Cotización vista por distribuidor';
      info.recommendation = 'Lista para revisión y decisión final';
      break;
    
    case QUOTE_STATUS.APPROVED:
      info.canApprove = false;
      info.canRejectDelete = false;
      info.statusDescription = 'Cotización aprobada';
      info.recommendation = 'No se puede modificar - cotización ya aprobada';
      break;
    
    case QUOTE_STATUS.REJECTED:
    case QUOTE_STATUS.EXPIRED:
    case QUOTE_STATUS.CANCELLED:
      info.canApprove = false;
      info.canRejectDelete = true;
      info.statusDescription = `Cotización ${quote.status === QUOTE_STATUS.REJECTED ? 'rechazada' : quote.status === QUOTE_STATUS.EXPIRED ? 'expirada' : 'cancelada'}`;
      info.recommendation = 'Puede ser eliminada si es necesario';
      break;
    
    default:
      info.canApprove = true;
      info.canRejectDelete = true;
      info.statusDescription = 'Estado no definido';
      info.recommendation = 'Requiere revisión del analista';
  }

  return info;
}
