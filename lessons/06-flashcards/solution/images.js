// The picture's longer side will be this many pixels at most.
const MAX_SIZE = 480

// Shrinks a picture on a canvas that never goes on the page, and returns it as a JPEG data URL:
// a string small enough (about 20–60 kB) to be saved with the deck in localStorage.
export async function readImage(file) {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_SIZE / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(bitmap.width * scale))
  canvas.height = Math.max(1, Math.round(bitmap.height * scale))
  const context = canvas.getContext('2d')
  // A white background: JPEG knows nothing about transparency.
  context.fillStyle = '#fff'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  return canvas.toDataURL('image/jpeg', 0.8)
}
