"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

const issues = [
  { id: "dep", title: "Dependency Issues", solution: "Try clearing your npm cache and reinstalling dependencies." },
  { id: "ver", title: "Version Mismatch", solution: "Ensure you're using the correct Node.js and npm versions." },
  {
    id: "env",
    title: "Environment Setup",
    solution: "Double-check your .env file and ensure all required variables are set.",
  },
]

export default function Troubleshooting() {
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null)

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="max-w-2xl w-full">
        <h2 className="text-4xl font-bold mb-8 text-center">Troubleshooting</h2>
        <div className="space-y-4">
          {issues.map((issue) => (
            <motion.div
              key={issue.id}
              className="p-4 bg-purple-900 rounded-lg cursor-pointer"
              whileHover={{ scale: 1.05 }}
              onClick={() => setSelectedIssue(selectedIssue === issue.id ? null : issue.id)}
            >
              <h3 className="text-xl font-bold">{issue.title}</h3>
              <AnimatePresence>
                {selectedIssue === issue.id && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-2 text-cyan"
                  >
                    {issue.solution}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

