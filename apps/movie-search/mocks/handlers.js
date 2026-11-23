// The endpoints of the lessons' shared TV API that Movie Search calls (they run in the browser via MSW):
//   GET /api/tv/search/shows?q=…                          → [{ score, show }]
//   GET /api/tv/shows/:id?embed[]=cast&embed[]=seasons    → one show with its cast and seasons (404 if unknown)
//   GET /api/tv/posters/:id/medium.svg, /api/tv/people/:id/medium.svg → the pictures
// The catalogue of made-up shows lives in @shared/mock-api/shows.js.
import { peopleImages, posterImages, showDetails, showSearch } from '@shared/mock-api/shows-handlers.js'

export const handlers = [showSearch, showDetails, posterImages, peopleImages]
