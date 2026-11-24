// Small helpers for the pretend server's answers (handlers.js uses them).
import { HttpResponse, delay } from 'msw'

// A short, slightly varying wait, so loading states are visible like with a real server.
export const networkDelay = (min = 250, max = 700) => delay(min + Math.round(Math.random() * (max - min)))

// An SVG picture as an HTTP response (the meme templates are drawn in code, see templates.js).
export const svgResponse = (svg) =>
  new HttpResponse(svg, { headers: { 'Content-Type': 'image/svg+xml; charset=utf-8', 'Cache-Control': 'max-age=3600' } })

// A JSON error in the usual { error, message } shape.
export const errorResponse = (status, error, message) => HttpResponse.json({ error, message }, { status })
