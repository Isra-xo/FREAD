using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GeneradorDeModelos.Models
{
    public class Notificacion
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [ForeignKey("Usuario")]
        public int UsuarioId { get; set; }
        public Usuario Usuario { get; set; } // Navigation property

        [Required]
        [StringLength(1000)]
        public string Mensaje { get; set; }

        [Required]
        [StringLength(50)]
        public string Tipo { get; set; } // "Success", "Warning", "Info", "Error"

        [Required]
        public bool EsLeida { get; set; } = false;

        [Required]
        public bool EsPersistente { get; set; } = true; // true = guardar en BD, false = solo caché temporal

        [Required]
        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;
    }
}
