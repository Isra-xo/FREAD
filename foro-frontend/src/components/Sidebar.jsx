import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getForos } from '../services/apiService';
import './Sidebar.css'; 

const Sidebar = () => {
    const [forums, setForums] = useState([]);
    const [selectedForumId, setSelectedForumId] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchForums = async () => {
            try {
                const response = await getForos(1, 50); // Obtener los primeros 50 foros
                setForums(response.data || []);
                setLoading(false);
            } catch (error) {
                console.error('Error cargando foros:', error);
                setLoading(false);
            }
        };
        fetchForums();
    }, []);

    return (
        <aside className="sidebar">
            {/* 📌 WIDGET: ACERCA DEL FORO */}
            <div className="sidebar-widget about-widget">
                <h4 className="widget-title">Acerca del Foro</h4>
                <p className="widget-description">Un espacio para discutir sobre las últimas tendencias. ¡Comparte tu conocimiento!</p>
                <div className="stats-grid">
                    <div className="stat-item">
                        <div className="stat-number">1.2M</div>
                        <div className="stat-label">Miembros</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number">5.8k</div>
                        <div className="stat-label">En línea</div>
                    </div>
                </div>
                <button className="btn btn-primary full-width">Unirse</button>
            </div>

            {/* 🗂️ WIDGET: COMUNIDADES */}
            {!loading && forums.length > 0 && (
                <div className="sidebar-widget communities-widget">
                    <h4 className="widget-title">Comunidades</h4>
                    <nav className="forums-list">
                        {forums.map(forum => (
                            <Link 
                                key={forum.id}
                                to={`/foro/${forum.id}`}
                                className={`forum-link ${selectedForumId === forum.id ? 'active' : ''}`}
                                onClick={() => setSelectedForumId(forum.id)}
                            >
                                <span className="forum-icon">📌</span>
                                <span className="forum-name">{forum.nombreForo}</span>
                                <span className="forum-chevron">→</span>
                            </Link>
                        ))}
                    </nav>
                </div>
            )}

            {/* 📋 WIDGET: REGLAS */}
            <div className="sidebar-widget rules-widget">
                <h4 className="widget-title">Reglas del Foro</h4>
                <ol className="rules-list">
                    <li><strong>Respeta a los demás.</strong> Mantén un diálogo constructivo.</li>
                    <li><strong>No hagas spam.</strong> Evita autopromoción excesiva.</li>
                    <li><strong>Mantén el tema.</strong> Discussiones relevantes al foro.</li>
                    <li><strong>Contenido legal.</strong> No compartas información ilegal.</li>
                </ol>
            </div>

            {/* 🚀 WIDGET: CTA */}
            <div className="sidebar-widget cta-widget">
                <h4 className="widget-title">¡Sé Moderador!</h4>
                <p className="widget-description">¿Te gustaría moderar este foro? Contáctanos para más detalles.</p>
                <button className="btn btn-secondary full-width">Solicitar</button>
            </div>
        </aside>
    );
};

export default Sidebar;