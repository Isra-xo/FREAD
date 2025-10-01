import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register as registerService } from '../services/apiService';
import './AuthForm.css';

const RegisterPage = () => {
    const [nombreUsuario, setNombreUsuario] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }
        setError('');
        try {
            await registerService({ nombreUsuario, email, password });
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data || 'Error al registrar. El email o usuario ya existe.');
        }
    };

    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => navigate('/login'), 2000);
            return () => clearTimeout(timer);
        }
    }, [success, navigate]);

    if (success) {
        return (
            <div className="auth-container">
                <div className="auth-box">
                    <div className="auth-header">
                        <i className="fas fa-check-circle icon"></i>
                        <h1>¡Registro Exitoso!</h1>
                        <p>Serás redirigido para iniciar sesión...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <div className="auth-box">
                <div className="auth-header">
                    <i className="fab fa-dyalog icon"></i>
                    <h1>Crear una Cuenta</h1>
                    <p>Únete a la comunidad de Fread</p>
                </div>
                <form onSubmit={handleSubmit}>
                    {error && <p className="error-message">{error}</p>}
                    <div className="input-group">
                        <i className="fas fa-user"></i>
                        <input type="text" placeholder="Nombre de usuario" required value={nombreUsuario} onChange={e => setNombreUsuario(e.target.value)} />
                    </div>
                    <div className="input-group">
                        <i className="fas fa-envelope"></i>
                        <input type="email" placeholder="Correo electrónico" required value={email} onChange={e => setEmail(e.target.value)} />
                    </div>
                    <div className="input-group">
                        <i className="fas fa-lock"></i>
                        <input type="password" placeholder="Contraseña" required value={password} onChange={e => setPassword(e.target.value)} />
                    </div>
                    <div className="input-group">
                        <i className="fas fa-lock"></i>
                        <input type="password" placeholder="Confirmar contraseña" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                    </div>
                    <button type="submit" className="auth-btn">Registrarse</button>
                </form>
                <div className="auth-link">
                    <p>¿Ya tienes una cuenta? <Link to="/login">Inicia Sesión</Link></p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;