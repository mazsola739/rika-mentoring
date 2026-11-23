// Ambient sound buffers, generated sample by sample. No audio files are downloaded.
// Each buffer loops; `loopable` cross-fades the end into the start so the seam does not click.

const CROSSFADE = 0.25 // seconds

function loopable(ctx, seconds, channels, fill) {
  const rate = ctx.sampleRate
  const length = Math.floor(seconds * rate)
  const fade = Math.floor(CROSSFADE * rate)
  const buffer = ctx.createBuffer(channels, length, rate)
  for (let c = 0; c < channels; c++) {
    const raw = new Float32Array(length + fade)
    fill(raw, rate, c)
    const out = buffer.getChannelData(c)
    out.set(raw.subarray(0, length))
    // The tail (after `length`) fades into the head, so the last sample flows into the first.
    for (let i = 0; i < fade; i++) {
      const k = i / fade
      out[i] = raw[i] * k + raw[length + i] * (1 - k)
    }
  }
  return buffer
}

// Plain white noise: every sample is random. Filtered later, it sounds like rain.
export function whiteNoise(ctx, seconds = 3) {
  return loopable(ctx, seconds, 2, (data) => {
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  })
}

// Brown noise: a leaky running sum of white noise. Deep and soft, like distant rumble.
function fillBrown(data, gain = 3.5) {
  let last = 0
  for (let i = 0; i < data.length; i++) {
    last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02
    data[i] = last * gain
  }
}

export function brownNoise(ctx, seconds = 4) {
  return loopable(ctx, seconds, 2, (data) => fillBrown(data))
}

// Café murmur: several "voices" of brown noise, each switched on and off in syllable-like
// pulses and longer phrases. Band-pass filtered in the graph, it becomes a soft crowd.
export function cafeMurmur(ctx, seconds = 10) {
  const VOICES = 6
  return loopable(ctx, seconds, 2, (data, rate) => {
    const voice = new Float32Array(data.length)
    for (let v = 0; v < VOICES; v++) {
      fillBrown(voice, 4)
      const syllable = 3 + Math.random() * 3 // Hz
      const phrase = 0.15 + Math.random() * 0.25 // Hz
      const phase = Math.random() * Math.PI * 2
      const level = 0.5 + Math.random() * 0.5
      for (let i = 0; i < data.length; i++) {
        const t = i / rate
        const talk = Math.max(0, Math.sin(2 * Math.PI * phrase * t + phase)) // pauses between phrases
        const syl = Math.sin(2 * Math.PI * syllable * t + phase * 3) ** 2
        data[i] += voice[i] * talk * (0.35 + 0.65 * syl) * level * 0.4
      }
    }
  })
}

// A few cup and spoon clinks: short high sine pings at random moments.
export function cafeClinks(ctx, seconds = 13) {
  return loopable(ctx, seconds, 2, (data, rate, channel) => {
    const count = 5
    for (let n = 0; n < count; n++) {
      const start = Math.floor(((n + Math.random() * 0.8) / count) * (data.length - rate))
      const freq = 2200 + Math.random() * 2600
      const amp = (0.05 + Math.random() * 0.08) * (channel === n % 2 ? 1 : 0.55)
      const len = Math.floor(rate * 0.35)
      for (let i = 0; i < len; i++) {
        const t = i / rate
        const env = Math.exp(-t * 18)
        data[start + i] += amp * env * (Math.sin(2 * Math.PI * freq * t) + 0.4 * Math.sin(2 * Math.PI * freq * 2.76 * t))
      }
    }
  })
}

// Fireplace: a low rumble plus random crackles (tiny bursts of noise that die out quickly).
export function fireCrackle(ctx, seconds = 10) {
  return loopable(ctx, seconds, 2, (data, rate) => {
    fillBrown(data, 1.2)
    let i = 0
    while (i < data.length) {
      // Next crackle in 20–180 ms; some are loud pops.
      i += Math.floor(rate * (0.02 + Math.random() * 0.16))
      const pop = Math.random() < 0.12
      const amp = pop ? 0.6 + Math.random() * 0.4 : 0.08 + Math.random() * 0.25
      const decay = rate * (pop ? 0.006 : 0.0025)
      const len = Math.floor(decay * 6)
      for (let k = 0; k < len && i + k < data.length; k++) {
        data[i + k] += amp * Math.exp(-k / decay) * (Math.random() * 2 - 1)
      }
    }
  })
}
