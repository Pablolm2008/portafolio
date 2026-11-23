# Portafolio F1 · Pablo López Monzón (v2)

React + Vite, con sonido de motor F1 sintetizado con Web Audio API.

## Requisitos
- Node.js 20.19 o superior (requerido por Vite 7)

## Instalación y uso
```bash
npm install
npm run dev      # desarrollo en http://localhost:5173
npm run build    # genera dist/ listo para publicar
npm run preview  # revisa el build de producción
```

## Estructura
```
src/
  App.jsx                 Estado global: sonido, sección activa, progreso
  main.jsx                Punto de entrada
  audio/engine.js         Motor de sonido (semáforo, motor, cambio de marcha, DRS, radio, tick)
  components/             Una pieza por sección (Hero, Portada, About, Stack, Projects, Contact...)
  data/                   Proyectos, tecnologías, galería y perfil (editar aquí el contenido)
  styles.css              Estilos (heredados del diseño original + bloques nuevos)
public/assets/            Imágenes optimizadas en WebP
```

## Dónde editar el contenido
- Proyectos: `src/data/projects.js`
- Tecnologías y puntuación: `src/data/stack.js`
- Galería de la portada: `src/data/gallery.js`
- Datos de contacto y enfoque profesional: `src/data/profile.js`

## Sonido
- Todos los efectos se generan en el navegador: no hay archivos de audio que licenciar.
- El audio solo se activa tras una interacción del usuario (requisito de los navegadores).
- La preferencia se guarda en `localStorage` con la clave `f1-sound`.
- El botón **SONIDO ON/OFF** del encabezado cambia el estado en cualquier momento.
