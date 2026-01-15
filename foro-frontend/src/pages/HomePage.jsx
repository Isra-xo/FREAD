import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getHilos } from '../services/apiService';
import { extractItems, getTotalPages } from '../services/apiHelpers';
import PostCard from '../components/PostCard';
import Sidebar from '../components/Sidebar';
import './HomePage.css';

const HomePage = ({ searchTerm }) => {
    const { id: foroIdParam } = useParams();
    const [hilos, setHilos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Estados para la paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 10; // Cantidad de hilos por página

    useEffect(() => {
        const fetchHilos = async () => {
            setLoading(true);
            try {
                // Ahora llamamos a la API con paginación, búsqueda y filtro por foro si aplica
                const response = await getHilos(currentPage, pageSize, searchTerm, foroIdParam);
                const items = extractItems(response);
                setHilos(items);
                setTotalPages(getTotalPages(response));
            } catch (err) {
                setError("No se pudieron cargar las publicaciones.");
            } finally {
                setLoading(false);
            }
        };
        fetchHilos();
    }, [currentPage, searchTerm, foroIdParam]); // Se recarga si cambia la página, la búsqueda o el foro seleccionado

    // Reset page to 1 when the search term or foro changes to avoid invalid pages
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, foroIdParam]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            // Hacer scroll hacia arriba al cambiar de página
            window.scrollTo(0, 0);
        }
    };

    //  MANEJADOR DE ELIMINACIÓN CON ACTUALIZACIÓN OPTIMISTA
    const handleDeletePost = (hiloId) => {
        // Remover el post del estado inmediatamente (actualización optimista)
        setHilos(prevHilos => prevHilos.filter(hilo => hilo.id !== hiloId));
    };

    if (loading) {
        return (
            <div className="home-container">
                <div className="posts-feed">
                    <div className="loading-skeleton">
                        <p>Cargando publicaciones...</p>
                    </div>
                </div>
                <Sidebar />
            </div>
        );
    }

    if (error) return <p className="error-message">{error}</p>;

    return (
        <div className="home-container">
            <div className="posts-feed">
                {foroIdParam && (
                    <div className="foro-header-container">
                        <h2 className="foro-header">
                            {hilos[0]?.foro?.nombreForo ?? `ID ${foroIdParam}`}
                        </h2>
                    </div>
                )}
                
                {hilos.length > 0 ? (
                    <>
                        <div className="posts-grid">
                            {hilos.map(hilo => (
                                <PostCard 
                                    key={hilo.id} 
                                    post={hilo}
                                    onDelete={handleDeletePost}
                                />
                            ))}
                        </div>
                        
                        {/* Controles de Paginación */}
                        <div className="pagination-container">
                            <button 
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="pagination-btn pagination-prev"
                                aria-label="Ir a página anterior"
                            >
                                ← Anterior
                            </button>
                            <span className="pagination-info">
                                Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong>
                            </span>
                            <button 
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="pagination-btn pagination-next"
                                aria-label="Ir a página siguiente"
                            >
                                Siguiente →
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="no-posts-container">
                        <p className="no-posts-text">
                            {foroIdParam ? (
                                "No hay hilos en esta comunidad."
                            ) : (
                                `No se encontraron resultados para "${searchTerm}"`
                            )}
                        </p>
                    </div>
                )}
            </div>
            
            <Sidebar />
        </div>
    );
};

export default HomePage;