using GeneradorDeModelos.Dtos;
using GeneradorDeModelos.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Collections.Generic;
using System.Threading.Tasks;
using System;
using System.Linq;

namespace GeneradorDeModelos.Controllers
{
    // DTOs para Hilos
    public class HiloUpdateDto
    {
        public string Titulo { get; set; }
        public string Contenido { get; set; }
    }
    public class VoteRequest
    {
        public string Direction { get; set; } // "up" or "down"
    }


    [Route("api/[controller]")]
    [ApiController]
    public class HilosController : ControllerBase
    {
        private readonly FreadContext _context;

        public HilosController(FreadContext context)
        {
            _context = context;
        }

        // GET: api/hilos -> Cualquiera puede ver los hilos
        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<Hilo>>> GetHilos()
        {
            return await _context.Hilos
                .Include(h => h.Usuario)
                .Include(h => h.Foro)
                .OrderByDescending(h => h.FechaCreacion)
                .ToListAsync();
        }

        // GET: api/Hilos/5 -> Cualquiera puede ver un hilo
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<Hilo>> GetHilo(int id)
        {
            var hilo = await _context.Hilos
                .Include(h => h.Usuario)
                .Include(h => h.Foro)
                .FirstOrDefaultAsync(h => h.Id == id);
            if (hilo == null) return NotFound();
            return hilo;
        }

        // POST: api/hilos -> Solo usuarios logueados pueden crear
        [HttpPost]
        [Authorize]
        public async Task<ActionResult<Hilo>> CreateHilo(HiloCreateDto hiloDto)
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var nuevoHilo = new Hilo
            {
                Titulo = hiloDto.Titulo,
                Contenido = hiloDto.Contenido, // Asumiendo que HiloCreateDto tiene Contenido
                ForoId = hiloDto.ForoId,
                UsuarioId = int.Parse(userIdString),
                FechaCreacion = DateTimeOffset.Now,
                Votos = 0 // Inicializa votos en 0
            };
            _context.Hilos.Add(nuevoHilo);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetHilos), new { id = nuevoHilo.Id }, nuevoHilo);
        }

        // DELETE: api/hilos/5 -> Dueño o admin pueden borrar
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteHilo(int id)
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userIsAdmin = User.IsInRole("Administrador");
            var hilo = await _context.Hilos.FindAsync(id);
            if (hilo == null) return NotFound();
            if (hilo.UsuarioId.ToString() != userIdString && !userIsAdmin) return Forbid();
            _context.Hilos.Remove(hilo);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // --- MÉTODO AÑADIDO ---
        // GET: api/Hilos/ByUsuario/5
        [HttpGet("ByUsuario/{userId}")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<Hilo>>> GetHilosByUsuario(int userId)
        {
            return await _context.Hilos
                .Where(h => h.UsuarioId == userId)
                .Include(h => h.Foro)
                .OrderByDescending(h => h.FechaCreacion)
                .ToListAsync();
        }

        // --- MÉTODO AÑADIDO ---
        // PUT: api/Hilos/5 -> Dueño o admin pueden editar
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateHilo(int id, HiloUpdateDto hiloUpdateDto)
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userIsAdmin = User.IsInRole("Administrador");
            var hilo = await _context.Hilos.FindAsync(id);
            if (hilo == null) return NotFound();
            if (hilo.UsuarioId.ToString() != userIdString && !userIsAdmin) return Forbid();

            hilo.Titulo = hiloUpdateDto.Titulo;
            hilo.Contenido = hiloUpdateDto.Contenido;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // --- MÉTODO AÑADIDO ---
        // POST: api/Hilos/5/vote
        [HttpPost("{id}/vote")]
        [Authorize]
        public async Task<IActionResult> VoteOnHilo(int id, [FromBody] VoteRequest voteRequest)
        {
            var hilo = await _context.Hilos.FindAsync(id);
            if (hilo == null) return NotFound();

            if (voteRequest.Direction == "up") hilo.Votos++;
            else if (voteRequest.Direction == "down") hilo.Votos--;

            await _context.SaveChangesAsync();
            return Ok(new { newVoteCount = hilo.Votos });
        }
    }
}