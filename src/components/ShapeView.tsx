import { Shape, normalizeShape, shapeBounds } from "@/game/shapes";

export function ShapeView({ shape, cellSize = 12, className = "", fillColors }: { shape: Shape; cellSize?: number; className?: string; fillColors?: [string, string] }) {
  const norm = normalizeShape(shape);
  const { maxX, maxY } = shapeBounds(norm);
  const w = (maxX + 1) * cellSize + (maxX) * 2;
  const h = (maxY + 1) * cellSize + (maxY) * 2;

  return (
    <div
      className={`inline-block rounded p-1 ${className}`}
      style={{ width: w, height: h, position: "relative" }}
    >
      {norm.map(([x, y], idx) => (
        <div
          key={idx}
          style={{
            position: "absolute",
            left: x * (cellSize + 2),
            top: y * (cellSize + 2),
            width: cellSize,
            height: cellSize,
            backgroundImage: fillColors ? `linear-gradient(145deg, ${fillColors[0]}, ${fillColors[1]})` : undefined,
          }}
          className={fillColors ? "rounded-sm" : "bg-blue-500 rounded-sm"}
        />
      ))}
    </div>
  );
}
