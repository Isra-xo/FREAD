import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getHiloById, deleteHilo, getComentariosByHiloId, createComentario } from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import './HiloDetailPage.css';

const HiloDetailPage = () => {
    const [hilo, setHilo] = useState(null);
    const [comentarios, setComentarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [nuevoComentario, setNuevoComentario] = useState("");
    
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const userRole = user ? user.role : null;
    const userName = user ? (user.name || user['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name']) : '';

    const fetchAllData = async () => {
        try {
            const [hiloRes, comentariosRes] = await Promise.all([
                getHiloById(id),
                getComentariosByHiloId(id)
            ]);
            setHilo(hiloRes.data);
            setComentarios(comentariosRes.data);
        } catch (error) {
            console.error("Error al cargar los datos:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, [id]);

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!nuevoComentario.trim()) return;
        try {
            await createComentario(id, { contenido: nuevoComentario });
            setNuevoComentario("");
            await fetchAllData();
        } catch (error) {
            console.error("Error al publicar comentario:", error);
            alert("No se pudo publicar el comentario.");
        }
    };

    const handleDeleteHilo = async () => {
        if (window.confirm("¿Estás seguro de que quieres eliminar este hilo de forma permanente?")) {
            try {
                await deleteHilo(id);
                alert("Hilo eliminado con éxito.");
                navigate('/'); 
            } catch (error) {
                console.error("Error al eliminar el hilo:", error);
                alert("No se pudo eliminar el hilo.");
            }
        }
    };

    if (loading) return <p className="loading-message">Cargando hilo...</p>;
    if (!hilo) return <p className="error-message">No se encontró el hilo.</p>;

    return (
        <div className="hilo-detail-container">
            <div className="hilo-content">
                <p className="meta-info">
                    {hilo.foro && <Link to={`/f/${hilo.foro.nombreForo}`}>f/{hilo.foro.nombreForo}</Link>}
                    <span style={{ margin: '0 8px' }}>•</span>
                    Publicado por u/{hilo.usuario?.nombreUsuario}
                </p>
                <h1>{hilo.titulo}</h1>
                <p className="hilo-body">{hilo.contenido}</p>

                {/* --- Opciones de Administrador --- */}
                {userRole === 'Administrador' && (
                    <div className="admin-actions">
                        <button className="btn btn-secondary">Editar Hilo</button>
                        <button onClick={handleDeleteHilo} className="btn btn-delete">Eliminar Hilo</button>
                    </div>
                )}
            </div>

            <div className="comentarios-section">
                <h3>Comentarios ({comentarios.length})</h3>
                {user && (
                    <form onSubmit={handleCommentSubmit} className="comment-form">
                        <textarea
                            value={nuevoComentario}
                            onChange={(e) => setNuevoComentario(e.target.value)}
                            placeholder={`Comentar como ${userName}...`}
                            required
                        />
                        <button type="submit" className="btn btn-primary">Comentar</button>
                    </form>
                )}
                <div className="comentarios-list">
                    {comentarios.map(comentario => (
                        <div key={comentario.id} className="comentario">
                            <p className="meta-info"><strong>u/{comentario.usuario.nombreUsuario}</strong></p>
                            <p>{comentario.contenido}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HiloDetailPage;