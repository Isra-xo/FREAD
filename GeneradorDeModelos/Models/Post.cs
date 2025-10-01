using System;
using System.Collections.Generic;

namespace GeneradorDeModelos.Models;

public partial class Post
{
    public int Id { get; set; }

    public string ContenidoMensaje { get; set; } = null!;

    public DateTimeOffset? FechaCreacion { get; set; }

    public int HiloId { get; set; }

    public int UsuarioId { get; set; }

    public virtual Hilo Hilo { get; set; } = null!;

    public virtual Usuario Usuario { get; set; } = null!;
}
