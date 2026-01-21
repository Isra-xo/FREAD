using GeneradorDeModelos.Models;
using GeneradorDeModelos.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Text.Json.Serialization; 

var builder = WebApplication.CreateBuilder(args);

// --- SECCI�N 1: SERVICIOS ---

// A�adimos AddJsonOptions para evitar errores de referencia circular
builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
});

builder.Services.AddDbContext<FreadContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"),
    sqlServerOptionsAction: sqlOptions =>
    {
        // Esta línea es la que soluciona el error transitorio
        sqlOptions.EnableRetryOnFailure(
            maxRetryCount: 5,
            maxRetryDelay: TimeSpan.FromSeconds(30),
            errorNumbersToAdd: null);
    }));

// Registrar servicios de la capa de negocio
builder.Services.AddScoped<IHiloService, HiloService>();
builder.Services.AddScoped<IForoService, ForoService>();
builder.Services.AddScoped<IUsuarioService, UsuarioService>();
builder.Services.AddScoped<IVoteService, VoteService>();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configurar OutputCache (Phase 9: Menu caching)
builder.Services.AddOutputCache(options =>
{
    options.DefaultExpirationTimeSpan = TimeSpan.FromSeconds(60);
});

// 🔵 Configurar Distributed Caching (Phase 10: Notificaciones + datos temporales)
// En desarrollo usamos in-memory, en producción cambiar a Redis/NCache
builder.Services.AddDistributedMemoryCache();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration.GetSection("AppSettings:Token").Value)),
            ValidateIssuer = false,
            ValidateAudience = false
        };
    });

// Configurar políticas de autorización
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy =>
        policy.RequireRole("Administrador"));
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("MyCorsPolicy", policy =>
    {
        policy.WithOrigins(
                "http://localhost:3000", // Para desarrollo local
                "https://kind-meadow-021d0e11e.4.azurestaticapps.net" // Tu frontend en Azure
              )
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); // Importante para el manejo de sesiones y cookies si aplica
    });
});


var app = builder.Build();

// --- SECCI�N 2: PIPELINE ---
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Mi API v1");
        c.RoutePrefix = string.Empty; // Swagger UI en la ra�z "/"
    });
}

app.UseCors("MyCorsPolicy");
app.UseOutputCache(); // Middleware de OutputCache debe ir antes de UseAuthentication
// 🔵 HybridCache no necesita middleware explícito, funciona via DI
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();
