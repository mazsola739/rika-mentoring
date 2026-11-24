// Small helpers for the pretend server's answers (handlers.js and accounts.js use them).
import { HttpResponse, delay } from 'msw'

// A short, slightly varying wait, so loading states are visible like with a real server.
export const networkDelay = (min = 250, max = 700) => delay(min + Math.round(Math.random() * (max - min)))

// An SVG image as an HTTP response (the book covers are drawn in code, see covers.js).
export const svgResponse = (svg) =>
  new HttpResponse(svg, { headers: { 'Content-Type': 'image/svg+xml; charset=utf-8', 'Cache-Control': 'max-age=3600' } })

// A JSON error in the usual { error, message } shape.
export const errorResponse = (status, error, message) => HttpResponse.json({ error, message }, { status })

// Escapes text for use inside SVG/XML.
export const xml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c])
