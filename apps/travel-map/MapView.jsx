import { useEffect, useImperativeHandle, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MAP } from './places.js'

// The map of the Huebloom Isles is one image, a static file of the site: no map tiles from the internet.
// It lives in public/media/travel-map/ so it has a stable address (the starter project can use it too).
// Set this to '../../media/travel-map/huebloom-isles.webp' once the drawn map is there (10:7 landscape);
// while it is null, the map's grid of squares is drawn instead.
export const WORLD_IMAGE = null

// A made-up world has no latitude or longitude, so the map uses Leaflet's CRS.Simple: plain flat
// coordinates, one unit per pixel at zoom 0. Leaflet calls them lat (up) and lng (right); the rest of
// the app uses x (right) and y (down) in map units, and these two helpers translate at the border.
const toLatLng = ({ x, y }) => L.latLng(-y, x)
const toPoint = (latlng) => ({ x: latlng.lng, y: -latlng.lat })
const WORLD_BOUNDS = L.latLngBounds([-MAP.height, 0], [0, MAP.width])
const MAX_ZOOM = 2 // a 3000 px wide map is still sharp at about zoom 1.5
const PLACE_ZOOM = 1

// The placeholder: a pale sky, the 100-unit squares, and their names (A–J, 1–7) along the edges.
function gridSvg() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('viewBox', `0 0 ${MAP.width} ${MAP.height}`)
  const lines = []
  const labels = []
  for (let x = MAP.square; x < MAP.width; x += MAP.square)
    lines.push(`<line x1="${x}" y1="0" x2="${x}" y2="${MAP.height}"/>`)
  for (let y = MAP.square; y < MAP.height; y += MAP.square)
    lines.push(`<line x1="0" y1="${y}" x2="${MAP.width}" y2="${y}"/>`)
  for (let c = 0; c < MAP.width / MAP.square; c++)
    labels.push(`<text x="${c * MAP.square + MAP.square / 2}" y="22">${String.fromCharCode(65 + c)}</text>`)
  for (let r = 0; r < MAP.height / MAP.square; r++)
    labels.push(`<text x="16" y="${r * MAP.square + MAP.square / 2 + 6}">${r + 1}</text>`)
  svg.innerHTML = `<rect width="${MAP.width}" height="${MAP.height}" class="tm-grid__sea"/><g class="tm-grid__lines">${lines.join('')}</g><g class="tm-grid__labels">${labels.join('')}</g>`
  return svg
}

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
    if (list.length === 0) map.fitBounds(WORLD_BOUNDS, { animate })
    else if (list.length === 1) map.setView(toLatLng(list[0]), PLACE_ZOOM, { animate })
    else map.fitBounds(L.latLngBounds(list.map(toLatLng)), { padding: [36, 36], maxZoom: PLACE_ZOOM, animate })
  }

  // Create the map once, and destroy it on unmount (StrictMode does this once on purpose).
  useEffect(() => {
    const map = L.map(containerRef.current, {
      crs: L.CRS.Simple,
      minZoom: -2,
      maxZoom: MAX_ZOOM,
      zoomSnap: 0.25,
      maxBounds: WORLD_BOUNDS.pad(0.1),
      maxBoundsViscosity: 1,
      attributionControl: false,
    })
    map.fitBounds(WORLD_BOUNDS)
    if (WORLD_IMAGE) L.imageOverlay(WORLD_IMAGE, WORLD_BOUNDS, { className: 'tm-world' }).addTo(map)
    else L.svgOverlay(gridSvg(), WORLD_BOUNDS, { className: 'tm-grid', interactive: false }).addTo(map)
    markersLayer.current = L.layerGroup().addTo(map)
    draftLayer.current = L.layerGroup().addTo(map)
    map.on('click', (e) => latest.current.onMapClick(toPoint(e.latlng)))
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
      const marker = L.marker(toLatLng(place), {
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
      L.marker(toLatLng(draft), {
        icon: pinIcon(colors.draft, { draft: true }),
        interactive: false,
        keyboard: false,
      }).addTo(layer)
    }
  }, [draft, colors])

  useImperativeHandle(ref, () => ({
    fitTo,
    center: () => (mapRef.current ? toPoint(mapRef.current.getCenter()) : { x: MAP.width / 2, y: MAP.height / 2 }),
    focus(place) {
      const map = mapRef.current
      if (!map) return
      map.flyTo(toLatLng(place), Math.max(map.getZoom(), PLACE_ZOOM), {
        animate: !prefersReducedMotion(),
        duration: 0.8,
      })
    },
    panTo(point) {
      mapRef.current?.panTo(toLatLng(point), { animate: !prefersReducedMotion() })
    },
  }))

  return <div ref={containerRef} className="tm-map" role="region" aria-label={label} />
}

export default MapView
