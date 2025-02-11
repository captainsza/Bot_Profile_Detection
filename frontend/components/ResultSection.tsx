/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import Image from "next/image";
import Orb from "./ORBloading";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

// Update ResultSkeleton to include Orb loading
const ResultSkeleton = () => (
  <div className="flex flex-col items-center justify-center w-full h-full">
    <div className="w-48 h-48 relative mb-6">
      <Orb hue={240} hoverIntensity={0.4} rotateOnHover={false} forceHoverState={true} />
    </div>
    <div className="animate-pulse space-y-6 w-full">
      <div className="h-8 bg-gray-700/50 rounded-lg w-3/4"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-24 bg-gray-700/50 rounded-lg"></div>
        <div className="h-24 bg-gray-700/50 rounded-lg"></div>
      </div>
      <div className="h-[250px] bg-gray-700/50 rounded-lg"></div>
      <div className="h-32 bg-gray-700/50 rounded-lg"></div>
    </div>
  </div>
);

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

type ResultSectionProps = {
  result: any;
  loading: boolean;
  chartOptions: any;
  chartSeries: number[];
  getExplanation: () => string;
};

export default function ResultSection({
  result,
  loading,
  chartOptions,
  chartSeries,
  getExplanation,
}: ResultSectionProps) {
  return (
    <motion.div
      className={`w-full lg:w-1/2 backdrop-blur-md bg-white/5 p-8 rounded-2xl shadow-2xl border border-white/10 min-h-[600px] flex items-center justify-center`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* If no result and not loading */}
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

      {/* If loading, show skeleton with Orb */}
      {loading && <ResultSkeleton />}

      {/* If result is available and no error */}
      {result && !result.error && (
        <div className="space-y-6 w-full">
          <ResultAnimation isBot={result.Predicted_Bot_Label === 1} />

          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            Analysis Results
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
              <p className="text-sm text-gray-400">Bot Probability</p>
              <p className="text-2xl font-bold">
                {(result.LR_Probability * 100).toFixed(2)}%
              </p>
            </div>
            <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
              <p className="text-sm text-gray-400">Final Prediction</p>
              <p className="text-2xl font-bold">
                {result.Predicted_Bot_Label ? "Bot" : "Human"}
              </p>
            </div>
          </div>

          <div className="h-[250px]">
            <Chart
              options={{
                ...chartOptions,
                theme: { mode: "dark" },
                colors: [result.Predicted_Bot_Label ? "#ef4444" : "#22c55e"],
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

      {/* If there's an error in the result */}
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
  );
}
