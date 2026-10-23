class HandTracker {
  constructor(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.handX = null;
    this.handY = null;
    this.lastPinchX = null;
    this.lastPinchY = null;
    this.smoothedX = null;
    this.smoothedY = null;
    this.smoothedPinchDistance = null;
    this.isPinching = false;
    this.pinchStarted = false;
    this.pinchReleased = false;
    this.confidence = 0;

    this.missingFrames = 0;
    this.maxMissingFrames = 7;
    this.requiredHoldStartFrames = 2;
    this.requiredReleaseFrames = 1;
    this.pinchHoldFrames = 0;
    this.pinchReleaseFrames = 0;

    this.pinchOnThreshold = 52;
    this.pinchOffThreshold = 74;
    this.#updateThresholds();
  }

  setSize(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.#updateThresholds();
  }

  update(landmarks) {
    this.pinchStarted = false;
    this.pinchReleased = false;

    if (!landmarks || !landmarks[8] || !landmarks[4]) {
      this.confidence = 0;
      this.missingFrames += 1;

      if (this.missingFrames <= this.maxMissingFrames) {
        return;
      }

      this.handX = null;
      this.handY = null;
      this.lastPinchX = null;
      this.lastPinchY = null;
      this.smoothedX = null;
      this.smoothedY = null;
      this.smoothedPinchDistance = null;
      this.pinchHoldFrames = 0;
      this.pinchReleaseFrames = 0;

      if (this.isPinching) {
        this.isPinching = false;
        this.pinchReleased = true;
      }

      return;
    }

    this.missingFrames = 0;

    const indexTip = landmarks[8];
    const thumbTip = landmarks[4];

    const rawHandX = (1 - indexTip.x) * this.canvasWidth;
    const rawHandY = indexTip.y * this.canvasHeight;
    const thumbX = (1 - thumbTip.x) * this.canvasWidth;
    const thumbY = thumbTip.y * this.canvasHeight;

    if (this.smoothedX === null || this.smoothedY === null) {
      this.smoothedX = rawHandX;
      this.smoothedY = rawHandY;
    } else {
      this.smoothedX = this.smoothedX * 0.68 + rawHandX * 0.32;
      this.smoothedY = this.smoothedY * 0.68 + rawHandY * 0.32;
    }

    const dx = thumbX - rawHandX;
    const dy = thumbY - rawHandY;
    const pinchDistance = Math.hypot(dx, dy);

    if (this.smoothedPinchDistance === null) {
      this.smoothedPinchDistance = pinchDistance;
    } else {
      this.smoothedPinchDistance = this.smoothedPinchDistance * 0.7 + pinchDistance * 0.3;
    }

    const currentlyPinching = this.isPinching
      ? this.smoothedPinchDistance < this.pinchOffThreshold
      : this.smoothedPinchDistance < this.pinchOnThreshold;

    if (currentlyPinching) {
      this.pinchHoldFrames += 1;
      this.pinchReleaseFrames = 0;

      this.lastPinchX = this.smoothedX;
      this.lastPinchY = this.smoothedY;

      if (!this.isPinching && this.pinchHoldFrames >= this.requiredHoldStartFrames) {
        this.isPinching = true;
        this.pinchStarted = true;
      }
    } else {
      this.pinchReleaseFrames += 1;
      this.pinchHoldFrames = 0;

      if (this.isPinching && this.pinchReleaseFrames >= this.requiredReleaseFrames) {
        this.isPinching = false;
        this.pinchReleased = true;
      }
    }

    this.handX = this.smoothedX;
    this.handY = this.smoothedY;
    this.confidence = Number(indexTip.visibility ?? 1);
  }

  #updateThresholds() {
    const base = Math.max(46, Math.min(58, Math.round(Math.min(this.canvasWidth, this.canvasHeight) * 0.072)));
    this.pinchOnThreshold = base;
    this.pinchOffThreshold = base + 20;
  }

  getCursorPos() {
    return {
      x: this.handX,
      y: this.handY
    };
  }

  getStablePinchPos() {
    return {
      x: this.lastPinchX,
      y: this.lastPinchY
    };
  }

  drawCursor(ctx) {
    if (this.handX === null || this.handY === null) {
      return;
    }

    const time = performance.now() * 0.01;
    const pulse = this.isPinching ? (Math.sin(time) + 1) * 0.5 : 0.2;
    const cx = this.handX;
    const cy = this.handY;
    const cross = 15;
    const gap = 6;
    const centerRadius = this.isPinching ? 4 : 8;

    ctx.save();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#00f5ff";
    ctx.shadowBlur = 15;
    ctx.shadowColor = "#00f5ff";

    ctx.beginPath();
    ctx.moveTo(cx - cross, cy);
    ctx.lineTo(cx - gap, cy);
    ctx.moveTo(cx + gap, cy);
    ctx.lineTo(cx + cross, cy);
    ctx.moveTo(cx, cy - cross);
    ctx.lineTo(cx, cy - gap);
    ctx.moveTo(cx, cy + gap);
    ctx.lineTo(cx, cy + cross);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, centerRadius, 0, Math.PI * 2);
    ctx.stroke();

    if (this.isPinching) {
      ctx.fillStyle = "rgba(0, 255, 136, 0.95)";
      ctx.shadowColor = "#00ff88";
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = `rgba(0, 255, 136, ${0.4 + pulse * 0.5})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, 10 + pulse * 8, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }
}

export { HandTracker };
export default HandTracker;
