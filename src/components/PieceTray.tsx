"use client";

import { Shape } from "@/game/shapes";
import { ShapeView } from "@/components/ShapeView";

export function PieceTray({ pieces, selected, onPick, onDragStart, onDragEnd, placeable }: { pieces: Shape[]; selected: number | null; onPick: (index: number) => void; onDragStart?: (index: number) => void; onDragEnd?: () => void; placeable?: boolean[] }) {
  return (
    <div className="flex w-full items-center justify-center gap-3">
      {pieces.map((shape, i) => {
        const canPlace = placeable ? !!placeable[i] : true;
        return (
          <button
            key={i}
            onClick={() => canPlace && onPick(i)}
            draggable={canPlace}
            onDragStart={(e) => {
              if (!canPlace) return e.preventDefault();
              e.dataTransfer.setData("text/plain", String(i));
              try {
                e.dataTransfer.effectAllowed = "copyMove";
                e.dataTransfer.dropEffect = "copy";
              } catch {}
              onDragStart?.(i);
            }}
            onDragEnd={() => onDragEnd?.()}
            className={`rounded border p-2 transition transform duration-150 ${canPlace ? "bg-white hover:bg-zinc-50 cursor-grab hover:scale-[1.03] active:scale-[0.98]" : "bg-zinc-100 text-zinc-400 cursor-not-allowed"} ${selected === i ? "border-blue-600" : "border-zinc-200"}`}
            title={canPlace ? `Cells: ${shape.length}` : "No space on board"}
          >
            <ShapeView shape={shape} cellSize={16} className={canPlace ? "" : "opacity-50"} />
          </button>
        );
      })}
    </div>
  );
}
