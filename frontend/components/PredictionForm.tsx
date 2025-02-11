/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { motion } from "framer-motion";
import VerificationToggle from "./VerificationToggle";

type PredictionFormProps = {
  formData: {
    Tweet: string;
    "Retweet Count": number;
    "Mention Count": number;
    "Follower Count": number;
    Verified: boolean;
    Hashtags: string;
    model_version: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  username: string;
  setUsername: React.Dispatch<React.SetStateAction<string>>;
  fetchTwitterData: () => Promise<void>;
  fetchingTwitter: boolean;
  loading: boolean;
};

export default function PredictionForm({
  formData,
  setFormData,
  handleSubmit,
  handleChange,
  username,
  setUsername,
  fetchTwitterData,
  fetchingTwitter,
  loading,
}: PredictionFormProps) {
  return (
    <motion.form
      onSubmit={handleSubmit}
      className="w-full lg:w-1/2 bg-[#0a0f29]/80 backdrop-blur-xl p-8 rounded-2xl border border-[#2d1b4e] shadow-[0_0_50px_rgba(0,255,229,0.1)]"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="space-y-6">
        {/* Twitter Username Input + Fetch Button */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2 text-[#00ffe5]">
              Twitter Username
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-[#00ffe5]">@</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.replace("@", ""))}
                className="w-full pl-8 p-3 rounded-lg bg-[#060714] border border-[#2d1b4e] text-gray-200
                         focus:outline-none focus:ring-2 focus:ring-[#00ffe5] focus:border-transparent
                         transition-all duration-200 placeholder-gray-500"
                placeholder="username"
              />
            </div>
          </div>
          <motion.button
            type="button"
            onClick={fetchTwitterData}
            disabled={fetchingTwitter || !username}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="self-end px-6 py-3 bg-[#2d1b4e] text-[#00ffe5] rounded-lg font-semibold
                     hover:bg-[#382460] transition duration-300 disabled:opacity-50 
                     disabled:cursor-not-allowed min-w-[120px] border border-[#00ffe5]/20
                     shadow-[0_0_20px_rgba(0,255,229,0.1)]"
          >
            {fetchingTwitter ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-[#00ffe5] border-t-transparent rounded-full animate-spin" />
                <span>Fetching...</span>
              </div>
            ) : (
              "Fetch Data"
            )}
          </motion.button>
        </div>

        {/* Tweet Content */}
        <div>
          <label className="block text-sm font-medium mb-2 text-[#00ffe5]">
            Tweet Content
          </label>
          <textarea
            name="Tweet"
            rows={4}
            value={formData.Tweet}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-[#060714] border border-[#2d1b4e] text-gray-200
                     focus:outline-none focus:ring-2 focus:ring-[#00ffe5] focus:border-transparent
                     transition-all duration-200 placeholder-gray-500 resize-none"
            placeholder="Enter tweet text..."
            required
          />
        </div>

        {/* Numeric Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {["Retweet Count", "Mention Count", "Follower Count"].map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium mb-2 text-[#00ffe5]">
                {field}
              </label>
              <input
                type="number"
                name={field}
                value={String(formData[field as keyof typeof formData])}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-[#060714] border border-[#2d1b4e] text-gray-200
                         focus:outline-none focus:ring-2 focus:ring-[#00ffe5] focus:border-transparent
                         transition-all duration-200"
                required
              />
            </div>
          ))}
          <VerificationToggle formData={formData} setFormData={setFormData} />
        </div>

        {/* Hashtags */}
        <div>
          <label className="block text-sm font-medium mb-2 text-[#00ffe5]">
            Hashtags
          </label>
          <input
            name="Hashtags"
            value={formData.Hashtags}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-[#060714] border border-[#2d1b4e] text-gray-200
                     focus:outline-none focus:ring-2 focus:ring-[#00ffe5] focus:border-transparent
                     transition-all duration-200 placeholder-gray-500"
            placeholder="#bot, #news"
          />
        </div>

        {/* Model Version Selector */}
        <div>
          <label className="block text-sm font-medium mb-2 text-[#00ffe5]">
            Model Version
          </label>
          <select
            name="model_version"
            value={formData.model_version}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-[#060714] border border-[#2d1b4e] text-gray-200
                     focus:outline-none focus:ring-2 focus:ring-[#00ffe5] focus:border-transparent
                     transition-all duration-200"
          >
            <option value="traditional2">Traditional (XGBoost + BERT)</option>
            <option value="improved">Improved Neural Network</option>
          </select>
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          className="w-full py-3 px-6 bg-gradient-to-r from-[#00ffe5] to-[#4d8dff] text-[#060714]
                   rounded-lg font-semibold shadow-lg hover:shadow-[#00ffe5]/25 transition duration-300
                   disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-[#060714] border-t-transparent rounded-full animate-spin" />
              <span>Analyzing...</span>
            </div>
          ) : (
            "Predict Bot"
          )}
        </motion.button>
      </div>
    </motion.form>
  );
}
