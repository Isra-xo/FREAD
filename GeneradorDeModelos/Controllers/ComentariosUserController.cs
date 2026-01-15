using GeneradorDeModelos.Models;
using GeneradorDeModelos.Helpers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

namespace GeneradorDeModelos.Controllers
{
    // Controlador desanidado para operaciones de comentarios que NO están bajo un hilo específico
    [Route("api/[controller]")]
    [ApiController]
    public class ComentariosUserController : ControllerBase
    {
        private readonly FreadContext _context;

        public ComentariosUserController(FreadContext context)
        {
            _context = context;
        }

        // GET: /api/ComentariosUser/ByUser/5?pageNumber=1&pageSize=10
        // Obtiene comentarios de un usuario específico (con paginación)
        [HttpGet("ByUser/{userId}")]
        [Authorize]
        public async Task<ActionResult<PagedResult<Comentario>>> GetComentariosByUserId(int userId, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;
            if (pageSize > 100) pageSize = 100;

            var query = _context.Comentarios
                .Where(c => c.UsuarioId == userId)
                .Include(c => c.Usuario)
                .OrderByDescending(c => c.FechaCreacion);

            var totalCount = await query.CountAsync();

            var items = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return Ok(new PagedResult<Comentario>(items, totalCount, pageNumber, pageSize));
        }
    }
}
