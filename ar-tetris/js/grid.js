import { GRID_COLS, GRID_ROWS, BLOCK_SIZE } from "./pieces.js";

export const POINTS_TABLE = {
  1: 100,
  2: 300,
  3: 500,
  4: 800
};

export function calculateScore(linesCleared, level) {
  if (!POINTS_TABLE[linesCleared]) {
    return 0;
  }

  return POINTS_TABLE[linesCleared] * Math.max(1, level);
}

export class GameGrid {
  constructor(canvasWidth = window.innerWidth, canvasHeight = window.innerHeight) {
    this.cols = GRID_COLS;
    this.rows = GRID_ROWS;
    this.baseBlockSize = BLOCK_SIZE;
    this.blockSize = BLOCK_SIZE;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.cells = [];
    this.lastClearedRows = [];
    this.x = 0;
    this.y = 0;
    this.reset();
    this.recalculatePosition(canvasWidth, canvasHeight);
  }

  recalculatePosition(canvasWidth = this.canvasWidth, canvasHeight = this.canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;

    const leftHudReserve = canvasWidth > 1300 ? 320 : canvasWidth > 1024 ? 292 : canvasWidth > 820 ? 235 : 24;
    const edgePadding = 10;
    const gutterFromLeftHud = 12;

    const playAreaStartX = leftHudReserve + gutterFromLeftHud;
    const availableWidth = Math.max(220, canvasWidth - playAreaStartX - edgePadding);
    const availableHeight = Math.max(260, canvasHeight - edgePadding * 2);
    const widthLimitedSize = Math.floor(availableWidth / this.cols);
    const heightLimitedSize = Math.floor(availableHeight / this.rows);

    this.blockSize = Math.max(24, Math.min(this.baseBlockSize, widthLimitedSize, heightLimitedSize));

    const gridWidth = this.cols * this.blockSize;
    const gridHeight = this.rows * this.blockSize;

    this.x = playAreaStartX;
    if (this.x + gridWidth > canvasWidth - edgePadding) {
      this.x = Math.max(playAreaStartX, canvasWidth - gridWidth - edgePadding);
    }

    this.y = Math.max(edgePadding, Math.round((canvasHeight - gridHeight) / 2));
  }

  reset() {
    this.cells = Array.from({ length: this.rows }, () => Array(this.cols).fill(null));
    this.lastClearedRows = [];
  }

  isValidPosition(shape, gridX, gridY) {
    for (let row = 0; row < shape.length; row += 1) {
      for (let col = 0; col < shape[row].length; col += 1) {
        if (!shape[row][col]) {
          continue;
        }

        const targetCol = gridX + col;
        const targetRow = gridY + row;

        if (targetCol < 0 || targetCol >= this.cols || targetRow >= this.rows) {
          return false;
        }

        if (targetRow >= 0 && this.cells[targetRow][targetCol]) {
          return false;
        }
      }
    }

    return true;
  }

  placePiece(shape, gridX, gridY, color) {
    for (let row = 0; row < shape.length; row += 1) {
      for (let col = 0; col < shape[row].length; col += 1) {
        if (!shape[row][col]) {
          continue;
        }

        const targetCol = gridX + col;
        const targetRow = gridY + row;

        if (
          targetCol >= 0 &&
          targetCol < this.cols &&
          targetRow >= 0 &&
          targetRow < this.rows
        ) {
          this.cells[targetRow][targetCol] = color;
        }
      }
    }
  }

  clearFullRows() {
    const clearedRows = [];

    for (let row = this.rows - 1; row >= 0; row -= 1) {
      if (this.cells[row].every((cell) => cell !== null)) {
        clearedRows.push(row);
        this.cells.splice(row, 1);
        this.cells.unshift(Array(this.cols).fill(null));
        row += 1;
      }
    }

    this.lastClearedRows = clearedRows;
    return clearedRows.length;
  }

  getGridPixelX() {
    return this.x;
  }

  getGridPixelY() {
    return this.y;
  }

  cellToPixel(col, row) {
    return {
      x: this.x + col * this.blockSize,
      y: this.y + row * this.blockSize
    };
  }

  pixelToCell(px, py) {
    return {
      col: Math.round((px - this.x) / this.blockSize),
      row: Math.round((py - this.y) / this.blockSize)
    };
  }

  isOccupied(col, row) {
    if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) {
      return true;
    }

    return this.cells[row][col] !== null;
  }
}
