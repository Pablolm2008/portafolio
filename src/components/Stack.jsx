import { useState } from 'react';
import { stack } from '../data/stack.js';
import { playTick } from '../audio/engine.js';

const FILTERS = [
  ['all', 'GENERAL'],
  ['lenguaje', 'LENGUAJES'],
  ['db', 'BASES DE DATOS'],
  ['tool', 'HERRAMIENTAS'],
];

export default function Stack() {
  const [filter, setFilter] = useState('all');
  const rows = filter === 'all' ? stack : stack.filter(item => item.filter === filter);
  const podium = stack.slice(0, 3);

  return (
    <section className="section standings" id="stack">
      <div className="container">
        <div className="standings__layout">
          <div className="standings__intro reveal">
            <p className="kicker">03 / STACK</p>
            <h2 className="section-title">CLASIFICACIÓN<br /><span>DE TECNOLOGÍAS</span></h2>
            <p className="section-sub">Las herramientas que uso, ordenadas por experiencia y presencia real en mis proyectos.</p>

            <div className="podium">
              {podium.map((item, index) => (
                <div
                  className="podium__item"
                  key={item.name}
                  style={{ '--brand': item.brand, '--pct': `${item.pts}%` }}
                >
                  <span>P{index + 1}</span>
                  <strong>{item.name}</strong>
                  <i />
                </div>
              ))}
            </div>
          </div>

          <div className="standings__board reveal">
            <div className="tabs" role="tablist" aria-label="Filtrar tecnologías">
              {FILTERS.map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  role="tab"
                  className={`tab${filter === value ? ' is-active' : ''}`}
                  aria-selected={filter === value}
                  onClick={() => {
                    setFilter(value);
                    playTick();
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="table-head" aria-hidden="true">
              <span>POS</span><span>TECNOLOGÍA</span><span>CATEGORÍA</span><span>NIVEL</span><span>PTS</span>
            </div>

            <div className="table-body">
              {rows.map(item => {
                const position = stack.indexOf(item) + 1;
                return (
                  <div
                    className="standing-row"
                    key={item.name}
                    style={{ '--brand': item.brand, '--fg': item.fg || '#ffffff' }}
                  >
                    <span className="standing-row__pos">{String(position).padStart(2, '0')}</span>
                    <span className="standing-row__tech">
                      <i className="tech-badge">{item.short}</i>
                      <strong>{item.name}</strong>
                    </span>
                    <span className="standing-row__cat">{item.cat}</span>
                    <span className="level"><i style={{ '--pct': `${item.pts}%` }} /></span>
                    <span className="standing-row__pts">{item.pts}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
