import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getHiloById, deleteHilo, updateHilo, getComentariosByHiloId, createComentario } from '../services/apiService';
import { extractItems, getTotalPages, getTotalCount } from '../services/apiHelpers';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { 
    MagnifyingGlassIcon, BellIcon, GlobeAltIcon, UserCircleIcon, BookmarkIcon, 
    ArrowRightOnRectangleIcon, Cog6ToothIcon, UserGroupIcon, PlusIcon,
    ChatBubbleLeftRightIcon, TrashIcon, PencilIcon, PaperAirplaneIcon,
    ChevronLeftIcon, ChevronRightIcon, CheckIcon
} from '@heroicons/react/24/solid';

const HiloDetailPage = () => {
    // --- ESTADOS ---
    const [hilo, setHilo] = useState(null);
    const [comentarios, setComentarios] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editTitulo, setEditTitulo] = useState("");
    const [editContenido, setEditContenido] = useState("");

    // --- PAGINACIÓN Y UI ---
    const [comentariosPage, setComentariosPage] = useState(1);
    const [comentariosTotalPages, setComentariosTotalPages] = useState(1);
    const [comentariosTotalCount, setComentariosTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [nuevoComentario, setNuevoComentario] = useState("");
    
    // --- NAVBAR STATES ---
    const [searchTerm, setSearchTerm] = useState('');
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef(null);
    
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { showToast } = useNotification();

    // Identificación robusta
    const currentUserName = user ? (user.nombreUsuario || user.unique_name || user.name || 'Usuario') : '';
    const userEmailDisplay = user?.email || `${currentUserName.toLowerCase().replace(/\s+/g, '')}@fread.com`;
    const isAdmin = user?.role === 'Administrador';

    // --- FUNCIÓN PARA FORMATEAR FECHA ---
    const formatDate = (dateString) => {
        if (!dateString) return 'Fecha desconocida';
        try {
            const date = new Date(dateString);
            return new Intl.DateTimeFormat('es-ES', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            }).format(date);
        } catch (e) {
            return dateString;
        }
    };

    // --- CARGA DE DATOS ---
    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const [hiloRes, comentariosRes] = await Promise.all([
                    getHiloById(id),
                    getComentariosByHiloId(id, comentariosPage, 10)
                ]);
                
                const hiloData = hiloRes.data || hiloRes;
                setHilo(hiloData);
                setEditTitulo(hiloData.titulo);
                setEditContenido(hiloData.contenido);

                setComentarios(extractItems(comentariosRes));
                setComentariosTotalPages(getTotalPages(comentariosRes));
                setComentariosTotalCount(getTotalCount(comentariosRes));
            } catch (error) {
                console.error("Error:", error);
                showToast("Error al cargar el hilo.", "error");
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
    }, [id, comentariosPage, showToast]);

    // Cerrar menú click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // --- PERMISOS ---
    const hiloAuthor = hilo?.usuario?.nombreUsuario || hilo?.usuarioNombre || '';
    const isOwner = user && (currentUserName.toLowerCase() === hiloAuthor.toLowerCase());

    // --- HANDLERS ---
    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!nuevoComentario.trim()) return;
        try {
            await createComentario(id, { contenido: nuevoComentario });
            setNuevoComentario("");
            setComentariosPage(1); 
            // Recargar comentarios
            const comentariosRes = await getComentariosByHiloId(id, 1, 10);
            setComentarios(extractItems(comentariosRes));
            setComentariosTotalCount(prev => prev + 1);
            showToast('Comentario publicado.', 'success');
        } catch (error) {
            console.error(error);
            showToast('Error al publicar.', 'error');
        }
    };

    const handleDeleteHilo = async () => {
        if (window.confirm("¿Estás seguro de eliminar este hilo permanentemente?")) {
            try {
                await deleteHilo(id);
                showToast("Hilo eliminado.", "success");
                navigate('/'); 
            } catch (error) {
                console.error(error);
                showToast("Error al eliminar.", "error");
            }
        }
    };

    const handleSaveEdit = async () => {
        if (!editTitulo.trim() || !editContenido.trim()) {
            showToast("Campos vacíos.", "info");
            return;
        }
        setSaving(true);
        try {
            await updateHilo(id, { titulo: editTitulo, contenido: editContenido, foroId: hilo.foroId });
            setHilo({ ...hilo, titulo: editTitulo, contenido: editContenido });
            setIsEditing(false);
            showToast("Actualizado correctamente.", "success");
        } catch (error) {
            console.error(error);
            showToast("Error al editar.", "error");
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => { logout(); navigate('/login'); };

    // --- RENDERIZADO ---
    if (loading) return <div className="fixed inset-0 z-50 bg-[#050505] flex items-center justify-center"><div className="text-purple-500 font-bold text-xl animate-pulse">Cargando...</div></div>;
    if (!hilo) return <div className="fixed inset-0 z-50 bg-[#050505] flex items-center justify-center text-red-500 font-bold">Hilo no encontrado.</div>;

    const autorHilo = hilo.usuario?.nombreUsuario || hilo.usuarioNombre || 'Anónimo';
    const foroNombre = hilo.foro?.nombreForo || hilo.foroNombre || 'General';

    return (
        <div className="fixed inset-0 z-50 w-screen h-screen bg-[#050505] text-white font-sans overflow-y-auto overflow-x-hidden">
            
            {/* Fondo Animado */}
            <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-purple-900/20 rounded-full filter blur-[120px] opacity-40 animate-blob"></div>
                <div className="absolute top-[30%] right-[-10%] w-[40rem] h-[40rem] bg-indigo-900/20 rounded-full filter blur-[120px] opacity-40 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-[-10%] left-[20%] w-[40rem] h-[40rem] bg-fuchsia-900/20 rounded-full filter blur-[120px] opacity-40 animate-blob animation-delay-4000"></div>
            </div>

            {/* --- NAVBAR INTEGRADA --- */}
            <nav className="fixed top-0 left-0 w-full z-[60] bg-[#0b0b14]/90 backdrop-blur-md border-b border-white/10 py-3 px-4 md:px-8 shadow-md">
                <div className="w-full max-w-[95%] mx-auto flex items-center justify-between gap-4">
                    <Link to="/" className="text-3xl font-black tracking-wider text-white hover:opacity-80 transition-opacity">FREAD</Link>
                    
                    <div className="flex-1 max-w-3xl hidden md:block px-6">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <MagnifyingGlassIcon className="h-5 w-5 text-purple-400" />
                            </div>
                            <input 
                                type="text" 
                                className="block w-full pl-11 pr-4 py-3 bg-[#1e1e24] border border-gray-500 rounded-full text-white text-sm focus:border-purple-500 focus:outline-none transition-all" 
                                placeholder="Buscar en FREAD..." 
                                value={searchTerm} 
                                onChange={(e) => setSearchTerm(e.target.value)} 
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                         <Link to="/notificaciones" className="text-white hover:text-purple-400"><BellIcon className="h-8 w-8" /></Link>
                         <Link to="/foros" className="text-white hover:text-purple-400"><GlobeAltIcon className="h-8 w-8" /></Link>
                         <Link to="/crear-hilo" className="text-white hover:text-purple-400 border-2 border-white rounded-lg p-1"><PlusIcon className="h-6 w-6" /></Link>
                         
                         <div className="relative" ref={profileRef}>
                            <div onClick={() => setIsProfileOpen(!isProfileOpen)} className="ml-2 w-10 h-10 rounded-full bg-gray-700 overflow-hidden border-2 border-white cursor-pointer hover:border-purple-500 transition-colors">
                                 <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUserName}`} alt="avatar" className="w-full h-full bg-white" />
                            </div>
                            {isProfileOpen && (
                                <div className="absolute right-0 mt-3 w-72 bg-[#15151e] border-2 border-purple-500 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fade-in-down">
                                    <div className="px-4 py-4 border-b border-gray-700 bg-purple-900/10">
                                        <p className="text-base text-white font-bold">{currentUserName}</p>
                                        <p className="text-xs text-gray-400 truncate">{userEmailDisplay}</p>
                                    </div>
                                    <div className="py-2">
                                        <Link to="/perfil" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-purple-600 hover:text-white transition-colors"><UserCircleIcon className="h-5 w-5" /> Mi Perfil</Link>
                                        <Link to="/mi-actividad" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-purple-600 hover:text-white transition-colors"><BookmarkIcon className="h-5 w-5" /> Mi Actividad</Link>
                                        {user?.role === 'Administrador' && (
                                            <>
                                                <div className="border-t border-gray-700 my-1"></div>
                                                <Link to="/popular" className="flex items-center gap-3 px-4 py-3 text-sm text-yellow-400 hover:bg-yellow-900/30"><Cog6ToothIcon className="h-5 w-5" /> Panel de configuración</Link>
                                                <Link to="/crear-foro" className="flex items-center gap-3 px-4 py-3 text-sm text-green-400 hover:bg-green-900/30"><UserGroupIcon className="h-5 w-5" /> Nuevo foro</Link>
                                            </>
                                        )}
                                        <div className="border-t border-gray-700 my-2"></div>
                                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-900/30 text-left"><ArrowRightOnRectangleIcon className="h-5 w-5" /> Cerrar Sesión</button>
                                    </div>
                                </div>
                            )}
                         </div>
                    </div>
                </div>
            </nav>

            {/* CONTENEDOR PRINCIPAL */}
            <main className="relative z-10 w-full max-w-[95%] mx-auto py-8 pt-32 min-h-full">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start pb-20">
                    
                    {/* FEED PRINCIPAL */}
                    <div className="lg:col-span-9 space-y-8 w-full">
                        
                        {/* Tarjeta del Hilo */}
                        <div className="bg-[#15151e] border-2 border-purple-600 rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden w-full">
                            
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gray-600 border-2 border-white overflow-hidden">
                                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${autorHilo}`} alt="avatar" className="w-full h-full bg-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold text-lg leading-tight">Publicado por {autorHilo}</h3>
                                        {/* FECHA REAL AQUÍ */}
                                        <p className="text-gray-400 text-sm capitalize">{formatDate(hilo.fechaCreacion)}</p>
                                    </div>
                                </div>
                                <Link to={`/foro/${hilo.foro?.id}`} className="flex items-center gap-2 text-white font-bold text-sm bg-purple-900/40 px-4 py-2 rounded-full border border-purple-500/50 hover:bg-purple-800 transition-colors">
                                    {foroNombre} <GlobeAltIcon className="h-4 w-4" />
                                </Link>
                            </div>

                            {/* Contenido / Edición */}
                            {isEditing ? (
                                <div className="space-y-4 animate-fade-in">
                                    <input type="text" value={editTitulo} onChange={(e) => setEditTitulo(e.target.value)} className="w-full bg-[#0b0b14] border-2 border-purple-500 rounded-xl p-3 text-white font-bold text-2xl focus:outline-none" />
                                    <textarea value={editContenido} onChange={(e) => setEditContenido(e.target.value)} rows={6} className="w-full bg-[#0b0b14] border-2 border-purple-500 rounded-xl p-3 text-gray-300 text-lg focus:outline-none resize-none" />
                                    <div className="flex gap-3 justify-end">
                                        <button onClick={() => setIsEditing(false)} className="px-4 py-2 bg-gray-700 rounded-lg font-bold hover:bg-gray-600 transition-colors">Cancelar</button>
                                        <button onClick={handleSaveEdit} disabled={saving} className="px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-500 transition-colors flex items-center gap-2">
                                            {saving ? '...' : <><CheckIcon className="h-5 w-5" /> Guardar</>}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <h1 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight">{hilo.titulo}</h1>
                                    <div className="text-gray-300 text-lg leading-relaxed whitespace-pre-wrap mb-8">{hilo.contenido}</div>
                                </>
                            )}

                            {/* Botones Acción */}
                            {(isAdmin || isOwner) && !isEditing && (
                                <div className="flex gap-4 pt-4 border-t border-gray-700">
                                    {isOwner && (
                                        <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 text-blue-400 border border-blue-600/50 rounded-xl hover:bg-blue-600/40 transition-colors text-sm font-bold">
                                            <PencilIcon className="h-4 w-4" /> Editar
                                        </button>
                                    )}
                                    <button onClick={handleDeleteHilo} className="flex items-center gap-2 px-4 py-2 bg-red-600/20 text-red-400 border border-red-600/50 rounded-xl hover:bg-red-600/40 transition-colors text-sm font-bold">
                                        <TrashIcon className="h-4 w-4" /> Eliminar
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Comentarios */}
                        <div className="bg-[#15151e]/50 backdrop-blur-sm border border-white/10 rounded-[2rem] p-6 md:p-8 w-full">
                            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                                <ChatBubbleLeftRightIcon className="h-7 w-7 text-purple-400" />
                                Comentarios <span className="text-gray-500 text-lg">({comentariosTotalCount})</span>
                            </h3>

                            {user ? (
                                <form onSubmit={handleCommentSubmit} className="mb-10 relative">
                                    <textarea value={nuevoComentario} onChange={(e) => setNuevoComentario(e.target.value)} placeholder={`Comentar como ${currentUserName}...`} className="w-full bg-[#0b0b14] border-2 border-gray-700 rounded-2xl p-4 text-white focus:outline-none focus:border-purple-500 transition-all resize-none h-32" required />
                                    <div className="absolute bottom-4 right-4">
                                        <button type="submit" className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-6 rounded-xl shadow-lg transition-transform active:scale-95"><PaperAirplaneIcon className="h-5 w-5" /> Comentar</button>
                                    </div>
                                </form>
                            ) : (
                                <div className="bg-gray-800/50 p-4 rounded-xl text-center mb-8"><p className="text-gray-400">Inicia sesión para comentar.</p></div>
                            )}

                            <div className="space-y-4">
                                {comentarios.length > 0 ? comentarios.map(c => (
                                    <div key={c.id} className="bg-[#1a1a24] p-5 rounded-2xl border border-gray-800">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden"><img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${c.usuario?.nombreUsuario || 'anon'}`} alt="usr" className="w-full h-full bg-white" /></div>
                                            <span className="text-purple-300 font-bold text-sm">{c.usuario?.nombreUsuario || 'Usuario'}</span>
                                        </div>
                                        <p className="text-gray-300 pl-11 text-base">{c.contenido}</p>
                                    </div>
                                )) : <div className="text-center py-10 text-gray-500 italic">No hay comentarios aún.</div>}
                            </div>
                            
                            {comentariosTotalPages > 1 && (
                                <div className="flex justify-center mt-8 gap-4">
                                    <button onClick={() => setComentariosPage(p => Math.max(1, p - 1))} disabled={comentariosPage === 1} className="p-2 rounded-full bg-gray-800 hover:bg-purple-600 disabled:opacity-30 disabled:hover:bg-gray-800 transition-colors"><ChevronLeftIcon className="h-6 w-6 text-white" /></button>
                                    <span className="flex items-center text-gray-400 font-bold">{comentariosPage} / {comentariosTotalPages}</span>
                                    <button onClick={() => setComentariosPage(p => Math.min(comentariosTotalPages, p + 1))} disabled={comentariosPage === comentariosTotalPages} className="p-2 rounded-full bg-gray-800 hover:bg-purple-600 disabled:opacity-30 disabled:hover:bg-gray-800 transition-colors"><ChevronRightIcon className="h-6 w-6 text-white" /></button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* SIDEBAR */}
                    <div className="lg:col-span-3 hidden lg:block sticky top-32">
                        <div className="bg-[#15151e] border-2 border-white rounded-[2.5rem] p-8 shadow-xl">
                            <h4 className="font-bold text-white text-center mb-6 text-xl">Reglas</h4>
                            <ul className="space-y-4 text-sm text-gray-300 font-medium text-left">
                                <li><span className="text-purple-500 font-bold mr-1">1.</span> Respeta a los demás.</li>
                                <li><span className="text-purple-500 font-bold mr-1">2.</span> No hagas spam.</li>
                                <li><span className="text-purple-500 font-bold mr-1">3.</span> Protege tu privacidad.</li>
                                <li><span className="text-purple-500 font-bold mr-1">4.</span> Mantente en el tema.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default HiloDetailPage;