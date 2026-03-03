import { useState } from 'react'

interface MovementVideoProps {
  videoId: string
  movementName: string
  /** Show a compact thumbnail (default) or expanded inline player */
  compact?: boolean
}

/**
 * Lightweight YouTube video embed.
 * Renders a thumbnail from img.youtube.com first — clicking loads the real iframe.
 * This avoids loading YouTube's heavy JS bundle until the user actually wants the video.
 */
export function MovementVideo({ videoId, movementName, compact = true }: MovementVideoProps) {
  const [playing, setPlaying] = useState(false)

  if (playing) {
    return (
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
          title={`${movementName} demo`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      aria-label={`Play ${movementName} video`}
      className={`
        relative group cursor-pointer rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800
        ${compact ? 'w-full aspect-video' : 'w-full aspect-video'}
        active:scale-[0.99] transition-transform duration-150
      `}
    >
      <img
        src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
        alt={`${movementName} thumbnail`}
        loading="lazy"
        className="w-full h-full object-cover"
      />
      {/* Play button overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
        <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center shadow-lg">
          <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5 ml-0.5" aria-hidden="true">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>
    </button>
  )
}
