using GeneradorDeModelos.Helpers;
using GeneradorDeModelos.Models;
using Microsoft.EntityFrameworkCore;

namespace GeneradorDeModelos.Services;

/// <summary>
/// Servicio para gestionar foros
/// </summary>
public class ForoService : IForoService
{
    private readonly FreadContext _context;

    public ForoService(FreadContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<Foro>> GetForosAsync(int pageNumber = 1, int pageSize = 10)
    {
        // Validar parámetros
        if (pageNumber < 1) pageNumber = 1;
        if (pageSize < 1) pageSize = 10;
        if (pageSize > 100) pageSize = 100; // Límite máximo

        var query = _context.Foros
            .Include(f => f.Usuario)
            .AsQueryable();

        // Obtener total antes de paginar
        var totalCount = await query.CountAsync();

        // Aplicar paginación
        var items = await query
            .OrderBy(f => f.NombreForo)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResult<Foro>(items, totalCount, pageNumber, pageSize);
    }

    public async Task<Foro?> GetForoByIdAsync(int id)
    {
        return await _context.Foros
            .Include(f => f.Usuario)
            .FirstOrDefaultAsync(f => f.Id == id);
    }

    public async Task<Foro> CreateForoAsync(Foro foroRequest, int usuarioId)
    {
        var nuevoForo = new Foro
        {
            NombreForo = foroRequest.NombreForo,
            Descripcion = foroRequest.Descripcion,
            UsuarioId = usuarioId
        };

        _context.Foros.Add(nuevoForo);
        await _context.SaveChangesAsync();
        return nuevoForo;
    }

    public async Task<bool> UpdateForoAsync(int id, string nombreForo, string? descripcion, int usuarioId, bool isAdmin)
    {
        var foro = await _context.Foros.FindAsync(id);
        if (foro == null)
        {
            return false;
        }

        // Validar permisos
        if (foro.UsuarioId != usuarioId && !isAdmin)
        {
            return false;
        }

        foro.NombreForo = nombreForo;
        foro.Descripcion = descripcion;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteForoAsync(int id, int usuarioId, bool isAdmin)
    {
        var foro = await _context.Foros.FindAsync(id);
        if (foro == null)
        {
            return false;
        }

        // Validar permisos
        if (foro.UsuarioId != usuarioId && !isAdmin)
        {
            return false;
        }

        _context.Foros.Remove(foro);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<Foro>> GetForosByUsuarioAsync(int userId)
    {
        return await _context.Foros
            .Where(f => f.UsuarioId == userId)
            .OrderBy(f => f.NombreForo)
            .ToListAsync();
    }

    public async Task<bool> ForoExistsAsync(int id)
    {
        return await _context.Foros.AnyAsync(f => f.Id == id);
    }
}
