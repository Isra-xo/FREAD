import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUsers, deleteUser, changeUserRole } from '../services/apiService';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import './AdminPage.css';

const AdminPage = () => {
    const navigate = useNavigate();
    const { logout, user } = useAuth(); 
    const [users, setUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const { showToast } = useNotification();
    
    const roles = [{ id: 1, nombreRol: 'Administrador' }, { id: 2, nombreRol: 'Usuario' }];

    const fetchUsers = async (pageNumber = 1) => {
        try {
            const response = await getUsers(pageNumber, 10);
            const data = response.data;
            setUsers(Array.isArray(data.items) ? data.items : data.Items || []);
            setTotalPages(data.totalPages || data.TotalPages || 1);
            setTotalCount(data.totalCount || data.TotalCount || 0);
            setCurrentPage(pageNumber);
        } catch (error) {
            showToast('No tienes permiso para ver esta página', 'error');
        }
    };

    useEffect(() => {
        fetchUsers(currentPage);
    }, [currentPage]);

    const handleRoleChange = async (userId, newRoleId) => {
        try {
            //  SEGURIDAD: Comparación numérica estricta de identidad
            const currentUserId = user ? Number(user.id || user.nameid || user.sub) : null;
            const targetUserId = Number(userId);
            const isSelfRoleChange = Boolean(
                currentUserId !== null &&
                !isNaN(currentUserId) &&
                !isNaN(targetUserId) &&
                currentUserId === targetUserId
            );

            // CALL: Cambiar rol y crear notificación en BD
            await changeUserRole(userId, newRoleId);

            // OPTIMISTIC: Actualizar UI inmediatamente
            const newRoleObj = roles.find(r => r.id === newRoleId);
            setUsers(users.map(u => u.id === userId ? { ...u, rolId: newRoleId, rol: newRoleObj } : u));

            // AUTO-LOGOUT: Si es cambio de rol propio
            if (isSelfRoleChange) {
                showToast('Has cambiado tu propio rol. Cerrando sesión...', 'warning');
                setTimeout(() => {
                    logout(); 
                    navigate('/login');
                }, 3000);
            } else {
                showToast('Rol actualizado y notificación enviada', 'success');
                fetchUsers(currentPage); 
            }
        } catch (error) {
            showToast('Error al actualizar rol', 'error');
        }
    };

    return (
        <div className="admin-wrapper">
            <div className="admin-container">
                <div className="admin-header">
                    <h1> Panel de Administración</h1>
                    <p className="subtitle">Gestiona usuarios y roles del sistema</p>
                </div>

                <div className="users-section">
                    <div className="section-header">
                        <h2>👥 Gestionar Usuarios</h2>
                        <span className="badge">{totalCount}</span>
                    </div>

                    <div className="users-list">
                        {users.length > 0 ? (
                            users.map(u => (
                                <div key={u.id} className="user-card">
                                    <div className="user-avatar">
                                        <span className="avatar-letter">
                                            {u.nombreUsuario.charAt(0).toUpperCase()}
                                        </span>
                                    </div>

                                    <div className="user-info">
                                        <p className="user-name">ID: {u.id} - {u.nombreUsuario}</p>
                                        <p className="user-email">{u.email}</p>
                                    </div>

                                    <div className="user-actions">
                                        <div className="role-wrapper">
                                            <select 
                                                value={u.rolId} 
                                                onChange={(e) => handleRoleChange(u.id, parseInt(e.target.value))}
                                                className="role-select"
                                            >
                                                {roles.map(rol => (
                                                    <option key={rol.id} value={rol.id}>{rol.nombreRol}</option>
                                                ))}
                                            </select>
                                        </div>
                                        
                                        <button 
                                            onClick={() => deleteUser(u.id).then(() => fetchUsers(currentPage))} 
                                            className="btn-delete"
                                            title="Eliminar usuario"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-state">
                                <p className="empty-icon">👥</p>
                                <p>No hay usuarios para mostrar</p>
                            </div>
                        )}
                    </div>

                    {totalPages > 1 && (
                        <div className="pagination">
                            <button 
                                onClick={() => setCurrentPage(p => p - 1)} 
                                disabled={currentPage === 1}
                                className="pagination-btn"
                            >
                                ← Anterior
                            </button>
                            <span className="pagination-info">Página {currentPage} de {totalPages}</span>
                            <button 
                                onClick={() => setCurrentPage(p => p + 1)} 
                                disabled={currentPage === totalPages}
                                className="pagination-btn"
                            >
                                Siguiente →
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminPage;