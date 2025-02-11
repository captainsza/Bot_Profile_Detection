"use client"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Github } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <header className="container mx-auto px-4 py-8">
        <nav className="flex justify-between items-center">
          <Image src="/logo-bgnot.png" alt="Logo" width={40} height={40} className="rounded-full" />
          <div className="space-x-4">
            <Link
              href="https://github.com/captainsza/Bot_Profile_Detection"
              className="hover:text-blue-400 transition-colors"
            >
              <Github className="inline-block mr-2" />
              GitHub
            </Link>
           
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold mb-6">🤖 Bot Profile Detection</h1>
          <p className="text-xl mb-8">
            A cutting-edge system for detecting AI-powered bot accounts using a hybrid approach combining XGBoost, BERT
            embeddings, and neural networks.
          </p>
          <Link
            href="/bot-detection"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full inline-flex items-center transition-colors"
          >
            Try Live Demo <ArrowRight className="ml-2" />
          </Link>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h2 className="text-3xl font-bold mb-4">Key Features</h2>
            <ul className="space-y-2">
              <li>✨ Advanced Detection Models</li>
              <li>⚡ Real-time Analysis</li>
              <li>📊 Comprehensive Feature Analysis</li>
              <li>🎨 Modern UI/UX with Dark Mode</li>
            </ul>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Image
              src="/feature-analysis.png"
              alt="Feature Analysis"
              width={500}
              height={300}
              className="rounded-lg shadow-lg"
            />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16"
        >
          <h2 className="text-3xl font-bold mb-4">Performance Metrics</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="py-2 px-4 bg-blue-900 font-bold uppercase text-sm text-blue-200 border-b border-gray-700">
                    Model
                  </th>
                  <th className="py-2 px-4 bg-blue-900 font-bold uppercase text-sm text-blue-200 border-b border-gray-700">
                    Precision
                  </th>
                  <th className="py-2 px-4 bg-blue-900 font-bold uppercase text-sm text-blue-200 border-b border-gray-700">
                    Recall
                  </th>
                  <th className="py-2 px-4 bg-blue-900 font-bold uppercase text-sm text-blue-200 border-b border-gray-700">
                    F1 Score
                  </th>
                  <th className="py-2 px-4 bg-blue-900 font-bold uppercase text-sm text-blue-200 border-b border-gray-700">
                    AUC-ROC
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-2 px-4 border-b border-gray-700">Traditional</td>
                  <td className="py-2 px-4 border-b border-gray-700">0.89</td>
                  <td className="py-2 px-4 border-b border-gray-700">0.92</td>
                  <td className="py-2 px-4 border-b border-gray-700">0.90</td>
                  <td className="py-2 px-4 border-b border-gray-700">0.94</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 border-b border-gray-700">Improved</td>
                  <td className="py-2 px-4 border-b border-gray-700">0.95</td>
                  <td className="py-2 px-4 border-b border-gray-700">0.96</td>
                  <td className="py-2 px-4 border-b border-gray-700">0.95</td>
                  <td className="py-2 px-4 border-b border-gray-700">0.98</td>
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>
      </main>

      <footer className="container mx-auto px-4 py-8 text-center">
        <p>&copy; 2023 Bot Profile Detection. All rights reserved.</p>
      </footer>
    </div>
  )
}

