"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { FiDownload, FiGithub, FiPackage, FiPlay, FiCode, FiDatabase } from "react-icons/fi"

const steps = [
  {
    id: "prerequisites",
    title: "Prerequisites",
    description: "Ensure you have the following installed:",
    items: [
      "Windows 10 or 11",
      "Python 3.10+ (but below 3.13)",
      "Node.js 16.0+",
      "Git",
      "Visual Studio Code (recommended)"
    ],
    icon: <FiDownload className="w-6 h-6" />
  },
  {
    id: "clone",
    title: "Clone Repository",
    command: "git clone https://github.com/captainsza/Bot_Profile_Detection.git",
    description: "Clone the project repository",
    icon: <FiGithub className="w-6 h-6" />
  },
  {
    id: "python-setup",
    title: "Python Environment Setup",
    commands: [
      "python -m venv venv",
      "venv\\Scripts\\activate",
      "pip install -r requirements.txt",
      'python -c "import nltk; nltk.download(\'vader_lexicon\')"'
    ],
    description: "Set up Python virtual environment and install dependencies",
    icon: <FiPackage className="w-6 h-6" />
  },
  {
    id: "frontend-setup",
    title: "Frontend Setup",
    commands: [
      "cd frontend",
      "npm install",
      "npm run dev"
    ],
    description: "Install and start the frontend application",
    icon: <FiCode className="w-6 h-6" />
  },
  {
    id: "models",
    title: "Model Files",
    description: "Ensure model files are in the correct location:",
    path: "frontend/modal/",
    files: [
      "bot_detection_model.pkl",
      "improved_bot_detection_model.h5",
      "scaler.pkl",
      "tokenizer/"
    ],
    icon: <FiDatabase className="w-6 h-6" />
  },
  {
    id: "launch",
    title: "Launch Application",
    description: "Access the application at:",
    url: "http://localhost:3000",
    icon: <FiPlay className="w-6 h-6" />
  }
]

export default function InstallationJourney() {
  const [currentStep, setCurrentStep] = useState(0)

  return (
    <div className="fixed inset-0 bg-[#060714] text-gray-200">
      <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-[#00ffe5] scrollbar-track-gray-800">
        <div className="container mx-auto p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-4xl font-bold mb-8 text-center sticky top-0 pt-4 pb-6 bg-[#060714] z-10 text-transparent bg-clip-text bg-gradient-to-r from-[#00ffe5] to-[#4d8dff]">
              Installation Guide
            </h2>

            <div className="space-y-6 pb-20">
              {steps.map((step, index) => (
                <motion.div
                  key={step.id}
                  className={`p-6 rounded-lg border ${
                    index <= currentStep
                      ? "border-[#00ffe5] bg-[#0a0f29]"
                      : "border-gray-800 bg-[#080b1a]"
                  }`}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setCurrentStep(index)}
                  whileHover={{ scale: 1.02 }}
                  style={{ cursor: "pointer" }}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`text-[#00ffe5] ${index <= currentStep ? "opacity-100" : "opacity-50"}`}>
                      {step.icon}
                    </div>
                    <h3 className="text-xl font-semibold">{step.title}</h3>
                  </div>

                  <div className="pl-10">
                    <p className="text-gray-400 mb-4">{step.description}</p>

                    {step.items && (
                      <ul className="list-disc pl-5 space-y-2 text-gray-300">
                        {step.items.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    )}

                    {step.command && (
                      <pre className="bg-black/50 p-3 rounded-md overflow-x-auto">
                        <code className="text-[#00ffe5]">{step.command}</code>
                      </pre>
                    )}

                    {step.commands && (
                      <div className="space-y-2">
                        {step.commands.map((cmd, i) => (
                          <pre key={i} className="bg-black/50 p-3 rounded-md overflow-x-auto">
                            <code className="text-[#00ffe5]">{cmd}</code>
                          </pre>
                        ))}
                      </div>
                    )}

                    {step.files && (
                      <div className="bg-black/50 p-3 rounded-md">
                        <p className="text-[#00ffe5] mb-2">{step.path}</p>
                        <ul className="list-disc pl-5 text-gray-300">
                          {step.files.map((file, i) => (
                            <li key={i}>{file}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {step.url && (
                      <div className="bg-black/50 p-3 rounded-md">
                        <a
                          href={step.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#00ffe5] hover:underline"
                        >
                          {step.url}
                        </a>
                      </div>
                    )}
                  </div>

                  {index === currentStep && (
                    <motion.div
                      className="mt-4 h-1 bg-[#00ffe5]"
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 2 }}
                      onAnimationComplete={() => {
                        if (currentStep < steps.length - 1) {
                          setCurrentStep(currentStep + 1)
                        }
                      }}
                    />
                  )}
                </motion.div>
              ))}
            </div>

            <div className="sticky bottom-0 py-4 bg-gradient-to-t from-[#060714] to-transparent">
              <p className="text-gray-400 text-center">
                Need help? Check out our{" "}
                <a
                  href="https://github.com/captainsza/Bot_Profile_Detection#-troubleshooting"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#00ffe5] hover:underline"
                >
                  troubleshooting guide
                </a>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

