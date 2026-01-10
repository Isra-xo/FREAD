# FREAD

FREAD es un proyecto que parece estar compuesto por varios componentes, incluyendo un frontend basado en React y otras herramientas. El propósito principal del proyecto es ofrecer funcionalidades tipo foro, como puede inferirse por el nombre de la carpeta `foro-frontend`.

## Descripción del Proyecto

- **Frontend:** La carpeta `foro-frontend` contiene la aplicación principal creada con React, y utiliza librerías modernas para el desarrollo de interfaces web interactivas.
- **Backend/Modelos:** Existen carpetas como `GeneradorDeModelos` que sugieren la existencia de lógica para modelos, probablemente desarrollados en C# (el lenguaje principal del repositorio).
- **Gestión de dependencias:** El proyecto utiliza `npm` para la gestión de dependencias en el frontend y posiblemente también para utilidades comunes.

## Requisitos para ejecutar el proyecto

### 1. Clonar el repositorio

Abre tu terminal y ejecuta:
```bash
git clone https://github.com/Isra-xo/FREAD.git
cd FREAD
```

### 2. Instalación de dependencias del frontend

Ve a la carpeta del frontend y ejecuta la instalación de dependencias:
```bash
cd foro-frontend
npm install
```

#### Principales dependencias usadas:
- `react` y `react-dom` (v19.x)
- `react-router-dom` (v7.9.3)
- `axios` para llamadas a APIs
- `jwt-decode` para manejo de tokens JWT
- Librerías de testing: `@testing-library/react`, `jest-dom`, `user-event`, etc.

### 3. Ejecutar el frontend

Una vez instaladas las dependencias, puedes iniciar la aplicación con:
```bash
npm start
```

Esto levantará el servidor de desarrollo y podrás acceder a la app desde tu navegador en la dirección (por defecto): [http://localhost:3000](http://localhost:3000)

### 4. Backend / Modelos

Si el proyecto también incluye un backend o generación de modelos en C#, necesitarás tener instalado:
- **.NET SDK** (recomendado .NET 6 o superior)
- Un editor compatible, como Visual Studio o VS Code

Para compilar y correr la solución:
```bash
# Desde la raíz del repo
dotnet build GeneradorDeModelos.slnx
dotnet run --project GeneradorDeModelos
```
Asegúrate de adaptar estos comandos si la estructura de los proyectos cambia.

## Estructura del repositorio

- `.vs/`: Configuración de Visual Studio
- `GeneradorDeModelos/`: Backend o lógica de modelos en C#
- `GeneradorDeModelos.slnx`: Solución para Visual Studio
- `foro-frontend/`: Aplicación frontend en React
- `package.json`: Dependencias principales (común)
- `foro-frontend/package.json`: Dependencias específicas del frontend

## Notas adicionales

- Si tienes dudas sobre el entorno o configuración, revisa los archivos `package.json` y la documentación interna del repo.
- Si agregas nuevas dependencias, recuerda ejecutar `npm install` nuevamente.

---
