using System;
using System.Collections.Generic;

namespace GeneradorDeModelos.Models;

public partial class Foro
{
    public int Id { get; set; }

    public string NombreForo { get; set; } = null!;

    public string? Descripcion { get; set; }

    public int? UsuarioId { get; set; }

    public virtual ICollection<Hilo> Hilos { get; set; } = new List<Hilo>();

    public virtual Usuario? Usuario { get; set; }
}
