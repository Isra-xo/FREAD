using GeneradorDeModelos.Models;
using GeneradorDeModelos.Dtos; // <-- 1. AÑADE ESTE USING para los DTOs
using GeneradorDeModelos.Helpers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace GeneradorDeModelos.Controllers
{
    // Esta ruta anida los comentarios dentro de los hilos.
    // Ejemplo de URL: /api/Hilos/5/Comentarios
    [Route("api/Hilos/{hiloId}/[controller]")]
    [ApiController]
    public class ComentariosController : ControllerBase
    {
        private readonly FreadContext _context;

        public ComentariosController(FreadContext context)
        {
            _context = context;
        }

        // GET: /api/Hilos/5/Comentarios -> Obtiene todos los comentarios de un hilo específico (con paginación)
        [HttpGet]
        public async Task<ActionResult<PagedResult<Comentario>>> GetComentarios(int hiloId, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;
            if (pageSize > 100) pageSize = 100;

            var query = _context.Comentarios
                .Where(c => c.HiloId == hiloId)
                .Include(c => c.Usuario)
                .OrderBy(c => c.FechaCreacion);

            var totalCount = await query.CountAsync();

            var items = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return Ok(new PagedResult<Comentario>(items, totalCount, pageNumber, pageSize));
        }

        // GET: /api/Comentarios/ByUser/{userId} -> Obtiene comentarios de un usuario específico (con paginación)
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

        // POST: /api/Hilos/5/Comentarios -> Crea un nuevo comentario en un hilo específico
        [HttpPost]
        [Authorize] // Solo usuarios logueados pueden comentar
        // --- 2. CAMBIO IMPORTANTE: Ahora recibe ComentarioCreateDto ---
        public async Task<ActionResult<Comentario>> PostComentario(int hiloId, [FromBody] ComentarioCreateDto comentarioDto)
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdString == null)
            {
                return Unauthorized();
            }

            var nuevoComentario = new Comentario
            {
                // --- 3. CAMBIO IMPORTANTE: Usa el DTO para obtener el contenido ---
                Contenido = comentarioDto.Contenido,
                FechaCreacion = System.DateTime.UtcNow,
                HiloId = hiloId, // Asigna el ID del hilo desde la URL
                UsuarioId = int.Parse(userIdString) // Asigna el ID del usuario desde el token
            };

            _context.Comentarios.Add(nuevoComentario);
            await _context.SaveChangesAsync();

            // Devuelve el comentario recién creado
            return CreatedAtAction(nameof(GetComentarios), new { hiloId = hiloId, id = nuevoComentario.Id }, nuevoComentario);
        }
    }
}