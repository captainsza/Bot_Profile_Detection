"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { FiCpu, FiBarChart2, FiBox, FiZap } from "react-icons/fi"

const models = [
  {
    id: "traditional2",
    name: "Traditional2 (XGBoost + BERT)",
    accuracy: 0.8422,
    precision: 0.8420,
    recall: 0.8427,
    f1: 0.8423,
    auc: 0.9280,
    features: [
      "BERT embeddings for text analysis",
      "XGBoost classifier",
      "Custom feature engineering",
      "Compact .pkl format (~250MB)",
      "Fast inference time: ~100ms"
    ],
    icon: <FiBarChart2 className="w-8 h-8" />
  },
  {
    id: "neural",
    name: "Improved Neural Network",
    accuracy: 0.94,
    precision: 0.93,
    recall: 0.92,
    f1: 0.92,
    auc: 0.98,
    features: [
      "Multi-modal Neural Network",
      "DistilBERT embeddings",
      "Custom architecture",
      "Higher accuracy and robustness",
      "Advanced feature fusion"
    ],
    icon: <FiCpu className="w-8 h-8" />
  }
]

export default function ModelShowcase() {
  const [selectedModel, setSelectedModel] = useState(models[0])

  return (
    <div className="fixed inset-0 bg-[#060714] text-gray-200 overflow-y-auto scrollbar-thin scrollbar-thumb-[#00ffe5] scrollbar-track-gray-800">
      <div className="container mx-auto p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <h2 className="text-4xl font-bold mb-8 text-center sticky top-0 pt-4 pb-6 bg-[#060714] z-10 text-transparent bg-clip-text bg-gradient-to-r from-[#00ffe5] to-[#4d8dff]">
            Model Performance Analysis
          </h2>

          <div className="flex justify-center space-x-4 mb-12">
            {models.map((model) => (
              <motion.button
                key={model.id}
                className={`px-6 py-3 rounded-full flex items-center gap-2 ${
                  selectedModel.id === model.id 
                    ? "bg-[#00ffe5] text-[#060714]" 
                    : "bg-[#2d1b4e] text-[#00ffe5]"
                }`}
                onClick={() => setSelectedModel(model)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {model.icon}
                <span className="font-semibold">{model.name}</span>
              </motion.button>
            ))}
          </div>

          <motion.div
            key={selectedModel.id}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Metrics Card */}
            <div className="bg-[#0a0f29] p-6 rounded-xl border border-[#2d1b4e]">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <FiZap className="text-[#00ffe5]" />
                Performance Metrics
              </h3>
              
              {[
                { name: "Accuracy", value: selectedModel.accuracy },
                { name: "Precision", value: selectedModel.precision },
                { name: "Recall", value: selectedModel.recall },
                { name: "F1 Score", value: selectedModel.f1 },
                { name: "AUC-ROC", value: selectedModel.auc }
              ].map((metric) => (
                <div key={metric.name} className="mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400">{metric.name}</span>
                    <span className="text-[#00ffe5]">
                      {(metric.value * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="relative h-2 bg-[#1a1e2e] rounded-full overflow-hidden">
                    <motion.div
                      className="absolute top-0 left-0 h-full bg-[#00ffe5]"
                      initial={{ width: 0 }}
                      animate={{ width: `${metric.value * 100}%` }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Features Card */}
            <div className="bg-[#0a0f29] p-6 rounded-xl border border-[#2d1b4e]">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <FiBox className="text-[#00ffe5]" />
                Key Features
              </h3>
              <ul className="space-y-3">
                {selectedModel.features.map((feature, index) => (
                  <motion.li
                    key={index}
                    className="flex items-center gap-2 text-gray-300"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-[#00ffe5]" />
                    {feature}
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

