# GestiObra – Landing Page

Landing page de GestiObra, herramienta de gestión de obra para instaladores técnicos.

## Stack

- [Vite](https://vite.dev/) + React
- [Tailwind CSS v4](https://tailwindcss.com/) (vía `@tailwindcss/vite`)

## Estructura

```
src/
  components/   Navbar, Hero, Benefits, Footer
  assets/       recursos estáticos (imágenes, iconos)
  App.jsx       ensambla la landing page
  index.css     import de Tailwind
```

## Cómo ejecutar el proyecto

```bash
npm install
npm run dev
```

Esto abrirá el servidor de desarrollo (por defecto en `http://localhost:5173`,
o el siguiente puerto libre si ya está ocupado).

## Build de producción

```bash
npm run build
npm run preview
```
