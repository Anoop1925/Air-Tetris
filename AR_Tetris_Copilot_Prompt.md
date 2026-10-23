# 🎮 AR Tetris: Spatial Stack Simulator
## Complete GitHub Copilot Prompt — VS Code Build Guide

---

> **How to use this document:**
> Open VS Code → Open GitHub Copilot Chat (`Ctrl+Shift+I`) → paste each prompt block one at a time, in order. Each block is self-contained and builds on the previous one.

---

## 📁 PROJECT STRUCTURE TO GENERATE FIRST

Ask Copilot:

```
Create the following folder/file structure for a web-based AR Tetris game with MediaPipe hand tracking. No code yet — just create all empty files:

ar-tetris/
├── index.html
├── style.css
├── js/
│   ├── main.js           ← entry point, game loop
│   ├── camera.js         ← webcam + MediaPipe hand setup
│   ├── grid.js           ← the rectangular drop grid logic
│   ├── pieces.js         ← Tetris piece definitions + colors
│   ├── handTracker.js    ← pinch detection, grab, release logic
│   ├── renderer.js       ← canvas drawing (grid, pieces, glow effects)
│   ├── ui.js             ← score panel, high score, next-piece panel
│   ├── intro.js          ← intro/splash screen logic
│   └── audio.js          ← optional: sound effects using Web Audio API
├── assets/
│   └── fonts/            ← will use Google Fonts via CDN
└── README.md
```

---

## 🌐 PROMPT 1 — index.html (Full Shell)

```
Create index.html for "AR Tetris: Spatial Stack Simulator" — a web-based AR game using webcam + MediaPipe Hands.

Requirements:
- Load MediaPipe Hands from CDN: https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js
- Load MediaPipe Camera Utils: https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js
- Load MediaPipe Drawing Utils: https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js
- Load Google Fonts: "Orbitron" (display/title) and "Share Tech Mono" (HUD/score)
- Link style.css
- Load all JS files as ES modules in this order: pieces.js, grid.js, renderer.js, handTracker.js, camera.js, ui.js, audio.js, intro.js, main.js

DOM Layout (all positioned absolutely, layered via z-index):
1. <video id="webcam"> — hidden, used as camera source (z-index: 0)
2. <canvas id="cameraCanvas"> — renders live mirrored camera feed (z-index: 1)
3. <canvas id="gameCanvas"> — renders all game graphics on top (z-index: 2)
4. <div id="introScreen"> — full-screen intro overlay (z-index: 10)
5. <div id="ui-overlay"> — HUD panels (z-index: 3)

The #introScreen div should contain:
- A title: "AR TETRIS" with subtitle "Spatial Stack Simulator"
- A "HIGHEST SCORE" display label + value
- A glowing "▶ START GAME" button
- A short instruction list (3 lines max)

The #ui-overlay div should contain:
- Top-left: small logo text "AR TETRIS"
- Right panel: a <div id="next-pieces-panel"> with label "NEXT" and 3 piece preview slots
- Bottom-right: <div id="score-panel"> with "SCORE" label, score value, "BEST" label, high score value

Make the page background #000. All canvases are full viewport (100vw × 100vh).
Add <meta charset="UTF-8"> and viewport meta tag.
```

---

## 🎨 PROMPT 2 — style.css (Full Futuristic UI Styles)

```
Create style.css for "AR Tetris: Spatial Stack Simulator" — a futuristic dark neon AR game.

Design language: Cyberpunk holographic HUD. Think sci-fi targeting system.
Color palette:
  --neon-cyan:    #00f5ff
  --neon-purple:  #bf00ff
  --neon-green:   #00ff88
  --neon-orange:  #ff6600
  --panel-bg:     rgba(0, 10, 30, 0.75)
  --border-glow:  rgba(0, 245, 255, 0.4)
  --text-primary: #e0f7ff
  --text-dim:     #4a7a8a

Fonts: "Orbitron" for titles/labels, "Share Tech Mono" for numbers/scores.

Style these elements:

1. body, html — full black, overflow:hidden, cursor:none
2. #webcam — hidden (display:none)
3. #cameraCanvas, #gameCanvas — position:absolute, top:0, left:0, 100vw×100vh
4. #introScreen:
   - Full screen overlay, position:absolute z-index:10
   - Background: semi-transparent dark with radial gradient glow center
   - Flex column centered
   - Title "AR TETRIS": font-size 5rem, Orbitron, neon cyan color, text-shadow glow (0 0 20px, 0 0 60px), letter-spacing 0.3em
   - Subtitle: 1rem, neon purple, letter-spacing 0.5em
   - Highest score block: panel-bg background, cyan border, padding, margin-top 2rem
   - Start button: neon green background glow, dark text, Orbitron font, padding 1rem 3rem, no border-radius (sharp corners), text "▶ START GAME", transition glow on hover, cursor:pointer
   - Instructions list: Share Tech Mono, dim text, small font, margin-top 1.5rem
   - Scanline overlay effect using ::after pseudo-element (repeating linear-gradient horizontal lines, low opacity)

5. #ui-overlay — position:absolute, full screen, pointer-events:none, z-index:3

6. #next-pieces-panel:
   - Position: fixed right side, vertical center-right area
   - panel-bg background, border: 1px solid border-glow
   - Box-shadow: 0 0 20px rgba(0,245,255,0.2)
   - Label "NEXT": Orbitron, neon cyan, letter-spacing 0.2em, centered
   - Three .piece-slot divs: each 80×80px, border: 1px dashed rgba(0,245,255,0.3), margin 8px auto, flex centered

7. #score-panel:
   - Position: fixed bottom-right
   - panel-bg background, border-left + border-top: 1px solid border-glow
   - "SCORE" label: Orbitron, 0.7rem, letter-spacing 0.3em, neon cyan
   - Score value: Share Tech Mono, 2.5rem, neon green, text-shadow glow
   - "BEST" label: same style as SCORE label but neon purple
   - High score value: Share Tech Mono, 1.5rem, neon purple dim

8. .logo-text (top-left):
   - Position: fixed top-left, padding 1rem
   - Orbitron, 1rem, neon cyan, letter-spacing 0.4em
   - text-shadow glow subtle

9. Add @keyframes:
   - "pulse-glow": alternates box-shadow intensity for panels
   - "scanline-scroll": moves scanline overlay vertically
   - "intro-float": subtle translateY(-8px) up-down for intro title
   - "digit-flash": brief bright flash on score update (will be triggered via class)

10. Custom scrollbar: hidden globally.
11. Add a subtle CSS grid/dot background pattern using background-image radial-gradient on body at very low opacity (#001a2a dots).
```

---

## 🧩 PROMPT 3 — pieces.js (Tetromino Definitions)

```
Create js/pieces.js for AR Tetris.

Define and export all 7 classic Tetris pieces (tetrominoes) as a constant PIECES array.

Each piece object has:
- name: string (e.g. "I", "T", "L", etc.)
- shape: 2D array of 0s and 1s (the piece layout in a 4×4 or smaller grid)
- color: hex color string
- glowColor: rgba string for canvas glow/shadow effect

Color scheme (futuristic neon):
- I piece: #00f5ff (neon cyan)
- O piece: #ffee00 (electric yellow)
- T piece: #bf00ff (neon purple)
- S piece: #00ff88 (neon green)
- Z piece: #ff003c (neon red)
- L piece: #ff6600 (neon orange)
- J piece: #0066ff (neon blue)

Also export:
- function getRandomPiece(): returns a random piece from PIECES with a random startX position
- function rotatePiece(shape): returns the shape array rotated 90° clockwise
- const BLOCK_SIZE = 36 (pixels per grid cell, used everywhere)
- const GRID_COLS = 10
- const GRID_ROWS = 18
```

---

## 🟦 PROMPT 4 — grid.js (Game Grid Logic)

```
Create js/grid.js for AR Tetris.

Import GRID_COLS, GRID_ROWS, BLOCK_SIZE from pieces.js.

Export a class GameGrid with:

Properties:
- this.cols = GRID_COLS
- this.rows = GRID_ROWS
- this.cells = 2D array (rows × cols), each cell is null or a color string
- this.x = canvas center X offset to draw the grid (calculated so grid is horizontally centered, vertically centered with small top margin)
- this.y = top Y offset for drawing

Methods:
- reset(): clears all cells to null
- isValidPosition(shape, gridX, gridY): returns true if the piece fits without collision or out-of-bounds
- placePiece(shape, gridX, gridY, color): writes color into cells permanently
- clearFullRows(): removes full rows, shifts everything down, returns number of rows cleared
- getGridPixelX(): returns canvas pixel X of grid origin
- getGridPixelY(): returns canvas pixel Y of grid origin
- cellToPixel(col, row): converts grid col/row to canvas pixel coords {x, y}
- pixelToCell(px, py): converts canvas pixel coords to nearest grid {col, row}
- isOccupied(col, row): returns true if cell is not null

Also export:
- function calculateScore(linesCleared, level): returns score points
  - 1 line = 100 × level, 2 = 300 × level, 3 = 500 × level, 4 = 800 × level (Tetris)
- const POINTS_TABLE = {1:100, 2:300, 3:500, 4:800}
```

---

## ✋ PROMPT 5 — handTracker.js (MediaPipe Pinch + Grab Logic)

```
Create js/handTracker.js for AR Tetris using MediaPipe Hands.

This module tracks the user's hand to grab, drag, and release Tetris pieces.

Export a class HandTracker with:

Constructor(canvasWidth, canvasHeight):
- Stores canvas dimensions
- this.handX = null, this.handY = null (current index fingertip position in canvas px)
- this.isPinching = false
- this.pinchStarted = false (edge-trigger: true only on the frame pinch begins)
- this.pinchReleased = false (edge-trigger: true only on the frame pinch ends)
- this.confidence = 0 (landmark visibility score 0–1)

Method update(landmarks):
- Called every MediaPipe frame with hand landmark array
- Landmark 8 = index fingertip, Landmark 4 = thumb tip
- Map landmark x/y (0–1 normalized) to canvas pixels (mirror: x = (1 - lm.x) * canvasWidth)
- Calculate pinch distance = Euclidean distance between landmark 4 and landmark 8 in canvas px
- Pinch is active when distance < 40px
- Set pinchStarted = true for ONE frame when transitioning false→true
- Set pinchReleased = true for ONE frame when transitioning true→false
- Update this.handX, this.handY to index fingertip position

Method getCursorPos(): returns {x: this.handX, y: this.handY}

Method drawCursor(ctx):
- Draw a futuristic crosshair at (handX, handY):
  - Four short lines (+) in neon cyan
  - A small circle at center (radius changes: 8px normal, 4px when pinching)
  - When pinching: draw a filled neon green dot + outer ring pulse animation
  - Glow effect: ctx.shadowBlur = 15, ctx.shadowColor = "#00f5ff"
- If no hand detected: draw nothing

Export default HandTracker.
```

---

## 🎥 PROMPT 6 — camera.js (Webcam + MediaPipe Setup)

```
Create js/camera.js for AR Tetris.

This module:
1. Accesses the webcam
2. Feeds frames into MediaPipe Hands
3. Passes results to HandTracker

Import HandTracker from handTracker.js.

Export an async function initCamera(videoElement, cameraCanvas, onHandResults):
- Request webcam access: navigator.mediaDevices.getUserMedia({ video: { width:1280, height:720 }, audio:false })
- Set videoElement.srcObject = stream, wait for loadedmetadata event
- Set cameraCanvas width/height to match video dimensions
- Create a MediaPipe Hands instance:
  hands = new Hands({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}` })
  hands.setOptions({ maxNumHands: 1, modelComplexity: 1, minDetectionConfidence: 0.7, minTrackingConfidence: 0.5 })
  hands.onResults(onHandResults)
- Create a MediaPipe Camera:
  camera = new Camera(videoElement, { onFrame: async () => { await hands.send({image: videoElement}) }, width:1280, height:720 })
  camera.start()

Export a function drawMirroredCamera(cameraCanvas, videoElement):
- Gets 2D context of cameraCanvas
- Draws the video frame mirrored horizontally (ctx.scale(-1,1) trick)
- Should be called every animation frame

Export default { initCamera, drawMirroredCamera }.
```

---

## 🖼️ PROMPT 7 — renderer.js (Canvas Drawing Engine)

```
Create js/renderer.js for AR Tetris.

This is the main canvas drawing module. Import BLOCK_SIZE from pieces.js.

Export a class Renderer with:

Constructor(gameCanvas):
- this.ctx = gameCanvas.getContext("2d")
- this.canvas = gameCanvas

Method clear():
- Clears the entire canvas (ctx.clearRect)

Method drawGrid(gameGrid):
- Draw the grid border: glowing cyan rectangle outline at gameGrid position
  - Border: 2px solid #00f5ff, box-shadow style glow using shadowBlur + shadowColor
- Draw grid cells background: very dark semi-transparent rectangles for each cell
- Draw occupied cells: for each non-null cell in gameGrid.cells:
  - Fill rounded rectangle with cell's color
  - Add glow shadow matching the color
  - Draw subtle inner highlight (lighter top/left edges)
- Draw grid lines: faint rgba(0,245,255,0.08) lines between rows and columns

Method drawPiece(shape, gridX, gridY, color, gameGrid, alpha=1):
- Draw a falling/hovering Tetris piece at grid position
- For each block in shape: use gameGrid.cellToPixel() to get canvas coords
- Draw glowing block with given color and alpha

Method drawGhostPiece(shape, gridX, gridY, color, gameGrid):
- Same as drawPiece but with alpha=0.2 and dashed outline only (no fill)
- Shows where piece will land

Method drawFloatingPiece(shape, canvasX, canvasY, color):
- Draw a piece freely on canvas (not snapped to grid) — used when hand is carrying it
- Centered on canvasX, canvasY
- Full glow effect, slightly larger than grid blocks (scale 1.05)

Method drawNextPiecesPanel(nextPieces, panelElement):
- Draw each of 3 next pieces into their .piece-slot canvas sub-areas
- Create small offscreen canvases per slot, draw centered piece preview, attach to DOM

Method drawParticles(particles):
- Draw each particle: small glowing dot with fading alpha
- Used for line-clear explosion effect

Method drawLineClearEffect(rows, gameGrid):
- Flash white horizontal lines across cleared rows
- Spawn explosion particles at each cleared cell

Method drawBackground():
- Draw a subtle animated hex/dot grid background pattern on gameCanvas
- Very low opacity (0.04), neon cyan dots

Export default Renderer.
```

---

## 🖥️ PROMPT 8 — ui.js (HUD, Score, High Score)

```
Create js/ui.js for AR Tetris.

This module manages all DOM-based UI elements (not canvas).

Export a class UI with:

Constructor():
- Query and store references to: #score-panel, #next-pieces-panel, #introScreen
- this.score = 0
- this.highScore = parseInt(localStorage.getItem('arTetrisHighScore') || '0')
- this.level = 1
- this.linesCleared = 0
- Initialize high score display on intro screen from localStorage

Method updateScore(points):
- Add points to this.score
- Update DOM score display
- Trigger "digit-flash" CSS animation on score element (add/remove class)
- If this.score > this.highScore: update highScore, save to localStorage, update best display

Method addLines(count):
- this.linesCleared += count
- Recalculate level: this.level = Math.floor(this.linesCleared / 10) + 1
- Update any level display if present

Method updateNextPieces(piecesArray):
- Update the 3 piece preview slots in #next-pieces-panel
- Clear slot canvases and redraw piece shapes in their neon colors

Method showIntro():
- Show #introScreen (remove 'hidden' class)
- Display current highScore in intro panel
- Animate the intro with CSS class 'visible'

Method hideIntro():
- Add 'hidden' class to #introScreen
- CSS handles the fade-out transition

Method showGameOver(finalScore):
- Modify introScreen to show "GAME OVER" mode:
  - Title changes to "GAME OVER"
  - Show final score
  - Show new high score if achieved (with celebration CSS animation)
  - Button text: "▶ PLAY AGAIN"
- Show the overlay

Method resetUI():
- Reset score, linesCleared, level to 0/1
- Update all displays

Export default UI.
```

---

## 🔊 PROMPT 9 — audio.js (Web Audio Sound Effects)

```
Create js/audio.js for AR Tetris using the Web Audio API (no external files needed).

Export a class AudioManager with:

Constructor():
- this.ctx = new (window.AudioContext || window.webkitAudioContext)()
- this.enabled = true

Method resume(): calls this.ctx.resume() — must call on first user interaction

Private method _playTone(frequency, duration, type='sine', volume=0.3):
- Creates OscillatorNode + GainNode
- Ramps gain up then down for clean envelope (attack 0.01s, decay 0.1s)
- Plays for 'duration' seconds then stops

Method playPieceGrab():
- Short rising blip: 300Hz → 600Hz sweep, 0.12s, 'sine'

Method playPiecePlace():
- Satisfying thud: 180Hz, 0.15s, 'triangle', with quick pitch drop

Method playLineClear(lines):
- 1 line: single bright tone 880Hz, 0.2s
- 2 lines: two ascending tones 880Hz + 1100Hz
- 3 lines: three tones + chord
- 4 lines (Tetris): triumphant arpeggio 4 rapid ascending notes

Method playGameOver():
- Descending slow tones, 3 steps down, 'sawtooth', grim and low

Method playLevelUp():
- Fast ascending arpeggio, 5 notes, bright

Export default AudioManager.
```

---

## 🌟 PROMPT 10 — intro.js (Intro Screen + Animations)

```
Create js/intro.js for AR Tetris.

This module controls the intro screen experience.

Import UI from ui.js.

Export a class IntroScreen with:

Constructor(ui, onStartGame):
- this.ui = ui
- this.onStartGame = onStartGame callback
- Query #introScreen, the start button, the high score display
- this.animationId = null

Method show():
- Call ui.showIntro()
- Populate highScore display from localStorage
- Start particle/background animation on intro canvas if desired
- Add click + keypress (Space/Enter) listeners to start button
- Attach listener: on start button click → call this.start()

Method start():
- Stop any intro animations
- Call ui.hideIntro()
- Wait 600ms (CSS fade duration) then call this.onStartGame()
- Remove event listeners

Method buildInstructionHTML(): returns innerHTML string:
  "👆 PINCH to grab pieces
   📦 DRAG to position over the grid
   ✋ RELEASE to drop the piece"

Method animateIntroBackground(canvas):
- Draw slowly drifting Tetris block silhouettes in the background
- Random pieces, very low opacity (0.05), drifting downward slowly
- Gentle parallax effect

Export default IntroScreen.
```

---

## 🎮 PROMPT 11 — main.js (Game Loop + State Machine)

```
Create js/main.js — the main entry point and game loop for AR Tetris.

Import all modules:
- { PIECES, BLOCK_SIZE, GRID_COLS, GRID_ROWS, getRandomPiece, rotatePiece } from ./pieces.js
- { GameGrid, calculateScore } from ./grid.js
- Renderer from ./renderer.js
- HandTracker from ./handTracker.js
- { initCamera, drawMirroredCamera } from ./camera.js
- UI from ./ui.js
- AudioManager from ./audio.js
- IntroScreen from ./intro.js

GAME STATES enum:
- INTRO, PLAYING, PAUSED, GAME_OVER

Main setup on DOMContentLoaded:
1. Get canvas elements: cameraCanvas, gameCanvas
2. Set both canvases to window.innerWidth × window.innerHeight
3. Instantiate: grid = new GameGrid(), renderer = new Renderer(gameCanvas), ui = new UI(), audio = new AudioManager(), handTracker = new HandTracker(gameCanvas.width, gameCanvas.height)
4. Create piece queue: nextPieces = [getRandomPiece(), getRandomPiece(), getRandomPiece()]
5. gameState = INTRO

Piece management:
- activePiece = null (the currently falling/grabbed piece)
- activePieceGridX, activePieceGridY (grid position)
- isHeld = false (hand is holding the piece)
- holdCanvasX, holdCanvasY (where hand is holding it)
- dropTimer = 0, dropInterval = 800ms (decreases with level)

Function spawnNextPiece():
- Shift nextPieces queue, push new getRandomPiece()
- Set activePiece, reset gridX to center, gridY = 0
- If spawn position is occupied → GAME OVER

Hand interaction logic (called each frame):
- If handTracker.pinchStarted AND hand is near activePiece canvas position:
  → isHeld = true, play grab sound
- If isHeld:
  → Move piece canvas position to hand cursor
  → Convert cursor canvas position to grid coords
  → If valid grid position: show ghost piece at that grid col
- If handTracker.pinchReleased AND isHeld:
  → isHeld = false
  → Drop piece: find lowest valid row (hard drop)
  → Place piece: grid.placePiece(...)
  → Check cleared lines: grid.clearFullRows()
  → Update score, ui, audio
  → Trigger line clear effect if lines > 0
  → Spawn next piece

Auto-drop logic (when piece not held):
- Every dropInterval ms: move piece down 1 row
- If can't move down: place it (same as release)

Main game loop (requestAnimationFrame):
function gameLoop(timestamp):
  drawMirroredCamera(cameraCanvas, videoElement)
  renderer.clear()
  renderer.drawBackground()
  if state === PLAYING:
    updateHandLogic()
    updateDropTimer(timestamp)
    renderer.drawGrid(grid)
    renderer.drawGhostPiece(...)
    if isHeld: renderer.drawFloatingPiece(activePiece, holdCanvasX, holdCanvasY, activePiece.color)
    else: renderer.drawPiece(activePiece, ...)
    renderer.drawParticles(particles)
  handTracker.drawCursor(ctx)
  requestAnimationFrame(gameLoop)

MediaPipe hand results callback:
function onHandResults(results):
  if results.multiHandLandmarks.length > 0:
    handTracker.update(results.multiHandLandmarks[0])
  else:
    handTracker.update(null) // no hand

Initialization:
async function init():
  await initCamera(videoElement, cameraCanvas, onHandResults)
  intro = new IntroScreen(ui, () => {
    audio.resume()
    gameState = PLAYING
    grid.reset()
    ui.resetUI()
    spawnNextPiece()
    requestAnimationFrame(gameLoop)
  })
  intro.show()

init()
```

---

## ✅ PROMPT 12 — Final Polish & Integration Check

```
Review all files in the ar-tetris project and make these final refinements:

1. **Responsive canvas sizing**: On window resize, update both canvas dimensions and recalculate GameGrid positioning.

2. **Ghost piece placement**: The ghost piece should always show the lowest valid drop position for the active piece's current column position — even while the hand is carrying it.

3. **Piece next-preview rendering**: In ui.js updateNextPieces(), create a small canvas (80×80px) per slot, draw each piece centered, scaled to fit, with full neon glow — attach these to the .piece-slot DOM elements.

4. **Score animation**: When score changes, briefly scale the score element to 1.3× then back to 1× using a CSS keyframe triggered by adding/removing a class.

5. **Line clear particles**: In renderer.js, implement a simple particle system: when a row is cleared, spawn 8–12 particles per cell, each with random velocity, neon color matching the cleared cell, and alpha fading over 0.6 seconds.

6. **Intro background animation**: In intro.js, animate 5–8 ghost Tetris pieces slowly falling down the intro screen canvas using requestAnimationFrame — very low opacity, adds life to the intro.

7. **Game Over flow**: 
   - Trigger a "GAME OVER" animation: the grid content flashes white 3×, then rapidly clears row by row from bottom to top
   - After 1.5 seconds, show the intro screen in GAME OVER mode

8. **Keyboard fallback**: If no hand detected, allow keyboard controls:
   - Arrow Left/Right: move piece
   - Arrow Down: soft drop
   - Arrow Up: rotate
   - Space: hard drop
   Add a small "HAND NOT DETECTED — Using Keyboard" message on screen.

9. **Audio context unlock**: Ensure AudioContext is resumed on the first user gesture (start button click) to comply with browser autoplay policies.

10. **localStorage high score persistence**: Confirm high score is read on page load and shown in both intro screen and #score-panel's "BEST" display throughout gameplay.
```

---

## 🧪 TESTING CHECKLIST (for Copilot to verify)

```
Ask Copilot to verify each item works:

□ Webcam feed appears mirrored in background
□ MediaPipe hand landmarks detected — index fingertip tracked
□ Pinch gesture (thumb + index) triggers grab
□ Piece follows hand cursor while pinching
□ Releasing pinch drops piece to lowest valid grid row
□ Full rows get cleared and score updates
□ 3 next pieces visible in right panel
□ Score and high score display correctly
□ High score saved between page refreshes (localStorage)
□ Intro screen shows on load with stored high score
□ Start button launches game with smooth transition
□ Game Over screen appears with final score
□ Play Again resets everything correctly
□ Neon glow effects visible on grid, pieces, cursor
□ Ghost piece shows drop target correctly
□ Sound effects play on grab, place, line clear, game over
□ Keyboard fallback works if hand not detected
□ Canvas resizes correctly on window resize
```

---

## 🚀 HOW TO RUN

```bash
# Install a local dev server (no build step needed)
npm install -g live-server

# Navigate to your project folder
cd ar-tetris

# Start server
live-server --port=3000

# Open in browser
# http://localhost:3000
# Allow camera access when prompted
```

> ⚠️ **Must run on localhost or HTTPS** — browsers block webcam on plain `file://` URLs.

---

## 📦 OPTIONAL ENHANCEMENTS (bonus Copilot prompts)

```
1. "Add a LEVEL display to the HUD that increases every 10 lines cleared, and speed up the auto-drop interval by 50ms per level, capping at 150ms."

2. "Add a HOLD mechanic: when user makes a 'fist' gesture (all fingers closed), swap current piece with a held piece slot shown in the UI."

3. "Add a combo multiplier: if lines are cleared on consecutive piece placements, multiply score by combo count × 0.5 bonus."

4. "Add CSS custom cursor that looks like a crosshair reticle — shown as fallback when no hand is detected."

5. "Add a settings panel accessible by pressing 'S' — toggle sound on/off, toggle ghost piece on/off."
```

---

*Built with: MediaPipe Hands · Web Audio API · Canvas 2D · Vanilla JS ES Modules*
*Design language: Cyberpunk Holographic HUD · Orbitron + Share Tech Mono*
