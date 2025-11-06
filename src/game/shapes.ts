export type Cell = [number, number];
export type Shape = Cell[];

// Shapes didefinisikan relatif (0,0) sebagai anchor kiri-atas
export const SHAPES: Shape[] = [
  // Single
  [[0, 0]],
  // Domino horizontal/vertical
  [[0, 0], [1, 0]],
  [[0, 0], [0, 1]],
  // 2x2 square
  [[0, 0], [1, 0], [0, 1], [1, 1]],
  // L shapes
  [[0, 0], [0, 1], [1, 1]],
  [[0, 0], [1, 0], [1, 1]],
  [[0, 0], [0, 1], [-1, 1]],
  [[0, 0], [1, 0], [1, -1]],
  // Line 3
  [[0, 0], [1, 0], [2, 0]],
  [[0, 0], [0, 1], [0, 2]],
  // Line 4
  [[0, 0], [1, 0], [2, 0], [3, 0]],
  [[0, 0], [0, 1], [0, 2], [0, 3]],
  // T tri
  [[0, 0], [-1, 1], [0, 1], [1, 1]],
  // Zigzag
  [[0, 0], [1, 0], [1, 1], [2, 1]],
  [[0, 0], [0, 1], [-1, 1], [-1, 2]],
];

export function shapeBounds(shape: Shape) {
  const xs = shape.map((c) => c[0]);
  const ys = shape.map((c) => c[1]);
  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
  };
}

export function normalizeShape(shape: Shape): Shape {
  const { minX, minY } = shapeBounds(shape);
  return shape.map(([x, y]) => [x - minX, y - minY]);
}

export function randomShape(rng = Math.random): Shape {
  // Normalize to positive coords for simpler placement
  return normalizeShape(SHAPES[Math.floor(rng() * SHAPES.length)]);
}
