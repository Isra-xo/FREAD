import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { voteOnHilo, deleteHilo } from '../services/apiService';
import { useNotification } from '../context/NotificationContext';
import './PostCard.css';

const PostCard = ({ post, onDelete }) => {
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

    const handleDelete = async (e) => {
        e.preventDefault();

        // 🔐 Pedir confirmación al usuario
        const confirmDelete = window.confirm(
            `¿Estás seguro de que deseas eliminar el hilo "${post.titulo}"? Esta acción no se puede deshacer.`
        );

        if (!confirmDelete) {
            return;
        }

        try {
            // 🚀 Actualización optimista: llamar a onDelete para remover del UI inmediatamente
            if (onDelete) {
                onDelete(post.id);
            }

            // Llamar API de forma asincrónica
            await deleteHilo(post.id);

            // Mostrar toast de éxito
            showToast('Hilo eliminado exitosamente', 'success');
        } catch (error) {
            console.error('Error eliminando hilo:', error);
            
            // En caso de error, mostrar toast
            showToast('No se pudo eliminar el hilo. Intenta de nuevo.', 'error');

            // Nota: En un caso real, se podría revertir la actualización optimista
            // llamando a onDelete nuevamente con el ID original o refrescando la lista
        }
    };
    
    return (
        <div className="post-card-container">
            <div className="post-card">
                {/* COLUMNA DE VOTACIÓN */}
                <div className="post-voting">
                    <button 
                        className="vote-btn vote-up" 
                        onClick={(e) => handleVote(e, "up")}
                        aria-label="Votar arriba"
                        title="Upvote"
                    >
                        ▲
                    </button>
                    <span className="vote-count">{votes}</span>
                    <button 
                        className="vote-btn vote-down" 
                        onClick={(e) => handleVote(e, "down")}
                        aria-label="Votar abajo"
                        title="Downvote"
                    >
                        ▼
                    </button>
                </div>

                {/* 📝 CONTENIDO PRINCIPAL */}
                <div className="post-content">
                    {/* Meta información */}
                    <p className="post-meta">
                        <span className="meta-user">u/{post.usuario?.nombreUsuario || 'desconocido'}</span>
                        <span className="meta-separator">•</span>
                        {post.foro ? (
                            <Link to={`/foro/${post.foro.id}`} className="foro-link">
                                f/{post.foro.nombreForo}
                            </Link>
                        ) : (
                            <span>f/Desconocido</span>
                        )}
                    </p>

                    {/* Título */}
                    <Link to={`/hilo/${post.id}`} className="post-title-link">
                        <h3 className="post-title">{post.titulo}</h3>
                    </Link>

                    {/* Cuerpo del post (truncado a 3 líneas) */}
                    {post.contenido && (
                        <p className="post-body">{post.contenido}</p>
                    )}

                    {/* Acciones */}
                    <div className="post-actions">
                        <Link to={`/hilo/${post.id}`} className="post-action-item comments-action">
                            <span className="action-icon">💬</span>
                            <span>Comentarios</span>
                        </Link>
                        
                        <button 
                            type="button" 
                            className="post-action-item share-action" 
                            aria-label="Compartir" 
                            onClick={handleShare}
                        >
                            <span className="action-icon">🔗</span>
                            <span>Compartir</span>
                        </button>
                        
                        <button 
                            type="button" 
                            className={`post-action-item save-action ${saved ? 'saved' : ''}`}
                            aria-label="Guardar publicación" 
                            onClick={handleSave}
                        >
                            <span className="action-icon">⭐</span>
                            <span>{saved ? 'Próximamente...' : 'Guardar'}</span>
                        </button>

                        {post.usuarioId && Number(loggedInUserId) === post.usuarioId && (
                            <button 
                                className="post-action-item delete-action" 
                                aria-label="Eliminar post"
                                onClick={handleDelete}
                                title="Eliminar este hilo"
                            >
                                <span className="action-icon">🗑️</span>
                                <span>Eliminar</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostCard;