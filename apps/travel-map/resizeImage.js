// Shrinks a photo before it is saved: localStorage only holds a few megabytes,
// and a 480 px JPEG is plenty for a thumbnail.
export function resizeImage(file, maxSize = 480, quality = 0.8) {
  return new Promise((resolve, reject) => {
    if (!file?.type.startsWith('image/')) {
      reject(new Error('not-an-image'))
      return
    }
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(img.naturalWidth, img.naturalHeight))
      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, Math.round(img.naturalWidth * scale))
      canvas.height = Math.max(1, Math.round(img.naturalHeight * scale))
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = '#fff' // transparent PNGs would turn black as JPEG
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url) // always release the temporary object URL
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('unreadable-image'))
    }
    img.src = url
  })
}
