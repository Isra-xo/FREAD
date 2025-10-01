namespace GeneradorDeModelos.Dtos
{
    public class UserRegisterDto
    {
        public string Email { get; set; } = string.Empty;
        public string NombreUsuario { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}