// The parts of the TV API this app uses. MSW answers them in the browser:
//   GET /api/tv/search/shows?q=lighthouse   → the best matches, at most 10: [{ score, show }]
//   GET /api/tv/shows/1                     → one series (404 Not Found if there is no such id)
//   GET /api/tv/shows?page=1                → every series, 40 per page (404 past the last page)
//   GET /api/tv/posters/1/medium.svg        → a poster, drawn in code
//   GET /api/tv/people/301/medium.svg       → a portrait of a cast member, drawn in code
// Like a real public API, it allows at most 20 requests in 10 seconds; after that it answers 429 Too Many Requests.
// The series themselves are in shows.js: all of them are made up for the lessons.
import { peopleImages, posterImages, showDetails, showList, showSearch } from './shows-handlers.js'

export const handlers = [showSearch, showDetails, showList, posterImages, peopleImages]
