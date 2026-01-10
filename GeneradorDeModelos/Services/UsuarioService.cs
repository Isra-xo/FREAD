using GeneradorDeModelos.Dtos;
using GeneradorDeModelos.Models;
using Microsoft.EntityFrameworkCore;

namespace GeneradorDeModelos.Services;

/// <summary>
/// Servicio para gestionar usuarios
/// </summary>
public class UsuarioService : IUsuarioService
{
    private readonly FreadContext _context;

    public UsuarioService(FreadContext context)
    {
        _context = context;
    }

    public async Task<UsuarioResponseDto?> GetUsuarioByIdAsync(int id)
    {
        var usuario = await _context.Usuarios
            .Include(u => u.Rol)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (usuario == null)
        {
            return null;
        }

        return new UsuarioResponseDto
        {
            Id = usuario.Id,
            Email = usuario.Email,
            NombreUsuario = usuario.NombreUsuario,
            FechaRegistro = usuario.FechaRegistro,
            RolId = usuario.RolId,
            ProfilePictureUrl = usuario.ProfilePictureUrl,
            NombreRol = usuario.Rol?.NombreRol
        };
    }

    public async Task<bool> UpdateUsuarioAsync(int id, UsuarioUpdateDto usuarioDto, int currentUserId)
    {
        // Solo el propio usuario puede actualizar su perfil
        if (id != currentUserId)
        {
            return false;
        }

        var usuario = await _context.Usuarios.FindAsync(id);
        if (usuario == null)
        {
            return false;
        }

        // Validar que el nuevo nombre de usuario no esté en uso (si se proporciona)
        if (!string.IsNullOrWhiteSpace(usuarioDto.NombreUsuario) && 
            usuarioDto.NombreUsuario != usuario.NombreUsuario)
        {
            if (await NombreUsuarioExistsAsync(usuarioDto.NombreUsuario, id))
            {
                return false; // Nombre de usuario ya en uso
            }
            usuario.NombreUsuario = usuarioDto.NombreUsuario;
        }

        // Validar que el nuevo email no esté en uso (si se proporciona)
        if (!string.IsNullOrWhiteSpace(usuarioDto.Email) && 
            usuarioDto.Email != usuario.Email)
        {
            if (await EmailExistsAsync(usuarioDto.Email, id))
            {
                return false; // Email ya en uso
            }
            usuario.Email = usuarioDto.Email;
        }

        // TODO: Implementar cambio de contraseña cuando se requiera
        // if (!string.IsNullOrWhiteSpace(usuarioDto.NewPassword))
        // {
        //     // Validar OldPassword y hashear NewPassword
        // }

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> UsuarioExistsAsync(int id)
    {
        return await _context.Usuarios.AnyAsync(u => u.Id == id);
    }

    public async Task<bool> NombreUsuarioExistsAsync(string nombreUsuario, int? excludeId = null)
    {
        var query = _context.Usuarios.Where(u => u.NombreUsuario == nombreUsuario);
        
        if (excludeId.HasValue)
        {
            query = query.Where(u => u.Id != excludeId.Value);
        }

        return await query.AnyAsync();
    }

    public async Task<bool> EmailExistsAsync(string email, int? excludeId = null)
    {
        var query = _context.Usuarios.Where(u => u.Email == email);
        
        if (excludeId.HasValue)
        {
            query = query.Where(u => u.Id != excludeId.Value);
        }

        return await query.AnyAsync();
    }
}
