import { useEffect, useReducer } from 'react'
import AppFrame from '@shared/ui/AppFrame.jsx'
import { useLang, useText } from '@shared/i18n.js'
import { STORAGE_KEY, balanceOf, loadWallet, monthlySeries, totalsOf, walletReducer } from './walletReducer.js'
import { makeFormatters, monthKeyOf, todayISO } from './money.js'
import TransactionForm from './TransactionForm.jsx'
import GoalCard from './GoalCard.jsx'
import MonthlyChart from './MonthlyChart.jsx'
import TransactionList from './TransactionList.jsx'
import { TEXT } from './text.js'
import './app.css'

const PiggyBank = () => {
  const t = useText(TEXT)
  const lang = useLang()
  const fmt = makeFormatters(lang)
  // One reducer owns the whole wallet; components only describe *what happened* via dispatch.
  const [wallet, dispatch] = useReducer(walletReducer, undefined, loadWallet)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wallet))
    } catch {
      // storage full or blocked: keep working in memory
    }
  }, [wallet])

  const { transactions, goal } = wallet
  const balance = balanceOf(transactions)
  const thisMonthKey = monthKeyOf(todayISO())
  const month = totalsOf(transactions.filter((x) => monthKeyOf(x.date) === thisMonthKey))

  const clearAll = () => {
    if (window.confirm(t.settings.confirmClear)) dispatch({ type: 'cleared' })
  }

  return (
    <div className="pb">
      <section className="pb-balance solid" aria-labelledby="pb-balance-label">
        <div className="pb-balance__main">
          <p id="pb-balance-label" className="pb-balance__label">
            {t.balance}
          </p>
          <p className="pb-balance__value" aria-live="polite">
            {fmt.money(balance)}
          </p>
          <p className="pb-balance__month">
            <span>{t.thisMonth}:</span> <span>+{fmt.money(month.income)}</span> <span>−{fmt.money(month.expense)}</span>
          </p>
        </div>
        <div className="pb-balance__art" aria-hidden="true" />
      </section>

      <div className="pb-columns">
        <TransactionForm balance={balance} onAdd={(transaction) => dispatch({ type: 'added', transaction })} fmt={fmt} t={t} />
        <GoalCard goal={goal} balance={balance} dispatch={dispatch} fmt={fmt} lang={lang} t={t} />
      </div>

      <MonthlyChart series={monthlySeries(transactions)} fmt={fmt} t={t} />

      <TransactionList transactions={transactions} dispatch={dispatch} fmt={fmt} lang={lang} t={t} />

      <footer className="pb-foot">
        <span>{t.saved}</span>
        <span className="pb-row">
          <button type="button" className="pb-link" onClick={() => dispatch({ type: 'sampleLoaded' })}>
            {t.settings.sample}
          </button>
          <button type="button" className="pb-link pb-link--danger" onClick={clearAll} disabled={!transactions.length}>
            {t.settings.clear}
          </button>
        </span>
      </footer>
    </div>
  )
}

const App = () => {
  return (
    <AppFrame slug="piggy-bank">
      <PiggyBank />
    </AppFrame>
  )
}

export default App
