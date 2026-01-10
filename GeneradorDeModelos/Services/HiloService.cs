using GeneradorDeModelos.Dtos;
using GeneradorDeModelos.Models;
using Microsoft.EntityFrameworkCore;

namespace GeneradorDeModelos.Services;

/// <summary>
/// Servicio para gestionar hilos
/// </summary>
public class HiloService : IHiloService
{
    private readonly FreadContext _context;

    public HiloService(FreadContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Hilo>> GetHilosAsync()
    {
        return await _context.Hilos
            .Include(h => h.Usuario)
            .Include(h => h.Foro)
            .OrderByDescending(h => h.FechaCreacion)
            .ToListAsync();
    }

    public async Task<Hilo?> GetHiloByIdAsync(int id)
    {
        return await _context.Hilos
            .Include(h => h.Usuario)
            .Include(h => h.Foro)
            .FirstOrDefaultAsync(h => h.Id == id);
    }

    public async Task<Hilo> CreateHiloAsync(HiloCreateDto hiloDto, int usuarioId)
    {
        // Validar que el foro existe
        var foroExists = await _context.Foros.AnyAsync(f => f.Id == hiloDto.ForoId);
        if (!foroExists)
        {
            throw new ArgumentException($"Foro con ID {hiloDto.ForoId} no encontrado.");
        }

        var nuevoHilo = new Hilo
        {
            Titulo = hiloDto.Titulo,
            Contenido = hiloDto.Contenido,
            ForoId = hiloDto.ForoId,
            UsuarioId = usuarioId,
            FechaCreacion = DateTimeOffset.Now,
            Votos = 0
        };

        _context.Hilos.Add(nuevoHilo);
        await _context.SaveChangesAsync();
        return nuevoHilo;
    }

    public async Task<bool> UpdateHiloAsync(int id, HiloUpdateDto hiloUpdateDto, int usuarioId, bool isAdmin)
    {
        var hilo = await _context.Hilos.FindAsync(id);
        if (hilo == null)
        {
            return false;
        }

        // Validar permisos
        if (hilo.UsuarioId != usuarioId && !isAdmin)
        {
            return false;
        }

        hilo.Titulo = hiloUpdateDto.Titulo;
        hilo.Contenido = hiloUpdateDto.Contenido;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteHiloAsync(int id, int usuarioId, bool isAdmin)
    {
        var hilo = await _context.Hilos.FindAsync(id);
        if (hilo == null)
        {
            return false;
        }

        // Validar permisos
        if (hilo.UsuarioId != usuarioId && !isAdmin)
        {
            return false;
        }

        _context.Hilos.Remove(hilo);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<Hilo>> GetHilosByUsuarioAsync(int userId)
    {
        return await _context.Hilos
            .Where(h => h.UsuarioId == userId)
            .Include(h => h.Foro)
            .OrderByDescending(h => h.FechaCreacion)
            .ToListAsync();
    }

    public async Task<bool> HiloExistsAsync(int id)
    {
        return await _context.Hilos.AnyAsync(h => h.Id == id);
    }
}
