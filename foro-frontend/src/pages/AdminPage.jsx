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
            // 🔴 SEGURIDAD BLINDADA: Comparación numérica estricta de identidad
            const currentUserId = user ? Number(user.id || user.nameid || user.sub) : null;
            const targetUserId = Number(userId);
            const isSelfRoleChange = Boolean(
                currentUserId !== null &&
                !isNaN(currentUserId) &&
                !isNaN(targetUserId) &&
                currentUserId === targetUserId
            );

            // 🟡 CALL: Cambiar rol y crear notificación en BD
            await changeUserRole(userId, newRoleId);

            // 🟢 OPTIMISTIC: Actualizar UI inmediatamente
            const newRoleObj = roles.find(r => r.id === newRoleId);
            setUsers(users.map(u => u.id === userId ? { ...u, rolId: newRoleId, rol: newRoleObj } : u));

            // 🔴 AUTO-LOGOUT: Si es cambio de rol propio
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
        <div className="admin-container">
            <h1>Panel de Administración</h1>
            <h2>Gestionar Usuarios ({totalCount})</h2>
            <div className="table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Email</th>
                            <th>Rol</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u.id}>
                                <td>{u.id}</td>
                                <td>{u.nombreUsuario}</td>
                                <td>{u.email}</td>
                                <td>
                                    <select 
                                        value={u.rolId} 
                                        onChange={(e) => handleRoleChange(u.id, parseInt(e.target.value))}
                                        className="role-select"
                                    >
                                        {roles.map(rol => (
                                            <option key={rol.id} value={rol.id}>{rol.nombreRol}</option>
                                        ))}
                                    </select>
                                </td>
                                <td>
                                    <button onClick={() => deleteUser(u.id).then(() => fetchUsers(currentPage))} className="btn-delete">Eliminar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="pagination">
                <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}>Anterior</button>
                <span>{currentPage} de {totalPages}</span>
                <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}>Siguiente</button>
            </div>
        </div>
    );
};

export default AdminPage;