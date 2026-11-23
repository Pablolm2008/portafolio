import { useEffect, useRef, useState } from 'react';
import { LIGHT_STEP, playStartLights, setSound } from '../audio/engine.js';

/** Pantalla de inicio: semáforo de salida y elección de sonido. */
export default function IntroOverlay({ onDone }) {
  const [lit, setLit] = useState(0);
  const [green, setGreen] = useState(false);
  const [starting, setStarting] = useState(false);
  const timers = useRef([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const withSound = () => {
    if (starting) return;
    setStarting(true);
    setSound(true); // crea el contexto de audio dentro del gesto del usuario
    playStartLights();
    for (let i = 1; i <= 5; i++) {
      timers.current.push(setTimeout(() => setLit(i), (i - 1) * LIGHT_STEP * 1000));
    }
    timers.current.push(setTimeout(() => setGreen(true), 5 * LIGHT_STEP * 1000));
    timers.current.push(setTimeout(onDone, 5 * LIGHT_STEP * 1000 + 1000));
  };

  const withoutSound = () => {
    if (starting) return;
    setStarting(true);
    setSound(false);
    onDone();
  };

  return (
    <div className="intro" role="dialog" aria-modal="true" aria-labelledby="introTitle">
      <div className="intro__panel">
        <p className="kicker kicker--light">PARRILLA DE SALIDA</p>
        <h2 id="introTitle">PREPARA LA SALIDA</h2>
        <p>Enciende el motor para la experiencia completa. Puedes cambiarlo en cualquier momento desde el encabezado.</p>

        <div className="lights" aria-hidden="true">
          {[0, 1, 2, 3, 4].map(i => (
            <span key={i} className={`light${i < lit ? ' is-on' : ''}`} />
          ))}
          <span className={`light light--go${green ? ' is-on' : ''}`} />
        </div>

        <div className="intro__actions">
          <button className="btn btn--red" type="button" onClick={withSound} disabled={starting} autoFocus>
            ENCENDER MOTOR
          </button>
          <button className="btn btn--ghost" type="button" onClick={withoutSound} disabled={starting}>
            ENTRAR SIN SONIDO
          </button>
        </div>
      </div>
    </div>
  );
}
