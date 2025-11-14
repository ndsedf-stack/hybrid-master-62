/**
 * TIMER MANAGER - ULTRA PRO VERSION FINALE CORRIGÉE
 * 4 cercles animés en countdown + barre tempo visuelle + récupération tempo
 */

export default class TimerManager {
  constructor() {
    this.timerInterval = null;
    this.totalTime = 0;
    this.remainingTime = 0;
    this.currentRep = 0;
    this.totalReps = 0;
    this.exerciseData = null;
    this.tempoPhaseIndex = 0;
    this.tempoPhaseTime = 0;
    this.tempoValues = [3, 1, 2]; // Valeurs par défaut
  }

  /**
   * Démarre le timer avec les données d'exercice
   */
  startTimer(exerciseData, currentRep, totalReps, duration) {
    this.exerciseData = exerciseData;
    this.currentRep = currentRep;
    this.totalReps = totalReps;
    this.totalTime = duration;
    this.remainingTime = duration;
    
    // Récupérer le tempo depuis exerciseData
    this.parseTempoFromExercise();
    
    // Afficher l'overlay
    this.showOverlay();
    
    // Initialiser l'interface
    this.updateInterface();
    
    // Démarrer le compte à rebours
    this.startCountdown();
  }

  /**
   * Parse le tempo depuis exerciseData.tempo
   * Format attendu : "3120" ou "3-1-2-0" → [descent, pause, lift]
   */
  parseTempoFromExercise() {
    if (!this.exerciseData || !this.exerciseData.tempo) {
      console.warn('⚠️ Tempo non trouvé, utilisation des valeurs par défaut');
      this.tempoValues = [3, 1, 2];
      return;
    }

    const tempo = this.exerciseData.tempo.toString();
    
    // Si format "3120" → extraire chaque chiffre
    if (/^\d{3,4}$/.test(tempo)) {
      this.tempoValues = [
        parseInt(tempo[0]) || 3, // descent
        parseInt(tempo[1]) || 1, // pause
        parseInt(tempo[2]) || 2  // lift
      ];
    }
    // Si format "3-1-2-0" → split et parser
    else if (tempo.includes('-')) {
      const parts = tempo.split('-').map(Number);
      this.tempoValues = [
        parts[0] || 3, // descent
        parts[1] || 1, // pause
        parts[2] || 2  // lift
      ];
    }
    // Format non reconnu → valeurs par défaut
    else {
      console.warn('⚠️ Format tempo non reconnu:', tempo);
      this.tempoValues = [3, 1, 2];
    }

    console.log('✅ Tempo récupéré:', this.tempoValues);
  }

  /**
   * Affiche l'overlay du timer
   */
  showOverlay() {
    const overlay = document.getElementById('timer-overlay-ultra-pro');
    if (!overlay) {
      console.error('❌ Overlay timer non trouvé');
      return;
    }

    // Construire le HTML de l'interface
    overlay.innerHTML = `
      <!-- GIF de l'exercice -->
      <img 
        src="${this.exerciseData.gif || 'assets/gifs/default.gif'}" 
        alt="${this.exerciseData.name}"
        class="timer-exercise-gif"
      />

      <!-- Compteur de répétitions -->
      <div class="timer-rep-counter">REP ${this.currentRep}/${this.totalReps}</div>

      <!-- Conteneur des 4 cercles -->
      <div class="timer-circles-container">
        <!-- Cercle 1 : Session (le plus grand - blanc) -->
        <svg class="timer-circle-svg" viewBox="0 0 320 320">
          <circle cx="160" cy="160" r="140" class="timer-circle-bg" />
          <circle cx="160" cy="160" r="140" class="timer-circle-progress timer-circle-session" id="circle-session" />
        </svg>

        <!-- Cercle 2 : Exercise (bleu) -->
        <svg class="timer-circle-svg" viewBox="0 0 320 320">
          <circle cx="160" cy="160" r="120" class="timer-circle-bg" />
          <circle cx="160" cy="160" r="120" class="timer-circle-progress timer-circle-exercise" id="circle-exercise" />
        </svg>

        <!-- Cercle 3 : Rest (orange) -->
        <svg class="timer-circle-svg" viewBox="0 0 320 320">
          <circle cx="160" cy="160" r="100" class="timer-circle-bg" />
          <circle cx="160" cy="160" r="100" class="timer-circle-progress timer-circle-rest" id="circle-rest" />
        </svg>

        <!-- Cercle 4 : Current Rep (vert - le plus petit) -->
        <svg class="timer-circle-svg" viewBox="0 0 320 320">
          <circle cx="160" cy="160" r="80" class="timer-circle-bg" />
          <circle cx="160" cy="160" r="80" class="timer-circle-progress timer-circle-current" id="circle-current" />
        </svg>

        <!-- Temps central -->
        <div class="timer-time-display">
          <div class="timer-time-value" id="timer-display">0:00</div>
          <div class="timer-time-label">REPOS</div>
        </div>
      </div>

      <!-- Barre tempo ultra visuelle -->
      <div class="timer-tempo-container">
        <div class="timer-tempo-title">TEMPO</div>
        
        <!-- Barre de progression -->
        <div class="timer-tempo-bar-container">
          <div class="timer-tempo-bar-fill phase-descent" id="tempo-bar"></div>
        </div>

        <!-- Labels des phases -->
        <div class="timer-tempo-phases">
          <div class="timer-tempo-phase descent active" id="tempo-descent">
            <div class="timer-tempo-phase-icon">⬇️</div>
            <div class="timer-tempo-phase-label">Descent</div>
            <div class="timer-tempo-phase-value">${this.tempoValues[0]}s</div>
          </div>
          <div class="timer-tempo-phase pause" id="tempo-pause">
            <div class="timer-tempo-phase-icon">⏸️</div>
            <div class="timer-tempo-phase-label">Pause</div>
            <div class="timer-tempo-phase-value">${this.tempoValues[1]}s</div>
          </div>
          <div class="timer-tempo-phase lift" id="tempo-lift">
            <div class="timer-tempo-phase-icon">⬆️</div>
            <div class="timer-tempo-phase-label">Lift</div>
            <div class="timer-tempo-phase-value">${this.tempoValues[2]}s</div>
          </div>
        </div>
      </div>

      <!-- Nom de l'exercice -->
      <div class="timer-exercise-name">${this.exerciseData.name}</div>

      <!-- Boutons de contrôle -->
      <div class="timer-controls">
        <button class="timer-btn timer-btn-pause" id="timer-pause-btn">Pause</button>
        <button class="timer-btn timer-btn-end" id="timer-end-btn">Terminer</button>
      </div>
    `;

    // Ajouter les événements
    this.attachEvents();

    // Afficher l'overlay
    overlay.classList.add('active');
  }

  /**
   * Attacher les événements aux boutons
   */
  attachEvents() {
    const pauseBtn = document.getElementById('timer-pause-btn');
    const endBtn = document.getElementById('timer-end-btn');

    if (pauseBtn) {
      pauseBtn.addEventListener('click', () => this.pauseTimer());
    }

    if (endBtn) {
      endBtn.addEventListener('click', () => this.stopTimer());
    }
  }

  /**
   * Démarre le compte à rebours
   */
  startCountdown() {
    this.timerInterval = setInterval(() => {
      this.remainingTime--;

      if (this.remainingTime <= 0) {
        this.stopTimer();
        return;
      }

      this.updateInterface();
    }, 1000);
  }

  /**
   * Met à jour toute l'interface
   */
  updateInterface() {
    this.updateTimeDisplay();
    this.updateCircles();
    this.updateTempoBar();
  }

  /**
   * Met à jour l'affichage du temps
   */
  updateTimeDisplay() {
    const display = document.getElementById('timer-display');
    if (!display) return;

    const minutes = Math.floor(this.remainingTime / 60);
    const seconds = this.remainingTime % 60;
    display.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  /**
   * Met à jour les 4 cercles - COUNTDOWN (se vident)
   */
  updateCircles() {
    // Progress en countdown : 1.0 (plein) → 0.0 (vide)
    const progress = this.remainingTime / this.totalTime;

    // Calcul du stroke-dashoffset pour countdown
    const circles = [
      { id: 'circle-session', radius: 140 },
      { id: 'circle-exercise', radius: 120 },
      { id: 'circle-rest', radius: 100 },
      { id: 'circle-current', radius: 80 }
    ];

    circles.forEach(({ id, radius }) => {
      const circle = document.getElementById(id);
      if (!circle) return;

      const circumference = 2 * Math.PI * radius;
      
      // Pour countdown : offset = circumference * (1 - progress)
      // Quand progress = 1 (début) → offset = 0 (cercle plein)
      // Quand progress = 0 (fin) → offset = circumference (cercle vide)
      const offset = circumference * (1 - progress);
      
      circle.style.strokeDasharray = circumference;
      circle.style.strokeDashoffset = offset;
    });
  }

  /**
   * Met à jour la barre tempo et les phases actives
   */
  updateTempoBar() {
    const totalTempo = this.tempoValues.reduce((a, b) => a + b, 0);
    const elapsedInRep = (this.totalTime - this.remainingTime) % totalTempo;

    let currentPhase = 0;
    let elapsedInPhase = elapsedInRep;

    // Déterminer la phase active
    for (let i = 0; i < this.tempoValues.length; i++) {
      if (elapsedInPhase < this.tempoValues[i]) {
        currentPhase = i;
        break;
      }
      elapsedInPhase -= this.tempoValues[i];
    }

    // Calculer la progression dans la phase actuelle
    const phaseProgress = (elapsedInPhase / this.tempoValues[currentPhase]) * 100;

    // Mettre à jour la barre
    const bar = document.getElementById('tempo-bar');
    if (bar) {
      bar.style.width = `${phaseProgress}%`;
      
      // Changer la classe selon la phase
      bar.className = 'timer-tempo-bar-fill';
      if (currentPhase === 0) bar.classList.add('phase-descent');
      else if (currentPhase === 1) bar.classList.add('phase-pause');
      else if (currentPhase === 2) bar.classList.add('phase-lift');
    }

    // Mettre à jour les labels actifs
    const phases = ['tempo-descent', 'tempo-pause', 'tempo-lift'];
    phases.forEach((id, index) => {
      const elem = document.getElementById(id);
      if (!elem) return;
      
      if (index === currentPhase) {
        elem.classList.add('active');
      } else {
        elem.classList.remove('active');
      }
    });
  }

  /**
   * Pause le timer
   */
  pauseTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
      
      const pauseBtn = document.getElementById('timer-pause-btn');
      if (pauseBtn) {
        pauseBtn.textContent = 'Reprendre';
        pauseBtn.onclick = () => this.resumeTimer();
      }
    }
  }

  /**
   * Reprend le timer
   */
  resumeTimer() {
    this.startCountdown();
    
    const pauseBtn = document.getElementById('timer-pause-btn');
    if (pauseBtn) {
      pauseBtn.textContent = 'Pause';
      pauseBtn.onclick = () => this.pauseTimer();
    }
  }

  /**
   * Arrête le timer
   */
  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    // Cacher l'overlay
    const overlay = document.getElementById('timer-overlay-ultra-pro');
    if (overlay) {
      overlay.classList.remove('active');
    }

    // Notifier que le timer est terminé
    this.onTimerComplete();
  }

  /**
   * Callback quand le timer est terminé
   */
  onTimerComplete() {
    console.log('✅ Timer terminé !');
    // Ici, on pourrait déclencher un événement pour marquer la série comme complétée
  }
}
