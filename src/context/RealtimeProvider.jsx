import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { realtimeEngine } from '../services/realtimeEngine'
import { useOSStore } from './OSStore'
import { useFinanceStore } from './financeStore'
import { useExecutionStore } from './executionStore'
import { useGrowthStore } from './growthStore'
import { useAuth } from './AuthContext'

const RealtimeContext = createContext(null)

export function RealtimeProvider({ children }) {
  const { user } = useAuth()
  const [connected, setConnected]     = useState(false)
  const [channelCount, setChannelCount] = useState(0)
  const cleanupRef = useRef(null)

  useEffect(() => {
    if (!user?.id) {
      realtimeEngine.stop()
      setConnected(false)
      return
    }

    // Pass store setState refs to the engine
    // The engine uses these to push updates directly into Zustand
    realtimeEngine.start(user.id, {
      osStore:        useOSStore,
      financeStore:   useFinanceStore,
      executionStore: useExecutionStore,
      growthStore:    useGrowthStore,
    })

    setConnected(true)
    setChannelCount(realtimeEngine.getChannelCount())

    // Listen for status changes
    const unsubStatus = realtimeEngine.on('status', ({ connected: c }) => {
      setConnected(c)
    })

    cleanupRef.current = () => {
      unsubStatus()
      realtimeEngine.stop()
    }

    return () => {
      cleanupRef.current?.()
    }
  }, [user?.id])

  return (
    <RealtimeContext.Provider value={{ connected, channelCount }}>
      {children}
    </RealtimeContext.Provider>
  )
}

export function useRealtime() {
  const ctx = useContext(RealtimeContext)
  // Return safe defaults if used outside provider (e.g. landing page)
  return ctx || { connected: false, channelCount: 0 }
}
