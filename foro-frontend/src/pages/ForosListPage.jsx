import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getForos, deleteForo } from '../services/apiService';
import { extractItems, getTotalPages } from '../services/apiHelpers';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { 
    GlobeAltIcon, PlusIcon, TrashIcon, 
    ArrowRightIcon, MagnifyingGlassIcon,
    UserCircleIcon, SparklesIcon, ChevronLeftIcon, ChevronRightIcon
} from '@heroicons/react/24/solid';

// --- FONDO ANIMADO Y ESTILOS LED (Optimizado para GPU) ---
const BackgroundEffects = React.memo(() => {
    return (
        <div className="fixed inset-0 z-0 pointer-events-none bg-[#050505] overflow-hidden">
            <style>
                {`
                    @keyframes dark-flow { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
                    @keyframes grid-slide { 0% { transform: translateY(0); } 100% { transform: translateY(60px); } }

                    .foro-neon-card {
                        position: relative; padding: 2px; border-radius: 2rem; overflow: hidden; z-index: 0;
                        transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s ease;
                        will-change: transform;
                    }
                    .foro-neon-card:hover { transform: translateY(-8px) scale(1.02); box-shadow: 0 15px 40px rgba(126, 34, 206, 0.3); }

                    .foro-neon-card::before {
                        content: ''; position: absolute; inset: 0; z-index: -2;
                        background: linear-gradient(270deg, #0f172a, #312e81, #581c87, #312e81, #0f172a);
                        background-size: 400% 400%; animation: dark-flow 12s ease infinite;
                    }

                    .foro-card-body {
                        position: relative; z-index: 1; background: rgba(13, 13, 18, 0.98);
                        backdrop-filter: blur(15px); border-radius: calc(2rem - 2px); height: 100%; width: 100%;
                    }

                    .btn-visit-neon {
                        background: linear-gradient(90deg, #6d28d9, #4f46e5);
                        transition: all 0.3s ease;
                    }
                    .btn-visit-neon:hover {
                        box-shadow: 0 0 20px rgba(109, 40, 217, 0.6); transform: scale(1.05);
                    }
                `}
            </style>
            <div className="absolute top-[-10%] left-[-10%] w-[50rem] h-[50rem] bg-purple-900/10 rounded-full filter blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[45rem] h-[45rem] bg-indigo-900/10 rounded-full filter blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
            <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'linear-gradient(#4f46e5 1px, transparent 1px), linear-gradient(90deg, #4f46e5 1px, transparent 1px)', backgroundSize: '60px 60px', animation: 'grid-slide 30s linear infinite' }}></div>
        </div>
    );
});

const ForosListPage = () => {
    const [foros, setForos] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(true);

    const { user } = useAuth();
    const { showToast } = useNotification();
    const navigate = useNavigate();

    // ID del usuario logueado (manejando diferentes formatos de token)
    const currentUserId = user?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || user?.id || user?.sub;

    useEffect(() => {
        fetchForos(currentPage);
    }, [currentPage]);

    const fetchForos = async (page = 1) => {
        setIsLoading(true);
        try {
            const response = await getForos(page, 12); // Cargamos 12 para un grid 3x4 perfecto
            setForos(extractItems(response) || []);
            setTotalPages(getTotalPages(response) || 1);
            setCurrentPage(page);
        } catch (error) {
            console.error("Error al obtener los foros:", error);
            showToast("No se pudo conectar con el servidor central.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (foroId, foroName) => {
        if (window.confirm(`¿Estás seguro de eliminar el sector "f/${foroName}"? Esta acción borrará todos sus hilos.`)) {
            try {
                await deleteForo(foroId);
                showToast(`Sector f/${foroName} eliminado con éxito.`, "success");
                fetchForos(currentPage);
            } catch (error) {
                showToast("Error de seguridad: Acción no permitida.", "error");
            }
        }
    };

    // Filtrado en vivo de foros para la página actual
    const filteredForos = useMemo(() => {
        return foros.filter(f => f.nombreForo.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [foros, searchTerm]);

    return (
        <div className="w-full min-h-screen text-white font-sans bg-[#050505] overflow-x-hidden">
            <BackgroundEffects />

            <main className="relative z-10 w-full max-w-7xl mx-auto py-8 pt-32 px-4 mb-20">
                
                {/* --- HEADER TÁCTICO --- */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-8">
                    <div>
                        <h1 className="text-4xl md:text-6xl font-black text-white mb-2 flex items-center gap-4">
                            <SparklesIcon className="h-10 w-10 text-purple-500 animate-pulse" />
                            Comunidades
                        </h1>
                        <p className="text-gray-400 text-lg">Descubre los sectores más activos de la red FREAD.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                        {/* Buscador minimalista */}
                        <div className="relative w-full sm:w-64 group">
                            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-purple-500 transition-colors" />
                            <input 
                                type="text"
                                placeholder="Filtrar sectores..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-[#15151e]/80 border border-gray-700 rounded-full py-3 pl-12 pr-4 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-sm"
                            />
                        </div>
                        
                        <Link to="/crear-foro" className="w-full sm:w-auto bg-purple-600 hover:bg-purple-500 text-white font-black px-8 py-3 rounded-full flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(147,51,234,0.3)] transition-all">
                            <PlusIcon className="h-5 w-5" /> Crear Sector
                        </Link>
                    </div>
                </div>

                {/* --- GRID DE FOROS --- */}
                {isLoading ? (
                    <div className="text-center py-32">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-6"></div>
                        <p className="text-purple-400 font-mono tracking-widest uppercase text-xs">Mapeando red...</p>
                    </div>
                ) : filteredForos.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredForos.map(foro => (
                                <div key={foro.id} className="foro-neon-card shadow-lg">
                                    <div className="foro-card-body p-8 flex flex-col h-full">
                                        
                                        <div className="flex items-start justify-between mb-6">
                                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center text-2xl font-black shadow-[0_0_15px_rgba(109,40,217,0.4)]">
                                                {foro.nombreForo.charAt(0).toUpperCase()}
                                            </div>
                                            {foro.usuarioId && Number(currentUserId) === foro.usuarioId && (
                                                <button 
                                                    onClick={() => handleDelete(foro.id, foro.nombreForo)}
                                                    className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                                >
                                                    <TrashIcon className="h-5 w-5" />
                                                </button>
                                            )}
                                        </div>

                                        <Link to={`/foro/${foro.id}`} className="block group">
                                            <h2 className="text-2xl font-black text-white mb-2 group-hover:text-purple-400 transition-colors">
                                                f/{foro.nombreForo}
                                            </h2>
                                            <p className="text-gray-400 text-sm leading-relaxed mb-6 line-clamp-3 min-h-[60px]">
                                                {foro.descripcion || "Este sector aún no tiene descripción. ¡Sé el primero en explorarlo!"}
                                            </p>
                                        </Link>

                                        <div className="mt-auto pt-6 border-t border-gray-800 flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-gray-500 text-xs">
                                                <UserCircleIcon className="h-4 w-4" />
                                                <span>{foro.usuario?.nombreUsuario || 'Anon_User'}</span>
                                            </div>
                                            <Link to={`/foro/${foro.id}`} className="btn-visit-neon text-white font-black text-xs px-5 py-2 rounded-full flex items-center gap-2">
                                                Entrar <ArrowRightIcon className="h-3 w-3" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* --- PAGINACIÓN --- */}
                        {totalPages > 1 && (
                            <div className="flex justify-center mt-16">
                                <div className="flex items-center gap-6 bg-[#0b0b10] border border-gray-800 rounded-full px-8 py-3 shadow-2xl backdrop-blur-md">
                                    <button 
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                                        disabled={currentPage === 1}
                                        className="p-1 rounded-full hover:bg-purple-900/30 text-gray-400 hover:text-white disabled:opacity-20 transition-all"
                                    >
                                        <ChevronLeftIcon className="h-6 w-6" />
                                    </button>
                                    <span className="text-sm font-bold font-mono tracking-widest text-gray-400">
                                        SECTOR <span className="text-white text-lg">{currentPage}</span> / {totalPages}
                                    </span>
                                    <button 
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                                        disabled={currentPage === totalPages}
                                        className="p-1 rounded-full hover:bg-purple-900/30 text-gray-400 hover:text-white disabled:opacity-20 transition-all"
                                    >
                                        <ChevronRightIcon className="h-6 w-6" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-32 border-2 border-dashed border-gray-800 rounded-[3rem] bg-[#0b0b10]/40 backdrop-blur-sm">
                        <GlobeAltIcon className="h-20 w-20 text-gray-800 mx-auto mb-6" />
                        <h2 className="text-2xl font-bold text-gray-400 mb-2">Vacío absoluto</h2>
                        <p className="text-gray-600 mb-8">No hemos encontrado ninguna comunidad con ese criterio.</p>
                        <Link to="/crear-foro" className="text-purple-500 font-black hover:text-purple-400 underline">Crea el primer sector de la red</Link>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ForosListPage;