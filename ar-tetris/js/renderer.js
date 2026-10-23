import { BLOCK_SIZE } from "./pieces.js";

function drawRoundedRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width * 0.5, height * 0.5);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function withAlpha(hexColor, alpha) {
  if (!hexColor || typeof hexColor !== "string" || !hexColor.startsWith("#")) {
    return `rgba(255, 255, 255, ${alpha})`;
  }

  const clean = hexColor.replace("#", "");
  const chunk = clean.length === 3
    ? clean.split("").map((c) => c + c).join("")
    : clean;
  const num = Number.parseInt(chunk, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

class Renderer {
  constructor(gameCanvas) {
    this.canvas = gameCanvas;
    this.ctx = gameCanvas.getContext("2d");
    this.lastParticleTime = performance.now();
    this.rowFlashEffects = [];
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawBackground() {
    const ctx = this.ctx;
    const { width, height } = this.canvas;
    const t = performance.now() * 0.00025;
    const spacing = 36;

    ctx.save();
    ctx.globalAlpha = 0.04;
    ctx.fillStyle = "#00f5ff";

    for (let y = 0; y < height; y += spacing) {
      for (let x = 0; x < width; x += spacing) {
        const offset = Math.sin(t + (x + y) * 0.015) * 2;
        ctx.beginPath();
        ctx.arc(x + 4, y + 4 + offset, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  drawGrid(gameGrid) {
    const ctx = this.ctx;
    const cellSize = gameGrid.blockSize || BLOCK_SIZE;
    const gridX = gameGrid.getGridPixelX();
    const gridY = gameGrid.getGridPixelY();
    const width = gameGrid.cols * cellSize;
    const height = gameGrid.rows * cellSize;

    ctx.save();

    ctx.strokeStyle = "#00f5ff";
    ctx.shadowColor = "#00f5ff";
    ctx.shadowBlur = 16;
    ctx.lineWidth = 2;
    drawRoundedRect(ctx, gridX - 3, gridY - 3, width + 6, height + 6, 8);
    ctx.stroke();

    for (let row = 0; row < gameGrid.rows; row += 1) {
      for (let col = 0; col < gameGrid.cols; col += 1) {
        const { x, y } = gameGrid.cellToPixel(col, row);
        ctx.fillStyle = "rgba(0, 10, 28, 0.46)";
        drawRoundedRect(ctx, x + 1, y + 1, cellSize - 2, cellSize - 2, Math.max(4, cellSize * 0.14));
        ctx.fill();

        const cellColor = gameGrid.cells[row][col];
        if (!cellColor) {
          continue;
        }

        this.#drawBlock(x, y, cellColor, 1);
      }
    }

    ctx.shadowBlur = 0;
    ctx.strokeStyle = "rgba(0, 245, 255, 0.08)";
    ctx.lineWidth = 1;

    for (let col = 0; col <= gameGrid.cols; col += 1) {
      const x = gridX + col * cellSize;
      ctx.beginPath();
      ctx.moveTo(x, gridY);
      ctx.lineTo(x, gridY + height);
      ctx.stroke();
    }

    for (let row = 0; row <= gameGrid.rows; row += 1) {
      const y = gridY + row * cellSize;
      ctx.beginPath();
      ctx.moveTo(gridX, y);
      ctx.lineTo(gridX + width, y);
      ctx.stroke();
    }

    const now = performance.now();
    this.rowFlashEffects = this.rowFlashEffects.filter((fx) => now < fx.endsAt);
    for (const fx of this.rowFlashEffects) {
      const age = (fx.endsAt - now) / (fx.duration || 140);
      const alpha = Math.max(0, Math.min(1, age));
      const y = gridY + fx.row * cellSize;
      ctx.fillStyle = `rgba(255, 255, 255, ${0.35 * alpha})`;
      ctx.fillRect(gridX, y + 3, width, cellSize - 6);
    }

    ctx.restore();
  }

  drawPiece(shape, gridX, gridY, color, gameGrid, alpha = 1) {
    const cellSize = gameGrid.blockSize || BLOCK_SIZE;
    for (let row = 0; row < shape.length; row += 1) {
      for (let col = 0; col < shape[row].length; col += 1) {
        if (!shape[row][col]) {
          continue;
        }

        const { x, y } = gameGrid.cellToPixel(gridX + col, gridY + row);
        this.#drawBlock(x, y, color, alpha, cellSize);
      }
    }
  }

  drawGhostPiece(shape, gridX, gridY, color, gameGrid) {
    const ctx = this.ctx;
    const cellSize = gameGrid.blockSize || BLOCK_SIZE;

    ctx.save();
    ctx.globalAlpha = 0.2;
    ctx.strokeStyle = withAlpha(color, 0.9);
    ctx.setLineDash([6, 3]);
    ctx.lineWidth = 1.5;

    for (let row = 0; row < shape.length; row += 1) {
      for (let col = 0; col < shape[row].length; col += 1) {
        if (!shape[row][col]) {
          continue;
        }

        const { x, y } = gameGrid.cellToPixel(gridX + col, gridY + row);
        drawRoundedRect(ctx, x + 2, y + 2, cellSize - 4, cellSize - 4, Math.max(4, cellSize * 0.12));
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  drawPlacementPreview(shape, gridX, gridY, color, gameGrid) {
    const ctx = this.ctx;
    const cellSize = gameGrid.blockSize || BLOCK_SIZE;
    const pulse = 0.45 + (Math.sin(performance.now() * 0.01) + 1) * 0.12;

    ctx.save();
    ctx.setLineDash([]);
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = withAlpha(color, 0.98);
    ctx.shadowColor = color;
    ctx.shadowBlur = 20;

    for (let row = 0; row < shape.length; row += 1) {
      for (let col = 0; col < shape[row].length; col += 1) {
        if (!shape[row][col]) {
          continue;
        }

        const { x, y } = gameGrid.cellToPixel(gridX + col, gridY + row);
        drawRoundedRect(ctx, x + 1.6, y + 1.6, cellSize - 3.2, cellSize - 3.2, Math.max(4, cellSize * 0.13));
        ctx.fillStyle = withAlpha(color, 0.22 + pulse * 0.12);
        ctx.fill();
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  drawFloatingPiece(shape, canvasX, canvasY, color, baseBlockSize = BLOCK_SIZE) {
    const scale = 1.05;
    const size = baseBlockSize * scale;
    const pieceWidth = shape[0].length * size;
    const pieceHeight = shape.length * size;
    const startX = canvasX - pieceWidth * 0.5;
    const startY = canvasY - pieceHeight * 0.5;

    for (let row = 0; row < shape.length; row += 1) {
      for (let col = 0; col < shape[row].length; col += 1) {
        if (!shape[row][col]) {
          continue;
        }

        this.#drawBlock(startX + col * size, startY + row * size, color, 1, size);
      }
    }
  }

  drawNextPiecesPanel(nextPieces, panelElement) {
    const slots = panelElement?.querySelectorAll?.(".piece-slot") || [];

    slots.forEach((slot, index) => {
      const piece = nextPieces[index];
      let canvas = slot.querySelector("canvas");

      if (!canvas) {
        canvas = document.createElement("canvas");
        canvas.width = 80;
        canvas.height = 80;
        slot.appendChild(canvas);
      }

      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!piece) {
        return;
      }

      const shape = piece.shape;
      const blockSize = Math.min(18, Math.floor(58 / Math.max(shape.length, shape[0].length)));
      const pieceWidth = shape[0].length * blockSize;
      const pieceHeight = shape.length * blockSize;
      const offsetX = (canvas.width - pieceWidth) / 2;
      const offsetY = (canvas.height - pieceHeight) / 2;

      ctx.shadowBlur = 12;
      ctx.shadowColor = piece.color;
      for (let row = 0; row < shape.length; row += 1) {
        for (let col = 0; col < shape[row].length; col += 1) {
          if (!shape[row][col]) {
            continue;
          }

          this.#drawBlockOnContext(
            ctx,
            offsetX + col * blockSize,
            offsetY + row * blockSize,
            blockSize,
            piece.color,
            1
          );
        }
      }
    });
  }

  drawParticles(particles) {
    if (!Array.isArray(particles) || particles.length === 0) {
      this.lastParticleTime = performance.now();
      return;
    }

    const now = performance.now();
    const dt = Math.min(0.033, Math.max(0.001, (now - this.lastParticleTime) / 1000));
    this.lastParticleTime = now;

    const ctx = this.ctx;

    for (let i = particles.length - 1; i >= 0; i -= 1) {
      const p = particles[i];
      p.life -= dt;

      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 240 * dt;
      p.alpha = p.life / p.maxLife;

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  drawLineClearEffect(rows, gameGrid, rowCells = null, particles = null) {
    if (!rows || rows.length === 0) {
      return [];
    }

    const gridX = gameGrid.getGridPixelX();
    const gridY = gameGrid.getGridPixelY();
    const cellSize = gameGrid.blockSize || BLOCK_SIZE;
    const spawned = [];

    for (const row of rows) {
      this.rowFlashEffects.push({
        row,
        duration: 180,
        endsAt: performance.now() + 180
      });

      for (let col = 0; col < gameGrid.cols; col += 1) {
        const px = gridX + col * cellSize + cellSize * 0.5;
        const py = gridY + row * cellSize + cellSize * 0.5;
        const color = rowCells?.[row]?.[col] || gameGrid.cells[row]?.[col] || "#00f5ff";
        const count = 8 + Math.floor(Math.random() * 5);

        for (let i = 0; i < count; i += 1) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 40 + Math.random() * 220;
          spawned.push({
            x: px,
            y: py,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 20,
            size: 1.5 + Math.random() * 2.6,
            color,
            life: 0.6,
            maxLife: 0.6,
            alpha: 1
          });
        }
      }
    }

    if (Array.isArray(particles)) {
      particles.push(...spawned);
    }

    return spawned;
  }

  #drawBlock(x, y, color, alpha = 1, customSize = BLOCK_SIZE) {
    this.#drawBlockOnContext(this.ctx, x, y, customSize, color, alpha);
  }

  #drawBlockOnContext(ctx, x, y, size, color, alpha = 1) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.shadowColor = color;
    ctx.shadowBlur = 18;

    drawRoundedRect(ctx, x + 2, y + 2, size - 4, size - 4, Math.max(4, size * 0.14));
    ctx.fillStyle = color;
    ctx.fill();

    const gradient = ctx.createLinearGradient(x, y, x + size, y + size);
    gradient.addColorStop(0, "rgba(255, 255, 255, 0.38)");
    gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
    drawRoundedRect(ctx, x + 3, y + 3, size - 6, size - 6, Math.max(3, size * 0.12));
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.restore();
  }
}

export { Renderer };
export default Renderer;
