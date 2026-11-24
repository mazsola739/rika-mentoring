// AudioBuffer → 16-bit PCM WAV Blob. A WAV file is a 44-byte header followed by raw samples.
export function audioBufferToWav(buffer) {
  const channels = buffer.numberOfChannels
  const rate = buffer.sampleRate
  const frames = buffer.length
  const blockAlign = channels * 2
  const dataSize = frames * blockAlign
  const view = new DataView(new ArrayBuffer(44 + dataSize))

  const text = (offset, value) => [...value].forEach((ch, i) => view.setUint8(offset + i, ch.charCodeAt(0)))
  text(0, 'RIFF')
  view.setUint32(4, 36 + dataSize, true)
  text(8, 'WAVE')
  text(12, 'fmt ')
  view.setUint32(16, 16, true) // size of the fmt chunk
  view.setUint16(20, 1, true) // PCM
  view.setUint16(22, channels, true)
  view.setUint32(24, rate, true)
  view.setUint32(28, rate * blockAlign, true) // bytes per second
  view.setUint16(32, blockAlign, true)
  view.setUint16(34, 16, true) // bits per sample
  text(36, 'data')
  view.setUint32(40, dataSize, true)

  // Normalize to 90 % of full scale so nothing clips, then interleave the channels.
  const data = Array.from({ length: channels }, (_, c) => buffer.getChannelData(c))
  let peak = 0
  data.forEach((ch) => {
    for (let i = 0; i < ch.length; i++) peak = Math.max(peak, Math.abs(ch[i]))
  })
  const gain = peak > 0 ? 0.9 / peak : 1

  let offset = 44
  for (let i = 0; i < frames; i++) {
    for (let c = 0; c < channels; c++) {
      const sample = Math.max(-1, Math.min(1, data[c][i] * gain))
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true)
      offset += 2
    }
  }
  return new Blob([view], { type: 'audio/wav' })
}
