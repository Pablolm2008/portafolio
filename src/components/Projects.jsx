import { useRef, useState } from 'react';
import { projects } from '../data/projects.js';
import ProjectModal from './ProjectModal.jsx';
import { playDRS } from '../audio/engine.js';

const GAP = 22;

export default function Projects() {
  const trackRef = useRef(null);
  const [index, setIndex] = useState(0);
  const [active, setActive] = useState(null);
  const drag = useRef({ down: false, startX: 0, startScroll: 0, moved: false });
  const suppressClick = useRef(false);

  const cardDistance = () => {
    const track = trackRef.current;
    const card = track?.querySelector('.project-card');
    return card ? card.getBoundingClientRect().width + GAP : track?.clientWidth ?? 0;
  };

  const step = direction => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: cardDistance() * direction, behavior: 'smooth' });
    playDRS();
  };

  const onScroll = () => {
    const track = trackRef.current;
    const distance = cardDistance();
    if (!track || !distance) return;
    const next = Math.min(projects.length - 1, Math.max(0, Math.round(track.scrollLeft / distance)));
    setIndex(next);
  };

  // Arrastre con mouse. Con trackpad o rueda se usa el scroll nativo (sin secuestrar la página).
  const onPointerDown = event => {
    if (event.pointerType !== 'mouse') return;
    drag.current = { down: true, startX: event.clientX, startScroll: trackRef.current.scrollLeft, moved: false };
    trackRef.current.classList.add('is-dragging');
  };

  const onPointerMove = event => {
    const state = drag.current;
    if (!state.down) return;
    const delta = event.clientX - state.startX;
    if (Math.abs(delta) > 5) state.moved = true;
    trackRef.current.scrollLeft = state.startScroll - delta;
  };

  const endDrag = () => {
    const state = drag.current;
    if (!state.down) return;
    state.down = false;
    trackRef.current?.classList.remove('is-dragging');
    if (state.moved) {
      suppressClick.current = true;
      window.setTimeout(() => { suppressClick.current = false; }, 80);
    }
  };

  const onTrackKey = event => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      step(1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      step(-1);
    }
  };

  const openProject = project => {
    if (suppressClick.current) return;
    setActive(project);
  };

  return (
    <section className="section projects" id="proyectos">
      <div className="container">
        <div className="projects__head reveal">
          <div>
            <p className="kicker">04 / PROJECTS</p>
            <h2 className="section-title">PROYECTOS</h2>
            <p className="section-sub">Cambia de marcha para ver cada caso. Abre uno para ver su ficha completa.</p>
          </div>
          <div className="projects__counter">
            <strong>{String(index + 1).padStart(2, '0')}</strong>
            <span>/</span>
            <span>{String(projects.length).padStart(2, '0')}</span>
          </div>
        </div>

        <div
          className="projects__viewport"
          ref={trackRef}
          tabIndex={0}
          aria-label="Carrusel de proyectos. Usa las flechas izquierda y derecha para cambiar."
          onScroll={onScroll}
          onKeyDown={onTrackKey}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerLeave={endDrag}
          onPointerCancel={endDrag}
        >
          {projects.map(project => (
            <article
              key={project.num}
              className="project-card"
              tabIndex={0}
              role="button"
              aria-label={`Abrir ficha de ${project.title}`}
              onClick={() => openProject(project)}
              onKeyDown={event => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  setActive(project);
                }
              }}
            >
              <div className="project-card__media">
                <img src={project.image} alt={`Imagen del proyecto ${project.title}`} loading="lazy" decoding="async" />
                <span className="project-card__num">{project.num}</span>
              </div>
              <div className="project-card__body">
                <p className="kicker">{project.num} / {project.category}</p>
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                <div className="tags">
                  {project.tech.map(tech => <span className="tag" key={tech}>{tech}</span>)}
                </div>
                <span className="project-card__cta">VER FICHA →</span>
              </div>
            </article>
          ))}

          <a className="more-card" href="https://github.com/Pablolm2008?tab=repositories" target="_blank" rel="noopener">
            <span>MÁS PROYECTOS</span>
            <strong>EXPLORAR REPOSITORIOS</strong>
            <small>Prácticas, soluciones y desarrollos adicionales en mi perfil de GitHub.</small>
          </a>
        </div>

        <div className="projects__controls">
          <div className="projects__arrows">
            <button className="round-btn" type="button" aria-label="Proyecto anterior" onClick={() => step(-1)}>←</button>
            <button className="round-btn" type="button" aria-label="Proyecto siguiente" onClick={() => step(1)}>→</button>
          </div>
          <p className="projects__hint">DESLIZA, USA EL SCROLL O LAS FLECHAS PARA CAMBIAR DE PROYECTO</p>
        </div>
      </div>

      {active && (
        <ProjectModal project={active} total={projects.length} onClose={() => setActive(null)} />
      )}
    </section>
  );
}
