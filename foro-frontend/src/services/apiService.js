import axios from 'axios';

const API_URL = 'http://localhost:5153/api'; 

const apiClient = axios.create({
    baseURL: API_URL,
});

apiClient.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

export const register = (userData) => apiClient.post('/Auth/register', userData);
export const login = (userData) => apiClient.post('/Auth/login', userData);
export const getMenuItemsForUser = () => apiClient.get('/Auth/menu');

// --- FOROS ---
// getForos ahora acepta parámetros de paginación y devuelve PagedResult<Foro>
export const getForos = (pageNumber = 1, pageSize = 10) => 
    apiClient.get('/Foros', { params: { pageNumber, pageSize } });
export const getForoById = (foroId) => apiClient.get(`/Foros/${foroId}`);
export const createForo = (foroData) => apiClient.post('/Foros', foroData);
export const updateForo = (foroId, foroData) => apiClient.put(`/Foros/${foroId}`, foroData);
export const deleteForo = (foroId) => apiClient.delete(`/Foros/${foroId}`);

// --- HILOS ---
// getHilos ahora acepta parámetros de paginación y búsqueda, devuelve PagedResult<Hilo>
export const getHilos = (pageNumber = 1, pageSize = 10, searchTerm = null) => {
    const params = { pageNumber, pageSize };
    if (searchTerm) {
        params.searchTerm = searchTerm;
    }
    return apiClient.get('/Hilos', { params });
};
export const getHiloById = (hiloId) => apiClient.get(`/Hilos/${hiloId}`);
export const createHilo = (hiloData) => apiClient.post('/Hilos', hiloData);
export const deleteHilo = (hiloId) => apiClient.delete(`/Hilos/${hiloId}`);
export const voteOnHilo = (hiloId, voteData) => apiClient.post(`/Hilos/${hiloId}/vote`, voteData);

// --- COMENTARIOS ---
// Now supports optional pagination params (pageNumber, pageSize)
export const getComentariosByHiloId = (hiloId, pageNumber = 1, pageSize = 10) =>
    apiClient.get(`/Hilos/${hiloId}/Comentarios`, { params: { pageNumber, pageSize } });
export const createComentario = (hiloId, comentarioData) => apiClient.post(`/Hilos/${hiloId}/Comentarios`, comentarioData);
export const getComentariosByUserId = (userId, pageNumber = 1, pageSize = 10) =>
    apiClient.get(`/Comentarios/ByUser/${userId}`, { params: { pageNumber, pageSize } });

// --- USUARIOS Y PERFIL (FUNCIONES NUEVAS) ---
export const getUsuarioById = (userId) => apiClient.get(`/Usuarios/${userId}`);
export const updateUsuario = (userId, userData) => apiClient.put(`/Usuarios/${userId}`, userData);
export const uploadProfilePicture = (userId, formData) => {
    return apiClient.post(`/Usuarios/${userId}/uploadPicture`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};
export const getHilosByUserId = (userId, pageNumber = 1, pageSize = 10) =>
    apiClient.get(`/Hilos/ByUsuario/${userId}`, { params: { pageNumber, pageSize } });
export const getForosByUserId = (userId, pageNumber = 1, pageSize = 10) =>
    apiClient.get(`/Foros/ByUsuario/${userId}`, { params: { pageNumber, pageSize } }); // Asume foros creados por el usuario

// --- ADMINISTRACIÓN ---
export const getUsers = () => apiClient.get('/Admin/users');
export const deleteUser = (userId) => apiClient.delete(`/Admin/users/${userId}`);
export const changeUserRole = (userId, newRoleId) => apiClient.put(`/Admin/users/${userId}/role`, { newRoleId });

// --- OTROS ---
export const getMenuItems = () => apiClient.get('/MenuItems');