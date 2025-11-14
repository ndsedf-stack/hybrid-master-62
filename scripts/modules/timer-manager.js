/**
 * TIMER MANAGER - ULTRA PRO VERSION CORRIGÉE
 * 4 cercles animés + barre tempo + intégration program-data
 */

export default class TimerManager {
  constructor() {
    this.timerInterval = null;
    this.remainingTime = 0;
    this.initialTime = 0;
    this.isRunning = false;
    this.isPaused = false;
    this.currentExercise = null;
    this.currentSetNumber = 0;
    this.totalSets = 0;
    this.tempo = null;
    this.repsTarget = 10;
    this.currentRep = 1;
    this.tempoPhase = 0; // 0=eccentric, 1=pause, 2=concentric
    this.tempoInterval = null;
    
    // Progression séance
    this.sessionTotalTime = 0;
    this.sessionElapsedTime = 0;
    this.exerciseTotalTime = 0;
    this.exerciseElapsedTime = 0;
    
    this.overlay = null;
    console.log('✅ TimerManager Premium initialisé');
  }

  /**
   * Calcule les temps de repos selon program-data
   */
  getRestTime(exerciseBlock) {
    const restAttr = exerciseBlock.dataset.rest;
    if (restAttr) return parseInt(restAttr);
    
    // Temps par défaut selon type d'exercice
    const exerciseName = exerciseBlock.dataset.exercise?.toLowerCase() || '';
    if (exerciseName.includes('squat') || exerciseName.includes('deadlift')) {
      return 120; // Exercices lourds
    }
    return 75; // Exercices accessoires
  }

  /**
   * Récupère le tempo depuis program-data
   */
  getTempo(exerciseBlock) {
    const tempoAttr = exerciseBlock.dataset.tempo;
    if (tempoAttr) {
      const parts = tempoAttr.split('-').map(n => parseInt(n));
      return {
        eccentric: parts[0] || 3,
        pause: parts[1] || 1,
        concentric: parts[2] || 2
      };
    }
    return { eccentric: 3, pause: 1, concentric: 2 };
  }

  /**
   * Démarre le timer
   */
  start(restSeconds, exerciseName, setNumber, totalSets, exerciseBlock = null, repsTarget = 10) {
    console.log('🎯 Timer Premium démarré:', { restSeconds, exerciseName, setNumber, totalSets });
    
    this.stop();
    this.initialTime = restSeconds;
    this.remainingTime = restSeconds;
    this.currentExercise = exerciseName;
    this.currentSetNumber = setNumber;
    this.totalSets = totalSets;
    this.repsTarget = repsTarget;
    this.currentRep = 1;
    this.tempoPhase = 0;
    
    // Récupère tempo depuis exerciseBlock
    if (exerciseBlock) {
      this.tempo = this.getTempo(exerciseBlock);
    } else {
      this.tempo = { eccentric: 3, pause: 1, concentric: 2 };
    }
    
    this.createOverlay();
    this.updateDisplay();
    this.startTempoAnimation();
    
    this.isRunning = true;
    this.isPaused = false;
    
    this.timerInterval = setInterval(() => {
      if (!this.isPaused) {
        this.remainingTime--;
        this.sessionElapsedTime++;
        this.exerciseElapsedTime++;
        this.updateDisplay();
        
        if (this.remainingTime <= 0) {
          this.complete();
        }
      }
    }, 1000);
  }

  /**
   * Crée l'overlay plein écran
   */
  createOverlay() {
    if (this.overlay) {
      this.overlay.remove();
    }

    this.overlay = document.createElement('div');
    this.overlay.id = 'timer-overlay-ultra-pro';
    this.overlay.innerHTML = `
      <button class="timer-close-btn" id="timer-close-ultra">×</button>
      
      <div class="timer-container-ultra">
        <!-- GIF Exercice en haut -->
        <div class="exercise-gif-container">
          <div class="gif-placeholder">GIF</div>
        </div>
        
        <!-- SVG 4 Cercles -->
        <svg class="timer-svg-ultra" viewBox="0 0 400 400">
          <defs>
            <!-- Gradients -->
            <linearGradient id="grad-session" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#00F5FF;stop-opacity:1" />
              <stop offset="50%" style="stop-color:#FF00FF;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#FFD700;stop-opacity:1" />
            </linearGradient>
            
            <linearGradient id="grad-exercise" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#FF6B35;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#FF0080;stop-opacity:1" />
            </linearGradient>
            
            <linearGradient id="grad-rest" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#00D9FF;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#0047AB;stop-opacity:1" />
            </linearGradient>
            
            <!-- Filters pour glow -->
            <filter id="glow-session">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            
            <filter id="glow-exercise">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            
            <filter id="glow-rest">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          <!-- Cercle 1: Session complète (extérieur) -->
          <circle class="circle-bg" cx="200" cy="200" r="180" />
          <circle 
            id="circle-session" 
            class="circle-session"
            cx="200" cy="200" r="180"
            stroke="url(#grad-session)"
            filter="url(#glow-session)"
          />
          
          <!-- Cercle 2: Exercice en cours -->
          <circle class="circle-bg" cx="200" cy="200" r="150" />
          <circle 
            id="circle-exercise" 
            class="circle-exercise"
            cx="200" cy="200" r="150"
            stroke="url(#grad-exercise)"
            filter="url(#glow-exercise)"
          />
          
          <!-- Cercle 3: Repos (intérieur) -->
          <circle class="circle-bg" cx="200" cy="200" r="120" />
          <circle 
            id="circle-rest" 
            class="circle-rest"
            cx="200" cy="200" r="120"
            stroke="url(#grad-rest)"
            filter="url(#glow-rest)"
          />
        </svg>
        
        <!-- Texte central -->
        <div class="timer-center-content">
          <div class="timer-exercise-name" id="timer-exercise-ultra">${this.currentExercise || 'Exercice'}</div>
          <div class="timer-time-ultra" id="timer-time-ultra">0:00</div>
          <div class="timer-phase-label">REPOS</div>
        </div>
        
        <!-- Barre Tempo en bas -->
        <div class="tempo-bar-container">
          <div class="tempo-bar eccentric" id="tempo-eccentric">
            <span>${this.tempo?.eccentric || 3}s</span>
          </div>
          <div class="tempo-bar pause" id="tempo-pause">
            <span>${this.tempo?.pause || 1}s</span>
          </div>
          <div class="tempo-bar concentric" id="tempo-concentric">
            <span>${this.tempo?.concentric || 2}s</span>
          </div>
        </div>
        
        <!-- Compteur reps -->
        <div class="rep-counter" id="rep-counter-ultra">
          REP ${this.currentRep}/${this.repsTarget}
        </div>
        
        <!-- Boutons contrôle -->
        <div class="timer-controls-ultra">
          <button id="timer-pause-ultra" class="btn-control">Pause</button>
          <button id="timer-skip-ultra" class="btn-control btn-skip">Terminer</button>
        </div>
      </div>
    `;

    document.body.appendChild(this.overlay);
    
    // Active l'overlay
    requestAnimationFrame(() => {
      this.overlay.classList.add('active');
    });

    // Event listeners
    document.getElementById('timer-close-ultra').addEventListener('click', () => this.stop());
    document.getElementById('timer-pause-ultra').addEventListener('click', () => this.togglePause());
    document.getElementById('timer-skip-ultra').addEventListener('click', () => this.complete());
  }

  /**
   * Met à jour l'affichage
   */
  updateDisplay() {
    if (!this.overlay) return;

    // Timer
    const minutes = Math.floor(this.remainingTime / 60);
    const seconds = this.remainingTime % 60;
    const timeDisplay = document.getElementById('timer-time-ultra');
    if (timeDisplay) {
      timeDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    // Nom exercice
    const exerciseDisplay = document.getElementById('timer-exercise-ultra');
    if (exerciseDisplay) {
      exerciseDisplay.textContent = this.currentExercise || 'Exercice';
    }

    // Cercles
    this.updateCircles();
  }

  /**
   * Met à jour les cercles SVG
   */
  updateCircles() {
    const circleSession = document.getElementById('circle-session');
    const circleExercise = document.getElementById('circle-exercise');
    const circleRest = document.getElementById('circle-rest');

    if (!circleSession || !circleExercise || !circleRest) return;

    // Cercle session (reste visible)
    const sessionProgress = this.sessionTotalTime > 0 
      ? (this.sessionElapsedTime / this.sessionTotalTime) * 100 
      : 0;
    const sessionCircumference = 2 * Math.PI * 180;
    const sessionOffset = sessionCircumference - (sessionProgress / 100) * sessionCircumference;
    circleSession.style.strokeDashoffset = sessionOffset;

    // Cercle exercice (reste visible)
    const exerciseProgress = this.exerciseTotalTime > 0 
      ? (this.exerciseElapsedTime / this.exerciseTotalTime) * 100 
      : 0;
    const exerciseCircumference = 2 * Math.PI * 150;
    const exerciseOffset = exerciseCircumference - (exerciseProgress / 100) * exerciseCircumference;
    circleExercise.style.strokeDashoffset = exerciseOffset;

    // Cercle repos (se vide)
    const restProgress = (this.remainingTime / this.initialTime) * 100;
    const restCircumference = 2 * Math.PI * 120;
    const restOffset = restCircumference - (restProgress / 100) * restCircumference;
    circleRest.style.strokeDashoffset = restOffset;
  }

  /**
   * Animation barre tempo
   */
  startTempoAnimation() {
    if (this.tempoInterval) clearInterval(this.tempoInterval);
    
    const totalTempoTime = this.tempo.eccentric + this.tempo.pause + this.tempo.concentric;
    let tempoCounter = 0;
    
    this.tempoInterval = setInterval(() => {
      if (this.isPaused) return;
      
      tempoCounter++;
      
      // Phase eccentric
      if (tempoCounter <= this.tempo.eccentric) {
        this.tempoPhase = 0;
        this.highlightTempoBar('eccentric');
      }
      // Phase pause
      else if (tempoCounter <= this.tempo.eccentric + this.tempo.pause) {
        this.tempoPhase = 1;
        this.highlightTempoBar('pause');
      }
      // Phase concentric
      else if (tempoCounter <= totalTempoTime) {
        this.tempoPhase = 2;
        this.highlightTempoBar('concentric');
      }
      // Nouvelle rep
      else {
        tempoCounter = 0;
        this.currentRep++;
        if (this.currentRep > this.repsTarget) {
          this.currentRep = 1;
        }
        this.updateRepCounter();
      }
    }, 1000);
  }

  /**
   * Highlight barre tempo
   */
  highlightTempoBar(phase) {
    const bars = ['eccentric', 'pause', 'concentric'];
    bars.forEach(bar => {
      const el = document.getElementById(`tempo-${bar}`);
      if (el) {
        el.classList.toggle('active', bar === phase);
      }
    });
  }

  /**
   * Met à jour compteur reps
   */
  updateRepCounter() {
    const counter = document.getElementById('rep-counter-ultra');
    if (counter) {
      counter.textContent = `REP ${this.currentRep}/${this.repsTarget}`;
    }
  }

  /**
   * Toggle pause
   */
  togglePause() {
    this.isPaused = !this.isPaused;
    const btn = document.getElementById('timer-pause-ultra');
    if (btn) {
      btn.textContent = this.isPaused ? 'Reprendre' : 'Pause';
    }
  }

  /**
   * Timer terminé
   */
  complete() {
    console.log('✅ Timer terminé');
    this.stop();
    
    // Vibration
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]);
    }
  }

  /**
   * Arrête le timer
   */
  stop() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    if (this.tempoInterval) {
      clearInterval(this.tempoInterval);
      this.tempoInterval = null;
    }
    if (this.overlay) {
      this.overlay.classList.remove('active');
      setTimeout(() => {
        this.overlay?.remove();
        this.overlay = null;
      }, 300);
    }
    this.isRunning = false;
  }
}
