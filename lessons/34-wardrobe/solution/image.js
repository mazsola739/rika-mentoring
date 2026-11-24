// Shrinks a photo so its longer side is at most `maxSize` px and returns a JPEG data URL.
// Small images fit into localStorage; a phone photo would be several megabytes.
export async function downscaleImage(file, maxSize = 400, quality = 0.82) {
  if (!file.type.startsWith('image/')) throw new Error('not-an-image')
  const url = URL.createObjectURL(file)
  try {
    const img = new Image()
    img.src = url
    await img.decode()
    const scale = Math.min(1, maxSize / Math.max(img.naturalWidth, img.naturalHeight))
    const width = Math.max(1, Math.round(img.naturalWidth * scale))
    const height = Math.max(1, Math.round(img.naturalHeight * scale))
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#fff' // JPEG has no transparency
    ctx.fillRect(0, 0, width, height)
    ctx.drawImage(img, 0, 0, width, height)
    return canvas.toDataURL('image/jpeg', quality)
  } finally {
    // The temporary object URL is only needed while decoding.
    URL.revokeObjectURL(url)
  }
}
