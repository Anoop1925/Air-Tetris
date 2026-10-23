import HandTracker from "./handTracker.js";

let activeStream = null;

export async function initCamera(videoElement, cameraCanvas, onHandResults) {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error("Webcam access is not supported in this browser.");
  }

  if (activeStream) {
    activeStream.getTracks().forEach((track) => track.stop());
    activeStream = null;
  }

  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      width: 1280,
      height: 720,
      facingMode: "user"
    },
    audio: false
  });

  activeStream = stream;
  videoElement.srcObject = stream;

  await new Promise((resolve) => {
    const onLoaded = () => {
      videoElement.removeEventListener("loadedmetadata", onLoaded);
      resolve();
    };

    videoElement.addEventListener("loadedmetadata", onLoaded);
  });

  await videoElement.play();

  cameraCanvas.width = videoElement.videoWidth || 1280;
  cameraCanvas.height = videoElement.videoHeight || 720;

  const HandsClass = window.Hands;
  const CameraClass = window.Camera;

  if (!HandsClass || !CameraClass) {
    throw new Error("MediaPipe scripts failed to load.");
  }

  const hands = new HandsClass({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
  });

  hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.5
  });

  hands.onResults((results) => {
    if (typeof onHandResults === "function") {
      onHandResults(results);
    }
  });

  const camera = new CameraClass(videoElement, {
    onFrame: async () => {
      await hands.send({ image: videoElement });
    },
    width: 1280,
    height: 720
  });

  camera.start();

  if (HandTracker && typeof HandTracker === "function") {
    // The import is intentional to keep module graph explicit for this architecture.
  }

  return {
    stream,
    hands,
    camera,
    videoElement
  };
}

export function drawMirroredCamera(cameraCanvas, videoElement) {
  if (!cameraCanvas || !videoElement || videoElement.readyState < 2) {
    return;
  }

  const ctx = cameraCanvas.getContext("2d");
  if (!ctx) {
    return;
  }

  const { width, height } = cameraCanvas;

  ctx.save();
  ctx.clearRect(0, 0, width, height);
  ctx.translate(width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(videoElement, 0, 0, width, height);
  ctx.restore();

  const vignette = ctx.createRadialGradient(
    width * 0.5,
    height * 0.45,
    Math.min(width, height) * 0.22,
    width * 0.5,
    height * 0.45,
    Math.max(width, height) * 0.72
  );
  vignette.addColorStop(0, "rgba(0, 10, 24, 0)");
  vignette.addColorStop(1, "rgba(0, 3, 10, 0.52)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);
}

export default {
  initCamera,
  drawMirroredCamera
};
