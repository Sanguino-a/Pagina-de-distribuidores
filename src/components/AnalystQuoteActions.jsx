import { useState } from 'react';
import {
  approveQuote,
  rejectAndDeleteQuote,
  canAnalystModify,
  canAnalystDelete,
  getAnalystWorkflowInfo,
  QUOTE_STATUS
} from '../services/quotes';
import { useToast } from '../context/ToastContext';

export default function AnalystQuoteActions({
  quote,
  userProfile,
  onStatusUpdate,
  onQuoteDeleted
}) {
  const toast = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [reason, setReason] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  // Get workflow information and permissions
  const workflowInfo = getAnalystWorkflowInfo(quote);
  const canModify = canAnalystModify(quote, userProfile);
  const canDelete = canAnalystDelete(quote, userProfile);

  if (!canModify) {
    return (
      <div style={{
        padding: '1rem',
        background: 'var(--surface)',
        borderRadius: '.5rem',
        textAlign: 'center',
        color: 'var(--muted)',
        fontSize: '0.9rem'
      }}>
        <p>🚫 No tienes permisos para modificar esta cotización.</p>
        {quote.creadoPorUid === userProfile?.uid && (
          <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
            Los analistas no pueden modificar sus propias cotizaciones.
          </p>
        )}
        {workflowInfo.currentStatus === QUOTE_STATUS.APPROVED && (
          <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
            Las cotizaciones ya aprobadas no pueden ser modificadas.
          </p>
        )}
      </div>
    );
  }

  const handleApprove = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    try {
      await approveQuote(quote.id, {
        userId: userProfile.uid,
        userName: userProfile.displayName || userProfile.nombre || userProfile.email
      });
      
      toast.success('Cotización aprobada exitosamente');
      onStatusUpdate?.('approved', quote.id);
    } catch (error) {
      console.error('Error approving quote:', error);
      toast.error(`Error al aprobar cotización: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectAndDelete = async () => {
    if (isProcessing) return;
    
    if (!reason.trim()) {
      toast.error('Por favor proporciona una razón para rechazar la cotización');
      return;
    }
    
    setIsProcessing(true);
    try {
      await rejectAndDeleteQuote(quote.id, {
        userId: userProfile.uid,
        userName: userProfile.displayName || userProfile.nombre || userProfile.email
      }, reason.trim());
      
      toast.success('Cotización rechazada y eliminada exitosamente');
      onQuoteDeleted?.(quote.id);
    } catch (error) {
      console.error('Error rejecting and deleting quote:', error);
      toast.error(`Error al rechazar cotización: ${error.message}`);
    } finally {
      setIsProcessing(false);
      setShowRejectDialog(false);
      setReason('');
    }
  };

  const openRejectDialog = () => {
    setShowRejectDialog(true);
  };

  const closeRejectDialog = () => {
    setShowRejectDialog(false);
    setReason('');
  };

  // Don't show actions if quote is already approved
  if (workflowInfo.currentStatus === QUOTE_STATUS.APPROVED) {
    return (
      <div style={{
        padding: '1rem',
        background: 'var(--card)',
        border: '1px solid var(--surface)',
        borderRadius: '.5rem',
        textAlign: 'center'
      }}>
        <span className="status-indicator status-approved">
          ✅ Cotización Aprobada
        </span>
        <p style={{ marginTop: '0.5rem', color: 'var(--muted)', fontSize: '0.9rem' }}>
          Esta cotización ya fue aprobada y no puede ser modificada.
        </p>
      </div>
    );
  }

  return (
    <div className="analyst-actions" style={{
      marginTop: '1.5rem',
      padding: '1.5rem',
      background: 'var(--card)',
      border: '1px solid var(--surface)',
      borderRadius: '.5rem'
    }}>
      <h4 style={{ margin: '0 0 1rem 0', color: 'var(--text)' }}>
        📋 Acciones de Analista
      </h4>
      
      {/* Status information */}
      <div style={{
        marginBottom: '1rem',
        padding: '1rem',
        background: 'var(--surface)',
        borderRadius: '0.5rem',
        fontSize: '0.9rem'
      }}>
        <p><strong>Estado actual:</strong> {workflowInfo.statusDescription}</p>
        <p><strong>Recomendación:</strong> {workflowInfo.recommendation}</p>
      </div>
      
      <div className="action-buttons" style={{
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        {/* Approve Button - only show if can approve */}
        {workflowInfo.canApprove && (
          <button
            className="btn btn-success"
            onClick={handleApprove}
            disabled={isProcessing}
            style={{
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              fontWeight: 'bold',
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            {isProcessing ? '⏳ Procesando...' : '✅ Aprobar Cotización'}
          </button>
        )}

        {/* Reject and Delete Button - only show if can reject/delete */}
        {workflowInfo.canRejectDelete && (
          <button
            className="btn btn-danger"
            onClick={openRejectDialog}
            disabled={isProcessing}
            style={{
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              fontWeight: 'bold',
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            🗑️ Rechazar y Eliminar
          </button>
        )}
      </div>

      <div style={{
        marginTop: '1rem',
        fontSize: '0.85rem',
        color: 'var(--muted)',
        background: 'var(--surface)',
        padding: '1rem',
        borderRadius: '0.5rem'
      }}>
        <p>
          <strong>✅ Aprobar:</strong> La cotización será marcada como aprobada y no podrá ser eliminada posteriormente.
        </p>
        <p>
          <strong>🗑️ Rechazar:</strong> La cotización será eliminada permanentemente de la base de datos. ⚠️ Esta acción no se puede deshacer.
        </p>
        <p style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
          <strong>Nota:</strong> Solo puedes modificar cotizaciones de distribuidores, no las tuyas propias.
        </p>
      </div>

      {/* Reject Dialog */}
      {showRejectDialog && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'var(--card)',
            border: '1px solid var(--surface)',
            borderRadius: '0.5rem',
            padding: '2rem',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h3 style={{ margin: '0 0 1rem 0', color: 'var(--text)' }}>
              Confirmar Rechazo y Eliminación
            </h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <div style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                padding: '1rem',
                borderRadius: '0.5rem',
                marginBottom: '1rem'
              }}>
                <p style={{
                  color: '#dc2626',
                  fontWeight: 'bold',
                  margin: '0 0 0.5rem 0'
                }}>
                  ⚠️ ACCIÓN IRREVERSIBLE
                </p>
                <p style={{ margin: '0', color: '#7f1d1d' }}>
                  Estás a punto de rechazar y eliminar permanentemente la cotización
                  <strong> "{quote.folio}"</strong>.
                </p>
              </div>
              
              <div className="field">
                <label htmlFor="rejection-reason" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Razón del rechazo (obligatorio):
                </label>
                <textarea
                  id="rejection-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Ej: Precio demasiado alto, productos no disponibles, términos inadecuados, incumplimiento de especificaciones..."
                  rows={4}
                  style={{
                    width: '100%',
                    background: 'var(--surface)',
                    color: 'var(--text)',
                    border: '1px solid var(--surface)',
                    borderRadius: '0.5rem',
                    padding: '0.75rem',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                  required
                />
              </div>
              
              <p style={{
                fontSize: '0.8rem',
                color: 'var(--muted)',
                marginTop: '0.5rem'
              }}>
                💡 <strong>Tip:</strong> Una razón clara ayudará al distribuidor a entender por qué fue rechazada su cotización.
              </p>
            </div>

            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'flex-end',
              borderTop: '1px solid var(--surface)',
              paddingTop: '1rem'
            }}>
              <button
                className="btn"
                onClick={closeRejectDialog}
                disabled={isProcessing}
                style={{
                  background: 'var(--surface)',
                  color: 'var(--text)',
                  border: '1px solid var(--surface)',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  cursor: isProcessing ? 'not-allowed' : 'pointer'
                }}
              >
                Cancelar
              </button>
              <button
                className="btn btn-danger"
                onClick={handleRejectAndDelete}
                disabled={isProcessing || !reason.trim()}
                style={{
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  fontWeight: 'bold',
                  cursor: (isProcessing || !reason.trim()) ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                {isProcessing ? '⏳ Eliminando...' : '🗑️ Confirmar Eliminación'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}