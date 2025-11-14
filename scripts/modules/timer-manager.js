export default class TimerManager {
  constructor() {
    this.timerInterval = null;
    this.totalTime = 0;
    this.remainingTime = 0;
    this.currentRep = 0;
    this.totalReps = 0;
    this.exerciseData = null;
    this.isPaused = false;
    this.tempo = null;
  }
  startTimer(exerciseData, currentRep, totalReps, duration) {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.exerciseData = exerciseData;
    this.currentRep = currentRep;
    this.totalReps = totalReps;
    this.totalTime = duration;
    this.remainingTime = duration;
    this.isPaused = false;
    this.showOverlay();
    this.parseTempoFromExercise();
    this.startCountdown();
  }
  parseTempoFromExercise() {
    if (!this.exerciseData || !this.exerciseData.tempo) {
      this.tempo = [3, 1, 2];
      return;
    }
    const tempoStr = this.exerciseData.tempo.toString();
    if (tempoStr.includes('-')) {
      const parts = tempoStr.split('-').map(Number);
      this.tempo = parts.length >= 3 ? [parts[0], parts[1], parts[2]] : [3, 1, 2];
    } else if (tempoStr.length >= 3) {
      this.tempo = [parseInt(tempoStr[0]) || 3, parseInt(tempoStr[1]) || 1, parseInt(tempoStr[2]) || 2];
    } else {
      this.tempo = [3, 1, 2];
    }
    console.log('✅ Tempo récupéré:', this.tempo);
  }
  showOverlay() {
    const overlay = document.getElementById('timer-overlay-ultra-pro');
    if (!overlay) return;
    overlay.innerHTML = `
      <img src="${this.exerciseData.gif || 'assets/gifs/default.svg'}" alt="${this.exerciseData.name}" class="timer-exercise-gif">
      <div class="timer-rep-counter">REP ${this.currentRep}/${this.totalReps}</div>
      <div class="timer-circles-container">
        <svg class="timer-circle-svg" viewBox="0 0 320 320">
          <circle cx="160" cy="160" r="140" class="timer-circle-bg"></circle>
          <circle cx="160" cy="160" r="140" class="timer-circle-progress timer-circle-session" id="circle-session"></circle>
        </svg>
        <svg class="timer-circle-svg" viewBox="0 0 320 320">
          <circle cx="160" cy="160" r="120" class="timer-circle-bg"></circle>
          <circle cx="160" cy="160" r="120" class="timer-circle-progress timer-circle-exercise" id="circle-exercise"></circle>
        </svg>
        <svg class="timer-circle-svg" viewBox="0 0 320 320">
          <circle cx="160" cy="160" r="100" class="timer-circle-bg"></circle>
          <circle cx="160" cy="160" r="100" class="timer-circle-progress timer-circle-rest" id="circle-rest"></circle>
        </svg>
        <svg class="timer-circle-svg" viewBox="0 0 320 320">
          <circle cx="160" cy="160" r="80" class="timer-circle-bg"></circle>
          <circle cx="160" cy="160" r="80" class="timer-circle-progress timer-circle-current" id="circle-current"></circle>
        </svg>
        <div class="timer-time-display">
          <div class="timer-time-value" id="timer-display">${this.formatTime(this.remainingTime)}</div>
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
            <div class="timer-tempo-phase-value">${this.tempo[0]}s</div>
          </div>
          <div class="timer-tempo-phase pause" id="tempo-pause">
            <div class="timer-tempo-phase-icon">⏸️</div>
            <div class="timer-tempo-phase-label">Pause</div>
            <div class="timer-tempo-phase-value">${this.tempo[1]}s</div>
          </div>
          <div class="timer-tempo-phase lift" id="tempo-lift">
            <div class="timer-tempo-phase-icon">⬆️</div>
            <div class="timer-tempo-phase-label">Lift</div>
            <div class="timer-tempo-phase-value">${this.tempo[2]}s</div>
          </div>
        </div>
      </div>
      <div class="timer-exercise-name">${this.exerciseData.name}</div>
      <div class="timer-controls">
        <button class="timer-btn timer-btn-pause" id="timer-pause-btn">Pause</button>
        <button class="timer-btn timer-btn-end" id="timer-end-btn">Terminer</button>
      </div>
    `;
    overlay.classList.add('active');
    document.getElementById('timer-pause-btn').addEventListener('click', () => this.togglePause());
    document.getElementById('timer-end-btn').addEventListener('click', () => this.endTimer());
  }
  startCountdown() {
    this.updateInterface();
    this.timerInterval = setInterval(() => {
      if (!this.isPaused) {
        this.remainingTime--;
        if (this.remainingTime <= 0) {
          this.endTimer();
          return;
        }
        this.updateInterface();
      }
    }, 1000);
  }
  updateInterface() {
    this.updateDisplay();
    this.updateCircles();
    this.updateTempoBar();
  }
  updateDisplay() {
    const display = document.getElementById('timer-display');
    if (display) display.textContent = this.formatTime(this.remainingTime);
  }
  updateCircles() {
    const totalSessionTime = this.totalTime * (this.totalReps || 1);
    const elapsedSessionTime = (this.currentRep - 1) * this.totalTime + (this.totalTime - this.remainingTime);
    const sessionProgress = Math.max(0, Math.min(1, elapsedSessionTime / totalSessionTime));
    const exerciseProgress = 1 - (this.remainingTime / this.totalTime);
    const restProgress = this.remainingTime / this.totalTime;
    const tempoProgress = this.getTempoProgress();
    const circles = [
      { id: 'circle-session', radius: 140, progress: sessionProgress },
      { id: 'circle-exercise', radius: 120, progress: exerciseProgress },
      { id: 'circle-rest', radius: 100, progress: restProgress },
      { id: 'circle-current', radius: 80, progress: tempoProgress }
    ];
    circles.forEach(({ id, radius, progress }) => {
      const circle = document.getElementById(id);
      if (!circle) return;
      const circumference = 2 * Math.PI * radius;
      const offset = circumference * (1 - progress);
      circle.style.strokeDasharray = circumference;
      circle.style.strokeDashoffset = offset;
    });
  }
  getTempoProgress() {
    if (!this.tempo || this.tempo.length !== 3) return 0;
    const [descent, pause, lift] = this.tempo;
    const totalTempo = descent + pause + lift;
    const tempoElapsed = this.totalTime - this.remainingTime;
    const tempoPosition = tempoElapsed % totalTempo;
    return tempoPosition / totalTempo;
  }
  updateTempoBar() {
    if (!this.tempo) return;
    const [descent, pause, lift] = this.tempo;
    const totalTempo = descent + pause + lift;
    const tempoElapsed = this.totalTime - this.remainingTime;
    const tempoPosition = tempoElapsed % totalTempo;
    let currentPhase = 'descent';
    let phaseProgress = 0;
    if (tempoPosition < descent) {
      currentPhase = 'descent';
      phaseProgress = tempoPosition / descent;
    } else if (tempoPosition < descent + pause) {
      currentPhase = 'pause';
      phaseProgress = (tempoPosition - descent) / pause;
    } else {
      currentPhase = 'lift';
      phaseProgress = (tempoPosition - descent - pause) / lift;
    }
    const tempoBar = document.getElementById('tempo-bar');
    if (tempoBar) {
      tempoBar.className = `timer-tempo-bar-fill phase-${currentPhase}`;
      tempoBar.style.width = `${phaseProgress * 100}%`;
    }
    ['descent', 'pause', 'lift'].forEach(phase => {
      const phaseEl = document.getElementById(`tempo-${phase}`);
      if (phaseEl) {
        phase === currentPhase ? phaseEl.classList.add('active') : phaseEl.classList.remove('active');
      }
    });
  }
  togglePause() {
    this.isPaused = !this.isPaused;
    const pauseBtn = document.getElementById('timer-pause-btn');
    if (pauseBtn) pauseBtn.textContent = this.isPaused ? 'Reprendre' : 'Pause';
  }
  endTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    const overlay = document.getElementById('timer-overlay-ultra-pro');
    if (overlay) {
      overlay.classList.remove('active');
      setTimeout(() => overlay.innerHTML = '', 300);
    }
    console.log('✅ Timer terminé !');
  }
  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}
