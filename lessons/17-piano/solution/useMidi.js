import { useEffect, useEffectEvent, useRef, useState } from 'react'

// MIDI keyboards through the Web MIDI API. The browser asks for permission, so we only ask when the player
// clicks "Connect", never on page load. onNoteOn and onNoteOff get the MIDI number of the note.
export function useMidi(onNoteOn, onNoteOff) {
  const [access, setAccess] = useState(null) // MIDIAccess, once the browser allowed it
  const [status, setStatus] = useState('idle') // 'idle' | 'asking' | 'ready' | 'denied'
  const [devices, setDevices] = useState([]) // names of the connected keyboards
  const heldRef = useRef(new Set()) // notes held down on a MIDI keyboard right now
  const supported = typeof navigator !== 'undefined' && 'requestMIDIAccess' in navigator

  async function connect() {
    setStatus('asking')
    try {
      setAccess(await navigator.requestMIDIAccess())
      setStatus('ready')
    } catch {
      setStatus('denied')
    }
  }

  // An Effect Event always calls the latest onNoteOn / onNoteOff, so the listeners never have to be replaced.
  const handleMessage = useEffectEvent((message) => {
    const [command, midi, velocity] = message.data
    // 144–159: note on (one per channel, 16 channels); 128–143: note off.
    // Many keyboards send "note on with velocity 0" instead of a note off.
    if (command >= 144 && command <= 159 && velocity > 0) {
      heldRef.current.add(midi)
      onNoteOn(midi)
    } else if (command >= 128 && command <= 159) {
      if (!heldRef.current.delete(midi)) return
      onNoteOff(midi)
    }
  })

  // A keyboard unplugged while a key is held would never send the note off: let go of everything.
  const releaseHeld = useEffectEvent(() => {
    heldRef.current.forEach((midi) => onNoteOff(midi))
    heldRef.current.clear()
  })

  // Listen to every connected input, and again whenever something is plugged in or out.
  useEffect(() => {
    if (access === null) return
    function listen(event) {
      const inputs = [...access.inputs.values()].filter((input) => input.state === 'connected')
      inputs.forEach((input) => {
        input.onmidimessage = handleMessage
      })
      setDevices(inputs.map((input) => input.name || input.manufacturer || 'MIDI'))
      if (event?.port?.type === 'input' && event.port.state === 'disconnected') releaseHeld()
    }
    listen()
    access.onstatechange = listen
    return () => {
      access.onstatechange = null
      access.inputs.forEach((input) => {
        input.onmidimessage = null
      })
      releaseHeld()
    }
  }, [access])

  return { supported, status, devices, connect }
}
