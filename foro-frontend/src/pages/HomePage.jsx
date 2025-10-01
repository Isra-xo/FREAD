import React, { useState, useEffect } from 'react';
import { getHilos } from '../services/apiService';
import PostCard from '../components/PostCard';
import Sidebar from '../components/Sidebar';
import './HomePage.css';

const HomePage = ({ searchTerm }) => {
    const [hilos, setHilos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchHilos = async () => {
            try {
                const response = await getHilos();
                setHilos(response.data);
            } catch (err) {
                setError("No se pudieron cargar las publicaciones.");
            } finally {
                setLoading(false);
            }
        };
        fetchHilos();
    }, []);

    const filteredHilos = hilos.filter(hilo => {
        const term = searchTerm.toLowerCase();
        const inTitle = hilo.titulo && hilo.titulo.toLowerCase().includes(term);
        const inForo = hilo.foro && hilo.foro.nombreForo && hilo.foro.nombreForo.toLowerCase().includes(term);
        return inTitle || inForo;
    });

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
                {filteredHilos.length > 0 ? (
                    filteredHilos.map(hilo => (
                        <PostCard key={hilo.id} post={hilo} />
                    ))
                ) : (
                    <p>No se encontraron resultados para "{searchTerm}"</p>
                )}
            </div>
            <Sidebar />
        </div>
    );
};

export default HomePage;