using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GeneradorDeModelos.Migrations
{
    /// <inheritdoc />
    public partial class AddContenidoAndVotosToHilos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Contenido",
                table: "Hilos",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Votos",
                table: "Hilos",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Contenido",
                table: "Hilos");

            migrationBuilder.DropColumn(
                name: "Votos",
                table: "Hilos");
        }
    }
}
