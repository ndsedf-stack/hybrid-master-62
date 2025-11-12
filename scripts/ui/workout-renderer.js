/**
 * WORKOUT RENDERER - Affichage des séances d'entraînement
 */

export default class WorkoutRenderer {
  constructor() {
    this.timerManager = null;
    this.currentWorkout = null;
  }

  init() {
    console.log('✅ WorkoutRenderer initialisé');
  }

  setTimerManager(timerManager) {
    this.timerManager = timerManager;
    console.log('✅ TimerManager connecté au renderer');
  }

  renderWorkout(container, dayData, week, day) {
    if (!container) {
      console.error('❌ Container invalide');
      return;
    }

    this.currentWorkout = { week, day, data: dayData };

    // Générer le HTML
    const html = `
      <div class="workout-header">
        <h2 class="workout-title">${dayData.location.toUpperCase()}</h2>
        <div class="workout-meta">
          <span class="workout-week">Semaine ${week}</span>
          <span class="workout-day">${day.charAt(0).toUpperCase() + day.slice(1)}</span>
        </div>
      </div>
      
      <div class="workout-content">
        ${dayData.exercises.map((exercise, index) => this.createExerciseCard(exercise, index)).join('')}
      </div>
    `;

    container.innerHTML = html;

    // ✅ ATTACHER LES EVENT LISTENERS APRÈS L'INSERTION DU HTML
    this.attachEventListeners(container, dayData);
  }

  createExerciseCard(exercise, index) {
    const hasRest = exercise.rest && exercise.rest > 0;
    
    return `
      <div class="exercise-card" data-exercise-index="${index}">
        <div class="exercise-header">
          <h3 class="exercise-name">${exercise.name}</h3>
          <span class="exercise-number">#${index + 1}</span>
        </div>
        
        <div class="exercise-details">
          <div class="detail-item">
            <span class="detail-label">Séries</span>
            <span class="detail-value">${exercise.sets}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Répétitions</span>
            <span class="detail-value">${exercise.reps}</span>
          </div>
          ${exercise.weight ? `
            <div class="detail-item">
              <span class="detail-label">Poids</span>
              <span class="detail-value">${exercise.weight}kg</span>
            </div>
          ` : ''}
          ${hasRest ? `
            <div class="detail-item">
              <span class="detail-label">Repos</span>
              <span class="detail-value">${exercise.rest}s</span>
            </div>
          ` : ''}
        </div>

        ${exercise.notes ? `
          <div class="exercise-notes">
            <span class="notes-icon">💡</span>
            <span>${exercise.notes}</span>
          </div>
        ` : ''}

        <div class="series-section">
          ${this.createSeriesSection(exercise, index)}
        </div>
      </div>
    `;
  }

  createSeriesSection(exercise, exerciseIndex) {
    const series = [];
    for (let i = 0; i < exercise.sets; i++) {
      series.push(`
        <div class="serie-item" data-exercise-index="${exerciseIndex}" data-set-index="${i}">
          <span class="serie-number">Série ${i + 1}</span>
          <div class="serie-info">
            <span class="serie-detail">${exercise.reps} reps</span>
            ${exercise.weight ? `<span class="serie-detail">${exercise.weight}kg</span>` : ''}
          </div>
          <button type="button" 
                  class="serie-check" 
                  data-exercise-index="${exerciseIndex}"
                  data-set-index="${i}"
                  data-rest-time="${exercise.rest || 0}"
                  data-exercise-name="${exercise.name}"
                  aria-label="Valider la série ${i + 1}">
            <span class="check-icon">✓</span>
          </button>
        </div>
      `);
    }
    return series.join('');
  }

  /**
   * ✅ FONCTION CRITIQUE : Attache les event listeners APRÈS l'insertion HTML
   */
  attachEventListeners(container, dayData) {
    console.log('🔗 Attachement des event listeners...');
    
    // Récupérer TOUS les boutons .serie-check
    const buttons = container.querySelectorAll('.serie-check');
    console.log(`📍 ${buttons.length} boutons trouvés`);

    buttons.forEach((button, index) => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        console.log(`✅ Clic sur bouton série ${index + 1}`);
        this.handleSetCompletion(button, dayData);
      });
    });

    console.log('✅ Event listeners attachés');
  }

  /**
   * Gère la validation d'une série
   */
  handleSetCompletion(button, dayData) {
    console.log('🎯 handleSetCompletion appelé');
    
    // Vérifier que le timer est connecté
    if (!this.timerManager) {
      console.error('❌ TimerManager est null !');
      alert('⚠️ Timer non initialisé. Rechargez la page.');
      return;
    }

    // Récupérer les données du bouton
    const exerciseIndex = parseInt(button.dataset.exerciseIndex);
    const setIndex = parseInt(button.dataset.setIndex);
    const restTime = parseInt(button.dataset.restTime) || 0;
    const exerciseName = button.dataset.exerciseName;

    console.log(`📊 Données:`, { exerciseIndex, setIndex, restTime, exerciseName });

    // Marquer comme complété
    const serieItem = button.closest('.serie-item');
    if (serieItem) {
      serieItem.classList.add('completed');
      button.classList.add('checked');
      button.disabled = true;
    }

    // Démarrer le timer si repos > 0
    if (restTime > 0) {
      console.log(`⏱️ Démarrage du timer: ${restTime}s pour ${exerciseName}`);
      this.timerManager.start(restTime, exerciseName, setIndex + 1);
    } else {
      console.log('ℹ️ Pas de repos pour cet exercice');
    }

    // Sauvegarder la progression
    this.saveProgress(exerciseIndex, setIndex);
  }

  /**
   * Sauvegarde la progression
   */
  saveProgress(exerciseIndex, setIndex) {
    if (!this.currentWorkout) return;

    const key = `workout_${this.currentWorkout.week}_${this.currentWorkout.day}_${exerciseIndex}_${setIndex}`;
    localStorage.setItem(key, 'completed');
    console.log(`💾 Progression sauvegardée: ${key}`);
  }

  /**
   * Charge la progression sauvegardée
   */
  loadProgress(container) {
    if (!this.currentWorkout) return;

    const buttons = container.querySelectorAll('.serie-check');
    buttons.forEach(button => {
      const exerciseIndex = button.dataset.exerciseIndex;
      const setIndex = button.dataset.setIndex;
      const key = `workout_${this.currentWorkout.week}_${this.currentWorkout.day}_${exerciseIndex}_${setIndex}`;
      
      if (localStorage.getItem(key) === 'completed') {
        const serieItem = button.closest('.serie-item');
        if (serieItem) {
          serieItem.classList.add('completed');
          button.classList.add('checked');
          button.disabled = true;
        }
      }
    });
  }
}
