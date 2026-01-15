import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getHilosByUserId, getComentariosByUserId } from '../services/apiService';
import { extractItems, getTotalPages, getTotalCount } from '../services/apiHelpers';
import { Link } from 'react-router-dom';
import './PerfilPage.css'; // Componentes existentes de PerfilPage --> Nota: Craer un nuevo css para esto

const MiActividadPage = () => {
    const { user } = useAuth();
    const [hilos, setHilos] = useState([]);
    const [hilosPage, setHilosPage] = useState(1);
    const [hilosTotalPages, setHilosTotalPages] = useState(1);
    const [hilosTotalCount, setHilosTotalCount] = useState(0);
    const [comentarios, setComentarios] = useState([]);
    const [comentariosPage, setComentariosPage] = useState(1);
    const [comentariosTotalPages, setComentariosTotalPages] = useState(1);
    const [comentariosTotalCount, setComentariosTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (user && user.id) {
            const fetchData = async () => {
                setLoading(true);
                setError('');
                const userIdToUse = Number(user.id);
                console.log("[MiActividadPage] Iniciando carga de actividad para userId:", userIdToUse);
                try {
                    // Paso 1: Realizar llamadas a la API
                    console.log("[MiActividadPage] Llamando a getHilosByUserId y getComentariosByUserId...");
                    const [hilosRes, comentariosRes] = await Promise.all([
                        getHilosByUserId(userIdToUse, hilosPage, 10),
                        getComentariosByUserId(userIdToUse, comentariosPage, 10)
                    ]);
                    
                    // Paso 2: Validar que las respuestas existan
                    console.log("[MiActividadPage] Respuestas recibidas exitosamente");
                    if (!hilosRes || !hilosRes.data) {
                        console.error("[MiActividadPage] Respuesta de hilos inválida:", hilosRes);
                        throw new Error("Respuesta de hilos no válida");
                    }
                    if (!comentariosRes || !comentariosRes.data) {
                        console.error("[MiActividadPage] Respuesta de comentarios inválida:", comentariosRes);
                        throw new Error("Respuesta de comentarios no válida");
                    }
                    
                    // Paso 3: Inspeccionar estructura de respuesta
                    console.log("[MiActividadPage] Estructura de hilosRes.data:", {
                        keys: Object.keys(hilosRes.data),
                        completa: hilosRes.data
                    });
                    console.log("[MiActividadPage] Estructura de comentariosRes.data:", {
                        keys: Object.keys(comentariosRes.data),
                        completa: comentariosRes.data
                    });
                    
                    // Paso 4: Extraer datos usando helpers
                    console.log("[MiActividadPage] Extrayendo datos con helpers...");
                    const hilosItems = extractItems(hilosRes);
                    const hilosTotalCountValue = getTotalCount(hilosRes);
                    const hilosTotalPagesValue = getTotalPages(hilosRes);
                    
                    const comentariosItems = extractItems(comentariosRes);
                    const comentariosTotalCountValue = getTotalCount(comentariosRes);
                    const comentariosTotalPagesValue = getTotalPages(comentariosRes);
                    
                    // Paso 5: Validar que extractItems retornó arrays
                    console.log("[MiActividadPage] Validando tipos de datos extraídos");
                    if (!Array.isArray(hilosItems)) {
                        console.error("[MiActividadPage] hilosItems no es un array:", hilosItems);
                        throw new Error("hilosItems no es un array");
                    }
                    if (!Array.isArray(comentariosItems)) {
                        console.error("[MiActividadPage] comentariosItems no es un array:", comentariosItems);
                        throw new Error("comentariosItems no es un array");
                    }
                    
                    // Paso 6: Resumen de datos cargados
                    console.log("[MiActividadPage] ✅ Datos cargados exitosamente:", {
                        hilos: {
                            cantidad: hilosItems.length,
                            totalCount: hilosTotalCountValue,
                            totalPages: hilosTotalPagesValue
                        },
                        comentarios: {
                            cantidad: comentariosItems.length,
                            totalCount: comentariosTotalCountValue,
                            totalPages: comentariosTotalPagesValue
                        }
                    });
                    
                    // Paso 7: Actualizar estados
                    setHilos(hilosItems);
                    setHilosTotalPages(hilosTotalPagesValue);
                    setHilosTotalCount(hilosTotalCountValue);
                    setComentarios(comentariosItems);
                    setComentariosTotalPages(comentariosTotalPagesValue);
                    setComentariosTotalCount(comentariosTotalCountValue);
                } catch (error) {
                    console.error("[MiActividadPage] ❌ Error cargando actividad:", error.message);
                    console.error("[MiActividadPage] Detalles completos del error:", {
                        message: error.message,
                        status: error.response?.status,
                        statusText: error.response?.statusText,
                        data: error.response?.data,
                        config: error.config?.url
                    });
                    setError(`No se pudo cargar tu actividad: ${error.message}`);
                    setHilos([]);
                    setComentarios([]);
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        } else {
            setLoading(false);
            setError("Usuario no autenticado. Por favor, inicia sesión.");
            console.warn("[MiActividadPage] Usuario no disponible en AuthContext:", user);
        }
    }, [user, hilosPage, comentariosPage]);

    if (loading) return <div className="profile-page-container"><p>Cargando tu actividad...</p></div>;
    
    if (error) return <div className="profile-page-container"><p className="error-message">{error}</p></div>;

    return (
        <div className="profile-page-container">
            <h1>Mi Actividad</h1>
            <div className="profile-sections">
                <div className="user-hilos">
                    <h3>Mis Hilos ({hilosTotalCount})</h3>
                    <div className="scrollable-list">
                        {Array.isArray(hilos) && hilos.length > 0 ? (
                            hilos.map(hilo => (
                                <div key={hilo.id} className="profile-item">
                                    <Link to={`/hilo/${hilo.id}`}>{hilo.titulo}</Link>
                                    <p className="meta-info">en f/{hilo.foro?.nombreForo || 'Foro'}</p>
                                </div>
                            ))
                        ) : (
                            <p>No has creado ningún hilo.</p>
                        )}
                    </div>
                </div>
                <div className="user-foros">
                    <h3>Mis Comentarios ({comentariosTotalCount})</h3>
                    <div className="scrollable-list">
                        {Array.isArray(comentarios) && comentarios.length > 0 ? (
                            comentarios.map(comentario => (
                                <div key={comentario.id} className="profile-item">
                                    <p>"{comentario.contenido}"</p>
                                    <Link to={`/hilo/${comentario.hiloId}`}>Ver en contexto</Link>
                                </div>
                            ))
                        ) : (
                            <p>No has creado ningún comentario.</p>
                        )}
                    </div>

                    {/* Comentarios pagination */}
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 8 }}>
                        <button aria-label="Ir a página anterior" onClick={() => setComentariosPage(p => Math.max(1, p - 1))} disabled={comentariosPage === 1}>Anterior</button>
                        <span>Página {comentariosPage} de {comentariosTotalPages}</span>
                        <button aria-label="Ir a página siguiente" onClick={() => setComentariosPage(p => Math.min(comentariosTotalPages, p + 1))} disabled={comentariosPage === comentariosTotalPages}>Siguiente</button>
                    </div>
                </div>
            </div>

            {/* Hilos pagination */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 16 }}>
                <button aria-label="Ir a página anterior" onClick={() => setHilosPage(p => Math.max(1, p - 1))} disabled={hilosPage === 1}>Anterior</button>
                <span>Página {hilosPage} de {hilosTotalPages}</span>
                <button aria-label="Ir a página siguiente" onClick={() => setHilosPage(p => Math.min(hilosTotalPages, p + 1))} disabled={hilosPage === hilosTotalPages}>Siguiente</button>
            </div>
        </div>
    );
};

export default MiActividadPage;