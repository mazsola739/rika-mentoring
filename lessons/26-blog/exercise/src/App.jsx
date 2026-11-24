import './App.css'

function App() {
  return (
    <div className="blog">
      <header className="blog__header">
        <a className="blog__title" href="#/">
          The Peacock Journal
        </a>
        <p className="blog__tagline">Notes on React, writing and the web.</p>
      </header>

      <main className="blog__main">
        <p className="state">The posts will appear here.</p>
      </main>
    </div>
  )
}

export default App
