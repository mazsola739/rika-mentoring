import { useLang } from '@shared/i18n.js'

export const TEXT = {
  en: {
    sortLabel: 'Sort posts',
    sorts: { new: 'New', top: 'Top' },
    communityLabel: 'Community',
    all: 'All',
    create: 'Create post',
    cancel: 'Cancel',
    titleLabel: 'Title',
    bodyLabel: 'Text (optional)',
    communityField: 'Community',
    publish: 'Post',
    publishing: 'Posting…',
    titleError: 'The title needs 5–120 characters.',
    postFailed: 'The post could not be published.',
    you: 'you',
    by: 'by',
    upvote: 'Upvote',
    downvote: 'Downvote',
    score: (n) => `${n} points`,
    voteFailed: 'Your vote could not be saved, so it was reverted.',
    comments: (n) => (n === 0 ? 'Comment' : `${n} ${n === 1 ? 'comment' : 'comments'}`),
    hideComments: 'Hide comments',
    noComments: 'No comments yet. Start the conversation!',
    commentLabel: 'Add a comment',
    commentPlaceholder: 'What do you think?',
    replyLabel: (name) => `Reply to ${name}`,
    reply: 'Reply',
    send: 'Comment',
    sendReply: 'Reply',
    sending: 'Sending…',
    commentFailed: 'The comment could not be sent.',
    collapse: 'Collapse thread',
    expand: 'Expand thread',
    hiddenReplies: (n) => `${n} ${n === 1 ? 'reply' : 'replies'} hidden`,
    loading: 'Loading posts…',
    loadFailed: 'The feed could not be loaded.',
    retry: 'Retry',
    empty: 'No posts here yet.',
    loadMore: 'Show more posts',
    end: 'You are all caught up.',
    reset: 'Reset demo data',
    newBadge: 'yours',
  },
  hu: {
    sortLabel: 'Posztok rendezése',
    sorts: { new: 'Legújabb', top: 'Legnépszerűbb' },
    communityLabel: 'Közösség',
    all: 'Mind',
    create: 'Új poszt',
    cancel: 'Mégse',
    titleLabel: 'Cím',
    bodyLabel: 'Szöveg (nem kötelező)',
    communityField: 'Közösség',
    publish: 'Közzététel',
    publishing: 'Küldés…',
    titleError: 'A cím 5–120 karakter legyen.',
    postFailed: 'Nem sikerült közzétenni a posztot.',
    you: 'te',
    by: '',
    upvote: 'Felszavazás',
    downvote: 'Leszavazás',
    score: (n) => `${n} pont`,
    voteFailed: 'Nem sikerült menteni a szavazatod, ezért visszavontuk.',
    comments: (n) => (n === 0 ? 'Hozzászólás' : `${n} hozzászólás`),
    hideComments: 'Hozzászólások elrejtése',
    noComments: 'Még nincs hozzászólás. Kezdd te!',
    commentLabel: 'Hozzászólás írása',
    commentPlaceholder: 'Mit gondolsz?',
    replyLabel: (name) => `Válasz neki: ${name}`,
    reply: 'Válasz',
    send: 'Küldés',
    sendReply: 'Válasz küldése',
    sending: 'Küldés…',
    commentFailed: 'Nem sikerült elküldeni a hozzászólást.',
    collapse: 'Szál összecsukása',
    expand: 'Szál kinyitása',
    hiddenReplies: (n) => `${n} válasz elrejtve`,
    loading: 'Posztok betöltése…',
    loadFailed: 'Nem sikerült betölteni a feedet.',
    retry: 'Újra',
    empty: 'Itt még nincs poszt.',
    loadMore: 'További posztok',
    end: 'Mindent láttál.',
    reset: 'Demóadatok visszaállítása',
    newBadge: 'saját',
  },
}

// Seed texts are { en, hu }; texts written in the app are plain strings.
export const pick = (value, lang) => (typeof value === 'string' ? value : (value?.[lang] ?? ''))

const UNITS = [
  ['year', 365 * 24 * 3600],
  ['month', 30 * 24 * 3600],
  ['week', 7 * 24 * 3600],
  ['day', 24 * 3600],
  ['hour', 3600],
  ['minute', 60],
]

// "5 hours ago" / "5 órája" with Intl.RelativeTimeFormat.
export function useTimeAgo() {
  const lang = useLang()
  const rtf = new Intl.RelativeTimeFormat(lang === 'hu' ? 'hu-HU' : 'en-GB', { numeric: 'auto' })
  return (iso) => {
    const seconds = Math.round((new Date(iso).getTime() - Date.now()) / 1000)
    for (const [unit, size] of UNITS) {
      if (Math.abs(seconds) >= size) return rtf.format(Math.round(seconds / size), unit)
    }
    return rtf.format(0, 'minute')
  }
}

export function useFullDate() {
  const lang = useLang()
  const fmt = new Intl.DateTimeFormat(lang === 'hu' ? 'hu-HU' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short' })
  return (iso) => fmt.format(new Date(iso))
}
