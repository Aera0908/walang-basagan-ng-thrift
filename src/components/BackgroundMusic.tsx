import { useEffect, useRef } from 'react'

// Minimal silent audio fallback - add /audio/bg-music.mp3 for real music
const FALLBACK_AUDIO = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA'

function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const audio = new Audio('/audio/bg-music.mp3')
    audio.loop = true
    audio.volume = 0.2
    audioRef.current = audio

    const tryPlay = async () => {
      try {
        await audio.play()
      } catch {
        // Autoplay blocked
      }
    }

    audio.addEventListener('error', () => {
      const fallback = new Audio(FALLBACK_AUDIO)
      fallback.loop = true
      fallback.volume = 0.2
      fallback.play().catch(() => {})
      audioRef.current = fallback
    })

    tryPlay()

    return () => {
      audioRef.current?.pause()
    }
  }, [])

  return null
}

export default BackgroundMusic
