using GeneradorDeModelos.Dtos;
using GeneradorDeModelos.Models;
using GeneradorDeModelos.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace GeneradorDeModelos.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ForosController : ControllerBase
    {
        private readonly IForoService _foroService;

        public ForosController(IForoService foroService)
        {
            _foroService = foroService;
        }

        // GET: api/foros -> Cualquiera puede ver la lista de foros
        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<Foro>>> GetForos()
        {
            var foros = await _foroService.GetForosAsync();
            return Ok(foros);
        }

        // POST: api/foros -> Solo administradores pueden crear foros
        [HttpPost]
        [Authorize(Roles = "Administrador")]
        public async Task<ActionResult<Foro>> CreateForo(Foro foroRequest)
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdString) || !int.TryParse(userIdString, out int usuarioId))
            {
                return Unauthorized();
            }

            var nuevoForo = await _foroService.CreateForoAsync(foroRequest, usuarioId);
            return CreatedAtAction(nameof(GetForos), new { id = nuevoForo.Id }, nuevoForo);
        }

        // DELETE: api/foros/5 -> Elimina un foro (dueño o admin)
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteForo(int id)
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdString) || !int.TryParse(userIdString, out int usuarioId))
            {
                return Unauthorized();
            }

            var userIsAdmin = User.IsInRole("Administrador");
            var deleted = await _foroService.DeleteForoAsync(id, usuarioId, userIsAdmin);
            
            if (!deleted) return NotFound();
            return NoContent();
        }

        // GET: api/Foros/ByUsuario/5
        [HttpGet("ByUsuario/{userId}")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<Foro>>> GetForosByUsuario(int userId)
        {
            var foros = await _foroService.GetForosByUsuarioAsync(userId);
            return Ok(foros);
        }

        // PUT: api/Foros/5 -> Actualiza un foro (dueño o admin)
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateForo(int id, ForoUpdateDto foroUpdateDto)
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdString) || !int.TryParse(userIdString, out int usuarioId))
            {
                return Unauthorized();
            }

            var userIsAdmin = User.IsInRole("Administrador");
            var updated = await _foroService.UpdateForoAsync(id, foroUpdateDto.NombreForo, foroUpdateDto.Descripcion, usuarioId, userIsAdmin);
            
            if (!updated) return NotFound();
            return NoContent();
        }
    }
}