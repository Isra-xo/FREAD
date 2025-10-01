import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { voteOnHilo } from '../services/apiService';
import './PostCard.css';

const PostCard = ({ post }) => {
    const { user } = useAuth();
    const [votes, setVotes] = useState(post.votos || 0);

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
    
    return (
        <div className="post-card">
            <div className="post-voting">
                <button className="vote-btn" onClick={(e) => handleVote(e, "up")}>▲</button>
                <span>{votes}</span>
                <button className="vote-btn" onClick={(e) => handleVote(e, "down")}>▼</button>
            </div>
            <div className="post-content">
                <p className="post-meta">
                    Publicado por u/{post.usuario?.nombreUsuario || 'desconocido'}
                </p>
                <Link to={`/hilo/${post.id}`} className="post-title-link">
                    <h3 className="post-title">{post.titulo}</h3>
                </Link>
                <div className="post-actions">
                    <Link to={`/hilo/${post.id}`}>Comentarios</Link>
                    <a href="#">Compartir</a>
                    <a href="#">Guardar</a>
                    {post.usuarioId && Number(loggedInUserId) === post.usuarioId && (
                        <button className="btn-delete">Eliminar</button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PostCard;