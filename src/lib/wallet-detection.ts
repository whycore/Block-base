/**
 * Wallet detection utilities
 */

export interface DetectedWallet {
  id: string;
  name: string;
  icon: string;
  installed: boolean;
}

/**
 * Safely check if a property exists on an object
 */
function safeCheck(provider: any, property: string): boolean {
  try {
    return !!provider[property];
  } catch (e) {
    // Extension conflicts (e.g., MetaMask private fields, Talisman unconfigured)
    return false;
  }
}

/**
 * Detect installed wallet extensions
 */
export function detectInstalledWallets(): DetectedWallet[] {
  const wallets: DetectedWallet[] = [];
  
  if (typeof window === "undefined") return wallets;

  try {
    // @ts-ignore - window.ethereum type varies
    const ethereum = window.ethereum;

    if (!ethereum) return wallets;

    // Check if ethereum.providers exists (multiple wallets installed)
    let providers: any[] = [];
    try {
      providers = ethereum.providers || [ethereum];
    } catch (e) {
      // Some extensions throw errors when accessing providers
      providers = [ethereum];
    }

    // Check each provider with error handling
    for (const provider of providers) {
      try {
        // Check MetaMask (wrap in try-catch to handle private field errors)
        if (safeCheck(provider, "isMetaMask") && !wallets.some(w => w.id === "metamask")) {
          wallets.push({
            id: "metamask",
            name: "MetaMask",
            icon: "metamask",
            installed: true,
          });
          continue; // Skip other checks for MetaMask
        }
        
        // Check Coinbase Wallet
        if (safeCheck(provider, "isCoinbaseWallet") && !wallets.some(w => w.id === "coinbase")) {
          wallets.push({
            id: "coinbase",
            name: "Coinbase Wallet",
            icon: "coinbase",
            installed: true,
          });
          continue;
        }
        
        // Check other wallets
        let walletName: string | null = null;
        
        if (safeCheck(provider, "isBraveWallet")) {
          walletName = "Brave Wallet";
        } else if (safeCheck(provider, "isTrust")) {
          walletName = "Trust Wallet";
        } else if (safeCheck(provider, "isTokenPocket")) {
          walletName = "TokenPocket";
        } else if (provider.request || provider.send) {
          // Generic injected wallet (has request/send methods)
          walletName = "Injected Wallet";
        }
        
        if (walletName && !wallets.some(w => w.name === walletName)) {
          wallets.push({
            id: walletName.toLowerCase().replace(/\s+/g, "-"),
            name: walletName,
            icon: "injected",
            installed: true,
          });
        }
      } catch (e) {
        // Skip this provider if it causes errors (e.g., Talisman unconfigured)
        console.debug("Skipping wallet provider due to error:", e);
        continue;
      }
    }

    // If no wallets detected but ethereum exists, show generic injected
    if (wallets.length === 0 && ethereum) {
      try {
        // Only add if provider has basic methods
        if (ethereum.request || ethereum.send) {
          wallets.push({
            id: "injected",
            name: "Injected Wallet",
            icon: "injected",
            installed: true,
          });
        }
      } catch (e) {
        // Provider not usable
      }
    }
  } catch (e) {
    // Global error handling - extensions might interfere
    console.debug("Wallet detection error (non-critical):", e);
  }

  return wallets;
}

/**
 * Check if running in Base App / Farcaster environment
 */
export function isBaseAppEnvironment(): boolean {
  if (typeof window === "undefined") return false;
  
  // Check for Farcaster SDK context
  try {
    // @ts-ignore - farcaster might not be in type definitions
    if ((window as any).farcaster || (window.parent as any)?.farcaster) {
      return true;
    }
  } catch (e) {
    // Cross-origin check might fail, that's okay
  }

  // Check for Base App user agent or other indicators
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("farcaster") || ua.includes("base")) {
    return true;
  }

  return false;
}

