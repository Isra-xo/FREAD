using GeneradorDeModelos.Dtos;
using GeneradorDeModelos.Models;

namespace GeneradorDeModelos.Services;

/// <summary>
/// Interfaz para el servicio de gestión de usuarios
/// </summary>
public interface IUsuarioService
{
    Task<UsuarioResponseDto?> GetUsuarioByIdAsync(int id);
    Task<bool> UpdateUsuarioAsync(int id, UsuarioUpdateDto usuarioDto, int currentUserId);
    Task<bool> UsuarioExistsAsync(int id);
    Task<bool> NombreUsuarioExistsAsync(string nombreUsuario, int? excludeId = null);
    Task<bool> EmailExistsAsync(string email, int? excludeId = null);
}
