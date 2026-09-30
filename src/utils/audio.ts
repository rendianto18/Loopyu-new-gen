// Web Audio API synthesizer for zero-dependency sound effects

class SoundManager {
  private ctx: AudioContext | null = null;
  public soundEnabled = true;

  constructor() {
    // Unlock AudioContext on first user interaction in browser
    if (typeof window !== "undefined") {
      const unlock = () => {
        if (this.ctx && this.ctx.state === "suspended") {
          this.ctx.resume().catch(() => {});
        }
      };
      window.addEventListener("click", unlock, { once: true });
      window.addEventListener("touchstart", unlock, { once: true });
      window.addEventListener("keydown", unlock, { once: true });
    }
  }

  private getContext(): AudioContext | null {
    if (!this.soundEnabled || typeof window === "undefined") return null;
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        this.ctx = new AudioCtx();
      }
      if (this.ctx.state === "suspended") {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  public play(type: string) {
    switch (type) {
      case "click":
        this.playClick();
        break;
      case "battery":
      case "collect":
        this.playCollect();
        break;
      case "success":
      case "win":
      case "victory":
        this.playWin();
        break;
      case "step":
        this.playStep();
        break;
      case "turn":
        this.playTurn();
        break;
      case "collision":
      case "error":
      case "lose":
      case "defeat":
      case "fail":
        this.playLose();
        break;
      case "notification":
        this.playNotification();
        break;
      case "add_block":
      case "add":
        this.playAddBlock();
        break;
      case "remove_block":
      case "remove":
      case "delete":
        this.playRemoveBlock();
        break;
      case "modify_block":
      case "modify":
      case "change":
        this.playModifyBlock();
        break;
      default:
        this.playClick();
    }
  }

  /**
   * Playful snap/plug-in sound when a code block is added
   * Crisp, bright double-tone pop (Scratch/Blockly style)
   */
  public playAddBlock() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      // Primary resonant chirp
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(840, now + 0.07);

      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.005, now + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);

      // Subtle click/snap transient on top
      const clickOsc = ctx.createOscillator();
      const clickGain = ctx.createGain();
      clickOsc.type = "triangle";
      clickOsc.frequency.setValueAtTime(1200, now);
      clickOsc.frequency.exponentialRampToValueAtTime(400, now + 0.03);

      clickGain.gain.setValueAtTime(0.09, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

      clickOsc.connect(clickGain);
      clickGain.connect(ctx.destination);
      clickOsc.start(now);
      clickOsc.stop(now + 0.03);
    } catch {}
  }

  /**
   * Satisfying pop-out/unsnap sound when a block is deleted or removed
   * Downward smooth bubble pop
   */
  public playRemoveBlock() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(620, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.08);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.005, now + 0.09);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.09);
    } catch {}
  }

  /**
   * Crisp toggle/tick sound when modifying a block
   * (changing repeat loop count, changing while condition, or reordering blocks)
   */
  public playModifyBlock() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(680, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.045);

      gain.gain.setValueAtTime(0.11, now);
      gain.gain.exponentialRampToValueAtTime(0.005, now + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    } catch {}
  }

  public playClick() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.005, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {}
  }

  public playStep() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(330, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.005, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch {}
  }

  public playTurn() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(350, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(520, ctx.currentTime + 0.06);

      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.005, ctx.currentTime + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch {}
  }

  public playCollect() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.12); // G5

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    } catch {}
  }

  public playBattery() {
    this.playCollect();
  }

  public playFanfare() {
    this.playWin();
  }

  /**
   * Triumphant Victory / Level Complete Audio
   * Ascending cheerful fanfare with celebratory shimmer
   */
  public playWin() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;

      // 4-note victory arpeggio: C5 (523Hz), E5 (659Hz), G5 (784Hz), C6 (1046Hz)
      const arpeggio = [523.25, 659.25, 783.99, 1046.5];
      arpeggio.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const noteStart = now + idx * 0.1;
        const noteDuration = idx === arpeggio.length - 1 ? 0.45 : 0.18;

        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, noteStart);

        gain.gain.setValueAtTime(0, noteStart);
        gain.gain.linearRampToValueAtTime(0.18, noteStart + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, noteStart + noteDuration);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(noteStart);
        osc.stop(noteStart + noteDuration);
      });

      // Shimmering high harmony chime at final chord (E6: 1318Hz, G6: 1567Hz)
      const finalChordStart = now + 0.35;
      [1318.51, 1567.98].forEach((freq) => {
        const chimeOsc = ctx.createOscillator();
        const chimeGain = ctx.createGain();

        chimeOsc.type = "sine";
        chimeOsc.frequency.setValueAtTime(freq, finalChordStart);

        chimeGain.gain.setValueAtTime(0, finalChordStart);
        chimeGain.gain.linearRampToValueAtTime(0.1, finalChordStart + 0.03);
        chimeGain.gain.exponentialRampToValueAtTime(0.0005, finalChordStart + 0.6);

        chimeOsc.connect(chimeGain);
        chimeGain.connect(ctx.destination);
        chimeOsc.start(finalChordStart);
        chimeOsc.stop(finalChordStart + 0.6);
      });
    } catch {}
  }

  /**
   * Defeat / Game Over / Collision Audio
   * Gentle, playful descending comic sequence (wah-wah-wah-boing)
   */
  public playLose() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;

      // Descending minor progression: G4 (392Hz) -> F4 (349Hz) -> Eb4 (311Hz) -> C4 (261Hz)
      const notes = [392.0, 349.23, 311.13, 261.63];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const noteStart = now + idx * 0.12;
        const duration = idx === notes.length - 1 ? 0.35 : 0.14;

        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(freq, noteStart);
        // Slight slide downwards on final note
        if (idx === notes.length - 1) {
          osc.frequency.exponentialRampToValueAtTime(180, noteStart + duration);
        }

        gain.gain.setValueAtTime(0, noteStart);
        gain.gain.linearRampToValueAtTime(0.14, noteStart + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, noteStart + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(noteStart);
        osc.stop(noteStart + duration);
      });
    } catch {}
  }

  public playNotification() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880, now + 0.09); // A5

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    } catch {}
  }

  // Alias for backward compatibility
  public playSuccess() {
    this.playWin();
  }

  public playError() {
    this.playLose();
  }
}

export const soundManager = new SoundManager();
