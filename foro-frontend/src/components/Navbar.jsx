import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = ({ searchTerm, setSearchTerm }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
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

    const userRole = user.role;
    const userName = user.name;

    const handleLogout = () => {
        logout();
    };

    return (
        <header className="navbar-header">
            <div className="navbar-left">
                <Link to="/" className="navbar-brand">FREAD</Link>
                <Link to="/" className="nav-link">Inicio</Link>
                {userRole === 'Administrador' && (
                    <Link to="/popular" className="nav-link">Administrar</Link>
                )}
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
                {userRole === 'Administrador' && (
                    <Link to="/crear-foro" className="btn">Crear Foro</Link>
                )}
                <Link to="/crear-hilo" className="btn btn-primary">Crear Hilo</Link>
                <div className="dropdown">
                    <button className="btn dropdown-btn">
                        Cuenta ({userName}) ▼
                    </button>
                    <div className="dropdown-content">
                        <Link to="/perfil">Mi Perfil</Link>
                        <a href="#" onClick={handleLogout}>Cerrar Sesión</a>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;