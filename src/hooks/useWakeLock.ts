import { useState, useCallback, useEffect, useRef } from 'react'

export function useWakeLock() {
  const [isActive, setIsActive] = useState(false)
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)
  const isSupported = 'wakeLock' in navigator

  const request = useCallback(async () => {
    if (!isSupported) return
    try {
      wakeLockRef.current = await navigator.wakeLock.request('screen')
      setIsActive(true)

      wakeLockRef.current.addEventListener('release', () => {
        setIsActive(false)
      })
    } catch {
      // Wake lock request failed (e.g., low battery)
      setIsActive(false)
    }
  }, [isSupported])

  const release = useCallback(async () => {
    if (wakeLockRef.current) {
      await wakeLockRef.current.release()
      wakeLockRef.current = null
      setIsActive(false)
    }
  }, [])

  // Re-acquire on visibility change (required by spec)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isActive && !wakeLockRef.current) {
        request()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [isActive, request])

  // Release on unmount
  useEffect(() => {
    return () => {
      wakeLockRef.current?.release()
    }
  }, [])

  return { isSupported, isActive, request, release }
}
