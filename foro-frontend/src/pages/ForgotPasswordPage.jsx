import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './AuthForm.css';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // TODO: Implement actual password recovery API call
            // const response = await fetch('http://localhost:5153/api/Auth/forgot-password', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ email })
            // });

            // For now, simulate success after a brief delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            setSent(true);
            
            // Redirect to login after 3 seconds
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            console.error('Error sending recovery email:', err);
            setLoading(false);
        }
    };

    if (sent) {
        return (
            <div className="auth-container">
                <div className="auth-box">
                    <div className="auth-header">
                        <i className="fas fa-envelope-circle-check icon"></i>
                        <h1>Correo Enviado</h1>
                        <p>Revisa tu bandeja de entrada para obtener el enlace de recuperación.</p>
                        <p style={{ fontSize: '0.85rem', color: '#8b949e', marginTop: '15px' }}>
                            Serás redirigido a Iniciar Sesión en unos momentos...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <div className="auth-box">
                <div className="auth-header">
                    <i className="fas fa-lock-open icon"></i>
                    <h1>Recuperar Contraseña</h1>
                    <p>Ingresa tu correo para recibir un enlace de recuperación</p>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <i className="fas fa-envelope"></i>
                        <input
                            type="email"
                            placeholder="Correo electrónico"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                        />
                    </div>
                    <button type="submit" className="auth-btn" disabled={loading}>
                        {loading ? 'Enviando...' : 'Enviar Enlace de Recuperación'}
                    </button>
                </form>
                <div className="auth-link">
                    <p>¿Recuerdas tu contraseña? <Link to="/login">Inicia Sesión</Link></p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
