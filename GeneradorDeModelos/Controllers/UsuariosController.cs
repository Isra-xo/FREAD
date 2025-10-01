using GeneradorDeModelos.Models;
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

namespace FRED.Controllers
{
    // DTO para recibir los datos de actualización del perfil
    public class UsuarioUpdateDto
    {
        public string? NombreUsuario { get; set; }
        public string? Email { get; set; }
        public string? OldPassword { get; set; }
        public string? NewPassword { get; set; }
    }

    [Route("api/[controller]")]
    [ApiController]
    public class UsuariosController : ControllerBase
    {
        // --- CORRECCIÓN IMPORTANTE ---
        private readonly FreadContext _context;
        private readonly IWebHostEnvironment _hostingEnvironment;

        public UsuariosController(FreadContext context, IWebHostEnvironment hostingEnvironment)
        {
            _context = context;
            _hostingEnvironment = hostingEnvironment;
        }

        // GET: api/Usuarios/5
        [HttpGet("{id}")]
        [Authorize]
        public async Task<ActionResult<Usuario>> GetUsuario(int id)
        {
            var usuario = await _context.Usuarios.FindAsync(id);
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
            if (userIdClaim == null || int.Parse(userIdClaim) != id)
            {
                return Forbid(); // Solo el propio usuario puede modificar su perfil
            }

            var usuario = await _context.Usuarios.FindAsync(id);
            if (usuario == null)
            {
                return NotFound();
            }

            // Actualizar nombre y email
            if (!string.IsNullOrWhiteSpace(usuarioDto.NombreUsuario))
                usuario.NombreUsuario = usuarioDto.NombreUsuario;
            if (!string.IsNullOrWhiteSpace(usuarioDto.Email))
                usuario.Email = usuarioDto.Email;

            // Actualizar contraseña (simplificado, necesitas una librería de hashing como BCrypt)
            if (!string.IsNullOrWhiteSpace(usuarioDto.NewPassword))
            {
                // Aquí deberías verificar la contraseña antigua (usuarioDto.OldPassword)
                // y luego generar un nuevo hash para la nueva contraseña.
                // Por ahora, lo dejamos pendiente para no añadir más complejidad.
            }

            _context.Entry(usuario).State = EntityState.Modified;
            await _context.SaveChangesAsync();

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