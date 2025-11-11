import ProgramData from '../program-data.js';

export default class WorkoutRenderer {
  constructor() {
    this.container = document.getElementById('workout-container');
    this.timerManager = null;
  }

  init() {
    if (!this.container) return;
    this.container.innerHTML = '';
  }

  setTimerManager(timerManager) {
    this.timerManager = timerManager;
  }

  render(workout, weekData) {
    if (!this.container || !workout) return;

    const workoutHTML = `
      <div class="workout-header">
        <h2 class="workout-title">${workout.name}</h2>
        ${workout.muscles ? `<p class="workout-muscles">${workout.muscles.join(', ')}</p>` : ''}
        <div class="workout-meta">
          <span class="workout-duration">⏱️ ${workout.duration || '60'} min</span>
          <span class="workout-sets">💪 ${workout.totalSets || workout.exercises?.length || 0} séries</span>
          ${weekData?.technique ? `<span class="workout-technique">🎯 ${weekData.technique}</span>` : ''}
          ${weekData?.rpeTarget ? `<span class="workout-rpe">📊 RPE ${weekData.rpeTarget}</span>` : ''}
        </div>
      </div>
      <div class="exercises-list"></div>
    `;

    this.container.innerHTML = workoutHTML;
    const exercisesList = this.container.querySelector('.exercises-list');

    if (!workout.exercises || workout.exercises.length === 0) {
      exercisesList.innerHTML = '<p class="no-exercises">Aucun exercice pour cette séance</p>';
      return;
    }

    workout.exercises.forEach((exercise, index) => {
      const exerciseCard = this.createExerciseCard(exercise, index);
      exercisesList.appendChild(exerciseCard);
    });
  }

  createExerciseCard(exercise, index) {
    const card = document.createElement('div');
    card.className = 'exercise-card';
    card.dataset.exerciseId = exercise.id;

    const headerHTML = `
      <div class="exercise-header">
        <div class="exercise-info">
          <h3 class="exercise-name">${exercise.name}</h3>
          ${exercise.muscle ? `<span class="exercise-muscle">${Array.isArray(exercise.muscle) ? exercise.muscle.join(', ') : exercise.muscle}</span>` : ''}
        </div>
        ${exercise.isSuperset ? `<span class="superset-badge">🔗 Superset</span>` : ''}
      </div>
    `;

    const detailsHTML = `
      <div class="exercise-details">
        <div class="exercise-param">
          <span class="param-label">Séries</span>
          <span class="param-value">${exercise.sets}</span>
        </div>
        <div class="exercise-param">
          <span class="param-label">Reps</span>
          <span class="param-value">${exercise.reps}</span>
        </div>
        <div class="exercise-param">
          <span class="param-label">Poids</span>
          <span class="param-value">${exercise.weight} kg</span>
        </div>
        <div class="exercise-param">
          <span class="param-label">Repos</span>
          <span class="param-value">${exercise.rest}s</span>
        </div>
        ${exercise.tempo ? `
          <div class="exercise-param">
            <span class="param-label">Tempo</span>
            <span class="param-value">${exercise.tempo}</span>
          </div>
        ` : ''}
        ${exercise.rpe ? `
          <div class="exercise-param">
            <span class="param-label">RPE</span>
            <span class="param-value">${exercise.rpe}</span>
          </div>
        ` : ''}
      </div>
    `;

    const notesHTML = exercise.notes ? `
      <div class="exercise-notes">
        <span class="notes-icon">💡</span>
        <p>${exercise.notes}</p>
      </div>
    ` : '';

    const seriesHTML = this.createSeriesSection(exercise);

    card.innerHTML = headerHTML + detailsHTML + notesHTML + seriesHTML;

    return card;
  }

  createSeriesSection(exercise) {
    const seriesContainer = document.createElement('div');
    seriesContainer.className = 'series-container';

    const numberOfSets = typeof exercise.sets === 'number' ? exercise.sets : 1;

    for (let i = 0; i < numberOfSets; i++) {
      const serieItem = document.createElement('div');
      serieItem.className = 'serie-item';
      serieItem.dataset.setNumber = i + 1;

      const repsDisplay = typeof exercise.reps === 'string' ? exercise.reps : `${exercise.reps}`;
      const defaultRest = exercise.rest || 90;

      serieItem.innerHTML = `
        <div class="serie-number">${i + 1}</div>
        <div class="serie-info">
          <div class="serie-reps">${repsDisplay} reps</div>
          <div class="serie-weight">${exercise.weight} kg</div>
        </div>
        <div class="serie-rest">
          <span class="rest-icon">⏱️</span>
          <span class="rest-time">${defaultRest}s</span>
        </div>
        <button type="button" class="serie-check" data-exercise-id="${exercise.id}" data-set-number="${i + 1}" aria-label="Marquer série ${i + 1} comme complétée">
          <span class="check-icon">✓</span>
        </button>
      `;

      const checkButton = serieItem.querySelector('.serie-check');
      checkButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.handleSetCompletion(e.currentTarget, exercise, defaultRest);
      });

      seriesContainer.appendChild(serieItem);
    }

    return seriesContainer.outerHTML;
  }

  handleSetCompletion(button, exercise, restTime) {
    const serieItem = button.closest('.serie-item');
    const isCompleted = button.classList.contains('checked');

    if (!isCompleted) {
      button.classList.add('checked');
      serieItem.classList.add('completed');
      
      if (this.timerManager) {
        this.timerManager.start(restTime, exercise.name, button.dataset.setNumber);
      }
    } else {
      button.classList.remove('checked');
      serieItem.classList.remove('completed');
      
      if (this.timerManager) {
        this.timerManager.stop();
      }
    }
  }

  renderSupersets(weekNumber, dayName) {
    const workout = ProgramData.getWorkout(weekNumber, dayName);
    if (!workout || !workout.exercises) return;

    const supersets = this.findSupersets(workout.exercises);
    
    supersets.forEach(superset => {
      const card1 = this.container.querySelector(`[data-exercise-id="${superset.exercise1.id}"]`);
      const card2 = this.container.querySelector(`[data-exercise-id="${superset.exercise2.id}"]`);
      
      if (card1 && card2) {
        card1.classList.add('superset-first');
        card2.classList.add('superset-second');
      }
    });
  }

  findSupersets(exercises) {
    const supersets = [];
    const processed = new Set();

    exercises.forEach(exercise => {
      if (exercise.isSuperset && !processed.has(exercise.id)) {
        const partner = exercises.find(ex => 
          ex.supersetWith === exercise.name || 
          exercise.supersetWith === ex.name
        );
        
        if (partner) {
          supersets.push({
            exercise1: exercise,
            exercise2: partner
          });
          processed.add(exercise.id);
          processed.add(partner.id);
        }
      }
    });

    return supersets;
  }

  renderEmpty(dayName) {
    if (!this.container) return;
    this.container.innerHTML = `
      <div class="empty-workout">
        <h2>Aucune séance programmée</h2>
        <p>Pas d'entraînement prévu pour ${dayName}</p>
      </div>
    `;
  }
}
