export const ALBUMS = ['all', 'landscapes', 'shapes', 'patterns', 'uploads']

// A row of toggle buttons, only one of them pressed: the album the grid shows, with the number of pictures in each.
export default function AlbumFilter({ album, photos, t, onChange }) {
  return (
    <div className="ig-filters" role="group" aria-label={t.albumsLabel}>
      {ALBUMS.map((id) => {
        const count = id === 'all' ? photos.length : photos.filter((photo) => photo.album === id).length
        return (
          <button key={id} type="button" className="chip" aria-pressed={album === id} onClick={() => onChange(id)}>
            {t.albums[id]}
            <span className="ig-count">{count}</span>
          </button>
        )
      })}
    </div>
  )
}
