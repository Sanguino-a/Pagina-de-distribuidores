import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import Distributors from './pages/Distributors.jsx'
import Analyst from './pages/Analyst.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/distribuidores" element={
              <ProtectedRoute rolPermitido="proveedor">
                <Distributors />
              </ProtectedRoute>
            } />
            <Route path="/analista" element={
              <ProtectedRoute rolPermitido="analista">
                <Analyst />
              </ProtectedRoute>
            } />
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Register />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}