import { createConfig, http, fallback } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";
import { farcasterMiniApp } from "@farcaster/miniapp-wagmi-connector";
import { injected } from "wagmi/connectors";

// Base Sepolia RPC endpoints dengan fallback (prioritized by reliability)
const baseSepoliaRpcUrls = [
  "https://sepolia.base.org", // Official Base Sepolia RPC
  "https://base-sepolia-rpc.publicnode.com", // PublicNode
  "https://base-sepolia.gateway.tenderly.co", // Tenderly
  "https://base-sepolia.drpc.org", // dRPC
  "https://base-sepolia.blockpi.network/v1/rpc/public", // BlockPI
] as const;

export const wagmiConfig = createConfig({
  chains: [baseSepolia, base],
  connectors: [
    farcasterMiniApp(), // Primary connector untuk Base App / Farcaster
    injected(), // Fallback untuk browser wallet (MetaMask, dll)
  ],
  transports: {
    [baseSepolia.id]: fallback(
      baseSepoliaRpcUrls.map(url => 
        http(url, {
          retryCount: 3,
          retryDelay: 1000,
          timeout: 15000, // Increase timeout to 15s
        })
      ),
      {
        rank: false, // Try all endpoints equally
        retryCount: 2, // Retry fallback mechanism
      }
    ),
    [base.id]: http(),
  },
});
