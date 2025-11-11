import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <>
      {/* Hero Section - Professional Design */}
      <section className="hero">
        <div className="container" style={{
          textAlign: 'center',
          maxWidth: '800px',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <div className="badge badge-info" style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--text-sm)' }}>
            🚀 Plataforma B2B para Loncheras Nutritivas
          </div>
          <h1 style={{ marginBottom: 'var(--space-6)' }}>Portal de Distribuidores</h1>
          
          <div align="center" style={{
            fontSize: 'var(--text-xl)',
            marginBottom: 'var(--space-8)',
            color: 'var(--text-secondary)',
            lineHeight: '1.6'
          }}>
            Conecta con colegios y empresas. Crea cotizaciones de
            <strong style={{ color: 'var(--accent)' }}> loncheras nutritivas</strong>
            {' '}con entrega a domicilio de forma profesional.
          </div>
          
          <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link className="btn btn-primary" to="/distribuidores">
              🚀 Comenzar ahora
            </Link>
            <Link className="btn btn-secondary" to="/registro">
              📝 Registrarse
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section - Professional Cards */}
      <section className="container">
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
          <h2 style={{ marginBottom: 'var(--space-4)' }}>¿Qué incluye la plataforma?</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
            Una solución completa para distribuidores de loncheras con herramientas profesionales
          </p>
        </div>
        
        <div className="grid grid-3">
          <div className="card card-interactive">
            <div className="card-header">
              <div className="card-icon">🧭</div>
              <div>
                <h3 className="card-title">Navegación Intuitiva</h3>
                <p className="card-subtitle">Experiencia de usuario optimizada</p>
              </div>
            </div>
            <p>Enlaces organizados entre Inicio, Distribuidores, Analista, Login y Registro para una navegación fluida y profesional.</p>
          </div>
          
          <div className="card card-interactive">
            <div className="card-header">
              <div className="card-icon">📡</div>
              <div>
                <h3 className="card-title">API Integrada</h3>
                <p className="card-subtitle">Catálogo dinámico en tiempo real</p>
              </div>
            </div>
            <p>Catálogo cargado desde TheMealDB con productos de postres como demostración, conectando con APIs públicas.</p>
          </div>
          
          <div className="card card-interactive">
            <div className="card-header">
              <div className="card-icon">🔥</div>
              <div>
                <h3 className="card-title">Backend Potente</h3>
                <p className="card-subtitle">Firebase + Autenticación</p>
              </div>
            </div>
            <p>Integración completa con Firebase para autenticación segura, base de datos en tiempo real y gestión de cotizaciones.</p>
          </div>
        </div>
      </section>

      {/* Benefits Section - Additional Value Props */}
      <section className="container" style={{ marginTop: 'var(--space-16)' }}>
        <div className="card card-elevated" style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
          <h2 style={{ marginBottom: 'var(--space-6)' }}>¿Por qué elegir Loncheras+?</h2>
          
          <div className="grid grid-2" style={{ textAlign: 'left' }}>
            <div>
              <h4 style={{ color: 'var(--accent)', marginBottom: 'var(--space-2)' }}>⚡ Rápido y Eficiente</h4>
              <p className="text-sm">Genera cotizaciones profesionales en minutos con nuestro sistema automatizado.</p>
            </div>
            
            <div>
              <h4 style={{ color: 'var(--success)', marginBottom: 'var(--space-2)' }}>📊 Analytics Avanzados</h4>
              <p className="text-sm">Panel de analista con filtros avanzados y exportación CSV para tomar mejores decisiones.</p>
            </div>
            
            <div>
              <h4 style={{ color: 'var(--warning)', marginBottom: 'var(--space-2)' }}>🔒 Seguro y Confiable</h4>
              <p className="text-sm">Autenticación Firebase con filtrado por usuario para máxima privacidad de datos.</p>
            </div>
            
            <div>
              <h4 style={{ color: 'var(--accent)', marginBottom: 'var(--space-2)' }}>🎨 Diseño Profesional</h4>
              <p className="text-sm">Interfaz moderna con modo claro/oscuro y componentes optimizados para todos los dispositivos.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="container" style={{ marginTop: 'var(--space-16)', textAlign: 'center' }}>
        <div className="card" style={{
          background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)',
          color: 'white',
          padding: 'var(--space-12)'
        }}>
          <h2 style={{ color: 'white', marginBottom: 'var(--space-4)' }}>¿Listo para comenzar?</h2>
          <p style={{ color: 'rgba(255,255,255,0.9)', marginBottom: 'var(--space-8)', fontSize: 'var(--text-lg)' }}>
            Únete a nuestra plataforma y transforma la forma en que gestionas tus cotizaciones de loncheras
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              className="btn"
              style={{
                background: 'white',
                color: 'var(--accent)',
                fontWeight: 'var(--font-semibold)'
              }}
              to="/distribuidores"
            >
              🚀 Empezar ahora
            </Link>
            <Link
              className="btn"
              style={{
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.3)'
              }}
              to="/login"
            >
              🔑 Iniciar sesión
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}