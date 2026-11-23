import { useState } from 'react'
import AppFrame from '@shared/ui/AppFrame.jsx'
import { useText } from '@shared/i18n.js'
import { TEXT } from './text.js'
import { sampleItems } from './data.js'
import { useStoredState } from './useStoredState.js'
import ClosetView from './ClosetView.jsx'
import OutfitsView from './OutfitsView.jsx'
import './app.css'

const Wardrobe = () => {
  const t = useText(TEXT)
  const [tab, setTab] = useState('closet')
  // Items carry their photo as a small data URL, so everything fits into localStorage.
  const [items, setItems, itemsFailed] = useStoredState('rika:wardrobe:items', [])
  const [outfits, setOutfits, outfitsFailed] = useStoredState('rika:wardrobe:outfits', [])

  const addItem = (item) => setItems((list) => [...list, item])
  const removeItem = (id) => setItems((list) => list.filter((i) => i.id !== id))
  const loadSamples = () => setItems((list) => [...list, ...sampleItems()])
  const saveOutfit = (outfit) => setOutfits((list) => [...list, outfit])
  const removeOutfit = (id) => setOutfits((list) => list.filter((o) => o.id !== id))

  return (
    <div className="wr">
      <div className="wr-tabs" role="group" aria-label={t.views}>
        {['closet', 'outfits'].map((key) => (
          <button key={key} type="button" className="wr-tab" aria-pressed={tab === key} onClick={() => setTab(key)}>
            {t.tabs[key]}
            <span className="wr-tab__count">{key === 'closet' ? items.length : outfits.length}</span>
          </button>
        ))}
      </div>

      {(itemsFailed || outfitsFailed) && (
        <p className="wr-alert" role="alert">
          {t.storageFull}
        </p>
      )}

      {tab === 'closet' ? (
        <ClosetView items={items} onAdd={addItem} onRemove={removeItem} onLoadSamples={loadSamples} />
      ) : (
        <OutfitsView items={items} outfits={outfits} onSave={saveOutfit} onRemove={removeOutfit} />
      )}
    </div>
  )
}

const App = () => {
  return (
    <AppFrame slug="wardrobe">
      <Wardrobe />
    </AppFrame>
  )
}

export default App
