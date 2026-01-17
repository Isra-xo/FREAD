import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createForo } from '../services/apiService';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { 
    UserGroupIcon, ChatBubbleLeftRightIcon, GlobeAltIcon, 
    XMarkIcon, CheckIcon, MagnifyingGlassIcon, BellIcon, PlusIcon,
    UserCircleIcon, BookmarkIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon
} from '@heroicons/react/24/solid';

// --- ESTILOS Y ANIMACIONES  ---
const BackgroundEffects = () => {
    const particles = Array.from({ length: 20 }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: `${Math.random() * 20 + 10}px`,
        duration: `${Math.random() * 20 + 10}s`,
        delay: `${Math.random() * 5}s`,
        opacity: Math.random() * 0.3 + 0.1
    }));

    return (
        <div className="fixed inset-0 z-0 pointer-events-none bg-[#050505] overflow-hidden">
            <style>
                {`
                    @keyframes colorShift { 0% { filter: hue-rotate(0deg); } 50% { filter: hue-rotate(20deg); } 100% { filter: hue-rotate(0deg); } }
                    @keyframes floatUp { 0% { transform: translateY(100vh) rotate(0deg); opacity: 0; } 10% { opacity: var(--target-opacity); } 90% { opacity: var(--target-opacity); } 100% { transform: translateY(-20vh) rotate(360deg); opacity: 0; } }
                    .lava-lamp { animation: blob 15s infinite, colorShift 30s infinite linear; }
                    .floating-logo { position: absolute; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23a855f7'%3E%3Cpath d='M12 2L2 12l10 10 10-10L12 2z'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: center; background-size: contain; }
                    
                    @keyframes led-flow { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
                    
                    .neon-led-border {
                        position: relative; padding: 2px; border-radius: 2rem; overflow: hidden; z-index: 0;
                        box-shadow: 0 0 20px rgba(88, 28, 135, 0.15); transition: box-shadow 0.5s ease;
                    }
                    .neon-led-border:hover { box-shadow: 0 0 30px rgba(88, 28, 135, 0.3); }
                    .neon-led-border::before {
                        content: ''; position: absolute; inset: 0; z-index: -2;
                        background: linear-gradient(270deg, #0f172a, #312e81, #581c87, #312e81, #0f172a);
                        background-size: 400% 400%; animation: led-flow 10s ease infinite;
                    }
                    .card-solid-body {
                        position: relative; background-color: rgba(15, 15, 20, 0.95); backdrop-filter: blur(12px);
                        border-radius: calc(2rem - 2px); height: 100%; width: 100%; z-index: 1;
                    }
                `}
            </style>
            <div className="absolute top-[-10%] left-[-10%] w-[50rem] h-[50rem] bg-purple-900/20 rounded-full filter blur-[120px] opacity-30 animate-blob lava-lamp"></div>
            <div className="absolute top-[40%] right-[-10%] w-[45rem] h-[45rem] bg-indigo-950/40 rounded-full filter blur-[120px] opacity-30 animate-blob animation-delay-2000 lava-lamp"></div>
            <div className="absolute bottom-[-10%] left-[20%] w-[40rem] h-[40rem] bg-slate-900/50 rounded-full filter blur-[120px] opacity-40 animate-blob animation-delay-4000 lava-lamp"></div>
            {particles.map((p) => (<div key={p.id} className="floating-logo" style={{ left: p.left, width: p.size, height: p.size, animation: `floatUp ${p.duration} linear infinite`, animationDelay: p.delay, '--target-opacity': p.opacity, opacity: 0 }} />))}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
        </div>
    );
};

const CreateForoPage = () => {
    const [nombreForo, setNombreForo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const navigate = useNavigate();
    const { showToast } = useNotification();
    const { user, logout } = useAuth();

    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef(null);
    const userNameDisplay = user?.nombreUsuario || user?.unique_name || 'Usuario';
    const userEmailDisplay = user?.email || `${userNameDisplay.toLowerCase()}@fread.com`;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) setIsProfileOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => { logout(); navigate('/login'); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await createForo({ nombreForo, descripcion });
            showToast(`¡Comunidad "${nombreForo}" creada con éxito!`, 'success');
            navigate('/');
        } catch (err) {
            console.error("Error al crear el foro:", err);
            const errorMessage = err.response?.data?.message || "Error al crear la comunidad.";
            showToast(errorMessage, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full min-h-screen text-white font-sans bg-[#050505] overflow-x-hidden">
            <BackgroundEffects />

            {/* Navbar (Copia exacta de Home) */}
            <nav className="fixed top-0 left-0 w-full z-50 bg-[#0b0b14]/90 backdrop-blur-md border-b border-white/5 py-3 px-4 md:px-8 shadow-lg">
                <div className="w-full max-w-[95%] mx-auto flex items-center justify-between gap-4">
                    <Link to="/" className="text-3xl font-black tracking-wider text-white hover:opacity-80 transition-opacity">FREAD</Link>
                    <div className="flex-1 max-w-3xl hidden md:block px-6"></div>
                    <div className="flex items-center gap-4">
                        <Link to="/notificaciones" className="text-gray-400 hover:text-purple-400 transition-colors"><BellIcon className="h-8 w-8" /></Link>
                        <Link to="/foros" className="text-gray-400 hover:text-purple-400 transition-colors"><GlobeAltIcon className="h-8 w-8" /></Link>
                        <Link to="/crear-hilo" className="text-gray-400 hover:text-white transition-colors border-2 border-gray-600 hover:border-white rounded-lg p-1"><PlusIcon className="h-6 w-6" /></Link>
                        <div className="relative" ref={profileRef}>
                            <div onClick={() => setIsProfileOpen(!isProfileOpen)} className="ml-2 w-10 h-10 rounded-full bg-gray-800 overflow-hidden border-2 border-gray-600 hover:border-purple-500 cursor-pointer transition-colors">
                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userNameDisplay}`} alt="avatar" className="w-full h-full bg-white" />
                            </div>
                            {isProfileOpen && (
                                <div className="absolute right-0 mt-3 w-72 bg-[#121218] border border-gray-700 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fade-in-down">
                                    <div className="px-4 py-4 border-b border-gray-800 bg-[#1a1a24]">
                                        <p className="text-base text-white font-bold">{userNameDisplay}</p>
                                        <p className="text-xs text-gray-500 truncate">{userEmailDisplay}</p>
                                    </div>
                                    <div className="py-2">
                                        <Link to="/perfil" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-400 hover:bg-purple-900/20 hover:text-white transition-colors"><UserCircleIcon className="h-5 w-5" /> Mi Perfil</Link>
                                        <Link to="/mi-actividad" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-400 hover:bg-purple-900/20 hover:text-white transition-colors"><BookmarkIcon className="h-5 w-5" /> Mi Actividad</Link>
                                        {user?.role === 'Administrador' && (
                                            <>
                                                <div className="border-t border-gray-800 my-1"></div>
                                                <Link to="/popular" className="flex items-center gap-3 px-4 py-3 text-sm text-yellow-600 hover:bg-yellow-900/20 hover:text-yellow-400 transition-colors font-medium"><Cog6ToothIcon className="h-5 w-5" /> Panel de configuración</Link>
                                                <Link to="/crear-foro" className="flex items-center gap-3 px-4 py-3 text-sm text-green-600 hover:bg-green-900/20 hover:text-green-400 transition-colors font-medium"><UserGroupIcon className="h-5 w-5" /> Nuevo foro</Link>
                                            </>
                                        )}
                                        <div className="border-t border-gray-800 my-2"></div>
                                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-900/20 transition-colors text-left"><ArrowRightOnRectangleIcon className="h-5 w-5" /> Cerrar Sesión</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <main className="relative z-10 w-full max-w-6xl mx-auto py-8 pt-32 px-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                    
                    <div>
                        <div className="mb-8">
                            <h1 className="text-4xl font-black text-white mb-2 flex items-center gap-3">
                                <UserGroupIcon className="h-10 w-10 text-purple-500" /> Crear Comunidad
                            </h1>
                            <p className="text-gray-400 text-lg">Crea un nuevo espacio para discutir lo que te apasiona.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            
                            <div className="space-y-2">
                                <label className="block text-gray-300 font-bold ml-1">Nombre de la Comunidad</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">f/</div>
                                    <input
                                        type="text"
                                        placeholder="Ej: tecnologia"
                                        value={nombreForo}
                                        onChange={(e) => setNombreForo(e.target.value)}
                                        maxLength="21"
                                        required
                                        disabled={isSubmitting}
                                        className="w-full bg-[#15151e] border-2 border-gray-700 rounded-xl py-4 pl-8 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 focus:shadow-[0_0_15px_rgba(168,85,247,0.2)] transition-all"
                                    />
                                    <div className="absolute top-4 right-4 text-xs text-gray-500 font-bold bg-[#0b0b14] px-2 py-1 rounded">
                                        {21 - nombreForo.length}
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 ml-1">Sin espacios, solo letras, números o guiones bajos.</p>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-gray-300 font-bold ml-1">Descripción</label>
                                <div className="relative">
                                    <textarea
                                        placeholder="Cuéntanos de qué trata tu comunidad..."
                                        value={descripcion}
                                        onChange={(e) => setDescripcion(e.target.value)}
                                        maxLength="300"
                                        rows="5"
                                        required
                                        disabled={isSubmitting}
                                        className="w-full bg-[#15151e] border-2 border-gray-700 rounded-xl p-4 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 focus:shadow-[0_0_15px_rgba(168,85,247,0.2)] transition-all resize-none"
                                    />
                                    <div className="absolute bottom-4 right-4 text-xs text-gray-500 font-bold bg-[#0b0b14] px-2 py-1 rounded">
                                        {300 - descripcion.length}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => navigate('/')}
                                    disabled={isSubmitting}
                                    className="flex-1 py-3 rounded-full font-bold border-2 border-gray-600 text-gray-400 hover:border-gray-400 hover:text-white transition-colors flex items-center justify-center gap-2"
                                >
                                    <XMarkIcon className="h-5 w-5" /> Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 py-3 rounded-full font-bold bg-purple-600 text-white hover:bg-purple-500 hover:shadow-[0_0_20px_rgba(147,51,234,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? 'Creando...' : <><CheckIcon className="h-5 w-5" /> Crear Comunidad</>}
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="hidden lg:block sticky top-32">
                        <div className="flex items-center gap-2 mb-4 text-gray-400 font-bold text-sm uppercase tracking-wider">
                            <MagnifyingGlassIcon className="h-4 w-4" /> Vista Previa
                        </div>

                        {/* TARJETA CON BORDE ANIMADO (LED DARK) */}
                        <div className="neon-led-border shadow-2xl">
                            <div className="card-solid-body">
                                <div className="p-8">
                                    <div className="flex items-center gap-4 mb-6 border-b border-gray-800 pb-6">
                                        <div className="w-16 h-16 rounded-full bg-purple-900/30 border-2 border-purple-500 flex items-center justify-center text-purple-300">
                                            <span className="text-2xl font-black">f/</span>
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-white">f/{nombreForo || 'nombre_comunidad'}</h2>
                                            <p className="text-sm text-gray-500">1 miembro • 1 en línea</p>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <h3 className="font-bold text-gray-300 text-sm uppercase tracking-wide">Acerca de la comunidad</h3>
                                        <p className="text-gray-400 leading-relaxed min-h-[100px]">
                                            {descripcion || 'Aquí aparecerá la descripción de tu comunidad. Asegúrate de ser claro y conciso para atraer a más miembros.'}
                                        </p>
                                    </div>

                                    <div className="mt-8 pt-6 border-t border-gray-800 flex gap-3">
                                        <div className="flex-1 bg-purple-600 h-10 rounded-full opacity-20"></div>
                                        <div className="flex-1 bg-gray-700 h-10 rounded-full opacity-20"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default CreateForoPage;