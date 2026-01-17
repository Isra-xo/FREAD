import React from 'react'; 
import { Routes, Route } from 'react-router-dom';

// Componentes existentes
// NOTA: Ya no importamos Navbar aquí para evitar que salga duplicado
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminPage from './pages/AdminPage';
import ForosListPage from './pages/ForosListPage';
import CreateForoPage from './pages/CreateForoPage';
import CreateHiloPage from './pages/CreateHiloPage';
import HiloDetailPage from './pages/HiloDetailPage';
import PerfilPage from './pages/PerfilPage';
import ProtectedRoute from './components/ProtectedRoute';
import NotFoundPage from './pages/NotFoundPage';
import MiActividadPage from './pages/MiActividadPage';
import NotificationsPage from './pages/NotificationsPage';

function App() {
  // Ya no necesitamos el estado de búsqueda aquí arriba, 
  // cada página manejará su propia barra si la necesita.

  return (
    // CAMBIO CLAVE: 
    // 1. Quitamos <Navbar /> global.
    // 2. Usamos un div con 'min-h-screen bg-[#050505]' para pintar TODO el fondo de negro elegante.
    <div className="w-full min-h-screen bg-[#050505] text-gray-200">
      
        <Routes>
          {/* --- Rutas Públicas --- */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* --- Rutas Protegidas --- */}
          <Route element={<ProtectedRoute />}>
            {/* HomePage ya tiene su propia Navbar integrada, así que se verá perfecto */}
            <Route path="/" element={<HomePage />} />
            
            {/* NOTA: Las siguientes páginas (perfil, foros, etc) saldrán SIN navbar por ahora.
                Más adelante crearemos un "Layout" para ellas o les pondremos la Navbar nueva. */}
            <Route path="/foros" element={<ForosListPage />} />
            <Route path="/foro/:id" element={<HomePage />} />
            <Route path="/hilo/:id" element={<HiloDetailPage />} />
            <Route path="/perfil" element={<PerfilPage />} />
            <Route path="/popular" element={<AdminPage />} />
            <Route path="/mi-actividad" element={<MiActividadPage />} />
            <Route path="/notificaciones" element={<NotificationsPage />} />
          </Route>

          {/* --- Permisos Específicos --- */}
          <Route element={<ProtectedRoute requiredPermission="/crear-hilo" />}>
            <Route path="/crear-hilo" element={<CreateHiloPage />} />
          </Route>

          <Route element={<ProtectedRoute requiredPermission="/crear-foro" />}>
            <Route path="/crear-foro" element={<CreateForoPage />} />
          </Route>

          {/* --- 404 --- */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
    </div>
  );
}

export default App;