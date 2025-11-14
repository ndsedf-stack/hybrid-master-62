/**
 * TIMER MANAGER - VERSION 3 CERCLES ANIMÉS
 */
export default class TimerManager {
  constructor() {
    this.size = 360;
    this.stroke = 32;
    this.colors = {
      background: '#000000',
      orange: '#FF6D00',
      blue: '#2962FF',
      green: '#00C853',
      red: '#D50000',
      white: '#FFFFFF',
      placeholder: '#1f1f1f',
      textMuted: '#BBBBBB',
    };

    // Session segments (outer ring)
    this.segments = [
      { startDeg: -40, sweepDeg: 55, color: this.colors.green },
      { startDeg: 25, sweepDeg: 85, color: this.colors.blue },
      { startDeg: 120, sweepDeg: 80, color: this.colors.orange },
      { startDeg: 210, sweepDeg: 45, color: this.colors.red },
      { startDeg: 265, sweepDeg: 70, color: this.colors.blue },
    ];

    // State
    this.isRunning = false;
    this.remainingTime = 0;
    this.initialTime = 0;
    this.currentExercise = null;
    this.timerInterval = null;
    this.restProgress = 1;
    this._raf = null;

    // Elements
    this.overlay = null;
    this.root = null;
    this.svg = null;
    this.paths = {
      segments: [],
      rest: null,
    };
    this.labels = {
      exerciseName: null,
      timerText: null,
    };

    console.log('✅ TimerManager 3 Cercles initialisé');
  }

  init() {
    if (this.overlay) return;
    this.createOverlay();
  }

  createOverlay() {
    // Overlay plein écran
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.background = this.colors.background;
    overlay.style.zIndex = '10000';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.opacity = '0';
    overlay.style.visibility = 'hidden';
    overlay.style.transition = 'opacity 0.3s ease, visibility 0.3s ease';
    document.body.appendChild(overlay);
    this.overlay = overlay;

    // Root wrapper
    const root = document.createElement('div');
    root.style.position = 'relative';
    root.style.width = `${this.size}px`;
    root.style.height = `${this.size}px`;
    overlay.appendChild(root);
    this.root = root;

    // Bouton fermer
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    closeBtn.style.position = 'absolute';
    closeBtn.style.top = '-60px';
    closeBtn.style.right = '0';
    closeBtn.style.background = 'rgba(255, 255, 255, 0.1)';
    closeBtn.style.border = '2px solid rgba(255, 255, 255, 0.2)';
    closeBtn.style.color = '#fff';
    closeBtn.style.width = '48px';
    closeBtn.style.height = '48px';
    closeBtn.style.borderRadius = '50%';
    closeBtn.style.fontSize = '32px';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.display = 'flex';
    closeBtn.style.alignItems = 'center';
    closeBtn.style.justifyContent = 'center';
    closeBtn.addEventListener('click', () => this.stop());
    root.appendChild(closeBtn);

    // SVG
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', this.size);
    svg.setAttribute('height', this.size);
    root.appendChild(svg);
    this.svg = svg;

    const cx = this.size / 2;
    const cy = this.size / 2;
    const outerRadius = this.size / 2 - this.stroke * 0.5;
    const innerRadius = this.size / 2 - this.stroke * 2.5;

    // Draw session segments (outer ring)
    this.segments.forEach((s) => {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', this.describeArc(cx, cy, outerRadius, -90 + s.startDeg, -90 + s.startDeg + s.sweepDeg));
      path.setAttribute('stroke', s.color);
      path.setAttribute('stroke-width', this.stroke);
      path.setAttribute('stroke-linecap', 'round');
      path.setAttribute('fill', 'none');
      svg.appendChild(path);
      this.paths.segments.push(path);
    });

    // Rest arc (blue) - inner circle
    const restPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    restPath.setAttribute('stroke', this.colors.blue);
    restPath.setAttribute('stroke-width', this.stroke);
    restPath.setAttribute('stroke-linecap', 'round');
    restPath.setAttribute('fill', 'none');
    svg.appendChild(restPath);
    this.paths.rest = restPath;

    // Center content
    const center = document.createElement('div');
    center.style.position = 'absolute';
    center.style.inset = '0';
    center.style.display = 'flex';
    center.style.flexDirection = 'column';
    center.style.alignItems = 'center';
    center.style.justifyContent = 'center';
    root.appendChild(center);

    // Exercise name (orange)
    const exerciseName = document.createElement('div');
    exerciseName.style.color = this.colors.orange;
    exerciseName.style.fontSize = '24px';
    exerciseName.style.fontWeight = '700';
    exerciseName.style.letterSpacing = '0.5px';
    exerciseName.style.marginBottom = '16px';
    exerciseName.style.textAlign = 'center';
    exerciseName.style.maxWidth = '280px';
    exerciseName.textContent = 'Exercice';
    center.appendChild(exerciseName);
    this.labels.exerciseName = exerciseName;

    // Timer (white)
    const timerText = document.createElement('div');
    timerText.style.color = this.colors.white;
    timerText.style.fontSize = '64px';
    timerText.style.fontWeight = '800';
    timerText.style.letterSpacing = '2px';
    timerText.style.textShadow = '0 0 30px rgba(255, 109, 0, 0.5)';
    timerText.textContent = '0:00';
    center.appendChild(timerText);
    this.labels.timerText = timerText;

    // Phase label
    const phaseLabel = document.createElement('div');
    phaseLabel.style.color = this.colors.textMuted;
    phaseLabel.style.fontSize = '16px';
    phaseLabel.style.fontWeight = '600';
    phaseLabel.style.marginTop = '12px';
    phaseLabel.style.textTransform = 'uppercase';
    phaseLabel.style.letterSpacing = '2px';
    phaseLabel.textContent = 'REPOS';
    center.appendChild(phaseLabel);
  }

  describeArc(cx, cy, r, startDeg, endDeg) {
    const toXY = (deg) => {
      const rad = ((deg - 90) * Math.PI) / 180;
      return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
    };
    const start = toXY(endDeg);
    const end = toXY(startDeg);
    const largeArcFlag = endDeg - startDeg <= 180 ? '0' : '1';
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
  }

  start(duration, exerciseName) {
    console.log('🔥 Timer 3 Cercles démarré:', { duration, exerciseName });

    if (!this.overlay) this.init();

    this.stop();
    this.remainingTime = duration;
    this.initialTime = duration;
    this.currentExercise = exerciseName;
    this.isRunning = true;
    this.restProgress = 1;

    // Update labels
    if (this.labels.exerciseName) {
      this.labels.exerciseName.textContent = exerciseName || 'Exercice';
    }

    // Show overlay
    this.overlay.style.opacity = '1';
    this.overlay.style.visibility = 'visible';

    this.updateDisplay();
    this.timerInterval = setInterval(() => this.tick(), 1000);
    this.startAnimation();
  }

  tick() {
    this.remainingTime--;
    this.updateDisplay();

    if (this.remainingTime <= 0) {
      this.complete();
    }
  }

  updateDisplay() {
    const minutes = Math.floor(this.remainingTime / 60);
    const seconds = this.remainingTime % 60;
    const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    if (this.labels.timerText) {
      this.labels.timerText.textContent = timeStr;
    }

    // Update rest progress
    this.restProgress = this.remainingTime / this.initialTime;
    this.updateRestArc();
  }

  updateRestArc() {
    if (!this.paths.rest) return;

    const cx = this.size / 2;
    const cy = this.size / 2;
    const innerRadius = this.size / 2 - this.stroke * 2.5;
    const endDeg = -90 + 360 * this.restProgress;

    this.paths.rest.setAttribute('d', this.describeArc(cx, cy, innerRadius, -90, endDeg));
  }

  startAnimation() {
    if (this._raf) cancelAnimationFrame(this._raf);
    
    const animate = () => {
      this.updateRestArc();
      if (this.isRunning) {
        this._raf = requestAnimationFrame(animate);
      }
    };
    
    this._raf = requestAnimationFrame(animate);
  }

  stop() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    if (this._raf) {
      cancelAnimationFrame(this._raf);
      this._raf = null;
    }
    this.isRunning = false;

    if (this.overlay) {
      this.overlay.style.opacity = '0';
      this.overlay.style.visibility = 'hidden';
    }
  }

  complete() {
    this.stop();
    console.log('✅ Timer terminé');
  }

  isTimerRunning() {
    return this.isRunning;
  }
}
