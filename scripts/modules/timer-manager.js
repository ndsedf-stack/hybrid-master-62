/**
 * TIMER MANAGER - VERSION PREMIUM PLEIN ÉCRAN
 * Design circulaire multicolore avec segments animés
 */
export default class TimerManager {
  constructor() {
    this.timerInterval = null;
    this.remainingTime = 0;
    this.initialTime = 0;
    this.isRunning = false;
    this.currentExercise = null;
    this.currentSetNumber = 0;
    this.totalSets = 0;
    
    // Éléments DOM
    this.timerOverlay = null;
    this.timeDisplay = null;
    this.exerciseNameDisplay = null;
    this.phaseDisplay = null;
    
    // SVG circles
    this.mainCircle = null;
    this.segmentsGroup = null;
  }

  /**
   * Initialise le timer (appelé depuis app.js)
   */
  init() {
    this.createTimerOverlay();
    this.attachEventListeners();
    console.log('✅ TimerManager Premium initialisé');
  }

  /**
   * Crée l'overlay plein écran du timer
   */
  createTimerOverlay() {
    // Créer l'overlay s'il n'existe pas
    if (document.getElementById('timer-overlay-premium')) {
      this.timerOverlay = document.getElementById('timer-overlay-premium');
      return;
    }

    const overlay = document.createElement('div');
    overlay.id = 'timer-overlay-premium';
    overlay.className = 'timer-overlay-premium';
    overlay.innerHTML = `
      <div class="timer-premium-container">
        <!-- SVG avec les cercles -->
        <svg class="timer-premium-svg" viewBox="0 0 340 340">
          <!-- Segments colorés (séance) -->
          <g id="timer-segments"></g>
          
          <!-- Cercle principal (progression) -->
          <circle id="timer-main-circle"
                  cx="170" cy="170" r="140"
                  stroke="url(#timer-gradient)"
                  stroke-width="20"
                  stroke-linecap="round"
                  fill="none"
                  transform="rotate(-90 170 170)"/>
          
          <!-- Gradient pour le cercle principal -->
          <defs>
            <linearGradient id="timer-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style="stop-color:#FF6D00;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#FF9100;stop-opacity:1" />
            </linearGradient>
          </defs>
        </svg>

        <!-- Contenu central -->
        <div class="timer-premium-center">
          <div class="timer-premium-exercise-name">Exercice</div>
          <div class="timer-premium-time">00:00</div>
          <div class="timer-premium-phase">Série 1/5</div>
        </div>

        <!-- Boutons de contrôle -->
        <div class="timer-premium-controls">
          <button id="timer-premium-minus" class="timer-control-btn">-15s</button>
          <button id="timer-premium-pause" class="timer-control-btn timer-control-pause">Pause</button>
          <button id="timer-premium-plus" class="timer-control-btn">+15s</button>
        </div>

        <!-- Bouton fermer -->
        <button id="timer-premium-close" class="timer-premium-close">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    `;

    document.body.appendChild(overlay);
    this.timerOverlay = overlay;

    // Récupérer les éléments
    this.timeDisplay = overlay.querySelector('.timer-premium-time');
    this.exerciseNameDisplay = overlay.querySelector('.timer-premium-exercise-name');
    this.phaseDisplay = overlay.querySelector('.timer-premium-phase');
    this.mainCircle = overlay.querySelector('#timer-main-circle');
    this.segmentsGroup = overlay.querySelector('#timer-segments');

    // Créer les segments colorés
    this.createSegments();
  }

  /**
   * Crée les segments colorés de la séance
   */
  createSegments() {
    const segments = [
      { start: 0, sweep: 55, color: '#00C853' },
      { start: 65, sweep: 65, color: '#2962FF' },
      { start: 140, sweep: 60, color: '#FF6D00' },
      { start: 210, sweep: 40, color: '#D50000' },
      { start: 260, sweep: 50, color: '#00BCD4' }
    ];

    const cx = 170;
    const cy = 170;
    const radius = 160;
    const strokeWidth = 12;

    segments.forEach(seg => {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      const d = this.describeArc(cx, cy, radius, seg.start, seg.start + seg.sweep);
      
      path.setAttribute('d', d);
      path.setAttribute('stroke', seg.color);
      path.setAttribute('stroke-width', strokeWidth);
      path.setAttribute('stroke-linecap', 'round');
      path.setAttribute('fill', 'none');
      path.setAttribute('opacity', '0.6');
      
      this.segmentsGroup.appendChild(path);
    });
  }

  /**
   * Calcule le path SVG d'un arc
   */
  describeArc(cx, cy, radius, startAngle, endAngle) {
    const start = this.polarToCartesian(cx, cy, radius, endAngle);
    const end = this.polarToCartesian(cx, cy, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
  }

  /**
   * Convertit coordonnées polaires en cartésiennes
   */
  polarToCartesian(cx, cy, radius, angleDeg) {
    const angleRad = ((angleDeg - 90) * Math.PI) / 180;
    return {
      x: cx + radius * Math.cos(angleRad),
      y: cy + radius * Math.sin(angleRad)
    };
  }

  /**
   * Attache les événements aux boutons
   */
  attachEventListeners() {
    // Bouton Pause/Resume
    const pauseBtn = document.getElementById('timer-premium-pause');
    if (pauseBtn) {
      pauseBtn.addEventListener('click', () => this.togglePause());
    }

    // Bouton -15s
    const minusBtn = document.getElementById('timer-premium-minus');
    if (minusBtn) {
      minusBtn.addEventListener('click', () => this.adjustTime(-15));
    }

    // Bouton +15s
    const plusBtn = document.getElementById('timer-premium-plus');
    if (plusBtn) {
      plusBtn.addEventListener('click', () => this.adjustTime(15));
    }

    // Bouton Close
    const closeBtn = document.getElementById('timer-premium-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.hide());
    }
  }

  /**
   * Démarre le timer avec un temps de repos (en secondes)
   */
  start(seconds, exerciseName = '', setNumber = 0, totalSets = 0) {
    console.log('🎯 Timer Premium démarré:', { seconds, exerciseName, setNumber, totalSets });
    
    this.stop();

    this.initialTime = seconds;
    this.remainingTime = seconds;
    this.currentExercise = exerciseName;
    this.currentSetNumber = setNumber;
    this.totalSets = totalSets;

    // Mettre à jour l'affichage
    if (this.exerciseNameDisplay) {
      this.exerciseNameDisplay.textContent = exerciseName || 'Repos';
    }
    if (this.phaseDisplay) {
      this.phaseDisplay.textContent = `Série ${setNumber}/${totalSets}`;
    }

    this.show();
    this.updateDisplay();
    this.resume();
  }

  /**
   * Reprend le timer
   */
  resume() {
    if (this.isRunning) return;

    this.isRunning = true;
    this.timerInterval = setInterval(() => {
      this.remainingTime--;

      if (this.remainingTime <= 0) {
        this.onTimerEnd();
      } else {
        this.updateDisplay();
      }
    }, 1000);

    const pauseBtn = document.getElementById('timer-premium-pause');
    if (pauseBtn) {
      pauseBtn.textContent = 'Pause';
    }
  }

  /**
   * Met le timer en pause
   */
  pause() {
    if (!this.isRunning) return;

    this.isRunning = false;
    clearInterval(this.timerInterval);

    const pauseBtn = document.getElementById('timer-premium-pause');
    if (pauseBtn) {
      pauseBtn.textContent = 'Resume';
    }
  }

  /**
   * Toggle pause/resume
   */
  togglePause() {
    if (this.isRunning) {
      this.pause();
    } else {
      this.resume();
    }
  }

  /**
   * Arrête complètement le timer
   */
  stop() {
    this.isRunning = false;
    clearInterval(this.timerInterval);
    this.timerInterval = null;
  }

  /**
   * Ajuste le temps (+/- secondes)
   */
  adjustTime(seconds) {
    this.remainingTime += seconds;
    if (this.remainingTime < 0) {
      this.remainingTime = 0;
    }
    this.updateDisplay();
  }

  /**
   * Appelé quand le timer arrive à 0
   */
  onTimerEnd() {
    this.stop();
    this.playNotification();
    this.vibrate();
    
    if (this.timeDisplay) {
      this.timeDisplay.textContent = '00:00';
    }
    
    setTimeout(() => {
      this.hide();
    }, 2000);
  }

  /**
   * Met à jour l'affichage du temps et du cercle
   */
  updateDisplay() {
    // Affichage du temps
    const minutes = Math.floor(this.remainingTime / 60);
    const seconds = this.remainingTime % 60;
    const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    if (this.timeDisplay) {
      this.timeDisplay.textContent = timeString;
    }

    // Mise à jour du cercle de progression
    if (this.mainCircle && this.initialTime > 0) {
      const radius = 140;
      const circumference = 2 * Math.PI * radius;
      const percentage = (this.remainingTime / this.initialTime);
      const offset = circumference * (1 - percentage);
      
      this.mainCircle.style.strokeDasharray = `${circumference}`;
      this.mainCircle.style.strokeDashoffset = offset;
      this.mainCircle.style.transition = 'stroke-dashoffset 1s linear';
    }
  }

  /**
   * Affiche le timer plein écran
   */
  show() {
    if (this.timerOverlay) {
      this.timerOverlay.classList.add('active');
      // Empêcher le scroll du body
      document.body.style.overflow = 'hidden';
    }
  }

  /**
   * Cache le timer
   */
  hide() {
    if (this.timerOverlay) {
      this.timerOverlay.classList.remove('active');
      // Réactiver le scroll
      document.body.style.overflow = '';
    }
  }

  /**
   * Joue un son de notification
   */
  playNotification() {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.warn('⚠️ Son non disponible');
    }
  }

  /**
   * Vibre (mobile uniquement)
   */
  vibrate() {
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200]);
    }
  }
}
