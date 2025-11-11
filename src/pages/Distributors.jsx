import { useEffect, useMemo, useState } from 'react';
import { loadSnacks } from '../services/themealdb.js';
import SnackCard from '../components/SnackCard.jsx';
import QuoteTable from '../components/QuoteTable.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { SkeletonGrid } from '../components/SkeletonLoader.jsx';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import { useForm } from '../hooks/useForm.js';
import { addQuote, watchQuotes, QUOTE_STATUS } from '../services/quotes.js';
import { sendQuoteEmail } from '../services/emailService.jsx';
import { generateQuotePDF } from '../services/pdfService.jsx';

export default function Distributors() {
  const toast = useToast();
  const { userProfile, user } = useAuth();
  
  // Catálogo cacheado
  const [snacks, setSnacks] = useLocalStorage('catalog_snacks', null);
  const [catalogLoading, setCatalogLoading] = useState(false);
  
  useEffect(() => {
    (async () => {
      if (snacks === null && !catalogLoading) {
        setCatalogLoading(true);
        try {
          const data = await loadSnacks();
          setSnacks(data);
        } catch (error) {
          console.error('Error loading snacks:', error);
          toast.error('Error al cargar el catálogo de productos');
        } finally {
          setCatalogLoading(false);
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snacks, catalogLoading, setSnacks, toast]);

  // Filas de la cotización (persisten entre recargas)
  const [rows, setRows] = useLocalStorage('quote_rows', []);

  // Cotizaciones previas
  const [quotes, setQuotes] = useState([]);
  const [quotesLoading, setQuotesLoading] = useState(true);
  
  useEffect(() => {
    // If user is not authenticated, stop loading and show empty state
    if (!user) {
      console.log('User not authenticated, stopping quotes loading');
      setQuotes([]);
      setQuotesLoading(false);
      return;
    }
    
    console.log('Setting up quotes watcher for user:', user.uid);
    
    // Set a timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      console.log('Quotes loading timeout reached, setting loading to false');
      setQuotesLoading(false);
    }, 5000); // 5 second timeout
    
    const unsub = watchQuotes((quotesData) => {
      console.log('Quotes loaded:', quotesData.length, 'quotes for user:', user.uid);
      setQuotes(quotesData || []);
      setQuotesLoading(false);
      clearTimeout(loadingTimeout);
    }, {
      userFilter: user?.uid // Only show quotes from current user
    });
    
    return () => {
      unsub();
      clearTimeout(loadingTimeout);
    };
  }, [user]);

  // Form con validación mejorada
  const {
    values, setValues, errors, touched,
    isSubmitting, submitError,
    handleChange, handleBlur, handleSubmit, reset
  } = useForm({
    initialValues: { folio: '', validez: '', entrega: '' },
    validate: (v) => {
      const e = {};
      if (!v.folio.trim()) e.folio = 'Requerido';
      if (!v.validez || Number(v.validez) < 1) e.validez = 'Debe ser ≥ 1';
      if (!v.entrega || Number(v.entrega) < 1) e.entrega = 'Debe ser ≥ 1';
      if (rows.length === 0) e.rows = 'Agregue al menos un producto';
      // valida filas
      rows.forEach((r, i) => {
        if (!r.nombre || !String(r.nombre).trim()) {
          e[`row_${i}_nombre`] = 'Nombre requerido';
        }
        if (!(Number(r.cantidad) > 0)) {
          e[`row_${i}_cantidad`] = 'Cantidad > 0';
        }
        if (!(Number(r.precio) >= 0)) {
          e[`row_${i}_precio`] = 'Precio ≥ 0';
        }
      });
      return e;
    },
    onSubmit: async (v) => {
      try {
        await addQuote({
          folio: v.folio,
          userProfile: userProfile || { displayName: 'Usuario Anónimo', email: user?.email || '' },
          items: rows,
          status: QUOTE_STATUS.DRAFT,
          meta: {
            validezDias: Number(v.validez) || null,
            tiempoEntregaDias: Number(v.entrega) || null
          }
        });
        setRows([]);
        reset();
        setValues({ folio: '', validez: '', entrega: '' });
        toast.success(`Cotización "${v.folio}" enviada exitosamente`);
      }
      catch (err) {
        toast.error(`Error al guardar: ${err.message}`);
      }
    }
  });

  const addFromCatalog = (name, price = 12000) => {
    setRows(prev => [...prev, { nombre: name, cantidad: 1, precio: price }]);
    toast.success(`"${name}" agregado a la cotización`);
  };

  const total = useMemo(
    () => rows.reduce((a, r) => a + (Number(r.cantidad) || 0) * (Number(r.precio) || 0), 0),
    [rows]
  );

  const limpiarTodo = () => {
    setRows([]);
    reset();
    setValues({ folio: '', validez: '', entrega: '' });
    toast.info('Formulario limpiado');
  };

  return (
    <div className="container">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="mb-2">Panel de Distribuidores</h1>
          <p className="text-secondary">Gestiona tus cotizaciones de loncheras nutritivas</p>
        </div>
        <div className="badge badge-info">
          {user?.email || 'Usuario'}
        </div>
      </div>

      {/* Product Catalog Section */}
      <section className="mb-12">
        <div className="card">
          <div className="card-header">
            <div className="card-icon">🛍️</div>
            <div>
              <h2 className="card-title" id="cat-heading">Catálogo de Productos</h2>
              <p className="card-subtitle">Selecciona productos y agrégalos a tu cotización</p>
            </div>
          </div>
          
          <div id="snacks-container" className="grid grid-4" aria-live="polite">
            {catalogLoading ? (
              <SkeletonGrid items={6} />
            ) : snacks === null ? (
              <div className="card" style={{ padding: '2rem', textAlign: 'center', gridColumn: '1 / -1' }}>
                <div className="loader" role="status" aria-label="Cargando catálogo..." />
                <p className="mt-4 text-muted">Cargando productos...</p>
              </div>
            ) : snacks.length === 0 ? (
              <div className="card" style={{ padding: '2rem', textAlign: 'center', gridColumn: '1 / -1' }}>
                <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>📦</div>
                <h3 className="mb-2">No se encontraron productos</h3>
                <p className="text-muted">El catálogo está vacío en este momento</p>
              </div>
            ) : (
              snacks.map((s, i) => (
                <div key={i} className="card card-interactive" style={{ textAlign: 'center' }}>
                  {s.img && (
                    <img 
                      src={s.img} 
                      alt={s.name} 
                      style={{ 
                        width: '100%', 
                        height: '150px', 
                        objectFit: 'cover', 
                        borderRadius: 'var(--radius-lg)',
                        marginBottom: 'var(--space-4)'
                      }}
                    />
                  )}
                  <h4 style={{ marginBottom: 'var(--space-2)' }}>{s.name}</h4>
                  <p className="text-sm text-muted mb-4">Postres nutritivos</p>
                  <p className="text-lg font-semibold text-accent mb-4">$12,000 COP</p>
                  <button 
                    className="btn btn-primary" 
                    onClick={() => addFromCatalog(s.name, 12000)}
                    style={{ width: '100%' }}
                  >
                    ➕ Agregar a cotización
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Quote Creation Form */}
      <section className="mb-12">
        <div className="card card-elevated">
          <div className="card-header">
            <div className="card-icon">📋</div>
            <div>
              <h2 className="card-title" id="cotizacion-heading">Crear Nueva Cotización</h2>
              <p className="card-subtitle">Completa los detalles de tu cotización</p>
            </div>
          </div>

          <form className="form" onSubmit={handleSubmit} aria-describedby="ayuda-cot" noValidate>
            {/* Quote Details */}
            <div className="form-grid">
              <div className="field">
                <label htmlFor="folio">Folio de Cotización</label>
                <input
                  id="folio" name="folio" type="text" placeholder="Q-00021"
                  value={values.folio} onChange={handleChange} onBlur={handleBlur}
                  aria-invalid={!!(touched.folio && errors.folio)}
                  aria-describedby={touched.folio && errors.folio ? "err-folio" : undefined}
                />
                {touched.folio && errors.folio && (
                  <small id="err-folio" className="field-error">{errors.folio}</small>
                )}
              </div>

              <div className="field">
                <label htmlFor="validez">Validez (días)</label>
                <input
                  id="validez" name="validez" type="number" min="1" step="1" placeholder="30"
                  value={values.validez} onChange={handleChange} onBlur={handleBlur}
                  aria-invalid={!!(touched.validez && errors.validez)}
                  aria-describedby={touched.validez && errors.validez ? "err-validez" : undefined}
                />
                {touched.validez && errors.validez && (
                  <small id="err-validez" className="field-error">{errors.validez}</small>
                )}
              </div>

              <div className="field">
                <label htmlFor="entrega">Tiempo de Entrega (días)</label>
                <input
                  id="entrega" name="entrega" type="number" min="1" step="1" placeholder="5"
                  value={values.entrega} onChange={handleChange} onBlur={handleBlur}
                  aria-invalid={!!(touched.entrega && errors.entrega)}
                  aria-describedby={touched.entrega && errors.entrega ? "err-entrega" : undefined}
                />
                {touched.entrega && errors.entrega && (
                  <small id="err-entrega" className="field-error">{errors.entrega}</small>
                )}
              </div>
            </div>

            {/* Products Table */}
            <QuoteTable rows={rows} setRows={setRows} />

            {errors.rows && (
              <div className="field-error text-center">{errors.rows}</div>
            )}

            {/* Form Actions */}
            <div className="flex justify-between items-center" style={{ marginTop: 'var(--space-6)' }}>
              <div className="flex gap-4">
                <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <div className="animate-pulse">⏳</div>
                      Enviando...
                    </>
                  ) : (
                    <>
                      📤 Enviar Cotización
                    </>
                  )}
                </button>
                <button className="btn btn-secondary" type="button" onClick={limpiarTodo} disabled={isSubmitting}>
                  🗑️ Limpiar Todo
                </button>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-muted">Total Estimado</div>
                <div className="text-2xl font-bold text-accent">
                  ${total.toLocaleString('es-CO')} COP
                </div>
              </div>
            </div>

            <p id="ayuda-cot" className="visualmente-hidden">
              Revise cantidades y precios antes de enviar.
            </p>
          </form>
        </div>
      </section>

      {/* Previous Quotes Section */}
      <section>
        <div className="card">
          <div className="card-header">
            <div className="card-icon">📊</div>
            <div>
              <h2 className="card-title" id="prev-quotes-heading">Mis Cotizaciones Anteriores</h2>
              <p className="card-subtitle">Historial de cotizaciones enviadas</p>
            </div>
          </div>
          
          {quotesLoading ? (
            <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
              <div className="animate-pulse">
                <div className="loader" role="status" aria-label="Cargando cotizaciones..." />
              </div>
              <p className="mt-4 text-muted">Cargando cotizaciones...</p>
            </div>
          ) : quotes.length === 0 ? (
            <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
              <div style={{ fontSize: '4rem', marginBottom: 'var(--space-4)' }}>📝</div>
              <h3 style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-2)' }}>No hay cotizaciones previas</h3>
              <p style={{ color: 'var(--text-muted)' }}>
                {user ? 
                  'Aún no has creado ninguna cotización. ¡Comienza creando tu primera cotización usando el formulario de arriba!' : 
                  'Inicia sesión para ver tus cotizaciones y crear nuevas.'
                }
              </p>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead className="table-head">
                  <tr>
                    <th>Folio</th>
                    <th>Email del Usuario</th>
                    <th>Fecha de Creación</th>
                    <th>Total</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody className="table-body">
                  {quotes.map(q => (
                    <tr key={q.id}>
                      <td>
                        <span className="font-semibold">{q.folio}</span>
                      </td>
                      <td>
                        <div className="text-sm">
                          {q.creadoPorEmail || q.creadoPor || 'Email no disponible'}
                        </div>
                      </td>
                      <td>
                        {q.createdAt?.toDate?.() 
                          ? q.createdAt.toDate().toLocaleDateString('es-CO', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })
                          : '-'
                        }
                      </td>
                      <td>
                        <span className="font-semibold text-accent">
                          ${q.total?.toLocaleString('es-CO') ?? 0} COP
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${
                          q.status === 'approved' ? 'badge-success' :
                          q.status === 'rejected' ? 'badge-error' :
                          q.status === 'sent' ? 'badge-info' : 'badge-secondary'
                        }`}>
                          {q.status === 'approved' ? '✅ Aprobada' :
                           q.status === 'rejected' ? '❌ Rechazada' :
                           q.status === 'sent' ? '📤 Enviada' : '📝 Borrador'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
