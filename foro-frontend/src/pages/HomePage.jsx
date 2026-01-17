import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
// IMPORTANTE: Agregamos getNotificaciones para la campana
import { getHilos, voteOnHilo, getNotificaciones } from '../services/apiService'; 
import { extractItems, getTotalPages } from '../services/apiHelpers';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { 
    MagnifyingGlassIcon, BellIcon, PlusIcon, GlobeAltIcon, ChatBubbleLeftIcon, 
    ShareIcon, BookmarkIcon, ArrowUpIcon, ArrowDownIcon, UserCircleIcon, 
    ArrowRightOnRectangleIcon, Cog6ToothIcon, UserGroupIcon 
} from '@heroicons/react/24/solid';

// --- ESTILOS Y ANIMACIONES PERSONALIZADAS ---
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
                    /* --- ANIMACIONES DE FONDO --- */
                    @keyframes colorShift { 0% { filter: hue-rotate(0deg); } 50% { filter: hue-rotate(20deg); } 100% { filter: hue-rotate(0deg); } }
                    @keyframes floatUp { 0% { transform: translateY(100vh) rotate(0deg); opacity: 0; } 10% { opacity: var(--target-opacity); } 90% { opacity: var(--target-opacity); } 100% { transform: translateY(-20vh) rotate(360deg); opacity: 0; } }
                    .lava-lamp { animation: blob 15s infinite, colorShift 30s infinite linear; }
                    .floating-logo { position: absolute; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23a855f7'%3E%3Cpath d='M12 2L2 12l10 10 10-10L12 2z'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: center; background-size: contain; }

                    /* --- NUEVA ANIMACIÓN CAMPANA (SIGNAL) --- */
                    @keyframes signal-pulse {
                        0% { box-shadow: 0 0 0 0 rgba(34, 211, 238, 0.7); } /* Cyan glow */
                        70% { box-shadow: 0 0 0 10px rgba(34, 211, 238, 0); }
                        100% { box-shadow: 0 0 0 0 rgba(34, 211, 238, 0); }
                    }

                    /* --- ANIMACIÓN TIRA LED SLOW DARK (La que te gustó) --- */
                    @keyframes dark-flow {
                        0% { background-position: 0% 50%; }
                        50% { background-position: 100% 50%; }
                        100% { background-position: 0% 50%; }
                    }

                    /* 1. Wrapper (Contorno) */
                    .neon-led-border {
                        position: relative;
                        padding: 2px; /* Borde fino elegante */
                        border-radius: 2rem;
                        overflow: hidden;
                        z-index: 0;
                        /* Sombra sutil */
                        box-shadow: 0 0 20px rgba(88, 28, 135, 0.15); 
                        transition: box-shadow 0.5s ease;
                    }
                    .neon-led-border:hover {
                         box-shadow: 0 0 30px rgba(88, 28, 135, 0.3);
                    }

                    /* 2. El flujo de color SLOW (El alma del borde) */
                    .neon-led-border::before {
                        content: '';
                        position: absolute;
                        inset: 0;
                        z-index: -2;
                        /* GRADIENTE DARK Y ELEGANTE */
                        background: linear-gradient(
                            270deg,
                            #0f172a, /* Slate 900 */
                            #312e81, /* Indigo 900 */
                            #581c87, /* Purple 900 */
                            #312e81, 
                            #0f172a
                        );
                        background-size: 400% 400%; /* Estirado para suavidad */
                        animation: dark-flow 10s ease infinite; /* SLOW MOTION */
                    }

                    /* 3. Cuerpo sólido (Tapa el centro) */
                    .card-solid-body {
                        position: relative;
                        background-color: rgba(15, 15, 20, 0.95); 
                        backdrop-filter: blur(12px);
                        border-radius: calc(2rem - 2px);
                        height: 100%;
                        width: 100%;
                        z-index: 1;
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

// --- HILO CARD (Con el borde Slow Dark LED) ---
const HiloCard = ({ hilo }) => {
    const navigate = useNavigate();
    const { showToast } = useNotification();
    const [votos, setVotos] = useState(hilo.votos || 0);
    const [miVoto, setMiVoto] = useState(0); 
    const [isSaved, setIsSaved] = useState(false);
    const [isVoting, setIsVoting] = useState(false); 
    const autor = hilo.usuario?.nombreUsuario || hilo.usuarioNombre || 'Anónimo';
    const foro = hilo.foro?.nombreForo || hilo.foroNombre || 'General';
    const avatarSeed = autor;

    const handleVote = async (e, tipo) => {
        e.preventDefault(); e.stopPropagation();
        if (isVoting) return;
        setIsVoting(true);
        const intencion = tipo === 'up' ? 1 : -1;
        const palabraAPI = tipo === 'up' ? 'up' : 'down';
        let nuevosVotos = votos; let nuevoMiVoto = intencion;
        if (miVoto === intencion) { nuevosVotos -= intencion; nuevoMiVoto = 0; } else if (miVoto === 0) { nuevosVotos += intencion; } else { nuevosVotos += (intencion * 2); }
        setVotos(nuevosVotos); setMiVoto(nuevoMiVoto);
        try {
            const response = await voteOnHilo(hilo.id, { direction: palabraAPI });
            if (response && response.newVoteCount !== undefined) setVotos(response.newVoteCount);
            else if (response.data && response.data.newVoteCount !== undefined) setVotos(response.data.newVoteCount);
        } catch (error) { console.error("Error al votar:", error); if(showToast) showToast("Error al votar", "error"); } finally { setIsVoting(false); }
    };
    const handleShare = (e) => { e.preventDefault(); e.stopPropagation(); navigator.clipboard.writeText(`${window.location.origin}/hilo/${hilo.id}`); if(showToast) showToast("Enlace copiado", "success"); };
    const handleSave = (e) => { e.preventDefault(); e.stopPropagation(); setIsSaved(!isSaved); if(showToast) showToast(isSaved ? "Removido" : "Guardado", "success"); };
    const getArrowClass = (tipo) => { if (tipo === 'up') return miVoto === 1 ? "text-purple-400 scale-110" : "text-gray-500 hover:text-purple-400"; if (tipo === 'down') return miVoto === -1 ? "text-red-400 scale-110" : "text-gray-500 hover:text-red-400"; return ""; };

    return (
        <div className="neon-led-border mb-6 group">
            <div className="card-solid-body">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-800 border border-gray-600 overflow-hidden">
                                 <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`} alt="avatar" className="w-full h-full bg-white opacity-90" />
                            </div>
                            <span className="text-gray-200 font-bold text-base">Publicado por {autor}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-300 font-bold text-sm bg-[#1e1e2d] px-3 py-1 rounded-full border border-gray-700">
                            {foro}
                            <div className="w-4 h-4"><GlobeAltIcon /></div>
                        </div>
                    </div>

                    <Link to={`/hilo/${hilo.id}`} className="block group/link">
                        <h3 className="text-3xl font-black text-white mb-3 group-hover/link:text-purple-300 transition-colors tracking-tight">{hilo.titulo}</h3>
                        <p className="text-gray-400 text-base mb-16 leading-relaxed font-medium line-clamp-3 group-hover/link:text-gray-300 transition-colors">
                            {hilo.contenido}
                        </p>
                    </Link>

                    <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between z-20">
                        <div className="flex gap-5">
                            <button className="text-gray-500 hover:text-white transition-colors" onClick={() => navigate(`/hilo/${hilo.id}`)}><ChatBubbleLeftIcon className="h-7 w-7" /></button>
                            <button className={`${isSaved ? 'text-yellow-500' : 'text-gray-500'} hover:text-white transition-colors`} onClick={handleSave}><BookmarkIcon className="h-7 w-7" /></button>
                            <button className="text-gray-500 hover:text-white transition-colors" onClick={handleShare}><ShareIcon className="h-7 w-7" /></button>
                        </div>
                        <div className={`flex items-center bg-[#0f0f13] border border-gray-700 rounded-full px-4 py-1 gap-4 select-none transition-opacity ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            <button onClick={(e) => handleVote(e, 'up')} disabled={isVoting} className={`active:scale-90 transition-all ${getArrowClass('up')}`}><ArrowUpIcon className="h-6 w-6" /></button>
                            <span className={`font-bold text-xl min-w-[1.5rem] text-center ${miVoto !== 0 ? 'text-purple-400' : 'text-gray-500'}`}>{isVoting ? '...' : votos}</span>
                            <button onClick={(e) => handleVote(e, 'down')} disabled={isVoting} className={`active:scale-90 transition-all ${getArrowClass('down')}`}><ArrowDownIcon className="h-6 w-6" /></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- PÁGINA PRINCIPAL ---
const HomePage = () => {
    const { id: foroIdParam } = useParams();
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const [hilos, setHilos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 10;
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef(null);
    const userNameDisplay = user?.nombreUsuario || user?.unique_name || user?.name || user?.sub || 'Usuario';
    const userEmailDisplay = user?.email || `${userNameDisplay.toLowerCase().replace(/\s+/g, '')}@fread.com`;

    // ESTADO PARA NOTIFICACIONES
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const fetchHilos = async () => {
            setLoading(true);
            try {
                const response = await getHilos(currentPage, pageSize, searchTerm, foroIdParam);
                const items = extractItems(response);
                setHilos(items || []);
                setTotalPages(getTotalPages(response) || 1);
            } catch (error) { console.error("Error", error); setHilos([]); } finally { setLoading(false); }
        };
        const timeoutId = setTimeout(() => fetchHilos(), 500);
        return () => clearTimeout(timeoutId);
    }, [currentPage, searchTerm, foroIdParam]);

    // CHECK NOTIFICACIONES (Polling)
    useEffect(() => {
        const checkNotificaciones = async () => {
            if (!user) return;
            try {
                // Pedimos la página 1 para ver si hay algo nuevo
                const response = await getNotificaciones(1, 20);
                const items = extractItems(response);
                // Contamos las NO leídas
                const unread = items.filter(n => !n.leido).length;
                setUnreadCount(unread);
            } catch (error) {
                console.error("Error chequeando notificaciones", error);
            }
        };

        checkNotificaciones(); // Primera ejecución
        const interval = setInterval(checkNotificaciones, 30000); // Revisar cada 30 segundos
        return () => clearInterval(interval);
    }, [user]);

    useEffect(() => { setCurrentPage(1); }, [searchTerm, foroIdParam]);
    useEffect(() => {
        const handleClickOutside = (event) => { if (profileRef.current && !profileRef.current.contains(event.target)) setIsProfileOpen(false); };
        document.addEventListener("mousedown", handleClickOutside); return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    const handlePageChange = (newPage) => { if (newPage >= 1 && newPage <= totalPages) { setCurrentPage(newPage); window.scrollTo({ top: 0, behavior: 'smooth' }); } };
    const handleLogout = () => { logout(); navigate('/login'); };

    return (
        <div className="w-full min-h-screen text-white font-sans bg-[#050505]">
            <BackgroundEffects />
            
            {/* Navbar Global */}
            <nav className="fixed top-0 left-0 w-full z-50 bg-[#0b0b14]/90 backdrop-blur-md border-b border-white/10 py-3 px-4 md:px-8 shadow-lg">
                <div className="w-full max-w-[95%] mx-auto flex items-center justify-between gap-4">
                    <Link to="/" className="text-3xl font-black tracking-wider text-white hover:opacity-80 transition-opacity">FREAD</Link>
                    <div className="flex-1 max-w-3xl hidden md:block px-6">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><MagnifyingGlassIcon className="h-5 w-5 text-gray-500 group-focus-within:text-purple-500 transition-colors" /></div>
                            <input type="text" className="block w-full pl-11 pr-4 py-3 bg-[#16161e] border border-gray-700 rounded-full text-white placeholder-gray-500 focus:outline-none focus:border-purple-900 focus:ring-1 focus:ring-purple-900 transition-all text-sm font-medium" placeholder={foroIdParam ? "Buscar en este foro..." : "Buscar hilos interesantes..."} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        
                        {/* --- CAMPANA DE NOTIFICACIONES ACTIVA --- */}
                        <Link to="/notificaciones" className="relative group transition-all">
                            {/* Icono Base */}
                            <BellIcon 
                                className={`h-8 w-8 transition-colors duration-300 ${
                                    unreadCount > 0 ? 'text-cyan-400' : 'text-gray-400 hover:text-purple-400'
                                }`} 
                            />
                            
                            {/* Efecto de Señal/Radar si hay notis */}
                            {unreadCount > 0 && (
                                <>
                                    <div className="absolute inset-0 rounded-full animate-[signal-pulse_2s_infinite]"></div>
                                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500 text-[10px] font-black text-black border-2 border-[#0b0b14]">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                </>
                            )}
                        </Link>

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
                                        <p className="text-xs text-gray-400 truncate">{userEmailDisplay}</p>
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

            <main className="relative z-10 w-full max-w-[95%] mx-auto py-8 pt-32">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-9">
                        {foroIdParam && (
                            <div className="mb-6 p-4 bg-[#1a1a24] border border-gray-700 rounded-2xl animate-fade-in-down">
                                <h2 className="text-2xl font-bold text-white flex items-center gap-2"><GlobeAltIcon className="h-6 w-6 text-gray-400" /> Comunidad: <span className="text-purple-400">{hilos[0]?.foro?.nombreForo || `ID: ${foroIdParam}`}</span></h2>
                            </div>
                        )}
                        {loading ? <div className="text-center py-20 text-gray-500 font-bold text-xl animate-pulse">Cargando el sistema...</div> : hilos.length > 0 ? hilos.map((hilo) => <HiloCard key={hilo.id} hilo={hilo} />) : (
                            <div className="text-center py-20 border-2 border-dashed border-gray-800 rounded-3xl bg-[#0a0a0f]">
                                <p className="text-gray-500 mb-4 text-lg">{searchTerm ? `Sin resultados para "${searchTerm}"` : "Todo está muy tranquilo por aquí..."}</p>
                                <Link to="/crear-hilo" className="text-purple-500 font-bold hover:text-purple-400 text-xl underline">Crear un Hilo</Link>
                            </div>
                        )}
                        {hilos.length > 0 && (
                            <div className="flex justify-center mt-10 pb-10">
                                <div className="flex items-center gap-6 bg-[#15151e] border border-gray-700 rounded-full px-8 py-2 shadow-lg">
                                    <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="text-gray-400 font-black text-2xl hover:text-white disabled:opacity-30">{'<'}</button>
                                    <span className="text-white font-black text-xl">{currentPage} <span className="text-sm font-normal text-gray-500">de {totalPages}</span></span>
                                    <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="text-gray-400 font-black text-2xl hover:text-white disabled:opacity-30">{'>'}</button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-3 hidden lg:block">
                        <div className="sticky top-32 space-y-8">
                            {/* BIENVENIDA (Slow Dark LED) */}
                            <div className="neon-led-border shadow-xl">
                                <div className="card-solid-body p-8 text-center">
                                    <h3 className="font-bold text-white text-lg mb-4 leading-tight">Comparte y discute las últimas tendencias</h3>
                                    <div className="mt-6 font-black text-xl text-white">
                                        <div className="text-gray-500 text-sm font-bold mb-1">¿Dónde?</div>
                                        <span className="text-2xl text-purple-500 drop-shadow-md">En FREAD.</span>
                                    </div>
                                </div>
                            </div>

                            {/* REGLAS (Slow Dark LED) */}
                            <div className="neon-led-border shadow-xl">
                                <div className="card-solid-body p-8">
                                    <h4 className="font-bold text-white text-center mb-6 text-xl">Reglas</h4>
                                    <ul className="space-y-4 text-sm text-gray-400 font-medium text-left">
                                        <li><span className="text-purple-600 font-bold mr-1">1.</span> Respeto ante todo.</li>
                                        <li><span className="text-purple-600 font-bold mr-1">2.</span> Cero spam.</li>
                                        <li><span className="text-purple-600 font-bold mr-1">3.</span> Cuida tu privacidad.</li>
                                        <li><span className="text-purple-600 font-bold mr-1">4.</span> Mantén el tema.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default HomePage;