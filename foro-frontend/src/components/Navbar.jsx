import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = ({ searchTerm, setSearchTerm }) => {
    // 1. Obtenemos 'menuItems' del contexto, además de 'user' y 'logout'
    const { user, logout, menuItems } = useAuth();
    const location = useLocation();

    if (location.pathname === '/login' || location.pathname === '/register') {
        return null;
    }

    if (!user) {
        return (
            <header className="navbar-header">
                <div className="navbar-left">
                    <Link to="/" className="navbar-brand">FREAD</Link>
                </div>
                <div className="navbar-right">
                    <Link to="/login" className="btn">Login</Link>
                </div>
            </header>
        );
    }

    const userName = user.name; 

    const handleLogout = () => {
        logout();
    };

    return (
        <header className="navbar-header">
            <div className="navbar-left">
                <Link to="/" className="navbar-brand">FREAD</Link>
                
                {/* --- 2. RENDERIZADO DINÁMICO DEL MENÚ --- */}
                {/* Mapeamos el array 'menuItems' y creamos un Link para cada uno */}
                {menuItems.map(item => (
                    <Link key={item.id} to={item.url} className="nav-link">
                        {item.titulo}
                    </Link>
                ))}
            </div>

            <div className="navbar-center">
                <input 
                    type="search" 
                    placeholder="Buscar en Fread..." 
                    className="search-bar"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="navbar-right">
                
                <Link to="/crear-hilo" className="btn btn-primary">Crear Hilo</Link>
                <div className="dropdown">
                    <button className="btn dropdown-btn">
                        Cuenta ({userName}) ▼
                    </button>
                    <div className="dropdown-content">
                        <Link to="/perfil">Mi Perfil</Link>
                        <button type="button" className="dropdown-link" onClick={handleLogout} aria-label="Cerrar sesión">Cerrar Sesión</button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;