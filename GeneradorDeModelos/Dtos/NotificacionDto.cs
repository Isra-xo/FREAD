using System;
using System.ComponentModel.DataAnnotations;

namespace GeneradorDeModelos.Dtos
{
    public class NotificacionDto
    {
        public int Id { get; set; }

        [Required]
        public int UsuarioId { get; set; }

        [Required]
        [StringLength(1000)]
        public string Mensaje { get; set; }

        [Required]
        [StringLength(50)]
        public string Tipo { get; set; } // "Success", "Warning", "Info", "Error"

        [Required]
        public bool EsLeida { get; set; }

        public DateTime FechaCreacion { get; set; }

        // NO incluir EsPersistente (interno del servidor)
        // NO incluir contraseñas u datos sensibles del usuario
    }

    public class NotificacionCreateDto
    {
        [Required]
        [StringLength(1000)]
        public string Mensaje { get; set; }

        [Required]
        [StringLength(50)]
        public string Tipo { get; set; }

        public bool EsPersistente { get; set; } = true;
    }

    public class NotificacionMarkAsReadDto
    {
        [Required]
        public bool EsLeida { get; set; }
    }
}
