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
    <>
      <section className="card flow" aria-labelledby="cat-heading">
        <h2 id="cat-heading">Catálogo (API)</h2>
        <p>Elige productos y agrégalos a tu cotización.</p>
        <div id="snacks-container" className="snack-grid" aria-live="polite">
          {catalogLoading ? (
            <SkeletonGrid items={6} />
          ) : snacks === null ? (
            <div className="loader" role="status" aria-label="Cargando catálogo..." />
          ) : snacks.length === 0 ? (
            <p>No se encontraron productos.</p>
          ) : (
            snacks.map((s, i) => (
              <SnackCard
                key={i}
                name={s.name}
                img={s.img}
                onAdd={() => addFromCatalog(s.name, 12000)}
              />
            ))
          )}
        </div>
      </section>

      <section aria-labelledby="cotizacion-heading">
        <h2 id="cotizacion-heading">Nueva cotización</h2>
        <p>Agregue productos y establezca cantidades y precios unitarios.</p>

        <form className="card form" onSubmit={handleSubmit} aria-describedby="ayuda-cot" noValidate>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="folio">Folio</label>
              <input
                id="folio" name="folio" type="text" placeholder="Q-00021"
                value={values.folio} onChange={handleChange} onBlur={handleBlur}
                aria-invalid={!!(touched.folio && errors.folio)}
                aria-describedby={touched.folio && errors.folio ? "err-folio" : undefined}
              />
              {touched.folio && errors.folio && (
                <small id="err-folio" style={{ color: 'var(--danger)' }}>{errors.folio}</small>
              )}
            </div>

            <div className="field">
              <label htmlFor="validez">Validez (días)</label>
              <input
                id="validez" name="validez" type="number" min="1" step="1"
                value={values.validez} onChange={handleChange} onBlur={handleBlur}
                aria-invalid={!!(touched.validez && errors.validez)}
                aria-describedby={touched.validez && errors.validez ? "err-validez" : undefined}
              />
              {touched.validez && errors.validez && (
                <small id="err-validez" style={{ color: 'var(--danger)' }}>{errors.validez}</small>
              )}
            </div>

            <div className="field">
              <label htmlFor="entrega">Tiempo de entrega (días)</label>
              <input
                id="entrega" name="entrega" type="number" min="1" step="1"
                value={values.entrega} onChange={handleChange} onBlur={handleBlur}
                aria-invalid={!!(touched.entrega && errors.entrega)}
                aria-describedby={touched.entrega && errors.entrega ? "err-entrega" : undefined}
              />
              {touched.entrega && errors.entrega && (
                <small id="err-entrega" style={{ color: 'var(--danger)' }}>{errors.entrega}</small>
              )}
            </div>
          </div>

          
          <QuoteTable rows={rows} setRows={setRows} />

          {errors.rows && <small style={{ color: 'var(--danger)' }}>{errors.rows}</small>}

          <div className="actions">
            <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Enviando…' : 'Enviar a Firebase'}
            </button>
            <button className="btn" type="button" onClick={limpiarTodo} disabled={isSubmitting}>
              Limpiar
            </button>
            <span style={{ marginLeft: 'auto', opacity: .8 }}>
              Total: {total.toLocaleString('es-CO')}
            </span>
          </div>

          <p id="ayuda-cot" className="visualmente-hidden">
            Revise cantidades y precios antes de enviar.
          </p>
        </form>
      </section>

      {/* Cotizaciones previas */}
      <section aria-labelledby="prev-quotes-heading">
        <h2 id="prev-quotes-heading">Cotizaciones previas</h2>
        {quotesLoading ? (
          <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
            <div className="loader" role="status" aria-label="Cargando cotizaciones..." />
          </div>
        ) : quotes.length === 0 ? (
          <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
            <h3 style={{ color: 'var(--muted)', marginBottom: '0.5rem' }}>No hay cotizaciones previas</h3>
            <p style={{ color: 'var(--muted)' }}>
              {user ? 'Aún no has creado ninguna cotización. ¡Comienza creando tu primera cotización!' : 'Inicia sesión para ver tus cotizaciones.'}
            </p>
          </div>
        ) : (
          <table className="card" style={{ width: '100%', marginBottom: 24 }}>
            <thead>
              <tr>
                <th>Folio</th>
                <th>Creado por</th>
                <th>Fecha</th>
                <th>Total</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {quotes.map(q => (
                <tr key={q.id}>
                  <td>{q.folio}</td>
                  <td>{q.creadoPorEmail || q.creadoPor || 'Email no disponible'}</td>
                  <td>
                    {q.createdAt?.toDate?.()
                      ? q.createdAt.toDate().toLocaleDateString('es-CO')
                      : '-'}
                  </td>
                  <td>${q.total?.toLocaleString('es-CO') ?? 0}</td>
                  <td>
                    <span style={{
                      background: q.status === 'approved' ? '#10b981' :
                                 q.status === 'rejected' ? '#ef4444' :
                                 q.status === 'sent' ? '#3b82f6' : '#6b7280',
                      color: 'white',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '0.5rem',
                      fontSize: '0.8rem'
                    }}>
                      {q.status || 'draft'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  );
}
