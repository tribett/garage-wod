import { useEffect, useState } from 'react'
import { generateConfettiParticles } from '@/lib/confetti'

/**
 * Confetti — renders a burst of animated confetti particles that fall
 * from the top of the screen. Auto-removes after the animation completes.
 */
export function Confetti({ onDone }: { onDone?: () => void }) {
  const [particles] = useState(() => generateConfettiParticles(35))

  useEffect(() => {
    const timer = setTimeout(() => onDone?.(), 2500)
    return () => clearTimeout(timer)
  }, [onDone])

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden" aria-hidden="true">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute w-2.5 h-2.5 rounded-sm confetti-fall"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            backgroundColor: p.color,
            transform: `rotate(${p.rotation}deg) scale(${p.scale})`,
            animationDelay: `${p.delay}ms`,
          }}
        />
      ))}
    </div>
  )
}
