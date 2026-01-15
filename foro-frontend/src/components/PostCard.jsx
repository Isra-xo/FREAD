import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { voteOnHilo } from '../services/apiService';
import { useNotification } from '../context/NotificationContext';
import './PostCard.css';

const PostCard = ({ post }) => {
    const { user } = useAuth();
    const [votes, setVotes] = useState(post.votos || 0);
    const [saved, setSaved] = useState(false);
    const { showToast } = useNotification();

    const loggedInUserId = user ? user['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] : null;

    const handleVote = async (e, direction) => {
        e.preventDefault(); // Evita que el clic en el botón navegue a la página del hilo
        try {
            const response = await voteOnHilo(post.id, { direction });
            setVotes(response.data.newVoteCount);
        } catch (error) {
            console.error("Debes iniciar sesión para votar:", error);
        }
    };

    const handleShare = async (e) => {
        e.preventDefault();
        try {
            const url = window.location.origin + `/hilo/${post.id}`;
            await navigator.clipboard.writeText(url);
            showToast('¡Enlace copiado al portapapeles!', 'success');
        } catch (err) {
            console.error('Error copiando enlace:', err);
            showToast('No se pudo copiar el enlace.', 'error');
        }
    };

    const handleSave = (e) => {
        e.preventDefault();
        setSaved(true);
        showToast('Próximamente: Podrás guardar hilos en tu perfil', 'info');
        setTimeout(() => setSaved(false), 2000);
        // Future: call API to save thread for user
    };
    
    return (
        <div className="post-card">
            <div className="post-voting">
                <button className="vote-btn" onClick={(e) => handleVote(e, "up")}>▲</button>
                <span>{votes}</span>
                <button className="vote-btn" onClick={(e) => handleVote(e, "down")}>▼</button>
            </div>
            <div className="post-content">
                <p className="post-meta">
                    Publicado por u/{post.usuario?.nombreUsuario || 'desconocido'} • 
                    {post.foro ? (
                        <Link to={`/foro/${post.foro.id}`} className="foro-link">f/{post.foro.nombreForo}</Link>
                    ) : (
                        'f/Desconocido'
                    )}
                </p>
                <Link to={`/hilo/${post.id}`} className="post-title-link">
                    <h3 className="post-title">{post.titulo}</h3>
                </Link>
                <div className="post-actions">
                    <Link to={`/hilo/${post.id}`}>Comentarios</Link>
                    <button type="button" className={`post-action-btn ${saved ? 'saved' : ''}`} aria-label="Compartir" onClick={handleShare}>Compartir</button>
                    <button type="button" className={`post-action-btn ${saved ? 'saved' : ''}`} aria-label="Guardar publicación" onClick={handleSave}>{saved ? 'Próximamente...' : 'Guardar'}</button>
                    {post.usuarioId && Number(loggedInUserId) === post.usuarioId && (
                        <button className="btn-delete">Eliminar</button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PostCard;