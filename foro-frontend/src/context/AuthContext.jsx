import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const processToken = (tokenToProcess) => {
        try {
            const decodedToken = jwtDecode(tokenToProcess);
            if (decodedToken.exp * 1000 > Date.now()) {
                setToken(tokenToProcess);

                setUser({
                    id: decodedToken.nameid || decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
                    name: decodedToken.unique_name || decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
                    role: decodedToken.role || decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
                });
            } else {
                localStorage.removeItem('token');
            }
        } catch (error) {
            localStorage.removeItem('token');
        }
    };

    useEffect(() => {
        const tokenInStorage = localStorage.getItem('token');
        if (tokenInStorage) {
            processToken(tokenInStorage);
        }
        setLoading(false);
    }, []);

    const login = (newToken) => {
        localStorage.setItem('token', newToken);
        processToken(newToken);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    if (loading) {
        return null; 
    }

    return (
        <AuthContext.Provider value={{ token, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};  