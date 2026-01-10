using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace GeneradorDeModelos.Models;

public partial class FreadContext : DbContext
{
    public FreadContext()
    {
    }

    public FreadContext(DbContextOptions<FreadContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Foro> Foros { get; set; }
    public virtual DbSet<Hilo> Hilos { get; set; }
    public virtual DbSet<MenuItem> MenuItems { get; set; }
    public virtual DbSet<Post> Posts { get; set; }
    public virtual DbSet<Role> Roles { get; set; }
    public virtual DbSet<Usuario> Usuarios { get; set; }

    // --- LÍNEA AÑADIDA ---
    public virtual DbSet<Comentario> Comentarios { get; set; }
    
    // --- NUEVA ENTIDAD PARA SISTEMA DE VOTOS ---
    public virtual DbSet<Voto> Votos { get; set; }

    // OnConfiguring eliminado - La connection string se configura mediante inyección de dependencias en Program.cs
    // Esto previene que se exponga información sensible en el código fuente

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Foro>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Foros__3214EC27D3A72AD3");

            entity.Property(e => e.Id).HasColumnName("ID");
            entity.Property(e => e.Descripcion).HasMaxLength(255);
            entity.Property(e => e.NombreForo).HasMaxLength(100);

            entity.HasOne(d => d.Usuario).WithMany(p => p.Foros)
                .HasForeignKey(d => d.UsuarioId)
                .HasConstraintName("FK_Foros_Usuarios");
        });

        modelBuilder.Entity<Hilo>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Hilos__3214EC2783A4929C");

            entity.Property(e => e.Id).HasColumnName("ID");
            entity.Property(e => e.FechaCreacion).HasDefaultValueSql("(sysdatetimeoffset())");
            entity.Property(e => e.ForoId).HasColumnName("ForoID");
            entity.Property(e => e.Titulo).HasMaxLength(150);
            entity.Property(e => e.UsuarioId).HasColumnName("UsuarioID");

            entity.HasOne(d => d.Foro).WithMany(p => p.Hilos)
                .HasForeignKey(d => d.ForoId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Hilos__ForoID__6754599E");

            entity.HasOne(d => d.Usuario).WithMany(p => p.Hilos)
                .HasForeignKey(d => d.UsuarioId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Hilos__UsuarioID__68487DD7");
        });

        modelBuilder.Entity<MenuItem>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__MenuItem__3214EC270DFECBCF");

            entity.Property(e => e.Id).HasColumnName("ID");
            entity.Property(e => e.Icono).HasMaxLength(50);
            entity.Property(e => e.Titulo).HasMaxLength(50);
            entity.Property(e => e.Url).HasMaxLength(200);
        });

        modelBuilder.Entity<Post>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Posts__3214EC27AF5FF2BC");

            entity.Property(e => e.Id).HasColumnName("ID");
            entity.Property(e => e.FechaCreacion).HasDefaultValueSql("(sysdatetimeoffset())");
            entity.Property(e => e.HiloId).HasColumnName("HiloID");
            entity.Property(e => e.UsuarioId).HasColumnName("UsuarioID");

            entity.HasOne(d => d.Hilo).WithMany(p => p.Posts)
                .HasForeignKey(d => d.HiloId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Posts__HiloID__6C190EBB");

            entity.HasOne(d => d.Usuario).WithMany(p => p.Posts)
                .HasForeignKey(d => d.UsuarioId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Posts__UsuarioID__6D0D32F4");
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Roles__3214EC272D12B82D");

            entity.Property(e => e.Id).HasColumnName("ID");
            entity.Property(e => e.NombreRol).HasMaxLength(50);

            entity.HasMany(d => d.MenuItems).WithMany(p => p.Rols)
                .UsingEntity<Dictionary<string, object>>(
                    "RolMenuItemPermiso",
                    r => r.HasOne<MenuItem>().WithMany()
                        .HasForeignKey("MenuItemId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK__Rol_MenuI__MenuI__72C60C4A"),
                    l => l.HasOne<Role>().WithMany()
                        .HasForeignKey("RolId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK__Rol_MenuI__RolID__71D1E811"),
                    j =>
                    {
                        j.HasKey("RolId", "MenuItemId").HasName("PK__Rol_Menu__C1B73DA11E4A5809");
                        j.ToTable("Rol_MenuItem_Permisos");
                        j.IndexerProperty<int>("RolId").HasColumnName("RolID");
                        j.IndexerProperty<int>("MenuItemId").HasColumnName("MenuItemID");
                    });
        });

        modelBuilder.Entity<Usuario>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Usuarios__3214EC2753326430");

            entity.HasIndex(e => e.NombreUsuario, "UQ__Usuarios__6B0F5AE081C744C4").IsUnique();

            entity.HasIndex(e => e.Email, "UQ__Usuarios__A9D105345F54D739").IsUnique();

            entity.Property(e => e.Id).HasColumnName("ID");
            entity.Property(e => e.Email).HasMaxLength(100);
            entity.Property(e => e.FechaRegistro).HasDefaultValueSql("(sysdatetimeoffset())");
            entity.Property(e => e.NombreUsuario).HasMaxLength(50);
            entity.Property(e => e.PasswordHash).HasMaxLength(255);
            entity.Property(e => e.RolId).HasColumnName("RolID");

            entity.HasOne(d => d.Rol).WithMany(p => p.Usuarios)
                .HasForeignKey(d => d.RolId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Usuarios__RolID__619B8048");
        });

        // Configuración de la entidad Voto
        modelBuilder.Entity<Voto>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Votos__3214EC27");

            entity.Property(e => e.Id).HasColumnName("ID");
            entity.Property(e => e.UsuarioId).HasColumnName("UsuarioID");
            entity.Property(e => e.HiloId).HasColumnName("HiloID");
            entity.Property(e => e.FechaVoto).HasDefaultValueSql("(sysdatetimeoffset())");

            // Índice único compuesto para prevenir múltiples votos del mismo usuario en el mismo hilo
            entity.HasIndex(e => new { e.UsuarioId, e.HiloId })
                .IsUnique()
                .HasDatabaseName("IX_Votos_UsuarioId_HiloId");

            entity.HasOne(d => d.Usuario).WithMany()
                .HasForeignKey(d => d.UsuarioId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_Votos_Usuarios");

            entity.HasOne(d => d.Hilo).WithMany()
                .HasForeignKey(d => d.HiloId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_Votos_Hilos");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}