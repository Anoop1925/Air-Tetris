# Air Tetris: Spatial Stack Simulator 🕹️✨

An augmented-reality-inspired, browser-based Tetris experience powered by computer vision and hand tracking. Control the falling tetrominoes with real-time pinch and drag gestures using your webcam!

---

## 🌟 Highlights

- **Hand Tracking & Gesture Controls**: Uses [MediaPipe Hands](https://developers.google.com/mediapipe/solutions/vision/hand_landmarker) for pinch detection, lateral dragging, and release drops.
- **Visual Effects & HUD**: Real-time canvas overlay rendering with particle bursts, grid visualizer, and dynamic camera preview.
- **Audio Synthesis**: Procedural sound effects powered by Web Audio API (no external sound assets required).
- **Graceful Fallback**: Smooth keyboard fallback controls whenever camera or hand tracking is unavailable.
- **Persistent High Scores**: Stores top scores directly in your browser's local storage.

---

## 🎮 Controls

### 🖐️ Hand Gestures (Default)
| Action | Gesture |
| :--- | :--- |
| **Grab / Move** | Pinch index finger & thumb together and drag laterally |
| **Hard Drop** | Open / release pinch |
| **Rotate** | Rotate hand orientation / on-screen tap indicator |

### ⌨️ Keyboard Fallback
| Key | Action |
| :--- | :--- |
| `←` / `→` | Move Left / Right |
| `↑` | Rotate Tetromino |
| `↓` | Soft Drop |
| `Space` | Hard Drop |
| `P` | Pause / Resume |

---

## 🚀 Getting Started

### Prerequisites
- Modern browser (Chrome, Edge, Firefox, or Safari) with webcam support.
- Local static file server (e.g. `npx serve`, Python `http.server`, or VS Code Live Server). *Webcam access requires `localhost` or HTTPS.*

### Quick Start

1. **Clone the repository:**
   ```bash
   git clone https://github.com/<your-username>/Air_tetris.git
   cd Air_tetris
   ```

2. **Run using any static server:**
   
   Using Node.js:
   ```bash
   npx serve ar-tetris
   ```
   Or using Python:
   ```bash
   python -m http.server 3000 --directory ar-tetris
   ```
   Or using Live Server:
   ```bash
   npx live-server ar-tetris --port=3000
   ```

3. **Open in browser:**
   Navigate to `http://localhost:3000` (or `http://localhost:5000` depending on your server) and grant camera permissions when prompted.

---

## 📁 Project Structure

```text
Air_tetris/
├── .gitignore
├── README.md
├── AR_Tetris_Copilot_Prompt.md
└── ar-tetris/
    ├── index.html                           # App entry point
    ├── style.css                            # UI styling & overlay HUD
    ├── assets/                              # Icons & static media
    ├── js/                                  # Modular ES6 game scripts
    │   ├── main.js                          # Game initialization & loop
    │   ├── handTracking.js                  # MediaPipe hand pipeline
    │   ├── audio.js                         # Web Audio SFX synthesizer
    │   └── ...
    ├── ARVR_Capstone_Project_Documentation.md
    └── README.md
```

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
