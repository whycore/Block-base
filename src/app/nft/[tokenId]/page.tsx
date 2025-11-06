"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useReadContract } from "wagmi";
import { GAME_NFT_ABI } from "@/contracts/GameNFT.abi";
import { baseSepolia } from "wagmi/chains";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS as `0x${string}`;

export default function NFTViewPage() {
  const params = useParams();
  const tokenId = params.tokenId as string;
  const [metadata, setMetadata] = useState<any>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Read tokenURI from contract
  const { data: tokenURI, isLoading: isLoadingURI } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: GAME_NFT_ABI,
    functionName: "tokenURI",
    args: [BigInt(tokenId || "0")],
    chainId: baseSepolia.id,
    query: {
      enabled: !!tokenId && !!CONTRACT_ADDRESS,
    },
  });

  // Read token score from contract
  const { data: tokenScore } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: GAME_NFT_ABI,
    functionName: "tokenScores",
    args: [BigInt(tokenId || "0")],
    chainId: baseSepolia.id,
    query: {
      enabled: !!tokenId && !!CONTRACT_ADDRESS,
    },
  });

  // Fetch metadata from IPFS
  useEffect(() => {
    if (!tokenURI || isLoadingURI) return;

    const fetchMetadata = async () => {
      try {
        setLoading(true);
        setError(null);

        // Convert IPFS URL to HTTP gateway URL
        let metadataUrl = tokenURI as string;
        if (metadataUrl.startsWith("ipfs://")) {
          const cid = metadataUrl.replace("ipfs://", "");
          // Try multiple IPFS gateways
          const gateways = [
            `https://ipfs.io/ipfs/${cid}`,
            `https://gateway.pinata.cloud/ipfs/${cid}`,
            `https://cloudflare-ipfs.com/ipfs/${cid}`,
            `https://dweb.link/ipfs/${cid}`,
          ];

          // Try first gateway
          metadataUrl = gateways[0];
        }

        const response = await fetch(metadataUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch metadata: ${response.statusText}`);
        }

        const data = await response.json();
        setMetadata(data);

        // Extract image URL
        if (data.image) {
          let imgUrl = data.image;
          if (imgUrl.startsWith("ipfs://")) {
            const imgCid = imgUrl.replace("ipfs://", "");
            imgUrl = `https://ipfs.io/ipfs/${imgCid}`;
          }
          setImageUrl(imgUrl);
        } else if (data.imageUrl) {
          // Fallback to imageUrl if image doesn't exist
          setImageUrl(data.imageUrl);
        }
      } catch (err: any) {
        console.error("Error fetching NFT metadata:", err);
        setError(err.message || "Failed to load NFT metadata");
      } finally {
        setLoading(false);
      }
    };

    fetchMetadata();
  }, [tokenURI, isLoadingURI]);

  if (isLoadingURI || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading NFT...</p>
        </div>
      </div>
    );
  }

  if (error || !metadata) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">NFT Not Found</h1>
          <p className="text-gray-600 mb-4">
            {error || "Unable to load NFT metadata. The NFT may not exist or the IPFS gateway may be unavailable."}
          </p>
          <a
            href="/"
            className="inline-block px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all"
          >
            Back to Game
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="grid md:grid-cols-2 gap-8 p-8">
            {/* NFT Image */}
            <div className="space-y-4">
              <div className="aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-100 border-4 border-gray-200 shadow-lg">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={metadata.name || "NFT"}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      // Fallback jika image gagal load
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      const fallback = document.createElement("div");
                      fallback.className = "w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-6xl font-bold";
                      fallback.textContent = "🎮";
                      target.parentElement?.appendChild(fallback);
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-6xl font-bold">
                    🎮
                  </div>
                )}
              </div>
              
              {/* NFT Info */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div>
                  <span className="text-sm text-gray-500">Token ID</span>
                  <p className="font-mono text-lg font-semibold">#{tokenId}</p>
                </div>
                {tokenScore !== undefined && (
                  <div>
                    <span className="text-sm text-gray-500">Score</span>
                    <p className="text-lg font-semibold">{tokenScore.toString()} points</p>
                  </div>
                )}
                <a
                  href={`https://sepolia.basescan.org/token/${CONTRACT_ADDRESS}?a=${tokenId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View on BaseScan →
                </a>
              </div>
            </div>

            {/* NFT Details */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {metadata.name || `Block Base NFT #${tokenId}`}
                </h1>
                <p className="text-gray-600 text-lg">
                  {metadata.description || "Block Base Achievement NFT"}
                </p>
              </div>

              {/* Attributes */}
              {metadata.attributes && metadata.attributes.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Attributes</h2>
                  <div className="grid grid-cols-2 gap-3">
                    {metadata.attributes.map((attr: any, idx: number) => (
                      <div
                        key={idx}
                        className="bg-blue-50 border border-blue-200 rounded-lg p-3"
                      >
                        <div className="text-xs text-blue-600 font-medium uppercase mb-1">
                          {attr.trait_type}
                        </div>
                        <div className="text-lg font-semibold text-blue-900">
                          {String(attr.value)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Metadata Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Metadata</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>
                    <span className="font-medium">Contract:</span>{" "}
                    <span className="font-mono text-xs">
                      {CONTRACT_ADDRESS.slice(0, 10)}...{CONTRACT_ADDRESS.slice(-8)}
                    </span>
                  </p>
                  <p>
                    <span className="font-medium">Network:</span> Base Sepolia
                  </p>
                  <p>
                    <span className="font-medium">Token URI:</span>{" "}
                    <span className="font-mono text-xs break-all">{tokenURI as string}</span>
                  </p>
                </div>
              </div>

              <a
                href="/"
                className="inline-block w-full px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-center hover:from-blue-700 hover:to-indigo-700 transition-all"
              >
                Play Game
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

