import { audioBufferToWav } from './wav.js'

// Three short demo songs, synthesized with an OfflineAudioContext (it renders faster than
// real time and needs no user gesture, because nothing is played yet), then saved as WAV.

const RATE = 32000
const hz = (midi) => 440 * 2 ** ((midi - 69) / 12)

function note(ctx, out, { type = 'sine', midi, start, dur, gain = 0.1, attack = 0.01, release = 0.15, cutoff, detune = 0 }) {
  const osc = ctx.createOscillator()
  osc.type = type
  osc.frequency.value = hz(midi)
  osc.detune.value = detune
  const amp = ctx.createGain()
  amp.gain.setValueAtTime(0, start)
  amp.gain.linearRampToValueAtTime(gain, start + attack)
  amp.gain.setValueAtTime(gain, start + Math.max(attack, dur - release))
  amp.gain.linearRampToValueAtTime(0, start + dur)
  let node = osc
  if (cutoff) {
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = cutoff
    node = osc.connect(filter)
  }
  node.connect(amp).connect(out)
  osc.start(start)
  osc.stop(start + dur + 0.05)
}

// A plucked tone: quick attack, exponential decay (e-piano, bells).
function pluck(ctx, out, { type = 'sine', midi, start, decay = 0.8, gain = 0.1 }) {
  const osc = ctx.createOscillator()
  osc.type = type
  osc.frequency.value = hz(midi)
  const amp = ctx.createGain()
  amp.gain.setValueAtTime(0, start)
  amp.gain.linearRampToValueAtTime(gain, start + 0.008)
  amp.gain.exponentialRampToValueAtTime(0.0005, start + decay)
  osc.connect(amp).connect(out)
  osc.start(start)
  osc.stop(start + decay + 0.05)
}

function kick(ctx, out, start, level = 0.6) {
  const osc = ctx.createOscillator()
  osc.frequency.setValueAtTime(140, start)
  osc.frequency.exponentialRampToValueAtTime(40, start + 0.12)
  const amp = ctx.createGain()
  amp.gain.setValueAtTime(level, start)
  amp.gain.exponentialRampToValueAtTime(0.001, start + 0.35)
  osc.connect(amp).connect(out)
  osc.start(start)
  osc.stop(start + 0.4)
}

function noise(ctx, out, buffer, start, { type = 'highpass', freq = 7000, level = 0.05, decay = 0.05 }) {
  const src = ctx.createBufferSource()
  src.buffer = buffer
  const filter = ctx.createBiquadFilter()
  filter.type = type
  filter.frequency.value = freq
  const amp = ctx.createGain()
  amp.gain.setValueAtTime(level, start)
  amp.gain.exponentialRampToValueAtTime(0.001, start + decay)
  src.connect(filter).connect(amp).connect(out)
  src.start(start, Math.random() * 0.5)
  src.stop(start + decay + 0.02)
}

const snare = (ctx, out, buf, t, level = 0.3) => noise(ctx, out, buf, t, { type: 'bandpass', freq: 1800, level, decay: 0.18 })
const hat = (ctx, out, buf, t, level = 0.05) => noise(ctx, out, buf, t, { level, decay: 0.05 })

// ── The songs ──────────────────────────────────────────────

const neonHighway = {
  title: 'Neon Highway',
  bpm: 112,
  chords: [
    { root: 45, notes: [57, 60, 64] }, // Am
    { root: 41, notes: [53, 57, 60] }, // F
    { root: 48, notes: [55, 60, 64] }, // C
    { root: 43, notes: [55, 59, 62] }, // G
  ],
  bars: 8,
  play(ctx, out, buf, bar, t0, beat) {
    const chord = this.chords[bar % 4]
    // Octave-jumping saw bass on eighth notes
    for (let i = 0; i < 8; i++) {
      note(ctx, out, {
        type: 'sawtooth',
        midi: chord.root + (i % 2 ? 12 : 0),
        start: t0 + (i * beat) / 2,
        dur: beat / 2 - 0.02,
        gain: 0.07,
        cutoff: 900,
        release: 0.05,
      })
    }
    // Wide pad: two detuned saws per chord note
    chord.notes.forEach((midi) => {
      ;[-9, 9].forEach((detune) =>
        note(ctx, out, { type: 'sawtooth', midi, start: t0, dur: beat * 4, gain: 0.018, attack: 0.25, release: 0.4, cutoff: 1600, detune }),
      )
    })
    // Arpeggio in the second half
    if (bar >= 4) {
      for (let i = 0; i < 16; i++) {
        note(ctx, out, {
          type: 'square',
          midi: chord.notes[i % 3] + 12,
          start: t0 + (i * beat) / 4,
          dur: beat / 4 - 0.02,
          gain: 0.022,
          cutoff: 3000,
          release: 0.04,
        })
      }
    }
    for (let b = 0; b < 4; b++) {
      kick(ctx, out, t0 + b * beat)
      if (b % 2) snare(ctx, out, buf, t0 + b * beat)
      hat(ctx, out, buf, t0 + b * beat + beat / 2)
    }
  },
}

const PIXEL_LEAD = [
  [76, 79, 84, 79, 76, 79, 84, 86],
  [84, 83, 81, 76, 81, 83, 84, 88],
  [77, 81, 84, 81, 77, 81, 84, 86],
  [86, 83, 79, 83, 86, 83, 79, 77],
  [76, 79, 84, 79, 76, 79, 84, 86],
  [84, 83, 81, 76, 81, 83, 84, 88],
  [77, 81, 84, 86, 88, 86, 84, 81],
  [79, 77, 74, 71, 72, null, null, null],
]

const pixelGarden = {
  title: 'Pixel Garden',
  bpm: 140,
  bars: 8,
  bass: [
    [48, 55],
    [45, 52],
    [41, 48],
    [43, 50],
  ],
  play(ctx, out, buf, bar, t0, beat) {
    PIXEL_LEAD[bar].forEach((midi, i) => {
      if (midi) note(ctx, out, { type: 'square', midi, start: t0 + (i * beat) / 2, dur: beat / 2 - 0.03, gain: 0.045, release: 0.03 })
    })
    const [root, fifth] = this.bass[bar % 4]
    for (let b = 0; b < 4; b++) {
      note(ctx, out, { type: 'triangle', midi: b % 2 ? fifth : root, start: t0 + b * beat, dur: beat - 0.04, gain: 0.16, release: 0.05 })
      if (b % 2 === 0) kick(ctx, out, t0 + b * beat, 0.45)
      else snare(ctx, out, buf, t0 + b * beat, 0.22)
      hat(ctx, out, buf, t0 + b * beat, 0.04)
      hat(ctx, out, buf, t0 + b * beat + beat / 2, 0.03)
    }
  },
}

const TAPE_MELODY = [
  [69, 72, 76, 74],
  [71, null, 67, null],
  [76, 74, 71, 67],
  [69, null, null, null],
  [69, 72, 77, 76],
  [74, 71, 67, 65],
  [64, 67, 71, 74],
]

const midnightTape = {
  title: 'Midnight Tape',
  bpm: 90,
  bars: 7,
  chords: [
    [50, 53, 57, 60, 64], // Dm9
    [43, 53, 59, 64], // G13
    [48, 52, 59, 62, 67], // Cmaj9
    [45, 55, 60, 64, 71], // Am9
    [50, 53, 57, 60, 64], // Dm9
    [43, 53, 59, 64], // G13
    [48, 52, 59, 62, 67], // Cmaj9
  ],
  play(ctx, out, buf, bar, t0, beat) {
    const chord = this.chords[bar]
    chord.forEach((midi, i) => {
      pluck(ctx, out, { midi, start: t0 + i * 0.02, decay: 2.2, gain: 0.05 })
      pluck(ctx, out, { midi: midi + 12, start: t0 + i * 0.02, decay: 0.9, gain: 0.012 })
      if (bar < 6) pluck(ctx, out, { midi, start: t0 + beat * 2.5, decay: 1.2, gain: 0.03 })
    })
    TAPE_MELODY[bar].forEach((midi, i) => {
      if (midi) pluck(ctx, out, { type: 'triangle', midi: midi + 12, start: t0 + i * beat, decay: 1.1, gain: 0.05 })
    })
    for (let b = 0; b < 4; b++) {
      if (b === 0) kick(ctx, out, t0, 0.4)
      if (b === 2) kick(ctx, out, t0 + b * beat + beat / 2, 0.3)
      if (b % 2) noise(ctx, out, buf, t0 + b * beat, { type: 'bandpass', freq: 2500, level: 0.12, decay: 0.08 })
      for (let s = 0; s < 4; s++) hat(ctx, out, buf, t0 + b * beat + (s * beat) / 4, s % 2 ? 0.012 : 0.02)
    }
  },
}

export const DEMO_SONGS = [neonHighway, pixelGarden, midnightTape]

async function renderSong(song) {
  const beat = 60 / song.bpm
  const seconds = song.bars * beat * 4 + 1.5 // + room for the last notes to ring out
  const ctx = new OfflineAudioContext(1, Math.ceil(seconds * RATE), RATE)

  const buf = ctx.createBuffer(1, RATE, RATE)
  const data = buf.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1

  const master = ctx.createGain()
  master.gain.value = 0.8
  master.connect(ctx.destination)

  for (let bar = 0; bar < song.bars; bar++) song.play(ctx, master, buf, bar, 0.05 + bar * beat * 4, beat)

  const rendered = await ctx.startRendering()
  return { title: song.title, blob: audioBufferToWav(rendered), duration: rendered.duration, sampleRate: RATE, channels: 1 }
}

export function renderDemoTracks() {
  if (typeof OfflineAudioContext === 'undefined') return Promise.reject(new Error('no-offline-audio'))
  return Promise.all(DEMO_SONGS.map(renderSong))
}
