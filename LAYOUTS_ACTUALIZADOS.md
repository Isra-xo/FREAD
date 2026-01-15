# 🎨 Layouts Actualizados - Arquitectura de Componentes Flexible

**Fecha:** Enero 14, 2026  
**Estado:** ✅ COMPLETADO

---

## 📋 Resumen Ejecutivo

Se ha rediseñado la estructura de layouts para los 3 componentes principales siguiendo **principios de diseño centrado y responsive**:

- ✅ **HomePage**: Layout Flexbox con feed de 800px máx + sidebar 25%
- ✅ **CreateHiloPage**: Formulario centrado con scroll natural
- ✅ **CreateForoPage**: Formulario + preview centrados con scroll natural
- ✅ **Sidebar**: 25% del ancho en desktop, oculto en móviles (<768px)

---

## 🎯 Reglas de Diseño Implementadas

### 1️⃣ Centrado Absoluto
```css
max-width: 1200px;
margin: 0 auto;
padding: 20px;
```

### 2️⃣ PostCard Proporciones
- Feed ancho máximo: **800px**
- Permite expansión natural sin estirarse en monitores grandes
- Mantiene proporciones de "tarjeta" del PDF

### 3️⃣ Scroll Natural del Navegador
```css
min-height: calc(100vh - 70px);  /* Para páginas de creación */
/* NO height: 100vh, NO overflow: hidden */
```

### 4️⃣ Sidebar Responsive
- **Desktop**: Ocupa 25% del ancho (flex: 0 0 25%)
- **Móviles (<768px)**: display: none

---

## 📝 CSS Actualizado

### 1. HomePage.css

#### Container Principal
```css
.home-container {
    display: flex;
    gap: 32px;
    max-width: 1200px;
    margin: 0 auto;
    padding: 24px;
    box-sizing: border-box;
}
```

#### Feed Principal
```css
.posts-feed {
    flex: 0 1 800px;  /* Ancho máximo 800px, flex para responsive */
    display: flex;
    flex-direction: column;
    gap: 16px;
}
```

#### Sidebar (25% del ancho)
```css
.sidebar {
    flex: 0 0 25%;  /* 25% del ancho, sin shrink */
    display: flex;
    flex-direction: column;
    gap: 16px;
    position: sticky;
    top: 90px;
    max-height: calc(100vh - 110px);
    overflow-y: auto;
    padding-right: 8px;
}
```

#### Responsive (Móviles)
```css
@media (max-width: 768px) {
    .home-container {
        flex-direction: column;
        gap: 16px;
        padding: 12px;
    }
    
    .posts-feed {
        flex: 1;
        max-width: 100%;
    }
    
    .sidebar {
        display: none;  /* Ocultar sidebar en móviles */
    }
}
```

---

### 2. CreateHiloPage.css

#### Wrapper Principal
```css
.create-hilo-wrapper {
    display: flex;
    align-items: flex-start;
    justify-content: center;
    min-height: calc(100vh - 70px);  /* Scroll natural */
    padding: 24px;
    background: linear-gradient(135deg, rgba(18, 18, 18, 0.8), rgba(31, 41, 55, 0.5));
    padding-top: max(24px, calc(24px));
}

.create-hilo-container {
    width: 100%;
    max-width: 800px;  /* Centrado con límite máximo */
    padding: 40px;
    background: linear-gradient(135deg, rgba(31, 41, 55, 0.4), rgba(31, 41, 55, 0.2));
    border: 1.5px solid rgba(147, 51, 234, 0.25);
    border-radius: 16px;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    box-shadow: 
        0 8px 32px rgba(0, 0, 0, 0.3),
        0 0 40px rgba(147, 51, 234, 0.1),
        inset 0 0 1px rgba(255, 255, 255, 0.1);
    animation: slideUp 0.5s ease-out;
    height: auto;
    margin-top: 20px;
    margin-bottom: 40px;
}
```

#### Cambios Clave
- ✅ `min-height: calc(100vh - 70px)` en lugar de `100vh`
- ✅ `max-width: 800px` para centrado
- ✅ Removed `padding-top: max(40px, calc(100px + 24px))`
- ✅ Los botones de "Publicar" son siempre accesibles con scroll

---

### 3. CreateForoPage.css

#### Wrapper Principal
```css
.create-foro-wrapper {
    display: flex;
    align-items: flex-start;
    justify-content: center;
    min-height: calc(100vh - 70px);  /* Scroll natural */
    padding: 40px 24px;
    background: linear-gradient(135deg, rgba(18, 18, 18, 0.8), rgba(31, 41, 55, 0.5));
}

.create-foro-content {
    display: grid;
    grid-template-columns: 1.5fr 1fr;  /* Desktop: Formulario 60%, Preview 40% */
    gap: 32px;
    width: 100%;
    max-width: 1200px;
    margin-bottom: 40px;
}
```

#### Responsive (Móviles)
```css
@media (max-width: 768px) {
    .create-foro-wrapper {
        padding: 16px 12px;
        min-height: calc(100vh - 70px);
    }

    .create-foro-content {
        grid-template-columns: 1fr;  /* Una columna en móviles */
        gap: 16px;
        max-width: 100%;
    }
}

@media (max-width: 480px) {
    .preview-container {
        display: none;  /* Ocultar preview en dispositivos muy pequeños */
    }
}
```

#### Cambios Clave
- ✅ `min-height: calc(100vh - 70px)` en lugar de `100vh`
- ✅ Removed `padding-top: max(40px, calc(100px + 40px))`
- ✅ Grid responsive: 2 columnas → 1 columna en tablets
- ✅ Preview se oculta en móviles muy pequeños

---

## 🔄 Comparativa Antes vs Después

| Aspecto | Antes | Después |
|---------|-------|---------|
| Layout HomePage | Grid 12 columnas | Flexbox centrado |
| Feed ancho | 9/12 (variable) | 800px máximo |
| Sidebar | 3/12 (variable) | 25% del ancho |
| CreateHilo altura | `min-height: 100vh` | `calc(100vh - 70px)` |
| CreateForo altura | `min-height: 100vh` | `calc(100vh - 70px)` |
| Padding top CrearHilo | `calc(100px + 24px)` | `24px` |
| Padding top CrearForo | `calc(100px + 40px)` | Sin exceso |
| Scroll navegador | ❌ Oculto en partes | ✅ Natural siempre |
| Botones "Publicar" | ❌ Ocultos al fondo | ✅ Siempre accesibles |

---

## 📊 Casos de Uso

### 🖥️ Desktop (>1024px)
- HomePage: Feed 800px + Sidebar 25%
- CreateHilo: Formulario centrado 800px
- CreateForo: Formulario 60% + Preview 40% centrados

### 📱 Tablet (768px - 1024px)
- HomePage: Feed 100% (sidebar oculto)
- CreateHilo: Formulario 100%
- CreateForo: Formulario 100% (preview abajo)

### 📲 Mobile (<768px)
- HomePage: Feed 100% (sidebar oculto)
- CreateHilo: Formulario 100%
- CreateForo: Solo formulario (preview oculto)

---

## ✨ Beneficios

1. **Centrado Absoluto**: Todos los contenidos usan `max-width` y `margin: 0 auto`
2. **Scroll Natural**: El navegador controla el scroll, botones siempre accesibles
3. **ProporcIones Correctas**: PostCard mantiene ancho máximo 800px
4. **Responsive**: Sidebar 25% desktop, oculto en móviles
5. **Diseño PDF Compatible**: Coincide con la ubicación centralizada del PDF

---

## 🎬 Archivos Modificados

- ✅ `src/pages/HomePage.css`
- ✅ `src/pages/CreateHiloPage.css`
- ✅ `src/pages/CreateForoPage.css`
- ✅ `src/components/Sidebar.css` (estilos de widgets mantenidos)

---

## 🧪 Testing Recomendado

1. **Desktop (1920px)**: Verificar centrado y proporciones
2. **Tablet (768px)**: Sidebar debe desaparecer
3. **Mobile (375px)**: Layout single column
4. **Scroll**: Boton "Publicar" accesible en todas las páginas
5. **Sticky Sidebar**: Debe ser sticky en desktop (HomePage)

---

## 📞 Contacto / Soporte

Para cambios futuros en los layouts, referirse a estos principios:
- Mantener `max-width: 1200px` en contenedores principales
- Usar `min-height: calc(100vh - 70px)` para scroll natural
- Feed máximo 800px de ancho
- Sidebar 25% en desktop, display: none en móviles <768px
