import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getForos, deleteForo } from '../services/apiService';
import { extractItems, getTotalPages } from '../services/apiHelpers';
import { useAuth } from '../context/AuthContext';
import './ForosListPage.css';

const ForosListPage = () => {
    const [foros, setForos] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const { user } = useAuth(); // Aqui se obtiene la info del usuario logueado
    const userId = user?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];

    useEffect(() => {
        fetchForos(currentPage);
    }, [currentPage]);

    const fetchForos = async (page = 1) => {
        try {
            const response = await getForos(page, 10);
            setForos(extractItems(response));
            setTotalPages(getTotalPages(response));
        } catch (error) {
            console.error("Error al obtener los foros:", error);
        }
    };

    const handleDelete = async (foroId) => {
        if (window.confirm("¿Estás seguro de que quieres eliminar este foro?")) {
            try {
                await deleteForo(foroId);
                fetchForos(currentPage);
            } catch (error) {
                console.error("Error al eliminar el foro:", error);
                alert("No tienes permiso para eliminar este foro.");
            }
        }
    };

    return (
        <div className="foros-wrapper">
            <div className="foros-container">
                <div className="foros-header">
                    <h1>Comunidades de FREAD</h1>
                    <p className="subtitle">Explora y únete a las comunidades que te interesan</p>
                    <Link to="/crear-foro" className="btn-create-foro">
                        Crear Nueva Comunidad
                    </Link>
                </div>

                {foros.length > 0 ? (
                    <>
                        <div className="foros-grid">
                            {foros.map(foro => (
                                <div key={foro.id} className="foro-card">
                                    <div className="foro-icon">
                                        <span className="icon-letter">
                                            {foro.nombreForo.charAt(0).toUpperCase()}
                                        </span>
                                    </div>

                                    <div className="foro-content">
                                        <Link to={`/foro/${foro.id}`} className="foro-name">
                                            f/{foro.nombreForo}
                                        </Link>
                                        <p className="foro-description">{foro.descripcion}</p>
                                        <p className="foro-meta">
                                            Creado por: <span className="creator-name">{foro.usuario?.nombreUsuario || 'Desconocido'}</span>
                                        </p>
                                    </div>

                                    <div className="foro-actions">
                                        <Link to={`/foro/${foro.id}`} className="btn-visit">
                                            Visitar →
                                        </Link>
                                        
                                        {foro.usuarioId && Number(userId) === foro.usuarioId && (
                                            <button 
                                                onClick={() => handleDelete(foro.id)}
                                                className="btn-delete-foro"
                                                title="Eliminar foro"
                                            >
                                                🗑️
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className="pagination">
                                <button 
                                    aria-label="Página anterior" 
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                                    disabled={currentPage === 1}
                                    className="pagination-btn"
                                >
                                    ← Anterior
                                </button>
                                <span className="pagination-info">Página {currentPage} de {totalPages}</span>
                                <button 
                                    aria-label="Página siguiente" 
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                                    disabled={currentPage === totalPages}
                                    className="pagination-btn"
                                >
                                    Siguiente →
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="empty-state">
                        <p className="empty-icon"></p>
                        <p className="empty-text">No hay comunidades disponibles</p>
                        <Link to="/crear-foro" className="btn-create-empty">
                            + Crea la primera
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ForosListPage;