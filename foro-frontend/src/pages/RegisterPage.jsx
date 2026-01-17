import React, { useState } from 'react';
// Asegúrate de que la ruta a tu servicio de registro sea correcta
import { register as registerService } from '../services/apiService';
import { Link, useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
// Importamos el icono de sobre (EnvelopeIcon) para el email
import { UserIcon, LockClosedIcon, EnvelopeIcon } from '@heroicons/react/24/solid';

const RegisterPage = () => {
    // Usamos un objeto para manejar los múltiples campos del formulario
    const [formData, setFormData] = useState({
        nombreUsuario: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { showToast } = useNotification();

    // Función genérica para actualizar el estado cuando cambian los inputs
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // 1. Validación básica en el frontend
        if (formData.password !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden.');
            showToast('Las contraseñas no coinciden.', 'error');
            return;
        }

        setLoading(true);

        try {
            // 2. Preparamos los datos para el backend
            // (El backend no suele necesitar 'confirmPassword')
            const dataToSend = {
                nombreUsuario: formData.nombreUsuario,
                email: formData.email,
                password: formData.password
            };

            // 3. Llamada al servicio
            await registerService(dataToSend);
            
            showToast('¡Cuenta creada con éxito! Por favor inicia sesión.', 'success');
            // Redirigimos al login después de un registro exitoso
            navigate('/login');

        } catch (err) {
            console.error(err);
            // Intentamos extraer el mensaje de error del backend si existe
            const msjError = err.response?.data || 'Error al registrar la cuenta. Inténtalo de nuevo.';
            setError(msjError);
            if (showToast) showToast(msjError, 'error');
        } finally {
            setLoading(false);
        }
    };

    // Estilo base compartido para los inputs
    const inputClasses = "block w-full pl-14 pr-4 py-4 bg-[#1a1a1a]/80 border-2 border-purple-600/60 rounded-full text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all font-medium text-lg backdrop-blur-sm";
    const iconClasses = "h-6 w-6 text-white";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f0c29] overflow-hidden p-4">
            
            {/* --- Fondo Animado (Lámpara de Lava) --- */}
            <div className="absolute inset-0 w-full h-full">
                <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-purple-600/30 rounded-full filter blur-[100px] opacity-50 animate-blob"></div>
                <div className="absolute top-[40%] right-[-20%] w-[35rem] h-[35rem] bg-blue-700/30 rounded-full filter blur-[100px] opacity-50 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-[-10%] left-[10%] w-96 h-96 bg-pink-600/30 rounded-full filter blur-[100px] opacity-50 animate-blob animation-delay-4000"></div>
            </div>

            {/* Contenido Principal */}
            <div className="relative z-10 flex flex-col items-center w-full max-w-6xl my-auto">
                
                {/* Título Neón */}
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-6 tracking-wider drop-shadow-lg text-center">
                    Crear una Cuenta en{' '}
                    <span className="text-[#a855f7] drop-shadow-[0_0_15px_rgba(168,85,247,0.9)]">
                        FREAD
                    </span>
                </h1>

                <div className="flex flex-col md:flex-row w-full bg-[#0b0b14]/80 backdrop-blur-xl border border-purple-500/30 rounded-[2.5rem] shadow-[0_0_50px_rgba(139,92,246,0.15)] overflow-hidden">
                    
                    {/* LADO IZQUIERDO (Visual) */}
                    <div className="w-full md:w-5/12 flex flex-col items-center justify-center p-8 md:p-12 bg-black/30">
                        <div className="mb-6 relative group">
                            <div className="absolute inset-0 bg-purple-600 blur-[60px] opacity-40 rounded-full group-hover:opacity-60 animate-pulse transition-opacity duration-500"></div>
                            {/* Icono diferente para registro (un cohete o usuario con +) */}
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-32 h-32 text-purple-500 relative z-10 drop-shadow-[0_0_15px_rgba(168,85,247,0.8)]">
                              <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.602-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                              <path d="M13.5 3a.75.75 0 0 1 .75.75V5.25h1.5a.75.75 0 0 1 0 1.5H14.25v1.5a.75.75 0 0 1-1.5 0V6.75h-1.5a.75.75 0 0 1 0-1.5h1.5V3.75a.75.75 0 0 1 .75-.75Z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-medium text-white tracking-wide mt-4 text-center">Únete a la comunidad</h2>
                        <p className="text-purple-300/70 text-sm mt-2 text-center max-w-xs">Descubre, comparte y conecta con miles de usuarios.</p>
                    </div>

                    {/* LADO DERECHO (Formulario) */}
                    <div className="w-full md:w-7/12 p-8 md:p-10 flex flex-col justify-center py-12">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/50 text-red-200 px-4 py-2 rounded-lg text-sm text-center animate-pulse">
                                    {error}
                                </div>
                            )}

                            {/* Input Nombre de Usuario */}
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                    <UserIcon className={iconClasses} />
                                </div>
                                <input
                                    type="text"
                                    name="nombreUsuario"
                                    placeholder="Nombre de usuario"
                                    required
                                    value={formData.nombreUsuario}
                                    onChange={handleChange}
                                    className={inputClasses}
                                />
                            </div>

                            {/* Input Email (Nuevo) */}
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                    <EnvelopeIcon className={iconClasses} />
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Correo electrónico"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={inputClasses}
                                />
                            </div>

                            {/* Input Contraseña */}
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                    <LockClosedIcon className={iconClasses} />
                                </div>
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Contraseña"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={inputClasses}
                                />
                            </div>

                             {/* Input Confirmar Contraseña */}
                             <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                    <LockClosedIcon className={iconClasses} />
                                </div>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    placeholder="Confirmar contraseña"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className={inputClasses}
                                />
                            </div>

                            {/* Botón Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-[#a855f7] border-2 border-white/20 rounded-full text-white font-bold text-xl hover:bg-[#9333ea] hover:scale-[1.02] active:scale-95 transition-all duration-300 shadow-[0_0_20px_rgba(168,85,247,0.5)] disabled:opacity-50 disabled:cursor-not-allowed mt-4 cursor-pointer"
                            >
                                {loading ? 'Creando cuenta...' : 'Registrarse'}
                            </button>

                            {/* Link al Login */}
                            <div className="text-center text-sm text-gray-400 mt-4">
                                <p>
                                    ¿Ya tienes una cuenta?{' '}
                                    <Link to="/login" className="text-purple-500 hover:text-purple-400 font-bold transition-colors">
                                        Inicia Sesión
                                    </Link>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;