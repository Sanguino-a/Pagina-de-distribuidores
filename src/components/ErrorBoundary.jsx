import React from 'react';
import { useToast } from '../context/ToastContext';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true,
      error,
      errorId: Date.now() + Math.random()
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
    
    // Update state with error details
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Report error to external service (if available)
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    });
    
    // Call optional onReset callback
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          errorId={this.state.errorId}
          onReset={this.handleReset}
          onReload={this.handleReload}
          fallback={this.props.fallback}
        />
      );
    }

    return this.props.children;
  }
}

function ErrorFallback({ 
  error, 
  errorInfo, 
  errorId, 
  onReset, 
  onReload, 
  fallback 
}) {
  const toast = useToast();
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Use custom fallback if provided
  if (fallback) {
    return typeof fallback === 'function' 
      ? fallback({ error, errorInfo, errorId, onReset, onReload })
      : fallback;
  }

  const handleReportError = () => {
    const errorReport = {
      errorId,
      message: error?.message || 'Unknown error',
      stack: error?.stack || 'No stack trace available',
      errorInfo: errorInfo,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: localStorage.getItem('userId') || 'anonymous'
    };
    
    // Log to console in development
    if (isDevelopment) {
      console.log('Error Report:', errorReport);
    }
    
    // In production, you would send this to your error reporting service
    try {
      localStorage.setItem(`errorReport_${errorId}`, JSON.stringify(errorReport));
      toast.error('Error reportado para revisión técnica');
    } catch (storageError) {
      console.error('Failed to store error report:', storageError);
    }
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="container" style={{ padding: '2rem' }}>
      <div 
        className="card" 
        style={{ 
          maxWidth: '600px', 
          margin: '0 auto', 
          textAlign: 'center',
          borderColor: 'var(--danger)',
          borderWidth: '2px'
        }}
      >
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
          🚨
        </div>
        
        <h1 style={{ color: 'var(--danger)', marginBottom: '1rem' }}>
          ¡Algo salió mal!
        </h1>
        
        <p style={{ marginBottom: '1.5rem', color: 'var(--muted)' }}>
          Ha ocurrido un error inesperado. Nuestro equipo ha sido notificado y está trabajando para solucionarlo.
        </p>
        
        <div className="actions" style={{ justifyContent: 'center', gap: '1rem' }}>
          <button 
            className="btn btn-primary" 
            onClick={onReset}
            aria-label="Intentar de nuevo"
          >
            🔄 Intentar de nuevo
          </button>
          
          <button 
            className="btn" 
            onClick={onReload}
            aria-label="Recargar página"
          >
            ⏳ Recargar página
          </button>
          
          <button 
            className="btn" 
            onClick={handleGoHome}
            aria-label="Ir al inicio"
          >
            🏠 Ir al inicio
          </button>
        </div>
        
        {isDevelopment && error && (
          <details 
            style={{ 
              marginTop: '2rem', 
              textAlign: 'left',
              background: 'var(--surface)',
              padding: '1rem',
              borderRadius: '.5rem',
              fontSize: '.9rem'
            }}
          >
            <summary 
              style={{ 
                cursor: 'pointer', 
                marginBottom: '1rem',
                color: 'var(--accent)',
                fontWeight: 'bold'
              }}
            >
              🔧 Detalles técnicos del error (Solo desarrollo)
            </summary>
            <div>
              <strong>Error ID:</strong> {errorId}<br />
              <strong>Error:</strong>
              <pre style={{ 
                whiteSpace: 'pre-wrap', 
                fontSize: '.8rem',
                background: 'var(--bg)',
                padding: '1rem',
                borderRadius: '.25rem',
                margin: '.5rem 0',
                maxHeight: '200px',
                overflow: 'auto',
                border: '1px solid var(--surface)'
              }}>
                {error.message}
              </pre>
              
              {error.stack && (
                <>
                  <strong>Stack Trace:</strong>
                  <pre style={{ 
                    whiteSpace: 'pre-wrap', 
                    fontSize: '.7rem',
                    background: 'var(--bg)',
                    padding: '1rem',
                    borderRadius: '.25rem',
                    margin: '.5rem 0',
                    maxHeight: '200px',
                    overflow: 'auto',
                    border: '1px solid var(--surface)'
                  }}>
                    {error.stack}
                  </pre>
                </>
              )}
              
              {errorInfo && errorInfo.componentStack && (
                <>
                  <strong>Component Stack:</strong>
                  <pre style={{ 
                    whiteSpace: 'pre-wrap', 
                    fontSize: '.7rem',
                    background: 'var(--bg)',
                    padding: '1rem',
                    borderRadius: '.25rem',
                    margin: '.5rem 0',
                    maxHeight: '200px',
                    overflow: 'auto',
                    border: '1px solid var(--surface)'
                  }}>
                    {errorInfo.componentStack}
                  </pre>
                </>
              )}
            </div>
          </details>
        )}
        
        <div style={{ 
          marginTop: '1.5rem', 
          fontSize: '.8rem', 
          color: 'var(--muted)' 
        }}>
          Si el problema persiste, por favor contacta a nuestro soporte técnico.
        </div>
      </div>
    </div>
  );
}

export default ErrorBoundary;