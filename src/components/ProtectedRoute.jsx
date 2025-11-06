import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, rolPermitido }) {
  const { user, rol, loading } = useAuth();

  if (loading) return <div>Cargando...</div>;
  if (!user) return <Navigate to="/login" />;
  if (rol !== rolPermitido) return <Navigate to={`/${rol === 'proveedor' ? 'distribuidores' : 'analista'}`} />;
  return children;
}