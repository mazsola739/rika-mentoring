// A small SVG line chart: every value is a point, from left to right.
export default function SpeedChart({ values, caption, t }) {
  // A line needs at least two points.
  if (values.length < 2) return null

  const width = 300
  const height = 100
  const peak = Math.max(...values)
  // The top of the chart is the biggest value, but at least 10, so a slow start does not reach the sky.
  const top = Math.max(10, peak)
  const points = values
    .map((value, i) => `${(i / (values.length - 1)) * width},${height - (value / top) * height}`)
    .join(' ')

  return (
    <figure className="tt-chart">
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-hidden="true">
        <polyline points={points} />
      </svg>
      <figcaption>
        {caption} · {t.peak(peak)}
      </figcaption>
    </figure>
  )
}
