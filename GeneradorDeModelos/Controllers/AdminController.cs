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
using System.Threading.Tasks;

namespace GeneradorDeModelos.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Policy = "AdminOnly")]
    public class AdminController : ControllerBase
    {
        private readonly FreadContext _context;
        private readonly IDistributedCache _cache;

        public AdminController(FreadContext context, IDistributedCache cache)
        {
            _context = context;
            _cache = cache;
        }

        [HttpGet("users")]
        public async Task<ActionResult<PagedResult<UsuarioResponseDto>>> GetUsers(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10)
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;
            if (pageSize > 100) pageSize = 100;

            var query = _context.Usuarios.Include(u => u.Rol).OrderBy(u => u.NombreUsuario);
            var totalCount = await query.CountAsync();
            
            var usuarios = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
            
            var responseDtos = usuarios.Select(u => new UsuarioResponseDto
            {
                Id = u.Id,
                Email = u.Email,
                NombreUsuario = u.NombreUsuario,
                FechaRegistro = u.FechaRegistro,
                RolId = u.RolId,
                ProfilePictureUrl = u.ProfilePictureUrl,
                NombreRol = u.Rol?.NombreRol
            }).ToList();
            
            return Ok(new PagedResult<UsuarioResponseDto>(responseDtos, totalCount, pageNumber, pageSize));
        }

        [HttpDelete("users/{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Usuarios.FindAsync(id);
            if (user == null) return NotFound("Usuario no encontrado.");

            var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (user.Id.ToString() == currentUserId)
                return BadRequest("No puedes eliminar tu propia cuenta.");

            _context.Usuarios.Remove(user);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPut("users/{id}/role")]
        public async Task<IActionResult> ChangeUserRole(int id, [FromBody] RoleChangeDto roleChangeDto)
        {
            // ✅ CARGA CRÍTICA: Incluimos el Rol para evitar el texto "Desconocido"
            var user = await _context.Usuarios
                .Include(u => u.Rol)
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null) return NotFound("Usuario no encontrado.");

            var newRole = await _context.Roles.FindAsync(roleChangeDto.NewRoleId);
            if (newRole == null) return BadRequest("El rol no existe.");

            string oldRoleName = user.Rol?.NombreRol ?? "Usuario";
            user.RolId = roleChangeDto.NewRoleId;

            // ✅ NOTIFICACIÓN PERSISTENTE
            var notificacion = new Notificacion
            {
                UsuarioId = id,
                Mensaje = $"Tu rol ha sido actualizado de {oldRoleName} a {newRole.NombreRol}. Re-inicia sesión para actualizar tus permisos.",
                Tipo = "Warning",
                EsLeida = false,
                EsPersistente = true,
                FechaCreacion = DateTime.UtcNow
            };

            _context.Notificaciones.Add(notificacion);

            // ✅ PERSISTENCIA ATÓMICA: Todo se guarda en una sola transacción
            await _context.SaveChangesAsync(); 

            // ✅ INVALIDACIÓN AGRESIVA: Limpiar caché de notificaciones del usuario afectado
            await _cache.RemoveAsync($"unread_count_{id}");
            await _cache.RemoveAsync($"notificaciones_{id}_page_1_size_5_unread_");
            await _cache.RemoveAsync($"notificaciones_{id}_page_1_size_10_unread_");

            return Ok(new { message = "Rol actualizado correctamente.", userId = id });
        }
    }
}