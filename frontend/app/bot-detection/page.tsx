/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { FiArrowLeft, FiGithub, FiBook } from "react-icons/fi";
import PredictionForm from "@/components/PredictionForm";
import ResultSection from "@/components/ResultSection";
import ErrorPopup from "@/components/ErrorPopup";

export default function BotPage() {
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

  return (
    <div className="min-h-screen bg-[#060714] text-gray-200">
      <motion.header 
        className="fixed top-0 left-0 right-0 z-50 bg-[#0a0f29]/80 backdrop-blur-xl border-b border-[#2d1b4e]"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link 
            href="/"
            className="flex items-center space-x-2 text-[#00ffe5] hover:text-[#00e6cc] transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <Link 
              href="https://github.com/captainsza/Bot_Profile_Detection"
              target="_blank"
              className="flex items-center space-x-2 text-gray-400 hover:text-[#00ffe5] transition-colors"
            >
              <FiGithub className="w-5 h-5" />
              <span className="hidden sm:inline">GitHub</span>
            </Link>
            <Link 
              href="/TechnicalDocumentation.html"
              target="_blank"
              className="flex items-center space-x-2 text-gray-400 hover:text-[#00ffe5] transition-colors"
            >
              <FiBook className="w-5 h-5" />
              <span className="hidden sm:inline">Docs</span>
            </Link>
          </div>
        </div>
      </motion.header>

      <main className="pt-24 pb-16 px-4 md:px-8">
        <motion.h1
          className="text-4xl md:text-5xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-[#00ffe5] to-[#4d8dff]"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Bot Detection Predictor
        </motion.h1>

        <motion.p
          className="text-center text-gray-400 max-w-2xl mx-auto mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Analyze Twitter profiles using our advanced AI models to detect automated accounts.
          Choose between our Traditional (XGBoost + BERT) or Improved Neural Network models.
        </motion.p>

        <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
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

          <ResultSection
            result={result}
            loading={loading}
            chartOptions={chartOptions}
            chartSeries={chartSeries}
            getExplanation={getExplanation}
          />
        </div>
      </main>

      <motion.footer 
        className="border-t border-[#2d1b4e] bg-[#0a0f29]/80 backdrop-blur-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-wrap justify-center gap-6 mb-4">
            <Link
              href="https://qubitrules.com"
              target="_blank"
              className="text-[#00ffe5] hover:text-[#00e6cc] transition-colors"
            >
              Visit QubitRules
            </Link>
            <Link
              href="https://github.com/captainsza/Bot_Profile_Detection"
              target="_blank"
              className="text-[#00ffe5] hover:text-[#00e6cc] transition-colors"
            >
              GitHub Repository
            </Link>
            <Link
              href="/TechnicalDocumentation.html"
              target="_blank"
              className="text-[#00ffe5] hover:text-[#00e6cc] transition-colors"
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

          <div className="flex items-center justify-center mt-4 space-x-2">
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
      </motion.footer>

      {errorMessage && (
        <ErrorPopup
          message={errorMessage}
          onClose={() => setErrorMessage(null)}
        />
      )}
    </div>
  );
}
