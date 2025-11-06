"use client";

import { useEffect, useState } from "react";
import { Play } from "lucide-react";

export default function PlayPage() {
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      // Placeholder untuk integrasi skor dari iframe ke host
      // Expect format: { type: 'blockblast-score', score: number }
      if (typeof e.data === "object" && e.data && e.data.type === "blockblast-score") {
        // TODO: Bridge ke state skor / trigger mint jika >= 1000
        console.log("Score from iframe:", e.data.score);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return (
    <main className="py-10 min-h-screen flex items-center">
      <div className="container mx-auto px-4 w-full flex flex-col items-center gap-6">
        <h1 className="text-2xl font-semibold">Block Base (Embed)</h1>
        <p className="text-zinc-600 dark:text-zinc-400">Klik Play untuk memuat game original.</p>

        <div className={`w-full ${isIframeLoaded ? "max-h-[85vh]" : "max-h-[42.5vh]"} ${isIframeLoaded ? "aspect-[9/16]" : "aspect-[9/8]"} ${isIframeLoaded ? "max-w-[calc(85vh*9/16)]" : "max-w-[calc(42.5vh*9/8)]"} relative`}>
          {!isIframeLoaded ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                onClick={() => setIsIframeLoaded(true)}
                className="flex items-center gap-2 bg-yellow-400 hover:bg-orange-500 text-slate-800 font-bold px-6 py-3 rounded-full transition"
              >
                <Play className="w-5 h-5" /> Play Now
              </button>
            </div>
          ) : (
            <iframe
              className="w-full h-full"
              src="https://game.iblockblast.com"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
              allowFullScreen
            />
          )}
        </div>
      </div>
    </main>
  );
}
