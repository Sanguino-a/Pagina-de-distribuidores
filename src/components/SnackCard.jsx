export default function SnackCard({ name, img, onAdd }) {
  return (
    <div className="snack-card">
      {img && <img src={img} alt={name} loading="lazy" />}
      <h4>{name}</h4>
      <p>Cat: Dessert</p>
      <button className="btn" type="button" aria-label={`Añadir a cotización: ${name}`} onClick={onAdd}>
        Añadir a cotización
      </button>
    </div>
  )
}