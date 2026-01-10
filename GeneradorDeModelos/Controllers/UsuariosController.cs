using GeneradorDeModelos.Models;
using GeneradorDeModelos.Dtos;
using GeneradorDeModelos.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting; // Para subir archivos
using System.IO;                   // Para manejar rutas de archivos
using System;
using System.Linq;
using Microsoft.AspNetCore.Http;   // Para IFormFile

namespace GeneradorDeModelos.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsuariosController : ControllerBase
    {
        private readonly IUsuarioService _usuarioService;
        private readonly FreadContext _context;
        private readonly IWebHostEnvironment _hostingEnvironment;

        public UsuariosController(IUsuarioService usuarioService, FreadContext context, IWebHostEnvironment hostingEnvironment)
        {
            _usuarioService = usuarioService;
            _context = context;
            _hostingEnvironment = hostingEnvironment;
        }

        // GET: api/Usuarios/5
        [HttpGet("{id}")]
        [Authorize]
        public async Task<ActionResult<UsuarioResponseDto>> GetUsuario(int id)
        {
            var usuario = await _usuarioService.GetUsuarioByIdAsync(id);
            if (usuario == null)
            {
                return NotFound();
            }
            
            return usuario;
        }

        // PUT: api/Usuarios/5
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> PutUsuario(int id, [FromBody] UsuarioUpdateDto usuarioDto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null || !int.TryParse(userIdClaim, out int currentUserId))
            {
                return Unauthorized();
            }

            var updated = await _usuarioService.UpdateUsuarioAsync(id, usuarioDto, currentUserId);
            
            if (!updated)
            {
                return NotFound();
            }

            return NoContent();
        }

        // POST: api/Usuarios/5/uploadPicture
        [HttpPost("{id}/uploadPicture")]
        [Authorize]
        public async Task<IActionResult> UploadProfilePicture(int id, IFormFile file)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null || int.Parse(userIdClaim) != id)
            {
                return Forbid();
            }

            var usuario = await _context.Usuarios.FindAsync(id);
            if (usuario == null)
            {
                return NotFound();
            }

            if (file == null || file.Length == 0)
            {
                return BadRequest("No se ha proporcionado ningún archivo.");
            }

            var uploadsFolder = Path.Combine(_hostingEnvironment.WebRootPath, "uploads", "profile_pictures");
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            var uniqueFileName = Guid.NewGuid().ToString() + "_" + file.FileName;
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            usuario.ProfilePictureUrl = $"/uploads/profile_pictures/{uniqueFileName}";
            await _context.SaveChangesAsync();

            return Ok(new { profilePictureUrl = usuario.ProfilePictureUrl });
        }
    }
}