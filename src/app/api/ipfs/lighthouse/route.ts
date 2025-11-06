export const runtime = "nodejs";

import lighthouse from "@lighthouse-web3/sdk";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.LIGHTHOUSE_API_KEY;
    if (!apiKey) {
      console.error("LIGHTHOUSE_API_KEY not set on server");
      return new Response(
        JSON.stringify({ 
          error: "LIGHTHOUSE_API_KEY not set on server. Please set it in Vercel Environment Variables (without NEXT_PUBLIC_ prefix)." 
        }),
        { 
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    const contentType = req.headers.get("content-type") || "";

    // Only handle metadata JSON upload (simplified)
    if (contentType.includes("application/json")) {
      const body = await req.json();

      // Upload metadata JSON only
      if (body.metadata) {
        const jsonString = JSON.stringify(body.metadata, null, 2);
        console.log("Uploading to Lighthouse...", { 
          metadataSize: jsonString.length,
          hasApiKey: !!apiKey,
          apiKeyPrefix: apiKey.substring(0, 10) + "..."
        });
        
        try {
          // Use Lighthouse SDK uploadText method
          const response = await (lighthouse as any).uploadText(jsonString, apiKey);
          console.log("Lighthouse response:", { 
            hasData: !!response?.data,
            hasHash: !!response?.data?.Hash,
            responseKeys: Object.keys(response || {})
          });
          
          const cid = response?.data?.Hash || response?.data?.cid || response?.Hash || response?.cid;
          if (!cid) {
            console.error("No CID in response:", response);
            return new Response(
              JSON.stringify({ 
                error: "Failed to get CID from Lighthouse",
                details: "Response did not contain a valid CID",
                response: response
              }),
              { 
                status: 502,
                headers: { "Content-Type": "application/json" }
              }
            );
          }
          
          console.log("Upload successful, CID:", cid);
          return Response.json({ cid });
        } catch (lighthouseError: any) {
          console.error("Lighthouse SDK error:", {
            message: lighthouseError?.message,
            stack: lighthouseError?.stack,
            error: lighthouseError
          });
          return new Response(
            JSON.stringify({ 
              error: "Lighthouse upload failed",
              message: lighthouseError?.message || "Unknown error",
              details: lighthouseError?.toString()
            }),
            { 
              status: 500,
              headers: { "Content-Type": "application/json" }
            }
          );
        }
      }

      return new Response(
        JSON.stringify({ error: "Invalid payload: metadata required" }),
        { 
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    return new Response(
      JSON.stringify({ error: "Unsupported content-type" }),
      { 
        status: 415,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (e: any) {
    console.error("Lighthouse upload error:", {
      message: e?.message,
      stack: e?.stack,
      error: e
    });
    return new Response(
      JSON.stringify({ 
        error: "Server error",
        message: e?.message || "Upload failed",
        details: e?.toString()
      }),
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}


