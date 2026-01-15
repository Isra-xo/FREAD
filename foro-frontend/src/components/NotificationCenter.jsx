import React, { useState, useEffect, useRef } from 'react';
import { getNotificaciones, getUnreadNotificationCount, deleteNotificacion } from '../services/apiService';
import { useNotification } from '../context/NotificationContext';
import './NotificationCenter.css';

const NotificationCenter = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [notificaciones, setNotificaciones] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const dropdownRef = useRef(null);
    const { showToast } = useNotification();

    const PAGE_SIZE = 5;

    useEffect(() => {
        loadUnreadCount();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen) {
            loadNotificaciones(1);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    const loadUnreadCount = async () => {
        try {
            const response = await getUnreadNotificationCount();
            setUnreadCount(response.data.unreadCount || 0);
        } catch (error) {
            console.error('[NOTIF] Error:', error);
        }
    };

    const loadNotificaciones = async (pageNumber = 1) => {
        setIsLoading(true);
        try {
            const response = await getNotificaciones(pageNumber, PAGE_SIZE);
            const data = response.data;

            setNotificaciones(Array.isArray(data.items) ? data.items : data.Items || []);
            setTotalPages(data.totalPages || data.TotalPages || 1);
            setCurrentPage(pageNumber);
        } catch (error) {
            console.error('[NOTIF] Error:', error);
            showToast('Error al cargar', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteNotificacion = async (notificacionId) => {
        // 🟢 OPTIMISTIC: Guardar estado anterior por si acaso rollback
        const previousNotificaciones = notificaciones;
        const previousCount = unreadCount;

        try {
            // 🟢 STEP 1: Actualizar UI inmediatamente (sin esperar servidor)
            setNotificaciones(notificaciones.filter(n => n.id !== notificacionId));
            if (unreadCount > 0) {
                setUnreadCount(unreadCount - 1);
            }

            // 🟡 STEP 2: Enviar petición al servidor (background)
            await deleteNotificacion(notificacionId);
            showToast('Notificación eliminada', 'success');
        } catch (error) {
            // 🔴 STEP 3: Si falla, revertir estado y recargar desde servidor
            console.error('[DELETE ERROR]', error);
            setNotificaciones(previousNotificaciones);
            setUnreadCount(previousCount);
            
            // Recargar desde servidor para estar seguro
            await loadUnreadCount();
            await loadNotificaciones(currentPage);
            showToast('Error al eliminar. Reintentando...', 'error');
        }
    };

    const getRelativeTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);

        if (seconds < 60) return 'hace unos segundos';
        if (seconds < 3600) return `hace ${Math.floor(seconds / 60)} min`;
        if (seconds < 86400) return `hace ${Math.floor(seconds / 3600)} horas`;
        if (seconds < 604800) return `hace ${Math.floor(seconds / 86400)} días`;
        return date.toLocaleDateString();
    };

    const getNotificationColor = (tipo) => {
        const colors = { Success: '#22c55e', Warning: '#f97316', Error: '#ef4444', Info: '#3b82f6' };
        return colors[tipo] || colors.Info;
    };

    return (
        <div className="notification-center" ref={dropdownRef}>
            <button
                className="notification-bell"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Notificaciones"
            >
                🔔
                {unreadCount > 0 && (
                    <span className="notification-badge">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="notification-dropdown">
                    <div className="notification-header">
                        <h3>Notificaciones</h3>
                        <button className="close-btn" onClick={() => setIsOpen(false)} aria-label="Cerrar">
                            ✕
                        </button>
                    </div>

                    <div className="notification-list">
                        {isLoading ? (
                            <div className="notification-empty">Cargando...</div>
                        ) : notificaciones.length === 0 ? (
                            <div className="notification-empty">No hay notificaciones</div>
                        ) : (
                            notificaciones.map((notificacion) => (
                                <div
                                    key={notificacion.id}
                                    className="notification-item"
                                    style={{ borderLeftColor: getNotificationColor(notificacion.tipo) }}
                                >
                                    <div
                                        className="notification-type-indicator"
                                        style={{ backgroundColor: getNotificationColor(notificacion.tipo) }}
                                    />
                                    <div className="notification-content">
                                        <p className="notification-message">{notificacion.mensaje}</p>
                                        <span className="notification-time">
                                            {getRelativeTime(notificacion.fechaCreacion)}
                                        </span>
                                    </div>
                                    <div className="notification-actions">
                                        <button
                                            className="action-btn delete-btn"
                                            onClick={() => handleDeleteNotificacion(notificacion.id)}
                                            title="Eliminar"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {totalPages > 1 && currentPage < totalPages && (
                        <div className="notification-footer">
                            <button
                                className="load-more-btn"
                                onClick={() => loadNotificaciones(currentPage + 1)}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Cargando...' : 'Cargar más'}
                            </button>
                        </div>
                    )}

                    {notificaciones.length > 0 && (
                        <div className="notification-footer">
                            <a href="/notificaciones" className="view-all-link">
                                Ver todas →
                            </a>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationCenter;
