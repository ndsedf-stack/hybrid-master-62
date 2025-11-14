/**
 * TIMER MANAGER - VERSION CORRIGÉE
 * Cercle 1: Session avec segments colorés par exercice
 * Cercle 2: Progress des sets de l'exercice actuel (divisé en parts)
 * Cercle 3: Repos actuel (countdown)
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
    this.sessionExercises = [];
    this.currentExerciseIndex = 0;
    this.sessionTotalTime = 0;
    this.sessionElapsedTime = 0;
    this.colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE'];
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
      console.warn('⚠️ weekData introuvable');
      this.sessionExercises = [{
        name: this.exerciseData.name,
        sets: this.totalReps,
        rest: Math.floor(this.totalTime / 60),
        duration: this.totalTime * this.totalReps
      }];
      this.sessionTotalTime = this.totalTime * this.totalReps;
      this.sessionElapsedTime = (this.currentRep - 1) * this.totalTime;
      this.currentExerciseIndex = 0;
      return;
    }

    // ✅ FIX: Chercher dans dimanche, mardi, vendredi, maison
    const dayKeys = ['dimanche', 'mardi', 'vendredi', 'maison'];
    
    for (const dayKey of dayKeys) {
      const dayData = weekData[dayKey];
      if (dayData?.exercises && Array.isArray(dayData.exercises)) {
        this.sessionExercises = dayData.exercises.map(ex => ({
          name: ex.name,
          sets: parseInt(ex.sets) || 3,
          rest: parseInt(ex.rest) || 90,
          duration: (parseInt(ex.sets) || 3) * (parseInt(ex.rest) || 90)
        }));
        
        this.sessionTotalTime = this.sessionExercises.reduce((sum, ex) => sum + ex.duration, 0);
        
        const currentIndex = this.sessionExercises.findIndex(ex => ex.name === this.exerciseData.name);
        if (currentIndex >= 0) {
          this.currentExerciseIndex = currentIndex;
          this.sessionElapsedTime = this.sessionExercises
            .slice(0, currentIndex)
            .reduce((sum, ex) => sum + ex.duration, 0);
          this.sessionElapsedTime += (this.currentRep - 1) * this.totalTime;
          
          console.log('✅ Session calculée:', {
            exercises: this.sessionExercises.length,
            currentIndex: currentIndex,
            sessionTotal: this.sessionTotalTime,
            sessionElapsed: this.sessionElapsedTime
          });
          break;
        }
      }
    }

    if (this.sessionExercises.length === 0) {
      console.warn('⚠️ Aucun exercice trouvé, fallback');
      this.sessionExercises = [{
        name: this.exerciseData.name,
        sets: this.totalReps,
        rest: Math.floor(this.totalTime / 60),
        duration: this.totalTime * this.totalReps
      }];
      this.sessionTotalTime = this.totalTime * this.totalReps;
      this.sessionElapsedTime = (this.currentRep - 1) * this.totalTime;
      this.currentExerciseIndex = 0;
    }
  }

  parseTempoFromExercise() {
    if (!this.exerciseData?.tempo) {
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
      this.tempoValues = [parts[0] || 3, parts[1] || 1, parts[2] || 2];
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
        <!-- Cercle 1: Session avec segments colorés -->
        <svg class="timer-circle-svg" viewBox="0 0 320 320">
          <circle cx="160" cy="160" r="150" class="timer-circle-bg" />
          <g id="session-segments"></g>
        </svg>

        <!-- Cercle 2: Progress des sets (divisé en parts) -->
        <svg class="timer-circle-svg" viewBox="0 0 320 320">
          <circle cx="160" cy="160" r="130" class="timer-circle-bg" />
          <g id="sets-segments"></g>
        </svg>

        <!-- Cercle 3: Repos actuel (countdown) -->
        <svg class="timer-circle-svg" viewBox="0 0 320 320">
          <circle cx="160" cy="160" r="110" class="timer-circle-bg" />
          <circle cx="160" cy="160" r="110" class="timer-circle-progress timer-circle-rest" id="circle-rest" />
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

    this.drawColoredSegments();
    this.drawSetsSegments();
    this.attachEvents();
    overlay.classList.add('active');
  }

  drawColoredSegments() {
    const container = document.getElementById('session-segments');
    if (!container || this.sessionExercises.length === 0) {
      console.warn('⚠️ Impossible de dessiner les segments');
      return;
    }

    const radius = 150;
    const circumference = 2 * Math.PI * radius;
    let cumulativeAngle = 0;

    console.log('🎨 Dessin de', this.sessionExercises.length, 'segments');

    this.sessionExercises.forEach((ex, index) => {
      const percentage = ex.duration / this.sessionTotalTime;
      const arcLength = percentage * circumference;
      const dashArray = `${arcLength} ${circumference}`;
      const offset = -cumulativeAngle;

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', '160');
      circle.setAttribute('cy', '160');
      circle.setAttribute('r', radius);
      circle.setAttribute('fill', 'none');
      circle.setAttribute('stroke', this.colors[index % this.colors.length]);
      circle.setAttribute('stroke-width', '18');
      circle.setAttribute('stroke-dasharray', dashArray);
      circle.setAttribute('stroke-dashoffset', offset);
      circle.setAttribute('opacity', '0.8');
      circle.setAttribute('class', 'session-segment');
      circle.setAttribute('data-index', index);

      container.appendChild(circle);
      cumulativeAngle += arcLength;
    });

    console.log('✅ Segments créés:', container.children.length);
  }

  drawSetsSegments() {
    const container = document.getElementById('sets-segments');
    if (!container) return;

    const radius = 130;
    const circumference = 2 * Math.PI * radius;
    const arcPerSet = circumference / this.totalReps;

    for (let i = 0; i < this.totalReps; i++) {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', '160');
      circle.setAttribute('cy', '160');
      circle.setAttribute('r', radius);
      circle.setAttribute('fill', 'none');
      circle.setAttribute('stroke', '#4a9eff');
      circle.setAttribute('stroke-width', '18');
      circle.setAttribute('stroke-dasharray', `${arcPerSet} ${circumference}`);
      circle.setAttribute('stroke-dashoffset', -i * arcPerSet);
      circle.setAttribute('opacity', i < this.currentRep ? '0.8' : '0.2');
      circle.setAttribute('class', 'set-segment');
      circle.setAttribute('data-set', i + 1);

      container.appendChild(circle);
    }
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
    this.updateSessionSegments();
    this.updateSetsSegments();
    
    const restProgress = this.remainingTime / this.totalTime;
    this.updateCircle('circle-rest', 110, restProgress);
  }

  updateSessionSegments() {
    const segments = document.querySelectorAll('.session-segment');
    let cumulativeTime = 0;

    segments.forEach((seg, index) => {
      const exerciseDuration = this.sessionExercises[index].duration;
      const exerciseEndTime = cumulativeTime + exerciseDuration;

      if (this.sessionElapsedTime >= exerciseEndTime) {
        seg.setAttribute('opacity', '0.2');
      } else if (this.sessionElapsedTime >= cumulativeTime) {
        const progress = (this.sessionElapsedTime - cumulativeTime) / exerciseDuration;
        const opacity = 0.8 - (progress * 0.6);
        seg.setAttribute('opacity', opacity.toString());
      }

      cumulativeTime = exerciseEndTime;
    });
  }

  updateSetsSegments() {
    const segments = document.querySelectorAll('.set-segment');
    segments.forEach((seg, index) => {
      if (index + 1 < this.currentRep) {
        seg.setAttribute('opacity', '0.3');
      } else if (index + 1 === this.currentRep) {
        const progress = 1 - (this.remainingTime / this.totalTime);
        const opacity = 0.3 + (progress * 0.5);
        seg.setAttribute('opacity', opacity.toString());
      } else {
        seg.setAttribute('opacity', '0.1');
      }
    });
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
  }
}
