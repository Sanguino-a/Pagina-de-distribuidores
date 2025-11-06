export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="site-footer">
      <div className="container">
        <p><small>&copy; <span id="anio">{year}</span> Loncheras+.</small></p>
      </div>
    </footer>
  )
}