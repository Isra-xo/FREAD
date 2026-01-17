import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getNotificaciones, deleteNotificacion } from '../services/apiService';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { 
    BellIcon, TrashIcon, CheckCircleIcon, ExclamationTriangleIcon, 
    InformationCircleIcon, XMarkIcon, ShieldCheckIcon, ChatBubbleLeftRightIcon,
    MagnifyingGlassIcon, GlobeAltIcon, PlusIcon, UserCircleIcon, 
    BookmarkIcon, Cog6ToothIcon, UserGroupIcon, ArrowRightOnRectangleIcon
} from '@heroicons/react/24/solid';

// --- BACKGROUND EFFECTS (Igual que Home para consistencia) ---
const BackgroundEffects = React.memo(() => {
    return (
        <div className="fixed inset-0 z-0 pointer-events-none bg-[#050505] overflow-hidden translate-z-0">
            <style>
                {`
                    @keyframes float-slow { 0% { transform: translate3d(0, 0, 0) rotate(0deg); } 50% { transform: translate3d(20px, 30px, 0) rotate(2deg); } 100% { transform: translate3d(0, 0, 0) rotate(0deg); } }
                    @keyframes modal-pop { 0% { transform: scale(0.9); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
                    @keyframes gold-pulse { 0%, 100% { box-shadow: 0 0 30px rgba(234, 179, 8, 0.2); } 50% { box-shadow: 0 0 60px rgba(234, 179, 8, 0.6); } }
                    
                    .gpu-blob { position: absolute; border-radius: 50%; opacity: 0.3; animation: float-slow 20s ease-in-out infinite; will-change: transform; }
                    .blob-purple { background: radial-gradient(circle, rgba(88,28,135,0.6) 0%, rgba(0,0,0,0) 70%); }
                    .blob-cyan { background: radial-gradient(circle, rgba(8,145,178,0.4) 0%, rgba(0,0,0,0) 70%); }
                    
                    /* Tarjeta de Notificación */
                    .noti-card {
                        background: rgba(20, 20, 25, 0.7);
                        backdrop-filter: blur(10px);
                        border-left-width: 4px;
                        transition: all 0.3s ease;
                    }
                    .noti-card:hover {
                        background: rgba(30, 30, 40, 0.9);
                        transform: translateX(10px);
                    }
                `}
            </style>
            <div className="gpu-blob blob-purple w-[60rem] h-[60rem] top-[-20%] left-[-10%]"></div>
            <div className="gpu-blob blob-cyan w-[50rem] h-[50rem] bottom-[-10%] right-[-10%]"></div>
            <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'linear-gradient(#312e81 1px, transparent 1px), linear-gradient(90deg, #312e81 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        </div>
    );
});

// --- MODAL DE ASCENSO (LA SORPRESA) ---
const AdminPromotionModal = ({ onClose }) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-[modal-pop_0.5s_ease-out]">
        <div className="relative bg-[#0b0b10] border-2 border-yellow-500 rounded-2xl p-10 max-w-lg w-full text-center animate-[gold-pulse_3s_infinite]">
            <ShieldCheckIcon className="h-24 w-24 text-yellow-400 mx-auto mb-6 drop-shadow-[0_0_20px_rgba(234,179,8,0.8)]" />
            <h2 className="text-4xl font-black text-white mb-2 tracking-tighter">SISTEMA ACTUALIZADO</h2>
            <div className="h-1 w-24 bg-yellow-500 mx-auto mb-6 rounded-full"></div>
            <p className="text-yellow-500 font-bold text-lg uppercase tracking-widest mb-4">Nivel de Acceso: Administrador</p>
            <p className="text-gray-400 text-base mb-8 leading-relaxed">
                Tus credenciales han sido elevadas. Ahora tienes control sobre la moderación de foros y gestión de usuarios.
            </p>
            <button 
                onClick={onClose}
                className="w-full py-4 bg-yellow-600 hover:bg-yellow-500 text-black font-black text-lg uppercase tracking-wide rounded-xl transition-all hover:scale-105 shadow-[0_0_30px_rgba(234,179,8,0.4)]"
            >
                Aceptar Privilegios
            </button>
        </div>
    </div>
);

const NotificationsPage = () => {
    const [notificaciones, setNotificaciones] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [showAdminModal, setShowAdminModal] = useState(false);

    const { showToast } = useNotification();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const PAGE_SIZE = 10;

    // --- NAVBAR LOGIC (Igual que Home para corregir el nombre) ---
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef(null);
    // Lógica robusta para nombre de usuario
    const userNameDisplay = user?.nombreUsuario || user?.unique_name || user?.name || user?.sub || 'Usuario';
    const userEmailDisplay = user?.email || `${userNameDisplay.toLowerCase().replace(/\s+/g, '')}@fread.com`;

    useEffect(() => {
        loadNotificaciones(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadNotificaciones = async (pageNumber = 1) => {
        setIsLoading(true);
        try {
            const response = await getNotificaciones(pageNumber, PAGE_SIZE);
            const data = response.data;

            const items = Array.isArray(data.items) ? data.items : data.Items || [];
            setNotificaciones(items);
            setTotalPages(data.totalPages || data.TotalPages || 1);
            setTotalCount(data.totalCount || data.TotalCount || 0);
            setCurrentPage(pageNumber);

            // --- DETECTAR SI HAY NOTIFICACIÓN DE ADMIN ---
            const adminNoti = items.find(n => 
                !n.leido && 
                (n.mensaje.toLowerCase().includes('admin') || n.mensaje.toLowerCase().includes('rol'))
            );

            if (adminNoti) {
                // Usar session storage para mostrarlo solo una vez por sesión
                const key = `seen_promo_${adminNoti.id}`;
                if (!sessionStorage.getItem(key)) {
                    setShowAdminModal(true);
                    sessionStorage.setItem(key, 'true');
                }
            }

        } catch (error) {
            console.error('[NOTIF] Error:', error);
            showToast('Error al cargar notificaciones', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteNotificacion = async (notificacionId) => {
        try {
            // Optimistic update
            setNotificaciones(notificaciones.filter(n => n.id !== notificacionId));
            setTotalCount(prev => prev - 1);
            
            await deleteNotificacion(notificacionId);
            showToast('Mensaje eliminado', 'success');
        } catch (error) {
            console.error('[NOTIF] Error eliminar:', error);
            await loadNotificaciones(currentPage); // Rollback
            showToast('Error al eliminar', 'error');
        }
    };

    // --- HELPERS VISUALES ---
    const getRelativeTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);
        if (seconds < 60) return 'Ahora';
        if (seconds < 3600) return `Hace ${Math.floor(seconds / 60)} min`;
        if (seconds < 86400) return `Hace ${Math.floor(seconds / 3600)} h`;
        return date.toLocaleDateString();
    };

    const getNotificationConfig = (noti) => {
        const msg = noti.mensaje.toLowerCase();
        
        // 1. Es un ascenso a Admin/Rol?
        if (msg.includes('admin') || msg.includes('rol')) {
            return { color: '#eab308', icon: ShieldCheckIcon, border: 'border-l-yellow-500', bgIcon: 'bg-yellow-500/20' };
        }
        // 2. Es un comentario nuevo en mis hilos?
        if (msg.includes('comentario') || msg.includes('respondió') || msg.includes('hilo')) {
            return { color: '#3b82f6', icon: ChatBubbleLeftRightIcon, border: 'border-l-blue-500', bgIcon: 'bg-blue-500/20' };
        }
        // 3. Tipos estándar
        switch (noti.tipo) {
            case 'Success': return { color: '#10b981', icon: CheckCircleIcon, border: 'border-l-emerald-500', bgIcon: 'bg-emerald-500/20' };
            case 'Warning': return { color: '#f59e0b', icon: ExclamationTriangleIcon, border: 'border-l-amber-500', bgIcon: 'bg-amber-500/20' };
            case 'Error':   return { color: '#ef4444', icon: XMarkIcon, border: 'border-l-red-500', bgIcon: 'bg-red-500/20' };
            default:        return { color: '#a855f7', icon: InformationCircleIcon, border: 'border-l-purple-500', bgIcon: 'bg-purple-500/20' };
        }
    };

    // Navbar handlers
    const handleLogout = () => { logout(); navigate('/login'); };
    useEffect(() => {
        const handleClickOutside = (event) => { if (profileRef.current && !profileRef.current.contains(event.target)) setIsProfileOpen(false); };
        document.addEventListener("mousedown", handleClickOutside); return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="w-full min-h-screen text-white font-sans bg-[#050505] overflow-x-hidden">
            <BackgroundEffects />

            {/* MODAL ADMIN */}
            {showAdminModal && <AdminPromotionModal onClose={() => setShowAdminModal(false)} />}

            {/* --- NAVBAR --- */}
            <nav className="fixed top-0 left-0 w-full z-50 bg-[#0b0b14]/90 backdrop-blur-md border-b border-white/5 py-3 px-4 md:px-8 shadow-lg">
                <div className="w-full max-w-[95%] mx-auto flex items-center justify-between gap-4">
                    <Link to="/" className="text-3xl font-black tracking-wider text-white hover:opacity-80 transition-opacity">FREAD</Link>
                    <div className="flex-1"></div>
                    <div className="flex items-center gap-4">
                        <Link to="/notificaciones" className="text-purple-400 transition-colors"><BellIcon className="h-8 w-8" /></Link>
                        <Link to="/foros" className="text-gray-400 hover:text-purple-400 transition-colors"><GlobeAltIcon className="h-8 w-8" /></Link>
                        <Link to="/crear-hilo" className="text-gray-400 hover:text-white transition-colors border-2 border-gray-600 hover:border-white rounded-lg p-1"><PlusIcon className="h-6 w-6" /></Link>
                        
                        <div className="relative" ref={profileRef}>
                            <div onClick={() => setIsProfileOpen(!isProfileOpen)} className="ml-2 w-10 h-10 rounded-full bg-gray-800 overflow-hidden border-2 border-purple-500 cursor-pointer transition-all">
                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userNameDisplay}`} alt="avatar" className="w-full h-full bg-white" />
                            </div>
                            {isProfileOpen && (
                                <div className="absolute right-0 mt-3 w-72 bg-[#121218] border border-purple-900 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fade-in-down">
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
                                        <div className="border-t border-gray-800 my-1"></div>
                                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-900/20 transition-colors text-left"><ArrowRightOnRectangleIcon className="h-5 w-5" /> Cerrar Sesión</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* --- CONTENIDO --- */}
            <main className="relative z-10 w-full max-w-4xl mx-auto py-8 pt-32 px-4 mb-20">
                
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-white mb-2 flex items-center gap-3">
                            <BellIcon className="h-8 w-8 text-purple-500" /> Notificaciones
                        </h1>
                        <p className="text-gray-400 text-sm md:text-base">
                            Buzón de entrada encriptado. Total: <span className="text-white font-bold">{totalCount}</span>
                        </p>
                    </div>
                </div>

                {isLoading ? (
                    <div className="text-center py-20">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mb-4"></div>
                        <p className="text-purple-400 font-mono text-xs tracking-widest animate-pulse">DESCIFRANDO PAQUETES...</p>
                    </div>
                ) : notificaciones.length === 0 ? (
                    <div className="text-center py-20 border-2 border-dashed border-gray-800 rounded-3xl bg-[#0b0b10]/50">
                        <InformationCircleIcon className="h-16 w-16 text-gray-700 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">Sin nuevas notificaciones.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {notificaciones.map((noti) => {
                            const config = getNotificationConfig(noti);
                            const Icon = config.icon;
                            
                            return (
                                <div key={noti.id} className={`noti-card rounded-r-xl p-5 shadow-lg ${config.border}`}>
                                    <div className="flex items-start gap-4">
                                        <div className={`mt-1 p-2 rounded-full ${config.bgIcon}`}>
                                            <Icon className="h-6 w-6" style={{ color: config.color }} />
                                        </div>
                                        
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="text-white font-bold text-sm uppercase tracking-wide truncate pr-4" style={{ color: config.color }}>
                                                    {noti.tipo || 'Sistema'}
                                                </h4>
                                                <span className="text-xs text-gray-500 font-mono whitespace-nowrap">
                                                    {getRelativeTime(noti.fechaCreacion)}
                                                </span>
                                            </div>
                                            <p className="text-gray-300 text-base leading-snug font-medium">
                                                {noti.mensaje}
                                            </p>
                                        </div>

                                        <button 
                                            onClick={() => handleDeleteNotificacion(noti.id)}
                                            className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                            title="Eliminar"
                                        >
                                            <TrashIcon className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* PAGINACIÓN */}
                {totalPages > 1 && (
                    <div className="flex justify-center mt-10">
                        <div className="flex items-center gap-4 bg-[#15151e] border border-gray-700 rounded-full px-6 py-2 shadow-lg">
                            <button 
                                onClick={() => loadNotificaciones(currentPage - 1)} 
                                disabled={currentPage === 1} 
                                className="text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
                            >
                                ←
                            </button>
                            <span className="text-sm font-bold text-gray-400">
                                <span className="text-white">{currentPage}</span> / {totalPages}
                            </span>
                            <button 
                                onClick={() => loadNotificaciones(currentPage + 1)} 
                                disabled={currentPage === totalPages} 
                                className="text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
                            >
                                →
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default NotificationsPage;