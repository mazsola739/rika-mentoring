import { useMemo, useRef, useState } from 'react'
import AppFrame, { useLesson } from '@shared/ui/AppFrame.jsx'
import { useLang, useText } from '@shared/i18n.js'
import { useLocalStorage } from './useLocalStorage.js'
import { STATUSES, createId, isPlaceList, localeOf, localize, samplePlaces } from './places.js'
import MapView from './MapView.jsx'
import PlaceForm from './PlaceForm.jsx'
import PlaceList from './PlaceList.jsx'
import { TEXT } from './text.js'
import './app.css'

const round = (n) => Math.round(n * 1e5) / 1e5
const matchesFilter = (place, filter) => filter === 'all' || place.status === filter

function TravelMap() {
  const lang = useLang()
  const t = useText(TEXT)
  const { palette } = useLesson()
  const [places, setPlaces, saveFailed] = useLocalStorage('rika:travel-map:places', samplePlaces, isPlaceList)
  const [filter, setFilter] = useState('all')
  const [selectedId, setSelectedId] = useState(null)
  const [draft, setDraft] = useState(null) // the place being added or edited: { id | null, lat, lng, name, status, note, photo }
  const [message, setMessage] = useState('')
  const mapApi = useRef(null)

  // Marker colors from the lesson palette. useMemo keeps the object stable, so markers are not redrawn for nothing.
  const colors = useMemo(() => ({ been: palette.colors[2], want: palette.colors[4], draft: palette.colors[5] }), [palette])

  const visible = places.filter((p) => matchesFilter(p, filter))
  const draftId = draft?.id
  const draftLat = draft?.lat
  const draftLng = draft?.lng
  // Only the coordinates matter to the map, so typing in the form does not redraw the pin.
  const draftPoint = useMemo(() => (draftLat === undefined ? null : { lat: draftLat, lng: draftLng }), [draftLat, draftLng])
  // The map gets plain-string names, and the place being edited is shown by the draft pin instead.
  const mapPlaces = useMemo(
    () =>
      places
        .filter((p) => matchesFilter(p, filter) && p.id !== draftId)
        .map((p) => ({ ...p, name: localize(p.name, lang) })),
    [places, filter, draftId, lang],
  )

  const been = places.filter((p) => p.status === 'been').length
  const percent = new Intl.NumberFormat(localeOf(lang), { style: 'percent', maximumFractionDigits: 0 })
  const counts = { all: places.length, been, want: places.length - been }

  const startDraft = (latlng) => {
    const point = { lat: round(latlng.lat), lng: round(latlng.lng) }
    // With a form open, a map click only moves its pin.
    setDraft((d) => (d ? { ...d, ...point } : { id: null, ...point, name: '', status: 'want', note: '', photo: null }))
    setSelectedId(null)
  }

  const addAtCenter = () => {
    const center = mapApi.current?.center()
    if (center) startDraft(center)
  }

  const editPlace = (place) => {
    setDraft({
      id: place.id,
      lat: place.lat,
      lng: place.lng,
      name: localize(place.name, lang),
      status: place.status,
      note: localize(place.note, lang),
      photo: place.photo ?? null,
    })
    setSelectedId(null)
    mapApi.current?.focus(place)
  }

  const saveDraft = () => {
    const data = {
      name: draft.name.trim(),
      lat: draft.lat,
      lng: draft.lng,
      status: draft.status,
      note: draft.note.trim(),
      photo: draft.photo,
    }
    if (draft.id) {
      setPlaces((list) => list.map((p) => (p.id === draft.id ? { ...p, ...data } : p)))
      setSelectedId(draft.id)
      setMessage(t.saved(data.name))
    } else {
      const id = createId()
      setPlaces((list) => [...list, { id, ...data }])
      setSelectedId(id)
      setMessage(t.added(data.name))
      if (!matchesFilter(data, filter)) setFilter('all')
    }
    setDraft(null)
  }

  const toggleStatus = (place) => {
    setPlaces((list) => list.map((p) => (p.id === place.id ? { ...p, status: p.status === 'been' ? 'want' : 'been' } : p)))
  }

  const deletePlace = (place) => {
    const name = localize(place.name, lang)
    if (!window.confirm(t.confirmDelete(name))) return
    setPlaces((list) => list.filter((p) => p.id !== place.id))
    if (selectedId === place.id) setSelectedId(null)
    if (draft?.id === place.id) setDraft(null)
    setMessage(t.deleted(name))
  }

  const selectPlace = (place) => {
    setSelectedId(place.id)
    mapApi.current?.focus(place)
  }

  const changeFilter = (next) => {
    setFilter(next)
    setSelectedId(null)
    mapApi.current?.fitTo(places.filter((p) => matchesFilter(p, next)))
  }

  const reset = () => {
    if (!window.confirm(t.resetConfirm)) return
    const sample = samplePlaces()
    setPlaces(sample)
    setDraft(null)
    setSelectedId(null)
    setFilter('all')
    mapApi.current?.fitTo(sample)
  }

  return (
    <div className="tm">
      <section className="tm-stats" aria-label={t.stats}>
        <dl className="tm-tiles">
          <div className="tm-tile">
            <dt>{t.total}</dt>
            <dd>{places.length}</dd>
          </div>
          {STATUSES.map((status) => (
            <div key={status} className="tm-tile" style={{ '--pin': colors[status] }}>
              <dt>
                <span className="tm-dot" aria-hidden="true" />
                {t.statuses[status]}
              </dt>
              <dd>{counts[status]}</dd>
            </div>
          ))}
        </dl>
        <div className="tm-progress">
          <span>{t.visited(percent.format(places.length ? been / places.length : 0))}</span>
          <span className="tm-progress__bar" aria-hidden="true">
            <span style={{ width: `${places.length ? (been / places.length) * 100 : 0}%`, background: colors.been }} />
          </span>
        </div>
      </section>

      <div className="tm-toolbar">
        <div className="tm-chips" role="group" aria-label={t.filter}>
          {['all', ...STATUSES].map((f) => (
            <button key={f} type="button" className="chip" aria-pressed={filter === f} onClick={() => changeFilter(f)}>
              {f === 'all' ? t.all : t.statuses[f]}
              <span className="tm-chip__count">{counts[f]}</span>
            </button>
          ))}
        </div>
        <div className="tm-toolbar__actions">
          <button type="button" className="btn btn--ghost" onClick={addAtCenter}>
            <span aria-hidden="true">+</span> {t.addCenter}
          </button>
          <button type="button" className="btn btn--ghost" onClick={() => mapApi.current?.fitTo(visible)}>
            {t.showAll}
          </button>
        </div>
      </div>

      {saveFailed && (
        <p className="tm-warning" role="alert">
          {t.saveError}
        </p>
      )}

      <div className="tm-layout">
        <div className="tm-mapcol">
          <MapView
            ref={mapApi}
            places={mapPlaces}
            selectedId={selectedId}
            draft={draftPoint}
            colors={colors}
            statusLabels={t.statuses}
            label={t.mapLabel}
            onMapClick={startDraft}
            onSelect={setSelectedId}
          />
          <p className="tm-hint">{t.mapHint}</p>
        </div>

        <div className="tm-side">
          {draft && (
            <PlaceForm
              key={draft.id ?? 'new'}
              draft={draft}
              onChange={(patch) => setDraft((d) => d && { ...d, ...patch })}
              onSave={saveDraft}
              onCancel={() => setDraft(null)}
            />
          )}
          <section className="tm-places" aria-labelledby="tm-list-title">
            <h3 id="tm-list-title" className="tm-side__title">
              {t.list}
              <span className="tm-chip__count">{visible.length}</span>
            </h3>
            <PlaceList
              places={visible}
              selectedId={selectedId}
              colors={colors}
              emptyText={places.length === 0 ? t.empty : t.noMatches}
              onSelect={selectPlace}
              onToggle={toggleStatus}
              onEdit={editPlace}
              onDelete={deletePlace}
            />
          </section>
        </div>
      </div>

      <div className="tm-footer">
        <button type="button" className="tm-link" onClick={reset}>
          {t.reset}
        </button>
      </div>

      <p className="visually-hidden" aria-live="polite">
        {message}
      </p>
    </div>
  )
}

export default function App() {
  return (
    <AppFrame slug="travel-map">
      <TravelMap />
    </AppFrame>
  )
}
