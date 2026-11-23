import { useEffect, useRef, useState } from 'react';
import { setEngineRpm } from '../audio/engine.js';

const MAX_KMH = 330;

/**
 * HUD de telemetría: la velocidad sube con el scroll y decae sola.
 * Con scroll rápido y sonido activo, el motor modula sus rpm en continuo.
 */
export default function Telemetry({ gear, soundOn }) {
  const [speed, setSpeed] = useState(0);
  const velocity = useRef(0);
  const lastY = useRef(window.scrollY);
  const lastRpm = useRef(-1);
  const soundRef = useRef(soundOn);
  soundRef.current = soundOn;

  useEffect(() => {
    let frame;
    let shown = 0;

    const onScroll = () => {
      const y = window.scrollY;
      velocity.current = Math.min(MAX_KMH, velocity.current + Math.abs(y - lastY.current) * 1.2);
      lastY.current = y;
    };

    const tick = () => {
      velocity.current *= 0.965;
      const value = velocity.current < 0.5 ? 0 : velocity.current;
      if (Math.abs(value - shown) >= 1) {
        shown = value;
        setSpeed(value);
      }
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const rpm = soundRef.current && !reduce ? value / MAX_KMH : 0;
      if (Math.abs(rpm - lastRpm.current) > 0.01) {
        lastRpm.current = rpm;
        setEngineRpm(rpm);
      }
      frame = window.requestAnimationFrame(tick);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    frame = window.requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.cancelAnimationFrame(frame);
      setEngineRpm(0);
    };
  }, []);

  const rpm = 12 + (speed / MAX_KMH) * 88;

  return (
    <aside className="telemetry" aria-hidden="true">
      <div>
        <span>MARCHA</span>
        <strong>{gear}</strong>
      </div>
      <div>
        <span>KM/H</span>
        <strong>{Math.round(speed)}</strong>
      </div>
      <div className="telemetry__rpm">
        <i style={{ '--rpm': `${rpm}%` }} />
      </div>
    </aside>
  );
}
