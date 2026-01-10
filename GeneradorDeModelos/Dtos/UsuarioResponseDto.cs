namespace GeneradorDeModelos.Dtos;

/// <summary>
/// DTO de respuesta para Usuario que EXCLUYE PasswordHash por seguridad
/// </summary>
public class UsuarioResponseDto
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string NombreUsuario { get; set; } = string.Empty;
    public DateTimeOffset? FechaRegistro { get; set; }
    public int RolId { get; set; }
    public string? ProfilePictureUrl { get; set; }
    
    // Información del rol (opcional, para cuando se incluye)
    public string? NombreRol { get; set; }
}
