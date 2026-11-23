import { useEffect, useState } from 'react'
import AppFrame from '@shared/ui/AppFrame.jsx'
import { useLang, useText } from '@shared/i18n.js'
import { useNow, usePlants } from './usePlants.js'
import { byThirst, waterStatus, watered } from './plantMath.js'
import { createSamplePlants } from './samplePlants.js'
import PlantCard from './PlantCard.jsx'
import PlantForm from './PlantForm.jsx'
import { TEXT, tx } from './text.js'
import './app.css'

function makeFormatters(lang) {
  const locale = lang === 'hu' ? 'hu-HU' : 'en-GB'
  const relative = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
  const dateTime = new Intl.DateTimeFormat(locale, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  return {
    relative: (daysAgo) => relative.format(-daysAgo, 'day'), // "today", "yesterday", "3 days ago"
    dateTime: (iso) => dateTime.format(new Date(iso)),
  }
}

function PlantCare() {
  const t = useText(TEXT)
  const lang = useLang()
  const now = useNow()
  const [plants, setPlants, saveFailed] = usePlants()
  const [watering, setWatering] = useState(null) // { ids, before } for the undo message
  const fmt = makeFormatters(lang)

  const thirsty = plants.filter((p) => waterStatus(p, now).state === 'thirsty')

  // The undo offer disappears after a while; the cleanup cancels an older timer.
  useEffect(() => {
    if (!watering) return
    const timer = setTimeout(() => setWatering(null), 8000)
    return () => clearTimeout(timer)
  }, [watering])

  const water = (ids) => {
    setWatering({ ids, before: plants.filter((p) => ids.includes(p.id)) })
    const at = new Date()
    setPlants((list) => list.map((p) => (ids.includes(p.id) ? watered(p, at) : p)))
  }

  const undo = () => {
    const before = Object.fromEntries(watering.before.map((p) => [p.id, p]))
    setPlants((list) => list.map((p) => before[p.id] ?? p))
    setWatering(null)
  }

  const save = (plant) => setPlants((list) => list.map((p) => (p.id === plant.id ? plant : p)))
  const add = (plant) => setPlants((list) => [...list, plant])
  const remove = (id) => setPlants((list) => list.filter((p) => p.id !== id))
  // The list keeps its order while you water, so cards never jump away under the cursor.
  const sortByThirst = () => setPlants((list) => [...list].sort(byThirst(new Date())))

  const wateredText =
    watering &&
    (watering.ids.length === 1
      ? t.wateredMsg(tx(watering.before[0]?.name, lang))
      : t.wateredAll(watering.ids.length))

  return (
    <div className="pc">
      <section className={`pc-summary${thirsty.length ? ' solid' : ''}`}>
        <div>
          <p className="pc-summary__title">{thirsty.length ? t.summary.thirsty(thirsty.length) : t.summary.happy}</p>
          <p className="pc-summary__sub">{t.summary.total(plants.length)}</p>
        </div>
        <div className="pc-row">
          {thirsty.length > 1 && (
            <button type="button" className="btn pc-summary__btn" onClick={() => water(thirsty.map((p) => p.id))}>
              <span aria-hidden="true">💧</span> {t.summary.waterAll}
            </button>
          )}
          {plants.length > 1 && (
            <button type="button" className="btn btn--ghost" onClick={sortByThirst}>
              {t.summary.sort}
            </button>
          )}
        </div>
      </section>

      {saveFailed && (
        <p className="pc-alert" role="alert">
          {t.storageFull}
        </p>
      )}

      <div className="pc-status" role="status">
        {wateredText && (
          <>
            <span>{wateredText}</span>
            <button type="button" className="pc-link" onClick={undo}>
              {t.undo}
            </button>
          </>
        )}
      </div>

      {plants.length ? (
        <ul className="pc-grid">
          {plants.map((plant) => (
            <PlantCard
              key={plant.id}
              plant={plant}
              now={now}
              fmt={fmt}
              lang={lang}
              t={t}
              onWater={water}
              onSave={save}
              onDelete={remove}
            />
          ))}
        </ul>
      ) : (
        <div className="pc-empty">
          <p>{t.empty}</p>
          <button type="button" className="btn btn--ghost" onClick={() => setPlants(createSamplePlants())}>
            {t.samples}
          </button>
        </div>
      )}

      <PlantForm lang={lang} t={t} onSave={add} />

      <p className="pc-foot">{t.saved}</p>
    </div>
  )
}

export default function App() {
  return (
    <AppFrame slug="plant-care">
      <PlantCare />
    </AppFrame>
  )
}
