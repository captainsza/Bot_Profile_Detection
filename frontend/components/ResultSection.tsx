/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import Image from "next/image";
import Orb from "./ORBloading";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const ResultSkeleton = () => (
  <div className="flex flex-col items-center justify-center w-full h-full">
    <div className="w-48 h-48 relative mb-6">
      <Orb hue={180} hoverIntensity={0.6} rotateOnHover={false} forceHoverState={true} />
    </div>
    <div className="animate-pulse space-y-6 w-full">
      <div className="h-8 bg-[#2d1b4e] rounded-lg w-3/4"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-24 bg-[#2d1b4e] rounded-lg"></div>
        <div className="h-24 bg-[#2d1b4e] rounded-lg"></div>
      </div>
      <div className="h-[250px] bg-[#2d1b4e] rounded-lg"></div>
      <div className="h-32 bg-[#2d1b4e] rounded-lg"></div>
    </div>
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
      className="w-full lg:w-1/2 bg-[#0a0f29]/80 backdrop-blur-xl p-8 rounded-2xl 
                 border border-[#2d1b4e] shadow-[0_0_50px_rgba(0,255,229,0.1)] min-h-[600px] 
                 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Initial State */}
      {!result && !loading && (
        <div className="text-center text-[#00ffe5]/60">
          <Image
            src="/analysis-waiting.gif"
            alt="Waiting for Analysis"
            width={200}
            height={200}
            className="mx-auto mb-4 opacity-80"
          />
          <p className="text-lg bg-gradient-to-r from-[#00ffe5] to-[#4d8dff] bg-clip-text text-transparent">
            Enter tweet details to analyze
          </p>
        </div>
      )}

      {/* Loading State */}
      {loading && <ResultSkeleton />}

      {/* Results State */}
      {result && !result.error && (
        <div className="space-y-6 w-full">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="flex justify-center"
          >
            <Image
              src={result.Predicted_Bot_Label === 1 ? "/bot-detected.gif" : "/human-verified.gif"}
              alt={result.Predicted_Bot_Label === 1 ? "Bot Detected" : "Human Verified"}
              width={200}
              height={200}
              className="rounded-lg border-2 border-[#00ffe5]/20 shadow-[0_0_30px_rgba(0,255,229,0.2)]"
            />
          </motion.div>

          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00ffe5] to-[#4d8dff]">
            Analysis Results
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="p-4 rounded-lg bg-[#060714] border border-[#2d1b4e] hover:border-[#00ffe5]/50 transition-all duration-300"
            >
              <p className="text-sm text-[#00ffe5]">Bot Probability</p>
              <p className="text-2xl font-bold text-white">
                {(result.LR_Probability * 100).toFixed(2)}%
              </p>
            </motion.div>

            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="p-4 rounded-lg bg-[#060714] border border-[#2d1b4e] hover:border-[#00ffe5]/50 transition-all duration-300"
            >
              <p className="text-sm text-[#00ffe5]">Final Prediction</p>
              <p className="text-2xl font-bold text-white">
                {result.Predicted_Bot_Label ? "Bot" : "Human"}
              </p>
            </motion.div>
          </div>

          <motion.div 
            className="h-[250px] bg-[#060714] rounded-lg border border-[#2d1b4e] p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Chart
              options={{
                ...chartOptions,
                theme: { mode: "dark" },
                colors: [result.Predicted_Bot_Label ? "#ff4657" : "#00ffe5"],
                plotOptions: {
                  ...chartOptions.plotOptions,
                  radialBar: {
                    ...chartOptions.plotOptions.radialBar,
                    track: {
                      background: "#2d1b4e",
                      strokeWidth: '97%',
                      opacity: 0.5,
                    },
                    dataLabels: {
                      ...chartOptions.plotOptions.radialBar.dataLabels,
                      value: {
                        ...chartOptions.plotOptions.radialBar.dataLabels.value,
                        color: "#00ffe5",
                      }
                    }
                  }
                }
              }}
              series={chartSeries}
              type="radialBar"
              height="100%"
            />
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="p-4 rounded-lg bg-[#060714] border border-[#2d1b4e] hover:border-[#00ffe5]/50 transition-all duration-300"
          >
            <h3 className="font-semibold mb-2 text-[#00ffe5]">Analysis Explanation</h3>
            <p className="text-gray-300 leading-relaxed">{getExplanation()}</p>
          </motion.div>
        </div>
      )}

      {/* Error State */}
      {result?.error && (
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-[#ff4657] p-6 rounded-lg bg-[#ff4657]/10 border border-[#ff4657]/30"
        >
          <Image
            src="/error.gif"
            alt="Error"
            width={100}
            height={100}
            className="mx-auto mb-4 opacity-90"
          />
          <p className="text-center">{result.error}</p>
        </motion.div>
      )}
    </motion.div>
  );
}
