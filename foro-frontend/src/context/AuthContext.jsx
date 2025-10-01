import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { getMenuItemsForUser } from '../services/apiService'; // <-- 1. Importa la función del API

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(null);
    const [user, setUser] = useState(null);
    const [menuItems, setMenuItems] = useState([]); // <-- 2. Nuevo estado para el menú
    const [loading, setLoading] = useState(true);

    const processToken = async (tokenToProcess) => {
        try {
            const decodedToken = jwtDecode(tokenToProcess);
            if (decodedToken.exp * 1000 > Date.now()) {
                setToken(tokenToProcess);
                setUser({
                    id: decodedToken.nameid || decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
                    name: decodedToken.unique_name || decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
                    role: decodedToken.role || decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
                });
                
                // --- 3. Obtiene el menú del usuario ---
                const response = await getMenuItemsForUser();
                setMenuItems(response.data);

            } else {
                localStorage.removeItem('token');
            }
        } catch (error) {
            console.error("Error al procesar el token:", error);
            localStorage.removeItem('token');
        }
    };

    useEffect(() => {
        const initializeAuth = async () => {
            const tokenInStorage = localStorage.getItem('token');
            if (tokenInStorage) {
                await processToken(tokenInStorage);
            }
            setLoading(false);
        };
        initializeAuth();
    }, []);

    const login = (newToken) => {
        localStorage.setItem('token', newToken);
        processToken(newToken);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        setMenuItems([]); // <-- 4. Limpia el menú al cerrar sesión
    };

    if (loading) {
        return null; 
    }

    return (
        // 5. Expone 'menuItems' a toda la aplicación
        <AuthContext.Provider value={{ token, user, menuItems, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};