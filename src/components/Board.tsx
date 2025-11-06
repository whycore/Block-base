"use client";

import { Board } from "@/game/logic";
import { Shape } from "@/game/shapes";

const CELL_PX = 34;
const GAP_PX = 1;

const PALETTE: Array<[string, string]> = [
  ["#60a5fa", "#2563eb"], // blue
  ["#f97316", "#ea580c"], // orange
  ["#22c55e", "#16a34a"], // green
  ["#f43f5e", "#e11d48"], // rose
  ["#a78bfa", "#7c3aed"], // violet
  ["#f59e0b", "#d97706"], // amber
  ["#06b6d4", "#0891b2"], // cyan
];

function filledCellStyle(colorId: number): React.CSSProperties {
  const idx = Math.max(1, Math.min(colorId, PALETTE.length)) - 1;
  const [c1, c2] = PALETTE[idx];
  return {
    width: CELL_PX,
    height: CELL_PX,
    borderRadius: 7,
    backgroundImage: `linear-gradient(145deg, ${c1}, ${c2})`,
    boxShadow: "inset 0 1px 1px rgba(255,255,255,0.25), 0 1px 2px rgba(0,0,0,0.08)",
    border: "1px solid rgba(0,0,0,0.08)",
  };
}

export function BoardView({
  board,
  selectedShape,
  hover,
  setHover,
  canPlaceAt,
  onCellClick,
  onCellDrop,
  isDragging,
  shakeAnchor,
  placedOverlay,
}: {
  board: Board;
  selectedShape: Shape | null;
  hover: { x: number; y: number } | null;
  setHover: (pos: { x: number; y: number } | null) => void;
  canPlaceAt: (x: number, y: number) => boolean;
  onCellClick: (x: number, y: number) => void;
  onCellDrop?: (x: number, y: number, draggedIndex: number | null) => void;
  isDragging?: boolean;
  shakeAnchor?: { x: number; y: number } | null;
  placedOverlay?: Array<{ x: number; y: number }>;
}) {
  const n = board.length;

  const ghostCells = new Set<string>();
  let ghostPlaceable = false;
  let ghostList: Array<{ x: number; y: number }> = [];
  if (hover && selectedShape) {
    ghostPlaceable = canPlaceAt(hover.x, hover.y);
    for (const [sx, sy] of selectedShape) {
      const gx = hover.x + sx;
      const gy = hover.y + sy;
      if (gx >= 0 && gy >= 0 && gx < n && gy < n) {
        const key = `${gx}:${gy}`;
        ghostCells.add(key);
        ghostList.push({ x: gx, y: gy });
      }
    }
  }

  const bgStyle: React.CSSProperties = {
    backgroundImage:
      "radial-gradient(rgba(30,58,138,0.06) 1px, transparent 1px), linear-gradient(180deg,rgb(217, 221, 235) 0%, #e0e7ff 35%,rgb(231, 229, 245) 100%)",
    backgroundSize: "12px 12px, cover",
    backgroundPosition: "0 0, center",
  };

  return (
    <div className="w-full flex items-center justify-center py-6 px-4 select-none" onDragOver={(e) => e.preventDefault()}>
      <div className="rounded-2xl p-4 shadow-lg border border-indigo-100" style={bgStyle}>
        <div className="relative inline-block">
          <div
            className={`grid ${shakeAnchor ? "animate-[shake_0.25s_linear]" : ""}`}
            style={{
              gridTemplateColumns: `repeat(${n}, ${CELL_PX}px)`,
              gridAutoRows: `${CELL_PX}px`,
              gap: GAP_PX,
            }}
          >
            {board.flatMap((row, y) =>
              row.map((v, x) => {
                const key = `${x}:${y}`;
                const isFilled = v !== 0;
                const cellStyle: React.CSSProperties = isFilled
                  ? filledCellStyle(v)
                  : {
                      width: CELL_PX,
                      height: CELL_PX,
                      borderRadius: 7,
                      backgroundColor: "#f8fafc",
                      border: "1px solid rgba(0,0,0,0.04)",
                    };
                return (
                  <div
                    key={key}
                    role="button"
                    tabIndex={-1}
                    className="transition-colors duration-120"
                    onMouseEnter={() => setHover({ x, y })}
                    onMouseLeave={() => setHover(null)}
                    onDragEnter={(e) => {
                      e.preventDefault();
                      setHover({ x, y });
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setHover({ x, y });
                    }}
                    onClick={() => onCellClick(x, y)}
                    onDrop={(e) => {
                      e.preventDefault();
                      const idxStr = e.dataTransfer.getData("text/plain");
                      const idx = idxStr ? parseInt(idxStr, 10) : null;
                      onCellDrop?.(x, y, Number.isNaN(idx || NaN) ? null : idx);
                    }}
                    style={cellStyle}
                  />
                );
              })
            )}
          </div>

          {ghostList.length > 0 && (
            <div className="pointer-events-none absolute inset-0">
              {ghostList.map(({ x, y }, i) => {
                const fill = ghostPlaceable ? "rgba(16,185,129,0.18)" : "rgba(239,68,68,0.18)";
                const border = ghostPlaceable ? "1px solid rgba(16,185,129,0.8)" : "1px solid rgba(239,68,68,0.8)";
                const shadow = isDragging ? (ghostPlaceable ? "0 0 0 2px rgba(16,185,129,0.55)" : "0 0 0 2px rgba(239,68,68,0.55)") : "none";
                return (
                  <div
                    key={`ghost-${x}-${y}-${i}`}
                    style={{
                      position: "absolute",
                      left: x * (CELL_PX + GAP_PX),
                      top: y * (CELL_PX + GAP_PX),
                      width: CELL_PX,
                      height: CELL_PX,
                      borderRadius: 7,
                      backgroundColor: fill,
                      border,
                      boxShadow: shadow,
                    }}
                  />
                );
              })}
            </div>
          )}

          {placedOverlay && placedOverlay.length > 0 && (
            <div className="pointer-events-none absolute inset-0">
              {placedOverlay.map(({ x, y }, i) => (
                <div
                  key={`placed-${x}-${y}-${i}`}
                  className="animate-[popin_0.22s_ease-out]"
                  style={{
                    position: "absolute",
                    left: x * (CELL_PX + GAP_PX),
                    top: y * (CELL_PX + GAP_PX),
                    width: CELL_PX,
                    height: CELL_PX,
                    borderRadius: 7,
                    backgroundImage: filledCellStyle(1).backgroundImage,
                    boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-2px); }
          75% { transform: translateX(2px); }
        }
        @keyframes popin {
          0% { transform: scale(0.7); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
