import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getHilosByUserId, getComentariosByUserId } from '../services/apiService';
import { extractItems, getTotalPages } from '../services/apiHelpers';
import { Link } from 'react-router-dom';
import './PerfilPage.css'; // Componentes existentes de PerfilPage --> Nota: Craer un nuevo css para esto

const MiActividadPage = () => {
    const { user } = useAuth();
    const [hilos, setHilos] = useState([]);
    const [hilosPage, setHilosPage] = useState(1);
    const [hilosTotalPages, setHilosTotalPages] = useState(1);
    const [comentarios, setComentarios] = useState([]);
    const [comentariosPage, setComentariosPage] = useState(1);
    const [comentariosTotalPages, setComentariosTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user && user.id) {
            const fetchData = async () => {
                setLoading(true);
                try {
                    const [hilosRes, comentariosRes] = await Promise.all([
                        getHilosByUserId(user.id, hilosPage, 10),
                        getComentariosByUserId(user.id, comentariosPage, 10)
                    ]);
                    setHilos(extractItems(hilosRes));
                    setHilosTotalPages(getTotalPages(hilosRes));
                    setComentarios(extractItems(comentariosRes));
                    setComentariosTotalPages(getTotalPages(comentariosRes));
                } catch (error) {
                    console.error("Error al cargar la actividad del usuario", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        } else {
            setLoading(false);
        }
    }, [user, hilosPage, comentariosPage]);

    if (loading) return <div className="profile-page-container"><p>Cargando tu actividad...</p></div>;

    return (
        <div className="profile-page-container">
            <h1>Mi Actividad</h1>
            <div className="profile-sections">
                <div className="user-hilos">
                    <h3>Mis Hilos ({hilos.length})</h3>
                    <div className="scrollable-list">
                        {hilos.map(hilo => (
                            <div key={hilo.id} className="profile-item">
                                <Link to={`/hilo/${hilo.id}`}>{hilo.titulo}</Link>
                                <p className="meta-info">en f/{hilo.foro?.nombreForo}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="user-foros"> {}
                    <h3>Mis Comentarios ({comentarios.length})</h3>
                    <div className="scrollable-list">
                        {comentarios.map(comentario => (
                            <div key={comentario.id} className="profile-item">
                                <p>"{comentario.contenido}"</p>
                                <Link to={`/hilo/${comentario.hiloId}`}>Ver en contexto</Link>
                            </div>
                        ))}
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