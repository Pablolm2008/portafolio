import { profile } from '../data/profile.js';
import { playTick } from '../audio/engine.js';

const ROWS = [
  { num: '01', badge: 'GH', label: 'GITHUB', value: 'Pablolm2008', href: profile.github, external: true },
  { num: '02', badge: 'IN', label: 'LINKEDIN', value: 'Pablo López', href: profile.linkedin, external: true },
  { num: '03', badge: '@', label: 'CORREO', value: profile.email, href: `mailto:${profile.email}` },
  { num: '04', badge: 'TF', label: 'TELÉFONO', value: profile.phone, href: profile.phoneHref },
];

export default function Contact() {
  return (
    <section className="section contact" id="contacto">
      <div className="container">
        <div className="contact__head reveal">
          <div className="section-head">
            <p className="kicker">05 / CONTACTO</p>
            <h2 className="section-title">HABLEMOS<br />EN LA META</h2>
            <p className="section-sub">Una línea y te respondo antes de la siguiente vuelta.</p>
          </div>
          <div className="contact__status"><span /> PIT STOP ABIERTO</div>
        </div>

        <div className="pitwall reveal">
          <aside className="pitwall__panel">
            <img className="pitwall__car" src="/assets/f1-car-final.webp" alt="" aria-hidden="true" loading="lazy" />
            <div className="pitwall__checker" aria-hidden="true" />
            <div className="pitwall__panel-inner">
              <span className="pitwall__label">PIT WALL · GT</span>
              <h3>GUATEMALA</h3>
              <p>Disponible para reuniones remotas y proyectos freelance.</p>
              <a className="btn btn--red" href={`mailto:${profile.email}`}>
                ENVIAR MENSAJE <span aria-hidden="true">→</span>
              </a>
            </div>
          </aside>

          <div className="pitwall__list">
            {ROWS.map(row => (
              <a
                key={row.num}
                className="pit-row"
                href={row.href}
                {...(row.external ? { target: '_blank', rel: 'noopener' } : {})}
                onMouseEnter={playTick}
              >
                <span className="pit-row__num">{row.num}</span>
                <span className="pit-row__badge">{row.badge}</span>
                <span className="pit-row__body">
                  <small>{row.label}</small>
                  <strong>{row.value}</strong>
                </span>
                <span className="pit-row__arrow" aria-hidden="true">↗</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      <footer className="site-footer">
        <span>SCUDERIA PORTAFOLIO // PABLO LÓPEZ MONZÓN · 2026</span>
        <span>END OF LAP</span>
      </footer>
    </section>
  );
}
