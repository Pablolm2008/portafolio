// Motor de sonido F1 sintetizado con Web Audio API.
// Sin archivos de audio: todo se genera en tiempo real (cero KB extra, sin licencias).

const STORAGE_KEY = 'f1-sound';
export const LIGHT_STEP = 0.62; // segundos entre luces del semáforo

let ctx = null;
let master = null;
let noiseBuffer = null;
let engine = null;
let enabled = false;
const subscribers = new Set();

function readStoredPreference() {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === null ? null : value === '1';
  } catch {
    return null;
  }
}

export function getStoredPreference() {
  return readStoredPreference();
}

export function isSoundOn() {
  return enabled;
}

export function subscribeSound(callback) {
  subscribers.add(callback);
  return () => subscribers.delete(callback);
}

function notify() {
  subscribers.forEach(callback => callback(enabled));
}

function ensureContext() {
  if (ctx) {
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  const AudioCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtor) return null;

  ctx = new AudioCtor();

  // Cadena de salida: ganancia maestra -> compresor (evita picos al sonar varios efectos a la vez).
  master = ctx.createGain();
  master.gain.value = 0;
  const compressor = ctx.createDynamicsCompressor();
  compressor.threshold.value = -18;
  compressor.ratio.value = 4;
  master.connect(compressor);
  compressor.connect(ctx.destination);

  // Buffer de ruido blanco reutilizable para frenadas, cambios de marcha y DRS.
  const length = ctx.sampleRate * 1.5;
  noiseBuffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;

  return ctx;
}

export function setSound(on) {
  enabled = on;
  try {
    localStorage.setItem(STORAGE_KEY, on ? '1' : '0');
  } catch {
    /* almacenamiento bloqueado: seguimos sin persistir */
  }
  if (on) {
    const audio = ensureContext();
    if (audio && master) {
      master.gain.setTargetAtTime(0.32, audio.currentTime, 0.05);
      ensureEngine();
    }
  } else {
    if (ctx && master) master.gain.setTargetAtTime(0, ctx.currentTime, 0.05);
    if (ctx && engine) engine.output.gain.setTargetAtTime(0, ctx.currentTime, 0.05);
  }
  notify();
}

// ---- Bloques básicos -------------------------------------------------------

function envelope(gainNode, t, { attack = 0.005, hold = 0, release = 0.12, peak = 1 }) {
  const g = gainNode.gain;
  g.setValueAtTime(0.0001, t);
  g.exponentialRampToValueAtTime(peak, t + attack);
  g.setValueAtTime(peak, t + attack + hold);
  g.exponentialRampToValueAtTime(0.0001, t + attack + hold + release);
}

function beep({ freq, start = 0, duration = 0.12, peak = 0.25, type = 'square' }) {
  if (!enabled || !ctx) return;
  const t = ctx.currentTime + start;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  envelope(gain, t, { attack: 0.004, hold: duration * 0.5, release: duration * 0.5, peak });
  osc.connect(gain).connect(master);
  osc.start(t);
  osc.stop(t + duration + 0.05);
}

function noise({ start = 0, duration = 0.2, peak = 0.3, filter = 'bandpass', from = 800, to = 800, q = 1 }) {
  if (!enabled || !ctx || !noiseBuffer) return;
  const t = ctx.currentTime + start;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer;
  const bp = ctx.createBiquadFilter();
  bp.type = filter;
  bp.Q.value = q;
  bp.frequency.setValueAtTime(from, t);
  if (to !== from) bp.frequency.exponentialRampToValueAtTime(to, t + duration);
  const gain = ctx.createGain();
  envelope(gain, t, { attack: 0.01, hold: 0, release: duration, peak });
  src.connect(bp).connect(gain).connect(master);
  src.start(t, Math.random() * 0.5);
  src.stop(t + duration + 0.05);
}

// ---- Motor continuo (V8 atmosférico estilo F1) -------------------------------

/**
 * Motor persistente inspirado en el V8 2.4 de F1 (2006-2013):
 * - La frecuencia de encendido es la referencia: rpm × 8 cilindros / 120.
 *   A 18.000 rpm son ~1.200 Hz; por eso el V8 "grita" y el V6 turbo no.
 * - Cigüeñal plano (encendido uniforme): multitud de armónicos y coro de
 *   sierras desafinadas.
 * - Pulso de escape a la frecuencia de encendido (AM) para el golpeteo.
 * - Formante agudo (~2-4 kHz) que da el alarido metálico.
 * - Ruido de admisión y "rasp" del escape, que crecen con el régimen.
 * Se crea una sola vez y sus parámetros siguen las rpm que llegan del scroll.
 */
function ensureEngine() {
  if (engine || !ctx || !master) return engine;

  const mix = ctx.createGain();
  mix.gain.value = 0.32;

  // Saturación suave: añade el grano del escape sin volverse ruido digital.
  const shaper = ctx.createWaveShaper();
  const curve = new Float32Array(1024);
  const drive = 2.4;
  const norm = Math.tanh(drive);
  for (let i = 0; i < curve.length; i++) {
    const x = (i / (curve.length - 1)) * 2 - 1;
    curve[i] = Math.tanh(drive * x) / norm;
  }
  shaper.curve = curve;
  shaper.oversample = '2x';

  // Paso bajo resonante: se abre con las rpm y afila el ataque.
  const lowpass = ctx.createBiquadFilter();
  lowpass.type = 'lowpass';
  lowpass.Q.value = 2.2;
  lowpass.frequency.value = 1100;

  // Formante del escape: realza la banda del "scream" del V8.
  const formant = ctx.createBiquadFilter();
  formant.type = 'peaking';
  formant.Q.value = 1.1;
  formant.frequency.value = 1500;
  formant.gain.value = 6;

  // Modulación de amplitud: pulsos de encendido del V8.
  const pulse = ctx.createGain();
  pulse.gain.value = 1;

  const output = ctx.createGain();
  output.gain.value = 0;

  mix.connect(shaper).connect(lowpass).connect(formant).connect(pulse).connect(output).connect(master);

  // Cuerpo grave + sierras desafinadas + armónicos del cigüeñal plano.
  const partials = [
    { mult: 0.5, type: 'sine', level: 0.38, detune: 0 }, // medio orden: cuerpo
    { mult: 1, type: 'sawtooth', level: 0.44, detune: -6 }, // fundamental de encendido
    { mult: 1, type: 'sawtooth', level: 0.32, detune: 7 }, // coro (beating)
    { mult: 2, type: 'sawtooth', level: 0.18, detune: -4 }, // armónico fuerte
    { mult: 2, type: 'square', level: 0.1, detune: 5 },
    { mult: 3, type: 'sawtooth', level: 0.1, detune: 0 },
  ];
  const oscs = partials.map(({ mult, type, level, detune }) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.detune.value = detune;
    osc.frequency.value = 240 * mult;
    gain.gain.value = level;
    osc.connect(gain).connect(mix);
    osc.start();
    return { osc, mult };
  });

  // Admisión: soplo grave que acompaña al motor.
  const air = ctx.createBufferSource();
  air.buffer = noiseBuffer;
  air.loop = true;
  const airFilter = ctx.createBiquadFilter();
  airFilter.type = 'lowpass';
  airFilter.Q.value = 0.6;
  airFilter.frequency.value = 500;
  const airGain = ctx.createGain();
  airGain.gain.value = 0.02;
  air.connect(airFilter).connect(airGain).connect(mix);
  air.start();

  // Rasp/scream del escape: ruido en la banda alta del V8.
  const rasp = ctx.createBufferSource();
  rasp.buffer = noiseBuffer;
  rasp.loop = true;
  const raspFilter = ctx.createBiquadFilter();
  raspFilter.type = 'bandpass';
  raspFilter.Q.value = 1.1;
  raspFilter.frequency.value = 1800;
  const raspGain = ctx.createGain();
  raspGain.gain.value = 0;
  rasp.connect(raspFilter).connect(raspGain).connect(mix);
  rasp.start(0, 0.7);

  // LFO de encendido: golpeteo de escape a media frecuencia de encendido.
  const lfo = ctx.createOscillator();
  const pulseDepth = ctx.createGain();
  lfo.type = 'sine';
  lfo.frequency.value = 120;
  pulseDepth.gain.value = 0.12;
  lfo.connect(pulseDepth).connect(pulse.gain);
  lfo.start();

  engine = { output, lowpass, formant, oscs, airFilter, airGain, raspFilter, raspGain, lfo, pulseDepth };
  return engine;
}

/** rpm normalizado (0..1). Lo llama la telemetría en cada frame de scroll. */
export function setEngineRpm(rpm) {
  if (!enabled || !ctx) return;
  const audio = ensureEngine();
  if (!audio) return;

  const v = Math.max(0, Math.min(1, rpm));
  const t = ctx.currentTime;
  // Frecuencia de encendido del V8: ~240 Hz (bajas) a ~1.120 Hz (corte).
  const firing = 240 + 880 * Math.pow(v, 0.85);

  audio.oscs.forEach(({ osc, mult }) => osc.frequency.setTargetAtTime(firing * mult, t, 0.04));
  audio.lfo.frequency.setTargetAtTime(firing / 2, t, 0.05);
  audio.pulseDepth.gain.setTargetAtTime(0.08 + 0.16 * v, t, 0.08);
  audio.lowpass.frequency.setTargetAtTime(1100 + 6300 * Math.pow(v, 1.15), t, 0.06);
  audio.lowpass.Q.setTargetAtTime(2 + 2.5 * v, t, 0.1);
  audio.formant.frequency.setTargetAtTime(1500 + 2400 * v, t, 0.08);
  audio.formant.gain.setTargetAtTime(5 + 5 * v, t, 0.1);
  audio.airFilter.frequency.setTargetAtTime(500 + 2800 * v, t, 0.06);
  audio.airGain.gain.setTargetAtTime(0.02 + 0.09 * v, t, 0.08);
  audio.raspFilter.frequency.setTargetAtTime(1800 + 2400 * v, t, 0.06);
  audio.raspGain.gain.setTargetAtTime(0.02 + 0.08 * v * v, t, 0.08);
  audio.output.gain.setTargetAtTime(v < 0.02 ? 0 : 0.05 + 0.31 * Math.pow(v, 1.1), t, 0.08);
}

// ---- Efectos ----------------------------------------------------------------

/** Semáforo de salida: cinco luces rojas y luz verde. */
export function playStartLights() {
  if (!enabled) return;
  for (let i = 0; i < 5; i++) {
    beep({ freq: 440, start: i * LIGHT_STEP, duration: 0.18, peak: 0.28, type: 'square' });
  }
  beep({ freq: 880, start: 5 * LIGHT_STEP, duration: 0.7, peak: 0.3, type: 'square' });
}

/** Motor: acelerón con dos osciladores desfasados y filtro que se abre con las rpm. */
export function playRev({ intensity = 1 } = {}) {
  if (!enabled || !ctx) return;
  const t = ctx.currentTime;
  const dur = 0.9;
  const level = 0.22 * Math.min(1.4, Math.max(0.3, intensity));

  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.Q.value = 6;
  lp.frequency.setValueAtTime(500, t);
  lp.frequency.exponentialRampToValueAtTime(2200, t + dur * 0.7);
  lp.frequency.exponentialRampToValueAtTime(700, t + dur);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(level, t + 0.08);
  gain.gain.exponentialRampToValueAtTime(level * 0.7, t + dur * 0.8);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  lp.connect(gain).connect(master);

  // Frecuencia base del motor que sube y baja como un acelerón real.
  [[1, 'sawtooth'], [2, 'square']].forEach(([mult, type], i) => {
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    oscGain.gain.value = i === 0 ? 0.7 : 0.25;
    osc.type = type;
    osc.frequency.setValueAtTime(55 * mult, t);
    osc.frequency.exponentialRampToValueAtTime(190 * mult, t + dur * 0.7);
    osc.frequency.exponentialRampToValueAtTime(95 * mult, t + dur);
    osc.connect(oscGain).connect(lp);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  });
}

/** Cambio de marcha secuencial: clic corto de ruido + golpe de transmisión. */
export function playShift() {
  if (!enabled) return;
  noise({ duration: 0.06, peak: 0.35, filter: 'highpass', from: 2400, to: 2400 });
  beep({ freq: 170, duration: 0.05, peak: 0.12, type: 'triangle' });
}

/** DRS abriéndose: barrido de ruido de agudos hacia medios. */
export function playDRS() {
  if (!enabled) return;
  noise({ duration: 0.38, peak: 0.22, filter: 'bandpass', from: 700, to: 4200, q: 2.5 });
}

/** Radio de pit wall: crujido de banda + beep de confirmación. */
export function playRadio() {
  if (!enabled) return;
  noise({ duration: 0.22, peak: 0.12, filter: 'bandpass', from: 1500, to: 1500, q: 4 });
  beep({ freq: 1040, start: 0.12, duration: 0.07, peak: 0.1, type: 'sine' });
}

/** Tick de telemetría: clic muy corto para hovers y selecciones. */
export function playTick() {
  if (!enabled) return;
  beep({ freq: 2100, duration: 0.02, peak: 0.05, type: 'square' });
}

/**
 * Se llama al cargar la página. Si el usuario ya eligió sonido antes,
 * el contexto de audio solo se puede crear/reanudar tras un gesto, así que
 * lo desbloqueamos con el primer clic, toque o tecla.
 */
export function initSoundPreference() {
  const pref = readStoredPreference();
  if (pref !== true) return;
  enabled = true;
  const unlock = () => {
    const audio = ensureContext();
    if (audio && master) {
      master.gain.setTargetAtTime(0.32, audio.currentTime, 0.05);
      ensureEngine();
    }
    ['pointerdown', 'keydown', 'touchstart'].forEach(type => window.removeEventListener(type, unlock));
  };
  ['pointerdown', 'keydown', 'touchstart'].forEach(type => window.addEventListener(type, unlock, { passive: true }));
}
