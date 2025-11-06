"use client";

import { useState, useEffect } from "react";
import { useAccount, useChainId, useSwitchChain, useReadContract } from "wagmi";
import { writeContract, waitForTransactionReceipt, readContract, estimateGas, getPublicClient } from "wagmi/actions";
import { encodeFunctionData } from "viem";
import { baseSepolia } from "wagmi/chains";
import { wagmiConfig } from "@/config/wagmi";
import { GAME_NFT_ABI } from "@/contracts/GameNFT.abi";
import { uploadMetadataToIPFS, generateNFTImage } from "@/lib/ipfs";
import { SCORE_THRESHOLD } from "@/config/constants";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS as `0x${string}`;
const CHAIN_ID = baseSepolia.id; // 84532

interface MintButtonProps {
  score: number;
  customImage?: string | null; // Optional custom image (data URL or URL)
}

export function MintButton({ score, customImage }: MintButtonProps) {
  const [isMinting, setIsMinting] = useState(false);
  const [mintStatus, setMintStatus] = useState<"idle" | "uploading" | "minting" | "waitingWallet" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);
  const [isSwitching, setIsSwitching] = useState(false);
  const [pendingMintAfterSwitch, setPendingMintAfterSwitch] = useState(false);
  const [waitingForWallet, setWaitingForWallet] = useState(false);
  
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending: isSwitchPending } = useSwitchChain();

  // Check if connected to correct chain (convert to number for comparison)
  const isCorrectChain = Number(chainId) === Number(CHAIN_ID);
  
  // Check if contract exists and is accessible
  const { data: contractCheck, isLoading: isCheckingContract, error: contractError } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: GAME_NFT_ABI,
    functionName: "SCORE_THRESHOLD",
    chainId: CHAIN_ID,
    query: {
      enabled: isConnected && isCorrectChain && !!CONTRACT_ADDRESS && CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000",
    },
  });

  // Debug: Log chain IDs
  useEffect(() => {
    console.log("Chain Debug:", {
      currentChainId: chainId,
      expectedChainId: CHAIN_ID,
      baseSepoliaId: baseSepolia.id,
      isCorrect: chainId === CHAIN_ID,
      types: {
        chainId: typeof chainId,
        CHAIN_ID: typeof CHAIN_ID,
      }
    });
  }, [chainId]);

  // Auto-retry mint after successful network switch
  useEffect(() => {
    if (pendingMintAfterSwitch && isCorrectChain && isConnected && address) {
      // Chain switched successfully, retry mint
      setPendingMintAfterSwitch(false);
      setIsSwitching(false);
      // Trigger mint again after a short delay
      setTimeout(() => {
        handleMintInternal();
      }, 500);
    }
  }, [isCorrectChain, pendingMintAfterSwitch, isConnected, address, chainId]);

  // Handle switch network manually
  const handleSwitchNetwork = async () => {
    if (!switchChain) {
      setError("Network switching not available. Please switch to Base Sepolia manually in your wallet.");
      return;
    }

    setIsSwitching(true);
    setError(null);

    try {
      await switchChain({ chainId: CHAIN_ID });
      // Wait a bit for chain switch to complete
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (err: any) {
      console.error("Switch network error:", err);
      setError(err?.message || "Failed to switch network. Please switch to Base Sepolia manually in your wallet.");
    } finally {
      setIsSwitching(false);
    }
  };

  // Internal mint function (called after network switch)
  const handleMintInternal = async () => {
    if (!isConnected || !address) {
      setError("Wallet not connected. Please connect your wallet first.");
      return;
    }

    // Validate score before proceeding
    if (score < SCORE_THRESHOLD) {
      setError(`Score must be at least ${SCORE_THRESHOLD} to mint NFT. Current score: ${score}`);
      setIsMinting(false);
      return;
    }

    if (!CONTRACT_ADDRESS || CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
      setError("NFT contract address not configured. Please set NEXT_PUBLIC_NFT_CONTRACT_ADDRESS in .env.local");
      return;
    }

    // Verify contract is accessible
    try {
      await readContract(wagmiConfig, {
        address: CONTRACT_ADDRESS,
        abi: GAME_NFT_ABI,
        functionName: "SCORE_THRESHOLD",
        chainId: CHAIN_ID,
      });
    } catch (err: any) {
      console.error("Contract verification error:", err);
      setError(
        `Cannot access contract at ${CONTRACT_ADDRESS}. ` +
        `Please verify: 1) Contract is deployed on Base Sepolia, 2) Address is correct, ` +
        `3) You're connected to Base Sepolia network. ` +
        `Error: ${err?.message || "Unknown error"}`
      );
      setIsMinting(false);
      return;
    }

    setIsMinting(true);
    setMintStatus("uploading");
    setError(null);

    try {
      // 1. Prepare NFT metadata
      // Use custom image if provided, otherwise generate SVG
      const imageUrl = customImage || generateNFTImage(score);
      
      const metadata = {
        name: `${score} Points on BlockBase`,
        description: `You scored ${score} points on BlockBase. Build for everyone.`,
        imageUrl: imageUrl, // Use custom image or generated SVG
        attributes: [
          { trait_type: "Score", value: score },
          { trait_type: "Game", value: "Block Base" },
          { trait_type: "Timestamp", value: new Date().toISOString() },
          ...(customImage ? [{ trait_type: "Image Type", value: "Custom" }] : [{ trait_type: "Image Type", value: "Auto-Generated" }]),
        ],
      };

      // 2. Upload metadata to IPFS
      const metadataURI = await uploadMetadataToIPFS(metadata);

      // 3. Final check - chain should be correct at this point (convert to number for comparison)
      if (Number(chainId) !== Number(CHAIN_ID)) {
        throw new Error(`Wrong network. Current: ${chainId}, Required: ${CHAIN_ID}. Please switch network and try again.`);
      }

        // 4. Mint NFT with gas estimation
      setMintStatus("minting");
      
      // Try to estimate gas first, with fallback
      let gasLimit: bigint | undefined = undefined;
        // Prepare EIP-1559 fee values (helps wallets that can't estimate reliably)
        let maxFeePerGas: bigint | undefined = undefined;
        let maxPriorityFeePerGas: bigint | undefined = undefined;
      try {
          // Fetch suggested fees from the public client (EIP-1559)
          const publicClient = getPublicClient(wagmiConfig, { chainId: CHAIN_ID });
          try {
            const fees = await (publicClient as any).estimateFeesPerGas();
            // Some clients return bigint, ensure types are correct
            if (fees?.maxFeePerGas) maxFeePerGas = fees.maxFeePerGas as bigint;
            if (fees?.maxPriorityFeePerGas) maxPriorityFeePerGas = fees.maxPriorityFeePerGas as bigint;
          } catch (feeErr) {
            console.warn("Fee estimation failed (non-critical):", feeErr);
          }

        const estimatedGas = await estimateGas(wagmiConfig, {
          to: CONTRACT_ADDRESS,
          data: encodeFunctionData({
            abi: GAME_NFT_ABI,
            functionName: "mintNFT",
            args: [address, BigInt(score), metadataURI],
          }),
          account: address,
          chainId: CHAIN_ID,
        });
        // Add 20% buffer for safety
        gasLimit = (estimatedGas * BigInt(120)) / BigInt(100);
        console.log("Gas estimated:", estimatedGas.toString(), "With buffer:", gasLimit.toString());
      } catch (gasError: any) {
        console.warn("Gas estimation failed, using fallback:", gasError);
        // Check if it's a network/RPC error
        const gasErrMsg = gasError?.message?.toLowerCase() || "";
        if (gasErrMsg.includes("fetch") || gasErrMsg.includes("network") || gasErrMsg.includes("timeout")) {
          console.warn("RPC endpoint issue detected, using conservative fallback gas");
        }
        // Fallback gas limit: ~200k should be enough for mint + storage
        gasLimit = BigInt(200000);
        console.log("Using fallback gas limit:", gasLimit.toString());
      }

      // Retry logic for writeContract if RPC fails
      let hash: `0x${string}`;
      let retries = 2;
      let lastError: any = null;
      
      // Set status to waiting for wallet confirmation
      setMintStatus("waitingWallet");
      setWaitingForWallet(true);
      
      while (retries >= 0) {
        try {
          console.log("Calling writeContract...", {
            address: CONTRACT_ADDRESS,
            chainId: CHAIN_ID,
            gas: gasLimit?.toString(),
            maxFeePerGas: maxFeePerGas?.toString(),
            maxPriorityFeePerGas: maxPriorityFeePerGas?.toString(),
          });
          
          // Call writeContract - this should trigger wallet popup
          hash = await writeContract(wagmiConfig, {
            address: CONTRACT_ADDRESS,
            abi: GAME_NFT_ABI,
            functionName: "mintNFT",
            args: [address, BigInt(score), metadataURI],
            chainId: CHAIN_ID,
            gas: gasLimit, // Use estimated or fallback gas limit
            // Pass EIP-1559 fees if available to avoid wallet-side estimation issues
            ...(maxFeePerGas ? { maxFeePerGas } : {}),
            ...(maxPriorityFeePerGas ? { maxPriorityFeePerGas } : {}),
          });
          
          setWaitingForWallet(false);
          console.log("Transaction submitted, hash:", hash);
          break; // Success, exit retry loop
        } catch (writeError: any) {
          setWaitingForWallet(false);
          lastError = writeError;
          const writeErrMsg = writeError?.message?.toLowerCase() || "";
          
          console.error("writeContract error:", writeError);
          
          // Don't retry for user rejection or non-network errors
          if (
            writeErrMsg.includes("user rejected") ||
            writeErrMsg.includes("user denied") ||
            writeErrMsg.includes("user cancelled") ||
            writeErrMsg.includes("rejected the request") ||
            writeErrMsg.includes("rejected transaction") ||
            writeError?.code === 4001 || // User rejected error code
            writeError?.code === "ACTION_REJECTED"
          ) {
            // User cancelled - clear state
            setMintStatus("idle");
            setIsMinting(false);
            setError(null);
            return; // Exit early, don't show error
          }
          
          // Don't retry for contract revert errors
          if (
            writeErrMsg.includes("score below threshold") ||
            writeErrMsg.includes("execution reverted") ||
            writeErrMsg.includes("revert")
          ) {
            throw writeError; // Re-throw immediately
          }
          
          // Retry for network/RPC errors
          if ((writeErrMsg.includes("fetch") || writeErrMsg.includes("network") || writeErrMsg.includes("timeout") || writeErrMsg.includes("could not detect network")) && retries > 0) {
            console.warn(`RPC error, retrying... (${retries} attempts left)`, writeError);
            retries--;
            setWaitingForWallet(false);
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s before retry
            setWaitingForWallet(true);
            continue;
          }
          
          // No more retries or non-network error
          throw writeError;
        }
      }
      
      if (!hash!) {
        throw lastError || new Error("Failed to submit transaction after retries");
      }

      setTxHash(hash);

      // 5. Wait for transaction
      const receipt = await waitForTransactionReceipt(wagmiConfig, { hash });
      
      setMintStatus("success");
      console.log("NFT minted successfully!", { hash, receipt });
    } catch (err: any) {
      console.error("Minting error:", err);
      
      // Detailed error handling
      let errorMessage: string | null = "Failed to mint NFT. Please try again.";
      
      if (err?.message) {
        const errMsg = err.message.toLowerCase();
        
        if (errMsg.includes("chain") || errMsg.includes("network")) {
          errorMessage = "Wrong network detected. Please switch to Base Sepolia and try again.";
        } else if (errMsg.includes("gas") || errMsg.includes("fee") || errMsg.includes("estimation")) {
          errorMessage = "Gas estimation failed. Please try again or increase gas limit in your wallet.";
        } else if (errMsg.includes("user rejected") || errMsg.includes("user denied") || errMsg.includes("rejected the request")) {
          // User cancelled transaction - this is not an error, just clear the message
          errorMessage = null;
          setMintStatus("idle");
          setIsMinting(false);
          setError(null); // Clear error message
          // Don't show error - user intentionally cancelled
          return;
        } else if (errMsg.includes("insufficient funds") || errMsg.includes("balance")) {
          errorMessage = "Insufficient balance. Please ensure you have enough ETH for gas fees.";
        } else if (errMsg.includes("execution reverted") || errMsg.includes("revert")) {
          if (errMsg.includes("score below threshold") || errMsg.includes("below threshold")) {
            errorMessage = `Score below threshold! Your score (${score}) must be at least ${SCORE_THRESHOLD} to mint NFT.`;
          } else {
            errorMessage = `Transaction failed: ${err.message}. Please check your score meets the threshold (${SCORE_THRESHOLD}).`;
          }
        } else if (errMsg.includes("action rejected") || errMsg.includes("user rejected")) {
          // User cancelled - don't show error
          errorMessage = null;
          setMintStatus("idle");
          setIsMinting(false);
          setError(null);
          return;
        } else {
          errorMessage = err.message || "Unknown error occurred. Please try again.";
        }
      }
      
      // Special handling for wallet popup issues
      if (errorMessage && (errorMessage.toLowerCase().includes("unknown") || errorMessage.toLowerCase().includes("transaction"))) {
        errorMessage = "Transaction failed. Please check your wallet extension is unlocked and try again. If the issue persists, refresh the page.";
      }
      
      // Only set error if message exists (not null for user cancellation)
      if (errorMessage) {
        setError(errorMessage);
        setMintStatus("error");
      } else {
        // User cancelled - reset to idle state
        setMintStatus("idle");
      }
    } finally {
      setIsMinting(false);
    }
  };

  // Public mint function (with auto-switch)
  const handleMint = async () => {
    // Wallet should already be connected (enforced by WalletGate)
    if (!isConnected || !address) {
      setError("Wallet not connected. Please connect your wallet first.");
      return;
    }

    // Auto-switch network if wrong chain
    if (!isCorrectChain) {
      if (switchChain) {
        try {
          setIsSwitching(true);
          setError(null);
          setPendingMintAfterSwitch(true);
          
          // Request network switch
          await switchChain({ chainId: CHAIN_ID });
          
          // The useEffect will handle retry after chain switch completes
          // Don't return here - let the useEffect handle the retry
        } catch (err: any) {
          console.error("Switch network error in handleMint:", err);
          setError(err?.message || "Please switch to Base Sepolia network to mint NFT.");
          setPendingMintAfterSwitch(false);
          setIsSwitching(false);
          return;
        }
        // Don't return - setIsSwitching(false) will be handled by useEffect or error
        return;
      } else {
        setError(`Please switch to Base Sepolia (Chain ID: ${baseSepolia.id})`);
        return;
      }
    }

    // Chain is correct, proceed with mint
    await handleMintInternal();
  };

  // Wallet should be connected (WalletGate enforces this)
  // But show error if somehow not connected
  if (!isConnected || !address) {
    return (
      <div className="text-center text-red-500">
        <p>Wallet not connected. Please refresh the page.</p>
      </div>
    );
  }

  // Check contract configuration
  if (!CONTRACT_ADDRESS || CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
    return (
      <div className="text-center space-y-3">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-semibold mb-2">
            ⚠️ Contract Not Configured
          </p>
          <p className="text-sm text-red-700 mb-3">
            NFT contract address is not set or invalid.
          </p>
          <p className="text-xs text-red-600">
            Please set <code className="bg-red-100 px-1 rounded">NEXT_PUBLIC_NFT_CONTRACT_ADDRESS</code> in <code className="bg-red-100 px-1 rounded">.env.local</code>
          </p>
          <p className="text-xs text-red-600 mt-2">
            If you haven't deployed the contract yet, run: <code className="bg-red-100 px-1 rounded">npm run deploy</code>
          </p>
        </div>
        <a
          href={`https://sepolia.basescan.org/address/${CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000"}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline text-sm"
        >
          Check BaseScan for contract
        </a>
      </div>
    );
  }

  if (!isCorrectChain) {
    return (
      <div className="text-center space-y-3">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 font-semibold mb-2">
            Wrong Network
          </p>
          <p className="text-sm text-yellow-700 mb-3">
            Current: Chain ID {chainId} ({typeof chainId}) <br />
            Required: Base Sepolia (Chain ID {CHAIN_ID} / {baseSepolia.id}) <br />
            <span className="text-xs text-gray-500">
              Debug: {JSON.stringify({ chainId, CHAIN_ID, baseSepoliaId: baseSepolia.id, isEqual: chainId === CHAIN_ID })}
            </span>
          </p>
        </div>
        <button
          onClick={handleSwitchNetwork}
          disabled={isSwitching || isSwitchPending}
          className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSwitching || isSwitchPending ? "Switching Network..." : "Switch to Base Sepolia"}
        </button>
        {error && (
          <p className="text-sm text-red-500 mt-2">{error}</p>
        )}
      </div>
    );
  }

  // Show contract verification status
  if (isCheckingContract) {
    return (
      <div className="text-center space-y-3">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 font-semibold mb-2">
            Verifying Contract...
          </p>
          <p className="text-sm text-blue-700">
            Checking if contract is accessible at {CONTRACT_ADDRESS.slice(0, 10)}...{CONTRACT_ADDRESS.slice(-8)}
          </p>
        </div>
      </div>
    );
  }

  if (contractError) {
    return (
      <div className="text-center space-y-3">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-semibold mb-2">
            ⚠️ Contract Not Accessible
          </p>
          <p className="text-sm text-red-700 mb-3">
            Cannot access contract at {CONTRACT_ADDRESS.slice(0, 10)}...{CONTRACT_ADDRESS.slice(-8)}
          </p>
          <p className="text-xs text-red-600 mb-3">
            Possible causes:
            <br />• Contract not deployed on Base Sepolia
            <br />• Contract address is incorrect
            <br />• RPC endpoint issue
            <br />• Contract code doesn't match ABI
          </p>
          <a
            href={`https://sepolia.basescan.org/address/${CONTRACT_ADDRESS}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline text-sm"
          >
            Verify contract on BaseScan
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {contractCheck !== undefined && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-2">
          <p className="text-green-800 text-sm">
            ✅ Contract verified! Score threshold: {contractCheck.toString()}
          </p>
        </div>
      )}
      <button
        onClick={handleMint}
        disabled={isMinting || score < SCORE_THRESHOLD}
        className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        title={score < SCORE_THRESHOLD ? `Score must be at least ${SCORE_THRESHOLD}. Current: ${score}` : undefined}
      >
        {isMinting ? (
          <span className="flex items-center gap-2">
            {mintStatus === "uploading" && "Uploading metadata..."}
            {mintStatus === "minting" && "Preparing transaction..."}
            {mintStatus === "waitingWallet" && (
              <>
                <span className="animate-pulse">⏳</span>
                Waiting for wallet confirmation...
              </>
            )}
          </span>
        ) : (
          `Mint NFT (Score: ${score})`
        )}
      </button>

      {waitingForWallet && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md text-center">
          <p className="text-yellow-800 font-semibold mb-2">
            ⚠️ Check Your Wallet
          </p>
          <p className="text-sm text-yellow-700 mb-2">
            Please confirm the transaction in your wallet extension.
          </p>
          <p className="text-xs text-yellow-600">
            If the popup doesn't appear, check your browser extension or try refreshing the page.
          </p>
        </div>
      )}

      {mintStatus === "success" && txHash && (
        <div className="text-center text-green-600">
          <p className="font-semibold">✅ NFT Minted Successfully!</p>
          <a
            href={`https://sepolia.basescan.org/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline text-sm"
          >
            View on BaseScan
          </a>
        </div>
      )}

      {error && (
        <div className="text-center text-red-500 text-sm max-w-xs">
          <p>{error}</p>
        </div>
      )}

      {score < SCORE_THRESHOLD && (
        <p className="text-sm text-gray-500">
          Score must be ≥ {SCORE_THRESHOLD} to mint NFT
        </p>
      )}
    </div>
  );
}
