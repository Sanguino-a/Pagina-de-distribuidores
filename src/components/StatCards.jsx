export function StatCards({ total=0, suma=0, filtro='—' }) {
  const fmtCOP = (n) => new Intl.NumberFormat('es-CO', { style:'currency', currency:'COP', maximumFractionDigits:0 }).format(Number(n||0))
  return (
    <div className="stats-grid">
      <div className="stat-card new">
        <span className="stat-value">{total}</span>
        <span className="stat-label">Cotizaciones</span>
      </div>
      <div className="stat-card review">
        <span className="stat-value">{fmtCOP(suma)}</span>
        <span className="stat-label">Suma total (COP)</span>
      </div>
      <div className="stat-card approved">
        <span className="stat-value">{filtro}</span>
        <span className="stat-label">Filtro actual</span>
      </div>
    </div>
  )
}