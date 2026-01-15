# 🗺️ MAPEO VISUAL - Flujos de Datos del Frontend

## DIAGRAMA 1: Árbol de Componentes

```
App.js (Router Principal)
│
├─ AuthProvider (Contexto Global)
│  ├─ token
│  ├─ user
│  ├─ menuItems
│  └─ login/logout
│
├─ NotificationProvider (Contexto Global)
│  ├─ toasts[]
│  └─ showToast()
│
├─ Navbar (Siempre visible)
│  ├─ SearchBar (searchTerm prop)
│  ├─ Links de navegación
│  └─ NotificationCenter (Dropdown)
│     ├─ Badge (count)
│     ├─ NotificationItem x5
│     │  ├─ Mensaje
│     │  ├─ Hora relativa
│     │  └─ Botón delete (✕)
│     ├─ "Cargar más"
│     └─ "Ver todas →"
│
├─ Routes (Cambiar según URL)
│  ├─ ProtectedRoute (valida token)
│  │  ├─ HomePage
│  │  │  ├─ Sidebar (menuItems)
│  │  │  └─ PostCard x N
│  │  │     ├─ Título
│  │  │     ├─ Metadata
│  │  │     └─ [Ver detalle] [Eliminar]
│  │  ├─ HiloDetailPage
│  │  │  ├─ Contenido hilo
│  │  │  ├─ Comentarios x N
│  │  │  ├─ Votaciones
│  │  │  └─ [Comentar] [Editar] [Eliminar]
│  │  ├─ AdminPage
│  │  │  ├─ Tabla usuarios
│  │  │  │  ├─ ID
│  │  │  │  ├─ Nombre
│  │  │  │  ├─ Email
│  │  │  │  ├─ Rol (dropdown)
│  │  │  │  └─ [Eliminar]
│  │  │  └─ Paginación
│  │  ├─ CreateHiloPage
│  │  ├─ CreateForoPage
│  │  ├─ PerfilPage
│  │  ├─ MiActividadPage
│  │  └─ NotificationsPage
│  │     ├─ NotificationItem x M
│  │     └─ Paginación
│  ├─ LoginPage (publica)
│  ├─ RegisterPage (publica)
│  └─ NotFoundPage (fallback)
│
└─ Toast (Siempre renderizado)
   └─ Toast x N (temporal)
```

---

## DIAGRAMA 2: Flujo de Autenticación

```
┌─────────────────────────────────────────┐
│ Usuario ingresa email/password          │
│ Presiona [Login]                        │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│ LoginPage.handleLogin()                 │
│  └─ [POST /api/auth/login]              │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│ Servidor devuelve:                      │
│ {                                       │
│   "token": "eyJhbGc...",                │
│   "usuario": {...}                      │
│ }                                       │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│ AuthContext.login(token)                │
│  ├─ localStorage.setItem('token', ...) │
│  ├─ jwtDecode(token)                   │
│  ├─ setUser({ id, name, role })       │
│  ├─ [GET /api/menuitems]               │
│  └─ setMenuItems(response)             │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│ navigate('/')                           │
│  ├─ ProtectedRoute valida token        │
│  ├─ Renderiza HomePage                 │
│  └─ Sidebar carga menuItems            │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Al cerrar sesión:                       │
│ logout()                                │
│  ├─ localStorage.removeItem('token')    │
│  ├─ setToken(null)                      │
│  ├─ setUser(null)                       │
│  ├─ setMenuItems([])                    │
│  └─ navigate('/login')                  │
└─────────────────────────────────────────┘
```

---

## DIAGRAMA 3: Flujo de Notificaciones (DELETE OPTIMISTA)

```
┌──────────────────────────────────────────────────────┐
│ Usuario ve: 🔔 3                                     │
│ (3 notificaciones en el dropdown)                    │
└────────────┬─────────────────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────────────────┐
│ Usuario clic en botón ✕ (delete)                     │
│ handleDeleteNotificacion(notificationId)             │
└────────────┬─────────────────────────────────────────┘
             │
             ▼ PASO 1: ACTUALIZACIÓN OPTIMISTA
┌──────────────────────────────────────────────────────┐
│ setNotificaciones(                                   │
│   notificaciones.filter(n => n.id !== id)            │
│ )                                                    │
│                                                      │
│ setUnreadCount(unreadCount - 1)                      │
│                                                      │
│ UI INMEDIATA:                                        │
│  ├─ 🔔 2  (badge actualizado)                        │
│  └─ Notificación desaparece del dropdown             │
└────────────┬─────────────────────────────────────────┘
             │
             ▼ PASO 2: ENVIAR AL SERVIDOR (BACKGROUND)
┌──────────────────────────────────────────────────────┐
│ await deleteNotificacion(notificationId)             │
│ [DELETE /api/notificaciones/{id}]                    │
│                                                      │
│ Backend:                                             │
│  ├─ Delete from DB                                  │
│  ├─ INVALIDATE unread_count_{userId}                │
│  ├─ INVALIDATE notificaciones_{userId}_page_1_size_5│
│  └─ Return 204 No Content                           │
└────────────┬─────────────────────────────────────────┘
             │
             ├─ ✅ ÉXITO
             │  └─ showToast('Notificación eliminada', 'success')
             │
             └─ ❌ FALLO
                └─ PASO 3: ROLLBACK
                   ├─ setNotificaciones(previousNotificaciones)
                   ├─ setUnreadCount(previousCount)
                   ├─ loadUnreadCount() (recargar desde servidor)
                   ├─ loadNotificaciones(currentPage)
                   └─ showToast('Error al eliminar...', 'error')

┌──────────────────────────────────────────────────────┐
│ RESULTADO FINAL:                                     │
│ - Usuario ve cambio INSTANTÁNEAMENTE (0ms)          │
│ - Servidor confirma en background                   │
│ - Si falla, UI revierte automáticamente             │
│ - Mejor UX: no esperar red latency                  │
└──────────────────────────────────────────────────────┘
```

---

## DIAGRAMA 4: Flujo de Cambio de Rol (Admin)

```
┌──────────────────────────────────────────────────────┐
│ AdminPage: Admin selecciona nuevo rol en dropdown    │
│ handleRoleChange(userId, newRoleId)                  │
└────────────┬─────────────────────────────────────────┘
             │
             ▼ PASO 1: VALIDACIÓN DE IDENTIDAD
┌──────────────────────────────────────────────────────┐
│ const currentUserId = Number(user.id || user.nameid) │
│ const targetUserId = Number(userId)                  │
│ const isSelfRoleChange = Boolean(                    │
│   currentUserId !== null &&                          │
│   !isNaN(currentUserId) &&                           │
│   !isNaN(targetUserId) &&                            │
│   currentUserId === targetUserId                     │
│ )                                                    │
│                                                      │
│ ✅ Blindaje contra coerción de tipos                │
└────────────┬─────────────────────────────────────────┘
             │
             ▼ PASO 2: LLAMADA AL SERVIDOR
┌──────────────────────────────────────────────────────┐
│ [PUT /api/admin/users/{id}/role]                     │
│ {                                                    │
│   "NewRoleId": 2                                     │
│ }                                                    │
│                                                      │
│ Backend:                                             │
│  ├─ user.RolId = newRoleId                          │
│  ├─ INSERT Notificacion (table)                      │
│  │  └─ Mensaje: "Tu rol ha sido..."                 │
│  ├─ SaveChangesAsync()                              │
│  ├─ INVALIDATE unread_count_{id}                    │
│  ├─ INVALIDATE notificaciones_{id}_page_1_size_5    │
│  └─ INVALIDATE notificaciones_{id}_page_1_size_10   │
└────────────┬─────────────────────────────────────────┘
             │
             ▼ PASO 3: UI OPTIMISTA
┌──────────────────────────────────────────────────────┐
│ setUsers(users.map(                                  │
│   u => u.id === userId                              │
│     ? { ...u, rolId: newRoleId }                     │
│     : u                                              │
│ ))                                                   │
│                                                      │
│ TABLA actualiza inmediatamente                       │
└────────────┬─────────────────────────────────────────┘
             │
             ▼ PASO 4: LÓGICA CONDICIONAL
┌──────────────────────────────────────────────────────┐
│ if (isSelfRoleChange) {                              │
│   showToast(                                         │
│     'Has cambiado tu propio rol. Cerrando sesión...' │
│   )                                                  │
│   setTimeout(() => {                                │
│     logout()   # Limpiar token, user, menuItems      │
│     navigate('/login')                               │
│   }, 3000)                                           │
│                                                      │
│ } else {                                             │
│   showToast('Rol actualizado y notificación enviada')│
│   fetchUsers(currentPage)  # Refrescar tabla         │
│ }                                                    │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│ FLUJO PARALELO:                                      │
│                                                      │
│ NotificationCenter (polling cada X ms):              │
│  [GET /api/notificaciones/count/total]               │
│  ├─ Cache MISS (fue invalidada)                      │
│  ├─ Cuenta TODAS las notificaciones                  │
│  ├─ Badge actualiza: 🔔 1 (nueva notificación)       │
│  └─ Usuario ve notificación en dropdown              │
└──────────────────────────────────────────────────────┘
```

---

## DIAGRAMA 5: Estados (State Management)

```
GLOBAL STATE (Contextos)
├─ AuthContext
│  ├─ token: "eyJhbGc..." (localStorage)
│  ├─ user: {
│  │  ├─ id: 5
│  │  ├─ name: "juan"
│  │  └─ role: "Admin"
│  │ }
│  ├─ menuItems: [
│  │  ├─ { id: 1, titulo: "General", ... }
│  │  └─ { id: 2, titulo: "Soporte", ... }
│  │ ]
│  ├─ loading: false
│  ├─ login(token)
│  └─ logout()
│
└─ NotificationContext
   ├─ toasts: [
   │  ├─ { id: 1684956200, message: "Guardado", type: "success" }
   │  └─ { id: 1684956210, message: "Error", type: "error" }
   │ ]
   └─ showToast(message, type, duration)

────────────────────────────────────────────────

LOCAL STATE (useState en componentes)

HomePage:
├─ notificaciones: []
├─ unreadCount: 3
├─ isOpen: false
└─ currentPage: 1

AdminPage:
├─ users: [{...}, {...}]
├─ currentPage: 1
├─ totalPages: 3
└─ totalCount: 47

HiloDetailPage:
├─ hilo: {
│  ├─ id: 123
│  ├─ titulo: "..."
│  ├─ contenido: "..."
│  ├─ comentarios: [{...}, {...}]
│  └─ votos: {
│     ├─ positivos: 5
│     └─ negativos: 1
│    }
│ }
└─ currentPage: 1

────────────────────────────────────────────────

OPTIMISTIC STATE
├─ NotificationCenter delete:
│  ├─ previousNotificaciones: (guardado)
│  ├─ previousCount: (guardado)
│  ├─ UI actualizada: (inmediata)
│  └─ Rollback disponible: (si falla)
│
└─ AdminPage role change:
   ├─ Previous user role: (guardado)
   ├─ UI actualizada: (tabla)
   └─ Rollback automático: (si error API)
```

---

## DIAGRAMA 6: Protección de Rutas

```
┌──────────────────────────────────────┐
│ Usuario accede a URL /hilo/123       │
└────────────┬────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│ App.js renderiza:                    │
│ <Route element={<ProtectedRoute>}>   │
│   <Route path="/hilo/:id" ...>       │
│ </Route>                             │
└────────────┬────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│ ProtectedRoute.jsx:                  │
│ ├─ Lee useAuth()                     │
│ ├─ if (!token) navigate('/login')    │
│ ├─ if (requiredPermission)           │
│ │  └─ Valida menuItems               │
│ └─ else: <Outlet> (renderiza child)  │
└──────────────────────────────────────┘
             │
             ├─ ✅ AUTORIZADO
             │  └─ HiloDetailPage renderiza
             │
             └─ ❌ NO AUTORIZADO
                └─ navigate('/login')
```

---

## DIAGRAMA 7: API Layer (Services)

```
src/services/apiService.js

┌─ INSTANCIA AXIOS
│  ├─ baseURL: "http://localhost:5000/api"
│  ├─ Interceptor: Authorization header (token)
│  └─ Error handling: try-catch
│
├─ AUTH
│  ├─ login(email, password) → POST /auth/login
│  └─ register(data) → POST /auth/register
│
├─ NOTIFICACIONES
│  ├─ getNotificaciones(page, size) → GET /notificaciones
│  ├─ getUnreadNotificationCount() → GET /notificaciones/count/total
│  └─ deleteNotificacion(id) → DELETE /notificaciones/{id}
│
├─ USUARIOS
│  ├─ getUsers(page, size) → GET /admin/users
│  ├─ changeUserRole(id, roleId) → PUT /admin/users/{id}/role
│  ├─ deleteUser(id) → DELETE /admin/users/{id}
│  └─ getMenuItemsForUser() → GET /admin/menuitems
│
├─ FOROS
│  ├─ getForos() → GET /foros
│  ├─ createForo(data) → POST /foros
│  └─ getForoById(id) → GET /foros/{id}
│
├─ HILOS
│  ├─ getHilos() → GET /hilos
│  ├─ getHiloById(id) → GET /hilos/{id}
│  ├─ createHilo(data) → POST /hilos
│  ├─ updateHilo(id, data) → PUT /hilos/{id}
│  ├─ deleteHilo(id) → DELETE /hilos/{id}
│  └─ addCommentToHilo(hiloId, data) → POST /hilos/{id}/comentarios
│
├─ PERFIL
│  ├─ getUserProfile() → GET /usuarios/perfil
│  ├─ updateUserProfile(data) → PUT /usuarios/perfil
│  └─ getUserActivity(page) → GET /usuarios/actividad
│
└─ VOTACIONES
   ├─ voteHilo(hiloId, voto) → POST /votos
   └─ voteComentario(comentarioId, voto) → POST /votos
```

---

## TABLA: Responsabilidades por Capa

| Capa | Responsabilidad | Ejemplo |
|------|-----------------|---------|
| **UI (Components)** | Renderizar, capturar eventos, UX | PostCard: mostrar hilo + botones |
| **Estado Local** | Manejar estado temporal | currentPage, isOpen, formData |
| **Contextos** | Estado global compartido | token, user, toasts |
| **Servicios (API)** | Comunicación con servidor | apiService.deleteNotificacion() |
| **Backend** | Lógica de negocio, BD, caché | NotificacionesController.Delete() |

---

**Versión:** 1.0  
**Fecha:** 14 de Enero de 2026  
**Actualizado:** Fase 10 Completa
