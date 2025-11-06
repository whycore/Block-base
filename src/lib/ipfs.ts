import lighthouse from "@lighthouse-web3/sdk";

export interface NFTAttribute {
  trait_type: string;
  value: string | number;
}

export interface NFTMetadataInput {
  name: string;
  description: string;
  imageUrl: string; // http(s) or data URL
  attributes?: NFTAttribute[];
}

const LIGHTHOUSE_API_KEY = process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY;

/**
 * Generate a simple SVG image for the NFT
 */
function buildSVG(score: number): string {
  return `
    <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#4F46E5;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#7C3AED;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" fill="url(#grad)"/>
        <text x="256" y="200" font-family="Arial, sans-serif" font-size="64" font-weight="bold" fill="white" text-anchor="middle">Block Base</text>
      <text x="256" y="280" font-family="Arial, sans-serif" font-size="48" fill="white" text-anchor="middle">Achievement</text>
      <text x="256" y="360" font-family="Arial, sans-serif" font-size="72" font-weight="bold" fill="white" text-anchor="middle">Score: ${score}</text>
    </svg>
  `.trim();
}

export function generateNFTImage(score: number): string {
  const svg = buildSVG(score);
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}


export async function uploadMetadataToIPFS(meta: NFTMetadataInput): Promise<string> {
  // Use Lighthouse only - simplified version
  if (!LIGHTHOUSE_API_KEY) {
    throw new Error(
      "Lighthouse API key not configured. " +
      "Please set NEXT_PUBLIC_LIGHTHOUSE_API_KEY in .env.local"
    );
  }

  try {
    // Build metadata JSON - skip image upload for simplicity
    const score = (meta.attributes?.find(a => a.trait_type === "Score")?.value as number) || 0;
    const svgDataUrl = generateNFTImage(score);
    
    const metadata = {
      name: meta.name,
      description: meta.description,
      image: svgDataUrl, // Use data URL directly (gambar tidak perlu upload, tidak apa-apa)
      attributes: meta.attributes ?? [],
    };
    
    console.log("Uploading metadata to Lighthouse...", { name: meta.name });

    // Upload metadata via server route
    const metaRes = await fetch("/api/ipfs/lighthouse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ metadata, filename: "metadata.json" }),
    });
    
    if (!metaRes.ok) {
      const errorText = await metaRes.text();
      throw new Error(`Server error: ${errorText}`);
    }
    
    const metaJson = await metaRes.json();
    const metaCid = metaJson?.cid;
    
    if (!metaCid) {
      throw new Error("Failed to get metadata CID from Lighthouse");
    }
    
    console.log("Upload complete! Metadata URI:", `ipfs://${metaCid}`);
    return `ipfs://${metaCid}`;
  } catch (e: any) {
    const errorMsg = e?.message || String(e);
    console.error("Lighthouse upload failed:", errorMsg);
    throw new Error(`Lighthouse upload failed: ${errorMsg}`);
  }
}
