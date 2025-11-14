/**
 * TIMER MANAGER - VERSION DEBUG ULTIME
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
  }

  startTimer(exerciseData, currentRep, totalReps, duration) {
    console.log('🚀 START TIMER:', {exerciseData, currentRep, totalReps, duration});
    
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
    console.log('📊 CALCUL SESSION DATA');
    
    const weekData = window.programData?.program?.week1;
    console.log('Week data:', weekData);
    
    if (!weekData) {
      console.error('❌ PAS DE WEEK DATA !');
      this.fallbackSessionData();
      return;
    }

    const dayKeys = ['dimanche', 'mardi', 'vendredi', 'maison'];
    let found = false;
    
    for (const dayKey of dayKeys) {
      const dayData = weekData[dayKey];
      console.log(`Checking ${dayKey}:`, dayData);
      
      if (dayData?.exercises && Array.isArray(dayData.exercises)) {
        console.log(`✅ Exercices trouvés dans ${dayKey}:`, dayData.exercises.length);
        
        this.sessionExercises = dayData.exercises.map(ex => ({
          name: ex.name,
          sets: parseInt(ex.sets) || 3,
          rest: parseInt(ex.rest) || 90,
          duration: (parseInt(ex.sets) || 3) * (parseInt(ex.rest) || 90)
        }));
        
        console.log('Session exercises:', this.sessionExercises);
        
        this.sessionTotalTime = this.sessionExercises.reduce((sum, ex) => sum + ex.duration, 0);
        
        const currentIndex = this.sessionExercises.findIndex(ex => ex.name === this.exerciseData.name);
        console.log('Current exercise index:', currentIndex);
        
        if (currentIndex >= 0) {
          this.currentExerciseIndex = currentIndex;
          this.sessionElapsedTime = this.sessionExercises
            .slice(0, currentIndex)
            .reduce((sum, ex) => sum + ex.duration, 0);
          this.sessionElapsedTime += (this.currentRep - 1) * this.totalTime;
          
          console.log('✅ SESSION CALCULÉE:', {
            exercises: this.sessionExercises.length,
            currentIndex,
            sessionTotal: this.sessionTotalTime,
            sessionElapsed: this.sessionElapsedTime
          });
          
          found = true;
          break;
        }
      }
    }

    if (!found) {
      console.warn('⚠️ Exercice non trouvé, fallback');
      this.fallbackSessionData();
    }
  }

  fallbackSessionData() {
    console.log('🔄 FALLBACK SESSION DATA');
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
      <div class="timer-rep-counter">SET ${this.currentRep}/${this.totalReps}</div>

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
          <div class="timer-time-label">REPOS</div>
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

  drawColoredSegments() {
    const container = document.getElementById('session-segments');
    if (!container) {
      console.error('❌ Container session-segments introuvable !');
      return;
    }

    if (this.sessionExercises.length === 0) {
      console.error('❌ Aucun exercice dans sessionExercises !');
      return;
    }

    console.log('🎨 DESSIN SEGMENTS:', this.sessionExercises.length);

    const radius = 150;
    const circumference = 2 * Math.PI * radius;
    let cumulativeAngle = 0;

    this.sessionExercises.forEach((ex, index) => {
      const percentage = ex.duration / this.sessionTotalTime;
      const arcLength = percentage * circumference;
      
      console.log(`Segment ${index}:`, {
        name: ex.name,
        percentage: (percentage * 100).toFixed(1) + '%',
        arcLength: arcLength.toFixed(2),
        color: this.colors[index % this.colors.length]
      });

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
      circle.setAttribute('opacity', '0.9');
      circle.classList.add('session-segment');
      circle.dataset.index = index;

      container.appendChild(circle);
      cumulativeAngle += arcLength;
    });

    console.log('✅ SEGMENTS CRÉÉS:', container.children.length);
    
    setTimeout(() => {
      const segments = document.querySelectorAll('.session-segment');
      console.log('Segments dans le DOM:', segments.length);
      segments.forEach((seg, i) => {
        console.log(`Segment ${i} visible:`, {
          stroke: seg.getAttribute('stroke'),
          opacity: seg.getAttribute('opacity'),
          dasharray: seg.getAttribute('stroke-dasharray')
        });
      });
    }, 100);
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

    console.log('✅ SETS SEGMENTS CRÉÉS:', this.totalReps);
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
        seg.setAttribute('opacity', '0.3');
      } else if (this.sessionElapsedTime >= cumulativeTime) {
        const progress = (this.sessionElapsedTime - cumulativeTime) / exerciseDuration;
        const opacity = 0.9 - (progress * 0.6);
        seg.setAttribute('opacity', opacity.toString());
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
