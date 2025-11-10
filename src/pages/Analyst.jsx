import { useEffect, useMemo, useState } from 'react';
import { StatCards } from '../components/StatCards.jsx';
import { fmtCOP } from '../utils/format.js';
import { watchQuotes } from '../services/quotes.js';

export default function Analyst() {
  // Datos en tiempo real desde Firestore
  const [quotes, setQuotes] = useState([]);
  const [selectedQuote, setSelectedQuote] = useState(null);

  useEffect(() => {
    const unsub = watchQuotes(setQuotes);
    return () => unsub();
  }, []);

  // Filtros controlados
  const [folio, setFolio] = useState('');
  const [minTotal, setMinTotal] = useState('');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');

  // Normaliza y aplica filtros
  const data = useMemo(() => {
    return quotes.map(c => ({
      ...c,
      fecha: c.createdAt?.toDate ? c.createdAt.toDate() : new Date()
    }));
  }, [quotes]);

  const items = useMemo(() => {
    return data
      .filter(c => (folio ? String(c.folio || '').toLowerCase().includes(folio.trim().toLowerCase()) : true))
      .filter(c => (minTotal ? Number(c.total || 0) >= Number(minTotal) : true))
      .filter(c => (desde ? c.fecha >= new Date(desde) : true))
      .filter(c => (hasta ? c.fecha <= new Date(hasta + 'T23:59:59') : true))
      .sort((a, b) => (b.fecha?.getTime() || 0) - (a.fecha?.getTime() || 0));
  }, [data, folio, minTotal, desde, hasta]);

  const suma = useMemo(() => items.reduce((a, c) => a + Number(c.total || 0), 0), [items]);

  const limpiar = () => { setFolio(''); setMinTotal(''); setDesde(''); setHasta(''); };

  return (
    <>
      <h1>Panel del analista</h1>
      <p>Las cotizaciones se muestran en tiempo real desde Firestore.</p>

      <section aria-labelledby="resumen-heading">
        <h2 id="resumen-heading">Resumen</h2>
        <StatCards
          total={items.length}
          suma={suma}
          filtro={folio || minTotal || desde || hasta ? 'Con filtros' : '—'}
        />
      </section>

      <section className="card" aria-labelledby="filtros-heading">
        <h2 id="filtros-heading">Filtros</h2>
        <form className="form" onSubmit={(e) => e.preventDefault()}>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="filtro-folio">Folio</label>
              <input
                id="filtro-folio"
                type="text"
                placeholder="Ej: Q-00021"
                value={folio}
                onChange={(e) => setFolio(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="min-total">Mínimo total (COP)</label>
              <input
                id="min-total"
                type="number"
                min="0"
                step="1000"
                value={minTotal}
                onChange={(e) => setMinTotal(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="desde">Desde (fecha)</label>
              <input
                id="desde"
                type="date"
                value={desde}
                onChange={(e) => setDesde(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="hasta">Hasta (fecha)</label>
              <input
                id="hasta"
                type="date"
                value={hasta}
                onChange={(e) => setHasta(e.target.value)}
              />
            </div>
          </div>
          <div className="actions">
            <button className="btn" type="button" onClick={limpiar}>Limpiar filtros</button>
          </div>
        </form>
      </section>

      <section aria-labelledby="tabla-heading" className="card">
        <h2 id="tabla-heading">Cotizaciones</h2>
        <div role="table" className="table" aria-label="Tabla de cotizaciones">
          <div className="table-head table-row">
            <span>Folio</span>
            <span>Proveedor</span>
            <span>Fecha</span>
            <span>Total (COP)</span>
          </div>
          <div className="table-body">
            {items.length === 0 ? (
              <div className="table-row">
                <span>Sin resultados</span><span></span><span></span><span></span>
              </div>
            ) : (
              items.map((c) => (
                <div className="table-row" key={c.id} onClick={() => setSelectedQuote(c)} style={{ cursor: 'pointer' }}>
                  <span>{c.folio || '-'}</span>
                  <span>{c.creadoPor || '-'}</span>
                  <span>{c.fecha ? c.fecha.toISOString().split('T')[0] : '-'}</span>
                  <span>{fmtCOP(c.total || 0)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {selectedQuote && (
        <section className="card" aria-labelledby="detalle-heading">
          <h2 id="detalle-heading">Detalle de cotización: {selectedQuote.folio}</h2>
          <div className="actions">
            <button className="btn" onClick={() => setSelectedQuote(null)}>Cerrar</button>
          </div>
          <div style={{ marginBottom: 16 }}>
            <p><strong>Proveedor:</strong> {selectedQuote.creadoPor || '-'}</p>
            <p><strong>Fecha:</strong> {selectedQuote.fecha ? selectedQuote.fecha.toISOString().split('T')[0] : '-'}</p>
            <p><strong>Total:</strong> {fmtCOP(selectedQuote.total || 0)}</p>
            {selectedQuote.meta && (
              <>
                <p><strong>Validez:</strong> {selectedQuote.meta.validezDias || '-'} días</p>
                <p><strong>Tiempo de entrega:</strong> {selectedQuote.meta.tiempoEntregaDias || '-'} días</p>
              </>
            )}
          </div>
          <h3>Items</h3>
          <div role="table" className="table" aria-label="Tabla de items de la cotización">
            <div className="table-head table-row">
              <span>Producto</span>
              <span>Cantidad</span>
              <span>Precio unitario</span>
              <span>Subtotal</span>
            </div>
            <div className="table-body">
              {selectedQuote.items && selectedQuote.items.length > 0 ? (
                selectedQuote.items.map((item, index) => (
                  <div className="table-row" key={index}>
                    <span>{item.producto || '-'}</span>
                    <span>{item.cantidad || 0}</span>
                    <span>{fmtCOP(item.valorUnitario || 0)}</span>
                    <span>{fmtCOP(item.subtotal || 0)}</span>
                  </div>
                ))
              ) : (
                <div className="table-row">
                  <span>Sin items</span><span></span><span></span><span></span>
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
