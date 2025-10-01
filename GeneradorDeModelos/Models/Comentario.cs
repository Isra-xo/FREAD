// Contenido para Models/Comentario.cs

using System;
using System.ComponentModel.DataAnnotations;

namespace GeneradorDeModelos.Models // Asegúrate de que este namespace coincida con tu proyecto
{
    public class Comentario
    {
        [Key] // Marca esta propiedad como la clave primaria
        public int Id { get; set; }

        [Required] // Hace que el campo de contenido sea obligatorio
        public string Contenido { get; set; }

        public DateTime FechaCreacion { get; set; }

        // --- Relaciones con otras tablas (Foreign Keys) ---

        // Relación con el Usuario que escribió el comentario
        public int UsuarioId { get; set; }
        public virtual Usuario Usuario { get; set; } // Propiedad de navegación para acceder a los datos del usuario

        // Relación con el Hilo al que pertenece el comentario
        public int HiloId { get; set; }
        public virtual Hilo Hilo { get; set; } // Propiedad de navegación para acceder a los datos del hilo
    }
}