"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

export default function CursorTrail() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [trail, setTrail] = useState<{ x: number; y: number }[]>([])

  useEffect(() => {
    const updateMousePosition = (ev: MouseEvent) => {
      setMousePosition({ x: ev.clientX, y: ev.clientY })
    }

    window.addEventListener("mousemove", updateMousePosition)

    return () => {
      window.removeEventListener("mousemove", updateMousePosition)
    }
  }, [])

  useEffect(() => {
    setTrail((prevTrail) => {
      const newTrail = [mousePosition, ...prevTrail.slice(0, 5)]
      return newTrail
    })
  }, [mousePosition])

  return (
    <>
      {trail.map((position, index) => (
        <motion.div
          key={index}
          className="w-2 h-2 rounded-full bg-cyan absolute pointer-events-none"
          style={{
            left: position.x,
            top: position.y,
          }}
          initial={{ opacity: 0.8, scale: 1 }}
          animate={{ opacity: 0, scale: 0 }}
          transition={{ duration: 0.5 }}
        />
      ))}
    </>
  )
}

