using GeneradorDeModelos.Models;
using Microsoft.EntityFrameworkCore;

namespace GeneradorDeModelos.Services;

/// <summary>
/// Servicio para gestionar votos en hilos.
/// Implementa lógica para prevenir múltiples votos del mismo usuario en un hilo.
/// </summary>
public class VoteService : IVoteService
{
    private readonly FreadContext _context;

    public VoteService(FreadContext context)
    {
        _context = context;
    }

    public async Task<int> VoteOnHiloAsync(int hiloId, int usuarioId, string direction)
    {
        int maxRetries = 3;
        int retryCount = 0;

        while (retryCount < maxRetries)
        {
            try
            {
                // Validar que el hilo existe (con RowVersion para concurrencia)
                var hilo = await _context.Hilos.FindAsync(hiloId);
                if (hilo == null)
                {
                    throw new ArgumentException($"Hilo con ID {hiloId} no encontrado.");
                }

                // Guardar RowVersion original para verificación de concurrencia
                var originalRowVersion = hilo.RowVersion;

                // Buscar si el usuario ya votó en este hilo
                var votoExistente = await _context.Votos
                    .FirstOrDefaultAsync(v => v.UsuarioId == usuarioId && v.HiloId == hiloId);

                int nuevoValor = direction.ToLower() == "up" ? 1 : (direction.ToLower() == "down" ? -1 : 0);
                
                if (nuevoValor == 0)
                {
                    throw new ArgumentException("Direction debe ser 'up' o 'down'.");
                }

                if (votoExistente != null)
                {
                    // Si el usuario ya votó, actualizar el voto
                    var valorAnterior = votoExistente.Valor;
                    
                    // Si vota lo mismo, eliminar el voto (toggle)
                    if (votoExistente.Valor == nuevoValor)
                    {
                        _context.Votos.Remove(votoExistente);
                        hilo.Votos -= nuevoValor; // Revertir el voto anterior
                    }
                    else
                    {
                        // Cambiar el voto (de up a down o viceversa)
                        hilo.Votos -= valorAnterior; // Revertir voto anterior
                        hilo.Votos += nuevoValor;    // Aplicar nuevo voto
                        votoExistente.Valor = nuevoValor;
                        votoExistente.FechaVoto = DateTimeOffset.Now;
                    }
                }
                else
                {
                    // Crear nuevo voto
                    var nuevoVoto = new Voto
                    {
                        UsuarioId = usuarioId,
                        HiloId = hiloId,
                        Valor = nuevoValor,
                        FechaVoto = DateTimeOffset.Now
                    };
                    _context.Votos.Add(nuevoVoto);
                    hilo.Votos += nuevoValor;
                }

                // Verificar que el RowVersion no haya cambiado (concurrencia optimista)
                _context.Entry(hilo).Property(h => h.RowVersion).OriginalValue = originalRowVersion;

                await _context.SaveChangesAsync();
                return hilo.Votos;
            }
            catch (DbUpdateConcurrencyException)
            {
                retryCount++;
                if (retryCount >= maxRetries)
                {
                    throw new InvalidOperationException("No se pudo completar el voto debido a una actualización simultánea. Por favor, intente nuevamente.");
                }
                
                // Limpiar el contexto y reintentar
                _context.ChangeTracker.Clear();
                await Task.Delay(100 * retryCount); // Esperar un poco antes de reintentar
            }
        }

        throw new InvalidOperationException("Error al procesar el voto después de múltiples intentos.");
    }

    public async Task<bool> UserHasVotedAsync(int hiloId, int usuarioId)
    {
        return await _context.Votos
            .AnyAsync(v => v.UsuarioId == usuarioId && v.HiloId == hiloId);
    }

    public async Task<int?> GetUserVoteValueAsync(int hiloId, int usuarioId)
    {
        var voto = await _context.Votos
            .FirstOrDefaultAsync(v => v.UsuarioId == usuarioId && v.HiloId == hiloId);
        
        return voto?.Valor;
    }

    public async Task<int> GetHiloVoteCountAsync(int hiloId)
    {
        var hilo = await _context.Hilos.FindAsync(hiloId);
        return hilo?.Votos ?? 0;
    }
}
