class AudioManager {
  constructor() {
    const ContextClass = window.AudioContext || window.webkitAudioContext;
    this.ctx = ContextClass ? new ContextClass() : null;
    this.enabled = true;
  }

  resume() {
    if (!this.ctx || this.ctx.state === "running") {
      return Promise.resolve();
    }

    return this.ctx.resume();
  }

  _playTone(frequency, duration, type = "sine", volume = 0.3, endFrequency = null, startAt = 0) {
    if (!this.enabled || !this.ctx) {
      return;
    }

    const now = this.ctx.currentTime + startAt;
    const oscillator = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);

    if (endFrequency !== null) {
      oscillator.frequency.linearRampToValueAtTime(endFrequency, now + duration);
    }

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(volume, now + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + Math.max(0.03, duration + 0.1));

    oscillator.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    oscillator.start(now);
    oscillator.stop(now + duration + 0.12);
  }

  playPieceGrab() {
    this._playTone(300, 0.12, "sine", 0.22, 600);
  }

  playPiecePlace() {
    this._playTone(180, 0.15, "triangle", 0.28, 120);
  }

  playLineClear(lines) {
    if (lines <= 0) {
      return;
    }

    if (lines === 1) {
      this._playTone(880, 0.2, "sine", 0.25);
      return;
    }

    if (lines === 2) {
      this._playTone(880, 0.12, "triangle", 0.22, null, 0);
      this._playTone(1100, 0.15, "triangle", 0.2, null, 0.12);
      return;
    }

    if (lines === 3) {
      this._playTone(740, 0.1, "triangle", 0.2, null, 0);
      this._playTone(980, 0.1, "triangle", 0.2, null, 0.1);
      this._playTone(1240, 0.16, "triangle", 0.2, null, 0.2);
      this._playTone(1480, 0.22, "sine", 0.16, null, 0.2);
      return;
    }

    const notes = [660, 880, 1100, 1320];
    notes.forEach((note, index) => {
      this._playTone(note, 0.11, "square", 0.22, null, index * 0.08);
    });
  }

  playGameOver() {
    this._playTone(240, 0.25, "sawtooth", 0.2, null, 0);
    this._playTone(190, 0.25, "sawtooth", 0.2, null, 0.22);
    this._playTone(150, 0.35, "sawtooth", 0.2, null, 0.46);
  }

  playLevelUp() {
    const notes = [420, 520, 640, 760, 920];
    notes.forEach((note, idx) => {
      this._playTone(note, 0.09, "triangle", 0.21, null, idx * 0.06);
    });
  }
}

export { AudioManager };
export default AudioManager;
