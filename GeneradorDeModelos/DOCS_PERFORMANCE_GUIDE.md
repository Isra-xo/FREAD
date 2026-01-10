# Guía de Rendimiento — Fases 3 y 4 

Breve guía técnica enfocada en optimizaciones aplicadas en las fases 3 y 4: Cache de respuestas, paginación, patrones de asincronía y archivos clave de referencia.

---

## 1) Caché de respuestas (OutputCache) 

- Objetivo: reducir la carga de Azure SQL y mejorar latencia en endpoints que no requieren datos en tiempo real.
- Configuración principal:
  - Registro de servicio: `Program.cs` → `builder.Services.AddOutputCache(...)` (configura expiración por defecto: 60s).
  - Middleware: `Program.cs` → `app.UseOutputCache();` (debe ubicarse antes de `UseAuthentication()` para cachear las respuestas públicas adecuadamente).
  - Uso por controlador: atributos `[OutputCache(Duration = 60)]` aplicados en:
    - `Controllers/AuthController.cs` → `GetUserMenu()`
    - `Controllers/ForosController.cs` → `GetForos()`
- Recomendaciones:
  - Invalidar o refrescar el cache al mutar recursos dependientes (por ejemplo, al crear/eliminar foros o cambiar permisos de roles).
  - Para entornos distribuidos usar un proveedor de cache compartido (Redis) y controlar keys/etiquetas para invalidación fina.

---

## 2) Paginación y filtrado (PagedResult<T>) 📄

- Propósito: devolver conjuntos parciales de datos con metadatos para que el frontend pueda controlar navegación y UX sin cargar todos los registros.

- Implementación:
  - `Helpers/PagedResult.cs` — clase genérica que contiene:
    - `IEnumerable<T> Items` — datos de la página actual
    - `int PageNumber`, `int PageSize`, `int TotalCount`
    - `int TotalPages` (calculado), `HasPrevious`, `HasNext`
  - `Services/HiloService.cs` → `GetHilosAsync(int pageNumber = 1, int pageSize = 10, string? searchTerm = null)`:
    - Valida límites (ej. `pageSize` máximo 100)
    - Aplica filtro de búsqueda (si `searchTerm` provisto): `Where(...)` con `Contains` sobre `Titulo` y `Contenido`.
    - Calcula `totalCount` con `await query.CountAsync()` antes de paginar (es necesario para `TotalCount`).
    - Aplica paginación: `OrderByDescending(...).Skip((pageNumber-1)*pageSize).Take(pageSize).ToListAsync()`.
    - Devuelve `new PagedResult<Hilo>(items, totalCount, pageNumber, pageSize)`.

- Beneficios:
  - Reduce uso de memoria y tiempo de querys cuando hay grandes volúmenes.
  - Permite UX de paginación precisa en frontend usando `TotalPages` y `TotalCount`.

- Recomendaciones:
  - Mantener `pageSize` con límites razonables (ej. 100).
  - Para grandes conjuntos y ordenamientos complejos considerar índices adecuados en SQL Server y/o keyset pagination (cursor-based) si la paginación por OFFSET se vuelve ineficiente.

---

## 3) Asincronía y patrones async/await ⚡

- Uso consistente de `async/await` en la capa de servicios (`GetHilosAsync`, `CreateHiloAsync`, `VoteOnHiloAsync`, etc.).
- Ventajas:
  - No bloquea hilos de servidor durante operaciones I/O (BD), permitiendo mayor concurrencia y rendimiento en picos de tráfico.
  - Facilita manejo de `CancellationToken` y timeouts (implementar en llamadas futuras para robustez).
- Buenas prácticas aplicadas y recomendaciones:
  - Usar `ToListAsync()`, `CountAsync()`, `FirstOrDefaultAsync()` en toda llamada a EF Core para evitar operaciones síncronas.
  - Evitar operaciones LINQ que materialicen la consulta innecesariamente antes de aplicar `Skip/Take`.
  - Considerar `AsNoTracking()` en consultas de solo lectura para reducir overhead del ChangeTracker.

---

## 4) Archivos y métodos referenciados 

- `Program.cs`
  - `builder.Services.AddOutputCache(...)`
  - `app.UseOutputCache();`
  - `AddAuthentication().AddJwtBearer(...)` (contexto de seguridad con cache)
  - `EnableRetryOnFailure(...)` en `UseSqlServer` (resiliencia de DB)

- `Helpers/PagedResult.cs` — definición de `PagedResult<T>` (Items, PageNumber, PageSize, TotalCount, TotalPages)

- `Services/HiloService.cs` — métodos relevantes:
  - `Task<PagedResult<Hilo>> GetHilosAsync(int pageNumber = 1, int pageSize = 10, string? searchTerm = null)`
    - Lógica: validación de límites, filtrado, `CountAsync()`, `Skip/Take` + `ToListAsync()`.
  - `Task<Hilo?> GetHiloByIdAsync(int id)`
  - `Task<Hilo> CreateHiloAsync(HiloCreateDto hiloDto, int usuarioId)`
  - `Task<IEnumerable<Hilo>> GetHilosByUsuarioAsync(int userId)`

- `Controllers/ForosController.cs` — uso de `[OutputCache(Duration = 60)]` en `GetForos()`
- `Controllers/AuthController.cs` — uso de `[OutputCache(Duration = 60)]` en `GetUserMenu()`
- `Services/VoteService.cs` — ejemplo de manejo de concurrencia y reintentos (`DbUpdateConcurrencyException`)

---

## 5) Acciones recomendadas (próximos pasos) 

- Medir: añadir métricas (requests/sec, cache hits/misses, counts de reintentos por `DbUpdateConcurrencyException`).
- Tests: añadir pruebas unitarias e2e para paginación, límites (`pageSize`), y resiliencia de `VoteService`.
- Producción: mover `AppSettings:Token` a User Secrets / variables de entorno y usar `ValidateIssuer`/`ValidateAudience`.
- Optimización avanzada: evaluar `keyset pagination` (cursor) para listados con millones de filas y considerar Redis para OutputCache distribuido.

---

Si quieres, puedo:
- Añadir ejemplos de fragmentos SQL/índices recomendados para `Hilos` (por `FechaCreacion`, `ForoId`).
- Crear tests iniciales para `GetHilosAsync` y `VoteService`.

¿Empiezo por añadir tests unitarios para `GetHilosAsync`? 