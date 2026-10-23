# AR Tetris: Spatial Stack Simulator

A browser-based AR-inspired Tetris game using:

- MediaPipe Hands for pinch tracking
- Canvas 2D for game and VFX rendering
- Web Audio API for generated SFX
- Vanilla JavaScript ES modules

## Run locally

1. Install a static server:

```bash
npm install -g live-server
```

2. Start the app:

```bash
cd ar-tetris
live-server --port=3000
```

3. Open `http://localhost:3000` and allow camera access.

## Controls

- Hand mode: Pinch to grab, drag to move, release to hard-drop.
- Keyboard fallback (when hand not detected):
  - Left/Right arrows: move
  - Up arrow: rotate
  - Down arrow: soft drop
  - Space: hard drop

## Notes

- Camera requires localhost or HTTPS.
- High score persists via localStorage key `arTetrisHighScore`.
