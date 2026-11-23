import { gallery } from '../data/gallery.js';

export default function Portada({ onContinue }) {
  // Se duplica la galería para que el carrusel infinito no tenga corte visible.
  const items = [...gallery, ...gallery];

  return (
    <section className="section portada" id="portada">
      <div className="container">
        <div className="portada__top reveal">
          <p className="kicker kicker--light">01 / APEX ARCHIVE · EDICIÓN 2026</p>
          <h2 className="poster-title">FORMULA<strong>1</strong></h2>
          <p className="portada__tagline">A living archive of speed, design and decision.</p>
        </div>
      </div>

      <div className="marquee" aria-label="Galería de Fórmula 1 en movimiento">
        <div className="marquee__track">
          {items.map((item, i) => (
            <figure className="marquee__item" key={i} aria-hidden={i >= gallery.length || undefined}>
              <img src={item.src} alt="Auto de Fórmula 1" loading="lazy" decoding="async" />
              <figcaption>{item.label}</figcaption>
            </figure>
          ))}
        </div>
      </div>

      <div className="container">
        <div className="portada__welcome reveal">
          <p className="kicker kicker--light">BIENVENIDO AL COCKPIT</p>
          <h3>CADA LÍNEA DE CÓDIGO<br />ES UNA VUELTA MÁS RÁPIDA.</h3>
          <p>Conoce al piloto, revisa su clasificación técnica y descubre los proyectos construidos hasta hoy.</p>
          <button className="btn btn--red" type="button" onClick={onContinue}>
            CONTINUAR <span aria-hidden="true">→</span>
          </button>
        </div>
        <div className="portada__footer">
          <span>SPEED / PRECISION / RITUAL / INSTINCT / SPEED</span>
          <span>01 / 05</span>
        </div>
      </div>
    </section>
  );
}
