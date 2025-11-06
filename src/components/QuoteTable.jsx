import { useMemo } from 'react'

function parseNum(v){ const n = Number(v); return Number.isFinite(n)? n: 0 }

export default function QuoteTable({ rows, setRows }) {
  const total = useMemo(() => rows.reduce((a, r) => a + (parseNum(r.cantidad)*parseNum(r.precio)), 0), [rows])

  const updateRow = (idx, key, value) => {
    const next = rows.map((r,i) => i===idx ? { ...r, [key]: value } : r)
    setRows(next)
  }

  const addRow = () => setRows(prev => [...prev, { nombre:'Nuevo producto', cantidad:1, precio:0 }])
  const delRow = () => setRows(prev => prev.length ? prev.slice(0, -1) : prev)

  return (
    <fieldset className="card stack" aria-describedby="ayuda-cot">
      <div role="table" aria-label="Productos cotizados" className="table">
        <div className="table-head table-row">
          <span>Producto</span>
          <span>Cantidad</span>
          <span>Precio unitario (COP)</span>
          <span>Subtotal</span>
        </div>
        <div className="table-body">
          {rows.map((r, idx) => {
            const subtotal = parseNum(r.cantidad)*parseNum(r.precio)
            return (
              <div className="table-row" key={idx}>
                <span><input type="text" value={r.nombre} onChange={e=>updateRow(idx,'nombre', e.target.value)} placeholder="Producto" /></span>
                <span><input type="number" min="1" step="1" value={r.cantidad} onChange={e=>updateRow(idx,'cantidad', e.target.value)} /></span>
                <span><input type="number" min="0" step="100" value={r.precio} onChange={e=>updateRow(idx,'precio', e.target.value)} /></span>
                <span><output>{subtotal}</output></span>
              </div>
            )
          })}
        </div>
        <div className="table-row total-row">
          <span>Total estimado</span><span></span><span></span>
          <span><output id="total-general">{total}</output></span>
        </div>
      </div>
      <div className="actions">
        <button className="btn" type="button" onClick={addRow}>Añadir fila</button>
        <button className="btn" type="button" onClick={delRow}>Eliminar última fila</button>
      </div>
    </fieldset>
  )
}