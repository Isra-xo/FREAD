using GeneradorDeModelos.Models;
using GeneradorDeModelos.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace GeneradorDeModelos.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Administrador")] // <-- Toda esta clase es solo para admins
    public class AdminController : ControllerBase
    {
        private readonly FreadContext _context;

        public AdminController(FreadContext context)
        {
            _context = context;
        }

        // GET: api/Admin/users -> Obtiene todos los usuarios
        [HttpGet("users")]
        public async Task<ActionResult<IEnumerable<UsuarioResponseDto>>> GetUsers()
        {
            // Incluimos la información del Rol para cada usuario
            var usuarios = await _context.Usuarios.Include(u => u.Rol).ToListAsync();
            
            // Mapear a DTOs sin PasswordHash
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
            
            return Ok(responseDtos);
        }

        // DELETE: api/Admin/users/5 -> Elimina un usuario
        [HttpDelete("users/{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Usuarios.FindAsync(id);
            if (user == null)
            {
                return NotFound("Usuario no encontrado.");
            }

            // Lógica adicional: evitar que el admin se borre a sí mismo (opcional pero recomendado)
            var currentUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (user.Id.ToString() == currentUserId)
            {
                return BadRequest("No puedes eliminar tu propia cuenta de administrador.");
            }

            _context.Usuarios.Remove(user);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // --- MÉTODO AÑADIDO ---
        // PUT: api/Admin/users/5/role -> Cambia el rol de un usuario
        [HttpPut("users/{id}/role")]
        public async Task<IActionResult> ChangeUserRole(int id, [FromBody] RoleChangeDto roleChangeDto)
        {
            var user = await _context.Usuarios.FindAsync(id);
            if (user == null)
            {
                return NotFound("Usuario no encontrado.");
            }

            var roleExists = await _context.Roles.AnyAsync(r => r.Id == roleChangeDto.NewRoleId);
            if (!roleExists)
            {
                return BadRequest("El rol especificado no existe.");
            }

            user.RolId = roleChangeDto.NewRoleId;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Rol de usuario actualizado correctamente." });
        }
    }
}