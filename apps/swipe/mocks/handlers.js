// The endpoints of the lessons' shared TV API that Swipe calls (they run in the browser via MSW):
//   GET /api/tv/shows?page=1                → the first page of shows (40 per page)
//   GET /api/tv/posters/:id/original.svg    → the posters (also medium.svg)
// The catalogue of made-up shows lives in @shared/mock-api/shows.js.
import { posterImages, showList } from '@shared/mock-api/shows-handlers.js'

export const handlers = [showList, posterImages]
