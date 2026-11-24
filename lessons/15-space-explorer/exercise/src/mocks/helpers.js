// Small helpers for the pretend server's answers (handlers.js).
import { HttpResponse, delay } from 'msw'

// A short, slightly varying wait, so loading states are visible like with a real server.
export const networkDelay = (min = 250, max = 700) => delay(min + Math.round(Math.random() * (max - min)))

// An SVG picture as an HTTP response. The browser may keep it in its own cache for an hour.
export const svgResponse = (svg) =>
  new HttpResponse(svg, { headers: { 'Content-Type': 'image/svg+xml; charset=utf-8', 'Cache-Control': 'max-age=3600' } })

// A JSON error in the usual { error, message } shape, with an HTTP status code such as 400 or 403.
export const errorResponse = (status, error, message) => HttpResponse.json({ error, message }, { status })
