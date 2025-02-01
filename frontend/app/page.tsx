/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";

// Dynamically import Chart so that it only loads on the client side.
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function Home() {
  const [formData, setFormData] = useState({
    Tweet: "",
    "Retweet Count": 0,
    "Mention Count": 0,
    "Follower Count": 0,
    Verified: false,
    Hashtags: ""
  });
  
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          // Convert Verified to a numeric value if needed
          Verified: formData.Verified ? 1 : 0
        })
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: "Failed to fetch prediction" });
    } finally {
      setLoading(false);
    }
  };

  // Generate a natural language explanation based on the result.
  const getExplanation = () => {
    if (!result) return "";
    const { Predicted_Bot_Label, LR_Probability, Isolation_Forest_Pred } = result;
    const probabilityPercent = (LR_Probability * 100).toFixed(2);
    let explanation = "";
    if (Predicted_Bot_Label === 1) {
      explanation = `Our analysis suggests that this account is likely automated. The logistic regression model assigned a bot probability of ${probabilityPercent}%, which exceeds our threshold. ${Isolation_Forest_Pred === 1 
        ? "Additionally, our anomaly detection indicated unusual activity patterns." 
        : "However, the anomaly detection did not find any unusual behavior."} This combination leads us to believe that the account is bot-operated.`;
    } else {
      explanation = `The results indicate that this account is likely genuine. The logistic regression model estimated a bot probability of ${probabilityPercent}%, which is below our threshold. Also, the anomaly detection did not highlight any irregular activity. Overall, it appears that the account is human-operated.`;
    }
    return explanation;
  };

  // ApexCharts options for a radial bar chart (to display LR Probability).
  const chartOptions = {
    chart: {
      type: "radialBar" as const,
      toolbar: { show: false }
    },
    plotOptions: {
      radialBar: {
        hollow: {
          size: "60%"
        },
        dataLabels: {
          name: {
            fontSize: "16px",
            offsetY: -10
          },
          value: {
            fontSize: "22px",
            formatter: (val: number) => `${val}%`
          }
        }
      }
    },
    labels: ["LR Probability"],
    colors: ["#4ade80"] // A pleasant green color; adjust as needed.
  };

  const chartSeries = result ? [Number((result.LR_Probability * 100).toFixed(2))] : [0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col items-center p-4 md:p-8">
      <motion.h1 
        className="text-4xl md:text-5xl font-bold mt-6 mb-8 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        Bot Detection Predictor
      </motion.h1>

      <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-8">
        <motion.form 
          onSubmit={handleSubmit}
          className="w-full lg:w-1/2 backdrop-blur-md bg-white/5 p-8 rounded-2xl shadow-2xl border border-white/10"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300" htmlFor="Tweet">
                Tweet Content
              </label>
              <textarea
                id="Tweet"
                name="Tweet"
                rows={4}
                value={formData.Tweet}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-gray-800/50 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter tweet text..."
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Numeric inputs with modern styling */}
              {["Retweet Count", "Mention Count", "Follower Count"].map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    {field}
                  </label>
                  <input
                    type="number"
                    name={field}
                    value={String(formData[field as keyof typeof formData])}
                    onChange={handleChange}
                    className="w-full p-3 rounded-lg bg-gray-800/50 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>
              ))}

              <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                <input
                  id="Verified"
                  name="Verified"
                  type="checkbox"
                  checked={formData.Verified}
                  onChange={handleChange}
                  className="w-5 h-5 rounded text-indigo-500 focus:ring-indigo-500 bg-gray-700 border-gray-600"
                />
                <label className="text-sm font-medium text-gray-300">
                  Verified Account
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Hashtags
              </label>
              <input
                name="Hashtags"
                value={formData.Hashtags}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-gray-800/50 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                placeholder="#bot, #news"
              />
            </div>

            <motion.button
              type="submit"
              className="w-full py-3 px-6 bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-lg font-semibold shadow-lg hover:shadow-indigo-500/25 transition duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
                  <span>Analyzing...</span>
                </div>
              ) : (
                "Predict Bot"
              )}
            </motion.button>
          </div>
        </motion.form>

        {/* Results Section */}
        <motion.div 
          className={`w-full lg:w-1/2 backdrop-blur-md bg-white/5 p-8 rounded-2xl shadow-2xl border border-white/10 ${!result && 'flex items-center justify-center'}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          {!result && !loading && (
            <div className="text-center text-gray-400">
              <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-lg">Enter tweet details to see prediction results</p>
            </div>
          )}

          {result && !result.error && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                Analysis Results
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
                  <p className="text-sm text-gray-400">Bot Probability</p>
                  <p className="text-2xl font-bold">{(result.LR_Probability * 100).toFixed(2)}%</p>
                </div>
                <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
                  <p className="text-sm text-gray-400">Final Prediction</p>
                  <p className="text-2xl font-bold">{result.Predicted_Bot_Label ? 'Bot' : 'Human'}</p>
                </div>
              </div>

              <div className="h-[250px]">
                <Chart
                  options={{
                    ...chartOptions,
                    theme: { mode: 'dark' },
                    colors: [result.Predicted_Bot_Label ? '#ef4444' : '#22c55e']
                  }}
                  series={chartSeries}
                  type="radialBar"
                  height="100%"
                />
              </div>

              <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
                <h3 className="font-semibold mb-2">Analysis Explanation</h3>
                <p className="text-gray-300">{getExplanation()}</p>
              </div>
            </div>
          )}

          {result?.error && (
            <div className="text-red-400 p-4 rounded-lg bg-red-900/20 border border-red-900">
              {result.error}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
