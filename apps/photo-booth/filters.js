// Each filter is a list of steps. The same list becomes a CSS filter string (live preview,
// canvas ctx.filter) and, for browsers without ctx.filter, a pixel-by-pixel fallback.
export const FILTERS = {
  none: [],
  grayscale: [['grayscale', 1]],
  sepia: [['sepia', 0.85]],
  warm: [
    ['sepia', 0.25],
    ['saturate', 1.35],
    ['brightness', 1.05],
  ],
  contrast: [
    ['contrast', 1.55],
    ['saturate', 1.15],
  ],
}

export const FILTER_KEYS = Object.keys(FILTERS)

export const cssFilter = (key) => (FILTERS[key].length ? FILTERS[key].map(([name, v]) => `${name}(${v})`).join(' ') : 'none')

export const canvasSupportsFilter = typeof CanvasRenderingContext2D !== 'undefined' && 'filter' in CanvasRenderingContext2D.prototype

// 3×3 color matrices from the Filter Effects spec.
function matrix(name, a) {
  const k = 1 - a
  switch (name) {
    case 'grayscale':
      return [
        0.2126 + 0.7874 * k,
        0.7152 - 0.7152 * k,
        0.0722 - 0.0722 * k,
        0.2126 - 0.2126 * k,
        0.7152 + 0.2848 * k,
        0.0722 - 0.0722 * k,
        0.2126 - 0.2126 * k,
        0.7152 - 0.7152 * k,
        0.0722 + 0.9278 * k,
      ]
    case 'sepia':
      return [
        0.393 + 0.607 * k,
        0.769 - 0.769 * k,
        0.189 - 0.189 * k,
        0.349 - 0.349 * k,
        0.686 + 0.314 * k,
        0.168 - 0.168 * k,
        0.272 - 0.272 * k,
        0.534 - 0.534 * k,
        0.131 + 0.869 * k,
      ]
    case 'saturate':
      return [
        0.213 + 0.787 * a,
        0.715 - 0.715 * a,
        0.072 - 0.072 * a,
        0.213 - 0.213 * a,
        0.715 + 0.285 * a,
        0.072 - 0.072 * a,
        0.213 - 0.213 * a,
        0.715 - 0.715 * a,
        0.072 + 0.928 * a,
      ]
    default:
      return null
  }
}

export function applyFilterPixels(ctx, width, height, key) {
  const steps = FILTERS[key]
  if (!steps.length) return
  const image = ctx.getImageData(0, 0, width, height)
  const d = image.data
  for (let i = 0; i < d.length; i += 4) {
    let r = d[i]
    let g = d[i + 1]
    let b = d[i + 2]
    for (const [name, a] of steps) {
      if (name === 'brightness') {
        r *= a
        g *= a
        b *= a
      } else if (name === 'contrast') {
        const offset = 127.5 * (1 - a)
        r = r * a + offset
        g = g * a + offset
        b = b * a + offset
      } else {
        const m = matrix(name, a)
        ;[r, g, b] = [m[0] * r + m[1] * g + m[2] * b, m[3] * r + m[4] * g + m[5] * b, m[6] * r + m[7] * g + m[8] * b]
      }
    }
    d[i] = r // Uint8ClampedArray clamps to 0–255 by itself
    d[i + 1] = g
    d[i + 2] = b
  }
  ctx.putImageData(image, 0, 0)
}
