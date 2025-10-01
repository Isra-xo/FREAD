using System;
using System.Collections.Generic;

namespace GeneradorDeModelos.Models;

public partial class Usuario
{
    public int Id { get; set; }
    public string Email { get; set; } = null!;
    public string PasswordHash { get; set; } = null!;
    public string NombreUsuario { get; set; } = null!;
    public DateTimeOffset? FechaRegistro { get; set; }
    public int RolId { get; set; }

    // --- CAMPO AÑADIDO ---
    public string? ProfilePictureUrl { get; set; } // Para guardar la URL de la foto de perfil

    // --- Relaciones ---
    public virtual ICollection<Foro> Foros { get; set; } = new List<Foro>();
    public virtual ICollection<Hilo> Hilos { get; set; } = new List<Hilo>();
    public virtual ICollection<Comentario> Comentarios { get; set; } = new List<Comentario>(); // Relación con Comentarios
    public virtual ICollection<Post> Posts { get; set; } = new List<Post>();

    public virtual Role Rol { get; set; } = null!;
}