import React, { useState } from 'react'; // <-- 1. Se importa useState
import { Routes, Route } from 'react-router-dom';

// Tus componentes existentes
import Navbar from './components/Navbar';
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

function App() {
  // 2. Se define el estado para el término de búsqueda
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <>
      {/* 3. Se pasan los props al Navbar para controlar la búsqueda */}
      <Navbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <main>
        <Routes>
          {/* --- Rutas Públicas --- */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* --- Rutas Protegidas (agrupadas para mayor claridad) --- */}
          <Route element={<ProtectedRoute />}>
            {/* 4. Se pasa el término de búsqueda a HomePage para filtrar */}
            <Route path="/" element={<HomePage searchTerm={searchTerm} />} />
            <Route path="/foros" element={<ForosListPage />} />
            <Route path="/crear-foro" element={<CreateForoPage />} />
            <Route path="/crear-hilo" element={<CreateHiloPage />} />
            <Route path="/hilo/:id" element={<HiloDetailPage />} />
            <Route path="/perfil" element={<PerfilPage />} />
            <Route path="/popular" element={<AdminPage />} />
          </Route>

          {/* --- Ruta para Páginas no Encontradas (404) --- */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </>
  );
}

export default App;