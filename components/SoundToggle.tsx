'use client'
import { useEffect, useState } from 'react'
import { sound } from '@/lib/sound'

/** Off by default. A remembered "on" still waits for a first press, as browsers require. */
export function SoundToggle() {
  const [on, setOn] = useState(false)

  useEffect(() => {
    setOn(sound.on)
    const off = sound.subscribe(setOn)
    let resume: (() => void) | undefined
    if (!sound.on && sound.wantsOn()) {
      resume = () => { if (sound.wantsOn() && !sound.on) sound.setOn(true) }
      addEventListener('pointerdown', resume, { once: true })
    }
    return () => {
      off()
      if (resume) removeEventListener('pointerdown', resume)
    }
  }, [])

  return (
    <button
      className={`sound-btn ${on ? 'on' : ''}`}
      onClick={() => sound.setOn(!on)}
      aria-pressed={on}
      aria-label="Sound"
      title={on ? 'Sound on' : 'Sound off'}
    >
      <span aria-hidden className="sound-bars"><i /><i /><i /><i /></span>
    </button>
  )
}
