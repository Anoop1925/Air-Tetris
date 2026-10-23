class UI {
  constructor() {
    this.scorePanel = document.getElementById("score-panel");
    this.nextPiecesPanel = document.getElementById("next-pieces-panel");
    this.introScreen = document.getElementById("introScreen");

    this.scoreValueEl = document.getElementById("scoreValue");
    this.bestScoreValueEl = document.getElementById("bestScoreValue");
    this.levelValueEl = document.getElementById("levelValue");
    this.linesValueEl = document.getElementById("linesValue");
    this.introHighScoreValueEl = document.getElementById("introHighScoreValue");

    this.introTitleEl = this.introScreen?.querySelector(".intro-title");
    this.introSubtitleEl = this.introScreen?.querySelector(".intro-subtitle");
    this.startButtonEl = document.getElementById("startGameButton");
    this.introFinalScoreEl = document.getElementById("introFinalScore");
    this.introMessageEl = document.getElementById("introMessage");
    this.introInstructionsEl = document.getElementById("introInstructions");
    this.inputModeMessageEl = document.getElementById("input-mode-message");

    this.score = 0;
    this.highScore = Number.parseInt(localStorage.getItem("arTetrisHighScore") || "0", 10);
    this.level = 1;
    this.linesCleared = 0;
    this.achievedNewHighScore = false;

    this.#syncHighScoreDisplays();
    this.#syncScoreDisplays();
  }

  updateScore(points) {
    this.score += points;
    this.#syncScoreDisplays();

    if (this.scoreValueEl) {
      this.scoreValueEl.classList.remove("score-flash");
      this.scoreValueEl.offsetWidth;
      this.scoreValueEl.classList.add("score-flash");
    }

    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.achievedNewHighScore = true;
      localStorage.setItem("arTetrisHighScore", String(this.highScore));
      this.#syncHighScoreDisplays();
    }
  }

  addLines(count) {
    this.linesCleared += count;
    this.level = Math.floor(this.linesCleared / 10) + 1;
    this.#syncScoreDisplays();
  }

  updateNextPieces(piecesArray) {
    const slots = this.nextPiecesPanel?.querySelectorAll(".piece-slot") || [];

    slots.forEach((slot, index) => {
      const piece = piecesArray[index];
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
      const longestSide = Math.max(shape.length, shape[0].length);
      const blockSize = Math.max(10, Math.floor(54 / longestSide));
      const pieceW = shape[0].length * blockSize;
      const pieceH = shape.length * blockSize;
      const offsetX = Math.round((canvas.width - pieceW) / 2);
      const offsetY = Math.round((canvas.height - pieceH) / 2);

      for (let row = 0; row < shape.length; row += 1) {
        for (let col = 0; col < shape[row].length; col += 1) {
          if (!shape[row][col]) {
            continue;
          }

          const x = offsetX + col * blockSize;
          const y = offsetY + row * blockSize;

          ctx.save();
          ctx.shadowColor = piece.color;
          ctx.shadowBlur = 14;
          ctx.fillStyle = piece.color;
          ctx.fillRect(x + 1, y + 1, blockSize - 2, blockSize - 2);
          ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
          ctx.fillRect(x + 2, y + 2, blockSize - 5, Math.max(2, blockSize * 0.26));
          ctx.restore();
        }
      }
    });
  }

  showIntro() {
    if (!this.introScreen) {
      return;
    }

    this.introScreen.classList.remove("hidden");
    this.introScreen.classList.add("visible");
    this.introTitleEl.textContent = "AR TETRIS";
    this.introSubtitleEl.textContent = "Spatial Stack Simulator";
    this.startButtonEl.textContent = "\u25B6 START GAME";
    this.introFinalScoreEl.classList.add("hidden");
    this.introMessageEl.textContent = "PINCH to grab, drag to aim, release to drop.";
    this.introInstructionsEl.innerHTML = [
      "PINCH with thumb + index to grab pieces",
      "DRAG over the grid to choose placement",
      "RELEASE to hard-drop at target row"
    ].map((line) => `<li>${line}</li>`).join("");

    this.#syncHighScoreDisplays();
  }

  hideIntro() {
    if (!this.introScreen) {
      return;
    }

    this.introScreen.classList.add("hidden");
    this.introScreen.classList.remove("visible");
  }

  showGameOver(finalScore) {
    this.showIntro();
    this.introTitleEl.textContent = "GAME OVER";
    this.introSubtitleEl.textContent = "Spatial Stack Simulator";
    this.startButtonEl.textContent = "\u25B6 PLAY AGAIN";

    this.introFinalScoreEl.classList.remove("hidden");
    this.introFinalScoreEl.textContent = `FINAL SCORE ${this.#formatScore(finalScore)}`;

    if (this.achievedNewHighScore) {
      this.introMessageEl.textContent = "NEW HIGH SCORE RECORDED";
      this.introFinalScoreEl.style.color = "#00ff88";
    } else {
      this.introMessageEl.textContent = "Stack smarter and beat your best.";
      this.introFinalScoreEl.style.color = "#ff6600";
    }
  }

  resetUI() {
    this.score = 0;
    this.linesCleared = 0;
    this.level = 1;
    this.achievedNewHighScore = false;
    this.#syncScoreDisplays();
    this.#syncHighScoreDisplays();
  }

  setInputFallbackVisible(visible) {
    if (!this.inputModeMessageEl) {
      return;
    }

    this.inputModeMessageEl.classList.toggle("hidden", !visible);
  }

  #syncHighScoreDisplays() {
    const formatted = this.#formatScore(this.highScore);

    if (this.bestScoreValueEl) {
      this.bestScoreValueEl.textContent = formatted;
    }

    if (this.introHighScoreValueEl) {
      this.introHighScoreValueEl.textContent = formatted;
    }
  }

  #syncScoreDisplays() {
    if (this.scoreValueEl) {
      this.scoreValueEl.textContent = this.#formatScore(this.score);
    }

    if (this.levelValueEl) {
      this.levelValueEl.textContent = String(this.level);
    }

    if (this.linesValueEl) {
      this.linesValueEl.textContent = String(this.linesCleared);
    }
  }

  #formatScore(value) {
    return String(Math.max(0, value)).padStart(6, "0");
  }
}

export { UI };
export default UI;
