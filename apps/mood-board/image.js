// Resizes an uploaded image (longer side ≤ maxSize) into a JPEG data URL that fits into
// localStorage, and reports its aspect ratio so the board can keep its proportions.
export async function readImage(file, maxSize = 800, quality = 0.82) {
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
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, width, height)
    ctx.drawImage(img, 0, 0, width, height)
    return { src: canvas.toDataURL('image/jpeg', quality), ratio: height / width }
  } finally {
    URL.revokeObjectURL(url)
  }
}
