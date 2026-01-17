import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { getHilosByUserId, getComentariosByUserId } from '../services/apiService';
import { extractItems, getTotalPages, getTotalCount } from '../services/apiHelpers';
import { Link, useNavigate } from 'react-router-dom';
import { 
    ChatBubbleLeftEllipsisIcon, 
    DocumentTextIcon, 
    ChevronRightIcon, 
    ClockIcon,
    ArrowLeftIcon,
    SparklesIcon
} from '@heroicons/react/24/solid';

// --- BACKGROUND OPTIMIZADO (Identidad Visual FREAD) ---
const BackgroundEffects = React.memo(() => {
    return (
        <div className="fixed inset-0 z-0 pointer-events-none bg-[#050505] overflow-hidden translate-z-0">
            <style>
                {`
                    @keyframes dark-flow { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
                    .gpu-blob { position: absolute; border-radius: 50%; opacity: 0.25; filter: blur(100px); will-change: transform; }
                    .blob-purple { background: radial-gradient(circle, #581c87 0%, transparent 70%); }
                    .blob-blue { background: radial-gradient(circle, #1e3a8a 0%, transparent 70%); }
                    
                    .activity-glass-card {
                        background: rgba(20, 20, 25, 0.6);
                        backdrop-filter: blur(15px);
                        border: 1px solid rgba(255, 255, 255, 0.05);
                        border-radius: 2rem;
                        transition: all 0.4s ease;
                    }
                    .activity-glass-card:hover {
                        background: rgba(30, 30, 40, 0.8);
                        border-color: rgba(168, 85, 247, 0.3);
                        transform: translateY(-5px);
                    }

                    .neon-timeline-line {
                        position: absolute; left: 20px; top: 0; bottom: 0;
                        width: 2px; background: linear-gradient(to bottom, transparent, #6d28d9, transparent);
                    }
                `}
            </style>
            <div className="gpu-blob blob-purple w-[60rem] h-[60rem] top-[-10%] left-[-10%]"></div>
            <div className="gpu-blob blob-blue w-[50rem] h-[50rem] bottom-[-10%] right-[-10%]"></div>
        </div>
    );
});

const MiActividadPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [hilos, setHilos] = useState([]);
    const [hilosPage, setHilosPage] = useState(1);
    const [hilosTotalPages, setHilosTotalPages] = useState(1);
    const [hilosTotalCount, setHilosTotalCount] = useState(0);
    
    const [comentarios, setComentarios] = useState([]);
    const [comentariosPage, setComentariosPage] = useState(1);
    const [comentariosTotalPages, setComentariosTotalPages] = useState(1);
    const [comentariosTotalCount, setComentariosTotalCount] = useState(0);
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (user && user.id) {
            const fetchData = async () => {
                setLoading(true);
                const userIdToUse = Number(user.id);
                try {
                    const [hilosRes, comentariosRes] = await Promise.all([
                        getHilosByUserId(userIdToUse, hilosPage, 5),
                        getComentariosByUserId(userIdToUse, comentariosPage, 5)
                    ]);
                    
                    setHilos(extractItems(hilosRes) || []);
                    setHilosTotalPages(getTotalPages(hilosRes) || 1);
                    setHilosTotalCount(getTotalCount(hilosRes) || 0);

                    setComentarios(extractItems(comentariosRes) || []);
                    setComentariosTotalPages(getTotalPages(comentariosRes) || 1);
                    setComentariosTotalCount(getTotalCount(comentariosRes) || 0);
                } catch (err) {
                    setError(`Error en la red central: ${err.message}`);
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        }
    }, [user, hilosPage, comentariosPage]);

    if (loading) return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
    );

    return (
        <div className="w-full min-h-screen text-white font-sans bg-[#050505] overflow-x-hidden pb-20">
            <BackgroundEffects />

            {/* --- HEADER TÁCTICO --- */}
            <header className="relative z-10 pt-32 px-6 max-w-7xl mx-auto">
                <button 
                    onClick={() => navigate(-1)} 
                    className="mb-6 flex items-center gap-2 text-gray-400 hover:text-purple-400 transition-colors group"
                >
                    <ArrowLeftIcon className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                    Regresar
                </button>
                <div className="flex items-center gap-4 mb-2">
                    <SparklesIcon className="h-8 w-8 text-purple-500 animate-pulse" />
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter">Mi actividad en FREAD</h1>
                </div>
                <p className="text-gray-400 text-lg ml-1">Tu huella digital en la red FREAD.</p>
            </header>

            <main className="relative z-10 max-w-7xl mx-auto px-6 mt-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    
                    {/* --- COLUMNA HILOS --- */}
                    <section className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <h2 className="text-2xl font-bold flex items-center gap-3">
                                <DocumentTextIcon className="h-7 w-7 text-purple-500" />
                                Hilos Creados
                            </h2>
                            <span className="bg-purple-500/20 text-purple-400 px-4 py-1 rounded-full text-sm font-bold border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                                {hilosTotalCount} total
                            </span>
                        </div>

                        <div className="relative space-y-4 min-h-[400px]">
                            <div className="neon-timeline-line" />
                            {hilos.length > 0 ? hilos.map(hilo => (
                                <Link to={`/hilo/${hilo.id}`} key={hilo.id} className="block group">
                                    <div className="activity-glass-card p-6 ml-10 relative">
                                        {/* Punto de la línea de tiempo */}
                                        <div className="absolute -left-[30px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-purple-600 border-4 border-[#050505] shadow-[0_0_10px_#6d28d9] group-hover:scale-125 transition-transform" />
                                        
                                        <div className="flex justify-between items-center">
                                            <div className="flex-1">
                                                <h3 className="text-xl font-bold text-gray-100 group-hover:text-purple-400 transition-colors mb-1">
                                                    {hilo.titulo}
                                                </h3>
                                                <div className="flex items-center gap-3 text-sm text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <ClockIcon className="h-4 w-4" />
                                                        en f/{hilo.foro?.nombreForo || 'Foro'}
                                                    </span>
                                                </div>
                                            </div>
                                            <ChevronRightIcon className="h-6 w-6 text-gray-700 group-hover:text-purple-400 transition-all" />
                                        </div>
                                    </div>
                                </Link>
                            )) : (
                                <div className="ml-10 py-10 text-gray-600 italic">Aún no has compartido historias con la red...</div>
                            )}
                        </div>

                        {/* Paginación Hilos */}
                        {hilosTotalPages > 1 && (
                            <div className="flex items-center gap-4 justify-center pt-4">
                                <button 
                                    onClick={() => setHilosPage(p => Math.max(1, p - 1))}
                                    disabled={hilosPage === 1}
                                    className="p-2 rounded-lg bg-white/5 hover:bg-purple-500/20 disabled:opacity-20 transition-all"
                                >
                                    <ArrowLeftIcon className="h-5 w-5" />
                                </button>
                                <span className="text-sm font-mono">{hilosPage} / {hilosTotalPages}</span>
                                <button 
                                    onClick={() => setHilosPage(p => Math.min(hilosTotalPages, p + 1))}
                                    disabled={hilosPage === hilosTotalPages}
                                    className="p-2 rounded-lg bg-white/5 hover:bg-purple-500/20 disabled:opacity-20 transition-all"
                                >
                                    <ChevronRightIcon className="h-5 w-5" />
                                </button>
                            </div>
                        )}
                    </section>

                    {/* --- COLUMNA COMENTARIOS --- */}
                    <section className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <h2 className="text-2xl font-bold flex items-center gap-3">
                                <ChatBubbleLeftEllipsisIcon className="h-7 w-7 text-blue-500" />
                                Intervenciones
                            </h2>
                            <span className="bg-blue-500/20 text-blue-400 px-4 py-1 rounded-full text-sm font-bold border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                                {comentariosTotalCount} total
                            </span>
                        </div>

                        <div className="space-y-4 min-h-[400px]">
                            {comentarios.length > 0 ? comentarios.map(comentario => (
                                <div key={comentario.id} className="activity-glass-card p-6 relative group overflow-hidden">
                                    {/* Destello lateral azul */}
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 opacity-30 group-hover:opacity-100 transition-opacity" />
                                    
                                    <p className="text-gray-300 mb-4 line-clamp-2 italic">
                                        "{comentario.contenido}"
                                    </p>
                                    
                                    <div className="flex justify-between items-center border-t border-white/5 pt-4">
                                        <Link 
                                            to={`/hilo/${comentario.hiloId}`} 
                                            className="text-xs font-bold text-blue-400 hover:text-blue-300 uppercase tracking-widest flex items-center gap-1"
                                        >
                                            Ver contexto <ChevronRightIcon className="h-3 w-3" />
                                        </Link>
                                        <span className="text-[10px] text-gray-600 font-mono">ID_REF: #{comentario.id}</span>
                                    </div>
                                </div>
                            )) : (
                                <div className="py-10 text-gray-600 italic">Tus pensamientos aún no han sido registrados...</div>
                            )}
                        </div>

                        {/* Paginación Comentarios */}
                        {comentariosTotalPages > 1 && (
                            <div className="flex items-center gap-4 justify-center pt-4">
                                <button 
                                    onClick={() => setComentariosPage(p => Math.max(1, p - 1))}
                                    disabled={comentariosPage === 1}
                                    className="p-2 rounded-lg bg-white/5 hover:bg-blue-500/20 disabled:opacity-20 transition-all"
                                >
                                    <ArrowLeftIcon className="h-5 w-5" />
                                </button>
                                <span className="text-sm font-mono">{comentariosPage} / {comentariosTotalPages}</span>
                                <button 
                                    onClick={() => setComentariosPage(p => Math.min(comentariosTotalPages, p + 1))}
                                    disabled={comentariosPage === comentariosTotalPages}
                                    className="p-2 rounded-lg bg-white/5 hover:bg-blue-500/20 disabled:opacity-20 transition-all"
                                >
                                    <ChevronRightIcon className="h-5 w-5" />
                                </button>
                            </div>
                        )}
                    </section>

                </div>
            </main>
        </div>
    );
};

export default MiActividadPage;