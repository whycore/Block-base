import type { Shape } from "./shapes";

export type Board = number[][]; // 0 empty, 1 filled

export function createBoard(size = 10): Board {
  return Array.from({ length: size }, () => Array.from({ length: size }, () => 0));
}

export function isBoardEmpty(board: Board): boolean {
  for (const row of board) for (const v of row) if (v !== 0) return false;
  return true;
}

export function canPlace(board: Board, shape: Shape, x: number, y: number): boolean {
  const n = board.length;
  for (const [sx, sy] of shape) {
    const gx = x + sx;
    const gy = y + sy;
    if (gx < 0 || gy < 0 || gx >= n || gy >= n) return false;
    if (board[gy][gx] !== 0) return false;
  }
  return true;
}

export function canPlaceAnywhere(board: Board, shape: Shape): boolean {
  const n = board.length;
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      if (canPlace(board, shape, x, y)) return true;
    }
  }
  return false;
}

export function placeShape(board: Board, shape: Shape, x: number, y: number): Board {
  const n = board.length;
  const next = board.map((row) => row.slice());
  for (const [sx, sy] of shape) {
    const gx = x + sx;
    const gy = y + sy;
    if (gx < 0 || gy < 0 || gx >= n || gy >= n) continue;
    next[gy][gx] = 1;
  }
  return next;
}

export function linesToClear(board: Board): { rows: number[]; cols: number[] } {
  const n = board.length;
  const rows: number[] = [];
  const cols: number[] = [];

  for (let r = 0; r < n; r++) {
    if (board[r].every((v) => v === 1)) rows.push(r);
  }
  for (let c = 0; c < n; c++) {
    let full = true;
    for (let r = 0; r < n; r++) if (board[r][c] === 0) { full = false; break; }
    if (full) cols.push(c);
  }
  return { rows, cols };
}

export function clearLines(board: Board, rows: number[], cols: number[]): Board {
  const n = board.length;
  const next = board.map((row) => row.slice());
  for (const r of rows) for (let c = 0; c < n; c++) next[r][c] = 0;
  for (const c of cols) for (let r = 0; r < n; r++) next[r][c] = 0;
  return next;
}

export function calculateScoreGain(
  placedCells: number,
  rowsCleared: number,
  colsCleared: number,
  comboCount: number
): number {
  // Basic: +10 per cleared line, +1 per placed cell, combo bonus escalating
  const base = (rowsCleared + colsCleared) * 10 + placedCells;
  const comboBonus = comboCount > 0 ? comboCount * 10 : 0; // simple scaling
  return base + comboBonus;
}

export function hasAnyMove(board: Board, shapes: Shape[]): boolean {
  for (const s of shapes) if (canPlaceAnywhere(board, s)) return true;
  return false;
}
