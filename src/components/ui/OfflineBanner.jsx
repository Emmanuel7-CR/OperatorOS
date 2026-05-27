import { useOnlineStatus } from '../../hooks/useOnlineStatus'
import { WifiOff } from 'lucide-react'
import './OfflineBanner.css'

export function OfflineBanner() {
  const isOnline = useOnlineStatus()

  if (isOnline) return null

  return (
    <div className="offline-banner">
      <WifiOff size={14} />
      <span>No internet connection — changes will sync when you reconnect</span>
    </div>
  )
}
