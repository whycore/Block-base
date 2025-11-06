"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useReadContract } from "wagmi";
import { GAME_NFT_ABI } from "@/contracts/GameNFT.abi";
import { baseSepolia } from "wagmi/chains";
import { WalletGate } from "@/components/WalletGate";
import { UserInfo } from "@/components/UserInfo";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS as `0x${string}`;

interface NFTData {
  tokenId: string;
  score: bigint;
  metadata: any;
  imageUrl: string | null;
}

export default function NFTGalleryPage() {
  const { address, isConnected } = useAccount();
  const [nfts, setNfts] = useState<NFTData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get user's NFT balance
  const { data: balance } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: GAME_NFT_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: baseSepolia.id,
    query: {
      enabled: isConnected && !!address && !!CONTRACT_ADDRESS,
    },
  });

  // Fetch NFT data
  useEffect(() => {
    if (!isConnected || !address || !balance || balance === BigInt(0)) {
      setLoading(false);
      return;
    }

    const fetchNFTs = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const nftList: NFTData[] = [];
        const balanceNum = Number(balance);

        // Try to fetch tokens (we'll need to iterate through token IDs)
        // For now, we'll show a message that gallery is coming soon
        // In production, you'd need to track token IDs or use events
        
        setNfts(nftList);
      } catch (err: any) {
        console.error("Error fetching NFTs:", err);
        setError(err.message || "Failed to load NFTs");
      } finally {
        setLoading(false);
      }
    };

    fetchNFTs();
  }, [isConnected, address, balance]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              My NFT Gallery
            </h1>
            <p className="text-gray-600">
              View your Block Base Achievement NFTs
            </p>
          </div>

          <div className="mb-6">
            <UserInfo />
          </div>
        </div>

        <WalletGate>
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your NFTs...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="text-red-500 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all"
                >
                  Retry
                </button>
              </div>
            ) : balance === BigInt(0) || nfts.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">No NFTs Yet</h2>
                <p className="text-gray-600 mb-6">
                  You haven't minted any NFTs yet. Play the game and score 1000+ to mint your first NFT!
                </p>
                <a
                  href="/"
                  className="inline-block px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all"
                >
                  Play Game
                </a>
              </div>
            ) : (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                    Your NFTs ({nfts.length})
                  </h2>
                  <p className="text-gray-600">
                    Total owned: {balance?.toString() || "0"}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {nfts.map((nft) => (
                    <a
                      key={nft.tokenId}
                      href={`/nft/${nft.tokenId}`}
                      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all border-2 border-transparent hover:border-blue-500"
                    >
                      <div className="aspect-square bg-gradient-to-br from-blue-100 to-indigo-100">
                        {nft.imageUrl ? (
                          <img
                            src={nft.imageUrl}
                            alt={nft.metadata?.name || `NFT #${nft.tokenId}`}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-6xl">
                            🎮
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {nft.metadata?.name || `Block Base #${nft.tokenId}`}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Score: {nft.score.toString()} points
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          Token ID: #{nft.tokenId}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </WalletGate>
      </div>
    </div>
  );
}

