using GeneradorDeModelos.Dtos;
using GeneradorDeModelos.Helpers;
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

    public async Task<PagedResult<Hilo>> GetHilosAsync(int pageNumber = 1, int pageSize = 10, string? searchTerm = null, int? foroId = null)
    {
        // Validar parámetros
        if (pageNumber < 1) pageNumber = 1;
        if (pageSize < 1) pageSize = 10;
        if (pageSize > 100) pageSize = 100; // Límite máximo

        var query = _context.Hilos
            .Include(h => h.Usuario)
            .Include(h => h.Foro)
            .AsQueryable();

        // Aplicar filtro por foro si se proporciona
        if (foroId.HasValue)
        {
            query = query.Where(h => h.ForoId == foroId.Value);
        }

        // Aplicar filtro de búsqueda si se proporciona
        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            searchTerm = searchTerm.Trim().ToLower();
            query = query.Where(h => 
                h.Titulo.ToLower().Contains(searchTerm) || 
                (h.Contenido != null && h.Contenido.ToLower().Contains(searchTerm)));
        }

        // Obtener total antes de paginar
        var totalCount = await query.CountAsync();

        // Aplicar paginación
        var items = await query
            .OrderByDescending(h => h.FechaCreacion)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResult<Hilo>(items, totalCount, pageNumber, pageSize);
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

    public async Task<PagedResult<Hilo>> GetHilosByUsuarioAsync(int userId, int pageNumber = 1, int pageSize = 10)
    {
        if (pageNumber < 1) pageNumber = 1;
        if (pageSize < 1) pageSize = 10;
        if (pageSize > 100) pageSize = 100;

        var query = _context.Hilos
            .Where(h => h.UsuarioId == userId)
            .Include(h => h.Foro)
            .OrderByDescending(h => h.FechaCreacion);

        var totalCount = await query.CountAsync();

        var items = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResult<Hilo>(items, totalCount, pageNumber, pageSize);
    }

    public async Task<bool> HiloExistsAsync(int id)
    {
        return await _context.Hilos.AnyAsync(h => h.Id == id);
    }
}
