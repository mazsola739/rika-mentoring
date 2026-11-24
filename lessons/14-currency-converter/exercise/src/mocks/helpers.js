// Small helpers for the pretend server's answers (copied from the Rika Mentoring site).
import { HttpResponse, delay } from 'msw'

// A short, slightly varying wait, so loading states are visible like with a real server.
export const networkDelay = (min = 250, max = 700) => delay(min + Math.round(Math.random() * (max - min)))

// A JSON error in the usual { error, message } shape, for example 404 or 503.
export const errorResponse = (status, error, message) => HttpResponse.json({ error, message }, { status })
