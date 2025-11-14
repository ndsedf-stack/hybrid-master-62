/**
 * TIMER MANAGER - ULTRA PRO VERSION CORRIGÉE
 * 4 cercles animés + barre tempo + intégration program-data
 * CERCLES EN COUNTDOWN (se vident) + BARRE TEMPO VISUELLE
 */

export default class TimerManager {
  constructor() {
    this.timerInterval = null;
    this.remainingTime = 0;
    this.initialTime = 0;
    this.isPaused = false;
    this.overlay = null;
    this.onComplete = null;
    this.currentExercise = null;
    this.currentSet = null;
    this.tempoData = null; // [descent, pause, lift]
    
    console.log('✅ TimerManager Premium initialisé');
  }

  /**
   * Démarre le timer avec les données de l'exercice
   */
  start(exerciseName, setNumber, restTime, tempo = [3, 1, 2], gifUrl = null) {
    console.log('🚀 Timer start:', { exerciseName, setNumber, restTime, tempo });
    
    this.currentExercise = exerciseName;
    this.currentSet = setNumber;
    this.initialTime = restTime;
    this.remainingTime = restTime;
    this.tempoData = tempo;
    this.isPaused = false;
    
    // Créer l'overlay si nécessaire
    if (!this.overlay) {
      this.createOverlay(gifUrl);
    }
    
    // Mettre à jour les informations
    this.updateDisplay();
    
    // Démarrer le compte à rebours
    this.startCountdown();
  }

  /**
   * Crée l'overlay du timer ultra pro
   */
  createOverlay(gifUrl) {
    console.log('🎨 Création de l\'overlay ultra pro');
    
    // Supprimer l'ancien overlay s'il existe
    const existingOverlay = document.getElementById('timer-overlay-ultra-pro');
    if (existingOverlay) {
      existingOverlay.remove();
    }
    
    const tempo = this.tempoData || [3, 1, 2];
    
    this.overlay = document.createElement('div');
    this.overlay.id = 'timer-overlay-ultra-pro';
    this.overlay.innerHTML = `
      <div class="timer-ultra-content">
        
        <!-- GIF de l'exercice -->
        <div class="exercise-gif-container">
          ${gifUrl ? `<img src="${gifUrl}" alt="${this.currentExercise}" class="exercise-gif" />` : `<div style="color: rgba(255,255,255,0.5);">GIF</div>`}
        </div>
        
        <!-- Nom de l'exercice -->
        <div class="exercise-name-overlay">${this.currentExercise}</div>
        
        <!-- Conteneur des 4 cercles -->
        <div class="timer-circles-container">
          <svg width="340" height="340" viewBox="0 0 340 340">
            <!-- Gradient pour le cercle rest -->
            <defs>
              <linearGradient id="gradient-rest" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#00bfff;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#1e90ff;stop-opacity:1" />
              </linearGradient>
            </defs>
            
            <!-- Cercle 1 : Session (extérieur) -->
            <circle 
              class="timer-circle-session" 
              cx="170" 
              cy="170" 
              r="150"
              transform="rotate(-90 170 170)"
            />
            
            <!-- Cercle 2 : Exercise (milieu) -->
            <circle 
              class="timer-circle-exercise" 
              cx="170" 
              cy="170" 
              r="130"
              transform="rotate(-90 170 170)"
            />
            
            <!-- Cercle 3 : Rest (intérieur) -->
            <circle 
              class="timer-circle-rest" 
              cx="170" 
              cy="170" 
              r="110"
              transform="rotate(-90 170 170)"
            />
          </svg>
          
          <!-- Point actuel (petit point rouge) -->
          <div class="timer-current-dot"></div>
          
          <!-- Temps au centre -->
          <div class="timer-center-content">
            <div class="timer-main-time" id="timer-main-time">0:00</div>
            <div class="timer-repos-label">REPOS</div>
          </div>
        </div>
        
        <!-- Barre Tempo Ultra Visuelle -->
        <div class="tempo-bar-container">
          <div class="tempo-bar-wrapper">
            <div class="tempo-bar-title">TEMPO</div>
            <div class="tempo-bar-track">
              <div class="tempo-bar-progress phase-descent"></div>
            </div>
            <div class="tempo-phases">
              <div class="tempo-phase-label descent">
                ⬇️ ${tempo[0]}s
              </div>
              <div class="tempo-phase-label pause">
                ⏸️ ${tempo[1]}s
              </div>
              <div class="tempo-phase-label lift">
                ⬆️ ${tempo[2]}s
              </div>
            </div>
          </div>
        </div>
        
        <!-- Rep counter -->
        <div class="rep-counter-display">
          <div class="rep-counter-label" id="rep-counter">REP ${this.currentSet}</div>
        </div>
        
        <!-- Boutons de contrôle -->
        <div class="timer-controls-ultra">
          <button class="timer-btn-ultra timer-btn-pause" id="timer-btn-pause">Pause</button>
          <button class="timer-btn-ultra timer-btn-skip" id="timer-btn-skip">Terminer</button>
        </div>
        
      </div>
    `;
    
    document.body.appendChild(this.overlay);
    
    // Attacher les événements
    this.attachEvents();
    
    console.log('✅ Overlay créé');
  }

  /**
   * Attache les événements aux boutons
   */
  attachEvents() {
    const pauseBtn = this.overlay.querySelector('#timer-btn-pause');
    const skipBtn = this.overlay.querySelector('#timer-btn-skip');
    
    pauseBtn?.addEventListener('click', () => this.togglePause());
    skipBtn?.addEventListener('click', () => this.skip());
  }

  /**
   * Met à jour l'affichage du timer
   */
  updateDisplay() {
    if (!this.overlay) return;
    
    const timeDisplay = this.overlay.querySelector('#timer-main-time');
    if (timeDisplay) {
      const minutes = Math.floor(this.remainingTime / 60);
      const seconds = this.remainingTime % 60;
      timeDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    // Mettre à jour les cercles
    this.updateCircles();
    
    // Mettre à jour la barre tempo
    this.updateTempoBar();
  }

  /**
   * Met à jour les cercles de progression (COUNTDOWN)
   */
  updateCircles() {
    const restProgress = this.remainingTime / this.initialTime; // Countdown: 1 → 0
    const exerciseProgress = 0.5; // Exemple
    const sessionProgress = 0.75; // Exemple
    
    // Appliquer les progressions (countdown: se vident)
    this.overlay.style.setProperty('--progress-rest', restProgress);
    this.overlay.style.setProperty('--progress-exercise', exerciseProgress);
    this.overlay.style.setProperty('--progress-session', sessionProgress);
  }

  /**
   * Met à jour la barre tempo visuelle
   */
  updateTempoBar() {
    if (!this.tempoData) return;
    
    const [descent, pause, lift] = this.tempoData;
    const totalTempo = descent + pause + lift;
    
    // Calculer la progression dans le cycle tempo
    const repTime = this.initialTime - this.remainingTime;
    const cycleTime = repTime % totalTempo;
    
    const progressBar = this.overlay.querySelector('.tempo-bar-progress');
    const descentLabel = this.overlay.querySelector('.tempo-phase-label.descent');
    const pauseLabel = this.overlay.querySelector('.tempo-phase-label.pause');
    const liftLabel = this.overlay.querySelector('.tempo-phase-label.lift');
    
    if (!progressBar) return;
    
    // Déterminer la phase actuelle
    let currentPhase = 'descent';
    let phaseProgress = 0;
    let phaseWidth = 0;
    
    if (cycleTime < descent) {
      // Phase descent (ROUGE)
      currentPhase = 'descent';
      phaseProgress = cycleTime / descent;
      phaseWidth = (descent / totalTempo) * 100;
      progressBar.style.width = `${phaseWidth * phaseProgress}%`;
      progressBar.className = 'tempo-bar-progress phase-descent';
      
      descentLabel?.classList.add('active');
      pauseLabel?.classList.remove('active');
      liftLabel?.classList.remove('active');
      
    } else if (cycleTime < descent + pause) {
      // Phase pause (JAUNE)
      currentPhase = 'pause';
      phaseProgress = (cycleTime - descent) / pause;
      const descentWidth = (descent / totalTempo) * 100;
      phaseWidth = (pause / totalTempo) * 100;
      progressBar.style.width = `${descentWidth + (phaseWidth * phaseProgress)}%`;
      progressBar.className = 'tempo-bar-progress phase-pause';
      
      descentLabel?.classList.remove('active');
      pauseLabel?.classList.add('active');
      liftLabel?.classList.remove('active');
      
    } else {
      // Phase lift (VERT)
      currentPhase = 'lift';
      phaseProgress = (cycleTime - descent - pause) / lift;
      const previousWidth = ((descent + pause) / totalTempo) * 100;
      phaseWidth = (lift / totalTempo) * 100;
      progressBar.style.width = `${previousWidth + (phaseWidth * phaseProgress)}%`;
      progressBar.className = 'tempo-bar-progress phase-lift';
      
      descentLabel?.classList.remove('active');
      pauseLabel?.classList.remove('active');
      liftLabel?.classList.add('active');
    }
  }

  /**
   * Démarre le compte à rebours
   */
  startCountdown() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    
    this.timerInterval = setInterval(() => {
      if (!this.isPaused) {
        this.remainingTime--;
        this.updateDisplay();
        
        if (this.remainingTime <= 0) {
          this.complete();
        }
      }
    }, 1000);
  }

  /**
   * Pause / Reprend le timer
   */
  togglePause() {
    this.isPaused = !this.isPaused;
    const pauseBtn = this.overlay.querySelector('#timer-btn-pause');
    if (pauseBtn) {
      pauseBtn.textContent = this.isPaused ? 'Reprendre' : 'Pause';
    }
    console.log(this.isPaused ? '⏸️ Timer en pause' : '▶️ Timer repris');
  }

  /**
   * Saute le timer
   */
  skip() {
    console.log('⏭️ Timer skip');
    this.complete();
  }

  /**
   * Termine le timer
   */
  complete() {
    console.log('✅ Timer terminé');
    
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    
    // Supprimer l'overlay
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
    
    // Appeler le callback de complétion
    if (this.onComplete) {
      this.onComplete();
    }
  }

  /**
   * Définit le callback de complétion
   */
  setOnComplete(callback) {
    this.onComplete = callback;
  }

  /**
   * Arrête et nettoie le timer
   */
  stop() {
    console.log('🛑 Timer arrêté');
    
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
  }

  /**
   * Récupère le temps de repos depuis data-rest
   */
  getRestTime(exerciseElement) {
    const restTime = exerciseElement?.dataset?.rest;
    return restTime ? parseInt(restTime) : 75; // Défaut 75s
  }

  /**
   * Récupère le tempo depuis data-tempo
   */
  getTempo(exerciseElement) {
    const tempo = exerciseElement?.dataset?.tempo;
    if (tempo) {
      const parts = tempo.split('-').map(Number);
      return parts.length === 3 ? parts : [3, 1, 2];
    }
    return [3, 1, 2]; // Défaut
  }
}
