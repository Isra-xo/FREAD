import React, { useState, useEffect } from 'react';
import { getHilos } from '../services/apiService';
import { extractItems, getTotalPages } from '../services/apiHelpers';
import PostCard from '../components/PostCard';
import Sidebar from '../components/Sidebar';
import './HomePage.css';

const HomePage = ({ searchTerm }) => {
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
                // Ahora llamamos a la API con paginación y el término de búsqueda
                const response = await getHilos(currentPage, pageSize, searchTerm);
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
    }, [currentPage, searchTerm]); // Se recarga si cambia la página o la búsqueda

    // Reset page to 1 when the search term changes to avoid invalid pages
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            // Hacer scroll hacia arriba al cambiar de página
            window.scrollTo(0, 0);
        }
    };

    if (loading) {
        return (
            <div className="home-container">
                <div className="posts-list">
                    <p>Cargando publicaciones...</p>
                </div>
                <Sidebar />
            </div>
        );
    }

    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div className="home-container">
            <div className="posts-list">
                {hilos.length > 0 ? (
                    <>
                        {hilos.map(hilo => (
                            <PostCard key={hilo.id} post={hilo} />
                        ))}
                        
                        {/* Controles de Paginación */}
                        <div className="pagination-container">
                            <button 
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="pagination-btn"
                                aria-label="Ir a página anterior"
                            >
                                Anterior
                            </button>
                            <span className="pagination-info">
                                Página {currentPage} de {totalPages}
                            </span>
                            <button 
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="pagination-btn"
                                aria-label="Ir a página siguiente"
                            >
                                Siguiente
                            </button>
                        </div>
                    </>
                ) : (
                    <p>No se encontraron resultados para "{searchTerm}"</p>
                )}
            </div>
            <Sidebar />
        </div>
    );
};

export default HomePage;