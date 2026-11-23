import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { isSoundOn, playRadio } from '../audio/engine.js';

/** Ficha de proyecto: atrapa el foco, se cierra con Escape y devuelve el foco al cerrarse. */
export default function ProjectModal({ project, total, onClose }) {
  const dialogRef = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const previous = document.activeElement;
    document.body.classList.add('modal-open');
    dialogRef.current?.querySelector('.modal__close')?.focus();
    if (isSoundOn()) playRadio();

    const onKey = event => {
      if (event.key === 'Escape') {
        closeRef.current();
        return;
      }
      if (event.key !== 'Tab') return;

      const focusable = dialogRef.current?.querySelectorAll('a[href], button:not([disabled])');
      if (!focusable || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.classList.remove('modal-open');
      previous?.focus?.();
    };
  }, []);

  return createPortal(
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
      <div className="modal__backdrop" onClick={onClose} />
      <div className="modal__poster" ref={dialogRef}>
        <button className="modal__close" type="button" onClick={onClose} aria-label="Cerrar ficha">×</button>
        <div className="poster">
          <div className="poster__top">
            <span>{project.num}</span>
            <span>{project.category}</span>
          </div>
          <div className="poster__image">
            <img src={project.image} alt={`Imagen del proyecto ${project.title}`} />
          </div>
          <div className="poster__title">
            <p className="kicker">PROYECTO {project.num}</p>
            <h2 id="modalTitle">{project.title}</h2>
          </div>
          <p className="poster__desc">{project.description}</p>
          <div className="poster__stats">
            <div><strong>{String(project.tech.length).padStart(2, '0')}</strong><span>TECNOLOGÍAS</span></div>
            <div><strong>2026</strong><span>TEMPORADA</span></div>
            <div><strong>GT</strong><span>ORIGEN</span></div>
          </div>
          <div className="tags">
            {project.tech.map(tech => <span className="tag" key={tech}>{tech}</span>)}
          </div>
          <a className="btn btn--red poster__link" href={project.repo} target="_blank" rel="noopener">
            VER EN GITHUB <span aria-hidden="true">→</span>
          </a>
          <div className="poster__footer">
            <span>PORTFOLIO · PABLO LÓPEZ MONZÓN</span>
            <span>{project.num} / {String(total).padStart(2, '0')}</span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
