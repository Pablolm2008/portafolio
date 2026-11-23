import { useState } from 'react';
import { profile } from '../data/profile.js';

export default function About() {
  const [open, setOpen] = useState(false);

  return (
    <section className="section about" id="sobre-mi">
      <div className="container">
        <div className="section-head reveal">
          <p className="kicker">02 / ABOUT</p>
          <h2 className="section-title">SOBRE MÍ</h2>
          <p className="section-sub">Diseño, velocidad y precisión en cada decisión.</p>
        </div>

        <div className="about__grid">
          <div className="about__photo reveal">
            <img src="/assets/yo.webp" alt={`Retrato de ${profile.name}`} width="869" height="854" loading="lazy" />
            <div className="about__photo-meta">
              <span>PILOTO</span>
              <strong>PABLO LÓPEZ MONZÓN</strong>
            </div>
          </div>

          <div className="about__content reveal">
            <p className="about__lead">
              Soy <strong>Pablo López Monzón</strong>, Técnico Desarrollador de Software, interesado en el desarrollo de aplicaciones web, programación backend y gestión de bases de datos.
            </p>
            <p>Me enfoco en construir soluciones funcionales, escribir código organizado y desarrollar aplicaciones que respondan a necesidades reales.</p>
            <p>Actualmente trabajo en proyectos que me permiten fortalecer mis habilidades en desarrollo Full Stack y ampliar mis conocimientos tecnológicos.</p>

            <button
              className="btn btn--ghost"
              type="button"
              aria-expanded={open}
              aria-controls="aboutExtra"
              onClick={() => setOpen(value => !value)}
            >
              {open ? 'OCULTAR ENFOQUE' : 'VER ENFOQUE PROFESIONAL'}{' '}
              <span aria-hidden="true">{open ? '↑' : '↓'}</span>
            </button>

            <div className="about__extra" id="aboutExtra" hidden={!open}>
              <ul>
                {profile.focus.map(item => <li key={item}>{item}</li>)}
              </ul>
            </div>

            <div className="about__stats">
              <span className="chip">GUATEMALA</span>
              <span className="chip">FULL STACK</span>
              <span className="chip">TEMPORADA 2026</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
