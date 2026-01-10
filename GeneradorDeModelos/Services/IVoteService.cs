using GeneradorDeModelos.Models;

namespace GeneradorDeModelos.Services;

/// <summary>
/// Interfaz para el servicio de gestión de votos
/// </summary>
public interface IVoteService
{
    Task<int> VoteOnHiloAsync(int hiloId, int usuarioId, string direction);
    Task<bool> UserHasVotedAsync(int hiloId, int usuarioId);
    Task<int?> GetUserVoteValueAsync(int hiloId, int usuarioId);
    Task<int> GetHiloVoteCountAsync(int hiloId);
}
