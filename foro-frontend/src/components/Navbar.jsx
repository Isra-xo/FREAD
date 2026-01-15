import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationCenter from './NotificationCenter';
import './Navbar.css';

const Navbar = ({ searchTerm, setSearchTerm }) => {
    // 1. Obtenemos 'menuItems' del contexto, además de 'user' y 'logout'
    const { user, logout, menuItems } = useAuth();
    const location = useLocation();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Hooks ANTES de cualquier return condicional
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    //  Returns condicionales DESPUÉS de los hooks
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
                    <Link to="/login" className="btn-secondary">Login</Link>
                </div>
            </header>
        );
    }

    const userName = user.name;

    const handleLogout = () => {
        logout();
        setIsDropdownOpen(false);
    };

    return (
        <header className="navbar-header">
            {/* FONDO ANIMADO MESH GRADIENT */}
            <div className="navbar-gradient-bg"></div>

            <div className="navbar-left">
                <Link to="/" className="navbar-brand">
                    <span className="brand-gradient">FREAD</span>
                </Link>
                
                {/* --- RENDERIZADO DINÁMICO DEL MENÚ --- */}
                <nav className="nav-links-container">
                    {menuItems.map(item => (
                        <Link key={item.id} to={item.url} className="nav-link">
                            {item.titulo}
                        </Link>
                    ))}
                </nav>
            </div>

            <div className="navbar-center">
                <div className="search-container">
                    <input 
                        type="search" 
                        placeholder="Busca hilos interesantes ..." 
                        className="search-bar"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        aria-label="Buscar"
                    />
                    <span className="search-icon">🔍</span>
                </div>
            </div>

            <div className="navbar-right">
                
                {(menuItems?.some(mi => mi.url === '/crear-hilo') || user?.role === 'Administrador') && (
                    <Link to="/crear-hilo" className="btn-create-thread">
                        <span className="btn-gradient-bg"></span>
                        <span className="btn-text">Crear Hilo</span>
                    </Link>
                )}

                {/* NOTIFICATION CENTER - CAMPANITA DE NOTIFICACIONES (FASE 10) */}
                <NotificationCenter />

                {/*  DROPDOWN DE CUENTA CON TRANSICIONES SUAVES */}
                <div className="dropdown" ref={dropdownRef}>
                    <button 
                        className={`dropdown-btn ${isDropdownOpen ? 'active' : ''}`}
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        aria-label="Menú de cuenta"
                        aria-expanded={isDropdownOpen}
                    >
                        <span className="account-icon">👤</span>
                        <span className="account-text">{userName}</span>
                        <span className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}>▼</span>
                    </button>
                    
                    {isDropdownOpen && (
                        <div className="dropdown-content">
                            <Link to="/perfil" className="dropdown-item">
                                <span className="item-icon">⚙️</span>
                                Mi Perfil
                            </Link>
                            <button 
                                type="button" 
                                className="dropdown-item logout-btn" 
                                onClick={handleLogout}
                                aria-label="Cerrar sesión"
                            >
                                <span className="item-icon"></span>
                                Cerrar Sesión
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;