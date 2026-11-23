import { useEffect, useRef, useState } from 'react';
import Header from './components/Header.jsx';
import SectionRail from './components/SectionRail.jsx';
import Telemetry from './components/Telemetry.jsx';
import IntroOverlay from './components/IntroOverlay.jsx';
import Hero from './components/Hero.jsx';
import Portada from './components/Portada.jsx';
import About from './components/About.jsx';
import Stack from './components/Stack.jsx';
import Projects from './components/Projects.jsx';
import Contact from './components/Contact.jsx';
import {
  getStoredPreference,
  isSoundOn,
  playRev,
  playShift,
  setSound,
  subscribeSound,
} from './audio/engine.js';

export const SECTION_IDS = ['inicio', 'portada', 'sobre-mi', 'stack', 'proyectos', 'contacto'];

export function scrollToSection(id) {
  const target = document.getElementById(id);
  if (!target) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
}

export default function App() {
  const [soundOn, setSoundOn] = useState(() => isSoundOn());
  const [showIntro, setShowIntro] = useState(() => getStoredPreference() === null);
  const [activeId, setActiveId] = useState('inicio');
  const progressRef = useRef(null);
  const prevIndex = useRef(0);
  const activeIndex = SECTION_IDS.indexOf(activeId);

  // Estado del sonido, sincronizado con el encabezado.
  useEffect(() => subscribeSound(setSoundOn), []);

  // Sección activa, barra de progreso y clase para ocultar el encabezado en el hero.
  useEffect(() => {
    let ticking = false;
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (progressRef.current) {
        progressRef.current.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
      }
      const line = window.innerHeight * 0.42;
      let index = 0;
      SECTION_IDS.forEach((id, i) => {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) index = i;
      });
      setActiveId(SECTION_IDS[index]);
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle('is-inicio', activeId === 'inicio');
  }, [activeId]);

  // Cambio de marcha al cambiar de sección.
  useEffect(() => {
    if (prevIndex.current === activeIndex) return;
    prevIndex.current = activeIndex;
    playShift();
  }, [activeIndex]);

  // Animación de aparición de bloques al entrar en pantalla.
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const toggleSound = () => setSound(!isSoundOn());

  const handleHeroEnter = () => {
    scrollToSection('portada');
    playRev({ intensity: 1.2 });
  };

  return (
    <>
      <div className="scroll-progress" ref={progressRef} aria-hidden="true" />
      <Header activeId={activeId} soundOn={soundOn} onToggleSound={toggleSound} />
      <SectionRail activeId={activeId} />
      <Telemetry gear={activeIndex + 1} soundOn={soundOn} />

      <main>
        <Hero onEnter={handleHeroEnter} />
        <Portada onContinue={() => scrollToSection('sobre-mi')} />
        <About />
        <Stack />
        <Projects />
        <Contact />
      </main>

      {showIntro && <IntroOverlay onDone={() => setShowIntro(false)} />}
    </>
  );
}
