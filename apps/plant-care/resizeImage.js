// Phone photos are several MB, but localStorage only holds about 5 MB in total.
// So we draw the image onto a small canvas (max 400 px) and keep a compressed JPEG data URL.

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('decode'))
    img.src = src
  })
}

export async function resizeImage(file, maxSize = 400, quality = 0.82) {
  if (!file.type.startsWith('image/')) throw new Error('type')

  // An object URL points at the file without reading it into a string first.
  const url = URL.createObjectURL(file)
  try {
    const img = await loadImage(url)
    const scale = Math.min(1, maxSize / Math.max(img.naturalWidth, img.naturalHeight))
    const width = Math.max(1, Math.round(img.naturalWidth * scale))
    const height = Math.max(1, Math.round(img.naturalHeight * scale))

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#ffffff' // JPEG has no transparency: give PNGs a white background
    ctx.fillRect(0, 0, width, height)
    ctx.drawImage(img, 0, 0, width, height)
    return canvas.toDataURL('image/jpeg', quality)
  } finally {
    URL.revokeObjectURL(url) // always free the file reference, even after an error
  }
}
