'use client';

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { WalletGate } from "@/components/WalletGate";

const Fallback = (
  <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black" />
);

const BlockBlastGame = dynamic(
  () => import("@/components/BlockBlastGame").then((m) => m.BlockBlastGame),
  { ssr: false, loading: () => Fallback }
);

export default function Home() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return Fallback;

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black">
      <WalletGate>
        <BlockBlastGame />
      </WalletGate>
    </div>
  );
}
