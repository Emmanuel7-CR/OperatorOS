import { useState } from 'react'
import { usePWAInstall } from '../../hooks/usePWAInstall'
import { Download, X, Share } from 'lucide-react'
import './PWABanner.css'

export function PWABanner() {
  const { isInstallable, isIOSDevice, showIOSGuide, dismissIOSGuide, promptInstall } = usePWAInstall()
  const [dismissed, setDismissed] = useState(false)

  // iOS step-by-step modal
  if (isIOSDevice && showIOSGuide) {
    return (
      <div className="pwa-overlay" onClick={dismissIOSGuide}>
        <div className="pwa-sheet" onClick={e => e.stopPropagation()}>
          <div className="pwa-sheet__header">
            <span className="pwa-sheet__title">Install OperatorOS</span>
            <button className="btn btn-icon btn-ghost" onClick={dismissIOSGuide}><X size={16} /></button>
          </div>
          <div className="pwa-sheet__steps">
            {[
              { n: 1, text: <>Tap the <strong>Share</strong> button <span className="pwa-share-icon"><Share size={14} /></span> at the bottom of Safari</> },
              { n: 2, text: <>Scroll down and tap <strong>"Add to Home Screen"</strong></> },
              { n: 3, text: <>Tap <strong>"Add"</strong> in the top right corner</> },
            ].map(step => (
              <div key={step.n} className="pwa-step">
                <div className="pwa-step__num">{step.n}</div>
                <div className="pwa-step__text">{step.text}</div>
              </div>
            ))}
          </div>
          <p className="pwa-sheet__note">
            OperatorOS will open as a full-screen app — no browser bar.
          </p>
        </div>
      </div>
    )
  }

  if (!isInstallable || dismissed) return null

  return (
    <div className="pwa-banner">
      <span className="pwa-banner__icon">⚡</span>
      <div className="pwa-banner__text">
        <span className="pwa-banner__title">Install OperatorOS</span>
        <span className="pwa-banner__sub">Add to home screen for the full app experience</span>
      </div>
      <button
        className="btn btn-primary btn-sm"
        onClick={promptInstall}
      >
        {isIOSDevice ? 'How to Install' : <><Download size={13} /> Install</>}
      </button>
      <button className="pwa-banner__close btn btn-icon btn-ghost" onClick={() => setDismissed(true)}>
        <X size={15} />
      </button>
    </div>
  )
}
