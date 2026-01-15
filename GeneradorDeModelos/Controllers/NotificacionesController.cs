using GeneradorDeModelos.Models;
using GeneradorDeModelos.Dtos;
using GeneradorDeModelos.Helpers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text.Json;
using System.Threading.Tasks;

namespace GeneradorDeModelos.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Requiere token JWT válido
    public class NotificacionesController : ControllerBase
    {
        private readonly FreadContext _context;
        private readonly IDistributedCache _cache; // 🔵 Cache distribuida

        public NotificacionesController(FreadContext context, IDistributedCache cache)
        {
            _context = context;
            _cache = cache;
        }

        /// <summary>
        /// GET /api/Notificaciones - Obtiene notificaciones del usuario logueado
        /// 🟢 Paginación con Skip/Take
        /// 🔵 Caché Distribuida para notificaciones recientes
        /// 🟡 Async/await en todas las operaciones
        /// 🔴 Solo notificaciones del usuario logueado (seguridad)
        /// </summary>
        [HttpGet("")]
        public async Task<ActionResult<PagedResult<NotificacionDto>>> GetNotificaciones(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] bool? soloNoLeidas = null)
        {
            // 🔴 SEGURIDAD: Obtener el ID del usuario desde el JWT
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out int usuarioId))
            {
                return Unauthorized("Token inválido o sin usuario ID.");
            }

            // 🟢 PAGINACIÓN: Validar parámetros
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;
            if (pageSize > 100) pageSize = 100; // Máximo 100

            // 🔵 CACHÉ: Intentar obtener del caché distribuido primero
            var cacheKey = $"notificaciones_{usuarioId}_page_{pageNumber}_size_{pageSize}_unread_{soloNoLeidas}";
            var cachedData = await _cache.GetStringAsync(cacheKey);

            if (!string.IsNullOrEmpty(cachedData))
            {
                // Cache hit: deserializar y retornar
                return Ok(JsonSerializer.Deserialize<PagedResult<NotificacionDto>>(cachedData));
            }

            // Cache miss: obtener de BD
            var resultado = await FetchNotificacionesFromDatabase(usuarioId, pageNumber, pageSize, soloNoLeidas);

            // Guardar en caché por 5 minutos
            var cacheOptions = new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5)
            };
            await _cache.SetStringAsync(cacheKey, JsonSerializer.Serialize(resultado), cacheOptions);

            return Ok(resultado);
        }

        /// <summary>
        /// Método privado para obtener notificaciones de la BD (ejecutado cuando caché no está disponible)
        /// ✅ SIMPLIFICADO: Sin filtro de 'Leída'. Las notificaciones existen hasta ser eliminadas.
        /// </summary>
        private async Task<PagedResult<NotificacionDto>> FetchNotificacionesFromDatabase(
            int usuarioId, int pageNumber, int pageSize, bool? soloNoLeidas)
        {
            // 🟡 ASYNC: CountAsync para total
            // ✅ Sin filtro - TODAS las notificaciones del usuario
            var query = _context.Notificaciones.Where(n => n.UsuarioId == usuarioId);
            
            // Parámetro 'soloNoLeidas' ignorado - ya no filtramos por estado
            var totalCount = await query.CountAsync();

            // 🟡 ASYNC: ToListAsync para paginación
            var notificaciones = await query
                .OrderByDescending(n => n.FechaCreacion) // Más recientes primero
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(n => new NotificacionDto
                {
                    Id = n.Id,
                    UsuarioId = n.UsuarioId,
                    Mensaje = n.Mensaje,
                    Tipo = n.Tipo,
                    EsLeida = n.EsLeida,
                    FechaCreacion = n.FechaCreacion
                    // NO incluir EsPersistente
                })
                .ToListAsync();

            return new PagedResult<NotificacionDto>(notificaciones, totalCount, pageNumber, pageSize);
        }

        /// <summary>
        /// DELETE /api/Notificaciones/{id} - Eliminar notificación (ÚNICO ENDPOINT DE MODIFICACIÓN)
        /// ✅ SIMPLIFICADO: Solo borra, no actualiza estado
        /// 🟡 Async/await + invalidación agresiva de caché
        /// </summary>
        [HttpDelete("{id}")]
public async Task<IActionResult> DeleteNotificacion(int id)
{
    var notificacion = await _context.Notificaciones.FindAsync(id);
    if (notificacion == null) return NotFound("Notificación no encontrada.");

    var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    if (!int.TryParse(userIdClaim, out int usuarioId)) return Unauthorized();

    var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
    if (notificacion.UsuarioId != usuarioId && userRole != "Administrador") return Forbid();

    int affectedUserId = notificacion.UsuarioId;
    
    _context.Notificaciones.Remove(notificacion);
    await _context.SaveChangesAsync();

    // 🔵 CACHÉ: Eliminación agresiva de llaves exactas
    // Esto asegura que el "3" de la campana baje a "2" inmediatamente al recargar
    await _cache.RemoveAsync($"unread_count_{affectedUserId}");
    await _cache.RemoveAsync($"notificaciones_{affectedUserId}_page_1_size_5_unread_");
    await _cache.RemoveAsync($"notificaciones_{affectedUserId}_page_1_size_10_unread_");

    return NoContent();
}

        /// <summary>
        /// GET /api/Notificaciones/count/total - Contar TODAS las notificaciones del usuario
        /// ✅ SIMPLIFICADO: Sin filtro de EsLeida. Las notificaciones existen hasta ser eliminadas.
        /// 🔵 Caché rápido para badge count (2 minutos)
        /// </summary>
        [HttpGet("count/total")]
        public async Task<ActionResult<object>> GetTotalCount()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out int usuarioId))
            {
                return Unauthorized("Token inválido.");
            }

            // 🔵 CACHÉ: Almacenar conteo por 2 minutos
            var cacheKey = $"unread_count_{usuarioId}";
            var cachedCount = await _cache.GetStringAsync(cacheKey);

            if (!string.IsNullOrEmpty(cachedCount) && int.TryParse(cachedCount, out int count))
            {
                return Ok(new { unreadCount = count });
            }

            // Cache miss: contar TODAS las notificaciones del usuario
            // ✅ Sin filtro - todas las notificaciones cuentan
            var totalCount = await _context.Notificaciones
                .Where(n => n.UsuarioId == usuarioId)
                .CountAsync(); // 🟡 ASYNC

            // Guardar en caché por 2 minutos
            var cacheOptions = new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(2)
            };
            await _cache.SetStringAsync(cacheKey, totalCount.ToString(), cacheOptions);

            return Ok(new { unreadCount = totalCount });
        }
    }
}
