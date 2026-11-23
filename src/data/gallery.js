const asset = file => `${import.meta.env.BASE_URL}assets/${file}`;

export const gallery = [
  { src: asset('f1-rojo.webp'), label: '01 / RACE CRAFT · MONZA' },
  { src: asset('f1-meta.webp'), label: '02 / AERO STUDY · SILVERSTONE' },
  { src: asset('f1-curva.webp'), label: '03 / TELEMETRY · SPA' },
  { src: asset('f1-noche.webp'), label: '04 / NIGHT RUN · SINGAPUR' },
];
