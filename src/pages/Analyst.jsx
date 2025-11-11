import { useEffect, useMemo, useState } from 'react';
import { StatCards } from '../components/StatCards.jsx';
import { fmtCOP } from '../utils/format.js';
import { watchQuotes } from '../services/quotes.js';
import { useAuth } from '../context/AuthContext.jsx';
import AnalystQuoteActions from '../components/AnalystQuoteActions.jsx';

export default function Analyst() {
  // Auth context for user profile
  const { userProfile } = useAuth();
  
  // Datos en tiempo real desde Firestore
  const [quotes, setQuotes] = useState([]);
  const [selectedQuote, setSelectedQuote] = useState(null);

  useEffect(() => {
    const unsub = watchQuotes(setQuotes);
    return () => unsub();
  }, []);

  // === Filtros avanzados ===
  // Búsqueda de texto
  const [folioSearch, setFolioSearch] = useState('');
  const [providerSearch, setProviderSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  
  // Filtros de rango
  const [minTotal, setMinTotal] = useState('');
  const [maxTotal, setMaxTotal] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [validityMin, setValidityMin] = useState('');
  const [validityMax, setValidityMax] = useState('');
  const [deliveryMin, setDeliveryMin] = useState('');
  const [deliveryMax, setDeliveryMax] = useState('');
  
  // Filtros de estado
  const [statusFilter, setStatusFilter] = useState('');
  
  // === Opciones de ordenamiento ===
  const [sortField, setSortField] = useState('fecha');
  const [sortDirection, setSortDirection] = useState('desc');
  
  // === Normalización de datos ===
  const data = useMemo(() => {
    return quotes.map(quote => ({
      ...quote,
      fecha: quote.createdAt?.toDate ? quote.createdAt.toDate() : new Date(),
      status: quote.status || 'draft',
      validityDays: quote.meta?.validezDias || 0,
      deliveryDays: quote.meta?.tiempoEntregaDias || 0
    }));
  }, [quotes]);
  
  // === Aplicar filtros y ordenamiento ===
  const filteredQuotes = useMemo(() => {
    let filtered = data;
    
    // Filtros de búsqueda de texto
    if (folioSearch) {
      filtered = filtered.filter(q => 
        String(q.folio || '').toLowerCase().includes(folioSearch.trim().toLowerCase())
      );
    }
    
    if (providerSearch) {
      filtered = filtered.filter(q =>
        String(q.creadoPorEmail || q.creadoPor || '').toLowerCase().includes(providerSearch.trim().toLowerCase())
      );
    }
    
    if (productSearch) {
      filtered = filtered.filter(q => 
        q.items && q.items.some(item => 
          String(item.producto || '').toLowerCase().includes(productSearch.trim().toLowerCase())
        )
      );
    }
    
    // Filtros de rango numérico
    if (minTotal) {
      filtered = filtered.filter(q => Number(q.total || 0) >= Number(minTotal));
    }
    
    if (maxTotal) {
      filtered = filtered.filter(q => Number(q.total || 0) <= Number(maxTotal));
    }
    
    if (validityMin) {
      filtered = filtered.filter(q => q.validityDays >= Number(validityMin));
    }
    
    if (validityMax) {
      filtered = filtered.filter(q => q.validityDays <= Number(validityMax));
    }
    
    if (deliveryMin) {
      filtered = filtered.filter(q => q.deliveryDays >= Number(deliveryMin));
    }
    
    if (deliveryMax) {
      filtered = filtered.filter(q => q.deliveryDays <= Number(deliveryMax));
    }
    
    // Filtros de fecha
    if (dateFrom) {
      filtered = filtered.filter(q => q.fecha >= new Date(dateFrom));
    }
    
    if (dateTo) {
      filtered = filtered.filter(q => q.fecha <= new Date(dateTo + 'T23:59:59'));
    }
    
    // Filtro de estado
    if (statusFilter) {
      filtered = filtered.filter(q => q.status === statusFilter);
    }
    
    // Ordenamiento
    filtered.sort((a, b) => {
      let aVal, bVal;
      
      switch (sortField) {
        case 'folio':
          aVal = String(a.folio || '').toLowerCase();
          bVal = String(b.folio || '').toLowerCase();
          break;
        case 'total':
          aVal = Number(a.total || 0);
          bVal = Number(b.total || 0);
          break;
        case 'fecha':
          aVal = a.fecha?.getTime() || 0;
          bVal = b.fecha?.getTime() || 0;
          break;
        case 'proveedor':
          aVal = String(a.creadoPorEmail || a.creadoPor || '').toLowerCase();
          bVal = String(b.creadoPorEmail || b.creadoPor || '').toLowerCase();
          break;
        case 'status':
          aVal = String(a.status || '').toLowerCase();
          bVal = String(b.status || '').toLowerCase();
          break;
        default:
          aVal = a.fecha?.getTime() || 0;
          bVal = b.fecha?.getTime() || 0;
      }
      
      if (sortDirection === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
    });
    
    return filtered;
  }, [
    data, 
    folioSearch, 
    providerSearch, 
    productSearch,
    minTotal, 
    maxTotal, 
    validityMin, 
    validityMax, 
    deliveryMin, 
    deliveryMax,
    dateFrom, 
    dateTo, 
    statusFilter,
    sortField, 
    sortDirection
  ]);
  
  // === Estadísticas mejoradas ===
  const analytics = useMemo(() => {
    const totalQuotes = filteredQuotes.length;
    const totalSum = filteredQuotes.reduce((sum, q) => sum + Number(q.total || 0), 0);
    const average = totalQuotes > 0 ? totalSum / totalQuotes : 0;
    const maxValue = filteredQuotes.length > 0 
      ? Math.max(...filteredQuotes.map(q => Number(q.total || 0)))
      : 0;
    const minValue = filteredQuotes.length > 0
      ? Math.min(...filteredQuotes.map(q => Number(q.total || 0)))
      : 0;
    
    return {
      totalQuotes,
      totalSum,
      average,
      maxValue,
      minValue
    };
  }, [filteredQuotes]);
  
  // === Manejo de ordenamiento ===
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };
  
  // === Limpiar filtros ===
  const clearAllFilters = () => {
    setFolioSearch('');
    setProviderSearch('');
    setProductSearch('');
    setMinTotal('');
    setMaxTotal('');
    setDateFrom('');
    setDateTo('');
    setValidityMin('');
    setValidityMax('');
    setDeliveryMin('');
    setDeliveryMax('');
    setStatusFilter('');
  };
  
  // === Manejo de cambios de estado por analista ===
  const handleStatusUpdate = (newStatus, quoteId) => {
    setQuotes(prevQuotes =>
      prevQuotes.map(quote =>
        quote.id === quoteId
          ? { ...quote, status: newStatus }
          : quote
      )
    );
    // Close modal if the updated quote was selected
    if (selectedQuote?.id === quoteId) {
      setSelectedQuote(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };
  
  // === Manejo de eliminación de cotizaciones ===
  const handleQuoteDeleted = (quoteId) => {
    setQuotes(prevQuotes =>
      prevQuotes.filter(quote => quote.id !== quoteId)
    );
    // Close modal if the deleted quote was selected
    if (selectedQuote?.id === quoteId) {
      setSelectedQuote(null);
    }
  };
  
  // === Exportar CSV ===
  const exportToCSV = () => {
    const headers = [
      'Folio',
      'Proveedor',
      'Fecha',
      'Total (COP)',
      'Status',
      'Validez (días)',
      'Tiempo Entrega (días)',
      'Items'
    ];
    
    const csvContent = [
      headers.join(','),
      ...filteredQuotes.map(q => [
        q.folio || '',
        q.creadoPorEmail || q.creadoPor || '',
        q.fecha ? q.fecha.toISOString().split('T')[0] : '',
        q.total || 0,
        q.status || '',
        q.validityDays || 0,
        q.deliveryDays || 0,
        q.items ? q.items.length : 0
      ].map(field => `"${field}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `cotizaciones_analisis_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // === Estados únicos para filtros de dropdown ===
  const availableStatuses = useMemo(() => {
    const statuses = [...new Set(data.map(q => q.status).filter(Boolean))];
    return statuses.sort();
  }, [data]);
  
  // === Count de filtros activos ===
  const activeFiltersCount = [
    folioSearch, providerSearch, productSearch,
    minTotal, maxTotal, dateFrom, dateTo,
    validityMin, validityMax, deliveryMin, deliveryMax,
    statusFilter
  ].filter(Boolean).length;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1>Panel del analista</h1>
          <p>Análisis completo de cotizaciones con filtros avanzados</p>
        </div>
        <button 
          className="export-button" 
          onClick={exportToCSV}
          disabled={filteredQuotes.length === 0}
        >
          📊 Exportar CSV
        </button>
      </div>

      {/* Tarjetas de estadísticas mejoradas */}
      <div className="analytics-cards">
        <div className="analytics-card">
          <span className="value">{analytics.totalQuotes}</span>
          <span className="label">Cotizaciones</span>
        </div>
        <div className="analytics-card">
          <span className="value">{fmtCOP(analytics.totalSum)}</span>
          <span className="label">Total Sumado</span>
        </div>
        <div className="analytics-card">
          <span className="value">{fmtCOP(analytics.average)}</span>
          <span className="label">Promedio</span>
        </div>
        <div className="analytics-card">
          <span className="value">{fmtCOP(analytics.maxValue)}</span>
          <span className="label">Mayor Valor</span>
        </div>
        <div className="analytics-card">
          <span className="value">{fmtCOP(analytics.minValue)}</span>
          <span className="label">Menor Valor</span>
        </div>
      </div>
      
      {/* Resumen de filtros activos */}
      {activeFiltersCount > 0 && (
        <div className="filter-summary">
          <strong>{activeFiltersCount} filtro{activeFiltersCount !== 1 ? 's' : ''} activo{activeFiltersCount !== 1 ? 's' : ''} | </strong>
          <span>Mostrando {filteredQuotes.length} de {data.length} cotizaciones</span>
        </div>
      )}

      {/* Filtros avanzados */}
      <section className="advanced-filters" aria-labelledby="filtros-heading">
        <h2 id="filtros-heading">Filtros Avanzados</h2>
        
        {/* Filtros de búsqueda de texto */}
        <div className="filter-group">
          <h4>🔍 Búsqueda de Texto</h4>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="folio-search">Buscar por Folio</label>
              <input
                id="folio-search"
                type="text"
                placeholder="Ej: Q-00021"
                value={folioSearch}
                onChange={(e) => setFolioSearch(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="provider-search">Buscar por Proveedor</label>
              <input
                id="provider-search"
                type="text"
                placeholder="Nombre del proveedor"
                value={providerSearch}
                onChange={(e) => setProviderSearch(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="product-search">Buscar por Producto</label>
              <input
                id="product-search"
                type="text"
                placeholder="Nombre del producto"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Filtros de rango numérico */}
        <div className="filter-group">
          <h4>💰 Rangos de Valores</h4>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="min-total">Total Mínimo (COP)</label>
              <input
                id="min-total"
                type="number"
                min="0"
                step="1000"
                placeholder="0"
                value={minTotal}
                onChange={(e) => setMinTotal(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="max-total">Total Máximo (COP)</label>
              <input
                id="max-total"
                type="number"
                min="0"
                step="1000"
                placeholder="Sin límite"
                value={maxTotal}
                onChange={(e) => setMaxTotal(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Filtros de fecha */}
        <div className="filter-group">
          <h4>📅 Rangos de Fecha</h4>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="date-from">Desde</label>
              <input
                id="date-from"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="date-to">Hasta</label>
              <input
                id="date-to"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Filtros de validez y entrega */}
        <div className="filter-group">
          <h4>⏰ Validez y Entrega</h4>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="validity-min">Validez Mínima (días)</label>
              <input
                id="validity-min"
                type="number"
                min="0"
                placeholder="0"
                value={validityMin}
                onChange={(e) => setValidityMin(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="validity-max">Validez Máxima (días)</label>
              <input
                id="validity-max"
                type="number"
                min="0"
                placeholder="Sin límite"
                value={validityMax}
                onChange={(e) => setValidityMax(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="delivery-min">Entrega Mínima (días)</label>
              <input
                id="delivery-min"
                type="number"
                min="0"
                placeholder="0"
                value={deliveryMin}
                onChange={(e) => setDeliveryMin(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="delivery-max">Entrega Máxima (días)</label>
              <input
                id="delivery-max"
                type="number"
                min="0"
                placeholder="Sin límite"
                value={deliveryMax}
                onChange={(e) => setDeliveryMax(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Filtro de estado */}
        <div className="filter-group">
          <h4>📋 Estado de Cotización</h4>
          <div className="field">
            <label htmlFor="status-filter">Estado</label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Todos los estados</option>
              {availableStatuses.map(status => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="actions">
          <button 
            className="btn btn-secondary" 
            type="button" 
            onClick={clearAllFilters}
            disabled={activeFiltersCount === 0}
          >
            🗑️ Limpiar Filtros ({activeFiltersCount})
          </button>
        </div>
      </section>

      {/* Tabla mejorada con ordenamiento */}
      <section className="enhanced-table" aria-labelledby="tabla-heading">
        <h2 id="tabla-heading">
          Cotizaciones ({filteredQuotes.length})
          {activeFiltersCount > 0 && (
            <span className="active-filter">Con filtros</span>
          )}
        </h2>
        
        <div role="table" className="table" aria-label="Tabla de cotizaciones">
          <div className="table-head table-row">
            <span 
              className={`sortable-header ${sortField === 'folio' ? `sort-${sortDirection}` : ''}`}
              onClick={() => handleSort('folio')}
            >
              Folio
            </span>
            <span 
              className={`sortable-header ${sortField === 'proveedor' ? `sort-${sortDirection}` : ''}`}
              onClick={() => handleSort('proveedor')}
            >
              Proveedor
            </span>
            <span 
              className={`sortable-header ${sortField === 'fecha' ? `sort-${sortDirection}` : ''}`}
              onClick={() => handleSort('fecha')}
            >
              Fecha
            </span>
            <span 
              className={`sortable-header ${sortField === 'total' ? `sort-${sortDirection}` : ''}`}
              onClick={() => handleSort('total')}
            >
              Total (COP)
            </span>
            <span 
              className={`sortable-header ${sortField === 'status' ? `sort-${sortDirection}` : ''}`}
              onClick={() => handleSort('status')}
            >
              Estado
            </span>
          </div>
          <div className="table-body">
            {filteredQuotes.length === 0 ? (
              <div className="table-row">
                <span>Sin resultados</span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
              </div>
            ) : (
              filteredQuotes.map((c) => (
                <div 
                  className="table-row" 
                  key={c.id} 
                  onClick={() => setSelectedQuote(c)} 
                  style={{ cursor: 'pointer' }}
                >
                  <span>{c.folio || '-'}</span>
                  <span>{c.creadoPorEmail || c.creadoPor || '-'}</span>
                  <span>{c.fecha ? c.fecha.toISOString().split('T')[0] : '-'}</span>
                  <span>{fmtCOP(c.total || 0)}</span>
                  <span>
                    <span className={`status-indicator status-${c.status || 'unknown'}`}>
                      {c.status ? c.status.charAt(0).toUpperCase() + c.status.slice(1) : 'N/A'}
                    </span>
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Modal de detalle mejorado */}
      {selectedQuote && (
        <section className="card" aria-labelledby="detalle-heading">
          <h2 id="detalle-heading">Detalle de cotización: {selectedQuote.folio}</h2>
          <div className="actions">
            <button className="btn" onClick={() => setSelectedQuote(null)}>Cerrar</button>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <div className="stat-grid">
              <div>
                <p><strong>Proveedor:</strong> {selectedQuote.creadoPorEmail || selectedQuote.creadoPor || '-'}</p>
                <p><strong>Fecha:</strong> {selectedQuote.fecha ? selectedQuote.fecha.toISOString().split('T')[0] : '-'}</p>
                <p><strong>Total:</strong> {fmtCOP(selectedQuote.total || 0)}</p>
              </div>
              <div>
                <p><strong>Estado:</strong> <span className={`status-indicator status-${selectedQuote.status || 'unknown'}`}>{selectedQuote.status || 'N/A'}</span></p>
                <p><strong>Validez:</strong> {selectedQuote.validityDays || '-'} días</p>
                <p><strong>Tiempo de entrega:</strong> {selectedQuote.deliveryDays || '-'} días</p>
                {selectedQuote.creadoPorEmail && (
                  <p><strong>Email:</strong> {selectedQuote.creadoPorEmail}</p>
                )}
              </div>
            </div>
          </div>
          
          <h3>Items ({selectedQuote.items ? selectedQuote.items.length : 0})</h3>
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
          
          {/* Acciones específicas para analistas */}
          <AnalystQuoteActions
            quote={selectedQuote}
            userProfile={userProfile}
            onStatusUpdate={handleStatusUpdate}
            onQuoteDeleted={handleQuoteDeleted}
          />
        </section>
      )}
    </>
  );
}
