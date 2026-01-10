import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { login as loginService } from '../services/apiService';
import { Link, useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import './AuthForm.css'; 

const LoginPage = () => {
    const [nombreUsuario, setNombreUsuario] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useNotification();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await loginService({ nombreUsuario, password });
            login(response.data);
            navigate('/');
        } catch (err) {
            setError('Usuario o contraseña incorrectos.');
            showToast('Usuario o contrase\u00f1a incorrectos.', 'error');
        }
    };

    return (
        <div className="auth-container"> 
            <div className="auth-box">
                <div className="auth-header">
                    <i className="fab fa-dyalog icon"></i>
                    <h1>Bienvenido a Fread</h1>
                    <p>Inicia sesión para continuar</p>
                </div>
                <form onSubmit={handleSubmit}>
                    {error && <p className="error-message">{error}</p>}
                    <div className="input-group">
                        <i className="fas fa-user"></i>
                        <input type="text" placeholder="Nombre de usuario" required value={nombreUsuario} onChange={e => setNombreUsuario(e.target.value)} />
                    </div>
                    <div className="input-group">
                        <i className="fas fa-lock"></i>
                        <input type="password" placeholder="Contraseña" required value={password} onChange={e => setPassword(e.target.value)} />
                    </div>
                    <div className="options">
                        <button type="button" className="forgot-password" aria-label="Recuperar contraseña">¿Olvidaste tu contraseña?</button>
                    </div>
                    <button type="submit" className="auth-btn">Iniciar Sesión</button>
                </form>
                <div className="auth-link">
                    <p>¿No tienes una cuenta? <Link to="/register">Regístrate</Link></p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;