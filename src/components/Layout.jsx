import { Outlet } from 'react-router-dom'
import Header from './Header.jsx'
import Footer from './Footer.jsx'

export default function Layout() {
  return (
    <>
      <Header />
      <main id="contenido" className="container flow">
        <Outlet />
      </main>
      <Footer />
    </>
  )
}