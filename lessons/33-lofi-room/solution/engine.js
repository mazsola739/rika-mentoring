import { brownNoise, cafeClinks, cafeMurmur, fireCrackle, whiteNoise } from './noise.js'
import { BAR, CHORDS, LOOP_SECONDS, renderLofiLoop } from './lofiLoop.js'

const FADE = 0.35 // seconds, so nothing starts or stops with a click

// Each ambient sound is a small graph: looping buffer(s) → filters → its own gain.
// It is built the first time its slider goes above 0.
const AMBIENT = {
  rain(ctx, out) {
    const hiss = loop(ctx, whiteNoise(ctx))
    const high = filter(ctx, 'highpass', 450)
    const low = filter(ctx, 'lowpass', 3200)
    hiss.connect(high).connect(low).connect(out)
    // A darker layer underneath makes the rain feel heavier.
    const body = loop(ctx, brownNoise(ctx))
    const bodyGain = ctx.createGain()
    bodyGain.gain.value = 0.5
    body
      .connect(filter(ctx, 'lowpass', 500))
      .connect(bodyGain)
      .connect(out)
    return [hiss, body]
  },
  cafe(ctx, out) {
    const murmur = loop(ctx, cafeMurmur(ctx))
    const voices = filter(ctx, 'bandpass', 520, 0.9)
    const murmurGain = ctx.createGain()
    murmurGain.gain.value = 2.2
    murmur.connect(voices).connect(murmurGain).connect(out)
    const clinks = loop(ctx, cafeClinks(ctx))
    clinks.connect(out)
    return [murmur, clinks]
  },
  fire(ctx, out) {
    const crackle = loop(ctx, fireCrackle(ctx))
    crackle.connect(filter(ctx, 'lowpass', 5500)).connect(out)
    return [crackle]
  },
}

function loop(ctx, buffer) {
  const src = ctx.createBufferSource()
  src.buffer = buffer
  src.loop = true
  src.start()
  return src
}

function filter(ctx, type, frequency, q = 0.7) {
  const node = ctx.createBiquadFilter()
  node.type = type
  node.frequency.value = frequency
  node.Q.value = q
  return node
}

function fadeTo(ctx, param, value, time = FADE) {
  const now = ctx.currentTime
  param.cancelScheduledValues(now)
  param.setValueAtTime(param.value, now)
  param.linearRampToValueAtTime(value, now + time)
}

// Everything that makes sound lives here, outside React. Create it only from a user gesture
// (a click or slider move); browsers block audio that starts on its own.
export function createRoomAudio() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext
  if (!AudioCtx) throw new Error('Web Audio is not supported')
  const ctx = new AudioCtx()

  // A gentle compressor at the end keeps the mix from clipping when every slider is up.
  const limiter = ctx.createDynamicsCompressor()
  limiter.threshold.value = -10
  limiter.knee.value = 10
  limiter.ratio.value = 6
  limiter.connect(ctx.destination)
  const ambienceBus = ctx.createGain()
  ambienceBus.gain.value = 0
  ambienceBus.connect(limiter)
  const musicBus = ctx.createGain()
  musicBus.gain.value = 0
  musicBus.connect(limiter)

  const channels = {} // name → { gain, sources }
  let musicVolume = 0.7
  let music = null // { source, wobble, startedAt }
  let offset = 0 // where the loop was paused, in seconds
  let loopBuffer = null
  let rendering = null
  let wantMusic = false // the user may press pause while the loop is still rendering

  function channel(name) {
    if (!channels[name]) {
      const gain = ctx.createGain()
      gain.gain.value = 0
      gain.connect(ambienceBus)
      channels[name] = { gain, sources: AMBIENT[name](ctx, gain) }
    }
    return channels[name]
  }

  return {
    resume() {
      if (ctx.state === 'suspended') ctx.resume()
    },

    // 0…1 slider value → gain. Squaring feels more natural to the ear than a straight line.
    setLevel(name, value) {
      if (value <= 0 && !channels[name]) return
      fadeTo(ctx, channel(name).gain.gain, value * value * 0.9, 0.15)
    },

    setAmbience(on) {
      fadeTo(ctx, ambienceBus.gain, on ? 1 : 0)
    },

    async playMusic() {
      wantMusic = true
      if (music) return
      if (!loopBuffer) {
        rendering ??= renderLofiLoop(ctx)
        loopBuffer = await rendering
      }
      if (music || !wantMusic || ctx.state === 'closed') return
      const source = ctx.createBufferSource()
      source.buffer = loopBuffer
      source.loop = true
      // "Tape wobble": a slow LFO that bends the pitch by a few cents.
      const wobble = ctx.createOscillator()
      wobble.frequency.value = 0.3
      const depth = ctx.createGain()
      depth.gain.value = 7
      if (source.detune) wobble.connect(depth).connect(source.detune)
      source.connect(musicBus)
      wobble.start()
      source.start(0, offset)
      music = { source, wobble, startedAt: ctx.currentTime - offset }
      fadeTo(ctx, musicBus.gain, musicVolume)
    },

    pauseMusic() {
      wantMusic = false
      if (!music) return
      const { source, wobble, startedAt } = music
      offset = (ctx.currentTime - startedAt) % LOOP_SECONDS
      fadeTo(ctx, musicBus.gain, 0, 0.25)
      source.stop(ctx.currentTime + 0.3)
      wobble.stop(ctx.currentTime + 0.3)
      music = null
    },

    setMusicVolume(value) {
      musicVolume = value * value
      if (music) fadeTo(ctx, musicBus.gain, musicVolume, 0.1)
    },

    // Which chord is sounding right now (index into CHORDS), or -1 when paused.
    currentChord() {
      if (!music) return -1
      const position = (ctx.currentTime - music.startedAt) % LOOP_SECONDS
      return Math.floor(position / BAR) % CHORDS.length
    },

    // A soft two-note bell when a timer phase ends.
    chime() {
      const now = ctx.currentTime
      ;[880, 1318.5].forEach((freq, i) => {
        const osc = ctx.createOscillator()
        osc.frequency.value = freq
        const gain = ctx.createGain()
        const start = now + i * 0.28
        gain.gain.setValueAtTime(0, start)
        gain.gain.linearRampToValueAtTime(0.18, start + 0.01)
        gain.gain.exponentialRampToValueAtTime(0.001, start + 1.6)
        osc.connect(gain).connect(limiter)
        osc.start(start)
        osc.stop(start + 1.7)
      })
    },

    close() {
      ctx.close()
    },
  }
}
