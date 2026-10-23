import {
  PIECES,
  GRID_COLS,
  GRID_ROWS,
  getRandomPiece,
  rotatePiece
} from "./pieces.js";
import { GameGrid, calculateScore } from "./grid.js";
import Renderer from "./renderer.js";
import HandTracker from "./handTracker.js";
import { initCamera, drawMirroredCamera } from "./camera.js";
import UI from "./ui.js";
import AudioManager from "./audio.js";
import IntroScreen from "./intro.js";

const GAME_STATES = {
  INTRO: "INTRO",
  PLAYING: "PLAYING",
  PAUSED: "PAUSED",
  GAME_OVER: "GAME_OVER"
};

const _importsKeptForArchitecture = { PIECES, GRID_COLS, GRID_ROWS };
void _importsKeptForArchitecture;

const videoElement = document.getElementById("webcam");
const cameraCanvas = document.getElementById("cameraCanvas");
const gameCanvas = document.getElementById("gameCanvas");
const restartButton = document.getElementById("restartButton");

let grid = null;
let renderer = null;
let ui = null;
let audio = null;
let handTracker = null;
let intro = null;

let cameraReady = false;
let gameState = GAME_STATES.INTRO;

let nextPieces = [];
let activePiece = null;
let activePieceGridX = 0;
let activePieceGridY = 0;
let ghostPieceRow = 0;

let isHeld = false;
let holdCanvasX = 0;
let holdCanvasY = 0;
let heldTargetGridX = null;

let particles = [];
let lastFrameTime = 0;
let dropTimer = 0;

let flashAlpha = 0;
let gameOverSequenceRunning = false;

let lastHandSeenAt = 0;

function delay(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function updateCanvasSizes() {
  const w = window.innerWidth;
  const h = window.innerHeight;

  cameraCanvas.width = w;
  cameraCanvas.height = h;
  gameCanvas.width = w;
  gameCanvas.height = h;

  if (grid) {
    grid.recalculatePosition(w, h);
  }

  if (handTracker) {
    handTracker.setSize(w, h);
  }

  const introCanvas = document.getElementById("introCanvas");
  if (introCanvas) {
    introCanvas.width = w;
    introCanvas.height = h;
  }
}

function resetQueue() {
  nextPieces = [getRandomPiece(), getRandomPiece(), getRandomPiece()];
  ui.updateNextPieces(nextPieces);
}

function spawnNextPiece() {
  const piece = nextPieces.shift();
  nextPieces.push(getRandomPiece());
  ui.updateNextPieces(nextPieces);

  activePiece = {
    ...piece,
    shape: piece.shape.map((row) => row.slice())
  };

  const centeredX = Math.floor((grid.cols - activePiece.shape[0].length) / 2);
  activePieceGridX = Number.isFinite(piece.startX) ? piece.startX : centeredX;
  activePieceGridY = 0;
  ghostPieceRow = computeGhostDropRow(activePiece.shape, activePieceGridX, activePieceGridY);

  if (!grid.isValidPosition(activePiece.shape, activePieceGridX, activePieceGridY)) {
    triggerGameOver();
  }
}

function isCursorNearActivePiece(cursorX, cursorY) {
  if (!activePiece || cursorX === null || cursorY === null) {
    return false;
  }

  const center = getActivePieceCenter();
  const threshold = Math.max(42, (grid?.blockSize || 36) * 1.45);
  return Math.hypot(cursorX - center.x, cursorY - center.y) <= threshold;
}

function getActivePieceCenter() {
  const blockSize = grid?.blockSize || 36;
  const pieceWidth = activePiece.shape[0].length * blockSize;
  const pieceHeight = activePiece.shape.length * blockSize;
  const topLeft = grid.cellToPixel(activePieceGridX, activePieceGridY);

  return {
    x: topLeft.x + pieceWidth * 0.5,
    y: topLeft.y + pieceHeight * 0.5
  };
}

function computeGhostDropRow(shape, gridX, gridY) {
  let row = Math.max(0, gridY);

  if (!grid.isValidPosition(shape, gridX, row)) {
    return null;
  }

  while (grid.isValidPosition(shape, gridX, row + 1)) {
    row += 1;
  }

  return row;
}

function listPieceCells(shape, originX, originY) {
  const cells = [];

  for (let row = 0; row < shape.length; row += 1) {
    for (let col = 0; col < shape[row].length; col += 1) {
      if (!shape[row][col]) {
        continue;
      }

      cells.push({
        col: originX + col,
        row: originY + row
      });
    }
  }

  return cells;
}

function evaluatePlacement(shape, originX, originY) {
  const cells = listPieceCells(shape, originX, originY);
  const cellSet = new Set(cells.map((cell) => `${cell.col},${cell.row}`));

  let supportCount = 0;
  let sideContacts = 0;
  let floorContacts = 0;

  for (const cell of cells) {
    const belowRow = cell.row + 1;
    const belowKey = `${cell.col},${belowRow}`;

    if (belowRow >= grid.rows || cellSet.has(belowKey) || grid.isOccupied(cell.col, belowRow)) {
      supportCount += 1;
    }

    if (belowRow >= grid.rows) {
      floorContacts += 1;
    }

    const leftCol = cell.col - 1;
    const rightCol = cell.col + 1;
    const leftKey = `${leftCol},${cell.row}`;
    const rightKey = `${rightCol},${cell.row}`;

    if (leftCol < 0 || (!cellSet.has(leftKey) && grid.isOccupied(leftCol, cell.row))) {
      sideContacts += 1;
    }

    if (rightCol >= grid.cols || (!cellSet.has(rightKey) && grid.isOccupied(rightCol, cell.row))) {
      sideContacts += 1;
    }
  }

  let rowsCompletedByPiece = 0;
  const touchedRows = [...new Set(cells.map((cell) => cell.row))];
  for (const row of touchedRows) {
    let filled = 0;
    for (let col = 0; col < grid.cols; col += 1) {
      const isPlacedCell = cellSet.has(`${col},${row}`);
      if (isPlacedCell || grid.cells[row][col] !== null) {
        filled += 1;
      }
    }

    if (filled === grid.cols) {
      rowsCompletedByPiece += 1;
    }
  }

  const totalCells = cells.length;
  const allSupported = supportCount === totalCells;
  const perfectPlacement = allSupported && (sideContacts >= 2 || floorContacts >= 1 || rowsCompletedByPiece > 0);

  const placementPoints =
    18 +
    supportCount * 4 +
    Math.min(18, sideContacts * 2) +
    rowsCompletedByPiece * 30 +
    (perfectPlacement ? 80 : 0);

  return {
    placementPoints,
    perfectPlacement
  };
}

function lockPieceAtCurrentPosition() {
  if (!activePiece) {
    return;
  }

  const placementEvaluation = evaluatePlacement(activePiece.shape, activePieceGridX, activePieceGridY);
  ui.updateScore(placementEvaluation.placementPoints);

  grid.placePiece(activePiece.shape, activePieceGridX, activePieceGridY, activePiece.color);
  audio.playPiecePlace();

  const fullRowsBeforeClear = [];
  const rowCells = {};
  for (let row = 0; row < grid.rows; row += 1) {
    if (grid.cells[row].every((cell) => cell !== null)) {
      fullRowsBeforeClear.push(row);
      rowCells[row] = grid.cells[row].slice();
    }
  }

  if (fullRowsBeforeClear.length > 0) {
    renderer.drawLineClearEffect(fullRowsBeforeClear, grid, rowCells, particles);
  }

  const previousLevel = ui.level;
  const linesCleared = grid.clearFullRows();

  if (linesCleared > 0) {
    const points = calculateScore(linesCleared, ui.level);
    ui.updateScore(points);
    ui.addLines(linesCleared);
    audio.playLineClear(linesCleared);

    if (ui.level > previousLevel) {
      audio.playLevelUp();
    }
  }

  spawnNextPiece();
}

function tryHardDrop() {
  if (!activePiece) {
    return;
  }

  const dropRow = computeGhostDropRow(activePiece.shape, activePieceGridX, activePieceGridY);
  if (dropRow === null) {
    triggerGameOver();
    return;
  }

  activePieceGridY = dropRow;
  lockPieceAtCurrentPosition();
}

function updateHandLogic() {
  if (gameState !== GAME_STATES.PLAYING || !activePiece) {
    return;
  }

  const cursor = handTracker.getCursorPos();
  const hasHand = cursor.x !== null && cursor.y !== null;

  if (hasHand) {
    lastHandSeenAt = performance.now();
  }

  if (handTracker.pinchStarted && hasHand && isCursorNearActivePiece(cursor.x, cursor.y)) {
    isHeld = true;
    holdCanvasX = cursor.x;
    holdCanvasY = cursor.y;
    heldTargetGridX = activePieceGridX;
    audio.playPieceGrab();
  }

  if (isHeld) {
    const stablePinch = handTracker.getStablePinchPos();
    const sourceX = handTracker.isPinching
      ? cursor.x
      : stablePinch.x;
    const sourceY = handTracker.isPinching
      ? cursor.y
      : stablePinch.y;

    if (sourceX !== null && sourceY !== null) {
      holdCanvasX = sourceX;
      holdCanvasY = sourceY;
    }

    const pieceWidthCells = activePiece.shape[0].length;
    const desiredCol = Math.round((holdCanvasX - grid.getGridPixelX()) / grid.blockSize - pieceWidthCells * 0.5);
    heldTargetGridX = Math.max(0, Math.min(grid.cols - pieceWidthCells, desiredCol));
    activePieceGridX = heldTargetGridX;
    ghostPieceRow = computeGhostDropRow(activePiece.shape, activePieceGridX, 0);

    if (!hasHand && performance.now() - lastHandSeenAt > 1200) {
      isHeld = false;
      heldTargetGridX = null;
    }
  }

  const stablePinch = handTracker.getStablePinchPos();
  const reliableRelease = handTracker.confidence >= 0.12 || stablePinch.x !== null;

  if (handTracker.pinchReleased && isHeld && reliableRelease) {
    if (stablePinch.x !== null) {
      const pieceWidthCells = activePiece.shape[0].length;
      const desiredCol = Math.round((stablePinch.x - grid.getGridPixelX()) / grid.blockSize - pieceWidthCells * 0.5);
      heldTargetGridX = Math.max(0, Math.min(grid.cols - pieceWidthCells, desiredCol));
      activePieceGridX = heldTargetGridX;
    }

    isHeld = false;

    const dropRow = computeGhostDropRow(activePiece.shape, activePieceGridX, 0);
    if (dropRow === null) {
      heldTargetGridX = null;
      return;
    }

    activePieceGridY = dropRow;
    heldTargetGridX = null;
    lockPieceAtCurrentPosition();
  }
}

function updateAutoDrop(deltaMs) {
  if (
    gameState !== GAME_STATES.PLAYING ||
    !activePiece ||
    isHeld ||
    gameOverSequenceRunning
  ) {
    return;
  }

  dropTimer += deltaMs;
  const dropInterval = Math.max(150, 800 - (ui.level - 1) * 50);

  if (dropTimer < dropInterval) {
    return;
  }

  dropTimer = 0;

  if (grid.isValidPosition(activePiece.shape, activePieceGridX, activePieceGridY + 1)) {
    activePieceGridY += 1;
    ghostPieceRow = computeGhostDropRow(activePiece.shape, activePieceGridX, activePieceGridY);
  } else {
    lockPieceAtCurrentPosition();
  }
}

function draw() {
  if (cameraReady) {
    drawMirroredCamera(cameraCanvas, videoElement);
  }

  renderer.clear();
  renderer.drawBackground();
  renderer.drawGrid(grid);

  if (activePiece && gameState !== GAME_STATES.INTRO) {
    if (ghostPieceRow !== null) {
      if (isHeld) {
        renderer.drawPlacementPreview(activePiece.shape, activePieceGridX, ghostPieceRow, activePiece.color, grid);
      } else {
        renderer.drawGhostPiece(activePiece.shape, activePieceGridX, ghostPieceRow, activePiece.color, grid);
      }
    }

    if (isHeld && gameState === GAME_STATES.PLAYING) {
      renderer.drawFloatingPiece(activePiece.shape, holdCanvasX, holdCanvasY, activePiece.color, grid.blockSize);
    } else {
      renderer.drawPiece(activePiece.shape, activePieceGridX, activePieceGridY, activePiece.color, grid);
    }
  }

  renderer.drawParticles(particles);

  if (flashAlpha > 0) {
    const ctx = renderer.ctx;
    ctx.save();
    ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha})`;
    ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
    ctx.restore();
  }

  handTracker.drawCursor(renderer.ctx);

  const keyboardMode = performance.now() - lastHandSeenAt > 700;
  ui.setInputFallbackVisible(gameState === GAME_STATES.PLAYING && keyboardMode);
}

async function runGameOverSequence() {
  if (gameOverSequenceRunning) {
    return;
  }

  gameOverSequenceRunning = true;
  gameState = GAME_STATES.GAME_OVER;
  audio.playGameOver();

  const startedAt = performance.now();

  for (let i = 0; i < 3; i += 1) {
    flashAlpha = 0.55;
    await delay(90);
    flashAlpha = 0;
    await delay(90);
  }

  for (let row = grid.rows - 1; row >= 0; row -= 1) {
    grid.cells[row].fill(null);
    await delay(34);
  }

  const elapsed = performance.now() - startedAt;
  if (elapsed < 1500) {
    await delay(1500 - elapsed);
  }

  flashAlpha = 0;
  ui.showGameOver(ui.score);
  intro.show();

  gameOverSequenceRunning = false;
  gameState = GAME_STATES.INTRO;
}

function triggerGameOver() {
  if (gameState !== GAME_STATES.PLAYING) {
    return;
  }

  runGameOverSequence();
}

function startNewGame() {
  audio.resume();
  gameState = GAME_STATES.PLAYING;
  gameOverSequenceRunning = false;
  flashAlpha = 0;
  particles = [];

  grid.reset();
  ui.resetUI();
  resetQueue();

  isHeld = false;
  heldTargetGridX = null;
  dropTimer = 0;

  spawnNextPiece();
}

function restartGameNow() {
  if (!grid || !ui || gameOverSequenceRunning) {
    return;
  }

  intro?.stopAnimation?.();
  ui.hideIntro();
  startNewGame();
}

function onHandResults(results) {
  const landmarks = results?.multiHandLandmarks?.[0] || null;
  handTracker.update(landmarks);

  if (landmarks) {
    lastHandSeenAt = performance.now();
  }
}

function attachKeyboardFallback() {
  window.addEventListener("keydown", (event) => {
    const keyboardMode = performance.now() - lastHandSeenAt > 700;

    if (
      gameState !== GAME_STATES.PLAYING ||
      !activePiece ||
      isHeld ||
      !keyboardMode
    ) {
      return;
    }

    const code = event.code;
    if (["ArrowLeft", "ArrowRight", "ArrowDown", "ArrowUp", "Space"].includes(code)) {
      event.preventDefault();
    }

    if (code === "ArrowLeft") {
      if (grid.isValidPosition(activePiece.shape, activePieceGridX - 1, activePieceGridY)) {
        activePieceGridX -= 1;
      }
    }

    if (code === "ArrowRight") {
      if (grid.isValidPosition(activePiece.shape, activePieceGridX + 1, activePieceGridY)) {
        activePieceGridX += 1;
      }
    }

    if (code === "ArrowDown") {
      if (grid.isValidPosition(activePiece.shape, activePieceGridX, activePieceGridY + 1)) {
        activePieceGridY += 1;
      } else {
        lockPieceAtCurrentPosition();
      }
    }

    if (code === "ArrowUp") {
      const rotated = rotatePiece(activePiece.shape);
      const tests = [0, -1, 1, -2, 2];
      for (const offset of tests) {
        if (grid.isValidPosition(rotated, activePieceGridX + offset, activePieceGridY)) {
          activePiece.shape = rotated;
          activePieceGridX += offset;
          break;
        }
      }
    }

    if (code === "Space") {
      tryHardDrop();
    }

    ghostPieceRow = computeGhostDropRow(activePiece.shape, activePieceGridX, activePieceGridY);
  });
}

function gameLoop(timestamp) {
  if (!lastFrameTime) {
    lastFrameTime = timestamp;
  }

  const delta = timestamp - lastFrameTime;
  lastFrameTime = timestamp;

  if (gameState === GAME_STATES.PLAYING) {
    updateHandLogic();
    updateAutoDrop(delta);

    if (activePiece && !isHeld) {
      ghostPieceRow = computeGhostDropRow(activePiece.shape, activePieceGridX, activePieceGridY);
    }
  }

  draw();
  requestAnimationFrame(gameLoop);
}

async function init() {
  updateCanvasSizes();

  grid = new GameGrid(window.innerWidth, window.innerHeight);
  renderer = new Renderer(gameCanvas);
  ui = new UI();
  audio = new AudioManager();
  handTracker = new HandTracker(gameCanvas.width, gameCanvas.height);

  resetQueue();
  attachKeyboardFallback();

  restartButton?.addEventListener("click", (event) => {
    event.preventDefault();
    restartGameNow();
  });

  const unlockAudioOnGesture = () => {
    audio.resume();
    window.removeEventListener("pointerdown", unlockAudioOnGesture);
    window.removeEventListener("keydown", unlockAudioOnGesture);
  };

  window.addEventListener("pointerdown", unlockAudioOnGesture);
  window.addEventListener("keydown", unlockAudioOnGesture);

  try {
    await initCamera(videoElement, cameraCanvas, onHandResults);
    cameraReady = true;
    lastHandSeenAt = performance.now();
    updateCanvasSizes();
  } catch (error) {
    cameraReady = false;
    ui.introMessageEl.textContent = "Camera unavailable. Keyboard controls enabled.";
  }

  intro = new IntroScreen(ui, () => {
    startNewGame();
  });

  intro.show();

  window.addEventListener("resize", () => {
    updateCanvasSizes();
    if (gameState === GAME_STATES.PLAYING && activePiece) {
      ghostPieceRow = computeGhostDropRow(activePiece.shape, activePieceGridX, activePieceGridY);
    }
  });

  requestAnimationFrame(gameLoop);
}

window.addEventListener("DOMContentLoaded", init);
