# 📐 Arquitectura del Frontend - Resumen Técnico

**Proyecto:** Foro-Frontend (React)  
**Fecha:** Enero 2026  
**Versión:** v1.0  
**Estado:** Fase 10 - Sistema de notificaciones simplificado

---

## 1. ENRUTAMIENTO (App.js)

### Estructura de Rutas

```
App.js (Router Principal)
├── PÚBLICAS
│   ├── /login          → LoginPage
│   └── /register       → RegisterPage
├── PROTEGIDAS (sin permiso específico)
│   ├── /                → HomePage (con searchTerm)
│   ├── /foros           → ForosListPage
│   ├── /foro/:id        → HomePage (filtrada por foro)
│   ├── /hilo/:id        → HiloDetailPage
│   ├── /perfil          → PerfilPage
│   ├── /popular         → AdminPage (gestión de usuarios)
│   ├── /mi-actividad    → MiActividadPage
│   └── /notificaciones  → NotificationsPage
├── PROTEGIDAS (con permiso específico)
│   ├── /crear-hilo      → CreateHiloPage (requiredPermission: "/crear-hilo")
│   └── /crear-foro      → CreateForoPage (requiredPermission: "/crear-foro")
└── FALLBACK
    └── *               → NotFoundPage (404)
```

### Características de Enrutamiento

| Característica | Implementación |
|---|---|
| **Router** | React Router v6 (Routes, Route) |
| **Protección** | ProtectedRoute (Componente wrapper) |
| **Búsqueda** | searchTerm (estado en App.js) → Navbar → HomePage |
| **Navío** | Navbar en toda la aplicación |

---

## 2. CONTEXTOS GLOBALES

### 2.1 AuthContext

**Ubicación:** `src/context/AuthContext.jsx`

**Responsabilidades:**
- Gestionar autenticación del usuario
- Decodificar JWT y validar expiración
- Cargar menú personalizado (MenuItems)
- Persistir token en localStorage

**Estado Global:**

```javascript
{
  token: string | null,           // JWT token
  user: {
    id: number,                   // Usuario ID (desde JWT)
    name: string,                 // Nombre de usuario
    role: string                  // Rol (Admin, Usuario, etc)
  } | null,
  menuItems: MenuItem[],          // Menú dinámico basado en rol
  loading: boolean,               // Estado de carga inicial
  login: (newToken) => void,      // Función: guardar token
  logout: () => void              // Función: limpiar todo
}
```

**Flujo de Inicialización:**

1. **App monta** → AuthProvider ejecuta useEffect
2. **Lee localStorage** para token previo
3. **Decodifica JWT** y valida expiración
4. **Obtiene MenuItems** del API (`getMenuItemsForUser()`)
5. **Actualiza estado** (user, menuItems, loading)
6. **Proporciona al resto de la app** mediante useAuth()

**Métodos Exportados:**

```javascript
export const useAuth = () => useContext(AuthContext);
// Disponible en cualquier componente para acceder a token, user, menuItems
```

**Ejemplo de Uso:**

```javascript
const { user, logout, menuItems } = useAuth();
if (user.role === 'Admin') {
  // Mostrar opciones de admin
}
```

---

### 2.2 NotificationContext

**Ubicación:** `src/context/NotificationContext.jsx`

**Responsabilidades:**
- Sistema de toast notifications
- Mostrar mensajes temporales (info, success, error, warning)
- Gestionar auto-destrucción de toasts
- Renderizar Toast component

**Estado Global:**

```javascript
{
  toasts: {
    id: number,              // Identificador único
    message: string,         // Contenido del mensaje
    type: string             // Tipo: 'info' | 'success' | 'error' | 'warning'
  }[],
  showToast: (message, type, duration) => void  // Función para mostrar
}
```

**Parámetros de showToast:**

```javascript
showToast(
  message: string,                    // Texto del toast
  type: 'info'|'success'|'error'|'warning' = 'info',  // Tipo
  duration: number = 3000             // Duración en ms
)
```

**Flujo de Toasts:**

1. **Componente llama** `showToast('Mensaje', 'success')`
2. **Genera ID único** con timestamp
3. **Agrega a array** de toasts
4. **Toast.jsx renderiza** (visible al usuario)
5. **setTimeout ejecuta** → elimina del array después de duration
6. **Toast desaparece** automáticamente

**Ejemplo de Uso:**

```javascript
const { showToast } = useNotification();
await deleteNotificacion(id);
showToast('Notificación eliminada', 'success', 3000);
```

---

## 3. COMPONENTES PRINCIPALES

### 3.1 Componentes Reusables

| Componente | Responsabilidad | Estado | Entrada (Props) |
|---|---|---|---|
| **Navbar.jsx** | Barra de navegación | searchTerm | searchTerm, setSearchTerm |
| **NotificationCenter.jsx** | Dropdown de notificaciones | unreadCount, notificaciones | - |
| **NotificationItem.jsx** | Renderizar notificación individual | - | notificacion (obj) |
| **PostCard.jsx** | Tarjeta de hilo/post | - | post (obj), onDelete |
| **Sidebar.jsx** | Menú lateral con foros | - | menuItems |
| **Toast.jsx** | Mostrar notificaciones temporales | - | toasts (array) |
| **ProtectedRoute.jsx** | Proteger rutas por autenticación | - | requiredPermission (optional) |

**Detalles:**

#### Navbar.jsx
```javascript
- Busca hilos/foros (searchTerm prop)
- Contiene NotificationCenter
- Links a rutas principales
- Muestra usuario logueado
```

#### NotificationCenter.jsx
```javascript
- Dropdown con últimas 5 notificaciones
- Badge mostrando total
- Botón delete para cada notificación
- Actualización optimista en UI
- Link a /notificaciones (ver todas)
```

#### PostCard.jsx
```javascript
- Renderiza hilos en HomePage
- Muestra metadata (autor, fecha, foro)
- Botón para ver detalle
- Botón delete (si es propietario)
```

#### ProtectedRoute.jsx
```javascript
- Valida que usuario esté autenticado
- Verifica permisos específicos (opcional)
- Redirige a /login si no autorizado
```

---

### 3.2 Páginas (Pages)

| Página | Ruta | Autenticación | Función Principal |
|---|---|---|---|
| **LoginPage** | /login | ❌ Pública | Autenticar usuario, obtener JWT |
| **RegisterPage** | /register | ❌ Pública | Crear nueva cuenta |
| **HomePage** | / | ✅ Protegida | Listar hilos, buscar, filtrar por foro |
| **ForosListPage** | /foros | ✅ Protegida | Listar foros disponibles |
| **CreateForoPage** | /crear-foro | ✅ Permisos | Crear nuevo foro |
| **CreateHiloPage** | /crear-hilo | ✅ Permisos | Crear nuevo hilo en foro |
| **HiloDetailPage** | /hilo/:id | ✅ Protegida | Ver detalles, comentarios, votaciones |
| **AdminPage** | /popular | ✅ Protegida | Gestionar usuarios, cambiar roles |
| **PerfilPage** | /perfil | ✅ Protegida | Ver/editar perfil del usuario |
| **MiActividadPage** | /mi-actividad | ✅ Protegida | Ver historial de posts y comentarios |
| **NotificationsPage** | /notificaciones | ✅ Protegida | Ver todas las notificaciones |
| **NotFoundPage** | * | ❌ Pública | Página 404 |

---

## 4. FLUJOS DE DATOS

### 4.1 Flujo de Login

```
LoginPage
  ↓ (input email/password)
  ↓ [POST /api/auth/login]
  ↓ Recibe JWT
  ↓ AuthContext.login(token)
  ↓ Decodifica JWT
  ↓ Obtiene menuItems desde API
  ↓ Actualiza estado global
  ↓ Redirige a /
```

### 4.2 Flujo de Notificaciones

```
AdminController.ChangeUserRole()
  ↓ [CREATE Notificacion en BD]
  ↓ [INVALIDATE caché: unread_count_{userId}]
  ↓
NotificationCenter (polling cada X ms o WebSocket)
  ↓ [GET /api/notificaciones/count/total]
  ↓ Badge actualiza
  ↓ showToast('Rol actualizado...')
  ↓
Usuario ve notificación en dropdown
  ↓ Clic en ✕ (delete)
  ↓ [DELETE /api/notificaciones/{id}]
  ↓ Actualización Optimista en UI
  ↓ [INVALIDATE caché: unread_count_{userId}]
  ↓ Badge decrece inmediatamente
```

### 4.3 Flujo de Cambio de Rol (Admin)

```
AdminPage.handleRoleChange()
  ↓ [Blindaje: Number() para comparación]
  ↓ [PUT /api/admin/users/{id}/role]
  ↓ Actualización Optimista de UI (tabla)
  ↓ [Si es auto-cambio: logout() + navigate('/login')]
  ↓ [Si es otro usuario: showToast() + refetchUsers()]
```

---

## 5. PATRONES Y CONVENCIONES

### 5.1 Estado Local vs Global

| Tipo | Ubicación | Persistencia | Ejemplo |
|---|---|---|---|
| **Global** | Contexto | localStorage (token) | user, token, menuItems |
| **Local** | useState en componente | Memoria | currentPage, isOpen, formData |
| **Optimista** | Estado + API | Eventual consistency | delete + rollback |

### 5.2 Actualización Optimista

**Patrón usado en:**
- NotificationCenter: delete notificación
- AdminPage: cambio de rol
- HiloDetailPage: votaciones

**Estructura:**

```javascript
const handleDelete = async (id) => {
  // Paso 1: Actualizar UI inmediatamente
  setItems(items.filter(i => i.id !== id));
  
  try {
    // Paso 2: Enviar al servidor (background)
    await deleteAPI(id);
    showToast('Eliminado', 'success');
  } catch (error) {
    // Paso 3: Rollback si falla
    setItems(previousItems);
    showToast('Error. Reintentando...', 'error');
  }
};
```

### 5.3 Manejo de Errores

| Nivel | Implementación |
|---|---|
| **HTTP** | try-catch en apiService |
| **Auth** | ProtectedRoute redirige a /login |
| **Notificaciones** | showToast con tipo 'error' |
| **Página** | NotFoundPage para rutas inválidas |

---

## 6. SERVICIOS (API Layer)

**Ubicación:** `src/services/apiService.js`

**Funciones Principales:**

```javascript
// Auth
export const login(email, password)
export const register(email, password, nombreUsuario)

// Notificaciones
export const getNotificaciones(pageNumber, pageSize, soloNoLeidas)
export const getUnreadNotificationCount()
export const deleteNotificacion(id)

// Usuarios
export const getUsers(pageNumber, pageSize)
export const changeUserRole(userId, newRoleId)
export const getMenuItemsForUser()

// Foros & Hilos
export const getForos()
export const createForo(foroData)
export const createHilo(hiloData)
export const getHiloById(id)
export const addCommentToHilo(hiloId, contenido)

// Otros
export const getUserProfile()
export const updateUserProfile(userData)
export const getUserActivity(pageNumber, pageSize)
```

---

## 7. DEPENDENCIAS CRÍTICAS

```json
{
  "react": "^18.x",
  "react-router-dom": "^6.x",
  "axios": "^1.x",
  "jwt-decode": "^4.x"
}
```

---

## 8. DIAGRAMA DE COMPONENTES

```
App.js (Router)
│
├── Navbar
│   ├── SearchBar
│   └── NotificationCenter
│       ├── Dropdown
│       └── NotificationItem (x5)
│
├── Routes
│   ├── HomePage
│   │   └── PostCard (x N)
│   ├── LoginPage
│   ├── AdminPage
│   │   └── tabla de usuarios
│   ├── HiloDetailPage
│   │   ├── comentarios
│   │   └── votaciones
│   ├── CreateHiloPage
│   ├── PerfilPage
│   └── NotificationsPage
│       └── NotificationItem (x M)
│
└── Toast (global)
    └── Toast messages (temporal)
```

---

## 9. CHECKLIST DE FASE 10

✅ Sistema de notificaciones simplificado (existe/eliminada)  
✅ Badge muestra total de notificaciones  
✅ Actualización optimista en delete  
✅ Auto-logout blindado con Number()  
✅ Caché agresiva en backend (2-3 claves exactas)  
✅ NotificationCenter con rollback on error  
✅ AdminPage notifica cambios de rol  
✅ Frontend compilación: OK  
✅ Backend compilación: OK  

---

## 10. PRÓXIMOS PASOS

1. **Testing:** Integración frontend-backend (dev environment)
2. **WebSockets:** Reemplazar polling en NotificationCenter
3. **Caché Local:** IndexedDB para notificaciones offline
4. **Validación:** Ajustar permisos según roles finales

---

**Documento generado:** 14 de Enero de 2026  
**Arquitecto:** Full-Stack  
**Versión:** 1.0
