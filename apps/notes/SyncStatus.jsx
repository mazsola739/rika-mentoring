import { relativeTime } from './notes.js'

// The status bar of the sync: a coloured dot, what is going on, how many changes wait, and the button.
export default function SyncStatus({ online, status, pending, lastSync, now, onSync, lang, t }) {
  // The message follows from the state; a later line overrides an earlier one.
  let message = t.syncNever
  if (lastSync > 0) message = t.synced(relativeTime(lastSync, now, lang))
  if (status === 'syncing') message = t.syncing
  if (status === 'error') message = t.syncError
  if (!online) message = t.offline

  return (
    <div className={`nt-sync nt-sync--${online ? status : 'offline'}`}>
      <span className="nt-sync__dot" aria-hidden="true" />
      <p className="nt-sync__text" role="status">
        {message}
        {pending > 0 && <span className="nt-sync__pending">{t.pending(pending)}</span>}
      </p>
      <button
        type="button"
        className="btn btn--ghost nt-small"
        disabled={!online || status === 'syncing'}
        onClick={onSync}
      >
        {status === 'error' ? t.retry : t.sync}
      </button>
    </div>
  )
}
