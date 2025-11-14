/**
 * TIMER MANAGER - ULTRA PRO VERSION
 * 4 cercles animés + barre tempo + effets premium
 */
export default class TimerManager {
  constructor() {
    this.size = 400;
    this.stroke = 20;
    
    // State
    this.isRunning = false;
    this.remainingTime = 0;
    this.initialTime = 0;
    this.currentExercise = null;
    this.currentRep = 0;
    this.totalReps = 10;
    this.tempo = [3, 1, 2]; // [eccentric, pause, concentric]
    this.timerInterval = null;
    this.tempoInterval = null;
    this.tempoPhase = 0; // 0=eccentric, 1=pause, 2=concentric
    this.tempoProgress = 0;
    
    // Progress
    this.sessionProgress = 0;
    this.exerciseProgress = 0;
    this.restProgress = 1;
    
    // Elements
    this.overlay = null;
    this.svg = null;
    this.paths = {};
    this.tempoBar = null;

    console.log('✅ TimerManager Ultra Pro initialisé');
  }

  init() {
    if (this.overlay) return;
    this.createOverlay();
  }

  createOverlay() {
    // Overlay plein écran avec glassmorphism
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.4s;
      backdrop-filter: blur(20px);
    `;
    document.body.appendChild(overlay);
    this.overlay = overlay;

    // Container principal
    const container = document.createElement('div');
    container.style.cssText = `
      position: relative;
      width: ${this.size}px;
      height: ${this.size}px;
    `;
    overlay.appendChild(container);

    // Bouton fermer
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '×';
    closeBtn.style.cssText = `
      position: absolute;
      top: -70px;
      right: 0;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.05);
      border: 2px solid rgba(255, 255, 255, 0.1);
      color: #fff;
      font-size: 36px;
      font-weight: 300;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
    `;
    closeBtn.addEventListener('mouseenter', () => {
      closeBtn.style.background = 'rgba(255, 107, 53, 0.2)';
      closeBtn.style.borderColor = 'rgba(255, 107, 53, 0.5)';
      closeBtn.style.transform = 'rotate(90deg) scale(1.1)';
    });
    closeBtn.addEventListener('mouseleave', () => {
      closeBtn.style.background = 'rgba(255, 255, 255, 0.05)';
      closeBtn.style.borderColor = 'rgba(255, 255, 255, 0.1)';
      closeBtn.style.transform = 'none';
    });
    closeBtn.addEventListener('click', () => this.stop());
    container.appendChild(closeBtn);

    // SVG avec 4 cercles
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', this.size);
    svg.setAttribute('height', this.size);
    container.appendChild(svg);
    this.svg = svg;

    const cx = this.size / 2;
    const cy = this.size / 2;

    // Créer les 4 cercles
    this.createCircle4(svg, cx, cy); // Cercle 4 (le plus extérieur) - Séance
    this.createCircle3(svg, cx, cy); // Cercle 3 - Exercice
    this.createCircle2(svg, cx, cy); // Cercle 2 - Repos
    this.createCircle1(svg, cx, cy); // Cercle 1 (centre) - Base

    // Contenu central
    this.createCenterContent(container);
    
    // Barre tempo
    this.createTempoBar(container);
  }

  createCircle4(svg, cx, cy) {
    // Cercle séance (extérieur) - Gradient arc-en-ciel
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    gradient.setAttribute('id', 'sessionGradient');
    gradient.setAttribute('x1', '0%');
    gradient.setAttribute('y1', '0%');
    gradient.setAttribute('x2', '100%');
    gradient.setAttribute('y2', '100%');
    gradient.innerHTML = `
      <stop offset="0%" style="stop-color:#00F5FF;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#FF00FF;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#FFD700;stop-opacity:1" />
    `;
    defs.appendChild(gradient);
    svg.appendChild(defs);

    const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    filter.setAttribute('id', 'glow');
    filter.innerHTML = `
      <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    `;
    defs.appendChild(filter);

    const r4 = cx - this.stroke * 0.5;
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('stroke', 'url(#sessionGradient)');
    path.setAttribute('stroke-width', this.stroke);
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('fill', 'none');
    path.setAttribute('filter', 'url(#glow)');
    path.setAttribute('opacity', '0.8');
    svg.appendChild(path);
    this.paths.session = path;
    this.paths.sessionRadius = r4;
  }

  createCircle3(svg, cx, cy) {
    // Cercle exercice (orange flamboyant)
    const defs = svg.querySelector('defs');
    const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    gradient.setAttribute('id', 'exerciseGradient');
    gradient.innerHTML = `
      <stop offset="0%" style="stop-color:#FF6B35;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#FF0080;stop-opacity:1" />
    `;
    defs.appendChild(gradient);

    const r3 = cx - this.stroke * 1.8;
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('stroke', 'url(#exerciseGradient)');
    path.setAttribute('stroke-width', this.stroke);
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('fill', 'none');
    path.setAttribute('filter', 'url(#glow)');
    svg.appendChild(path);
    this.paths.exercise = path;
    this.paths.exerciseRadius = r3;
  }

  createCircle2(svg, cx, cy) {
    // Cercle repos (bleu glacé)
    const defs = svg.querySelector('defs');
    const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    gradient.setAttribute('id', 'restGradient');
    gradient.innerHTML = `
      <stop offset="0%" style="stop-color:#00D9FF;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0047AB;stop-opacity:1" />
    `;
    defs.appendChild(gradient);

    const r2 = cx - this.stroke * 3.1;
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('stroke', 'url(#restGradient)');
    path.setAttribute('stroke-width', this.stroke);
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('fill', 'none');
    path.setAttribute('filter', 'url(#glow)');
    svg.appendChild(path);
    this.paths.rest = path;
    this.paths.restRadius = r2;
  }

  createCircle1(svg, cx, cy) {
    // Cercle base (fond subtil)
    const r1 = cx - this.stroke * 4.4;
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', cx);
    circle.setAttribute('cy', cy);
    circle.setAttribute('r', r1);
    circle.setAttribute('fill', 'rgba(255, 255, 255, 0.02)');
    circle.setAttribute('stroke', 'rgba(255, 255, 255, 0.05)');
    circle.setAttribute('stroke-width', '2');
    svg.appendChild(circle);
  }

  createCenterContent(container) {
    const center = document.createElement('div');
    center.style.cssText = `
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      pointer-events: none;
    `;
    container.appendChild(center);

    // Placeholder image/GIF
    const imgHolder = document.createElement('div');
    imgHolder.style.cssText = `
      width: 100px;
      height: 80px;
      background: rgba(255, 255, 255, 0.03);
      border-radius: 16px;
      border: 2px solid rgba(255, 255, 255, 0.08);
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: rgba(255, 255, 255, 0.3);
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 1px;
      backdrop-filter: blur(10px);
    `;
    imgHolder.textContent = 'GIF';
    center.appendChild(imgHolder);

    // Nom exercice
    const exerciseName = document.createElement('div');
    exerciseName.style.cssText = `
      color: #FF6B35;
      font-size: 26px;
      font-weight: 700;
      letter-spacing: 0.5px;
      margin-bottom: 16px;
      text-align: center;
      max-width: 280px;
      text-shadow: 0 0 20px rgba(255, 107, 53, 0.5);
    `;
    exerciseName.textContent = 'Exercice';
    center.appendChild(exerciseName);
    this.labels = { exerciseName };

    // Timer
    const timerText = document.createElement('div');
    timerText.style.cssText = `
      color: #FFFFFF;
      font-size: 72px;
      font-weight: 800;
      letter-spacing: 3px;
      line-height: 1;
      text-shadow: 0 0 40px rgba(255, 107, 53, 0.6),
                   0 0 80px rgba(255, 107, 53, 0.3);
    `;
    timerText.textContent = '0:00';
    center.appendChild(timerText);
    this.labels.timerText = timerText;

    // Phase label
    const phaseLabel = document.createElement('div');
    phaseLabel.style.cssText = `
      color: rgba(255, 255, 255, 0.5);
      font-size: 14px;
      font-weight: 600;
      margin-top: 12px;
      text-transform: uppercase;
      letter-spacing: 3px;
    `;
    phaseLabel.textContent = 'REPOS';
    center.appendChild(phaseLabel);
  }

  createTempoBar(container) {
    const tempoContainer = document.createElement('div');
    tempoContainer.style.cssText = `
      position: absolute;
      bottom: -80px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 8px;
      align-items: flex-end;
    `;
    container.appendChild(tempoContainer);

    const phases = [
      { name: 'ECCENTRIC', color: '#FF3B3F', duration: 3 },
      { name: 'PAUSE', color: '#FFD93D', duration: 1 },
      { name: 'CONCENTRIC', color: '#6BCF7F', duration: 2 }
    ];

    phases.forEach((phase, i) => {
      const bar = document.createElement('div');
      bar.style.cssText = `
        width: 60px;
        height: ${40 + phase.duration * 15}px;
        background: rgba(255, 255, 255, 0.05);
        border: 2px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        position: relative;
        overflow: hidden;
        transition: all 0.3s ease;
      `;
      
      const fill = document.createElement('div');
      fill.style.cssText = `
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 0%;
        background: ${phase.color};
        box-shadow: 0 0 20px ${phase.color};
        transition: height 0.1s linear;
      `;
      bar.appendChild(fill);
      
      const label = document.createElement('div');
      label.style.cssText = `
        position: absolute;
        bottom: -25px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 10px;
        font-weight: 700;
        color: rgba(255, 255, 255, 0.4);
        letter-spacing: 1px;
        white-space: nowrap;
      `;
      label.textContent = `${phase.duration}s`;
      bar.appendChild(label);
      
      tempoContainer.appendChild(bar);
      
      if (!this.tempoBar) this.tempoBar = {};
      this.tempoBar[i] = { bar, fill };
    });

    // Rep counter
    const repCounter = document.createElement('div');
    repCounter.style.cssText = `
      position: absolute;
      top: -40px;
      left: 50%;
      transform: translateX(-50%);
      color: rgba(255, 255, 255, 0.6);
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 2px;
    `;
    repCounter.textContent = 'REP 0/10';
    tempoContainer.appendChild(repCounter);
    this.repCounter = repCounter;
  }

  describeArc(cx, cy, r, progress) {
    const startAngle = -90;
    const endAngle = startAngle + (360 * progress);
    
    const start = this.polarToCartesian(cx, cy, r, endAngle);
    const end = this.polarToCartesian(cx, cy, r, startAngle);
    
    const largeArcFlag = (endAngle - startAngle) <= 180 ? '0' : '1';
    
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
  }

  polarToCartesian(cx, cy, r, angleDeg) {
    const angleRad = (angleDeg * Math.PI) / 180;
    return {
      x: cx + r * Math.cos(angleRad),
      y: cy + r * Math.sin(angleRad)
    };
  }

  start(duration, exerciseName, setNumber, totalSets) {
    console.log('🔥 Timer Ultra Pro démarré:', { duration, exerciseName });

    if (!this.overlay) this.init();

    this.stop();
    this.remainingTime = duration;
    this.initialTime = duration;
    this.currentExercise = exerciseName;
    this.isRunning = true;
    this.restProgress = 1;

    if (this.labels.exerciseName) {
      this.labels.exerciseName.textContent = exerciseName || 'Exercice';
    }

    this.overlay.style.opacity = '1';
    this.overlay.style.visibility = 'visible';

    this.updateDisplay();
    this.timerInterval = setInterval(() => this.tick(), 1000);
    this.startTempoAnimation();
    this.animateCircles();
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

    this.restProgress = this.remainingTime / this.initialTime;
    this.updateCircles();
  }

  updateCircles() {
    const cx = this.size / 2;
    const cy = this.size / 2;

    // Cercle repos (se vide)
    if (this.paths.rest) {
      this.paths.rest.setAttribute('d', 
        this.describeArc(cx, cy, this.paths.restRadius, this.restProgress)
      );
    }

    // Cercle exercice (simule progression)
    if (this.paths.exercise) {
      this.exerciseProgress = Math.min(1, this.exerciseProgress + 0.01);
      this.paths.exercise.setAttribute('d',
        this.describeArc(cx, cy, this.paths.exerciseRadius, this.exerciseProgress)
      );
    }

    // Cercle séance (simule progression)
    if (this.paths.session) {
      this.sessionProgress = Math.min(1, this.sessionProgress + 0.005);
      this.paths.session.setAttribute('d',
        this.describeArc(cx, cy, this.paths.sessionRadius, this.sessionProgress)
      );
    }
  }

  startTempoAnimation() {
    const tempoTotal = this.tempo.reduce((a, b) => a + b, 0);
    let elapsed = 0;

    this.tempoInterval = setInterval(() => {
      elapsed++;
      
      // Calculer phase et progression
      let cumul = 0;
      for (let i = 0; i < this.tempo.length; i++) {
        if (elapsed <= cumul + this.tempo[i]) {
          this.tempoPhase = i;
          this.tempoProgress = (elapsed - cumul) / this.tempo[i];
          break;
        }
        cumul += this.tempo[i];
      }

      // Update barre tempo
      Object.keys(this.tempoBar).forEach(i => {
        const { fill, bar } = this.tempoBar[i];
        if (parseInt(i) === this.tempoPhase) {
          fill.style.height = `${this.tempoProgress * 100}%`;
          bar.style.transform = 'scale(1.1)';
          bar.style.borderColor = 'rgba(255, 255, 255, 0.3)';
        } else if (parseInt(i) < this.tempoPhase) {
          fill.style.height = '100%';
          bar.style.transform = 'scale(1)';
          bar.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        } else {
          fill.style.height = '0%';
          bar.style.transform = 'scale(1)';
          bar.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        }
      });

      // Reset cycle
      if (elapsed >= tempoTotal) {
        elapsed = 0;
        this.currentRep++;
        if (this.repCounter) {
          this.repCounter.textContent = `REP ${this.currentRep}/${this.totalReps}`;
        }
      }
    }, 1000);
  }

  animateCircles() {
    const animate = () => {
      if (this.isRunning) {
        this.updateCircles();
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }

  stop() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    if (this.tempoInterval) {
      clearInterval(this.tempoInterval);
      this.tempoInterval = null;
    }
    this.isRunning = false;
    this.currentRep = 0;
    this.exerciseProgress = 0;
    this.sessionProgress = 0;

    if (this.overlay) {
      this.overlay.style.opacity = '0';
      this.overlay.style.visibility = 'hidden';
    }
  }

  complete() {
    this.stop();
    console.log('✅ Timer Ultra Pro terminé');
  }

  isTimerRunning() {
    return this.isRunning;
  }
}
