using GeneradorDeModelos.Dtos;
using GeneradorDeModelos.Helpers;
using GeneradorDeModelos.Models;
using GeneradorDeModelos.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Microsoft.AspNetCore.OutputCaching; 
namespace GeneradorDeModelos.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HilosController : ControllerBase
    {
        private readonly IHiloService _hiloService;
        private readonly IVoteService _voteService;

        public HilosController(IHiloService hiloService, IVoteService voteService)
        {
            _hiloService = hiloService;
            _voteService = voteService;
        }

        // GET: api/hilos -> Cualquiera puede ver los hilos (con paginación y búsqueda)
        [HttpGet]
        [AllowAnonymous]
        [OutputCache(Duration = 60)]
        public async Task<ActionResult<PagedResult<Hilo>>> GetHilos(
            [FromQuery] int pageNumber = 1, 
            [FromQuery] int pageSize = 10,
            [FromQuery] string? searchTerm = null,
            [FromQuery] int? foroId = null)
        {
            var result = await _hiloService.GetHilosAsync(pageNumber, pageSize, searchTerm, foroId);
            return Ok(result);
        }

        // GET: api/Hilos/5 -> Cualquiera puede ver un hilo
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<Hilo>> GetHilo(int id)
        {
            var hilo = await _hiloService.GetHiloByIdAsync(id);
            if (hilo == null) return NotFound();
            return hilo;
        }

        // POST: api/hilos -> Solo usuarios logueados pueden crear
        [HttpPost]
        [Authorize]
        public async Task<ActionResult<Hilo>> CreateHilo(HiloCreateDto hiloDto)
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdString) || !int.TryParse(userIdString, out int usuarioId))
            {
                return Unauthorized();
            }

            try
            {
                var nuevoHilo = await _hiloService.CreateHiloAsync(hiloDto, usuarioId);
                return CreatedAtAction(nameof(GetHilos), new { id = nuevoHilo.Id }, nuevoHilo);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // DELETE: api/hilos/5 -> Dueño o admin pueden borrar
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteHilo(int id)
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdString) || !int.TryParse(userIdString, out int usuarioId))
            {
                return Unauthorized();
            }

            var userIsAdmin = User.IsInRole("Administrador");
            var deleted = await _hiloService.DeleteHiloAsync(id, usuarioId, userIsAdmin);
            
            if (!deleted) return NotFound();
            return NoContent();
        }

        // GET: api/Hilos/ByUsuario/5
        [HttpGet("ByUsuario/{userId}")]
        [Authorize]
        public async Task<ActionResult<PagedResult<Hilo>>> GetHilosByUsuario(int userId, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            var result = await _hiloService.GetHilosByUsuarioAsync(userId, pageNumber, pageSize);
            return Ok(result);
        }

        // PUT: api/Hilos/5 -> Dueño o admin pueden editar
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateHilo(int id, HiloUpdateDto hiloUpdateDto)
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdString) || !int.TryParse(userIdString, out int usuarioId))
            {
                return Unauthorized();
            }

            var userIsAdmin = User.IsInRole("Administrador");
            var updated = await _hiloService.UpdateHiloAsync(id, hiloUpdateDto, usuarioId, userIsAdmin);
            
            if (!updated) return NotFound();
            return NoContent();
        }

        // POST: api/Hilos/5/vote
        [HttpPost("{id}/vote")]
        [Authorize]
        public async Task<IActionResult> VoteOnHilo(int id, [FromBody] VoteRequestDto voteRequest)
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdString) || !int.TryParse(userIdString, out int usuarioId))
            {
                return Unauthorized();
            }

            try
            {
                var nuevoVoteCount = await _voteService.VoteOnHiloAsync(id, usuarioId, voteRequest.Direction);
                return Ok(new { newVoteCount = nuevoVoteCount });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}