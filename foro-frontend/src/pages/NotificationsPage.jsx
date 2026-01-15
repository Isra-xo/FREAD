import React, { useState, useEffect } from 'react';
import { getNotificaciones, deleteNotificacion } from '../services/apiService';
import { useNotification } from '../context/NotificationContext';
import './NotificationsPage.css';

const NotificationsPage = () => {
    const [notificaciones, setNotificaciones] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const { showToast } = useNotification();

    const PAGE_SIZE = 10;

    useEffect(() => {
        loadNotificaciones(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadNotificaciones = async (pageNumber = 1) => {
        setIsLoading(true);
        try {
            // ✅ SIMPLIFICADO: Traer todas (sin filtro)
            const response = await getNotificaciones(pageNumber, PAGE_SIZE);
            const data = response.data;

            setNotificaciones(Array.isArray(data.items) ? data.items : data.Items || []);
            setTotalPages(data.totalPages || data.TotalPages || 1);
            setTotalCount(data.totalCount || data.TotalCount || 0);
            setCurrentPage(pageNumber);
        } catch (error) {
            console.error('[NOTIF] Error al cargar:', error);
            showToast('Error al cargar notificaciones', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    // ✅ SIMPLIFICADO: SOLO ELIMINAR
    const handleDeleteNotificacion = async (notificacionId) => {
        try {
            console.log(`[NOTIF] Eliminar: ${notificacionId}`);

            // 🟢 OPTIMISTA: Quitar de UI INMEDIATAMENTE
            setNotificaciones(
                notificaciones.filter(n => n.id !== notificacionId)
            );

            // 🟡 ASYNC: Confirmar con servidor
            await deleteNotificacion(notificacionId);
            showToast('Notificación eliminada', 'success');
        } catch (error) {
            console.error('[NOTIF] Error al eliminar:', error);
            
            // 🔴 ROLLBACK
            await loadNotificaciones(currentPage);
            showToast('Error al eliminar notificación', 'error');
        }
    };

    // Función para calcular tiempo relativo
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

    // Obtener color basado en tipo
    const getNotificationColor = (tipo) => {
        switch (tipo) {
            case 'Success':
                return '#22c55e';
            case 'Warning':
                return '#f97316';
            case 'Error':
                return '#ef4444';
            case 'Info':
            default:
                return '#3b82f6';
        }
    };

    return (
        <div className="notifications-page">
            <div className="notifications-container">
                {/* HEADER */}
                <div className="notifications-header">
                    <h1>Centro de Notificaciones</h1>
                    <p className="notifications-count">
                        Total: <strong>{totalCount}</strong> notificaciones
                    </p>
                </div>

                {/* LISTA DE NOTIFICACIONES */}
                {isLoading ? (
                    <div className="loading-state">
                        <p>Cargando notificaciones...</p>
                    </div>
                ) : notificaciones.length === 0 ? (
                    <div className="empty-state">
                        <p>📭 No hay notificaciones para mostrar</p>
                    </div>
                ) : (
                    <div className="notifications-list">
                        {notificaciones.map((notificacion) => (
                            <div
                                key={notificacion.id}
                                className="notification-card"
                                style={{
                                    borderLeftColor: getNotificationColor(notificacion.tipo),
                                }}
                            >
                                {/* INDICADOR DE TIPO */}
                                <div
                                    className="notification-type-dot"
                                    style={{ backgroundColor: getNotificationColor(notificacion.tipo) }}
                                />

                                {/* CONTENIDO */}
                                <div className="notification-card-content">
                                    <div className="notification-header-row">
                                        <h4 className="notification-title">
                                            {notificacion.tipo === 'Success' && '✅ '}
                                            {notificacion.tipo === 'Warning' && '⚠️ '}
                                            {notificacion.tipo === 'Error' && '❌ '}
                                            {notificacion.tipo === 'Info' && 'ℹ️ '}
                                            {notificacion.tipo}
                                        </h4>
                                    </div>

                                    <p className="notification-message">
                                        {notificacion.mensaje}
                                    </p>

                                    <div className="notification-meta">
                                        <span className="notification-date">
                                            {getRelativeTime(notificacion.fechaCreacion)}
                                        </span>
                                        <span className="notification-full-date">
                                            {new Date(notificacion.fechaCreacion).toLocaleString('es-ES')}
                                        </span>
                                    </div>
                                </div>

                                {/* ACCIONES - SOLO DELETE */}
                                <div className="notification-card-actions">
                                    <button
                                        className="action-btn delete-btn"
                                        onClick={() => handleDeleteNotificacion(notificacion.id)}
                                        title="Eliminar"
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* PAGINACIÓN */}
                {totalPages > 1 && (
                    <div className="pagination">
                        <button
                            onClick={() => loadNotificaciones(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="pagination-btn"
                        >
                            ← Anterior
                        </button>

                        <div className="page-info">
                            Página {currentPage} de {totalPages}
                        </div>

                        <button
                            onClick={() => loadNotificaciones(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="pagination-btn"
                        >
                            Siguiente →
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;
