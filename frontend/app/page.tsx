"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Hero from "@/components/components/Hero"
import InstallationJourney from "@/components/components/InstallationJourney"
import ModelShowcase from "@/components/components/ModelShowcase"

import CursorTrail from "@/components/components/CursorTrail"
import useSound from "use-sound"
import type React from "react" // Added import for React

const sections = [
  { id: "hero", name: "Hero", icon: "🏠" },
  { id: "installation", name: "Installation", icon: "⚙️" },
  { id: "showcase", name: "Models", icon: "🤖" }
]

export default function Home() {
  const [currentSection, setCurrentSection] = useState("hero")
  const [playAmbient, { stop: stopAmbient }] = useSound("/sounds/ambient.mp3", { loop: true })
  const [isSoundOn, setIsSoundOn] = useState(false)
  const [isScrolling, setIsScrolling] = useState(false)
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null)
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

  useEffect(() => {
    if (isSoundOn) {
      playAmbient()
    } else {
      stopAmbient()
    }
  }, [isSoundOn, playAmbient, stopAmbient])

  useEffect(() => {
    // Cleanup timeout on unmount
    return () => {
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current)
    }
  }, [])

  const handleScroll = (event: React.WheelEvent<HTMLDivElement>) => {
    // If we're in the installation section, allow internal scrolling
    if (currentSection === "installation") {
      const installationElement = sectionRefs.current["installation"]
      if (installationElement) {
        const { scrollHeight, clientHeight, scrollTop } = installationElement
        const isAtTop = scrollTop === 0
        const isAtBottom = scrollHeight - scrollTop === clientHeight

        // Allow section change only when at the edges
        if ((event.deltaY > 0 && isAtBottom) || (event.deltaY < 0 && isAtTop)) {
          handleSectionChange(event)
        }
        return // Allow default scroll behavior otherwise
      }
    } else {
      handleSectionChange(event)
    }
  }

  const handleSectionChange = (event: React.WheelEvent) => {
    if (isScrolling) return // Prevent multiple scroll events

    const currentIndex = sections.findIndex(section => section.id === currentSection)
    if (event.deltaY > 0 && currentIndex < sections.length - 1) {
      setIsScrolling(true)
      setCurrentSection(sections[currentIndex + 1].id)
    } else if (event.deltaY < 0 && currentIndex > 0) {
      setIsScrolling(true)
      setCurrentSection(sections[currentIndex - 1].id)
    }

    // Reset scrolling flag after animation
    scrollTimeout.current = setTimeout(() => {
      setIsScrolling(false)
    }, 1000) // Match this with your animation duration
  }

  return (
    <main
      className="h-screen overflow-hidden relative bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900"
      onWheel={handleScroll}
    >
      <CursorTrail />

      {/* Ambient Sound Toggle */}
      <motion.button
        className="fixed top-4 right-4 z-50 p-3 bg-white/10 backdrop-blur-lg hover:bg-white/20 
                   rounded-full transition-all duration-300 shadow-lg"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsSoundOn(!isSoundOn)}
      >
        {isSoundOn ? "🔊" : "🔇"}
      </motion.button>

      {/* Navigation */}
      <motion.div
        className="fixed right-8 top-1/2 -translate-y-1/2 z-50 hidden md:block"
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="space-y-4">
          {sections.map((section, index) => (
            <motion.div
              key={section.id}
              className="relative group"
              whileHover={{ scale: 1.1 }}
            >
              {/* Indicator Line */}
              <div
                className={`absolute right-8 top-1/2 h-8 w-[2px] -translate-y-1/2 transition-all duration-300 ${currentSection === section.id
                  ? "bg-[#00ffe5] h-12"
                  : "bg-gray-700 group-hover:bg-gray-500"
                  }`}
              />

              {/* Navigation Dot */}
              <button
                onClick={() => setCurrentSection(section.id)}
                className={`relative z-10 w-4 h-4 rounded-full transition-all duration-300 ${currentSection === section.id
                  ? "bg-[#00ffe5] shadow-[0_0_15px_#00ffe5]"
                  : "bg-gray-700 group-hover:bg-gray-500"
                  }`}
              />

              {/* Section Label */}
              <div className={`
                absolute right-12 top-1/2 -translate-y-1/2 
                whitespace-nowrap px-4 py-2 rounded-lg
                transition-all duration-300 flex items-center gap-2
                ${currentSection === section.id
                  ? "opacity-100 translate-x-0 bg-[#2d1b4e]"
                  : "opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0"
                }
              `}>
                <span className="text-lg">{section.icon}</span>
                <span className={`text-sm font-medium ${currentSection === section.id ? "text-[#00ffe5]" : "text-gray-400"
                  }`}>
                  {section.name}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Mobile Navigation */}
      <motion.div
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 md:hidden"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex gap-4 bg-white/10 backdrop-blur-lg p-4 rounded-full shadow-lg">
          {sections.map((section) => (
            <motion.button
              key={section.id}
              onClick={() => setCurrentSection(section.id)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={`p-3 rounded-full transition-all duration-300 ${currentSection === section.id
                ? "bg-white/20 text-white"
                : "text-white/60 hover:text-white"
                }`}
            >
              <span className="text-xl">{section.icon}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {currentSection === "hero" && (
          <motion.div
            key="hero"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Hero />
          </motion.div>
        )}
        {currentSection === "installation" && (
          <motion.div
            key="installation"
            ref={el => { sectionRefs.current["installation"] = el }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="h-screen overflow-y-auto scrollbar-thin scrollbar-track-white/10 
                     scrollbar-thumb-white/20 hover:scrollbar-thumb-white/30"
          >
            <InstallationJourney />
          </motion.div>
        )}
        {currentSection === "showcase" && (
          <motion.div
            key="showcase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ModelShowcase />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl -top-48 -left-48 animate-pulse"></div>
        <div className="absolute w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl -bottom-48 -right-48 animate-pulse"></div>
      </div>
    </main>
  )
}

