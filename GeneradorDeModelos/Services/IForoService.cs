using GeneradorDeModelos.Models;

namespace GeneradorDeModelos.Services;

/// <summary>
/// Interfaz para el servicio de gestión de foros
/// </summary>
public interface IForoService
{
    Task<IEnumerable<Foro>> GetForosAsync();
    Task<Foro?> GetForoByIdAsync(int id);
    Task<Foro> CreateForoAsync(Foro foroRequest, int usuarioId);
    Task<bool> UpdateForoAsync(int id, string nombreForo, string? descripcion, int usuarioId, bool isAdmin);
    Task<bool> DeleteForoAsync(int id, int usuarioId, bool isAdmin);
    Task<IEnumerable<Foro>> GetForosByUsuarioAsync(int userId);
    Task<bool> ForoExistsAsync(int id);
}
