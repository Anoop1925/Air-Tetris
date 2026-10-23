# AR VR Capstone Project Documentation
## Project Title
AR Tetris: Spatial Stack Simulator

## 1. Executive Summary
This project is a gesture-based game where Tetris pieces are placed on a digital grid that appears over a live camera view. The player uses hand gestures, especially pinch and release, instead of a mouse or touch controls. The system tracks the hand in real time, highlights a target location on the grid, and places the piece exactly at release.

The project combines computer vision, real-time interaction, game logic, and user interface design. It is suitable for an AR VR capstone because it demonstrates immersive interaction between real-world input (camera and hand movement) and virtual objects (Tetris board and pieces).

## 2. Problem Statement
Traditional games usually depend on keyboard, mouse, or touch. These controls are not natural in all situations and do not represent future spatial interfaces.

The problem solved by this capstone:
- Create an easy, natural hand-based interaction model.
- Build a stable and accurate gesture detection system.
- Connect gesture input to a complete game loop with scoring, feedback, and persistence.

## 3. Project Objectives
1. Build a browser-based AR-style game with no heavy installation.
2. Use webcam hand tracking to grab, move, and place pieces.
3. Achieve reliable pinch detection for accurate placement.
4. Provide responsive visual feedback and smooth UI.
5. Implement meaningful scoring, including placement quality.
6. Save high score across sessions.

## 4. Why This Project Comes Under AR VR
### 4.1 Why it is AR
This is an Augmented Reality style project because:
- A live real-world camera feed is shown.
- Virtual game objects are layered on top of the real scene.
- Real hand movement controls virtual objects in real time.

So the user sees a mixed view: real environment plus digital content.

### 4.2 Why it is relevant in AR VR domain
This project demonstrates core AR VR skills:
- Spatial interaction design
- Human computer interaction with natural gestures
- Real-time tracking and low-latency input handling
- Visual feedback loops for precision tasks

Even without a headset, it belongs to AR VR learning because many headset interactions also use hand tracking, object placement, and contextual overlays.

## 5. Real-World Relevance
This capstone is not only a game concept. The same interaction pattern is useful for:
- AR education tools where students place objects in space
- Therapy and motor-skill training applications
- Industrial training overlays with hand-driven controls
- Touchless interfaces for hygiene-sensitive environments

## 6. Technology Stack
### Frontend and Rendering
- HTML for structure
- CSS for cyber-holographic interface style
- JavaScript ES Modules for architecture
- Canvas 2D for rendering board, pieces, effects

### AR and Vision
- MediaPipe Hands for hand landmarks and tracking
- Webcam video stream for real-world camera input

### Audio and Storage
- Web Audio API for dynamic sound effects
- localStorage for persistent high score

## 7. Project Structure
- index.html: app shell and layered elements
- style.css: full visual theme and HUD styles
- js/main.js: game state machine and loop
- js/camera.js: webcam and MediaPipe pipeline
- js/handTracker.js: pinch detection and hand cursor logic
- js/grid.js: board geometry, collisions, and row clear rules
- js/pieces.js: tetromino definitions and rotation variants
- js/renderer.js: all canvas rendering and effects
- js/ui.js: score, best, level, lines, next pieces, overlays
- js/audio.js: generated interaction sounds
- js/intro.js: intro flow and start logic

## 8. System Architecture Overview
The system follows a modular architecture.

1. Camera module captures frames.
2. MediaPipe finds hand landmarks.
3. Hand tracker converts landmarks into gesture state.
4. Main game loop reads gesture state and updates game state.
5. Grid module validates placement and collisions.
6. Renderer draws camera, board, piece, and effects.
7. UI module updates score panels and overlays.
8. Audio module gives sound feedback for actions.

This separation improves maintainability and makes each part easier to test.

## 9. Core Interaction Flow
1. Player pinches near active piece.
2. Piece enters hold state.
3. Piece follows hand position in grid-snap logic.
4. Target placement preview is highlighted strongly.
5. On pinch release, piece is placed at last stable pinch target.
6. Placement score is awarded.
7. If rows are full, clear rows and add line-clear score.
8. Next piece spawns.

## 10. Gesture Detection Design
Pinch detection is made robust using:
- Separate pinch on and pinch off thresholds (hysteresis)
- Frame smoothing for cursor and pinch distance
- Missing-frame grace period for temporary tracking loss
- Stable frame checks before triggering pinch events
- Last stable pinch anchor used for final drop accuracy

This reduces false release events and improves placement precision.

## 11. Grid and Placement Logic
- The board is managed as a 2D cell matrix.
- Each piece shape is validated against bounds and occupied cells.
- Ghost and placement preview indicate the final landing row.
- Piece locks only at valid final location.
- Row clear operation removes full rows and shifts upper rows down.

## 12. Scoring Model
Scoring now has two layers:

### 12.1 Placement Score
Given whenever a piece is successfully placed.
Factors include:
- Base placement points
- Structural support quality
- Side contact and fit quality
- Row completion contribution
- Perfect placement bonus

### 12.2 Line Clear Score
Traditional Tetris line-clear points are added based on lines cleared and level.

This guarantees visible score growth and rewards precise play.

## 13. UI and Experience Design
The interface is designed as a futuristic AR HUD with:
- Left control panel for Restart, Next pieces, and Score card
- Right play area with enlarged grid and safe margins
- Camera background with virtual overlays
- Clear status label when hand is not detected
- Responsive sizing for different screen dimensions

## 14. Key Features Delivered
- Real-time webcam mirrored view
- Hand pinch, hold, drag, release controls
- Accurate release-based piece placement
- Strong placement preview highlight
- Full rotation variants included in random piece generation
- Placement quality scoring and perfect bonus
- Line clear effects and particles
- Sound effects for interaction events
- High score persistence
- Keyboard fallback when hand is unavailable

## 15. Testing Approach
### Functional testing
- Hand detection present and absent cases
- Pinch start, hold, and release transitions
- Placement accuracy at release
- Collision and bounds handling
- Row clearing and score updates

### Usability testing
- Ease of learning gesture control
- Visual clarity of placement preview
- Feedback response quality (sound and animation)

### Stability testing
- Temporary hand tracking loss behavior
- Resize behavior and layout consistency
- Restart and replay flow

## 16. Challenges and How They Were Solved
1. Unstable pinch causing accidental drops
Solution: hysteresis, smoothing, missing-frame grace, stable release anchor.

2. Score not increasing unless lines cleared
Solution: added placement-quality scoring plus line-clear scoring.

3. Layout mismatches in HUD and board spacing
Solution: introduced explicit left HUD reserve and right play-area alignment logic.

4. Placement drift at release
Solution: final drop based on last stable pinch location.

## 17. Limitations
- Works best in good lighting.
- Webcam quality affects landmark confidence.
- Single-hand interaction only.
- Browser and device performance can influence latency.

## 18. Future Scope
- Adaptive calibration for different hand sizes and camera distances
- Multiplayer or competitive mode
- Advanced gesture set such as hold swap and combo gestures
- Analytics dashboard for training progress
- WebXR or headset version for full immersive AR VR deployment

## 19. Ethical and Privacy Considerations
- Camera access is local and user-permission based.
- No mandatory cloud upload of camera frames.
- High score storage is local only.
- Users should be informed clearly when camera is active.

## 20. Conclusion
AR Tetris: Spatial Stack Simulator is a strong AR VR capstone because it demonstrates practical spatial interaction, real-time vision processing, and meaningful user feedback in one integrated system. It is simple to understand, technically rich, and relevant to modern AR VR interaction design.

## 21. Quick Viva Preparation Points
- Why AR: virtual game objects over real camera feed with gesture control.
- Main technical challenge: reliable pinch-to-place accuracy.
- Main innovation: strong placement preview plus stable release anchor.
- Scoring improvement: placement-based points plus line-clear points.
- Relevance: touchless interfaces, education, training, and spatial UI systems.

## 22. Team Use Notes
Use this document as your base capstone explanation file. You can add:
- Team member names and roles
- Timeline and sprint details
- Screenshots and demo link
- Performance metrics from final testing
