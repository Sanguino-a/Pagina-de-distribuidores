import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function PasswordResetModal({ isOpen, onClose }) {
  const { resetPassword } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [toastAvailable, setToastAvailable] = useState(false);

  // Check if toast functions are available
  useEffect(() => {
    if (toast) {
      setToastAvailable(
        typeof toast.success === 'function' && 
        typeof toast.error === 'function'
      );
    }
  }, [toast]);

  const showToast = (message, type = 'info') => {
    if (!toastAvailable) {
      console.log(`[${type.toUpperCase()}] ${message}`);
      return;
    }

    try {
      if (type === 'success' && toast.success) {
        toast.success(message);
      } else if (type === 'error' && toast.error) {
        toast.error(message);
      } else if (toast.info) {
        toast.info(message);
      }
    } catch (error) {
      console.error('Error showing toast:', error);
      console.log(`[${type.toUpperCase()}] ${message}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const result = await resetPassword(email);
      
      if (result.success) {
        showToast('Email de restablecimiento enviado. Revisa tu bandeja de entrada.', 'success');
        setEmail('');
        onClose();
      } else {
        showToast(result.message || 'Error al enviar email de restablecimiento', 'error');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      showToast('Error inesperado. Por favor intenta nuevamente.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Restablecer Contraseña</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-body">
          <p>Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.</p>
          
          <div className="field">
            <label htmlFor="reset-email">Correo electrónico</label>
            <input
              id="reset-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="tu@email.com"
            />
          </div>
          
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar Email'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}