import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createHilo, getForos } from '../services/apiService';
import { extractItems } from '../services/apiHelpers';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { 
    ChevronDownIcon,
    MagnifyingGlassIcon,
    BellIcon,
    GlobeAltIcon,
    UserCircleIcon,
    BookmarkIcon,
    ArrowRightOnRectangleIcon,
    Cog6ToothIcon,  
    UserGroupIcon,
    PlusIcon
} from '@heroicons/react/24/solid';

const CreateHiloPage = () => {
    const navigate = useNavigate();
    const { user, menuItems, logout } = useAuth();
    const { showToast } = useNotification();

    // --- ESTADOS ---
    const [titulo, setTitulo] = useState('');
    const [contenido, setContenido] = useState('');
    const [foroId, setForoId] = useState('');
    const [foros, setForos] = useState([]);
    
    // Estados de UI
    const [loading, setLoading] = useState(false);
    const [loadingForos, setLoadingForos] = useState(true);

    // Estados Navbar
    const [searchTerm, setSearchTerm] = useState('');
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef(null);

    // --- LÓGICA DE NOMBRE DE USUARIO (ROBUSTA) ---
    // Busca el nombre en todas las posibles propiedades del token
    const userNameDisplay = user?.nombreUsuario || user?.unique_name || user?.name || user?.sub || 'Usuario';
    const userEmailDisplay = user?.email || `${userNameDisplay.toLowerCase().replace(/\s+/g, '')}@fread.com`;

    // --- PERMISOS ---
    const canCreate = Boolean(
        user && (
            menuItems?.some(mi => mi.url === '/crear-hilo') ||
            user.role === 'Administrador'
        )
    );

    // --- CARGA DE DATOS ---
    useEffect(() => {
        const fetchForos = async () => {
            try {
                const response = await getForos();
                const items = extractItems(response);
                setForos(items);
                if (items.length > 0) setForoId(items[0].id);
                else showToast("No hay comunidades disponibles.", "info");
            } catch (err) {
                console.error("Error cargando foros:", err);
                showToast("Error al cargar comunidades.", "error");
            } finally {
                setLoadingForos(false);
            }
        };
        fetchForos();
    }, [showToast]);

    // Cerrar menú al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // --- HANDLERS ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!foroId) {
            showToast("Debes seleccionar una comunidad.", "info");
            return;
        }
        setLoading(true);
        try {
            await createHilo({ titulo, contenido, foroId: Number(foroId) });
            showToast("Hilo creado correctamente.", "success");
            navigate('/'); 
        } catch (err) {
            console.error(err);
            showToast("Error al publicar.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // --- NAVBAR ---
    const Navbar = () => (
        <nav className="fixed top-0 left-0 w-full z-50 bg-[#0b0b14]/80 backdrop-blur-sm border-b border-white/10 py-3 px-4 md:px-8 shadow-md">
            <div className="w-full max-w-[95%] mx-auto flex items-center justify-between gap-4">
                
                <Link to="/" className="text-3xl font-black tracking-wider text-white hover:opacity-80 transition-opacity">
                    FREAD
                </Link>

                <div className="flex-1 max-w-3xl hidden md:block px-6">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className="h-5 w-5 text-purple-400" />
                        </div>
                        <input 
                            type="text" 
                            className="block w-full pl-11 pr-4 py-3 bg-[#1e1e24] border border-gray-500 rounded-full text-white text-sm placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all" 
                            placeholder="Buscar en FREAD..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-4">
                     <Link to="/notificaciones" className="text-white hover:text-purple-400 transition-colors"><BellIcon className="h-8 w-8" /></Link>
                     <Link to="/foros" className="text-white hover:text-purple-400 transition-colors"><GlobeAltIcon className="h-8 w-8" /></Link>
                     
                     {/* PERFIL DROPDOWN */}
                     <div className="relative" ref={profileRef}>
                        <div 
                            onClick={() => setIsProfileOpen(!isProfileOpen)} 
                            className="ml-2 w-10 h-10 rounded-full bg-gray-700 overflow-hidden border-2 border-white cursor-pointer hover:border-purple-500 transition-colors"
                        >
                             <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userNameDisplay}`} alt="avatar" className="w-full h-full bg-white" />
                        </div>

                        {isProfileOpen && (
                            <div className="absolute right-0 mt-3 w-72 bg-[#15151e] border-2 border-purple-500 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fade-in-down">
                                {/* Header del Dropdown */}
                                <div className="px-4 py-4 border-b border-gray-700 bg-purple-900/10">
                                    <p className="text-base text-white font-bold">{userNameDisplay}</p>
                                    <p className="text-xs text-gray-400 truncate">{userEmailDisplay}</p>
                                </div>
                                
                                <div className="py-2">
                                    {/* Opciones Comunes */}
                                    <Link to="/perfil" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-purple-600 hover:text-white transition-colors">
                                        <UserCircleIcon className="h-5 w-5" /> Mi Perfil
                                    </Link>
                                    <Link to="/mi-actividad" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-purple-600 hover:text-white transition-colors">
                                        <BookmarkIcon className="h-5 w-5" /> Mi Actividad
                                    </Link>

                                    {/* Opciones DE ADMINISTRADOR */}
                                    {user?.role === 'Administrador' && (
                                        <>
                                            <div className="border-t border-gray-700 my-1"></div>
                                            <Link to="/popular" className="flex items-center gap-3 px-4 py-3 text-sm text-yellow-400 hover:bg-yellow-900/30 hover:text-yellow-200 transition-colors font-medium">
                                                <Cog6ToothIcon className="h-5 w-5" /> Panel de configuración
                                            </Link>
                                            <Link to="/crear-foro" className="flex items-center gap-3 px-4 py-3 text-sm text-green-400 hover:bg-green-900/30 hover:text-green-200 transition-colors font-medium">
                                                <UserGroupIcon className="h-5 w-5" /> Nuevo foro
                                            </Link>
                                        </>
                                    )}

                                    {/* Cerrar Sesión */}
                                    <div className="border-t border-gray-700 my-2"></div>
                                    <button 
                                        onClick={handleLogout} 
                                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-900/30 transition-colors text-left"
                                    >
                                        <ArrowRightOnRectangleIcon className="h-5 w-5" /> Cerrar Sesión
                                    </button>
                                </div>
                            </div>
                        )}
                     </div>
                </div>
            </div>
        </nav>
    );

    if (!user || !canCreate) return <div className="text-white pt-32 text-center">Acceso denegado.</div>;

    return (
        <div className="w-full min-h-screen text-white font-sans overflow-x-hidden relative bg-[#050505]">
            {/* FONDO ANIMADO */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-purple-900/20 rounded-full filter blur-[120px] opacity-40 animate-blob"></div>
                <div className="absolute top-[30%] right-[-10%] w-[40rem] h-[40rem] bg-indigo-900/20 rounded-full filter blur-[120px] opacity-40 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-[-10%] left-[20%] w-[40rem] h-[40rem] bg-fuchsia-900/20 rounded-full filter blur-[120px] opacity-40 animate-blob animation-delay-4000"></div>
            </div>

            <Navbar />

            <main className="relative z-10 w-full max-w-[95%] mx-auto py-8 pt-32">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                    
                    {/* FORMULARIO */}
                    <div className="lg:col-span-9">
                        <h1 className="text-4xl font-bold text-white mb-8 pl-1">Crea un hilo</h1>
                        
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="block text-gray-300 font-medium ml-1">Título</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-[#1a1a1a]/80 backdrop-blur-sm border-2 border-purple-600 rounded-3xl px-6 py-4 text-white placeholder-gray-500 focus:outline-none focus:shadow-[0_0_15px_rgba(147,51,234,0.5)] transition-all text-lg"
                                    value={titulo}
                                    onChange={(e) => setTitulo(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-gray-300 font-medium ml-1">Contenido</label>
                                <textarea
                                    required
                                    rows={8}
                                    className="w-full bg-[#1a1a1a]/80 backdrop-blur-sm border-2 border-purple-600 rounded-3xl px-6 py-4 text-white placeholder-gray-500 focus:outline-none focus:shadow-[0_0_15px_rgba(147,51,234,0.5)] transition-all text-lg resize-none"
                                    value={contenido}
                                    onChange={(e) => setContenido(e.target.value)}
                                />
                            </div>

                            <div className="flex items-center justify-between pt-4">
                                <div className="relative">
                                    <select
                                        value={foroId}
                                        onChange={(e) => setForoId(e.target.value)}
                                        className="appearance-none bg-[#050505] border-2 border-white rounded-full pl-6 pr-12 py-2 text-white font-bold cursor-pointer hover:bg-white hover:text-black transition-colors focus:outline-none"
                                        disabled={loadingForos}
                                    >
                                        {foros.map(foro => (
                                            <option key={foro.id} value={foro.id} className="bg-black text-white">
                                                {foro.nombreForo || foro.nombre}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-inherit">
                                        <ChevronDownIcon className="h-5 w-5 bg-transparent" />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-[#050505] border-2 border-white rounded-full px-8 py-2 text-white font-bold hover:bg-white hover:text-black transition-colors disabled:opacity-50"
                                >
                                    {loading ? 'Publicando...' : 'Publicar'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* REGLAS */}
                    <div className="lg:col-span-3 hidden lg:block sticky top-32">
                        <div className="bg-[#15151e]/80 backdrop-blur-md border-2 border-white rounded-[2.5rem] p-8 shadow-xl">
                            <h4 className="font-bold text-white text-center mb-6 text-xl">Reglas</h4>
                            <ul className="space-y-4 text-sm text-gray-300 font-medium text-left">
                                <li className="leading-snug"><span className="text-purple-500 font-bold mr-1">1.-</span> Respeta a los demás, esto es un foro sano!</li>
                                <li className="leading-snug"><span className="text-purple-500 font-bold mr-1">2.-</span> No hagas spam, puedes ser baneado!</li>
                                <li className="leading-snug"><span className="text-purple-500 font-bold mr-1">3.-</span> No compartas contenido personal, ni de ti, ni de nadie.</li>
                                <li className="leading-snug"><span className="text-purple-500 font-bold mr-1">4.-</span> No salgas de los temas de discusión.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CreateHiloPage;