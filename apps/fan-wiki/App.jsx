import { useEffect, useRef, useState } from 'react'
import AppFrame from '@shared/ui/AppFrame.jsx'
import { useText } from '@shared/i18n.js'
import { TEXT } from './text.js'
import { characterIdFrom, listHref, useHashRoute } from './useHashRoute.js'
import CharacterList, { filtersFrom } from './components/CharacterList.jsx'
import CharacterDetail from './components/CharacterDetail.jsx'
import './app.css'

function FanWiki() {
  const t = useText(TEXT)
  const { path, params } = useHashRoute()
  const characterId = characterIdFrom(path)
  const rootRef = useRef(null)

  // Remember the list's URL (filters + page), so "back to the list" returns to the same spot.
  const currentList = characterId ? null : listHref(filtersFrom(params))
  const [lastList, setLastList] = useState(currentList ?? '#/')
  if (currentList && currentList !== lastList) setLastList(currentList)

  // When switching between list and detail, bring the top of the app into view.
  const firstRender = useRef(true)
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    const top = rootRef.current?.getBoundingClientRect().top ?? 0
    if (top < 0) rootRef.current.scrollIntoView({ block: 'start' })
  }, [characterId])

  return (
    <div className="fw" ref={rootRef}>
      {characterId ? (
        <CharacterDetail key={characterId} id={characterId} backHref={lastList} t={t} />
      ) : (
        <CharacterList params={params} t={t} />
      )}
      <p className="fw-credit">
        <a href="https://rickandmortyapi.com/" target="_blank" rel="noreferrer">
          {t.credit}
        </a>
      </p>
    </div>
  )
}

export default function App() {
  return (
    <AppFrame slug="fan-wiki">
      <FanWiki />
    </AppFrame>
  )
}
