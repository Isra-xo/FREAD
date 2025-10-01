using System;
using System.Collections.Generic;

namespace GeneradorDeModelos.Models;

public partial class Role
{
    public int Id { get; set; }

    public string NombreRol { get; set; } = null!;

    public virtual ICollection<Usuario> Usuarios { get; set; } = new List<Usuario>();

    public virtual ICollection<MenuItem> MenuItems { get; set; } = new List<MenuItem>();
}
