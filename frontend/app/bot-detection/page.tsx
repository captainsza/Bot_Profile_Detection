/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

// Import our new components
import PredictionForm from "@/components/PredictionForm";
import ResultSection from "@/components/ResultSection";
import ErrorPopup from "@/components/ErrorPopup";

// Dynamically import the Chart so that it only loads on the client side in ResultSection
// We'll do that inside ResultSection to keep it more self-contained

export default function Home() {
  // --------------------- STATES ---------------------
  const [formData, setFormData] = useState({
    Tweet: "",
    "Retweet Count": 0,
    "Mention Count": 0,
    "Follower Count": 0,
    Verified: false,
    Hashtags: "",
    model_version: "old", // Default to the 'old' (traditional) model
  });

  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [fetchingTwitter, setFetchingTwitter] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // --------------------- HANDLERS ---------------------
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
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
          Verified: formData.Verified ? 1 : 0,
        }),
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: "Failed to fetch prediction" });
    } finally {
      setLoading(false);
    }
  };

  const fetchTwitterData = async () => {
    if (!username) {
      setErrorMessage("Please enter a Twitter username");
      return;
    }
    setFetchingTwitter(true);
    try {
      const response = await fetch(`/api/twitter?username=${encodeURIComponent(username)}`);
      const data = await response.json();

      if (response.ok) {
        setFormData((prev) => ({
          ...prev,
          ...data,
        }));
      } else {
        throw new Error(data.error || "Failed to fetch Twitter data");
      }
    } catch (error: any) {
      setErrorMessage(error.message || "Failed to fetch Twitter data");
    } finally {
      setFetchingTwitter(false);
    }
  };

  // --------------------- EXPLANATION GENERATOR ---------------------
  const getExplanation = () => {
    if (!result) return "";
    const { Predicted_Bot_Label, LR_Probability, Isolation_Forest_Pred, model_version } = result;
    const probabilityPercent = (LR_Probability * 100).toFixed(2);

    let explanation = "";
    if (Predicted_Bot_Label === 1) {
      if (model_version === "old") {
        explanation = `Our analysis suggests that this account is likely automated. The traditional model assigned a bot probability of ${probabilityPercent}%, ${
          Isolation_Forest_Pred === 1
            ? "and the anomaly detector indicated unusual behavior."
            : "though the anomaly detector did not flag any irregular activity."
        }`;
      } else if (model_version === "traditional2") {
        explanation = `Our analysis suggests that this account is likely automated. The traditional2 (XGBoost + BERT) model estimated a bot probability of ${probabilityPercent}%.`;
      } else {
        explanation = `Our analysis suggests that this account is likely automated. The improved model estimated a bot probability of ${probabilityPercent}%.`;
      }
    } else {
      if (model_version === "old") {
        explanation = `The results indicate that this account is likely genuine. The traditional model estimated a bot probability of ${probabilityPercent}% with no unusual activity detected.`;
      } else if (model_version === "traditional2") {
        explanation = `The results indicate that this account is likely genuine. The traditional2 (XGBoost + BERT) model estimated a bot probability of ${probabilityPercent}%.`;
      } else {
        explanation = `The results indicate that this account is likely genuine. The improved model estimated a bot probability of ${probabilityPercent}%.`;
      }
    }
    return explanation;
  };

  // --------------------- CHART DATA ---------------------
  const chartOptions = {
    chart: {
      type: "radialBar" as const,
      toolbar: { show: false },
    },
    plotOptions: {
      radialBar: {
        hollow: {
          size: "60%",
        },
        dataLabels: {
          name: {
            fontSize: "16px",
            offsetY: -10,
          },
          value: {
            fontSize: "22px",
            formatter: (val: number) => `${val}%`,
          },
        },
      },
    },
    labels: ["Bot Probability"],
    colors: ["#4ade80"],
  };

  const chartSeries = result ? [Number((result.LR_Probability * 100).toFixed(2))] : [0];

  // --------------------- RENDER ---------------------
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
        {/* ------------------- FORM SECTION ------------------- */}
        <PredictionForm
          formData={formData}
          setFormData={setFormData}
          handleSubmit={handleSubmit}
          handleChange={handleChange}
          username={username}
          setUsername={setUsername}
          fetchTwitterData={fetchTwitterData}
          fetchingTwitter={fetchingTwitter}
          loading={loading}
        />

        {/* ------------------- RESULT SECTION ------------------- */}
        <ResultSection
          result={result}
          loading={loading}
          chartOptions={chartOptions}
          chartSeries={chartSeries}
          getExplanation={getExplanation}
        />
      </div>

      {errorMessage && (
        <ErrorPopup
          message={errorMessage}
          onClose={() => setErrorMessage(null)}
        />
      )}

      {/* ------------------- FOOTER SECTION ------------------- */}
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
