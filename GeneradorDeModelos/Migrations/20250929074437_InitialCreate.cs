using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GeneradorDeModelos.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "MenuItems",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Titulo = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Url = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Icono = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__MenuItem__3214EC270DFECBCF", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "Roles",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NombreRol = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Roles__3214EC272D12B82D", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "Rol_MenuItem_Permisos",
                columns: table => new
                {
                    RolID = table.Column<int>(type: "int", nullable: false),
                    MenuItemID = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Rol_Menu__C1B73DA11E4A5809", x => new { x.RolID, x.MenuItemID });
                    table.ForeignKey(
                        name: "FK__Rol_MenuI__MenuI__72C60C4A",
                        column: x => x.MenuItemID,
                        principalTable: "MenuItems",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK__Rol_MenuI__RolID__71D1E811",
                        column: x => x.RolID,
                        principalTable: "Roles",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateTable(
                name: "Usuarios",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Email = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    NombreUsuario = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    FechaRegistro = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true, defaultValueSql: "(sysdatetimeoffset())"),
                    RolID = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Usuarios__3214EC2753326430", x => x.ID);
                    table.ForeignKey(
                        name: "FK__Usuarios__RolID__619B8048",
                        column: x => x.RolID,
                        principalTable: "Roles",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateTable(
                name: "Foros",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NombreForo = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Descripcion = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    UsuarioId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Foros__3214EC27D3A72AD3", x => x.ID);
                    table.ForeignKey(
                        name: "FK_Foros_Usuarios",
                        column: x => x.UsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateTable(
                name: "Hilos",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Titulo = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    FechaCreacion = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true, defaultValueSql: "(sysdatetimeoffset())"),
                    ForoID = table.Column<int>(type: "int", nullable: false),
                    UsuarioID = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Hilos__3214EC2783A4929C", x => x.ID);
                    table.ForeignKey(
                        name: "FK__Hilos__ForoID__6754599E",
                        column: x => x.ForoID,
                        principalTable: "Foros",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK__Hilos__UsuarioID__68487DD7",
                        column: x => x.UsuarioID,
                        principalTable: "Usuarios",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateTable(
                name: "Comentarios",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Contenido = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UsuarioId = table.Column<int>(type: "int", nullable: false),
                    HiloId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Comentarios", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Comentarios_Hilos_HiloId",
                        column: x => x.HiloId,
                        principalTable: "Hilos",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Comentarios_Usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Posts",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ContenidoMensaje = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FechaCreacion = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true, defaultValueSql: "(sysdatetimeoffset())"),
                    HiloID = table.Column<int>(type: "int", nullable: false),
                    UsuarioID = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Posts__3214EC27AF5FF2BC", x => x.ID);
                    table.ForeignKey(
                        name: "FK__Posts__HiloID__6C190EBB",
                        column: x => x.HiloID,
                        principalTable: "Hilos",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK__Posts__UsuarioID__6D0D32F4",
                        column: x => x.UsuarioID,
                        principalTable: "Usuarios",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Comentarios_HiloId",
                table: "Comentarios",
                column: "HiloId");

            migrationBuilder.CreateIndex(
                name: "IX_Comentarios_UsuarioId",
                table: "Comentarios",
                column: "UsuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_Foros_UsuarioId",
                table: "Foros",
                column: "UsuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_Hilos_ForoID",
                table: "Hilos",
                column: "ForoID");

            migrationBuilder.CreateIndex(
                name: "IX_Hilos_UsuarioID",
                table: "Hilos",
                column: "UsuarioID");

            migrationBuilder.CreateIndex(
                name: "IX_Posts_HiloID",
                table: "Posts",
                column: "HiloID");

            migrationBuilder.CreateIndex(
                name: "IX_Posts_UsuarioID",
                table: "Posts",
                column: "UsuarioID");

            migrationBuilder.CreateIndex(
                name: "IX_Rol_MenuItem_Permisos_MenuItemID",
                table: "Rol_MenuItem_Permisos",
                column: "MenuItemID");

            migrationBuilder.CreateIndex(
                name: "IX_Usuarios_RolID",
                table: "Usuarios",
                column: "RolID");

            migrationBuilder.CreateIndex(
                name: "UQ__Usuarios__6B0F5AE081C744C4",
                table: "Usuarios",
                column: "NombreUsuario",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "UQ__Usuarios__A9D105345F54D739",
                table: "Usuarios",
                column: "Email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Comentarios");

            migrationBuilder.DropTable(
                name: "Posts");

            migrationBuilder.DropTable(
                name: "Rol_MenuItem_Permisos");

            migrationBuilder.DropTable(
                name: "Hilos");

            migrationBuilder.DropTable(
                name: "MenuItems");

            migrationBuilder.DropTable(
                name: "Foros");

            migrationBuilder.DropTable(
                name: "Usuarios");

            migrationBuilder.DropTable(
                name: "Roles");
        }
    }
}
