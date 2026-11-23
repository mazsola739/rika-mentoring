import { useState } from 'react'
import AppFrame from '@shared/ui/AppFrame.jsx'
import { useLang, useText } from '@shared/i18n.js'
import { useLocalStorage } from './useLocalStorage.js'
import { SEED_DECKS, label, seedCardsOf, shuffled, withSampleDecks } from './deck.js'
import { getEntry, nextEntry } from './leitner.js'
import { clearSharedDeck, readSharedDeck } from './share.js'
import Study from './Study.jsx'
import Editor from './Editor.jsx'
import DeckTools from './DeckTools.jsx'
import SharedDeck from './SharedDeck.jsx'
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
    roundCard: (r, i, n) => `Round ${r} · card ${i} of ${n}`,
    box: (b) => `Box ${b}`,
    prev: 'Previous card',
    next: 'Next card',
    know: 'I know it',
    dontKnow: 'Not yet',
    keys: 'Space: flip · ← →: previous / next',
    shuffle: 'Shuffle',
    resetProgress: 'Reset progress',
    roundDone: 'Round complete',
    roundText: 'No more cards in this round. The ones you missed come back in the next round, the ones you knew only later.',
    allKnown: 'You know every card in this deck! They still come back now and then, so you keep them.',
    dueNext: (n) =>
      n === 0 ? 'Nothing is due in the next round yet.' : `${n} ${n === 1 ? 'card comes' : 'cards come'} up in the next round.`,
    nextRound: 'Next round',
    emptyDeck: 'This deck is empty',
    emptyDeckText: 'Add a few questions and answers, then come back to study.',
    addCards: 'Add cards',
    newCard: 'New card',
    editCard: 'Edit card',
    addCard: 'Add card',
    saveCard: 'Save changes',
    picture: 'Picture for the question',
    optional: '(optional)',
    pictureAlt: 'Description of the picture',
    pictureAltHint: '(read out by screen readers)',
    previewAlt: 'Picture of the card',
    removePicture: 'Remove picture',
    imageError: 'This file could not be read as a picture.',
    cardsInDeck: (n) => `${n} ${n === 1 ? 'card' : 'cards'} in this deck`,
    noCards: 'No cards yet. Use the form above to write your first one.',
    restore: 'Restore sample cards',
    edit: 'Edit',
    delete: 'Delete',
    saveShare: 'Save and share',
    toolsHint: 'The file keeps the pictures; the link leaves them out, so it stays short.',
    download: 'Download deck',
    load: 'Load deck',
    copyLink: 'Copy link',
    cardCount: (n) => `${n} ${n === 1 ? 'card' : 'cards'}`,
    loaded: (name, n) => `Loaded: ${name} (${n} ${n === 1 ? 'card' : 'cards'})`,
    notDeck: 'This file is not a deck. Choose a JSON file that this app saved.',
    copied: 'The link is on the clipboard: send it to whoever you want to share the deck with.',
    copyFailed: 'Could not copy the link to the clipboard.',
    sharedDeck: 'Shared deck',
    sharedIntro: 'Someone shared a deck with you:',
    accept: 'Add it',
    dismiss: 'No thanks',
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
    knownOf: (k, n) => `${k} / ${n} kártyát tudsz`,
    roundCard: (r, i, n) => `${r}. kör · ${i}. kártya / ${n}`,
    box: (b) => `${b}. doboz`,
    prev: 'Előző kártya',
    next: 'Következő kártya',
    know: 'Tudom',
    dontKnow: 'Még nem',
    keys: 'Szóköz: megfordítás · ← →: előző / következő',
    shuffle: 'Keverés',
    resetProgress: 'Haladás törlése',
    roundDone: 'Kör vége',
    roundText: 'Ebben a körben nincs több kártya. Amit nem tudtál, a következő körben visszajön, amit tudtál, csak később.',
    allKnown: 'Ebben a pakliban minden kártyát tudsz! Néha azért visszajönnek, hogy meg is maradjanak.',
    dueNext: (n) => (n === 0 ? 'A következő körben még nem jön kártya.' : `A következő körben ${n} kártya jön.`),
    nextRound: 'Következő kör',
    emptyDeck: 'Ez a pakli üres',
    emptyDeckText: 'Írj bele néhány kérdést és választ, aztán gyere vissza tanulni.',
    addCards: 'Kártyák hozzáadása',
    newCard: 'Új kártya',
    editCard: 'Kártya szerkesztése',
    addCard: 'Kártya hozzáadása',
    saveCard: 'Mentés',
    picture: 'Kép a kérdéshez',
    optional: '(nem kötelező)',
    pictureAlt: 'A kép leírása',
    pictureAltHint: '(a képernyőolvasók felolvassák)',
    previewAlt: 'A kártya képe',
    removePicture: 'Kép eltávolítása',
    imageError: 'Ezt a fájlt nem sikerült képként beolvasni.',
    cardsInDeck: (n) => `${n} kártya van a pakliban`,
    noCards: 'Még nincs kártya. A fenti űrlappal megírhatod az elsőt.',
    restore: 'Mintakártyák visszaállítása',
    edit: 'Szerkesztés',
    delete: 'Törlés',
    saveShare: 'Mentés és megosztás',
    toolsHint: 'A fájlban a képek is megmaradnak, a linkből kimaradnak, hogy rövid maradjon.',
    download: 'Pakli letöltése',
    load: 'Pakli betöltése',
    copyLink: 'Link másolása',
    cardCount: (n) => `${n} kártya`,
    loaded: (name, n) => `Betöltve: ${name} (${n} kártya)`,
    notDeck: 'Ez a fájl nem egy pakli. Olyan JSON-fájlt válassz, amit ez az app mentett.',
    copied: 'A link a vágólapon: küldd el annak, akivel megosztanád a paklit.',
    copyFailed: 'Nem sikerült a vágólapra másolni a linket.',
    sharedDeck: 'Megosztott pakli',
    sharedIntro: 'Valaki megosztott veled egy paklit:',
    accept: 'Hozzáadom',
    dismiss: 'Nem kérem',
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

// Removes the Leitner entries of the given cards (a deleted deck or card, or a progress reset).
const withoutCards = (progress, ids) => Object.fromEntries(Object.entries(progress).filter(([id]) => !ids.includes(id)))

function Flashcards() {
  const lang = useLang()
  const t = useText(TEXT)
  const [decks, setDecks] = useLocalStorage('rika:flashcards:decks', SEED_DECKS, withSampleDecks)
  const [activeId, setActiveId] = useLocalStorage('rika:flashcards:active', SEED_DECKS[0].id)
  // Leitner progress per card id ({ box, due }) and the round counter shared by every deck, like a calendar.
  const [progress, setProgress] = useLocalStorage('rika:flashcards:leitner', {})
  const [round, setRound] = useLocalStorage('rika:flashcards:round', 1)
  // A deck that arrived in the link is only offered, not saved: it lives in plain state until accepted.
  const [shared, setShared] = useState(readSharedDeck)
  const [view, setView] = useState('study')
  const [confirming, setConfirming] = useState(false)

  const deck = decks.find((d) => d.id === activeId) ?? decks[0]

  // Immutable updates: map() returns a new array, the spread a new object, so React sees the change.
  const updateDeck = (id, change) => setDecks((list) => list.map((d) => (d.id === id ? { ...d, ...change(d) } : d)))

  const selectDeck = (id) => {
    setActiveId(id)
    setConfirming(false)
  }

  // A ready-made deck (new, from a file or from a link) joins the list and is chosen.
  const addDeck = (newDeck) => {
    setDecks((list) => [...list, newDeck])
    selectDeck(newDeck.id)
  }

  const createDeck = (name) => {
    addDeck({ id: crypto.randomUUID(), name, cards: [] })
    setView('edit')
  }

  const deleteDeck = () => {
    setDecks((list) => list.filter((d) => d.id !== deck.id))
    setProgress((p) => withoutCards(p, deck.cards.map((c) => c.id)))
    selectDeck(SEED_DECKS[0].id)
  }

  const answerCard = (cardId, knew) => setProgress((p) => ({ ...p, [cardId]: nextEntry(getEntry(p, cardId), round, knew) }))
  const nextRound = () => setRound((r) => r + 1)
  // The shuffled order is the deck's own order from now on, so it survives a reload.
  const shuffleDeck = () => updateDeck(deck.id, (d) => ({ cards: shuffled(d.cards) }))
  const resetProgress = () => setProgress((p) => withoutCards(p, deck.cards.map((c) => c.id)))

  const addCard = (values) => updateDeck(deck.id, (d) => ({ cards: [...d.cards, { id: crypto.randomUUID(), ...values }] }))
  const updateCard = (cardId, values) =>
    updateDeck(deck.id, (d) => ({ cards: d.cards.map((c) => (c.id === cardId ? { ...c, ...values } : c)) }))
  const deleteCard = (cardId) => {
    updateDeck(deck.id, (d) => ({ cards: d.cards.filter((c) => c.id !== cardId) }))
    setProgress((p) => withoutCards(p, [cardId]))
  }
  const restoreSample = () =>
    updateDeck(deck.id, (d) => {
      const seed = seedCardsOf(d.id)
      return { cards: [...seed, ...d.cards.filter((c) => !seed.some((s) => s.id === c.id))] }
    })

  const closeShared = () => {
    setShared(null)
    clearSharedDeck()
  }
  const acceptShared = () => {
    addDeck(shared)
    setView('study')
    closeShared()
  }

  return (
    <div className="fc">
      {shared && <SharedDeck deck={shared} onAccept={acceptShared} onDismiss={closeShared} t={t} />}

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

      {/* key: a new deck gets a fresh study session (index, flip state). */}
      {view === 'study' ? (
        <Study
          key={deck.id}
          deck={deck}
          progress={progress}
          round={round}
          onAnswer={answerCard}
          onNextRound={nextRound}
          onShuffle={shuffleDeck}
          onResetProgress={resetProgress}
          onEditCards={() => setView('edit')}
          lang={lang}
          t={t}
        />
      ) : (
        <Editor
          key={deck.id}
          deck={deck}
          boxOf={(cardId) => progress[cardId]?.box}
          onAdd={addCard}
          onUpdate={updateCard}
          onDelete={deleteCard}
          onRestore={restoreSample}
          lang={lang}
          t={t}
        />
      )}

      <DeckTools deck={deck} onImport={addDeck} lang={lang} t={t} />

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
