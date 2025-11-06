"use client";

import { useAccount } from "wagmi";
import { getFarcasterContext } from "@/lib/farcaster";
import { useEffect, useState } from "react";

export function UserInfo() {
  const { address } = useAccount();
  const [farcasterContext, setFarcasterContext] = useState<{ username?: string; displayName?: string } | null>(null);

  useEffect(() => {
    const loadContext = async () => {
      const context = await getFarcasterContext();
      if (context) {
        setFarcasterContext(context);
      }
    };
    loadContext();
  }, []);

  const formatAddress = (addr: string | undefined): string => {
    if (!addr || typeof addr !== 'string') return "";
    return `${addr.slice(0, 5)}...${addr.slice(-4)}`;
  };

  const formatUsername = (username?: string | number | null): string | null => {
    if (!username) return null;
    
    // Only process if it's a primitive type
    if (typeof username !== 'string' && typeof username !== 'number') {
      return null;
    }
    
    try {
      // Convert to string safely
      const usernameStr = typeof username === 'string' 
        ? username.trim() 
        : String(username).trim();
      
      if (!usernameStr || usernameStr === 'undefined' || usernameStr === 'null') {
        return null;
      }
      
      // Show full username if <= 20 chars, otherwise truncate
      return usernameStr.length > 20 ? `${usernameStr.slice(0, 17)}...` : usernameStr;
    } catch (error) {
      console.warn("Error formatting username:", error);
      return null;
    }
  };

  if (!address) return null;

  // Safely get username - only if it's a valid primitive
  let formattedUsername: string | null = null;
  
  try {
    const rawUsername = farcasterContext?.username || farcasterContext?.displayName;
    
    // Only process if it's a primitive type (string or number)
    if (rawUsername && (typeof rawUsername === 'string' || typeof rawUsername === 'number')) {
      formattedUsername = formatUsername(rawUsername);
    }
  } catch (error) {
    console.warn("Error processing username:", error);
    formattedUsername = null;
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 shadow-sm">
      {formattedUsername && typeof formattedUsername === 'string' ? (
        <>
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
            {formattedUsername.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm font-medium text-gray-700">{formattedUsername}</span>
        </>
      ) : (
        <>
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <span className="text-sm font-mono text-gray-700">{formatAddress(address)}</span>
        </>
      )}
    </div>
  );
}

