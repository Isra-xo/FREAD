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
    
    const [newNombreUsuario, setNewNombreUsuario] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [profilePictureFile, setProfilePictureFile] = useState(null);
    const [profilePicturePreview, setProfilePicturePreview] = useState(null);

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
        const updates = {};
        if (newNombreUsuario !== userData.nombreUsuario) updates.nombreUsuario = newNombreUsuario;
        if (newEmail !== userData.email) updates.email = newEmail;
        
        if (newPassword) {
            if (newPassword !== confirmNewPassword) return setError("Las nuevas contraseñas no coinciden.");
            if (!oldPassword) return setError("Debes ingresar tu contraseña actual para cambiarla.");
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
            window.location.reload();
        } catch (err) {
            setError(err.response?.data?.message || "Error al actualizar el perfil.");
        }
    };
    
    if (loading) return <div className="profile-page-container"><p>Cargando perfil...</p></div>;
    if (error) return <div className="profile-page-container"><p className="error-message">{error}</p></div>;
    if (!userData) return <div className="profile-page-container"><p>No se encontró información del usuario.</p></div>;

    return (
        <div className="profile-page-container">
            <h1>Mi Perfil</h1>
            <div className="profile-header">
                <img 
                    src={userData.profilePictureUrl ? `${"http://localhost:5153"}${userData.profilePictureUrl}` : `https://ui-avatars.com/api/?name=${userData.nombreUsuario.replace(' ', '+')}&background=random`}
                    alt="Foto de perfil" 
                    className="profile-picture" 
                />
                <div className="user-info">
                    <h2>{userData.nombreUsuario}</h2>
                    <p>{userData.email}</p>
                    <p>Rol: {user.role}</p>
                    <button className="btn" onClick={() => setIsEditing(!isEditing)}>
                        {isEditing ? 'Cancelar' : 'Editar Perfil'}
                    </button>
                </div>
            </div>
            
            {isEditing && (
                <form onSubmit={handleUpdateProfile} className="profile-edit-form">
                    <h3>Actualizar Información</h3>
                    {error && <p className="error-message">{error}</p>}
                    <div className="form-group">
                        <label>Nombre de Usuario:</label>
                        <input type="text" value={newNombreUsuario} onChange={(e) => setNewNombreUsuario(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Email:</label>
                        <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required />
                    </div>
                    <hr />
                    <div className="form-group">
                        <label>Contraseña Actual (solo si quieres cambiarla):</label>
                        <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label>Nueva Contraseña:</label>
                        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label>Confirmar Nueva Contraseña:</label>
                        <input type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} />
                    </div>
                    <hr />
                    <div className="form-group">
                        <label>Foto de Perfil:</label>
                        <div className="file-input-container">
                            <input type="file" id="file-upload" accept="image/*" onChange={handleFileChange} />
                            <label htmlFor="file-upload" className="btn btn-secondary">Elegir Archivo</label>
                            <span className="file-name">{profilePictureFile ? profilePictureFile.name : "No se eligió ningún archivo"}</span>
                        </div>
                        {profilePicturePreview && (<img src={profilePicturePreview} alt="Previsualización" className="profile-picture-preview" />)}
                    </div>
                    <button type="submit" className="btn btn-primary">Guardar Cambios</button>
                </form>
            )}

            <div className="profile-sections">
                <div className="user-hilos">
                    <h3>Mis Hilos Creados ({hilos.length})</h3>
                    <div className="scrollable-list">
                        {hilos.length > 0 ? hilos.map(hilo => (
                            <div key={hilo.id} className="profile-item">
                                <Link to={`/hilo/${hilo.id}`}>{hilo.titulo}</Link>
                                <p className="meta-info">En: f/{hilo.foro?.nombreForo}</p>
                            </div>
                        )) : <p>No has creado ningún hilo.</p>}
                    </div>

                    <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 8 }}>
                        <button aria-label="Ir a página anterior" onClick={() => setHilosPage(p => Math.max(1, p - 1))} disabled={hilosPage === 1}>Anterior</button>
                        <span>Página {hilosPage} de {hilosTotalPages}</span>
                        <button aria-label="Ir a página siguiente" onClick={() => setHilosPage(p => Math.min(hilosTotalPages, p + 1))} disabled={hilosPage === hilosTotalPages}>Siguiente</button>
                    </div>
                </div>
                <div className="user-foros">
                    <h3>Foros Creados ({foros.length})</h3>
                    <div className="scrollable-list">
                        {foros.length > 0 ? foros.map(foro => (
                            <div key={foro.id} className="profile-item">
                                <Link to={`/foro/${foro.id}`}>f/{foro.nombreForo}</Link>
                            </div>
                        )) : <p>No has creado ningún foro.</p>}
                    </div>

                    <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 8 }}>
                        <button aria-label="Ir a página anterior" onClick={() => setForosPage(p => Math.max(1, p - 1))} disabled={forosPage === 1}>Anterior</button>
                        <span>Página {forosPage} de {forosTotalPages}</span>
                        <button aria-label="Ir a página siguiente" onClick={() => setForosPage(p => Math.min(forosTotalPages, p + 1))} disabled={forosPage === forosTotalPages}>Siguiente</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PerfilPage;