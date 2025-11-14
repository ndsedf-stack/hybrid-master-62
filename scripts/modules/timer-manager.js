/**
 * TIMER MANAGER - VERSION ULTIME
 * ✅ Superset (A1/A2)
 * ✅ Tempo dynamique par exercice
 * ✅ Repos variable
 * ✅ Techniques d'intensification (Dropset, Rest-Pause, Cluster)
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
    this.colors = ['#00D9FF', '#FF2E63', '#08FFC8', '#FFDE59', '#9D4EDD', '#06FFA5', '#FF6B9D'];
    
    // Nouveaux paramètres
    this.isSupersetA1 = false;
    this.isSupersetA2 = false;
    this.supersetPartner = null;
    this.intensificationTechnique = null;
    this.dropsetStep = 0;
    this.restPauseStep = 0;
    this.clusterRep = 0;
  }

  startTimer(exerciseData, currentRep, totalReps, duration) {
    console.log('🚀 START TIMER ULTIMATE:', {exerciseData, currentRep, totalReps, duration});
    
    // Récupérer les données complètes depuis programData
    this.exerciseData = this.getCompleteExerciseData(exerciseData.name) || exerciseData;
    this.currentRep = currentRep;
    this.totalReps = totalReps;
    
    console.log('📋 Exercice complet:', this.exerciseData);
    
    // Détection superset
    this.detectSuperset();
    
    // Détection technique d'intensification
    this.detectIntensification();
    
    // Tempo dynamique depuis programData
    this.parseTempoFromExercise();
    
    // Repos variable depuis programData
    this.totalTime = this.getRestDuration();
    this.remainingTime = this.totalTime;
    
    console.log('⚙️ Config:', {
      superset: this.isSupersetA1 || this.isSupersetA2,
      technique: this.intensificationTechnique,
      tempo: this.tempoValues,
      repos: this.totalTime
    });
    
    this.calculateSessionData();
    this.showOverlay();
    this.updateInterface();
    this.startCountdown();
  }

  getCompleteExerciseData(exerciseName) {
    const weekData = window.programData?.program?.week1;
    if (!weekData) return null;

    const dayKeys = ['dimanche', 'mardi', 'vendredi', 'maison'];
    
    for (const dayKey of dayKeys) {
      const dayData = weekData[dayKey];
      if (dayData?.exercises) {
        const exercise = dayData.exercises.find(ex => ex.name === exerciseName);
        if (exercise) {
          console.log('✅ Données complètes trouvées:', exercise);
          return exercise;
        }
      }
    }
    
    console.warn('⚠️ Exercice non trouvé dans programData');
    return null;
  }

  detectSuperset() {
    const name = this.exerciseData.name.toUpperCase();
    this.isSupersetA1 = name.includes('A1') || name.startsWith('A1');
    this.isSupersetA2 = name.includes('A2') || name.startsWith('A2');
    
    if (this.isSupersetA1 || this.isSupersetA2) {
      console.log('🔗 SUPERSET détecté:', this.isSupersetA1 ? 'A1' : 'A2');
    }
  }

  detectIntensification() {
    const technique = this.exerciseData.technique?.toLowerCase() || '';
    
    if (technique.includes('dropset') || technique.includes('drop set')) {
      this.intensificationTechnique = 'dropset';
      console.log('💪 DROPSET détecté');
    } else if (technique.includes('rest-pause') || technique.includes('rest pause')) {
      this.intensificationTechnique = 'restpause';
      console.log('⏸️ REST-PAUSE détecté');
    } else if (technique.includes('cluster')) {
      this.intensificationTechnique = 'cluster';
      console.log('🎯 CLUSTER détecté');
    }
  }

  getRestDuration() {
    // Si superset A1, pas de repos (on passe direct à A2)
    if (this.isSupersetA1) {
      return 5; // 5s de transition
    }
    
    // Si technique d'intensification
    if (this.intensificationTechnique === 'restpause') {
      return 15; // 15s entre mini-sets
    }
    if (this.intensificationTechnique === 'cluster') {
      return 20; // 20s entre clusters
    }
    if (this.intensificationTechnique === 'dropset') {
      return 10; // 10s pour changer le poids
    }
    
    // Sinon, repos depuis programData
    return parseInt(this.exerciseData.rest) || 90;
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
    
    console.log('🎵 Tempo:', this.tempoValues);
  }

  calculateSessionData() {
    const weekData = window.programData?.program?.week1;
    if (!weekData) {
      this.fallbackSessionData();
      return;
    }

    const dayKeys = ['dimanche', 'mardi', 'vendredi', 'maison'];
    let found = false;
    
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
          
          found = true;
          break;
        }
      }
    }

    if (!found) {
      this.fallbackSessionData();
    }
  }

  fallbackSessionData() {
    this.sessionExercises = [{
      name: this.exerciseData.name,
      sets: this.totalReps,
      rest: this.totalTime,
      duration: this.totalTime * this.totalReps
    }];
    this.sessionTotalTime = this.totalTime * this.totalReps;
    this.sessionElapsedTime = (this.currentRep - 1) * this.totalTime;
    this.currentExerciseIndex = 0;
  }

  showOverlay() {
    const overlay = document.getElementById('timer-overlay-ultra-pro');
    if (!overlay) return;

    // Label dynamique selon superset ou technique
    let repLabel = `SET ${this.currentRep}/${this.totalReps}`;
    if (this.isSupersetA1) repLabel = `A1 - SET ${this.currentRep}/${this.totalReps}`;
    if (this.isSupersetA2) repLabel = `A2 - SET ${this.currentRep}/${this.totalReps}`;
    if (this.intensificationTechnique === 'dropset') repLabel = `DROPSET ${this.currentRep}/${this.totalReps}`;
    if (this.intensificationTechnique === 'restpause') repLabel = `REST-PAUSE ${this.currentRep}/${this.totalReps}`;
    if (this.intensificationTechnique === 'cluster') repLabel = `CLUSTER ${this.currentRep}/${this.totalReps}`;

    overlay.innerHTML = `
      <div class="timer-rep-counter">${repLabel}</div>

      <div class="timer-circles-container">
        <svg class="timer-circle-svg timer-circle-1" viewBox="0 0 320 320">
          <circle cx="160" cy="160" r="150" class="timer-circle-bg" />
          <g id="session-segments"></g>
        </svg>

        <svg class="timer-circle-svg timer-circle-2" viewBox="0 0 320 320">
          <circle cx="160" cy="160" r="130" class="timer-circle-bg" />
          <g id="sets-segments"></g>
        </svg>

        <svg class="timer-circle-svg timer-circle-3" viewBox="0 0 320 320">
          <circle cx="160" cy="160" r="110" class="timer-circle-bg" />
          <circle cx="160" cy="160" r="110" class="timer-circle-progress timer-circle-rest" id="circle-rest" />
        </svg>

        <div class="timer-time-display">
          <div class="timer-time-value" id="timer-display">0:00</div>
          <div class="timer-time-label">${this.getTimerLabel()}</div>
        </div>
      </div>

      <div class="timer-tempo-visual">
        <div class="tempo-phase-card descent" id="tempo-card-descent">
          <div class="tempo-phase-number">${this.tempoValues[0]}</div>
          <div class="tempo-phase-icon">↓</div>
          <div class="tempo-phase-name">DESCENT</div>
        </div>
        <div class="tempo-phase-card pause" id="tempo-card-pause">
          <div class="tempo-phase-number">${this.tempoValues[1]}</div>
          <div class="tempo-phase-icon">■</div>
          <div class="tempo-phase-name">PAUSE</div>
        </div>
        <div class="tempo-phase-card lift" id="tempo-card-lift">
          <div class="tempo-phase-number">${this.tempoValues[2]}</div>
          <div class="tempo-phase-icon">↑</div>
          <div class="tempo-phase-name">LIFT</div>
        </div>
      </div>

      <div class="timer-exercise-name">${this.exerciseData.name}</div>

      <div class="timer-controls">
        <button class="timer-btn timer-btn-pause" id="timer-pause-btn">PAUSE</button>
        <button class="timer-btn timer-btn-end" id="timer-end-btn">TERMINER</button>
      </div>
    `;

    this.drawColoredSegments();
    this.drawSetsSegments();
    this.attachEvents();
    overlay.classList.add('active');
  }

  getTimerLabel() {
    if (this.isSupersetA1) return 'TRANSITION → A2';
    if (this.intensificationTechnique === 'dropset') return 'CHANGER POIDS';
    if (this.intensificationTechnique === 'restpause') return 'REST-PAUSE';
    if (this.intensificationTechnique === 'cluster') return 'CLUSTER REST';
    return 'REPOS';
  }

  drawColoredSegments() {
    const container = document.getElementById('session-segments');
    if (!container || this.sessionExercises.length === 0) return;

    const radius = 150;
    const circumference = 2 * Math.PI * radius;
    let cumulativeAngle = 0;

    this.sessionExercises.forEach((ex, index) => {
      const percentage = ex.duration / this.sessionTotalTime;
      const arcLength = percentage * circumference;

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', '160');
      circle.setAttribute('cy', '160');
      circle.setAttribute('r', '150');
      circle.setAttribute('fill', 'none');
      circle.setAttribute('stroke', this.colors[index % this.colors.length]);
      circle.setAttribute('stroke-width', '18');
      circle.setAttribute('stroke-linecap', 'round');
      circle.setAttribute('stroke-dasharray', `${arcLength} ${circumference - arcLength}`);
      circle.setAttribute('stroke-dashoffset', `${-cumulativeAngle}`);
      circle.setAttribute('opacity', '1.0');
      circle.classList.add('session-segment');
      circle.dataset.index = index;

      container.appendChild(circle);
      cumulativeAngle += arcLength;
    });
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
      circle.setAttribute('r', '130');
      circle.setAttribute('fill', 'none');
      circle.setAttribute('stroke', '#00D9FF');
      circle.setAttribute('stroke-width', '18');
      circle.setAttribute('stroke-linecap', 'round');
      circle.setAttribute('stroke-dasharray', `${arcPerSet - 10} ${circumference - arcPerSet + 10}`);
      circle.setAttribute('stroke-dashoffset', `${-i * arcPerSet}`);
      circle.setAttribute('opacity', i < this.currentRep ? '0.8' : '0.2');
      circle.classList.add('set-segment');
      circle.dataset.set = i + 1;

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
        this.handleTimerComplete();
        return;
      }

      this.updateInterface();
    }, 1000);
  }

  handleTimerComplete() {
    console.log('✅ Timer terminé');
    
    // Si superset A1, notifier pour passer à A2
    if (this.isSupersetA1) {
      console.log('🔗 Fin A1 → Passer à A2');
    }
    
    this.stopTimer();
  }

  updateInterface() {
    this.updateTimeDisplay();
    this.updateCircles();
    this.updateTempoCards();
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
        seg.setAttribute('opacity', '0.15');
        seg.setAttribute('stroke-width', '12');
      } else if (this.sessionElapsedTime >= cumulativeTime) {
        const progress = (this.sessionElapsedTime - cumulativeTime) / exerciseDuration;
        const opacity = 1.0 - (progress * 0.8);
        seg.setAttribute('opacity', opacity.toString());
        seg.setAttribute('stroke-width', '18');
      } else {
        seg.setAttribute('opacity', '1.0');
        seg.setAttribute('stroke-width', '18');
      }

      cumulativeTime = exerciseEndTime;
    });
  }

  updateSetsSegments() {
    const segments = document.querySelectorAll('.set-segment');
    segments.forEach((seg, index) => {
      if (index + 1 < this.currentRep) {
        seg.setAttribute('opacity', '0.4');
      } else if (index + 1 === this.currentRep) {
        const progress = 1 - (this.remainingTime / this.totalTime);
        const opacity = 0.4 + (progress * 0.6);
        seg.setAttribute('opacity', opacity.toString());
      } else {
        seg.setAttribute('opacity', '0.15');
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

  updateTempoCards() {
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

    const cards = ['tempo-card-descent', 'tempo-card-pause', 'tempo-card-lift'];
    cards.forEach((id, index) => {
      const card = document.getElementById(id);
      if (card) {
        if (index === currentPhase) {
          card.classList.add('active');
        } else {
          card.classList.remove('active');
        }
      }
    });
  }

  pauseTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
      const pauseBtn = document.getElementById('timer-pause-btn');
      if (pauseBtn) {
        pauseBtn.textContent = 'REPRENDRE';
        pauseBtn.onclick = () => this.resumeTimer();
      }
    }
  }

  resumeTimer() {
    this.startCountdown();
    const pauseBtn = document.getElementById('timer-pause-btn');
    if (pauseBtn) {
      pauseBtn.textContent = 'PAUSE';
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
