# FREAD

FREAD es un proyecto que integra una aplicación frontend (React) junto con herramientas/servicios relacionados (por ejemplo, generación de modelos en C#). El objetivo del repositorio es ofrecer una plataforma para un foro/aplicación web con componentes frontend y código backend/auxiliar.


## Contenido rápido

- Descripción general
- Requisitos
- Instalación (clonado y dependencias)
- Ejecutar en desarrollo (frontend y backend/modelos)
- Construir para producción
- Variables de entorno y configuración
- Estructura importante del repositorio
- Tests y linters
- Despliegue / Docker (guía breve)
- Contribuir
- Resolución de problemas comunes
- Contacto y licencia

---

## Descripción del proyecto

- Frontend: carpeta `foro-frontend` — aplicación creada con Create React App (React 18/19 según dependencias).
- Backend/Modelos: carpeta `GeneradorDeModelos` — contiene artefactos/solución en C# (.NET) para generación de modelos o lógica del lado servidor.
- Otros archivos: `package.json` en la raíz (si existe) y `foro-frontend/package.json` con dependencias del frontend.

---

## Requisitos

- Node.js (recomendado >= 18.x) y npm (recomendado 9) — para el frontend.
- .NET SDK (recomendado .NET 6 o superior) — para proyectos en `GeneradorDeModelos` si quieres compilar/ejecutar C#.
- Git — para clonar el repositorio.
- Navegador moderno para probar la app (Chrome, Firefox, Edge).

(Opcional) Docker si prefieres contenerizar los servicios.

---

## 1) Clonar el repositorio (instrucciones originales conservadas)

Abre tu terminal y ejecuta:

```bash
git clone https://github.com/Isra-xo/FREAD.git
cd FREAD
```

---

## 2) Instalación y ejecutar el frontend

El frontend está en `foro-frontend`.

Instalar dependencias:

```bash
cd foro-frontend
npm install
```

Ejecutar en modo desarrollo:

```bash
npm start
```

Por defecto se abrirá en: http://localhost:3000

Scripts disponibles (desde `foro-frontend`):
- `npm start` — desarrollo
- `npm test` — tests (si están implementados)
- `npm run build` — construcción para producción
- `npm run eject` — eject (irreversible)

En caso de que haya un `package.json` en la raíz y necesites instalar dependencias globales o utilidades, vuelve a la raíz y ejecuta `npm install` allí también.

---

## 3) Backend / GeneradorDeModelos (C# / .NET)

Si deseas compilar/ejecutar la parte en C# (si existe):

Requisitos: .NET SDK 6+ (o la versión que el proyecto requiera).

Desde la raíz del repo (adapta nombre de solución/proyecto si cambia):

```bash
# ejemplo, verificar el nombre correcto del .sln/.csproj en la carpeta
dotnet build GeneradorDeModelos.slnx
dotnet run --project GeneradorDeModelos
```

Notas:
- Si la solución tiene extensión diferente (.sln) o varios proyectos, abre Visual Studio/VS Code y carga la solución correspondiente.
- Comprueba los archivos `.csproj` y la solución para identificar el punto de entrada correcto.

---

## 4) Variables de entorno y configuración

Frontend (React)
- Para cambiar la URL de la API u otras configuraciones, crea un archivo `.env.local` dentro de `foro-frontend/` con variables que empiecen por `REACT_APP_`, por ejemplo:
  ```
  REACT_APP_API_URL=http://localhost:5000/api
  REACT_APP_OTHER_KEY=valor
  ```
- Reinicia `npm start` después de modificar variables.

Backend (.NET)
- Usa `appsettings.json` y `appsettings.Development.json` para configurar cadenas de conexión y otros valores. También puedes usar variables de entorno del sistema.

---

## 5) Construcción para producción (frontend)

Desde `foro-frontend`:

```bash
npm run build
```

Esto genera la carpeta `build/` con el contenido listo para desplegar (servir con Nginx, Apache, Netlify, Vercel, o integrado en una API backend).

---

## 6) Estructura del repositorio (resumen)

- `.vs/` — configuración de Visual Studio (puede estar en .gitignore)
- `GeneradorDeModelos/` — proyectos C# / .NET
- `GeneradorDeModelos.slnx` — solución (verificar extensión en el repo)
- `foro-frontend/` — aplicación React (Create React App)
- `package.json` — dependencias globales (si existe en raíz)
- `README.md` — este archivo

Asegúrate de revisar dentro de cada carpeta para archivos README adicionales (por ejemplo `foro-frontend/README.md`).

---

## 7) Tests y linters

- Frontend: puede usar `@testing-library/react` y otros paquetes; ejecuta `npm test` desde `foro-frontend`.
- Añade linters (ESLint, Prettier) si aún no están configurados para mantener estilo consistente.

---

## 8) Despliegue y Docker (guía rápida)

Despliegue frontend:
- Construye `npm run build` y sirve los archivos estáticos con Nginx o con un servicio estático (Netlify, Vercel).

Ejemplo simple con Docker para el frontend (opcional):

Dockerfile (ejemplo minimal):
```dockerfile
FROM node:18 AS build
WORKDIR /app
COPY foro-frontend/package*.json ./foro-frontend/
RUN cd foro-frontend && npm install
COPY . .
RUN cd foro-frontend && npm run build

FROM nginx:alpine
COPY --from=build /app/foro-frontend/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Ajusta según estructura y necesidades.

---

## 9) Contribuir

- Lee y añade un archivo CONTRIBUTING.md si vas a aceptar contribuciones.
- Flujo recomendado:
  - Crea una rama nueva: `git checkout -b feature/mi-cambio`
  - Haz commits claros y descriptivos
  - Abre Pull Request indicando lo que cambia y por qué
- Añade Issues para bugs o mejoras y asigna etiquetas/descríbelo claramente.

---

## 10) Resolución de problemas comunes

- Problema: `npm start` no inicia / puerto ocupado:
  - Asegúrate de que no haya otro proceso usando el puerto 3000.
  - Usa `PORT=3001 npm start` para cambiar el puerto.
- Problema: errores de dependencias / lockfile:
  - Elimina `node_modules` y `package-lock.json` y vuelve a ejecutar `npm install`.
- Problema: `dotnet build` falla:
  - Comprueba la versión del SDK con `dotnet --version`.
  - Asegúrate de que las rutas y nombres de solución/proyecto sean correctos.
