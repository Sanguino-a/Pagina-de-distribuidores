import { NavLink } from 'react-router-dom'

export default function Header() {
  return (
    <header className="site-header">
      <div className="container header-grid" role="banner">
        <NavLink className="brand" to="/">Loncheras<span className="accent">+</span></NavLink>
        <nav className="site-nav" aria-label="Navegación principal">
          <ul>
            <li><NavLink to="/" end>Inicio</NavLink></li>
            <li><NavLink to="/distribuidores">Distribuidores</NavLink></li>
            <li><NavLink to="/analista">Analista</NavLink></li>
            <li><NavLink to="/login">Iniciar sesión</NavLink></li>
            <li><NavLink to="/registro">Registrarse</NavLink></li>
          </ul>
        </nav>
      </div>
    </header>
  )
}