// Minden leckéhez létrehoz egy önálló micro frontendet az apps/<slug>/ mappában.
// Meglévő fájlt soha nem ír felül, így bátran újrafuttatható (npm run scaffold).
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'

const lessons = JSON.parse(readFileSync(new URL('../shared/lessons.json', import.meta.url), 'utf8'))

const files = (slug) => ({
  'index.html': `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#08392b" />
    <link rel="icon" type="image/svg+xml" href="../../favicon.svg" />
    <title>Rika Mentoring</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="./main.jsx"></script>
  </body>
</html>
`,
  'main.jsx': `import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@shared/ui/theme.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
`,
  'App.jsx': `import AppFrame from '@shared/ui/AppFrame.jsx'
import ComingSoon from '@shared/ui/ComingSoon.jsx'

export default function App() {
  return (
    <AppFrame slug="${slug}">
      <ComingSoon />
    </AppFrame>
  )
}
`,
})

let created = 0
for (const { slug } of lessons) {
  const dir = new URL(`../apps/${slug}/`, import.meta.url)
  mkdirSync(dir, { recursive: true })
  for (const [name, content] of Object.entries(files(slug))) {
    const file = new URL(name, dir)
    if (!existsSync(file)) {
      writeFileSync(file, content)
      created++
    }
  }
}
console.log(`scaffold: ${created} új fájl, ${lessons.length} app`)
