/**
 * TIMER MANAGER - 3 CERCLES SIMPLIFIÉ
 * Cercle 1: Session complète (se vide progressivement)
 * Cercle 2: Repos actuel (countdown)
 * Cercle 3: Set actuel (se remplit)
 */

export default class TimerManager {
  constructor() {
    this.timerInterval = null;
    this.totalTime = 0;
    this.remainingTime = 0;
    this.currentRep = 0;
    this.totalReps = 0;
    this.exerciseData = null;
    this.tempoValues = [3, 1, 2];
    this.sessionTotalTime = 0;
    this.sessionElapsedTime = 0;
  }

  startTimer(exerciseData, currentRep, totalReps, duration) {
    this.exerciseData = exerciseData;
    this.currentRep = currentRep;
    this.totalReps = totalReps;
    this.totalTime = duration;
    this.remainingTime = duration;
    
    this.calculateSessionData();
    this.parseTempoFromExercise();
    this.showOverlay();
    this.updateInterface();
    this.startCountdown();
  }

  calculateSessionData() {
    const weekData = window.programData?.program?.week1;
    if (!weekData) {
      this.sessionTotalTime = this.totalTime * this.totalReps;
      this.sessionElapsedTime = (this.currentRep - 1) * this.totalTime;
      return;
    }

    for (const [day, dayData] of Object.entries(weekData)) {
      if (dayData?.exercises) {
        const exercises = dayData.exercises;
        
        this.sessionTotalTime = exercises.reduce((sum, ex) => {
          return sum + (parseInt(ex.sets) || 3) * (parseInt(ex.rest) || 90);
        }, 0);
        
        const currentIndex = exercises.findIndex(ex => ex.name === this.exerciseData.name);
        if (currentIndex >= 0) {
          this.sessionElapsedTime = exercises
            .slice(0, currentIndex)
            .reduce((sum, ex) => sum + (parseInt(ex.sets) || 3) * (parseInt(ex.rest) || 90), 0);
          this.sessionElapsedTime += (this.currentRep - 1) * (parseInt(this.exerciseData.rest) || 90);
        }
        break;
      }
    }

    if (this.sessionTotalTime === 0) {
      this.sessionTotalTime = this.totalTime * this.totalReps;
      this.sessionElapsedTime = (this.currentRep - 1) * this.totalTime;
    }
  }

  parseTempoFromExercise() {
    if (!this.exerciseData || !this.exerciseData.tempo) {
      this.tempoValues = [3, 1, 2];
      return;
    }

    const tempo = this.exerciseData.tempo.toString();
    
    if (/^\d{3,4}$/.test(tempo)) {
      this.tempoValues = [
        parseInt(tempo[0]) || 3,
        parseInt(tempo[1]) || 1,
        parseInt(tempo[2]) || 2
      ];
    } else if (tempo.includes('-')) {
      const parts = tempo.split('-').map(Number);
      this.tempoValues = [
        parts[0] || 3,
        parts[1] || 1,
        parts[2] || 2
      ];
    } else {
      this.tempoValues = [3, 1, 2];
    }
  }

  showOverlay() {
    const overlay = document.getElementById('timer-overlay-ultra-pro');
    if (!overlay) return;

    overlay.innerHTML = `
      <div class="timer-rep-counter">REP ${this.currentRep}/${this.totalReps}</div>

      <div class="timer-circles-container">
        <!-- Cercle 1 : Session complète -->
        <svg class="timer-circle-svg" viewBox="0 0 320 320">
          <circle cx="160" cy="160" r="150" class="timer-circle-bg" />
          <circle cx="160" cy="160" r="150" class="timer-circle-progress timer-circle-session" id="circle-session" />
        </svg>

        <!-- Cercle 2 : Repos (countdown) -->
        <svg class="timer-circle-svg" viewBox="0 0 320 320">
          <circle cx="160" cy="160" r="130" class="timer-circle-bg" />
          <circle cx="160" cy="160" r="130" class="timer-circle-progress timer-circle-rest" id="circle-rest" />
        </svg>

        <!-- Cercle 3 : Set actuel (se remplit) -->
        <svg class="timer-circle-svg" viewBox="0 0 320 320">
          <circle cx="160" cy="160" r="110" class="timer-circle-bg" />
          <circle cx="160" cy="160" r="110" class="timer-circle-progress timer-circle-exercise" id="circle-exercise" />
        </svg>

        <div class="timer-time-display">
          <div class="timer-time-value" id="timer-display">0:00</div>
          <div class="timer-time-label">REPOS</div>
        </div>
      </div>

      <div class="timer-tempo-container">
        <div class="timer-tempo-title">TEMPO</div>
        <div class="timer-tempo-bar-container">
          <div class="timer-tempo-bar-fill phase-descent" id="tempo-bar"></div>
        </div>
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

      <div class="timer-exercise-name">${this.exerciseData.name}</div>

      <div class="timer-controls">
        <button class="timer-btn timer-btn-pause" id="timer-pause-btn">Pause</button>
        <button class="timer-btn timer-btn-end" id="timer-end-btn">Terminer</button>
      </div>
    `;

    this.attachEvents();
    overlay.classList.add('active');
  }

  attachEvents() {
    const pauseBtn = document.getElementById('timer-pause-btn');
    const endBtn = document.getElementById('timer-end-btn');
    if (pauseBtn) pauseBtn.addEventListener('click', () => this.pauseTimer());
    if (endBtn) endBtn.addEventListener('click', () => this.stopTimer());
  }

  startCountdown() {
    this.timerInterval = setInterval(() => {
      this.remainingTime--;
      this.sessionElapsedTime++;

      if (this.remainingTime <= 0) {
        this.stopTimer();
        return;
      }

      this.updateInterface();
    }, 1000);
  }

  updateInterface() {
    this.updateTimeDisplay();
    this.updateCircles();
    this.updateTempoBar();
  }

  updateTimeDisplay() {
    const display = document.getElementById('timer-display');
    if (!display) return;
    const minutes = Math.floor(this.remainingTime / 60);
    const seconds = this.remainingTime % 60;
    display.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  updateCircles() {
    // Cercle 1 : Session (se vide progressivement)
    const sessionProgress = this.sessionElapsedTime / this.sessionTotalTime;
    this.updateCircle('circle-session', 150, sessionProgress);

    // Cercle 2 : Repos (countdown)
    const restProgress = this.remainingTime / this.totalTime;
    this.updateCircle('circle-rest', 130, restProgress);

    // Cercle 3 : Set actuel (se remplit)
    const exerciseProgress = 1 - (this.remainingTime / this.totalTime);
    this.updateCircle('circle-exercise', 110, exerciseProgress);
  }

  updateCircle(id, radius, progress) {
    const circle = document.getElementById(id);
    if (!circle) return;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference * (1 - progress);
    circle.style.strokeDasharray = circumference;
    circle.style.strokeDashoffset = offset;
  }

  updateTempoBar() {
    const totalTempo = this.tempoValues.reduce((a, b) => a + b, 0);
    const elapsedInRep = (this.totalTime - this.remainingTime) % totalTempo;
    let currentPhase = 0;
    let elapsedInPhase = elapsedInRep;

    for (let i = 0; i < this.tempoValues.length; i++) {
      if (elapsedInPhase < this.tempoValues[i]) {
        currentPhase = i;
        break;
      }
      elapsedInPhase -= this.tempoValues[i];
    }

    const phaseProgress = (elapsedInPhase / this.tempoValues[currentPhase]) * 100;
    const bar = document.getElementById('tempo-bar');
    if (bar) {
      bar.style.width = `${phaseProgress}%`;
      bar.className = 'timer-tempo-bar-fill';
      if (currentPhase === 0) bar.classList.add('phase-descent');
      else if (currentPhase === 1) bar.classList.add('phase-pause');
      else if (currentPhase === 2) bar.classList.add('phase-lift');
    }

    const phases = ['tempo-descent', 'tempo-pause', 'tempo-lift'];
    phases.forEach((id, index) => {
      const elem = document.getElementById(id);
      if (elem) {
        index === currentPhase ? elem.classList.add('active') : elem.classList.remove('active');
      }
    });
  }

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

  resumeTimer() {
    this.startCountdown();
    const pauseBtn = document.getElementById('timer-pause-btn');
    if (pauseBtn) {
      pauseBtn.textContent = 'Pause';
      pauseBtn.onclick = () => this.pauseTimer();
    }
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    const overlay = document.getElementById('timer-overlay-ultra-pro');
    if (overlay) overlay.classList.remove('active');
    console.log('✅ Timer terminé !');
  }
}
