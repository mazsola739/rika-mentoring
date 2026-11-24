// Downloads an address (a blob: or data: URL) under the given file name: we "click" an invisible link.
export function downloadUrl(url, fileName) {
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  // Some browsers only start a download from a link that is on the page, so it goes there for a moment.
  document.body.append(link)
  link.click()
  link.remove()
}

// Turns a data: URL into a File. fetch() "downloads" data: addresses too: we get the picture's bytes back.
async function toFile(dataUrl, fileName) {
  const response = await fetch(dataUrl)
  const blob = await response.blob()
  return new File([blob], fileName, { type: blob.type })
}

// Shares a picture with the system's share window (Web Share API). Where that is not possible, it downloads it.
export async function shareImage(dataUrl, fileName = 'meme.jpg') {
  const file = await toFile(dataUrl, fileName)
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file] })
      return 'shared'
    } catch (error) {
      // AbortError: the user closed the share window. That is not a failure, there is nothing more to do.
      if (error.name === 'AbortError') return 'cancelled'
    }
  }
  downloadUrl(dataUrl, fileName)
  return 'downloaded'
}
