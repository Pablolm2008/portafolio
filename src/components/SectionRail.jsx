const DOTS = [
  ['inicio', '00'],
  ['portada', '01'],
  ['sobre-mi', '02'],
  ['stack', '03'],
  ['proyectos', '04'],
  ['contacto', '05'],
];

export default function SectionRail({ activeId }) {
  return (
    <nav className="section-rail" aria-label="Secciones">
      {DOTS.map(([id, num]) => (
        <a key={id} href={`#${id}`} className={activeId === id ? 'is-active' : undefined}>
          <span />
          <em>{num}</em>
        </a>
      ))}
    </nav>
  );
}
