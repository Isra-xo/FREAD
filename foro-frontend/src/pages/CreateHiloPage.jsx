import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createHilo, getForos } from '../services/apiService';
import { extractItems } from '../services/apiHelpers';
import './CreateHiloPage.css';

const CreateHiloPage = () => {
    const [titulo, setTitulo] = useState('');
    const [contenido, setContenido] = useState('');
    const [foroId, setForoId] = useState('');
    const [foros, setForos] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchForos = async () => {
            try {
                const response = await getForos();
                const items = extractItems(response);
                setForos(items);
                if (items.length > 0) {
                    setForoId(items[0].id);
                }
            } catch (err) {
                setError("No se pudieron cargar las comunidades.");
            }
        };
        fetchForos();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!foroId) {
            setError("Debes seleccionar una comunidad.");
            return;
        }
        try {
            await createHilo({ titulo, contenido, foroId: Number(foroId) });
            navigate('/'); 
        } catch (err) {
            setError("No se pudo crear el hilo.");
        }
    };

    return (
        <div className="create-post-container">
            <h2 className="page-title">Crear un Nuevo Hilo</h2>
            <form onSubmit={handleSubmit} className="post-form">
                {error && <p className="error-message">{error}</p>}
                
                <div className="form-group">
                    <label htmlFor="comunidad">Comunidad</label>
                    <select id="comunidad" value={foroId} onChange={(e) => setForoId(e.target.value)} required>
                        <option value="" disabled>Selecciona una comunidad</option>
                        {foros.map(foro => (
                            <option key={foro.id} value={foro.id}>
                                f/{foro.nombreForo}
                            </option>
                        ))}
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
                    <button type="submit" className="btn btn-primary">Publicar Hilo</button>
                </div>
            </form>
        </div>
    );
};

export default CreateHiloPage;