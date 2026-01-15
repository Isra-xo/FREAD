import React, { useState, useEffect } from 'react';

/**
 * Componente NotificationItem con tiempo relativo dinámico
 * Actualiza el texto "hace X minutos" cada 60 segundos
 */
const NotificationItem = ({
    notificacion,
    onMarkAsRead,
    onDelete,
    getColor,
}) => {
    // ASINCRONÍA: Estado para forzar actualización del tiempo
    const [, setTick] = useState(0);

    // TIEMPO RELATIVO: Actualizar cada 60 segundos
    useEffect(() => {
        const interval = setInterval(() => {
            setTick(prevTick => prevTick + 1);
            console.log(`[AUDIT] Tick de actualización de tiempo relativo`);
        }, 60000); // 60 segundos

        return () => clearInterval(interval);
    }, []);

    // Función para calcular tiempo relativo (ej: "hace 5 minutos")
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

    return (
        <div
            key={notificacion.id}
            className="notification-item"
            style={{
                borderLeftColor: getColor(notificacion.tipo),
            }}
        >
            {/* Indicador de color por tipo */}
            <div
                className="notification-type-indicator"
                style={{ backgroundColor: getColor(notificacion.tipo) }}
            />

            {/* Contenido de la notificación */}
            <div className="notification-content">
                <p className="notification-message">
                    {notificacion.mensaje}
                </p>
                {/* 🔄 TIEMPO DINÁMICO: Se actualiza cada 60 segundos */}
                <span className="notification-time">
                    {getRelativeTime(notificacion.fechaCreacion)}
                </span>
            </div>

            {/* Acciones: marcar como leída, eliminar */}
            <div className="notification-actions">
                <button
                    className="action-btn mark-read"
                    onClick={() => onMarkAsRead(notificacion.id)}
                    title="Marcar como leída"
                >
                    ✓
                </button>
                <button
                    className="action-btn delete-btn"
                    onClick={() => onDelete(notificacion.id)}
                    title="Eliminar"
                >
                    ✕
                </button>
            </div>
        </div>
    );
};

export default NotificationItem;
