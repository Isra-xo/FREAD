using GeneradorDeModelos.Models;
using GeneradorDeModelos.Dtos; // <-- 1. AÑADE ESTE USING para los DTOs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace FRED.Controllers // O el namespace que corresponda a tu proyecto
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

        // GET: /api/Hilos/5/Comentarios -> Obtiene todos los comentarios de un hilo específico
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Comentario>>> GetComentarios(int hiloId)
        {
            // Filtra los comentarios para devolver solo los que pertenecen al hiloId de la URL
            return await _context.Comentarios
                .Where(c => c.HiloId == hiloId)
                .Include(c => c.Usuario) // Incluye los datos del usuario para mostrar su nombre
                .OrderBy(c => c.FechaCreacion)
                .ToListAsync();
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