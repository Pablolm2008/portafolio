import { useEffect, useState } from 'react';
import { playTick } from '../audio/engine.js';

const LINKS = [
  { id: 'inicio', label: 'INICIO' },
  { id: 'sobre-mi', label: 'SOBRE MÍ' },
  { id: 'stack', label: 'STACK' },
  { id: 'proyectos', label: 'PROYECTOS' },
  { id: 'contacto', label: 'CONTACTO' },
];

export default function Header({ activeId, soundOn, onToggleSound }) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = event => event.key === 'Escape' && setMenuOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  const go = id => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <header className="site-header">
        <a className="site-header__brand" href="#inicio" aria-label="Ir al inicio">PL<span>/</span>26</a>

        <nav className="site-nav" aria-label="Navegación principal">
          {LINKS.map(link => (
            <a key={link.id} href={`#${link.id}`} className={activeId === link.id ? 'is-active' : undefined}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="site-header__actions">
          <span className="site-header__meta">GT · DISPONIBLE</span>
          <button
            type="button"
            className="sound-toggle"
            aria-pressed={soundOn}
            onClick={onToggleSound}
            onMouseEnter={playTick}
          >
            <span className="sound-toggle__dot" aria-hidden="true" />
            SONIDO {soundOn ? 'ON' : 'OFF'}
          </button>
          <button
            type="button"
            className="menu-toggle"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            onClick={() => setMenuOpen(open => !open)}
          >
            <span /><span /><span />
          </button>
        </div>
      </header>

      {menuOpen && (
        <nav id="mobile-menu" className="mobile-menu" aria-label="Menú móvil">
          {LINKS.map(link => (
            <button key={link.id} type="button" onClick={() => go(link.id)}>
              {link.label}
            </button>
          ))}
        </nav>
      )}
    </>
  );
}
