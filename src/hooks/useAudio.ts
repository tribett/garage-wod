import { useRef, useCallback } from 'react'

export function useAudio() {
  const beepRef = useRef<HTMLAudioElement | null>(null)
  const longBeepRef = useRef<HTMLAudioElement | null>(null)
  const celebrationRef = useRef<HTMLAudioElement | null>(null)

  const preload = useCallback(() => {
    if (!beepRef.current) {
      beepRef.current = new Audio('/sounds/beep-short.mp3')
      beepRef.current.load()
    }
    if (!longBeepRef.current) {
      longBeepRef.current = new Audio('/sounds/beep-long.mp3')
      longBeepRef.current.load()
    }
    if (!celebrationRef.current) {
      celebrationRef.current = new Audio('/sounds/celebration.mp3')
      celebrationRef.current.load()
    }
  }, [])

  const play = useCallback((audio: HTMLAudioElement | null) => {
    if (!audio) return
    audio.currentTime = 0
    audio.play().catch(() => {
      // Autoplay blocked — expected on first interaction
    })
  }, [])

  const playBeep = useCallback(() => play(beepRef.current), [play])
  const playLongBeep = useCallback(() => play(longBeepRef.current), [play])
  const playCelebration = useCallback(() => play(celebrationRef.current), [play])

  return { preload, playBeep, playLongBeep, playCelebration }
}
