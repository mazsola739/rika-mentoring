import { useEffect, useRef, useState } from 'react'

// Uploaded files become temporary blob: URLs. They take memory until we revoke them,
// so this hook revokes each URL when its image is removed, and all of them on unmount.
export function useUploads() {
  const [uploads, setUploads] = useState([])
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
        kind: 'upload',
        src,
        thumb: src,
        name: file.name.replace(/\.[^.]+$/, ''),
      }
    })
    setUploads((list) => [...list, ...items])
    return { added: items.length, skipped: files.length - images.length }
  }

  const remove = (id) => {
    const item = uploads.find((u) => u.id === id)
    if (!item) return
    URL.revokeObjectURL(item.src)
    urls.current.delete(item.src)
    setUploads((list) => list.filter((u) => u.id !== id))
  }

  return { uploads, add, remove }
}
