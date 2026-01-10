using GeneradorDeModelos.Dtos;
using GeneradorDeModelos.Models;

namespace GeneradorDeModelos.Services;

/// <summary>
/// Interfaz para el servicio de gestión de hilos
/// </summary>
public interface IHiloService
{
    Task<IEnumerable<Hilo>> GetHilosAsync();
    Task<Hilo?> GetHiloByIdAsync(int id);
    Task<Hilo> CreateHiloAsync(HiloCreateDto hiloDto, int usuarioId);
    Task<bool> UpdateHiloAsync(int id, HiloUpdateDto hiloUpdateDto, int usuarioId, bool isAdmin);
    Task<bool> DeleteHiloAsync(int id, int usuarioId, bool isAdmin);
    Task<IEnumerable<Hilo>> GetHilosByUsuarioAsync(int userId);
    Task<bool> HiloExistsAsync(int id);
}
