using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace GeneradorDeModelos.Models;

public partial class Hilo
{
    public int Id { get; set; }
    public string Titulo { get; set; } = null!;
    public DateTimeOffset? FechaCreacion { get; set; }
    public int ForoId { get; set; }
    public int UsuarioId { get; set; }
    public string? Contenido { get; set; }
    public int Votos { get; set; }

    /// <summary>
    /// Token de concurrencia optimista para prevenir conflictos de actualización simultánea
    /// </summary>
    [Timestamp]
    public byte[]? RowVersion { get; set; }

    public virtual Foro Foro { get; set; } = null!;
    public virtual Usuario Usuario { get; set; } = null!;
    public virtual ICollection<Comentario> Comentarios { get; set; } = new List<Comentario>();

    // --- LÍNEA QUE FALTA ---
    // Tu FreadContext.cs define esta relación, por lo que la propiedad debe existir.
    public virtual ICollection<Post> Posts { get; set; } = new List<Post>();
}