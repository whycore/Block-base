export const runtime = "nodejs";

import lighthouse from "@lighthouse-web3/sdk";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.LIGHTHOUSE_API_KEY;
    if (!apiKey) {
      return new Response("LIGHTHOUSE_API_KEY not set on server", { status: 400 });
    }

    const contentType = req.headers.get("content-type") || "";

    // Only handle metadata JSON upload (simplified)
    if (contentType.includes("application/json")) {
      const body = await req.json();

      // Upload metadata JSON only
      if (body.metadata) {
        const jsonString = JSON.stringify(body.metadata, null, 2);
        // Use Lighthouse SDK uploadText method
        const response = await (lighthouse as any).uploadText(jsonString, apiKey);
        const cid = response?.data?.Hash || response?.data?.cid || response?.Hash || response?.cid;
        if (!cid) {
          return new Response("Failed to get CID from Lighthouse", { status: 502 });
        }
        return Response.json({ cid });
      }

      return new Response("Invalid payload: metadata required", { status: 400 });
    }

    return new Response("Unsupported content-type", { status: 415 });
  } catch (e: any) {
    console.error("Lighthouse upload error:", e);
    return new Response(e?.message || "Upload failed", { status: 500 });
  }
}


