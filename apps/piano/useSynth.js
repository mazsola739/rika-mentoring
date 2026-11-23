import { useCallback, useEffect, useRef } from 'react'
import { frequency } from './notes.js'

const PEAK = 0.32 // per voice; a compressor keeps chords from clipping
const toGain = (volume) => (volume / 100) ** 2 // sounds more even than a linear slider

// Web Audio synthesiser. Every playing note is an oscillator → (filter) → gain envelope → master volume.
// All audio objects live in refs: they are not UI state, and changing them must not re-render anything.
export function useSynth(instrument, volume) {
  const ctxRef = useRef(null)
  const masterRef = useRef(null)
  const voicesRef = useRef(new Map()) // midi → { osc, gain, release }
  const settingsRef = useRef({ instrument, volume })

  useEffect(() => {
    settingsRef.current = { instrument, volume }
    const ctx = ctxRef.current
    if (ctx && masterRef.current) masterRef.current.gain.setTargetAtTime(toGain(volume), ctx.currentTime, 0.03)
  }, [instrument, volume])

  // Browsers only allow audio after a user gesture, so the AudioContext is created on the first key press.
  const ensureContext = useCallback(() => {
    if (!ctxRef.current) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (!AudioCtx) return null
      const ctx = new AudioCtx()
      const master = ctx.createGain()
      master.gain.value = toGain(settingsRef.current.volume)
      const compressor = ctx.createDynamicsCompressor()
      master.connect(compressor)
      compressor.connect(ctx.destination)
      ctxRef.current = ctx
      masterRef.current = master
    }
    if (ctxRef.current.state === 'suspended') ctxRef.current.resume()
    return ctxRef.current
  }, [])

  const fadeOut = (voice, ctx, seconds) => {
    const now = ctx.currentTime
    const param = voice.gain.gain
    if (param.cancelAndHoldAtTime) param.cancelAndHoldAtTime(now)
    else {
      param.cancelScheduledValues(now)
      param.setValueAtTime(param.value, now)
    }
    param.setTargetAtTime(0, now, seconds / 3)
    voice.osc.stop(now + seconds * 2)
  }

  const noteOff = useCallback((midi) => {
    const voice = voicesRef.current.get(midi)
    const ctx = ctxRef.current
    if (!voice || !ctx) return
    voicesRef.current.delete(midi)
    fadeOut(voice, ctx, voice.release)
  }, [])

  const noteOn = useCallback(
    (midi) => {
      const ctx = ensureContext()
      if (!ctx) return false
      if (voicesRef.current.has(midi)) noteOff(midi)

      const { instrument: ins } = settingsRef.current
      const now = ctx.currentTime
      const osc = ctx.createOscillator()
      osc.type = ins.wave
      osc.frequency.value = frequency(midi)

      // Envelope: quick rise (attack), fall to the sustain level (decay); the release comes in noteOff.
      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0, now)
      gain.gain.linearRampToValueAtTime(PEAK, now + ins.attack)
      gain.gain.setTargetAtTime(PEAK * ins.sustain, now + ins.attack, ins.decay / 3)

      let source = osc
      if (ins.filter) {
        const filter = ctx.createBiquadFilter()
        filter.type = 'lowpass'
        filter.frequency.value = ins.filter
        osc.connect(filter)
        source = filter
      }
      source.connect(gain)
      gain.connect(masterRef.current)
      osc.onended = () => gain.disconnect()
      osc.start(now)
      voicesRef.current.set(midi, { osc, gain, release: ins.release })
      return true
    },
    [ensureContext, noteOff],
  )

  const stopAll = useCallback(() => {
    const ctx = ctxRef.current
    if (!ctx) return
    voicesRef.current.forEach((voice) => fadeOut(voice, ctx, 0.03))
    voicesRef.current.clear()
  }, [])

  // On unmount: silence every note and close the audio context.
  useEffect(() => {
    return () => {
      stopAll()
      ctxRef.current?.close()
      ctxRef.current = null
      masterRef.current = null
    }
  }, [stopAll])

  const supported = typeof window !== 'undefined' && Boolean(window.AudioContext || window.webkitAudioContext)
  return { noteOn, noteOff, stopAll, supported }
}
