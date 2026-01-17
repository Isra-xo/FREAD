import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { getUsuarioById, updateUsuario, uploadProfilePicture, getHilosByUserId, getForosByUserId } from '../services/apiService';
import { extractItems, getTotalPages, getTotalCount } from '../services/apiHelpers'; 
import { 
    UserCircleIcon, EnvelopeIcon, ShieldCheckIcon, CameraIcon, KeyIcon, ArrowRightOnRectangleIcon, 
    ChatBubbleLeftRightIcon, UserGroupIcon, ChevronLeftIcon, ChevronRightIcon,
    MagnifyingGlassIcon, BellIcon, GlobeAltIcon, BookmarkIcon, Cog6ToothIcon, PlusIcon,
    StarIcon
} from '@heroicons/react/24/solid';

const PerfilPage = () => {
    // --- ESTADOS Y HOOKS ---
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useNotification();

    const [userData, setUserData] = useState(null);
    
    // HILOS
    const [hilos, setHilos] = useState([]);
    const [hilosPage, setHilosPage] = useState(1);
    const [hilosTotalPages, setHilosTotalPages] = useState(1);
    const [hilosTotalCount, setHilosTotalCount] = useState(0);

    // FOROS
    const [foros, setForos] = useState([]);
    const [forosPage, setForosPage] = useState(1);
    const [forosTotalPages, setForosTotalPages] = useState(1);
    const [forosTotalCount, setForosTotalCount] = useState(0); 
    
    // UI States
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form States
    const [newNombreUsuario, setNewNombreUsuario] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [profilePictureFile, setProfilePictureFile] = useState(null);
    const [profilePicturePreview, setProfilePicturePreview] = useState(null);

    // Navbar States
    const [searchTerm, setSearchTerm] = useState('');
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef(null);

    // Identificación robusta
    const currentUserName = user ? (user.nombreUsuario || user.unique_name || user.name || 'Usuario') : '';
    const userEmailDisplay = user?.email || `${currentUserName.toLowerCase().replace(/\s+/g, '')}@fread.com`;
    const isAdmin = user?.role === 'Administrador';
    const roleLabel = isAdmin ? 'Administrador' : 'Usuario';

    // --- CARGA DE DATOS ---
    useEffect(() => {
        const fetchUserData = async () => {
            if (user && user.id) {
                setLoading(true);
                try {
                    const [userRes, hilosRes, forosRes] = await Promise.all([
                        getUsuarioById(user.id),
                        getHilosByUserId(user.id, hilosPage, 10),
                        getForosByUserId(user.id, forosPage, 10)
                    ]);
                    
                    const uData = userRes.data || userRes;
                    setUserData(uData);
                    setNewNombreUsuario(uData.nombreUsuario);
                    setNewEmail(uData.email);

                    // Procesar Hilos
                    setHilos(extractItems(hilosRes));
                    setHilosTotalPages(getTotalPages(hilosRes));
                    setHilosTotalCount(getTotalCount(hilosRes)); 

                    // Procesar Foros (CORRECCIÓN DE CONTADOR)
                    const itemsForos = extractItems(forosRes);
                    setForos(itemsForos);
                    setForosTotalPages(getTotalPages(forosRes));
                    
                    // Lógica blindada: Si getTotalCount devuelve 0 o undefined, usamos el largo del array
                    const countFromApi = getTotalCount(forosRes);
                    setForosTotalCount(countFromApi > 0 ? countFromApi : (itemsForos?.length || 0));

                } catch (err) {
                    console.error(err);
                    showToast("Error al cargar perfil.", "error");
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchUserData();
    }, [user, hilosPage, forosPage, showToast]);

    // Cerrar menú navbar
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
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setProfilePictureFile(file);
        if (file) {
            setProfilePicturePreview(URL.createObjectURL(file));
        } else {
            setProfilePicturePreview(null);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const updates = {};
        
        if (newNombreUsuario !== userData.nombreUsuario) updates.nombreUsuario = newNombreUsuario;
        if (newEmail !== userData.email) updates.email = newEmail;
        
        if (newPassword) {
            if (newPassword !== confirmNewPassword) {
                showToast("Las contraseñas no coinciden.", "error");
                setIsSubmitting(false);
                return;
            }
            if (!oldPassword) {
                showToast("Ingresa tu contraseña actual.", "info");
                setIsSubmitting(false);
                return;
            }
            updates.oldPassword = oldPassword;
            updates.newPassword = newPassword;
        }

        try {
            if (Object.keys(updates).length > 0) {
                await updateUsuario(user.id, updates);
            }
            if (profilePictureFile) {
                const formData = new FormData();
                formData.append('file', profilePictureFile);
                await uploadProfilePicture(user.id, formData);
            }

            showToast("Perfil actualizado correctamente.", "success");
            setIsEditing(false);
            window.location.reload(); 
        } catch (err) {
            console.error(err);
            showToast(err.response?.data?.message || "Error al actualizar.", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLogout = () => { logout(); navigate('/login'); };

    // --- ESTILOS DINÁMICOS ---
    const avatarBorderClass = isAdmin 
        ? "border-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.6)]" 
        : "border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.6)]";
    
    const roleBadgeClass = isAdmin
        ? "bg-yellow-900/50 text-yellow-300 border-yellow-500/50"
        : "bg-blue-900/50 text-blue-300 border-blue-500/50";

    const avatarSrc = profilePicturePreview || (userData?.profilePictureUrl ? `http://localhost:5153${userData.profilePictureUrl}` : `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData?.nombreUsuario}`);

    // --- RENDERIZADO ---
    if (loading || !userData) return <div className="fixed inset-0 z-50 bg-[#050505] flex items-center justify-center"><div className="text-red-500 font-bold text-xl animate-pulse">Cargando perfil...</div></div>;

    return (
        <div className="fixed inset-0 z-50 w-screen h-screen bg-[#050505] text-white font-sans overflow-y-auto overflow-x-hidden">
            
            {/* FONDO LAVA */}
            <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[50rem] h-[50rem] bg-red-900/20 rounded-full filter blur-[150px] opacity-40 animate-blob"></div>
                <div className="absolute top-[20%] right-[-10%] w-[40rem] h-[40rem] bg-orange-900/20 rounded-full filter blur-[150px] opacity-30 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-[-10%] left-[20%] w-[50rem] h-[50rem] bg-rose-900/20 rounded-full filter blur-[150px] opacity-40 animate-blob animation-delay-4000"></div>
            </div>

            {/* --- NAVBAR INLINE (CORRECCIÓN BUG DE FOCO) --- */}
            <nav className="fixed top-0 left-0 w-full z-[60] bg-[#0b0b14]/90 backdrop-blur-md border-b border-white/10 py-3 px-4 md:px-8 shadow-md">
                <div className="w-full max-w-[95%] mx-auto flex items-center justify-between gap-4">
                    <Link to="/" className="text-3xl font-black tracking-wider text-white hover:opacity-80 transition-opacity">FREAD</Link>
                    
                    <div className="flex-1 max-w-3xl hidden md:block px-6">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <MagnifyingGlassIcon className="h-5 w-5 text-red-400" />
                            </div>
                            <input 
                                type="text" 
                                className="block w-full pl-11 pr-4 py-3 bg-[#1e1e24] border border-gray-500 rounded-full text-white text-sm focus:border-red-500 focus:outline-none transition-all" 
                                placeholder="Buscar en FREAD..." 
                                value={searchTerm} 
                                onChange={(e) => setSearchTerm(e.target.value)} 
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                         <Link to="/notificaciones" className="text-white hover:text-red-400"><BellIcon className="h-8 w-8" /></Link>
                         <Link to="/foros" className="text-white hover:text-red-400"><GlobeAltIcon className="h-8 w-8" /></Link>
                         <Link to="/crear-hilo" className="text-white hover:text-red-400 border-2 border-white rounded-lg p-1"><PlusIcon className="h-6 w-6" /></Link>
                         
                         <div className="relative" ref={profileRef}>
                            <div onClick={() => setIsProfileOpen(!isProfileOpen)} className="ml-2 w-10 h-10 rounded-full bg-gray-700 overflow-hidden border-2 border-white cursor-pointer hover:border-red-500 transition-colors">
                                 <img 
                                    src={avatarSrc} 
                                    onError={(e) => { e.target.onerror = null; e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.nombreUsuario}`; }}
                                    alt="avatar" 
                                    className="w-full h-full bg-white object-cover" 
                                />
                            </div>
                            {isProfileOpen && (
                                <div className="absolute right-0 mt-3 w-72 bg-[#15151e] border-2 border-red-500 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fade-in-down">
                                    <div className="px-4 py-4 border-b border-gray-700 bg-red-900/10">
                                        <p className="text-base text-white font-bold">{currentUserName}</p>
                                        <p className="text-xs text-gray-400 truncate">{userEmailDisplay}</p>
                                    </div>
                                    <div className="py-2">
                                        <Link to="/perfil" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-red-900/30 hover:text-white transition-colors"><UserCircleIcon className="h-5 w-5" /> Mi Perfil</Link>
                                        <Link to="/mi-actividad" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-red-900/30 hover:text-white transition-colors"><BookmarkIcon className="h-5 w-5" /> Mi Actividad</Link>
                                        {isAdmin && (
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

            <main className="relative z-10 w-full max-w-5xl mx-auto py-8 pt-32 px-4 mb-20">
                
                {/* --- HEADER --- */}
                <div className="flex flex-col md:flex-row items-center gap-8 mb-12 animate-fade-in-down bg-[#15151e]/50 p-8 rounded-[3rem] border border-white/10 backdrop-blur-sm">
                    <div className="relative group">
                        <div className={`w-32 h-32 md:w-40 md:h-40 rounded-full p-1 border-4 ${avatarBorderClass} transition-all duration-500`}>
                            <img 
                                src={avatarSrc} 
                                onError={(e) => { e.target.onerror = null; e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.nombreUsuario}`; }}
                                alt="Profile" 
                                className="w-full h-full rounded-full bg-white object-cover" 
                            />
                        </div>
                        {isEditing && (
                            <label htmlFor="file-upload" className="absolute bottom-2 right-2 bg-white p-2 rounded-full cursor-pointer hover:bg-gray-200 transition-colors shadow-lg text-black">
                                <CameraIcon className="h-6 w-6" />
                                <input id="file-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                            </label>
                        )}
                    </div>
                    
                    <div className="text-center md:text-left flex-1">
                        <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                            <h1 className="text-4xl md:text-5xl font-black text-white">{userData.nombreUsuario}</h1>
                            {isAdmin && <StarIcon className="h-8 w-8 text-yellow-400 animate-pulse" title="Administrador" />}
                        </div>
                        
                        <p className="text-gray-400 text-lg mb-6 flex items-center justify-center md:justify-start gap-2">
                            <EnvelopeIcon className="h-5 w-5 text-red-500" /> {userData.email}
                        </p>
                        
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                            <span className={`px-4 py-1.5 rounded-full text-sm font-bold border flex items-center gap-2 ${roleBadgeClass}`}>
                                <ShieldCheckIcon className="h-4 w-4" /> {roleLabel}
                            </span>
                            <button 
                                onClick={() => setIsEditing(!isEditing)}
                                className={`px-6 py-2 rounded-full font-bold transition-all border-2 ${isEditing ? 'bg-white text-black border-white hover:bg-gray-200' : 'bg-transparent text-white border-white hover:bg-white hover:text-black'}`}
                            >
                                {isEditing ? 'Cancelar' : 'Editar Perfil'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* --- FORMULARIO EDICIÓN --- */}
                {isEditing && (
                    <div className="mb-16 animate-fade-in">
                        <div className="bg-[#1a1a24] border-2 border-red-900/50 rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden">
                            <h2 className="text-2xl font-bold text-white mb-8 border-b border-gray-700 pb-4">Actualizar Información</h2>
                            
                            <form onSubmit={handleUpdateProfile}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-gray-400 text-sm font-bold mb-2 ml-1">Usuario</label>
                                            <div className="relative">
                                                <UserCircleIcon className="absolute left-4 top-3.5 h-6 w-6 text-gray-500" />
                                                <input type="text" value={newNombreUsuario} onChange={(e) => setNewNombreUsuario(e.target.value)} className="w-full bg-[#0b0b14] border-2 border-gray-700 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-red-500 transition-colors" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-gray-400 text-sm font-bold mb-2 ml-1">Correo</label>
                                            <div className="relative">
                                                <EnvelopeIcon className="absolute left-4 top-3.5 h-6 w-6 text-gray-500" />
                                                <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="w-full bg-[#0b0b14] border-2 border-gray-700 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-red-500 transition-colors" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-gray-400 text-sm font-bold mb-2 ml-1">Contraseña Actual</label>
                                            <div className="relative">
                                                <KeyIcon className="absolute left-4 top-3.5 h-6 w-6 text-gray-500" />
                                                <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} className="w-full bg-[#0b0b14] border-2 border-gray-700 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-red-500 transition-colors" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-gray-400 text-sm font-bold mb-2 ml-1">Nueva Contraseña</label>
                                            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full bg-[#0b0b14] border-2 border-gray-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-red-500 transition-colors" placeholder="Opcional" />
                                        </div>
                                        <div>
                                            <label className="block text-gray-400 text-sm font-bold mb-2 ml-1">Confirmar</label>
                                            <input type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} className="w-full bg-[#0b0b14] border-2 border-gray-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-red-500 transition-colors" placeholder="Opcional" />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4 border-t border-gray-700">
                                    <button type="submit" disabled={isSubmitting} className="bg-red-600 text-white px-8 py-3 rounded-full font-bold hover:bg-red-500 transition-colors disabled:opacity-50 shadow-lg shadow-red-900/50">
                                        {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* --- GRID DE ACTIVIDAD --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    {/* Tarjeta Hilos */}
                    <div className="bg-[#15151e]/80 border-2 border-white/10 rounded-[2rem] p-6 hover:border-purple-500/50 transition-colors backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <ChatBubbleLeftRightIcon className="h-6 w-6 text-purple-400" /> Mis Hilos
                            </h3>
                            <span className="bg-purple-900/30 text-purple-300 px-3 py-1 rounded-full font-bold text-sm border border-purple-500/30">{hilosTotalCount} total</span>
                        </div>
                        
                        <div className="space-y-3 mb-6 min-h-[150px]">
                            {hilos.length > 0 ? hilos.map(hilo => (
                                <Link key={hilo.id} to={`/hilo/${hilo.id}`} className="block bg-[#0b0b14] p-4 rounded-xl border border-gray-800 hover:border-purple-500 transition-all group">
                                    <h4 className="font-bold text-white group-hover:text-purple-400 truncate">{hilo.titulo}</h4>
                                    <p className="text-xs text-gray-500 mt-1">en f/{hilo.foro?.nombreForo}</p>
                                </Link>
                            )) : <p className="text-gray-500 text-center py-10">No has creado hilos aún.</p>}
                        </div>

                        {hilosTotalPages > 1 && (
                            <div className="flex justify-center gap-4 pt-4 border-t border-gray-800">
                                <button onClick={() => setHilosPage(p => Math.max(1, p - 1))} disabled={hilosPage === 1} className="p-2 rounded-full bg-gray-800 hover:bg-purple-600 disabled:opacity-50 transition-colors"><ChevronLeftIcon className="h-4 w-4" /></button>
                                <span className="text-sm font-bold text-gray-400 pt-1">{hilosPage} / {hilosTotalPages}</span>
                                <button onClick={() => setHilosPage(p => Math.min(hilosTotalPages, p + 1))} disabled={hilosPage === hilosTotalPages} className="p-2 rounded-full bg-gray-800 hover:bg-purple-600 disabled:opacity-50 transition-colors"><ChevronRightIcon className="h-4 w-4" /></button>
                            </div>
                        )}
                    </div>

                    {/* Tarjeta Foros */}
                    <div className="bg-[#15151e]/80 border-2 border-white/10 rounded-[2rem] p-6 hover:border-green-500/50 transition-colors backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <UserGroupIcon className="h-6 w-6 text-green-400" /> Foros Creados
                            </h3>
                            {/* CONTADOR ARREGLADO CON FALLBACK */}
                            <span className="bg-green-900/30 text-green-300 px-3 py-1 rounded-full font-bold text-sm border border-green-500/30">{forosTotalCount} total</span>
                        </div>
                        
                        <div className="space-y-3 mb-6 min-h-[150px]">
                            {foros.length > 0 ? foros.map(foro => (
                                <Link key={foro.id} to={`/foro/${foro.id}`} className="block bg-[#0b0b14] p-4 rounded-xl border border-gray-800 hover:border-green-500 transition-all group">
                                    <h4 className="font-bold text-white group-hover:text-green-400 truncate">f/{foro.nombreForo}</h4>
                                    <p className="text-xs text-gray-500 mt-1">Comunidad</p>
                                </Link>
                            )) : <p className="text-gray-500 text-center py-10">No has creado foros.</p>}
                        </div>

                        {forosTotalPages > 1 && (
                            <div className="flex justify-center gap-4 pt-4 border-t border-gray-800">
                                <button onClick={() => setForosPage(p => Math.max(1, p - 1))} disabled={forosPage === 1} className="p-2 rounded-full bg-gray-800 hover:bg-green-600 disabled:opacity-50 transition-colors"><ChevronLeftIcon className="h-4 w-4" /></button>
                                <span className="text-sm font-bold text-gray-400 pt-1">{forosPage} / {forosTotalPages}</span>
                                <button onClick={() => setForosPage(p => Math.min(forosTotalPages, p + 1))} disabled={forosPage === forosTotalPages} className="p-2 rounded-full bg-gray-800 hover:bg-green-600 disabled:opacity-50 transition-colors"><ChevronRightIcon className="h-4 w-4" /></button>
                            </div>
                        )}
                    </div>

                </div>
            </main>
        </div>
    );
};

export default PerfilPage;