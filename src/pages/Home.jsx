import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <section className="hero">
      <h1>Portal de distribuidores</h1>
      <p>Conecta con colegios y empresas. Regístrate y crea cotizaciones de <strong>loncheras nutritivas</strong> con entrega a domicilio.</p>
      <p><Link className="btn btn-primary" to="/distribuidores">Comenzar</Link></p>
      <section className="container flow">
        <h2>¿Qué incluye?</h2>
        <div className="grid-3">
          <div className="card">
            <h3>Navegación</h3>
            <p>Enlaces entre Inicio, Distribuidores, Analista, Login y Registro.</p>
          </div>
          <div className="card">
            <h3>API pública</h3>
            <p>Catálogo cargado desde TheMealDB (postres) como demo.</p>
          </div>
          <div className="card">
            <h3>Sin backend</h3>
            <p>No requiere Firebase ni autenticación: todo es local.</p>
          </div>
        </div>
      </section>
    </section>
  )
}