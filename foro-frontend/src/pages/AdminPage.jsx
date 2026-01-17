import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getUsers, deleteUser, changeUserRole } from '../services/apiService';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { 
    ShieldCheckIcon, UserIcon, TrashIcon, 
    BellIcon, GlobeAltIcon, PlusIcon, UserCircleIcon, BookmarkIcon, 
    Cog6ToothIcon, UserGroupIcon, ArrowRightOnRectangleIcon,
    ChevronLeftIcon, ChevronRightIcon, EnvelopeIcon,
    FunnelIcon
} from '@heroicons/react/24/solid';

// --- BACKGROUND OPTIMIZADO (GPU ACCELERATED) ---
const BackgroundEffects = React.memo(() => {
    return (
        <div className="fixed inset-0 z-0 pointer-events-none bg-[#050505] overflow-hidden translate-z-0">
            <style>
                {`
                    @keyframes float-slow {
                        0% { transform: translate3d(0, 0, 0) rotate(0deg); }
                        50% { transform: translate3d(20px, 30px, 0) rotate(2deg); }
                        100% { transform: translate3d(0, 0, 0) rotate(0deg); }
                    }
                    @keyframes dark-flow {
                        0% { background-position: 0% 50%; }
                        50% { background-position: 100% 50%; }
                        100% { background-position: 0% 50%; }
                    }
                    @keyframes grid-slide {
                        0% { transform: translateY(0); }
                        100% { transform: translateY(50px); }
                    }

                    .admin-panel-border {
                        position: relative;
                        padding: 1px;
                        border-radius: 2rem;
                        background: #15151e;
                        box-shadow: 0 0 30px rgba(88, 28, 135, 0.1); 
                        transition: box-shadow 0.3s ease;
                        will-change: box-shadow;
                    }
                    .admin-panel-border:hover {
                        box-shadow: 0 0 50px rgba(88, 28, 135, 0.2);
                    }
                    .admin-panel-border::before {
                        content: '';
                        position: absolute;
                        inset: 0;
                        z-index: 0;
                        border-radius: 2rem;
                        background: linear-gradient(270deg, #0f172a, #312e81, #581c87, #312e81, #0f172a);
                        background-size: 400% 400%;
                        animation: dark-flow 15s ease infinite;
                        will-change: background-position;
                    }
                    .admin-panel-body {
                        position: relative;
                        z-index: 1;
                        background-color: rgba(13, 13, 18, 0.96); 
                        backdrop-filter: blur(10px); 
                        -webkit-backdrop-filter: blur(10px);
                        border-radius: calc(2rem - 1px);
                        height: 100%;
                        width: 100%;
                    }
                    .gpu-blob {
                        position: absolute;
                        border-radius: 50%;
                        opacity: 0.3;
                        animation: float-slow 20s ease-in-out infinite;
                        will-change: transform;
                    }
                    .blob-purple { background: radial-gradient(circle, rgba(88,28,135,0.6) 0%, rgba(0,0,0,0) 70%); }
                    .blob-indigo { background: radial-gradient(circle, rgba(49,46,129,0.6) 0%, rgba(0,0,0,0) 70%); }

                    .filter-tab { transition: all 0.2s ease; }
                    .filter-tab.active {
                        background: rgba(124, 58, 237, 0.15);
                        color: #fff;
                        border: 1px solid rgba(139, 92, 246, 0.4);
                    }
                    .filter-tab:not(.active):hover {
                        background: rgba(255, 255, 255, 0.05);
                        color: #d1d5db;
                    }
                `}
            </style>
            
            <div className="gpu-blob blob-purple w-[50rem] h-[50rem] top-[-10%] left-[-10%]"></div>
            <div className="gpu-blob blob-indigo w-[50rem] h-[50rem] bottom-[-10%] right-[-10%] animation-delay-2000"></div>
            
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
                 style={{ 
                     backgroundImage: 'linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(90deg, #6366f1 1px, transparent 1px)', 
                     backgroundSize: '60px 60px',
                     animation: 'grid-slide 30s linear infinite',
                     willChange: 'transform'
                 }}>
            </div>
        </div>
    );
});

const AdminPage = () => {
    const navigate = useNavigate();
    const { logout, user } = useAuth(); 
    const { showToast } = useNotification();

    const [users, setUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);
    
    const [filterRole, setFilterRole] = useState('all');

    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef(null);

    // --- CORRECCIÓN: NOMBRE REAL DEL USUARIO ---
    const userNameDisplay = user?.nombreUsuario || user?.unique_name || user?.name || user?.sub || 'Usuario';
    const userEmailDisplay = user?.email || `${userNameDisplay.toLowerCase().replace(/\s+/g, '')}@fread.com`;
    
    const roles = useMemo(() => [{ id: 1, nombreRol: 'Administrador' }, { id: 2, nombreRol: 'Usuario' }], []);

    const fetchUsers = async (pageNumber = 1) => {
        setLoading(true);
        try {
            const response = await getUsers(pageNumber, 9); 
            const data = response.data;
            setUsers(Array.isArray(data.items) ? data.items : data.Items || []);
            setTotalPages(data.totalPages || data.TotalPages || 1);
            setTotalCount(data.totalCount || data.TotalCount || 0);
            setCurrentPage(pageNumber);
        } catch (error) {
            showToast('Error de conexión.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers(currentPage);
    }, [currentPage]);

    const filteredUsers = useMemo(() => {
        return users.filter(u => {
            if (filterRole === 'all') return true;
            return u.rolId === parseInt(filterRole);
        });
    }, [users, filterRole]);

    const handleRoleChange = async (userId, newRoleId) => {
        try {
            const currentUserId = user ? Number(user.id || user.nameid || user.sub) : null;
            const targetUserId = Number(userId);
            const isSelfRoleChange = currentUserId === targetUserId;

            await changeUserRole(userId, newRoleId);

            const newRoleObj = roles.find(r => r.id === newRoleId);
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, rolId: newRoleId, rol: newRoleObj } : u));

            if (isSelfRoleChange) {
                showToast('Rol propio modificado. Reiniciando...', 'warning');
                setTimeout(() => { logout(); navigate('/login'); }, 2000);
            } else {
                showToast('Rol actualizado.', 'success');
            }
        } catch (error) {
            showToast('Error al modificar rol.', 'error');
        }
    };

    const handleDeleteUser = async (userId, userName) => {
        if (window.confirm(`¿Eliminar a "${userName}"?`)) {
            try {
                await deleteUser(userId);
                showToast(`Usuario eliminado.`, 'success');
                fetchUsers(currentPage);
            } catch (error) {
                showToast('Error al eliminar.', 'error');
            }
        }
    };

    const handleLogout = () => { logout(); navigate('/login'); };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) setIsProfileOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="w-full min-h-screen text-white font-sans bg-[#050505] overflow-x-hidden">
            <BackgroundEffects />

            <nav className="fixed top-0 left-0 w-full z-50 bg-[#0b0b14]/90 backdrop-blur-md border-b border-white/5 py-3 px-4 md:px-8 shadow-lg">
                <div className="w-full max-w-[95%] mx-auto flex items-center justify-between gap-4">
                    <Link to="/" className="text-3xl font-black tracking-wider text-white hover:opacity-80 transition-opacity">FREAD</Link>
                    <div className="flex-1"></div>
                    <div className="flex items-center gap-4">
                        <Link to="/notificaciones" className="text-gray-400 hover:text-purple-400 transition-colors"><BellIcon className="h-8 w-8" /></Link>
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
                                        
                                        {/* OPCIONES DE ADMIN (Aseguradas para que aparezcan) */}
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

            <main className="relative z-10 w-full max-w-7xl mx-auto py-8 pt-32 px-4">
                
                <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-6">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black text-white mb-2 flex items-center gap-3">
                            <Cog6ToothIcon className="h-10 w-10 text-purple-500 animate-spin-slow" /> 
                            Centro de Comando
                        </h1>
                        <p className="text-gray-400 text-lg">Gestión de usuarios y privilegios.</p>
                    </div>

                    <div className="flex items-center gap-2 bg-[#0f0f13] p-1.5 rounded-xl border border-gray-800 shadow-lg">
                        <button onClick={() => setFilterRole('all')} className={`filter-tab px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 ${filterRole === 'all' ? 'active' : 'text-gray-500'}`}>
                            <UserGroupIcon className="h-4 w-4" /> Todos
                        </button>
                        <button onClick={() => setFilterRole('1')} className={`filter-tab px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 ${filterRole === '1' ? 'active' : 'text-gray-500'}`}>
                            <ShieldCheckIcon className="h-4 w-4" /> Admins
                        </button>
                        <button onClick={() => setFilterRole('2')} className={`filter-tab px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 ${filterRole === '2' ? 'active' : 'text-gray-500'}`}>
                            <UserIcon className="h-4 w-4" /> Usuarios
                        </button>
                    </div>
                </div>

                <div className="admin-panel-border shadow-2xl">
                    <div className="admin-panel-body p-6 md:p-8 flex flex-col min-h-[600px]">
                        
                        {loading ? (
                            <div className="flex-1 flex flex-col items-center justify-center">
                                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
                                <p className="text-purple-400 font-bold animate-pulse tracking-widest uppercase text-xs">Escaneando...</p>
                            </div>
                        ) : filteredUsers.length > 0 ? (
                            <div className="flex-1">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredUsers.map(u => (
                                        <div key={u.id} className="bg-[#0b0b10] border border-gray-800 rounded-2xl p-5 hover:border-purple-500/30 hover:bg-[#121218] transition-colors group relative overflow-hidden shadow-lg">
                                            
                                            <div className="flex items-start justify-between mb-4 relative z-10">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-12 h-12 rounded-full bg-gray-800 overflow-hidden border-2 transition-colors ${u.rolId === 1 ? 'border-yellow-500/50 shadow-[0_0_10px_rgba(234,179,8,0.2)]' : 'border-gray-700 group-hover:border-purple-500'}`}>
                                                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u.nombreUsuario}`} alt="avatar" className="w-full h-full bg-white" />
                                                    </div>
                                                    <div className="overflow-hidden">
                                                        <h3 className="font-bold text-white text-lg leading-tight truncate w-full" title={u.nombreUsuario}>{u.nombreUsuario}</h3>
                                                        <span className="text-xs text-gray-500 font-mono tracking-wider">ID: {u.id}</span>
                                                    </div>
                                                </div>
                                                {u.rolId === 1 ? (
                                                    <ShieldCheckIcon className="h-6 w-6 text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" title="Administrador" />
                                                ) : (
                                                    <UserIcon className="h-6 w-6 text-gray-600 group-hover:text-purple-400 transition-colors" />
                                                )}
                                            </div>

                                            <div className="mb-6 relative z-10 space-y-2">
                                                <div className="flex items-center gap-2 text-gray-400 text-sm bg-[#1a1a24] px-3 py-1.5 rounded-lg border border-gray-800/50">
                                                    <EnvelopeIcon className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                                    <span className="truncate">{u.email}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 pt-4 border-t border-gray-800 relative z-10">
                                                <div className="flex-1 relative">
                                                    <select 
                                                        value={u.rolId} 
                                                        onChange={(e) => handleRoleChange(u.id, parseInt(e.target.value))}
                                                        className="w-full bg-[#0f0f13] text-gray-300 text-sm border border-gray-700 rounded-lg px-3 py-2.5 focus:outline-none focus:border-purple-500 cursor-pointer hover:bg-[#1a1a24] transition-colors appearance-none"
                                                    >
                                                        {roles.map(rol => (
                                                            <option key={rol.id} value={rol.id}>{rol.nombreRol}</option>
                                                        ))}
                                                    </select>
                                                    <div className="absolute right-3 top-3 pointer-events-none text-gray-500">
                                                        <ChevronRightIcon className="h-3 w-3 rotate-90" />
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => handleDeleteUser(u.id, u.nombreUsuario)}
                                                    className="p-2.5 rounded-lg bg-red-900/10 text-red-500 border border-red-900/30 hover:bg-red-600 hover:text-white hover:border-red-500 transition-all shadow-md"
                                                    title="Eliminar Usuario"
                                                >
                                                    <TrashIcon className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-800 rounded-3xl bg-[#0b0b10]/50 m-4">
                                <FunnelIcon className="h-16 w-16 text-gray-700 mb-4" />
                                <p className="text-gray-500 text-lg font-medium">No se encontraron resultados.</p>
                                <button onClick={() => setFilterRole('all')} className="mt-4 text-purple-400 hover:text-purple-300 underline text-sm font-bold">Ver todos</button>
                            </div>
                        )}

                        {totalPages > 1 && (
                            <div className="flex justify-center mt-8 pt-6 border-t border-gray-800/50">
                                <div className="flex items-center gap-4 bg-[#0b0b10] border border-gray-700 rounded-full px-6 py-2 shadow-lg backdrop-blur-md">
                                    <button 
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                                        disabled={currentPage === 1} 
                                        className="p-2 rounded-full hover:bg-purple-900/30 text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
                                    >
                                        <ChevronLeftIcon className="h-5 w-5" />
                                    </button>
                                    <span className="text-sm font-bold text-gray-300 font-mono">
                                        Página <span className="text-white text-base text-purple-400">{currentPage}</span> / {totalPages}
                                    </span>
                                    <button 
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                                        disabled={currentPage === totalPages} 
                                        className="p-2 rounded-full hover:bg-purple-900/30 text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
                                    >
                                        <ChevronRightIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminPage;