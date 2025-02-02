/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";

// Dynamically import Chart so that it only loads on the client side.
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function Home() {
  const [formData, setFormData] = useState({
    Tweet: "",
    "Retweet Count": 0,
    "Mention Count": 0,
    "Follower Count": 0,
    Verified: false,
    Hashtags: "",
    model_version: "old" // default to the traditional model
  });
  
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
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
    const { Predicted_Bot_Label, LR_Probability, Isolation_Forest_Pred, model_version } = result;
    const probabilityPercent = (LR_Probability * 100).toFixed(2);
    let explanation = "";
    if (Predicted_Bot_Label === 1) {
      explanation = `Our analysis suggests that this account is likely automated. ${
        model_version === "old"
          ? `The traditional model assigned a bot probability of ${probabilityPercent}%, ${Isolation_Forest_Pred === 1 ? "and the anomaly detector indicated unusual behavior." : "though the anomaly detector did not flag any irregular activity."}`
          : `The improved model estimated a bot probability of ${probabilityPercent}%.`
      }`;
    } else {
      explanation = `The results indicate that this account is likely genuine. ${
        model_version === "old"
          ? `The traditional model estimated a bot probability of ${probabilityPercent}% with no unusual activity detected.`
          : `The improved model estimated a bot probability of ${probabilityPercent}%.`
      }`;
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
    labels: ["Bot Probability"],
    colors: ["#4ade80"]
  };

  const chartSeries = result ? [Number((result.LR_Probability * 100).toFixed(2))] : [0];

  // Loading skeleton component
  const ResultSkeleton = () => (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-gray-700/50 rounded-lg w-3/4"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-24 bg-gray-700/50 rounded-lg"></div>
        <div className="h-24 bg-gray-700/50 rounded-lg"></div>
      </div>
      <div className="h-[250px] bg-gray-700/50 rounded-lg"></div>
      <div className="h-32 bg-gray-700/50 rounded-lg"></div>
    </div>
  );

  // Result animation component
  const ResultAnimation = ({ isBot }: { isBot: boolean }) => (
    <div className="flex justify-center items-center mb-6">
      <Image
        src={isBot ? "/bot-detected.gif" : "/human-verified.gif"}
        alt={isBot ? "Bot Detected" : "Human Verified"}
        width={200}
        height={200}
        className="rounded-lg"
      />
    </div>
  );

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

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Model Version
              </label>
              <select
                name="model_version"
                value={formData.model_version}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-gray-800/50 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
              >
                <option value="old">Traditional</option>
                <option value="improved">Improved</option>
              </select>
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
          className={`w-full lg:w-1/2 backdrop-blur-md bg-white/5 p-8 rounded-2xl shadow-2xl border border-white/10 ${!result && !loading && 'flex items-center justify-center'}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          {!result && !loading && (
            <div className="text-center text-gray-400">
              <Image
                src="/analysis-waiting.gif"
                alt="Waiting for Analysis"
                width={200}
                height={200}
                className="mx-auto mb-4 opacity-80"
              />
              <p className="text-lg">Enter tweet details to see prediction results</p>
            </div>
          )}

          {loading && <ResultSkeleton />}

          {result && !result.error && (
            <div className="space-y-6">
              <ResultAnimation isBot={result.Predicted_Bot_Label === 1} />
              
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
              <Image
                src="/error.gif"
                alt="Error"
                width={100}
                height={100}
                className="mx-auto mb-4"
              />
              {result.error}
            </div>
          )}
        </motion.div>
      </div>

      {/* Footer Section */}
      <footer className="w-full mt-16 border-t border-gray-800 pt-8 pb-4">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center">
          <div className="flex flex-wrap justify-center gap-6 mb-4">
            <Link 
              href="https://qubitrules.com" 
              target="_blank"
              className="text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Visit QubitRules
            </Link>
            <Link 
              href="https://github.com/captainsza/Bot_Profile_Detection" 
              target="_blank"
              className="text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              GitHub Repository
            </Link>
            <Link 
              href="/TechnicalDocumentation.pdf" 
              target="_blank"
              className="text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Technical Documentation
            </Link>
          </div>
          
          <div className="text-center text-gray-400 text-sm">
            <p>Powered by advanced machine learning and neural networks</p>
            <p className="mt-2">
              © {new Date().getFullYear()} QubitRules. All rights reserved.
            </p>
          </div>

          <div className="flex items-center mt-4 space-x-2">
            <Image
              src="/logo-removebg.png"
              alt="QubitRules Logo"
              width={24}
              height={24}
              className="opacity-80"
            />
            <span className="text-sm text-gray-400">
              Built with ❤️ by QubitRules Team
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
