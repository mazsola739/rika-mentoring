import { useEffect, useRef, useState } from 'react'
import { PHOTOS } from './photos.js'

// Every picture of the gallery, in the order the grid and the carousel show them.
// The samples come first; uploads go to the front. Uploaded files become temporary blob: URLs:
// they take memory until we revoke them, so each URL is revoked when its picture is removed,
// and all of them when the gallery goes away.
export function usePhotos() {
  const [photos, setPhotos] = useState(PHOTOS)
  const urls = useRef(new Set())

  useEffect(() => {
    const created = urls.current
    return () => {
      created.forEach((url) => URL.revokeObjectURL(url))
      created.clear()
    }
  }, [])

  const add = (fileList) => {
    const files = [...fileList]
    const images = files.filter((file) => file.type.startsWith('image/'))
    const items = images.map((file) => {
      const src = URL.createObjectURL(file)
      urls.current.add(src)
      return {
        id: crypto.randomUUID(),
        upload: true,
        album: 'uploads',
        src,
        name: file.name.replace(/\.[^.]+$/, ''),
      }
    })
    setPhotos((list) => [...items, ...list])
    return { added: items.length, skipped: files.length - images.length }
  }

  const remove = (id) => {
    const item = photos.find((photo) => photo.id === id)
    if (!item?.upload) return
    URL.revokeObjectURL(item.src)
    urls.current.delete(item.src)
    setPhotos((list) => list.filter((photo) => photo.id !== id))
  }

  // The picture `fromId` takes the place of `toId`, the ones in between slide over by one.
  // It works by id in the whole list, so it is exact inside an album too. splice runs on a copy only.
  const move = (fromId, toId) =>
    setPhotos((list) => {
      const from = list.findIndex((photo) => photo.id === fromId)
      const to = list.findIndex((photo) => photo.id === toId)
      // Something else was dropped (a file, for example), or a picture on itself: nothing to do.
      if (from === -1 || to === -1 || from === to) return list
      const next = [...list]
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      return next
    })

  return { photos, add, remove, move }
}
