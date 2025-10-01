import React, { useState, useEffect } from 'react';
// Añade la nueva función del apiService
import { getUsers, deleteUser, changeUserRole } from '../services/apiService';
import './AdminPage.css';

const AdminPage = () => {
    const [users, setUsers] = useState([]);
    // Necesitamos los roles para llenar el dropdown
    const [roles, setRoles] = useState([{ id: 1, nombreRol: 'Administrador' }, { id: 2, nombreRol: 'Usuario' }]);

    const fetchUsers = async () => {
        try {
            const response = await getUsers();
            setUsers(response.data);
        } catch (error) {
            console.error("No tienes permiso para ver esta página.", error);
        }
    };

    useEffect(() => {
        fetchUsers();
        // En una aplicación real, también podrías obtener los roles desde la API
        // const fetchRoles = async () => { ... }; fetchRoles();
    }, []);

    const handleDeleteUser = async (userId) => {
        if (window.confirm("¿Seguro que quieres eliminar este usuario?")) {
            await deleteUser(userId);
            fetchUsers();
        }
    };

    const handleRoleChange = async (userId, newRoleId) => {
        try {
            await changeUserRole(userId, newRoleId);
            // Actualiza el estado local para reflejar el cambio inmediatamente
            setUsers(users.map(u => u.id === userId ? { ...u, rolId: newRoleId, rol: roles.find(r => r.id === newRoleId) } : u));
            alert('Rol actualizado con éxito.');
        } catch (error) {
            alert('No se pudo actualizar el rol.');
            console.error(error);
        }
    };

    return (
        <div className="admin-container">
            <h1>Panel de Administración</h1>
            <h2>Gestionar Usuarios</h2>
            <div className="table-container"> {/* Contenedor para el scroll */}
                <table className="admin-table">
                    <thead>
                        {/* ... encabezados de la tabla ... */}
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{user.nombreUsuario}</td>
                                <td>{user.email}</td>
                                <td>
                                    <select 
                                        value={user.rolId} 
                                        onChange={(e) => handleRoleChange(user.id, parseInt(e.target.value))}
                                        className="role-select"
                                    >
                                        {roles.map(rol => (
                                            <option key={rol.id} value={rol.id}>{rol.nombreRol}</option>
                                        ))}
                                    </select>
                                </td>
                                <td>
                                    <button onClick={() => handleDeleteUser(user.id)} className="btn-delete">Eliminar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminPage;