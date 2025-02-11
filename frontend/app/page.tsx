/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState, useEffect } from "react"
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

  useEffect(() => {
    if (isSoundOn) {
      playAmbient()
    } else {
      stopAmbient()
    }
  }, [isSoundOn, playAmbient, stopAmbient])

  const handleScroll = (event: React.WheelEvent) => {
    const currentIndex = sections.findIndex(section => section.id === currentSection)
    if (event.deltaY > 0 && currentIndex < sections.length - 1) {
      setCurrentSection(sections[currentIndex + 1].id)
    } else if (event.deltaY < 0 && currentIndex > 0) {
      setCurrentSection(sections[currentIndex - 1].id)
    }
  }

  return (
    <main className="h-screen overflow-hidden relative" onWheel={handleScroll}>
      <CursorTrail />
      
      {/* Sound Toggle Button */}
      <button
        className="fixed top-4 right-4 z-50 p-2 bg-[#2d1b4e] hover:bg-[#382460] rounded-full transition-all duration-300"
        onClick={() => setIsSoundOn(!isSoundOn)}
      >
        {isSoundOn ? "🔊" : "🔇"}
      </button>

      {/* Side Navigation */}
      <motion.div 
        className="fixed right-8 top-1/2 -translate-y-1/2 z-50 hidden md:block"
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1 }}
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
                className={`absolute right-8 top-1/2 h-8 w-[2px] -translate-y-1/2 transition-all duration-300 ${
                  currentSection === section.id 
                    ? "bg-[#00ffe5] h-12" 
                    : "bg-gray-700 group-hover:bg-gray-500"
                }`}
              />

              {/* Navigation Dot */}
              <button
                onClick={() => setCurrentSection(section.id)}
                className={`relative z-10 w-4 h-4 rounded-full transition-all duration-300 ${
                  currentSection === section.id
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
                <span className={`text-sm font-medium ${
                  currentSection === section.id ? "text-[#00ffe5]" : "text-gray-400"
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
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 md:hidden"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <div className="flex gap-4 bg-[#1a1e2e]/80 backdrop-blur-md p-3 rounded-full">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setCurrentSection(section.id)}
              className={`p-2 rounded-full transition-all duration-300 ${
                currentSection === section.id
                  ? "bg-[#2d1b4e] text-[#00ffe5]"
                  : "text-gray-400 hover:text-gray-300"
              }`}
            >
              <span className="text-xl">{section.icon}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {currentSection === "hero" && (
          <motion.div key="hero" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Hero />
          </motion.div>
        )}
        {currentSection === "installation" && (
          <motion.div key="installation" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <InstallationJourney />
          </motion.div>
        )}
        {currentSection === "showcase" && (
          <motion.div key="showcase" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ModelShowcase />
          </motion.div>
        )}
       
      </AnimatePresence>
    </main>
  )
}

