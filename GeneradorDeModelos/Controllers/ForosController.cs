using GeneradorDeModelos.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;

namespace FRED.Controllers
{
    // DTO para la actualización de un foro
    public class ForoUpdateDto
    {
        public string NombreForo { get; set; }
        public string Descripcion { get; set; }
    }

    [Route("api/[controller]")]
    [ApiController]
    public class ForosController : ControllerBase
    {
        private readonly FreadContext _context;

        public ForosController(FreadContext context)
        {
            _context = context;
        }

        // GET: api/foros -> Cualquiera puede ver la lista de foros
        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<Foro>>> GetForos()
        {
            return await _context.Foros.Include(f => f.Usuario).ToListAsync();
        }

        // POST: api/foros -> Solo administradores pueden crear foros
        [HttpPost]
        [Authorize(Roles = "Administrador")]
        public async Task<ActionResult<Foro>> CreateForo(Foro foroRequest)
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var nuevoForo = new Foro
            {
                NombreForo = foroRequest.NombreForo,
                Descripcion = foroRequest.Descripcion,
                UsuarioId = int.Parse(userIdString)
            };
            _context.Foros.Add(nuevoForo);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetForos), new { id = nuevoForo.Id }, nuevoForo);
        }

        // DELETE: api/foros/5 -> Elimina un foro (dueño o admin)
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteForo(int id)
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userIsAdmin = User.IsInRole("Administrador");
            var foro = await _context.Foros.FindAsync(id);
            if (foro == null) return NotFound();
            if (foro.UsuarioId.ToString() != userIdString && !userIsAdmin) return Forbid();
            _context.Foros.Remove(foro);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // --- MÉTODO AÑADIDO ---
        // GET: api/Foros/ByUsuario/5
        [HttpGet("ByUsuario/{userId}")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<Foro>>> GetForosByUsuario(int userId)
        {
            var foros = await _context.Foros
                .Where(f => f.UsuarioId == userId)
                .OrderBy(f => f.NombreForo)
                .ToListAsync();
            return Ok(foros);
        }

        // --- MÉTODO AÑADIDO ---
        // PUT: api/Foros/5 -> Actualiza un foro (dueño o admin)
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateForo(int id, ForoUpdateDto foroUpdateDto)
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userIsAdmin = User.IsInRole("Administrador");
            var foro = await _context.Foros.FindAsync(id);
            if (foro == null) return NotFound();
            if (foro.UsuarioId.ToString() != userIdString && !userIsAdmin) return Forbid();

            foro.NombreForo = foroUpdateDto.NombreForo;
            foro.Descripcion = foroUpdateDto.Descripcion;

            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}