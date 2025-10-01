namespace GeneradorDeModelos.Dtos
{
    public class HiloCreateDto
    {
        public string Titulo { get; set; }
        public int ForoId { get; set; }

        // --- LÍNEA QUE FALTA ---
        // El contenido del hilo, que puede ser opcional
        public string? Contenido { get; set; }
    }
}