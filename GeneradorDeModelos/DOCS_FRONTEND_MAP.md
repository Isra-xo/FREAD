# Frontend Map — React Application 

Resumen del flujo de datos, relaciones entre componentes, normalización de respuestas y puntos clave de estilo responsivo en la aplicación React.

---

## 1) Panorama general
- App inicializa `AuthContext` y `NotificationContext` (provee sesión y toasts globales).
- `React Router` enruta páginas principales: `HomePage`, `ForosListPage`, `HiloDetailPage`, `PerfilPage`, `CreateHiloPage`, etc.

---

## 2) Relaciones de componentes (HomePage) 
- **`HomePage.jsx`** (container/page)
  - Componentes hijos principales:
    - `PostCard` — representa cada hilo; maneja acciones: votar, compartir, guardar.
    - `Sidebar` — navegación y filtros (foros, categorías, búsqueda rápida).
    - `PaginationControls` (simple Prev/Next interno) — controla `pageNumber` y dispara recarga.
  - Comunicación:
    - `HomePage` llama a `apiService.getHilos()` (pasando `pageNumber`, `pageSize`, `searchTerm`).
    - Los datos recibidos se normalizan con `extractItems(response)` (ver sección 3) y se pasan a `PostCard` mediante `props`.
    - `PostCard` notifica eventos (ej. `onVote`, `onShare`) hacia `HomePage` o via `NotificationContext` para mostrar toasts.

---

## 3) Normalización de datos: `src/services/apiHelpers.js` 
- Problema: el backend devuelve `PagedResult<T>` que contiene metadata y `Items` (no siempre un arreglo en `response.data`).
- Solución: `extractItems(response)` centraliza la extracción segura de `Items` y metadatos (`totalCount`, `totalPages`).
  - Beneficios:
    - Evita `TypeError` al llamar `.map()` sobre objetos inesperados.
    - Permite que componentes usen siempre arrays (`items`) y accedan a metadatos cuando necesitan paginación.
- Recomendación: usar `extractItems` en todos los lugares donde se consumen listados (`HomePage`, `ForosListPage`, `PerfilPage`, `MiActividadPage`, etc.).

---

## 4) Responsividad: `HomePage.css` 
- Implementación clave:
  - Uso de media queries para colapsar layout en pantallas pequeñas (ej. `@media (max-width: 768px)`):
    - Sidebar se desplaza debajo del contenido principal.
    - Columnas se transforman en una sola columna para mejorar lectura y foco en `PostCard`.
  - Recomendación: probar con herramientas de Lighthouse / devtools y ajustar breakpoints según métricas reales.

---

## 5) Componentes y archivos importantes 
- Contexts:
  - `src/context/AuthContext.jsx` — gestión de token y usuario
  - `src/context/NotificationContext.jsx` — toasts globales
- Servicios:
  - `src/services/apiService.js` — llamadas HTTP centralizadas (aceptan `pageNumber`, `pageSize` y `searchTerm`)
  - `src/services/apiHelpers.js` — `extractItems(response)`, `getTotalPages(response)`, `getTotalCount(response)`
- Páginas y componentes:
  - `src/pages/HomePage.jsx` — listado principal de hilos
  - `src/components/PostCard.jsx` — tarjeta de hilo con acciones
  - `src/components/Sidebar.jsx` — filtros y navegación
  - `src/pages/ForosListPage.jsx`, `src/pages/HiloDetailPage.jsx`, `src/pages/PerfilPage.jsx`, `src/pages/CreateHiloPage.jsx`
- Estilos:
  - `src/pages/HomePage.css` — media queries y layout
  - Component CSS (`PostCard.css`, `Toast.css`)

---

## 6) Buenas prácticas y próximos pasos 
- Mantener `apiHelpers.extractItems` como el único punto de normalización para listados.
- Añadir pruebas unitarias que simulen `PagedResult<T>` y respuestas inesperadas para evitar regresiones.
- Ampliar `PaginationControls` a un componente reutilizable con `goToPage`, `hasNext`, `hasPrevious`.
- Añadir diagramas (module dependency graph) si se requiere para documentación visual.

---
