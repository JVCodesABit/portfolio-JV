'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export default function CustomCursor() {
  const [isHovering, setIsHovering] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const cursorX = useMotionValue(-100)
  const cursorY = useMotionValue(-100)

  const springConfig = { damping: 28, stiffness: 350, mass: 0.5 }
  const ringConfig = { damping: 22, stiffness: 180, mass: 0.8 }

  const dotX = useSpring(cursorX, springConfig)
  const dotY = useSpring(cursorY, springConfig)
  const ringX = useSpring(cursorX, ringConfig)
  const ringY = useSpring(cursorY, ringConfig)

  useEffect(() => {
    const move = (e: MouseEvent) => {
      cursorX.set(e.clientX)
      cursorY.set(e.clientY)
      if (!isVisible) setIsVisible(true)
    }

    const addHover = () => setIsHovering(true)
    const removeHover = () => setIsHovering(false)

    const interactables = document.querySelectorAll(
      'a, button, [data-cursor-hover]'
    )

    window.addEventListener('mousemove', move)
    interactables.forEach((el) => {
      el.addEventListener('mouseenter', addHover)
      el.addEventListener('mouseleave', removeHover)
    })

    return () => {
      window.removeEventListener('mousemove', move)
      interactables.forEach((el) => {
        el.removeEventListener('mouseenter', addHover)
        el.removeEventListener('mouseleave', removeHover)
      })
    }
  }, [cursorX, cursorY, isVisible])

  return (
    <>
      {/* Dot */}
      <motion.div
        className="fixed top-0 left-0 z-[9998] pointer-events-none rounded-full"
        style={{
          x: dotX,
          y: dotY,
          translateX: '-50%',
          translateY: '-50%',
          width: isHovering ? 14 : 8,
          height: isHovering ? 14 : 8,
          backgroundColor: isHovering ? '#ff2d55' : '#00ffe0',
          opacity: isVisible ? 1 : 0,
          transition: 'width 0.2s, height 0.2s, background-color 0.2s',
        }}
      />
      {/* Ring */}
      <motion.div
        className="fixed top-0 left-0 z-[9997] pointer-events-none rounded-full border border-[#00ffe0]"
        style={{
          x: ringX,
          y: ringY,
          translateX: '-50%',
          translateY: '-50%',
          width: isHovering ? 56 : 38,
          height: isHovering ? 56 : 38,
          borderColor: isHovering ? '#ff2d55' : '#00ffe0',
          opacity: isVisible ? (isHovering ? 0.8 : 0.4) : 0,
          transition: 'width 0.3s, height 0.3s, border-color 0.3s, opacity 0.3s',
        }}
      />
    </>
  )
}
