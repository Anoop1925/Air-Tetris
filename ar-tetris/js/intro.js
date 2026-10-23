class IntroScreen {
  constructor(ui, onStartGame) {
    this.ui = ui;
    this.onStartGame = onStartGame;

    this.introScreen = document.getElementById("introScreen");
    this.startButton = document.getElementById("startGameButton");
    this.highScoreDisplay = document.getElementById("introHighScoreValue");
    this.introCanvas = document.getElementById("introCanvas");

    this.animationId = null;
    this.floatingGhosts = [];
    this.handleStartClick = this.start.bind(this);
    this.handleKeyStart = (event) => {
      if (event.code === "Space" || event.code === "Enter") {
        event.preventDefault();
        this.start();
      }
    };
  }

  show() {
    this.ui.showIntro();

    const stored = Number.parseInt(localStorage.getItem("arTetrisHighScore") || "0", 10);
    if (this.highScoreDisplay) {
      this.highScoreDisplay.textContent = String(stored).padStart(6, "0");
    }

    if (this.ui?.introInstructionsEl) {
      this.ui.introInstructionsEl.innerHTML = this.buildInstructionHTML();
    }

    this.startButton?.addEventListener("click", this.handleStartClick);
    window.addEventListener("keydown", this.handleKeyStart);

    if (this.introCanvas) {
      this.introCanvas.width = window.innerWidth;
      this.introCanvas.height = window.innerHeight;
      this.animateIntroBackground(this.introCanvas);
    }
  }

  start() {
    if (!this.introScreen || this.introScreen.classList.contains("hidden")) {
      return;
    }

    this.stopAnimation();
    this.ui.hideIntro();
    this.startButton?.removeEventListener("click", this.handleStartClick);
    window.removeEventListener("keydown", this.handleKeyStart);

    window.setTimeout(() => {
      if (typeof this.onStartGame === "function") {
        this.onStartGame();
      }
    }, 600);
  }

  buildInstructionHTML() {
    return [
      "<li>PINCH to grab pieces</li>",
      "<li>DRAG to position over the grid</li>",
      "<li>RELEASE to drop the piece</li>"
    ].join("");
  }

  animateIntroBackground(canvas) {
    const ctx = canvas.getContext("2d");
    const shapes = [
      [[1, 1, 1, 1]],
      [[1, 1], [1, 1]],
      [[0, 1, 0], [1, 1, 1]],
      [[1, 1, 0], [0, 1, 1]],
      [[0, 1, 1], [1, 1, 0]],
      [[1, 0, 0], [1, 1, 1]],
      [[0, 0, 1], [1, 1, 1]]
    ];

    const initGhosts = () => {
      this.floatingGhosts = Array.from({ length: 7 }, () => {
        const shape = shapes[Math.floor(Math.random() * shapes.length)];
        return {
          shape,
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          speed: 12 + Math.random() * 24,
          size: 16 + Math.random() * 14,
          alpha: 0.03 + Math.random() * 0.04,
          drift: (Math.random() - 0.5) * 8
        };
      });
    };

    initGhosts();

    const drawGhost = (ghost) => {
      ctx.save();
      ctx.globalAlpha = ghost.alpha;
      ctx.fillStyle = "#00f5ff";

      for (let row = 0; row < ghost.shape.length; row += 1) {
        for (let col = 0; col < ghost.shape[row].length; col += 1) {
          if (!ghost.shape[row][col]) {
            continue;
          }

          const x = ghost.x + col * ghost.size;
          const y = ghost.y + row * ghost.size;
          ctx.fillRect(x, y, ghost.size - 2, ghost.size - 2);
        }
      }

      ctx.restore();
    };

    const step = (now) => {
      if (this.introScreen?.classList.contains("hidden")) {
        this.stopAnimation();
        return;
      }

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      for (const ghost of this.floatingGhosts) {
        ghost.y += ghost.speed * 0.016;
        ghost.x += Math.sin(now * 0.001 + ghost.drift) * 0.2;

        if (ghost.y > h + 120) {
          ghost.y = -120;
          ghost.x = Math.random() * w;
        }

        drawGhost(ghost);
      }

      this.animationId = requestAnimationFrame(step);
    };

    this.animationId = requestAnimationFrame(step);
  }

  stopAnimation() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    if (this.introCanvas) {
      const ctx = this.introCanvas.getContext("2d");
      ctx.clearRect(0, 0, this.introCanvas.width, this.introCanvas.height);
    }
  }
}

export { IntroScreen };
export default IntroScreen;
