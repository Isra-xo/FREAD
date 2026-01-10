using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GeneradorDeModelos.Migrations
{
    /// <inheritdoc />
    public partial class CreateVotoTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Votos",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UsuarioID = table.Column<int>(type: "int", nullable: false),
                    HiloID = table.Column<int>(type: "int", nullable: false),
                    Valor = table.Column<int>(type: "int", nullable: false),
                    FechaVoto = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false, defaultValueSql: "(sysdatetimeoffset())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Votos__3214EC27", x => x.ID);
                    table.ForeignKey(
                        name: "FK_Votos_Hilos",
                        column: x => x.HiloID,
                        principalTable: "Hilos",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Votos_Usuarios",
                        column: x => x.UsuarioID,
                        principalTable: "Usuarios",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Votos_HiloID",
                table: "Votos",
                column: "HiloID");

            migrationBuilder.CreateIndex(
                name: "IX_Votos_UsuarioId_HiloId",
                table: "Votos",
                columns: new[] { "UsuarioID", "HiloID" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Votos");
        }
    }
}
