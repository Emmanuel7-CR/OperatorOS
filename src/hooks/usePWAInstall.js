import { useState, useEffect } from 'react'

function isIOS() {
  return (
    /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  )
}

function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  )
}

export function usePWAInstall() {
  const [prompt,           setPrompt]           = useState(null)
  const [isInstallable,    setIsInstallable]    = useState(false)
  const [isInstalled,      setIsInstalled]      = useState(false)
  const [isIOSDevice,      setIsIOSDevice]      = useState(false)
  const [showIOSGuide,     setShowIOSGuide]     = useState(false)

  useEffect(() => {
    if (isStandalone()) { setIsInstalled(true); return }

    const ios = isIOS()
    setIsIOSDevice(ios)

    if (ios) {
      const timer = setTimeout(() => setShowIOSGuide(true), 3000)
      return () => clearTimeout(timer)
    }

    function onBeforeInstall(e) {
      e.preventDefault()
      setPrompt(e)
      setIsInstallable(true)
    }
    function onInstalled() {
      setIsInstalled(true)
      setIsInstallable(false)
      setPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    window.addEventListener('appinstalled',        onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      window.removeEventListener('appinstalled',        onInstalled)
    }
  }, [])

  async function promptInstall() {
    if (isIOSDevice) { setShowIOSGuide(true); return }
    if (!prompt) return false
    prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') { setPrompt(null); setIsInstallable(false) }
    return outcome === 'accepted'
  }

  return {
    isInstallable: isInstallable || (isIOSDevice && !isInstalled),
    isInstalled,
    isIOSDevice,
    showIOSGuide,
    dismissIOSGuide: () => setShowIOSGuide(false),
    promptInstall,
  }
}
