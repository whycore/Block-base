import { writeContract, waitForTransactionReceipt } from "wagmi/actions";
import { baseSepolia } from "wagmi/chains";
import { wagmiConfig } from "@/config/wagmi";
import { GAME_NFT_ABI } from "@/contracts/GameNFT.abi";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS as `0x${string}` | undefined;
const CHAIN_ID = baseSepolia.id;

/**
 * @deprecated Use MintButton component instead - it handles wallet connection and minting
 */
export async function mintNFT(
  to: `0x${string}`,
  score: number,
  metadataURI: string
): Promise<{ hash: `0x${string}`; tokenId?: bigint }> {
  if (!CONTRACT_ADDRESS) throw new Error("NEXT_PUBLIC_NFT_CONTRACT_ADDRESS is not set");

  const hash = await writeContract(wagmiConfig, {
    address: CONTRACT_ADDRESS,
    abi: GAME_NFT_ABI,
    functionName: "mintNFT",
    args: [to, BigInt(score), metadataURI],
    chainId: CHAIN_ID,
  });

  const receipt = await waitForTransactionReceipt(wagmiConfig, { hash });
  return { hash, tokenId: receipt.logs?.[0]?.topics?.[3] as any };
}
