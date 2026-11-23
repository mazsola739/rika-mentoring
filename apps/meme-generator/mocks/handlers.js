// The lesson's own meme template API (runs in the browser via MSW, see @shared/mock-api).
// It answers in the same shape as the popular imgflip API:
//   GET /api/memes?lang=en         → { success: true, data: { memes: [{ id, name, url, width, height, box_count }] } }
//   GET /api/memes/images/<id>.svg → the template picture (drawn in code, see templates.js)
import { http, HttpResponse } from 'msw'
import { errorResponse, networkDelay, svgResponse } from '@shared/mock-api/msw.js'
import { TEMPLATES } from './templates.js'

export const handlers = [
  http.get('/api/memes', async ({ request }) => {
    await networkDelay()
    const url = new URL(request.url)
    const lang = url.searchParams.get('lang') === 'hu' ? 'hu' : 'en'
    const memes = TEMPLATES.map((template) => ({
      id: template.id,
      name: template.name[lang],
      // Absolute picture addresses, like a real API sends them.
      url: new URL(`/api/memes/images/${template.id}.svg`, url.origin).href,
      width: template.width,
      height: template.height,
      box_count: template.boxCount,
    }))
    return HttpResponse.json({ success: true, data: { memes } })
  }),

  http.get('/api/memes/images/:file', async ({ params }) => {
    await networkDelay(80, 250)
    const template = TEMPLATES.find((t) => `${t.id}.svg` === params.file)
    return template ? svgResponse(template.svg) : errorResponse(404, 'not_found', 'No such template')
  }),
]
