import { sdk } from "@farcaster/miniapp-sdk";

export interface FarcasterContext {
  fid: number;
  username?: string;
  displayName?: string;
  accountAddress?: string;
}

let sdkInitialized = false;

/**
 * Initialize Farcaster SDK
 * Call this once when app starts
 */
export async function initializeFarcasterSDK(): Promise<void> {
  if (sdkInitialized) return;
  
  try {
    await sdk.actions.ready();
    sdkInitialized = true;
  } catch (error) {
    console.warn("Farcaster SDK initialization failed (might be running outside Base App):", error);
    // Continue anyway - app can work without Farcaster context
  }
}

/**
 * Get Farcaster context (fid, username, wallet address)
 * Returns null if not in Farcaster/Base App environment
 */
export async function getFarcasterContext(): Promise<FarcasterContext | null> {
  try {
    if (!sdkInitialized) {
      await initializeFarcasterSDK();
    }
    
    const context = sdk.context;
    
    // Access context properties safely and ensure they're primitives
    const rawUsername = (context as any).user?.username;
    const rawDisplayName = (context as any).user?.displayName;
    
    // Convert to string only if it's a valid primitive
    const username = (rawUsername && (typeof rawUsername === 'string' || typeof rawUsername === 'number'))
      ? String(rawUsername).trim() || undefined
      : undefined;
    
    const displayName = (rawDisplayName && (typeof rawDisplayName === 'string' || typeof rawDisplayName === 'number'))
      ? String(rawDisplayName).trim() || undefined
      : undefined;
    
    const accountAddress = (context as any).account?.address;
    
    return {
      fid: (context as any).fid || 0,
      username,
      displayName,
      accountAddress: typeof accountAddress === 'string' ? accountAddress : undefined,
    };
  } catch (error) {
    console.warn("Failed to get Farcaster context:", error);
    return null;
  }
}

