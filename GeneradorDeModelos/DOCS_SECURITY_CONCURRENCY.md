# Guía: Seguridad y Concurrencia 

Documento técnico que describe las decisiones de autenticación/autorización y la estrategia de concurrencia optimista usadas en el proyecto.

---

## 1) Autenticación y Autorización (JWT + Políticas) 

### Flujo JWT (resumen)
- El backend genera un token JWT al autenticarse (`POST /api/Auth/login`).
  - Archivo: `Controllers/AuthController.cs` → método privado `CreateToken(Usuario user)`.
  - Claims incluidos: `ClaimTypes.NameIdentifier` (user id), `ClaimTypes.Name` (username), `ClaimTypes.Role` (role name).
  - Firma: HMAC SHA-512 con la clave en `AppSettings:Token` (configurada en `appsettings.json` / `Program.cs`).
- El token se devuelve al cliente y éste lo almacena (por ejemplo, `localStorage`) y lo envía en el `Authorization: Bearer <token>` header en peticiones posteriores.
- El middleware JWT (`AddJwtBearer`) valida la firma y los claims para autenticar la petición.
  - Archivo: `Program.cs` → `builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(...)`.

### Políticas y autorización
- Política `AdminOnly` definida en `Program.cs`:
  - `builder.Services.AddAuthorization(options => options.AddPolicy("AdminOnly", policy => policy.RequireRole("Administrador")));`
- Uso en controladores:
  - `Controllers/ForosController.cs` → `[Authorize(Policy = "AdminOnly")]` en endpoints de creación de foros (o se usa `[Authorize]` con roles donde aplica).
  - `Controllers/AuthController.cs` → `[Authorize]` en `GetUserMenu()` para devolver menús dinámicos según rol.
- Recomendaciones:
  - Mover `AppSettings:Token` a User Secrets o variables de entorno en producción.
  - En producción habilitar `ValidateIssuer` y `ValidateAudience` en la configuración JWT y usar valores concretos (issuer/audience).

---

## 2) Concurrencia optimista (RowVersion / [Timestamp]) 

### Fundamento
- Uso de un token de concurrencia (`RowVersion`) en el modelo `Hilo` para detectar modificaciones concurrentes y evitar sobrescribir cambios no intencionales.
- Archivo: `Models/Hilo.cs` → propiedad marcada con `[Timestamp]`:
```csharp
[Timestamp]
public byte[]? RowVersion { get; set; }
```
- EF Core incluye `RowVersion` en el `WHERE` de `UPDATE`/`DELETE`, provocando `DbUpdateConcurrencyException` si el registro fue modificado por otra transacción después de ser leído.

### Ventajas
- Evita perder actualizaciones concurrentes.
- Permite construir lógica de reintentos o estrategia de conciliación (merge o informar al usuario).

---

## 3) Manejo de conflictos en `VoteService` (ejemplo práctico) 

### Descripción general
- El servicio `VoteService` implementa un patrón robusto para aplicar votos en hilos:
  - Verifica si existe un `Voto` previo (para toggle o cambio de dirección).
  - Actualiza el contador `Hilo.Votos` de forma consistente.
  - Antes de `SaveChangesAsync()`, fija el `OriginalValue` del `RowVersion` leído para detectar concurrencia.

### Captura de excepciones y reintentos
- Implementación observada: `Services/VoteService.cs` → `VoteOnHiloAsync(int hiloId, int usuarioId, string direction)`.
  - Envuelve la operación en un bucle de reintentos (máximo 3) y captura `DbUpdateConcurrencyException`.
  - En caso de excepción incrementa contador de reintentos, limpia el ChangeTracker (`_context.ChangeTracker.Clear()`), espera un pequeño backoff (`Task.Delay(100 * retryCount)`) y vuelve a intentar la operación.
  - Si tras los reintentos aún falla, lanza `InvalidOperationException` con mensaje claro para el cliente.

### Recomendaciones operativas
- Registrar métricas: contar `DbUpdateConcurrencyException` y reintentos para ajustar `maxRetries` y backoff.
- Considerar estrategias alternativas cuando los reintentos fallan repetidamente:
  - Notificar al usuario (ej. "No se pudo procesar su voto, inténtelo de nuevo").
  - Aplicar políticas de conciliación automática si es seguro.
- Evitar bloquear largos; si la operación es de baja prioridad, se puede encolar (background job) para resolución tardía en escenarios extremos.

---

## 4) Archivos y métodos referenciados 
- `Controllers/AuthController.cs`
  - `CreateToken(Usuario user)` — genera JWT con claims y firma HMAC SHA512.
  - `[Authorize]` y `[OutputCache]` en métodos protegidos (ej. `GetUserMenu()`).
- `Program.cs`
  - `AddAuthentication().AddJwtBearer(...)` — configuración de validación del token.
  - `AddAuthorization(...)` — definición de `AdminOnly` policy.
- `Models/Hilo.cs`
  - Propiedad `RowVersion` con `[Timestamp]`.
- `Services/VoteService.cs`
  - `VoteOnHiloAsync(...)` — lógica de voto, control de concurrencia y reintentos.

---

## 5) Acciones recomendadas 
- Añadir telemetría (Prometheus/App Insights): contar concurrencias y reintentos, latencias de `VoteOnHiloAsync`.
- Crear pruebas unitarias/integración que simulen `DbUpdateConcurrencyException` para validar reintentos y comportamiento de la API.
- Revisar límites de reintento y backoff según la observabilidad (no poner reintentos muy largos que causen mala experiencia).
- Revisar `AppSettings:Token` y migrarlo a storage seguro en entorno de producción.

---
