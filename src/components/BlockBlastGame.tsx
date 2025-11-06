"use client";

import { useEffect, useMemo, useState } from "react";
import { MintButton } from "@/components/MintButton";
import { BoardView } from "@/components/Board";
import { PieceTray } from "@/components/PieceTray";
import { UserInfo } from "@/components/UserInfo";
import { createBoard, canPlace, placeShape, linesToClear, clearLines, calculateScoreGain, hasAnyMove, canPlaceAnywhere, isBoardEmpty } from "@/game/logic";
import { Shape, randomShape } from "@/game/shapes";
import { SCORE_THRESHOLD, BOARD_SIZE } from "@/config/constants";

const PALETTE: Array<[string, string]> = [
  ["#60a5fa", "#2563eb"],
  ["#f97316", "#ea580c"],
  ["#22c55e", "#16a34a"],
  ["#f43f5e", "#e11d48"],
  ["#a78bfa", "#7c3aed"],
  ["#f59e0b", "#d97706"],
  ["#06b6d4", "#0891b2"],
];

export function BlockBlastGame() {
  const [board, setBoard] = useState(() => createBoard(BOARD_SIZE));
  const [pieces, setPieces] = useState<Shape[]>([]);
  const [pieceColors, setPieceColors] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [hover, setHover] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [clearingCells, setClearingCells] = useState<Array<{ x: number; y: number }>>([]);
  const [showCombo, setShowCombo] = useState(false);
  const [shakeAnchor, setShakeAnchor] = useState<{ x: number; y: number } | null>(null);
  const [placedOverlay, setPlacedOverlay] = useState<Array<{ x: number; y: number }>>([]);
  const [floatScore, setFloatScore] = useState<{ value: number; key: number } | null>(null);

  const refillPieces = () => {
    setPieces([randomShape(), randomShape(), randomShape()]);
    setPieceColors([
      Math.floor(Math.random() * PALETTE.length) + 1,
      Math.floor(Math.random() * PALETTE.length) + 1,
      Math.floor(Math.random() * PALETTE.length) + 1,
    ]);
  };

  useEffect(() => {
    setBoard(createBoard(BOARD_SIZE));
    setScore(0);
    setCombo(0);
    setGameOver(false);
    setClearingCells([]);
    setShowCombo(false);
    setShakeAnchor(null);
    setPlacedOverlay([]);
    setFloatScore(null);
    refillPieces();
  }, []);

  const selectedShape: Shape | null = selected !== null ? pieces[selected] : null;

  const placeable = useMemo(() => pieces.map((p) => canPlaceAnywhere(board, p)), [board, pieces]);
  const canAnyPlaceVal = useMemo(() => placeable.some(Boolean), [placeable]);

  useEffect(() => {
    if (!canAnyPlaceVal && pieces.length > 0) setGameOver(true);
  }, [canAnyPlaceVal, pieces.length]);

  const onPickPiece = (i: number) => {
    if (gameOver || !placeable[i]) return;
    setSelected((s) => (s === i ? null : i));
  };

  const attemptPlace = (x: number, y: number, shapeIndex: number | null) => {
    const idx = shapeIndex ?? selected;
    if (idx === null) return { ok: false } as const;
    const shape = pieces[idx];
    if (!shape) return { ok: false } as const;
    if (!canPlace(board, shape, x, y)) {
      setShakeAnchor({ x, y });
      setTimeout(() => setShakeAnchor(null), 250);
      return { ok: false } as const;
    }
    return { ok: true as const, idx, shape };
  };

  const tryPlace = (x: number, y: number, shapeIndex: number | null) => {
    if (gameOver) return;
    const res = attemptPlace(x, y, shapeIndex);
    if (!res.ok) return;
    const { idx, shape } = res;

    const colorId = pieceColors[idx] ?? 1;
    const n = board.length;
    const next = board.map((row) => row.slice());
    for (const [sx, sy] of shape) {
      const gx = x + sx;
      const gy = y + sy;
      if (gx >= 0 && gy >= 0 && gx < n && gy < n) next[gy][gx] = colorId;
    }

    const { rows, cols } = linesToClear(next);
    const cleared = rows.length + cols.length;
    const placedCells = shape.map(([sx, sy]) => ({ x: x + sx, y: y + sy }));

    setPlacedOverlay(placedCells);
    setTimeout(() => setPlacedOverlay([]), 220);

    if (cleared > 0) {
      const cells: Array<{ x: number; y: number } > = [];
      for (const r of rows) for (let c = 0; c < n; c++) cells.push({ x: c, y: r });
      for (const c of cols) for (let r = 0; r < n; r++) cells.push({ x: c, y: r });
      setClearingCells(cells);

      setTimeout(() => {
        const afterClear = clearLines(next, rows, cols);
        const nextCombo = combo + cleared;
        let gain = calculateScoreGain(shape.length, rows.length, cols.length, nextCombo);
        if (isBoardEmpty(afterClear)) {
          gain += 300;
          setShowCombo(true);
          setTimeout(() => setShowCombo(false), 900);
        }
        setFloatScore({ value: gain, key: Date.now() });
        setTimeout(() => setFloatScore(null), 900);

        setBoard(afterClear);
        setScore((s) => s + gain);
        setCombo(nextCombo);
        setClearingCells([]);

        const newPieces = pieces.slice();
        const newColors = pieceColors.slice();
        newPieces.splice(idx, 1);
        newColors.splice(idx, 1);
        setPieces(newPieces);
        setPieceColors(newColors);
        setSelected(null);
        setHover(null);
        setIsDragging(false);

        if (newPieces.length === 0) refillPieces();
      }, 180);
    } else {
      const afterClear = next;
      const nextCombo = 0;
      const gain = calculateScoreGain(shape.length, 0, 0, nextCombo);
      setFloatScore({ value: gain, key: Date.now() });
      setTimeout(() => setFloatScore(null), 900);

      setBoard(afterClear);
      setScore((s) => s + gain);
      setCombo(nextCombo);

      const newPieces = pieces.slice();
      const newColors = pieceColors.slice();
      newPieces.splice(idx, 1);
      newColors.splice(idx, 1);
      setPieces(newPieces);
      setPieceColors(newColors);
      setSelected(null);
      setHover(null);
      setIsDragging(false);

      if (newPieces.length === 0) refillPieces();
    }
  };

  const canPlaceAt = (x: number, y: number) => {
    if (!selectedShape) return false;
    return canPlace(board, selectedShape, x, y);
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 flex flex-col items-center gap-6">
      {/* Header cheerful & mobile-friendly */}
      <div className="w-full text-center px-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-sky-400 via-white to-sky-600 bg-clip-text text-transparent">
          BlockBase Mini apps
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-zinc-600">
          Arrange colorful blocks, clear rows & columns, and reach the best score!
        </p>
        <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1.5 text-[12px] text-sky-700 border border-sky-200">
          <span className="font-semibold">Mint Reward</span>
          <span>Score ≥ {SCORE_THRESHOLD}</span>
        </div>
      </div>

      {/* Score & hint row */}
      <div className="w-full flex items-center justify-between px-1">
        <p className="text-[11px] sm:text-xs text-zinc-500">
          {selectedShape ? (isDragging ? "Drag onto the green area, then release." : "Tap a green cell to place.") : "Pick a block below, then place it on the board."}
        </p>
        <div className="flex items-center gap-2">
          <UserInfo />
          <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-1.5 text-sm text-emerald-700 border border-emerald-200">
            <span className="font-semibold">Score</span>
            <span className="font-bold">{score}</span>
          </div>
        </div>
      </div>

      <div className="relative w-full">
        {floatScore && (
          <div key={floatScore.key} className="pointer-events-none absolute inset-0 z-20 flex items-start justify-center pt-3">
            <div className="animate-[rise_0.9s_ease-out_forwards] text-emerald-500 font-bold text-xl drop-shadow-[0_2px_4px_rgba(16,185,129,0.4)]">
              +{floatScore.value}
            </div>
          </div>
        )}
        {showCombo && (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
            <div className="animate-[pop_0.9s_ease-out_forwards] text-3xl font-extrabold text-emerald-500 drop-shadow-[0_2px_6px_rgba(16,185,129,0.45)]">
              COMBO +300
            </div>
          </div>
        )}
        <BoardView
          board={board}
          selectedShape={selectedShape}
          hover={hover}
          setHover={setHover}
          canPlaceAt={canPlaceAt}
          onCellClick={(x, y) => tryPlace(x, y, null)}
          onCellDrop={(x, y, idx) => tryPlace(x, y, idx)}
          isDragging={isDragging}
          shakeAnchor={shakeAnchor}
          placedOverlay={placedOverlay}
        />
      </div>

      <div className="w-full">
        <div className="mb-2 text-sm text-zinc-500 px-1">Pieces</div>
        <PieceTray
          pieces={pieces}
          selected={selected}
          onPick={onPickPiece}
          onDragStart={(i) => {
            if (!placeable[i]) return;
            setSelected(i);
            setIsDragging(true);
          }}
          onDragEnd={() => {
            setIsDragging(false);
            setSelected(null);
          }}
          placeable={placeable}
        />
      </div>

      {gameOver && (
        <div className="w-full p-4 border rounded">
          <h2 className="font-semibold mb-2">Game Over</h2>
          {score >= SCORE_THRESHOLD ? (
            <div className="flex items-center justify-between">
              <p>Eligible to mint NFT</p>
              <MintButton score={score} />
            </div>
          ) : (
            <p>Score is below the threshold</p>
          )}
          <div className="mt-3 flex items-center gap-2">
            <button
              className="px-4 py-2 rounded-lg bg-sky-600 text-white font-semibold shadow-sm hover:bg-sky-700 active:bg-sky-800 transition"
              onClick={() => {
                setBoard(createBoard(BOARD_SIZE));
                setScore(0);
                setCombo(0);
                setGameOver(false);
                setSelected(null);
                setHover(null);
                setIsDragging(false);
                setClearingCells([]);
                setShowCombo(false);
                setShakeAnchor(null);
                setPlacedOverlay([]);
                setFloatScore(null);
                refillPieces();
              }}
            >
              Restart
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes flash { 0% { opacity: 0; } 30% { opacity: 1; } 100% { opacity: 0; } }
        @keyframes pop { 0% { transform: scale(0.7); opacity: 0; } 40% { transform: scale(1.15); opacity: 1; } 100% { transform: scale(1); opacity: 0; } }
        @keyframes rise { 0% { transform: translateY(8px); opacity: 0; } 30% { opacity: 1; } 100% { transform: translateY(-18px); opacity: 0; } }
      `}</style>
    </div>
  );
}
