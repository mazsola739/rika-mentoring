// Böngészőablak-keret, hogy a portfólió úgy nézzen ki, mint egy valódi weboldal.
export default function BrowserWindow({ url, badge, children }) {
  return (
    <div className="pf-window">
      <div className="pf-window__bar">
        <span className="pf-window__dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="pf-window__url">{url}</span>
        {badge && <span className="pf-window__badge">{badge}</span>}
      </div>
      <div className="pf-window__body">{children}</div>
    </div>
  )
}
