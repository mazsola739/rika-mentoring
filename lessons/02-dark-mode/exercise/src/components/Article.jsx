function Article() {
  return (
    <article className="article">
      <p className="article__kicker">Tonight’s sky</p>
      <h1>Stargazing from your balcony</h1>
      <p className="article__meta">A 3-minute read for clear evenings</p>
      <p>
        You do not need a telescope to start. Go out an hour after sunset, switch off the lights you
        can, and look up. The brightest point that does not twinkle is probably a planet.
      </p>
      <p className="tip">
        Your eyes need about 20 minutes to get used to the dark. One look at a bright white screen,
        and you start again. That is why this page needs a dark mode.
      </p>
      <h2>What to take with you</h2>
      <ul>
        <li>a blanket or a folding chair</li>
        <li>something warm to drink</li>
        <li>this page, in dark mode</li>
      </ul>
    </article>
  )
}

export default Article
