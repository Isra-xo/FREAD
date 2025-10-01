using GeneradorDeModelos.Dtos;
using GeneradorDeModelos.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace GeneradorDeModelos.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly FreadContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(FreadContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("register")]
        public async Task<ActionResult<Usuario>> Register(UserRegisterDto request)
        {
            if (await _context.Usuarios.AnyAsync(u => u.NombreUsuario == request.NombreUsuario))
            {
                return BadRequest("El nombre de usuario ya está en uso.");
            }
            if (await _context.Usuarios.AnyAsync(u => u.Email == request.Email))
            {
                return BadRequest("El email ya está registrado.");
            }

            var defaultRole = await _context.Roles.FirstOrDefaultAsync(r => r.NombreRol == "Usuario");
            if (defaultRole == null)
            {
                return StatusCode(500, "El rol 'Usuario' no existe en la base de datos.");
            }

            using var sha512 = SHA512.Create();
            var passwordHash = sha512.ComputeHash(Encoding.UTF8.GetBytes(request.Password));

            var user = new Usuario
            {
                Email = request.Email,
                NombreUsuario = request.NombreUsuario,
                PasswordHash = Convert.ToBase64String(passwordHash),
                RolId = defaultRole.Id,
                FechaRegistro = DateTimeOffset.Now
            };

            _context.Usuarios.Add(user);
            await _context.SaveChangesAsync();
            return Ok(user);
        }

        [HttpPost("login")]
        public async Task<ActionResult<string>> Login(UserLoginDto request)
        {
            var user = await _context.Usuarios
                .Include(u => u.Rol)
                .FirstOrDefaultAsync(u => u.NombreUsuario == request.NombreUsuario);

            if (user == null)
            {
                return Unauthorized("Usuario o contraseña incorrectos.");
            }

            //VERIFICACION DE CONTRASEÑAS
            using var sha512 = SHA512.Create();
            var computedHash = sha512.ComputeHash(Encoding.UTF8.GetBytes(request.Password));
            var requestPasswordHash = Convert.ToBase64String(computedHash);

            if (user.PasswordHash != requestPasswordHash)
            {
                return Unauthorized("Usuario o contraseña incorrectos.");
            }

            string token = CreateToken(user);
            return Ok(token);
        }

        private string CreateToken(Usuario user)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.NombreUsuario),
                new Claim(ClaimTypes.Role, user.Rol.NombreRol)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration.GetSection("AppSettings:Token").Value));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.Now.AddDays(1),
                SigningCredentials = creds
            };
            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}