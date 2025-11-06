import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { auth, db } from '../services/firebase'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'

export default function Register() {
  const nav = useNavigate()
  const [rol, setRol] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [ciudad, setCiudad] = useState('')
  const [error, setError] = useState('')

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!rol) { setError('Seleccione un rol para continuar.'); return }
    if (password !== password2) { setError('Las contraseñas no coinciden.'); return }
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password)
      await setDoc(doc(db, 'users', userCred.user.uid), {
        rol,
        nombre,
        telefono,
        ciudad,
        email
      })
      if (rol === 'proveedor') nav('/distribuidores')
      else if (rol === 'analista') nav('/analista')
    } catch (err) {
      setError('Error al registrar: ' + err.message)
    }
  }

  return (
    <>
      <form className="card form" onSubmit={onSubmit} noValidate>
          <legend>Rol de la cuenta</legend>
          <div className="field">
            <label htmlFor="rol">Rol</label>
            <select id="rol" name="rol" required value={rol} onChange={e=>setRol(e.target.value)}>
              <option value="">Seleccione un rol</option>
              <option value="proveedor">Proveedor</option>
              <option value="analista">Analista</option>
            </select>
          </div>

          <legend>Datos de acceso</legend>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="email">Correo electrónico</label>
              <input id="email" name="email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
            </div>
            <div className="field">
              <label htmlFor="password">Contraseña</label>
              <input id="password" name="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
            </div>
            <div className="field">
              <label htmlFor="password2">Confirmar contraseña</label>
              <input id="password2" name="password2" type="password" value={password2} onChange={e=>setPassword2(e.target.value)} required />
            </div>
          </div>

          <legend>Información del perfil</legend>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="nombre">Nombre completo</label>
              <input id="nombre" name="nombre" type="text" value={nombre} onChange={e=>setNombre(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="telefono">Teléfono</label>
              <input id="telefono" name="telefono" type="tel" value={telefono} onChange={e=>setTelefono(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="ciudad">Ciudad</label>
              <input id="ciudad" name="ciudad" type="text" value={ciudad} onChange={e=>setCiudad(e.target.value)} />
            </div>
          </div>

        <div className="actions">
          <button className="btn btn-primary" type="submit">Crear cuenta</button>
          <Link className="btn" to="/login">¿Ya tienes cuenta? Inicia sesión</Link>
        </div>
        {error && <div style={{color:'red', marginTop:8}}>{error}</div>}
      </form>
    </>
  )
}