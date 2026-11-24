import { useMemo } from 'react'
import { useLang } from '@shared/i18n.js'

export const TEXT = {
  en: {
    tabs: { book: 'Book an appointment', mine: 'My bookings' },
    steps: ['Service', 'Date & time', 'Your details'],
    stepOf: (n, total) => `Step ${n} of ${total}`,
    chooseService: 'Choose a service',
    chooseDate: 'Pick a day',
    chooseTime: 'Pick a time',
    yourDetails: 'Your details',
    prevMonth: 'Previous month',
    nextMonth: 'Next month',
    legend: { free: 'Available', full: 'Fully booked', closed: 'Closed' },
    dayLabel: { free: 'available', full: 'fully booked', closed: 'closed', past: 'in the past' },
    noDay: 'Choose a day in the calendar to see the free times.',
    closedDay: 'Closed on this day.',
    fullDay: 'Every time on this day is taken. Try another day.',
    noMoreToday: 'There are no more bookable times on this day. Try another day.',
    slotBooked: 'booked',
    slotsFor: (date) => `Times on ${date}`,
    freeCount: (n) => `${n} free ${n === 1 ? 'time' : 'times'}`,
    timeZone: (tz) => `Times are shown in your time zone (${tz}).`,
    hoursTitle: 'Opening hours',
    back: 'Back',
    continue: 'Continue',
    name: 'Full name',
    email: 'Email',
    note: 'Anything I should know? (optional)',
    errors: {
      name: 'Please enter your name.',
      email: 'Please enter a valid email address.',
    },
    confirm: 'Confirm booking',
    confirming: 'Booking…',
    conflict: 'Sorry, someone has just booked this time. The calendar has been refreshed, please pick another one.',
    failed: 'The booking could not be saved. Please try again.',
    confirmedTitle: 'You are booked!',
    confirmedText: (email) => `A confirmation would be sent to ${email}.`,
    bookAnother: 'Book another',
    seeMine: 'See my bookings',
    loading: 'Loading the calendar…',
    loadFailed: 'The calendar could not be loaded.',
    retry: 'Retry',
    mineEmpty: 'You have no bookings yet.',
    upcoming: 'Upcoming',
    past: 'Past',
    cancel: 'Cancel booking',
    cancelConfirm: 'Cancel this booking?',
    yesCancel: 'Yes, cancel',
    keep: 'Keep it',
    cancelling: 'Cancelling…',
    cancelFailed: 'Could not cancel. Please try again.',
    cancelled: 'The booking was cancelled.',
    summary: 'Summary',
    with: 'Booked by',
    closed: 'closed',
    minutes: (m) => {
      const h = Math.floor(m / 60)
      const rest = m % 60
      return [h && `${h} h`, rest && `${rest} min`].filter(Boolean).join(' ')
    },
  },
  hu: {
    tabs: { book: 'Időpontfoglalás', mine: 'Foglalásaim' },
    steps: ['Szolgáltatás', 'Nap és időpont', 'Adataid'],
    stepOf: (n, total) => `${n}. lépés / ${total}`,
    chooseService: 'Válassz szolgáltatást',
    chooseDate: 'Válassz napot',
    chooseTime: 'Válassz időpontot',
    yourDetails: 'Adataid',
    prevMonth: 'Előző hónap',
    nextMonth: 'Következő hónap',
    legend: { free: 'Szabad', full: 'Betelt', closed: 'Zárva' },
    dayLabel: { free: 'van szabad időpont', full: 'betelt', closed: 'zárva', past: 'elmúlt nap' },
    noDay: 'Válassz egy napot a naptárban, és megjelennek a szabad időpontok.',
    closedDay: 'Ezen a napon zárva vagyunk.',
    fullDay: 'Ezen a napon minden időpont foglalt. Próbálj egy másik napot!',
    noMoreToday: 'Erre a napra már nem lehet időpontot foglalni. Próbálj egy másik napot!',
    slotBooked: 'foglalt',
    slotsFor: (date) => `Időpontok: ${date}`,
    freeCount: (n) => `${n} szabad időpont`,
    timeZone: (tz) => `Az időpontok a te időzónádban látszanak (${tz}).`,
    hoursTitle: 'Nyitvatartás',
    back: 'Vissza',
    continue: 'Tovább',
    name: 'Teljes név',
    email: 'E-mail',
    note: 'Van valami, amit tudnom kell? (nem kötelező)',
    errors: {
      name: 'Add meg a neved.',
      email: 'Adj meg egy érvényes e-mail-címet.',
    },
    confirm: 'Foglalás megerősítése',
    confirming: 'Foglalás…',
    conflict: 'Sajnos ezt az időpontot épp most foglalta le valaki. Frissítettük a naptárat, válassz másikat!',
    failed: 'Nem sikerült menteni a foglalást. Próbáld újra!',
    confirmedTitle: 'Lefoglaltad!',
    confirmedText: (email) => `A visszaigazolást erre a címre küldenénk: ${email}.`,
    bookAnother: 'Újabb foglalás',
    seeMine: 'Foglalásaim',
    loading: 'Naptár betöltése…',
    loadFailed: 'Nem sikerült betölteni a naptárat.',
    retry: 'Újra',
    mineEmpty: 'Még nincs foglalásod.',
    upcoming: 'Közelgő',
    past: 'Elmúlt',
    cancel: 'Lemondás',
    cancelConfirm: 'Lemondod ezt a foglalást?',
    yesCancel: 'Igen, lemondom',
    keep: 'Megtartom',
    cancelling: 'Lemondás…',
    cancelFailed: 'Nem sikerült lemondani. Próbáld újra!',
    cancelled: 'A foglalást lemondtuk.',
    summary: 'Összesítés',
    with: 'Foglaló',
    closed: 'zárva',
    minutes: (m) => {
      const h = Math.floor(m / 60)
      const rest = m % 60
      return [h && `${h} óra`, rest && `${rest} perc`].filter(Boolean).join(' ')
    },
  },
}

// All Intl formatters in one hook, re-created only when the language changes.
export const useFormat = () => {
  const lang = useLang()
  return useMemo(() => {
    const locale = lang === 'hu' ? 'hu-HU' : 'en-GB'
    const make = (opts) => new Intl.DateTimeFormat(locale, opts)
    const month = make({ month: 'long', year: 'numeric' })
    const weekdayShort = make({ weekday: 'short' })
    const longDate = make({ weekday: 'long', day: 'numeric', month: 'long' })
    const fullDate = make({ weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    const time = make({ hour: '2-digit', minute: '2-digit' })
    const money = new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
    // 1 January 2024 was a Monday: build the Monday-first weekday names from it.
    const weekdays = Array.from({ length: 7 }, (_, i) => weekdayShort.format(new Date(2024, 0, 1 + i)))
    return {
      month: (d) => month.format(d),
      longDate: (d) => longDate.format(d),
      fullDate: (d) => fullDate.format(d),
      time: (d) => time.format(d),
      range: (start, end) => `${time.format(start)} – ${time.format(end)}`,
      money: (n) => money.format(n),
      weekdays,
      weekdayOf: (i) => weekdayShort.format(new Date(2024, 0, i === 0 ? 7 : i)), // 0 = Sunday
    }
  }, [lang])
}
