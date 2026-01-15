import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createHilo, getForos } from '../services/apiService';
import { extractItems } from '../services/apiHelpers';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import './CreateHiloPage.css';

const CreateHiloPage = () => {
    const [titulo, setTitulo] = useState('');
    const [contenido, setContenido] = useState('');
    const [foroId, setForoId] = useState('');
    const [foros, setForos] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { user, menuItems } = useAuth();
    const { showToast } = useNotification();

    // Determina si el usuario tiene permiso para crear hilos según el menú dinámico o rol
    const canCreate = Boolean(
        user && (
            menuItems?.some(mi => mi.url === '/crear-hilo') ||
            user.role === 'Administrador'
        )
    );

    useEffect(() => {
        const fetchForos = async () => {
            try {
                const response = await getForos();
                const items = extractItems(response);
                setForos(items);
                if (items.length > 0) {
                    setForoId(items[0].id);
                } else {
                    // Notificar que no hay comunidades disponibles
                    showToast("No hay comunidades disponibles. Crea una desde el Panel Admin.", "info");
                }
            } catch (err) {
                // Notificar sobre problemas de conexión a la base de datos
                showToast("Error al conectar con Azure SQL. Inténtalo de nuevo más tarde.", "error");
                setError("No se pudieron cargar las comunidades.");
            }
        };
        fetchForos();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!foroId) {
            setError("Debes seleccionar una comunidad.");
            showToast("Debes seleccionar una comunidad.", "info");
            return;
        }
        try {
            await createHilo({ titulo, contenido, foroId: Number(foroId) });
            showToast("Hilo creado correctamente.", "success");
            navigate('/'); 
        } catch (err) {
            showToast("Error al crear el hilo. Inténtalo de nuevo más tarde.", "error");
            setError("No se pudo crear el hilo.");
        }
    };

    // Requerir autenticación y permisos según menú dinámico
    if (!user) {
        return <div className="not-authorized">Debes iniciar sesión para crear un hilo.</div>;
    }

    if (!canCreate) {
        return <div className="not-authorized">No tienes permisos para crear hilos. Contacta a un administrador.</div>;
    }

    return (
        <div className="create-hilo-wrapper">
            <div className="create-hilo-container">
                <div className="form-header">
                    <h2 className="page-title"> Crear un Nuevo Hilo</h2>
                    <p className="form-subtitle">Comparte tus ideas y comienza una conversación</p>
                </div>

                <form onSubmit={handleSubmit} className="hilo-form">
                    {error && <div className="error-banner">{error}</div>}
                    
                    <div className="form-group">
                        <label htmlFor="comunidad">Comunidad</label>
                        <select id="comunidad" value={foroId} onChange={(e) => setForoId(e.target.value)} required>
                            <option value="" disabled>Selecciona una comunidad</option>
                            {foros.length === 0 ? (
                                <option value="" disabled>No hay comunidades creadas. Contacta a un administrador</option>
                            ) : (
                                foros.map(foro => (
                                    <option key={foro.id} value={foro.id}>
                                        f/{foro.nombreForo}
                                    </option>
                                ))
                            )}
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="titulo">Título</label>
                        <input
                            id="titulo"
                            type="text"
                            placeholder="Un título interesante"
                            value={titulo}
                            onChange={(e) => setTitulo(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="contenido">Contenido (opcional)</label>
                        <textarea
                            id="contenido"
                            placeholder="Escribe tu texto aquí..."
                            rows="10"
                            value={contenido}
                            onChange={(e) => setContenido(e.target.value)}
                        />
                    </div>
                    
                    <div className="form-actions">
                        <button type="submit" className="btn-publish" disabled={foros.length === 0 || !canCreate}>
                            <span className="btn-text">Publicar Hilo</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateHiloPage;