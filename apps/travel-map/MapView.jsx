import { useEffect, useImperativeHandle, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const WORLD = { center: [25, 10], zoom: 2 }

// A CSS pin instead of Leaflet's default PNG marker (whose image paths break in bundlers).
// `color` only ever comes from our own palette constants, never from user input.
function pinIcon(color, { active = false, draft = false } = {}) {
  return L.divIcon({
    className: 'tm-marker',
    html: `<span class="tm-pin${active ? ' is-active' : ''}${draft ? ' is-draft' : ''}" style="--pin:${color}"></span>`,
    iconSize: [30, 40],
    iconAnchor: [15, 40],
    tooltipAnchor: [0, -38],
  })
}

// User text goes in with textContent, so a place called "<img onerror=…>" stays plain text.
function tooltipContent(name, status) {
  const el = document.createElement('div')
  el.className = 'tm-tip'
  const strong = document.createElement('strong')
  strong.textContent = name
  const small = document.createElement('small')
  small.textContent = status
  el.append(strong, small)
  return el
}

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Leaflet owns its DOM; React owns the data. Effects keep the two in sync.
// The parent gets a small imperative API through `ref` (fitTo, focus, center).
const MapView = ({ ref, places, selectedId, draft, colors, statusLabels, label, onMapClick, onSelect }) => {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const markersLayer = useRef(null)
  const draftLayer = useRef(null)
  const markers = useRef(new Map())
  const latest = useRef({ places, onMapClick, onSelect })

  // Event handlers registered once in Leaflet always reach the latest props through this ref.
  useEffect(() => {
    latest.current = { places, onMapClick, onSelect }
  })

  const fitTo = (list) => {
    const map = mapRef.current
    if (!map) return
    const animate = !prefersReducedMotion()
    if (list.length === 0) map.setView(WORLD.center, WORLD.zoom, { animate })
    else if (list.length === 1) map.setView([list[0].lat, list[0].lng], 6, { animate })
    else map.fitBounds(L.latLngBounds(list.map((p) => [p.lat, p.lng])), { padding: [36, 36], maxZoom: 8, animate })
  }

  // Create the map once, and destroy it on unmount (StrictMode does this once on purpose).
  useEffect(() => {
    const map = L.map(containerRef.current, { center: WORLD.center, zoom: WORLD.zoom, minZoom: 2, worldCopyJump: true })
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map)
    markersLayer.current = L.layerGroup().addTo(map)
    draftLayer.current = L.layerGroup().addTo(map)
    map.on('click', (e) => latest.current.onMapClick(e.latlng.wrap()))
    mapRef.current = map
    fitTo(latest.current.places)

    // The map has to re-measure itself when its box changes size (layout switch, window resize).
    const observer = new ResizeObserver(() => map.invalidateSize())
    observer.observe(containerRef.current)

    return () => {
      observer.disconnect()
      map.remove()
      mapRef.current = null
      markers.current.clear()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Re-draw the markers whenever the places, the selection or the language change.
  useEffect(() => {
    const layer = markersLayer.current
    if (!layer) return
    layer.clearLayers()
    markers.current.clear()
    places.forEach((place) => {
      const active = place.id === selectedId
      const marker = L.marker([place.lat, place.lng], {
        icon: pinIcon(colors[place.status], { active }),
        title: place.name,
        riseOnHover: true,
        zIndexOffset: active ? 1000 : 0,
      })
      marker.bindTooltip(tooltipContent(place.name, statusLabels[place.status]), { direction: 'top' })
      marker.on('click', () => latest.current.onSelect(place.id))
      marker.addTo(layer)
      if (active) marker.openTooltip()
      markers.current.set(place.id, marker)
    })
  }, [places, selectedId, colors, statusLabels])

  // The pin of the place being added or edited.
  useEffect(() => {
    const layer = draftLayer.current
    if (!layer) return
    layer.clearLayers()
    if (draft) {
      L.marker([draft.lat, draft.lng], { icon: pinIcon(colors.draft, { draft: true }), interactive: false, keyboard: false }).addTo(layer)
    }
  }, [draft, colors])

  useImperativeHandle(ref, () => ({
    fitTo,
    center: () => mapRef.current?.getCenter().wrap() ?? L.latLng(WORLD.center),
    focus(place) {
      const map = mapRef.current
      if (!map) return
      map.flyTo([place.lat, place.lng], Math.max(map.getZoom(), 6), { animate: !prefersReducedMotion(), duration: 0.8 })
    },
    panTo(latlng) {
      mapRef.current?.panTo(latlng, { animate: !prefersReducedMotion() })
    },
  }))

  return <div ref={containerRef} className="tm-map" role="region" aria-label={label} />
}

export default MapView
