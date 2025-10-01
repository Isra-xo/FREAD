using GeneradorDeModelos.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace FRED.Controllers
{
    // --- DTO para recibir el nuevo ID del rol desde el frontend ---
    public class RoleChangeDto
    {
        public int NewRoleId { get; set; }
    }

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
        public async Task<ActionResult<IEnumerable<Usuario>>> GetUsers()
        {
            // Incluimos la información del Rol para cada usuario
            return await _context.Usuarios.Include(u => u.Rol).ToListAsync();
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