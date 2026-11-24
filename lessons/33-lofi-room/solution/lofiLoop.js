// A four-bar lofi loop rendered once with an OfflineAudioContext (faster than real time),
// then played back as a looping buffer. Keys, bass, a lazy drum groove and vinyl crackle.

export const BPM = 72
export const BEAT = 60 / BPM
export const BAR = BEAT * 4
export const CHORDS = [
  { name: 'Fmaj7', notes: [53, 57, 60, 64], bass: 41 },
  { name: 'Em7', notes: [52, 55, 59, 62], bass: 40 },
  { name: 'Dm7', notes: [50, 53, 57, 60], bass: 38 },
  { name: 'Cmaj7', notes: [48, 52, 55, 59], bass: 36 },
]
export const LOOP_SECONDS = BAR * CHORDS.length

const midiToHz = (note) => 440 * 2 ** ((note - 69) / 12)
const SWING = BEAT * 0.09 // late off-beat eighths give the lazy feel

function envelope(param, start, peak, attack, decay, sustain, end) {
  param.setValueAtTime(0, start)
  param.linearRampToValueAtTime(peak, start + attack)
  param.setTargetAtTime(peak * sustain, start + attack, decay)
  param.setTargetAtTime(0, end, 0.12)
}

// Soft electric-piano-like voice: triangle + quiet sine an octave up, slightly detuned.
function keys(ctx, out, note, start, length, velocity) {
  const gain = ctx.createGain()
  gain.connect(out)
  envelope(gain.gain, start, 0.11 * velocity, 0.015, 0.6, 0.35, start + length)
  ;[
    ['triangle', 1, -4],
    ['sine', 2, 3],
  ].forEach(([type, mult, detune], i) => {
    const osc = ctx.createOscillator()
    osc.type = type
    osc.frequency.value = midiToHz(note) * mult
    osc.detune.value = detune
    const g = ctx.createGain()
    g.gain.value = i === 0 ? 1 : 0.25
    osc.connect(g).connect(gain)
    osc.start(start)
    osc.stop(start + length + 1)
  })
}

function bass(ctx, out, note, start, length) {
  const osc = ctx.createOscillator()
  osc.type = 'sine'
  osc.frequency.value = midiToHz(note)
  const gain = ctx.createGain()
  envelope(gain.gain, start, 0.32, 0.01, 0.35, 0.4, start + length)
  osc.connect(gain).connect(out)
  osc.start(start)
  osc.stop(start + length + 1)
}

function kick(ctx, out, start) {
  const osc = ctx.createOscillator()
  osc.frequency.setValueAtTime(120, start)
  osc.frequency.exponentialRampToValueAtTime(42, start + 0.14)
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.55, start)
  gain.gain.exponentialRampToValueAtTime(0.001, start + 0.45)
  osc.connect(gain).connect(out)
  osc.start(start)
  osc.stop(start + 0.5)
}

function noiseHit(ctx, out, noise, start, { type, freq, q = 1, level, decay }) {
  const src = ctx.createBufferSource()
  src.buffer = noise
  const filter = ctx.createBiquadFilter()
  filter.type = type
  filter.frequency.value = freq
  filter.Q.value = q
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(level, start)
  gain.gain.exponentialRampToValueAtTime(0.001, start + decay)
  src.connect(filter).connect(gain).connect(out)
  src.start(start, Math.random() * 0.5)
  src.stop(start + decay + 0.05)
}

function schedule(ctx, out, noise, offset) {
  CHORDS.forEach((chord, bar) => {
    const t0 = offset + bar * BAR
    // A slow strum on beat 1, a softer re-hit on the "and" of beat 2.
    chord.notes.forEach((note, i) => {
      keys(ctx, out, note, t0 + i * 0.018, BEAT * 2.4, 1)
      keys(ctx, out, note, t0 + BEAT * 2.5 + SWING + i * 0.012, BEAT * 1.4, 0.55)
    })
    bass(ctx, out, chord.bass, t0, BEAT * 1.8)
    bass(ctx, out, chord.bass + 12, t0 + BEAT * 2.5 + SWING, BEAT * 0.9)
    bass(ctx, out, chord.bass + 7, t0 + BEAT * 3, BEAT * 0.9)

    for (let beat = 0; beat < 4; beat++) {
      const t = t0 + beat * BEAT
      if (beat === 0) kick(ctx, out, t)
      if (beat === 2) kick(ctx, out, t + BEAT * 0.5 + SWING)
      if (beat === 1 || beat === 3) {
        noiseHit(ctx, out, noise, t, { type: 'bandpass', freq: 1700, q: 0.8, level: 0.28, decay: 0.2 })
      }
      noiseHit(ctx, out, noise, t, { type: 'highpass', freq: 7000, level: 0.05, decay: 0.05 })
      noiseHit(ctx, out, noise, t + BEAT / 2 + SWING, { type: 'highpass', freq: 7500, level: 0.035, decay: 0.04 })
    }
  })
}

function vinyl(ctx, out, noise, seconds) {
  // Constant soft hiss…
  const hiss = ctx.createBufferSource()
  hiss.buffer = noise
  hiss.loop = true
  const band = ctx.createBiquadFilter()
  band.type = 'bandpass'
  band.frequency.value = 3200
  band.Q.value = 0.6
  const level = ctx.createGain()
  level.gain.value = 0.012
  hiss.connect(band).connect(level).connect(out)
  hiss.start(0)
  // …and a few dust clicks.
  for (let t = Math.random() * 0.4; t < seconds; t += 0.15 + Math.random() * 0.6) {
    noiseHit(ctx, out, noise, t, { type: 'highpass', freq: 2500, level: 0.02 + Math.random() * 0.05, decay: 0.008 })
  }
}

// Returns an AudioBuffer for `ctx` that loops seamlessly.
export async function renderLofiLoop(ctx) {
  const rate = ctx.sampleRate
  const loopLength = Math.round(LOOP_SECONDS * rate)
  // Render the loop twice and keep the second copy: it already contains the
  // ringing tails of the first, so the loop point is seamless.
  const offline = new OfflineAudioContext(2, loopLength * 2, rate)

  const noise = offline.createBuffer(1, rate, rate)
  const data = noise.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1

  const warmth = offline.createBiquadFilter()
  warmth.type = 'lowpass'
  warmth.frequency.value = 3800
  const master = offline.createGain()
  master.gain.value = 0.9
  warmth.connect(master).connect(offline.destination)

  schedule(offline, warmth, noise, 0)
  schedule(offline, warmth, noise, LOOP_SECONDS)
  vinyl(offline, warmth, noise, LOOP_SECONDS * 2)

  const rendered = await offline.startRendering()
  const loop = ctx.createBuffer(2, loopLength, rate)
  for (let c = 0; c < 2; c++) {
    loop.copyToChannel(rendered.getChannelData(c).subarray(loopLength, loopLength * 2), c)
  }
  return loop
}
