import React, { useRef } from 'react';
// 1. Importa Outlet y Navigate de react-router-dom
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const ProtectedRoute = ({ requiredPermission }) => {
    const { user, menuItems } = useAuth(); // user + dynamic menu
    const { showToast } = useNotification();
    const location = useLocation();
    const shownRef = useRef(false);

    // Si no hay usuario, redirige al login
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} />;
    }

    // Si se requiere un permiso específico, verificar si el menú del usuario lo contiene
    if (requiredPermission) {
        const hasPermission = Boolean(
            menuItems && menuItems.some(mi => mi.url === requiredPermission || mi.titulo === requiredPermission)
        );

        if (!hasPermission) {
            // Mostrar toast sólo una vez para evitar spam en re-renders
            if (!shownRef.current) {
                shownRef.current = true;
                showToast('No tienes permiso para acceder a esta sección', 'error');
            }
            return <Navigate to="/" replace />;
        }
    }

    // Si todo está OK, renderiza la ruta solicitada
    return <Outlet />;
};

export default ProtectedRoute;