import { useState } from 'react'
import AppFrame from '@shared/ui/AppFrame.jsx'
import { useLang, useText } from '@shared/i18n.js'
import { useLocalStorage } from './useLocalStorage.js'
import { SEED_CARDS, SEED_DECKS, label } from './deck.js'
import Study from './Study.jsx'
import Editor from './Editor.jsx'
import './app.css'

const TEXT = {
  en: {
    decks: 'Decks',
    newDeck: 'New deck',
    deckName: 'Deck name',
    create: 'Create',
    cancel: 'Cancel',
    deleteDeck: 'Delete deck',
    confirmDelete: 'Delete for good',
    views: { study: 'Study', edit: 'Edit cards' },
    question: 'Question',
    answer: 'Answer',
    tapToFlip: 'Click or press Space to flip',
    progress: 'Progress',
    knownOf: (k, n) => `${k} of ${n} known`,
    cardOf: (i, n) => `Card ${i} / ${n}`,
    prev: 'Previous card',
    next: 'Next card',
    know: 'I know it',
    dontKnow: 'Not yet',
    markedKnown: 'Known',
    markedLearning: 'Learning',
    keys: 'Space: flip · ← →: previous / next',
    shuffle: 'Shuffle',
    onlyLearning: (n) => `Only cards I'm learning (${n})`,
    resetProgress: 'Reset progress',
    roundDone: 'Round complete',
    allKnown: 'You know every card!',
    summary: (k, l) => `${k} known, ${l} still to learn.`,
    practiceLearning: (n) => `Practice the ${n} I don't know`,
    studyAll: 'Study all cards again',
    emptyDeck: 'This deck is empty',
    emptyDeckText: 'Add a few questions and answers, then come back to study.',
    addCards: 'Add cards',
    newCard: 'New card',
    editCard: 'Edit card',
    addCard: 'Add card',
    saveCard: 'Save changes',
    cardsInDeck: (n) => `${n} ${n === 1 ? 'card' : 'cards'} in this deck`,
    noCards: 'No cards yet. Use the form above to write your first one.',
    restore: 'Restore sample cards',
    edit: 'Edit',
    delete: 'Delete',
  },
  hu: {
    decks: 'Paklik',
    newDeck: 'Új pakli',
    deckName: 'A pakli neve',
    create: 'Létrehozás',
    cancel: 'Mégse',
    deleteDeck: 'Pakli törlése',
    confirmDelete: 'Végleges törlés',
    views: { study: 'Tanulás', edit: 'Kártyák szerkesztése' },
    question: 'Kérdés',
    answer: 'Válasz',
    tapToFlip: 'Kattints vagy nyomd meg a szóközt a megfordításhoz',
    progress: 'Haladás',
    knownOf: (k, n) => `${k} / ${n} kártya megtanulva`,
    cardOf: (i, n) => `${i}. kártya / ${n}`,
    prev: 'Előző kártya',
    next: 'Következő kártya',
    know: 'Tudom',
    dontKnow: 'Még nem',
    markedKnown: 'Tudom',
    markedLearning: 'Tanulom',
    keys: 'Szóköz: fordítás · ← →: előző / következő',
    shuffle: 'Keverés',
    onlyLearning: (n) => `Csak amit még tanulok (${n})`,
    resetProgress: 'Haladás törlése',
    roundDone: 'Kör vége',
    allKnown: 'Minden kártyát tudsz!',
    summary: (k, l) => `${k} megtanulva, ${l} még tanulandó.`,
    practiceLearning: (n) => `Gyakorlás: ${n} még nem tudott kártya`,
    studyAll: 'Újra az összes kártya',
    emptyDeck: 'Ez a pakli üres',
    emptyDeckText: 'Írj bele néhány kérdést és választ, aztán gyere vissza tanulni.',
    addCards: 'Kártyák hozzáadása',
    newCard: 'Új kártya',
    editCard: 'Kártya szerkesztése',
    addCard: 'Kártya hozzáadása',
    saveCard: 'Mentés',
    cardsInDeck: (n) => `${n} kártya van a pakliban`,
    noCards: 'Még nincs kártya. A fenti űrlappal megírhatod az elsőt.',
    restore: 'Mintakártyák visszaállítása',
    edit: 'Szerkesztés',
    delete: 'Törlés',
  },
}

function DeckBar({ decks, activeId, onSelect, onCreate, t, lang }) {
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')

  const submit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    onCreate(name.trim())
    setName('')
    setCreating(false)
  }

  return (
    <div className="fc-decks">
      <span className="fc-decks__label">{t.decks}</span>
      <div className="fc-decks__chips">
        {decks.map((d) => (
          <button key={d.id} type="button" className="chip" aria-pressed={d.id === activeId} onClick={() => onSelect(d.id)}>
            {label(d.name, lang)}
            <span className="fc-decks__count">{d.cards.length}</span>
          </button>
        ))}
        {!creating && (
          <button type="button" className="chip fc-decks__new" onClick={() => setCreating(true)}>
            + {t.newDeck}
          </button>
        )}
      </div>
      {creating && (
        <form className="fc-decks__form" onSubmit={submit}>
          <label className="visually-hidden" htmlFor="fc-deck-name">
            {t.deckName}
          </label>
          <input
            id="fc-deck-name"
            className="input"
            value={name}
            placeholder={t.deckName}
            onChange={(e) => setName(e.target.value)}
            maxLength={40}
            autoFocus
          />
          <button type="submit" className="btn" disabled={!name.trim()}>
            {t.create}
          </button>
          <button type="button" className="btn btn--ghost" onClick={() => setCreating(false)}>
            {t.cancel}
          </button>
        </form>
      )}
    </div>
  )
}

function Flashcards() {
  const lang = useLang()
  const t = useText(TEXT)
  const [decks, setDecks] = useLocalStorage('rika:flashcards:decks', SEED_DECKS)
  const [progress, setProgress] = useLocalStorage('rika:flashcards:progress', {})
  const [activeId, setActiveId] = useLocalStorage('rika:flashcards:active', SEED_DECKS[0].id)
  const [view, setView] = useState('study')
  const [confirming, setConfirming] = useState(false)

  const deck = decks.find((d) => d.id === activeId) ?? decks[0] ?? SEED_DECKS[0]
  const marks = progress[deck.id] ?? {}

  // Immutable updates: map() returns a new array, the spread a new object, so React sees the change.
  const updateDeck = (id, change) => setDecks((list) => list.map((d) => (d.id === id ? { ...d, ...change(d) } : d)))

  const selectDeck = (id) => {
    setActiveId(id)
    setConfirming(false)
  }

  const createDeck = (name) => {
    const id = crypto.randomUUID()
    setDecks((list) => [...list, { id, name, cards: [] }])
    setActiveId(id)
    setView('edit')
  }

  const deleteDeck = () => {
    setDecks((list) => list.filter((d) => d.id !== deck.id))
    setProgress(({ [deck.id]: _removed, ...rest }) => rest)
    setActiveId(SEED_DECKS[0].id)
    setConfirming(false)
  }

  const setMark = (cardId, value) => setProgress((p) => ({ ...p, [deck.id]: { ...p[deck.id], [cardId]: value } }))

  const resetProgress = () => setProgress(({ [deck.id]: _removed, ...rest }) => rest)

  const addCard = (values) => updateDeck(deck.id, (d) => ({ cards: [...d.cards, { id: crypto.randomUUID(), ...values }] }))
  const updateCard = (cardId, values) =>
    updateDeck(deck.id, (d) => ({ cards: d.cards.map((c) => (c.id === cardId ? { ...c, ...values } : c)) }))
  const deleteCard = (cardId) => {
    updateDeck(deck.id, (d) => ({ cards: d.cards.filter((c) => c.id !== cardId) }))
    setProgress((p) => {
      const { [cardId]: _removed, ...rest } = p[deck.id] ?? {}
      return { ...p, [deck.id]: rest }
    })
  }
  const restoreSample = () =>
    updateDeck(deck.id, (d) => ({
      cards: [...SEED_CARDS, ...d.cards.filter((c) => !SEED_CARDS.some((s) => s.id === c.id))],
    }))

  return (
    <div className="fc">
      <DeckBar decks={decks} activeId={deck.id} onSelect={selectDeck} onCreate={createDeck} t={t} lang={lang} />

      <div className="fc-head">
        <h2 className="fc-title">{label(deck.name, lang)}</h2>
        <div className="fc-views" role="group" aria-label={label(deck.name, lang)}>
          {Object.entries(t.views).map(([key, text]) => (
            <button key={key} type="button" className="chip" aria-pressed={view === key} onClick={() => setView(key)}>
              {text}
            </button>
          ))}
        </div>
      </div>

      {/* key: a new deck gets a fresh study session (index, order, flip state). */}
      {view === 'study' ? (
        <Study
          key={deck.id}
          deck={deck}
          marks={marks}
          onMark={setMark}
          onResetProgress={resetProgress}
          onEditCards={() => setView('edit')}
          lang={lang}
          t={t}
        />
      ) : (
        <Editor
          key={deck.id}
          deck={deck}
          marks={marks}
          onAdd={addCard}
          onUpdate={updateCard}
          onDelete={deleteCard}
          onRestore={restoreSample}
          lang={lang}
          t={t}
        />
      )}

      {!deck.builtIn && view === 'edit' && (
        <div className="fc-danger">
          {confirming ? (
            <>
              <button type="button" className="btn fc-danger__confirm" onClick={deleteDeck}>
                {t.confirmDelete}
              </button>
              <button type="button" className="btn btn--ghost" onClick={() => setConfirming(false)}>
                {t.cancel}
              </button>
            </>
          ) : (
            <button type="button" className="btn btn--ghost" onClick={() => setConfirming(true)}>
              {t.deleteDeck}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default function App() {
  return (
    <AppFrame slug="flashcards">
      <Flashcards />
    </AppFrame>
  )
}
