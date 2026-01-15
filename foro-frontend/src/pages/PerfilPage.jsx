import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUsuarioById, updateUsuario, uploadProfilePicture, getHilosByUserId, getForosByUserId } from '../services/apiService';
import { extractItems, getTotalPages } from '../services/apiHelpers';
import './PerfilPage.css';

const PerfilPage = () => {
    const { user } = useAuth();
    const [userData, setUserData] = useState(null);
    const [hilos, setHilos] = useState([]);
    const [hilosPage, setHilosPage] = useState(1);
    const [hilosTotalPages, setHilosTotalPages] = useState(1);
    const [foros, setForos] = useState([]);
    const [forosPage, setForosPage] = useState(1);
    const [forosTotalPages, setForosTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    
    const [newNombreUsuario, setNewNombreUsuario] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [profilePictureFile, setProfilePictureFile] = useState(null);
    const [profilePicturePreview, setProfilePicturePreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            if (user && user.id) {
                setLoading(true);
                setError('');
                try {
                    const [userRes, hilosRes, forosRes] = await Promise.all([
                        getUsuarioById(user.id),
                        getHilosByUserId(user.id, hilosPage, 10),
                        getForosByUserId(user.id, forosPage, 10)
                    ]);
                    
                    setUserData(userRes.data);
                    setHilos(extractItems(hilosRes));
                    setHilosTotalPages(getTotalPages(hilosRes));
                    setForos(extractItems(forosRes));
                    setForosTotalPages(getTotalPages(forosRes));
                    setNewNombreUsuario(userRes.data.nombreUsuario);
                    setNewEmail(userRes.data.email);
                } catch (err) {
                    setError("No se pudo cargar la información del perfil.");
                    console.error(err);
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
                setError("Usuario no autenticado.");
            }
        };
        fetchUserData();
    }, [user, hilosPage, forosPage]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setProfilePictureFile(file);
        if (file) {
            setProfilePicturePreview(URL.createObjectURL(file));
        } else {
            setProfilePicturePreview(null);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        const updates = {};
        if (newNombreUsuario !== userData.nombreUsuario) updates.nombreUsuario = newNombreUsuario;
        if (newEmail !== userData.email) updates.email = newEmail;
        
        if (newPassword) {
            if (newPassword !== confirmNewPassword) {
                setError("Las nuevas contraseñas no coinciden.");
                setIsSubmitting(false);
                return;
            }
            if (!oldPassword) {
                setError("Debes ingresar tu contraseña actual para cambiarla.");
                setIsSubmitting(false);
                return;
            }
            updates.oldPassword = oldPassword;
            updates.newPassword = newPassword;
        }

        try {
            if (Object.keys(updates).length > 0) {
                await updateUsuario(user.id, updates);
            }

            if (profilePictureFile) {
                const formData = new FormData();
                formData.append('file', profilePictureFile);
                await uploadProfilePicture(user.id, formData);
            }

            alert("Perfil actualizado con éxito.");
            setIsEditing(false);
            setIsSubmitting(false);
            window.location.reload();
        } catch (err) {
            setError(err.response?.data?.message || "Error al actualizar el perfil.");
            setIsSubmitting(false);
        }
    };
    
    if (loading) return <div className="profile-page-container"><p>Cargando perfil...</p></div>;
    if (error) return <div className="profile-page-container"><p className="error-message">{error}</p></div>;
    if (!userData) return <div className="profile-page-container"><p>No se encontró información del usuario.</p></div>;

    return (
        <div className="perfil-wrapper">
            <div className="perfil-container">
                <div className="perfil-header">
                    <div className="avatar-section">
                        <div className="avatar-pro">
                            <img 
                                src={userData.profilePictureUrl ? `${"http://localhost:5153"}${userData.profilePictureUrl}` : `https://ui-avatars.com/api/?name=${userData.nombreUsuario.replace(' ', '+')}&background=random`}
                                alt="Foto de perfil" 
                                className="avatar-image" 
                            />
                        </div>
                    </div>
                    
                    <div className="header-info">
                        <h1 className="profile-title">{userData.nombreUsuario}</h1>
                        <p className="profile-email">{userData.email}</p>
                        <p className="profile-role">{user.role}</p>
                        <button className="btn-edit-profile" onClick={() => {
                            setIsEditing(!isEditing);
                            if (isEditing) {
                                setIsSaved(false);
                            }
                        }}>
                            {isEditing ? 'Cancelar' : 'Editar Perfil'}
                        </button>
                    </div>
                </div>
                
                {isEditing && (
                    <form onSubmit={handleUpdateProfile} className="settings-form">
                        <div className="form-header">
                            <h2>Ajustes de Perfil</h2>
                            <p className="subtitle">Actualiza tu información personal y seguridad</p>
                        </div>
                        
                        {error && <div className="error-banner">{error}</div>}

                        <div className="form-section">
                            <h3 className="section-title">Información Personal</h3>
                            <div className="form-group">
                                <label>Nombre de Usuario</label>
                                <input 
                                    type="text" 
                                    value={newNombreUsuario} 
                                    onChange={(e) => setNewNombreUsuario(e.target.value)} 
                                    required 
                                    disabled={!isEditing || isSubmitting}
                                />
                            </div>
                            <div className="form-group">
                                <label>Correo Electrónico</label>
                                <input 
                                    type="email" 
                                    value={newEmail} 
                                    onChange={(e) => setNewEmail(e.target.value)} 
                                    required 
                                    disabled={!isEditing || isSubmitting}
                                />
                            </div>
                        </div>

                        <div className="form-section">
                            <h3 className="section-title">Seguridad</h3>
                            <div className="form-group">
                                <label>Contraseña Actual <span className="optional">(solo si cambias contraseña)</span></label>
                                <input 
                                    type="password" 
                                    value={oldPassword} 
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    disabled={!isEditing || isSubmitting}
                                />
                            </div>
                            <div className="form-group">
                                <label>Nueva Contraseña</label>
                                <input 
                                    type="password" 
                                    value={newPassword} 
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    disabled={!isEditing || isSubmitting}
                                />
                            </div>
                            <div className="form-group">
                                <label>Confirmar Nueva Contraseña</label>
                                <input 
                                    type="password" 
                                    value={confirmNewPassword} 
                                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                                    disabled={!isEditing || isSubmitting}
                                />
                            </div>
                        </div>

                        <div className="form-section">
                            <h3 className="section-title">Foto de Perfil</h3>
                            <div className="form-group">
                                <label>Selecciona una imagen</label>
                                <div className="file-input-wrapper">
                                    <input 
                                        type="file" 
                                        id="file-upload" 
                                        accept="image/*" 
                                        onChange={handleFileChange}
                                        disabled={!isEditing || isSubmitting}
                                    />
                                    <label htmlFor="file-upload" className="btn-file-upload">Elegir Archivo</label>
                                    <span className="file-name">{profilePictureFile ? profilePictureFile.name : "Sin archivo seleccionado"}</span>
                                </div>
                                {profilePicturePreview && (
                                    <div className="preview-section">
                                        <p className="preview-label">Vista Previa:</p>
                                        <img src={profilePicturePreview} alt="Previsualización" className="avatar-preview" />
                                    </div>
                                )}
                            </div>
                        </div>

                        <button type="submit" className="btn-save" disabled={isSubmitting}>
                            {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </form>
                )}

                <div className="activity-section">
                    <div className="activity-card">
                        <h3 className="card-title">Mis Hilos Creados</h3>
                        <p className="card-count">{hilos.length} hilos</p>
                        <div className="activity-list">
                            {hilos.length > 0 ? hilos.map(hilo => (
                                <div key={hilo.id} className="activity-item">
                                    <Link to={`/hilo/${hilo.id}`} className="item-link">{hilo.titulo}</Link>
                                    <p className="item-meta">en f/{hilo.foro?.nombreForo}</p>
                                </div>
                            )) : <p className="empty-state">No has creado ningún hilo.</p>}
                        </div>
                        <div className="pagination">
                            <button 
                                aria-label="Página anterior" 
                                onClick={() => setHilosPage(p => Math.max(1, p - 1))} 
                                disabled={hilosPage === 1}
                                className="pagination-btn"
                            >
                                ← Anterior
                            </button>
                            <span className="pagination-info">Página {hilosPage} de {hilosTotalPages}</span>
                            <button 
                                aria-label="Página siguiente" 
                                onClick={() => setHilosPage(p => Math.min(hilosTotalPages, p + 1))} 
                                disabled={hilosPage === hilosTotalPages}
                                className="pagination-btn"
                            >
                                Siguiente →
                            </button>
                        </div>
                    </div>
                    
                    <div className="activity-card">
                        <h3 className="card-title">Foros Creados</h3>
                        <p className="card-count">{foros.length} foros</p>
                        <div className="activity-list">
                            {foros.length > 0 ? foros.map(foro => (
                                <div key={foro.id} className="activity-item">
                                    <Link to={`/foro/${foro.id}`} className="item-link">f/{foro.nombreForo}</Link>
                                </div>
                            )) : <p className="empty-state">No has creado ningún foro.</p>}
                        </div>
                        <div className="pagination">
                            <button 
                                aria-label="Página anterior" 
                                onClick={() => setForosPage(p => Math.max(1, p - 1))} 
                                disabled={forosPage === 1}
                                className="pagination-btn"
                            >
                                ← Anterior
                            </button>
                            <span className="pagination-info">Página {forosPage} de {forosTotalPages}</span>
                            <button 
                                aria-label="Página siguiente" 
                                onClick={() => setForosPage(p => Math.min(forosTotalPages, p + 1))} 
                                disabled={forosPage === forosTotalPages}
                                className="pagination-btn"
                            >
                                Siguiente →
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PerfilPage;