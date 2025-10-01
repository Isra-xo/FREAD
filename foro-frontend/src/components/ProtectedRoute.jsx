import React from 'react';
// 1. Importa Outlet y Navigate de react-router-dom
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
    const { user } = useAuth(); // O token, lo que uses para verificar

    // Si no hay usuario, redirige al login
    if (!user) {
        return <Navigate to="/login" />;
    }

    // 2. Si hay usuario, renderiza el componente Outlet.
    // Outlet actúa como un marcador de posición para las rutas hijas.
    return <Outlet />;
};

export default ProtectedRoute;