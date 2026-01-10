using GeneradorDeModelos.Dtos;
using GeneradorDeModelos.Helpers;
using GeneradorDeModelos.Models;

namespace GeneradorDeModelos.Services;

/// <summary>
/// Interfaz para el servicio de gestión de hilos
/// </summary>
public interface IHiloService
{
    Task<PagedResult<Hilo>> GetHilosAsync(int pageNumber = 1, int pageSize = 10, string? searchTerm = null);
    Task<Hilo?> GetHiloByIdAsync(int id);
    Task<Hilo> CreateHiloAsync(HiloCreateDto hiloDto, int usuarioId);
    Task<bool> UpdateHiloAsync(int id, HiloUpdateDto hiloUpdateDto, int usuarioId, bool isAdmin);
    Task<bool> DeleteHiloAsync(int id, int usuarioId, bool isAdmin);
    Task<IEnumerable<Hilo>> GetHilosByUsuarioAsync(int userId);
    Task<bool> HiloExistsAsync(int id);
}
