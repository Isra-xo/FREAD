using System;
using System.Collections.Generic;

namespace GeneradorDeModelos.Models;

public partial class MenuItem
{
    public int Id { get; set; }

    public string Titulo { get; set; } = null!;

    public string Url { get; set; } = null!;

    public string? Icono { get; set; }

    public virtual ICollection<Role> Rols { get; set; } = new List<Role>();
}
