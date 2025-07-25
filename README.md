# NETFOX - Clon de Netflix

Una aplicación web que replica la funcionalidad y diseño de Netflix, construida con React y Node.js.

## Características

- 🔐 **Autenticación de usuarios** - Registro e inicio de sesión
- 🎬 **Catálogo de películas** - Navegación por contenido
- 🔍 **Búsqueda inteligente** - Buscar por nombre de película
- 📂 **Filtros por categoría** - Organización por géneros
- 📱 **Diseño responsivo** - Estilo idéntico a Netflix
- ▶️ **Reproductor de video** - Videos de YouTube integrados

## Tecnologías Utilizadas

### Frontend
- React 19
- React Router DOM
- Axios
- CSS3 con variables personalizadas

### Backend
- Node.js
- Express.js
- MySQL
- JWT para autenticación
- bcryptjs para encriptación

## Instalación y Configuración

### Prerrequisitos
- Node.js (v16 o superior)
- MySQL Server
- npm o yarn

### 1. Configurar la Base de Datos

1. Instala y ejecuta MySQL Server
2. Ejecuta el script SQL ubicado en `server/database.sql`

### 2. Configurar el Servidor

1. Navega a la carpeta del servidor:
```bash
cd server
npm install
npm start
```

### 3. Configurar el Cliente

1. En la carpeta raíz:
```bash
npm install
npm run dev
```

## Uso

1. Visita `http://localhost:5173`
2. Regístrate o inicia sesión
3. Explora el catálogo de películas
4. Usa la búsqueda y filtros
5. Haz clic en cualquier película para ver el trailer

## API Endpoints

- `POST /api/register` - Registro
- `POST /api/login` - Login
- `GET /api/movies` - Todas las películas
- `GET /api/movies/search?q=query` - Búsqueda
- `GET /api/movies/category/:category` - Por categoría
- `GET /api/featured` - Película destacada

**¡Disfruta tu clon de Netflix! 🎬🍿**

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
