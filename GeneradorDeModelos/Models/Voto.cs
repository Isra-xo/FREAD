namespace GeneradorDeModelos.Models;

/// <summary>
/// Entidad que representa un voto de un usuario en un hilo.
/// Permite rastrear votos individuales y prevenir múltiples votos del mismo usuario.
/// </summary>
public partial class Voto
{
    public int Id { get; set; }
    
    /// <summary>
    /// ID del usuario que realizó el voto
    /// </summary>
    public int UsuarioId { get; set; }
    
    /// <summary>
    /// ID del hilo que recibió el voto
    /// </summary>
    public int HiloId { get; set; }
    
    /// <summary>
    /// Valor del voto: 1 para upvote, -1 para downvote
    /// </summary>
    public int Valor { get; set; }
    
    /// <summary>
    /// Fecha en que se realizó el voto
    /// </summary>
    public DateTimeOffset FechaVoto { get; set; } = DateTimeOffset.Now;
    
    // Navigation properties
    public virtual Usuario Usuario { get; set; } = null!;
    public virtual Hilo Hilo { get; set; } = null!;
}
