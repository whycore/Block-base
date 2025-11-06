"use client";

import { useState, useRef } from "react";
import { WalletGate } from "@/components/WalletGate";
import { MintButton } from "@/components/MintButton";
import { UserInfo } from "@/components/UserInfo";
import { SCORE_THRESHOLD } from "@/config/constants";
import { generateNFTImage } from "@/lib/ipfs";

export default function MintTestingPage() {
  const [testScore, setTestScore] = useState(SCORE_THRESHOLD);
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              NFT Minting Test Page
            </h1>
            <p className="text-gray-600">
              Test NFT minting functionality without playing the game
            </p>
          </div>

          <div className="mb-6">
            <UserInfo />
          </div>
        </div>

        <WalletGate>
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Test Configuration
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label 
                    htmlFor="score-input" 
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Test Score (must be ≥ {SCORE_THRESHOLD} to mint)
                  </label>
                  <input
                    id="score-input"
                    type="number"
                    min={SCORE_THRESHOLD}
                    value={testScore}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || SCORE_THRESHOLD;
                      setTestScore(Math.max(SCORE_THRESHOLD, value));
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={`Enter score (min: ${SCORE_THRESHOLD})`}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Current threshold: {SCORE_THRESHOLD} points
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    NFT Image (Optional - akan auto-generate jika kosong)
                  </label>
                  <p className="text-xs text-gray-500 mb-3">
                    💡 Pilih gambar custom atau biarkan sistem auto-generate SVG berdasarkan score
                  </p>
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          // Generate preview from score
                          const generated = generateNFTImage(testScore);
                          setPreviewImage(generated);
                          setCustomImage(null);
                        }}
                        className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-all"
                      >
                        Generate Preview
                      </button>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 rounded-lg bg-gray-600 text-white text-sm font-medium hover:bg-gray-700 transition-all"
                      >
                        Upload Custom Image
                      </button>
                      {(previewImage || customImage) && (
                        <button
                          type="button"
                          onClick={() => {
                            setPreviewImage(null);
                            setCustomImage(null);
                          }}
                          className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-all"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            const result = reader.result as string;
                            setCustomImage(result);
                            setPreviewImage(result);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    {(previewImage || customImage) && (
                      <div className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50">
                        <p className="text-xs text-gray-600 mb-2">Preview:</p>
                        <div className="w-48 h-48 mx-auto border-2 border-gray-300 rounded-lg overflow-hidden bg-white">
                          <img
                            src={previewImage || customImage || ""}
                            alt="NFT Preview"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-2 text-center">
                          {customImage ? "Custom Image" : "Auto-Generated"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-blue-900 mb-2">
                    Test Info
                  </h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Score: {testScore} points</li>
                    <li>• Can mint: {testScore >= SCORE_THRESHOLD ? "✅ Yes" : "❌ No (score too low)"}</li>
                    <li>• This will create an NFT with your test score</li>
                    <li>• NFT metadata will be uploaded to IPFS (Lighthouse/NFT.Storage)</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Mint NFT
              </h3>
              <MintButton score={testScore} customImage={customImage || previewImage} />
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">
                  Testing Checklist
                </h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>☐ Wallet connected to Base Sepolia</li>
                  <li>☐ Network switching works</li>
                  <li>☐ IPFS metadata upload succeeds</li>
                  <li>☐ NFT minting transaction succeeds</li>
                  <li>☐ Transaction hash displayed</li>
                  <li>☐ BaseScan link works</li>
                </ul>
              </div>
            </div>
          </div>
        </WalletGate>
      </div>
    </div>
  );
}

