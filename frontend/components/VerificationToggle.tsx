/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

type VerificationToggleProps = {
  formData: {
    Verified: boolean;
    [key: string]: any;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
};

export default function VerificationToggle({ formData, setFormData }: VerificationToggleProps) {
  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm font-medium text-gray-300">
        Account Verification
      </label>
      <div className="flex items-center p-2 rounded-lg bg-gray-800/50 border border-gray-700">
        <div className="relative w-full">
          <div
            className={`h-9 flex items-center rounded-md cursor-pointer ${
              formData.Verified ? "bg-gradient-to-r from-blue-600 to-blue-700" : "bg-gray-700"
            }`}
            onClick={() =>
              setFormData((prev: any) => ({ ...prev, Verified: !prev.Verified }))
            }
          >
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              {formData.Verified ? (
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
            </div>
            <span className="flex-1 text-center text-sm font-medium">
              {formData.Verified ? "Verified Account" : "Not Verified"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
