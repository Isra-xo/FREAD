using GeneradorDeModelos.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace GeneradorDeModelos.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class MenuItemsController : ControllerBase
    {
        private readonly FreadContext _context;

        public MenuItemsController(FreadContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<MenuItem>>> GetMenuItemsForUser()
        {
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

            if (string.IsNullOrEmpty(userRole))
            {
                return Unauthorized();
            }

            // --- CORRECCIÓN DEFINITIVA DE LA CONSULTA ---
            // 1. Empezamos en la tabla de Roles, no en la de permisos.
            var menuItems = await _context.Roles
                // 2. Buscamos el rol específico que coincide con el del usuario logueado.
                .Where(rol => rol.NombreRol == userRole)
                // 3. Usamos la "relación mágica" que creó EF para obtener la lista de MenuItems directamente.
                .SelectMany(rol => rol.MenuItems)
                // 4. Convertimos el resultado a una lista.
                .ToListAsync();

            return Ok(menuItems);
        }
    }
}