"use client";

import { useEffect, useState } from "react";
import { useAccount, useConnect, useChainId, useSwitchChain } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { getFarcasterContext } from "@/lib/farcaster";
import { isBaseAppEnvironment, detectInstalledWallets } from "@/lib/wallet-detection";
import { getWalletIcon } from "@/components/WalletIcons";

interface WalletGateProps {
  children: React.ReactNode;
  onConnected?: () => void;
}

export function WalletGate({ children, onConnected }: WalletGateProps) {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const chainId = useChainId();
  const { switchChain, isPending: isSwitchPending } = useSwitchChain();
  const [isCheckingFarcaster, setIsCheckingFarcaster] = useState(true);
  const [farcasterContext, setFarcasterContext] = useState<{ accountAddress?: string; username?: string } | null>(null);
  const [isBaseApp, setIsBaseApp] = useState(false);
  const [availableWallets, setAvailableWallets] = useState<any[]>([]);

  // Check if connected to correct chain (convert to number for comparison)
  const isCorrectChain = Number(chainId) === Number(baseSepolia.id);

  const handleSwitchNetwork = async () => {
    if (!switchChain) return;
    try {
      await switchChain({ chainId: baseSepolia.id });
    } catch (error) {
      console.error("Failed to switch network:", error);
    }
  };

  // Detect environment and available wallets
  useEffect(() => {
    const checkEnvironment = async () => {
      try {
        const baseAppEnv = isBaseAppEnvironment();
        setIsBaseApp(baseAppEnv);

        // If in Base App, prioritize Farcaster connector
        if (baseAppEnv) {
          const farcasterConnector = connectors.find(c => c.id === "farcasterMiniApp");
          if (farcasterConnector) {
            setAvailableWallets([farcasterConnector]);
          }
        } else {
          // In browser, show detected wallets (with error handling)
          let detected: any[] = [];
          try {
            detected = detectInstalledWallets();
          } catch (e) {
            console.debug("Wallet detection failed (non-critical):", e);
          }
          
          const filteredConnectors = connectors.filter(c => {
            const id = c.id.toLowerCase();
            if (id.includes("farcaster")) return false; // Hide Farcaster in browser
            if (detected.length === 0) return true; // Show all if none detected
            return detected.some(w => id.includes(w.id));
          });
          setAvailableWallets(filteredConnectors.length > 0 ? filteredConnectors : connectors.filter(c => !c.id.includes("farcaster")));
        }
      } catch (e) {
        console.debug("Environment check error (non-critical):", e);
        // Fallback: show injected connector
        setAvailableWallets(connectors.filter(c => !c.id.includes("farcaster")));
      }
    };

    checkEnvironment();
  }, [connectors]);

  // Auto-connect if in Farcaster/Base App
  useEffect(() => {
    const tryAutoConnect = async () => {
      try {
        const context = await getFarcasterContext();
        setFarcasterContext(context);
        
        if (context?.accountAddress && !isConnected && connectors.length > 0) {
          // Auto-connect with Farcaster connector in Base App
          const farcasterConnector = connectors.find(c => c.id === "farcasterMiniApp");
          if (farcasterConnector) {
            connect({ connector: farcasterConnector });
            return; // Don't set checking to false yet, wait for connection
          }
        }
      } catch (error) {
        console.warn("Auto-connect failed:", error);
      } finally {
        setIsCheckingFarcaster(false);
      }
    };

    if (!isConnected && isBaseApp) {
      tryAutoConnect();
    } else {
      setIsCheckingFarcaster(false);
    }
  }, [isConnected, connectors, connect, isBaseApp]);

  // Call onConnected when wallet is connected
  useEffect(() => {
    if (isConnected && address && isCorrectChain && onConnected) {
      onConnected();
    }
  }, [isConnected, address, isCorrectChain, onConnected]);

  // If wallet is connected and on correct chain, show game
  if (isConnected && address && isCorrectChain) {
    return <>{children}</>;
  }

  // Show wallet connection UI
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Connect Wallet to Play
          </h2>
          <p className="text-gray-600">
            {isBaseApp 
                ? "Connecting to your Base App wallet..." 
                : "Choose a wallet to connect and start playing Block Base!"}
          </p>
        </div>

        {isCheckingFarcaster && isBaseApp && (
          <div className="mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Connecting to Base App...</p>
          </div>
        )}

        {!isCheckingFarcaster && (
          <>
            {!isConnected && (
              <div className="space-y-3 mb-6">
                {(() => {
                  let detected: any[] = [];
                  try {
                    detected = detectInstalledWallets();
                  } catch (e) {
                    console.debug("Wallet detection error in UI (non-critical):", e);
                  }
                  
                  if (detected.length === 0) {
                    return (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-yellow-800 text-sm font-semibold mb-2">
                          No Wallet Detected
                        </p>
                        <p className="text-yellow-700 text-sm">
                          Please install a wallet extension like MetaMask or Coinbase Wallet to continue.
                        </p>
                      </div>
                    );
                  }

                  // Show detected wallets with their icons
                  return (
                    <>
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2">Detected wallets:</p>
                        <div className="flex flex-wrap gap-2">
                          {detected.map((wallet) => (
                            <div
                              key={wallet.id}
                              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200"
                            >
                              <div className="w-5 h-5">
                                {getWalletIcon(wallet.id, "w-5 h-5")}
                              </div>
                              <span className="text-xs font-medium text-gray-700">{wallet.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {availableWallets.map((connector) => (
                        <button
                          key={connector.id}
                          onClick={() => connect({ connector })}
                          disabled={isPending}
                          className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <div className="w-6 h-6">
                            {getWalletIcon(connector.id, "w-6 h-6")}
                          </div>
                          <span>
                            {isPending ? "Connecting..." : `Connect ${detected.length > 1 ? "Wallet" : detected[0]?.name || connector.name}`}
                          </span>
                        </button>
                      ))}
                    </>
                  );
                })()}
              </div>
            )}

            {isConnected && !isCorrectChain && (
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800 font-semibold mb-2">
                    Wrong Network
                  </p>
                  <p className="text-sm text-yellow-700 mb-3">
                    Current: Chain ID {chainId} <br />
                    Required: <strong>Base Sepolia</strong> (Chain ID: {baseSepolia.id})
                  </p>
                  <button
                    onClick={handleSwitchNetwork}
                    disabled={isSwitchPending}
                    className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSwitchPending ? "Switching Network..." : "Switch to Base Sepolia"}
                  </button>
                </div>
                <p className="text-sm text-gray-500">
                  Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
                </p>
              </div>
            )}

            {isConnected && isCorrectChain && address && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 font-semibold mb-2">
                    ✅ Wallet Connected!
                  </p>
                  <p className="text-sm text-green-700">
                    {address.slice(0, 6)}...{address.slice(-4)}
                  </p>
                </div>
                <p className="text-sm text-gray-500">Loading game...</p>
              </div>
            )}
          </>
        )}

        {farcasterContext?.username && (
          <p className="text-xs text-gray-400 mt-4">
            Welcome, {farcasterContext.username}!
          </p>
        )}
      </div>
    </div>
  );
}
