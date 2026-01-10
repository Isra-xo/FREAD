using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GeneradorDeModelos.Migrations
{
    /// <inheritdoc />
    public partial class AddRowVersionToHilo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "Hilos",
                type: "rowversion",
                rowVersion: true,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "Hilos");
        }
    }
}
