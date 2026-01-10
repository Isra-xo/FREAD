namespace GeneradorDeModelos.Dtos;

public class UsuarioUpdateDto
{
    public string? NombreUsuario { get; set; }
    public string? Email { get; set; }
    public string? OldPassword { get; set; }
    public string? NewPassword { get; set; }
}
