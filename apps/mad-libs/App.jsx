import { useState } from 'react'
import AppFrame from '@shared/ui/AppFrame.jsx'
import { useLang, useText } from '@shared/i18n.js'
import { PEACOCK } from '@shared/ui/palette.js'
import { TEXT } from './text.js'
import { START_TEMPLATE, TEMPLATES, templateProblem } from './templates.js'
import { sharedTemplate } from './share.js'
import ChipPicker from './ChipPicker.jsx'
import StoryEditor from './StoryEditor.jsx'
import MadLib from './MadLib.jsx'
import './app.css'

// The two players' colours come from the site palette: turquoise for player 1, gold for player 2.
const PLAYER_COLORS = { '--ml-p1': PEACOCK.tealLight, '--ml-p2': PEACOCK.gold }

function MadLibs() {
  const lang = useLang()
  const t = useText(TEXT)
  // A shared link (#story=…) opens on its template. Lazy initial state: the address is read only once.
  const [storyId, setStoryId] = useState(() => (sharedTemplate() !== null ? 'custom' : TEMPLATES.en[0].id))
  // null means "the starting template, in the current language" until the player writes their own.
  const [customText, setCustomText] = useState(() => sharedTemplate())
  const [players, setPlayers] = useState(1)

  // The player's own story has the same shape as the ready-made ones, so the picker and MadLib treat it alike.
  const templates = TEMPLATES[lang]
  const customStory = { id: 'custom', title: t.custom, text: customText ?? START_TEMPLATE[lang] }
  const stories = [...templates, customStory]
  const story = stories.find((item) => item.id === storyId) ?? templates[0]
  const playable = templateProblem(story.text) === ''

  function pickRandom() {
    // Only the ready-made stories, and always a different one.
    const others = templates.filter((item) => item.id !== storyId)
    setStoryId(others[Math.floor(Math.random() * others.length)].id)
  }

  return (
    <div className="ml" style={PLAYER_COLORS}>
      <ChipPicker
        label={t.choose}
        options={stories.map((item) => ({ value: item.id, label: item.title }))}
        selected={storyId}
        onSelect={setStoryId}
        extra={
          <button type="button" className="chip ml__random" onClick={pickRandom}>
            {t.random}
          </button>
        }
      />
      <ChipPicker
        label={t.players}
        options={[1, 2].map((count) => ({ value: count, label: t.playerCounts[count] }))}
        selected={players}
        onSelect={setPlayers}
      />

      {/* With two players the template stays hidden: nobody peeks, and nobody edits it mid-game. */}
      {story.id === 'custom' &&
        (players === 1 ? (
          <StoryEditor text={customStory.text} onChange={setCustomText} />
        ) : (
          <p className="ml__note">{t.hiddenEditor}</p>
        ))}

      {/* A new language, story or number of players means a new key: a fresh MadLib with empty words.
          Editing your own template keeps the key, so the words already typed stay. */}
      {playable && <MadLib key={`${lang}-${story.id}-${players}`} story={story} players={players} />}
    </div>
  )
}

export default function App() {
  return (
    <AppFrame slug="mad-libs">
      <MadLibs />
    </AppFrame>
  )
}
