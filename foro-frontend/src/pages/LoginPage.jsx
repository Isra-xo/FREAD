import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { login as loginService } from '../services/apiService';
import { Link, useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import { UserIcon, LockClosedIcon } from '@heroicons/react/24/solid';

const LoginPage = () => {
    const [nombreUsuario, setNombreUsuario] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useNotification();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await loginService({ nombreUsuario, password });
            login(response.data || response); 
            navigate('/');
        } catch (err) {
            console.error(err);
            const msjError = 'Usuario o contraseña incorrectos.';
            setError(msjError);
            if (showToast) showToast(msjError, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f0c29] overflow-hidden p-4">
            
            {/* --- Fondo Animado (Lámpara de Lava) --- */}
            <div className="absolute inset-0 w-full h-full">
                <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-600/40 rounded-full filter blur-[100px] opacity-50 animate-blob"></div>
                <div className="absolute top-[20%] right-[-20%] w-[30rem] h-[30rem] bg-blue-700/40 rounded-full filter blur-[100px] opacity-50 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-[-10%] left-[20%] w-96 h-96 bg-fuchsia-600/40 rounded-full filter blur-[100px] opacity-50 animate-blob animation-delay-4000"></div>
            </div>

            {/* Contenido Principal */}
            <div className="relative z-10 flex flex-col items-center w-full max-w-5xl">
                
                {/* --- TÍTULO CORREGIDO: Morado Sólido + Brillo --- */}
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-8 tracking-wider drop-shadow-lg text-center">
                    Bienvenido a{' '}
                    {/* text-[#a855f7] es un morado brillante sólido.
                        drop-shadow genera el resplandor del mismo color alrededor. */}
                    <span className="text-[#a855f7] drop-shadow-[0_0_15px_rgba(168,85,247,0.9)]">
                        FREAD
                    </span>
                </h1>
                {/* ----------------------------------------------- */}

                <div className="flex flex-col md:flex-row w-full bg-[#0b0b14]/80 backdrop-blur-xl border border-purple-500/30 rounded-[2.5rem] shadow-[0_0_50px_rgba(139,92,246,0.15)] overflow-hidden">
                    
                    {/* LADO IZQUIERDO */}
                    <div className="w-full md:w-5/12 flex flex-col items-center justify-center p-8 md:p-12 bg-black/30">
                        <div className="mb-6 relative group">
                            <div className="absolute inset-0 bg-purple-600 blur-[60px] opacity-40 rounded-full group-hover:opacity-60 animate-pulse transition-opacity duration-500"></div>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-32 h-32 text-purple-500 relative z-10 drop-shadow-[0_0_15px_rgba(168,85,247,0.8)]">
                                <path d="M11.644 1.59a.75.75 0 0 1 .712 0l9.75 5.25a.75.75 0 0 1 0 1.32l-9.75 5.25a.75.75 0 0 1-.712 0l-9.75-5.25a.75.75 0 0 1 0-1.32l9.75-5.25Z" />
                                <path d="M3.265 10.602l7.668 4.129a2.25 2.25 0 0 0 2.134 0l7.668-4.129 1.37.739a.75.75 0 0 1 0 1.32l-9.75 5.25a.75.75 0 0 1-.712 0l-9.75-5.25a.75.75 0 0 1 0-1.32l1.37-.739Z" className="opacity-70"/>
                                <path d="M10.933 19.231l-7.668-4.129-1.37.739a.75.75 0 0 0 0 1.32l9.75 5.25c.22.119.492.119.712 0l9.75-5.25a.75.75 0 0 0 0-1.32l-1.37-.739-7.668 4.129a2.25 2.25 0 0 1-2.134 0Z" className="opacity-40"/>
                            </svg>
                        </div>
                        <h2 className="text-xl font-medium text-white tracking-wide mt-4">Accede a tu cuenta</h2>
                    </div>

                    {/* LADO DERECHO */}
                    <div className="w-full md:w-7/12 p-8 md:p-12 flex flex-col justify-center">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/50 text-red-200 px-4 py-2 rounded-lg text-sm text-center animate-pulse">
                                    {error}
                                </div>
                            )}

                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                    <UserIcon className="h-6 w-6 text-white" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Nombre de usuario"
                                    required
                                    value={nombreUsuario}
                                    onChange={e => setNombreUsuario(e.target.value)}
                                    className="block w-full pl-14 pr-4 py-4 bg-[#1a1a1a]/80 border-2 border-purple-600/60 rounded-full text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all font-medium text-lg backdrop-blur-sm"
                                />
                            </div>

                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                    <LockClosedIcon className="h-6 w-6 text-white" />
                                </div>
                                <input
                                    type="password"
                                    placeholder="Contraseña"
                                    required
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="block w-full pl-14 pr-4 py-4 bg-[#1a1a1a]/80 border-2 border-purple-600/60 rounded-full text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all font-medium text-lg backdrop-blur-sm"
                                />
                            </div>

                            <div className="flex flex-col sm:flex-row items-center justify-between text-sm text-gray-400 gap-3 px-2">
                                <button type="button" className="hover:text-purple-400 transition-colors bg-transparent border-none cursor-pointer focus:outline-none">
                                    ¿Olvidaste tu contraseña?
                                </button>
                                <p>
                                    ¿No tienes cuenta?{' '}
                                    <Link to="/register" className="text-purple-500 hover:text-purple-400 font-bold transition-colors">
                                        Regístrate
                                    </Link>
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-[#a855f7] border-2 border-white/20 rounded-full text-white font-bold text-xl hover:bg-[#9333ea] hover:scale-[1.02] active:scale-95 transition-all duration-300 shadow-[0_0_20px_rgba(168,85,247,0.5)] disabled:opacity-50 disabled:cursor-not-allowed mt-2 cursor-pointer"
                            >
                                {loading ? 'Cargando...' : 'Iniciar Sesión'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;