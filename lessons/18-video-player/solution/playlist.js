// The clip is a static file of the site (public/media/video-player/), so it has a stable address that
// the lesson's exercise can use too. It is a placeholder until the site's own video arrives.
// The page lives at lessons/18-video-player/solution/, so the site root is three folders up.
const VIDEO_SRC = '../../../media/video-player/rika-sample.mp4'

// The site has one sample clip for now, so the playlist plays it from different points:
// "#t=10" at the end of an address (a media fragment) means "start at the 10th second".
export const PLAYLIST = [
  { id: 'whole', title: { en: 'The whole sample clip', hu: 'A teljes mintaklip' }, src: VIDEO_SRC },
  { id: 'from-10', title: { en: 'From the 10th second', hu: 'A 10. másodperctől' }, src: `${VIDEO_SRC}#t=10` },
  { id: 'last-10', title: { en: 'The last ten seconds', hu: 'Az utolsó tíz másodperc' }, src: `${VIDEO_SRC}#t=20` },
]
