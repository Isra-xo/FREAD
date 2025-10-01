import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createForo } from '../services/apiService';
import './CreateForoPage.css'; 

const CreateForoPage = () => {
    const [nombreForo, setNombreForo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createForo({ nombreForo, descripcion });
            navigate('/crear-hilo');
        } catch (err) {
            console.error("Error al crear el foro:", err);
            setError("No se pudo crear el foro. Inténtalo de nuevo.");
        }
    };

    return (
        <div className="create-foro-container">
            <div className="form-panel">
                <h2>Cuéntanos sobre tu comunidad</h2>
                <p className="subtitle">Un nombre y una descripción ayudan a la gente a entender de qué se trata.</p>
                
                <form onSubmit={handleSubmit}>
                    {error && <p className="error-message">{error}</p>}

                    <div className="form-group">
                        <label>Nombre de la Comunidad</label>
                        <input
                            type="text"
                            placeholder="Ej: f/Videojuegos"
                            value={nombreForo}
                            onChange={(e) => setNombreForo(e.target.value)}
                            maxLength="21"
                            required
                        />
                        <small>{21 - nombreForo.length} caracteres restantes</small>
                    </div>

                    <div className="form-group">
                        <label>Descripción</label>
                        <textarea
                            placeholder="Describe de qué trata tu comunidad..."
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                            maxLength="300"
                            rows="5"
                            required
                        />
                        <small>{300 - descripcion.length} caracteres restantes</small>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn btn-secondary" onClick={() => navigate('/')}>Cancelar</button>
                        <button type="submit" className="btn btn-primary">Crear Comunidad</button>
                    </div>
                </form>
            </div>

            <div className="preview-panel">
                <h4>Vista Previa</h4>
                <div className="preview-card">
                    <div className="preview-header">f/{nombreForo || 'nombrecomunidad'}</div>
                    <div className="preview-body">
                        <p>{descripcion || 'La descripción de tu comunidad aparecerá aquí.'}</p>
                    </div>
                    <div className="preview-footer">
                        <span><strong>1</strong> miembro</span>
                        <span>•</span>
                        <span><strong>1</strong> en línea</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateForoPage;