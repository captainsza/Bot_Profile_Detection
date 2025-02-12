"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import * as THREE from "three"
import Link from 'next/link'

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current) {
      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
      const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true })
      renderer.setSize(window.innerWidth, window.innerHeight)

      const geometry = new THREE.SphereGeometry(5, 32, 32)
      const material = new THREE.MeshBasicMaterial({ color: 0x00ffe5, wireframe: true })
      const sphere = new THREE.Mesh(geometry, material)
      scene.add(sphere)

      camera.position.z = 10

      const animate = () => {
        requestAnimationFrame(animate)
        sphere.rotation.x += 0.01
        sphere.rotation.y += 0.01
        renderer.render(scene, camera)
      }

      animate()

      return () => {
        renderer.dispose()
      }
    }
  }, [])

  return (
    <div className="relative h-screen flex flex-col items-center justify-center bg-[#060714]">
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />
      
      <div className="z-10 text-center space-y-8">
        <motion.h1
          className="text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#00ffe5] to-[#4d8dff]"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          Hunt Bots Like a Cyber Sentinel
        </motion.h1>
        
        <motion.p
          className="text-xl mb-8 text-[#f8f9fa]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          Welcome to the cutting-edge of AI detection by QubitRules
        </motion.p>

        <motion.div
          className="space-x-4"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 1 }}
        >
          <Link href="/bot-detection" target="_blank" rel="noopener noreferrer">
            <button className="bg-[#00ffe5] text-[#060714] px-6 py-3 rounded-full hover:bg-[#00e6cc] transition duration-300 font-semibold">
              Launch Live Demo
            </button>
          </Link>
          <Link href="https://github.com/captainsza/Bot_Profile_Detection" target="_blank" rel="noopener noreferrer">
            <button className="bg-[#2d1b4e] text-[#00ffe5] px-6 py-3 rounded-full hover:bg-[#382460] transition duration-300 font-semibold">
              Local Setup Guide
            </button>
          </Link>
        </motion.div>

        {/* Company & Team Info */}
        <motion.div
          className="mt-16 space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
        >
          <div className="text-[#ffffff]">
            <h3 className="text-xl font-semibold mb-2 text-[#00ffe5]">QubitRules Technologies</h3>
            <p className="text-sm">Empowering Digital Security Through Innovation</p>
            <Link 
              href="https://qubitrules.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#00ffe5] hover:text-[#00e6cc] text-sm"
            >
              www.qubitrules.com
            </Link>
          </div>

          <div className="border-t border-gray-800 pt-4 mt-4">
            <h4 className="text-white font-medium mb-2">Project Contributors</h4>
            <div className="flex justify-center space-x-8">
              <Link 
                href="https://github.com/captainsza" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-white hover:text-cyan-400 transition duration-300"
              >
                <div className="flex flex-col items-center">
                  <img 
                    src="https://github.com/captainsza.png" 
                    alt="Captain SZA" 
                    className="w-10 h-10 rounded-full mb-2"
                  />
                  <span>Zaid Ahmad</span>
                </div>
              </Link>
              <Link 
                href="https://github.com/newayanahmad" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-white hover:text-cyan-400 transition duration-300"
              >
                <div className="flex flex-col items-center">
                  <img 
                    src="https://github.com/newayanahmad.png" 
                    alt="Latest Ayan" 
                    className="w-10 h-10 rounded-full mb-2"
                  />
                  <span>Ayan Ahmad</span>
                </div>
              </Link>
              {/* Add more team members here if needed */}
            </div>
          </div>

          {/* Hackathon Badge */}
          <motion.div
            className="inline-block bg-gradient-to-r from-purple-900 to-indigo-900 p-3 rounded-lg"
            whileHover={{ scale: 1.05 }}
          >
            <p className="text-xs text-white">
              Built with ❤️ for the <br/>
              <span className="font-semibold text-cyan-400">HACK IITK 2024-2025</span>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

