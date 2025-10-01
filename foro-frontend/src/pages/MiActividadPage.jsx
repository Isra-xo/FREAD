import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getHilosByUserId, getComentariosByUserId } from '../services/apiService';
import { Link } from 'react-router-dom';
import './PerfilPage.css'; // Componentes existentes de PerfilPage --> Nota: Craer un nuevo css para esto

const MiActividadPage = () => {
    const { user } = useAuth();
    const [hilos, setHilos] = useState([]);
    const [comentarios, setComentarios] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user && user.id) {
            const fetchData = async () => {
                try {
                    const [hilosRes, comentariosRes] = await Promise.all([
                        getHilosByUserId(user.id),
                        getComentariosByUserId(user.id) 
                    ]);
                    setHilos(hilosRes.data);
                    setComentarios(comentariosRes.data);
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
    }, [user]);

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
                </div>
            </div>
        </div>
    );
};

export default MiActividadPage;