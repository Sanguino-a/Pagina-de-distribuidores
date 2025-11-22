import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth, db } from '../services/firebase'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import PasswordResetModal from '../components/PasswordResetModal'

export default function Login() {
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showResetModal, setShowResetModal] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password)
      const userDoc = await getDoc(doc(db, 'users', userCred.user.uid))
      const rol = userDoc.data()?.rol
      if (rol === 'proveedor') nav('/distribuidores')
      else if (rol === 'analista') nav('/analista')
      else setError('Rol no asignado.')
    } catch (err) {
      setError('Credenciales incorrectas')
    }
  }

  return (
    <>
      <h1>Iniciar sesión</h1>
      <form className="card form" onSubmit={onSubmit} noValidate>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="email">Correo electrónico</label>
            <input id="email" name="email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="password">Contraseña</label>
            <input id="password" name="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
          </div>
        </div>
        <div className="actions">
          <button className="btn btn-primary" type="submit">Ingresar</button>
        </div>
        {error && <div style={{color:'red', marginTop:8}}>{error}</div>}
        
        <div className="forgot-password-link" style={{marginTop: '15px', textAlign: 'center'}}>
          <button 
            type="button" 
            className="btn-link"
            onClick={() => setShowResetModal(true)}
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>
      </form>
      
      <PasswordResetModal 
        isOpen={showResetModal} 
        onClose={() => setShowResetModal(false)} 
      />
    </>
  )
}