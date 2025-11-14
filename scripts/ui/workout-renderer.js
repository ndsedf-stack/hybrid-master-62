// ==================================================================
// WORKOUT RENDERER - AVEC SUPERSETS PROFESSIONNELS
// ==================================================================

export class WorkoutRenderer {
    constructor(container, onBack) {
        this.container = container;
        this.onBack = onBack;
        this.timerManager = null;
    }

    connectTimerManager(timerManager) {
        this.timerManager = timerManager;
        console.log('✅ TimerManager connecté au WorkoutRenderer');
    }

    setTimerManager(timerManager) {
        this.connectTimerManager(timerManager);
    }

    render(dayData, weekNumber) {
        console.log('🎨 Rendu séance:', dayData && dayData.day, dayData && dayData.block, weekNumber);
        
        if (!dayData) {
            this.container.innerHTML = '<div class="error">Aucune donnée disponible</div>';
            return;
        }

        const html = `
            <div class="workout-header">
                <button class="back-button" id="backButton">← Retour</button>
                <div class="workout-title">
                    <h2>${dayData.day}</h2>
                    <span class="workout-subtitle">${dayData.block} - Semaine ${weekNumber}</span>
                </div>
            </div>
            <div class="exercises-container">
                ${this.renderExercises(dayData.exercises, weekNumber)}
            </div>
        `;

        this.container.innerHTML = html;
        document.getElementById('backButton').addEventListener('click', this.onBack);
        this.attachEventListeners(weekNumber);
    }

    renderExercises(exercises, weekNumber) {
        if (!exercises || exercises.length === 0) {
            return '<p class="no-exercises">Aucun exercice pour cette séance</p>';
        }

        let html = '';
        let i = 0;

        while (i < exercises.length) {
            const exercise = exercises[i];

            // Vérifier si c'est un superset
            if (exercise.superset && i + 1 < exercises.length) {
                const nextExercise = exercises[i + 1];
                html += this.renderSuperset(exercise, nextExercise, exercise.rest, weekNumber);
                i += 2;
            } else {
                html += this.renderExerciseContent(exercise, weekNumber);
                i++;
            }
        }

        return html;
    }

    renderSuperset(exercise1, exercise2, restTime, weekNumber) {
        const state1 = this.loadExerciseState(`workout_${weekNumber}_${exercise1.name}`);
        const state2 = this.loadExerciseState(`workout_${weekNumber}_${exercise2.name}`);

        return `
            <div class="superset-container">
                <div class="superset-badge">SUPERSET</div>
                
                <div class="exercise-block-modern is-superset-first" data-exercise="${exercise1.name}">
                    <div class="exercise-header">
                        <h3>${exercise1.name}</h3>
                    </div>
                    <div class="exercise-specs-modern">
                        <div class="spec-item">
                            <span class="spec-label">Séries</span>
                            <span class="spec-value">${exercise1.sets}</span>
                        </div>
                        <div class="spec-item">
                            <span class="spec-label">Reps</span>
                            <span class="spec-value">${exercise1.reps}</span>
                        </div>
                        <div class="spec-item">
                            <span class="spec-label">Poids</span>
                            <span class="spec-value">${exercise1.weight}kg</span>
                        </div>
                        ${exercise1.tempo ? `
                        <div class="spec-item">
                            <span class="spec-label">Tempo</span>
                            <span class="spec-value">${exercise1.tempo}</span>
                        </div>
                        ` : ''}
                        ${exercise1.rpe ? `
                        <div class="spec-item">
                            <span class="spec-label">RPE</span>
                            <span class="spec-value">${exercise1.rpe}</span>
                        </div>
                        ` : ''}
                    </div>
                    ${exercise1.notes ? `<div class="exercise-notes-modern"><span class="notes-icon">💡</span><p>${exercise1.notes}</p></div>` : ''}
                    <div class="series-grid-modern" data-exercise="${exercise1.name}">
                        ${this.renderSeriesGridModern(exercise1, state1, weekNumber)}
                    </div>
                </div>

                <div class="superset-connector">
                    <div class="connector-icon">+</div>
                </div>

                <div class="exercise-block-modern is-superset-second" data-exercise="${exercise2.name}">
                    <div class="exercise-header">
                        <h3>${exercise2.name}</h3>
                    </div>
                    <div class="exercise-specs-modern">
                        <div class="spec-item">
                            <span class="spec-label">Séries</span>
                            <span class="spec-value">${exercise2.sets}</span>
                        </div>
                        <div class="spec-item">
                            <span class="spec-label">Reps</span>
                            <span class="spec-value">${exercise2.reps}</span>
                        </div>
                        <div class="spec-item">
                            <span class="spec-label">Poids</span>
                            <span class="spec-value">${exercise2.weight}kg</span>
                        </div>
                        ${exercise2.tempo ? `
                        <div class="spec-item">
                            <span class="spec-label">Tempo</span>
                            <span class="spec-value">${exercise2.tempo}</span>
                        </div>
                        ` : ''}
                        ${exercise2.rpe ? `
                        <div class="spec-item">
                            <span class="spec-label">RPE</span>
                            <span class="spec-value">${exercise2.rpe}</span>
                        </div>
                        ` : ''}
                    </div>
                    ${exercise2.notes ? `<div class="exercise-notes-modern"><span class="notes-icon">💡</span><p>${exercise2.notes}</p></div>` : ''}
                    <div class="series-grid-modern" data-exercise="${exercise2.name}">
                        ${this.renderSeriesGridModern(exercise2, state2, weekNumber)}
                    </div>
                </div>

                <div class="superset-rest-info">
                    <span class="rest-icon">⏱️</span>
                    <span class="rest-text">Repos après le duo</span>
                    <span class="rest-time">${restTime}s</span>
                </div>
            </div>
        `;
    }

    renderExerciseContent(exercise, weekNumber) {
        const state = this.loadExerciseState(`workout_${weekNumber}_${exercise.name}`);
        
        return `
            <div class="exercise-block-modern" data-exercise="${exercise.name}">
                <div class="exercise-header">
                    <h3>${exercise.name}</h3>
                </div>
                <div class="exercise-specs-modern">
                    <span>${exercise.sets} séries × ${exercise.reps} reps @ ${exercise.weight}kg</span>
                    ${exercise.tempo ? `<span>Tempo: ${exercise.tempo}</span>` : ''}
                    ${exercise.rpe ? `<span>RPE: ${exercise.rpe}</span>` : ''}
                </div>
                ${exercise.notes ? `<div class="exercise-notes-modern"><p>${exercise.notes}</p></div>` : ''}
                <div class="series-grid-modern" data-exercise="${exercise.name}">
                    ${this.renderSeriesGridModern(exercise, state, weekNumber)}
                </div>
            </div>
        `;
    }

    renderSeriesGridModern(exercise, state, weekNumber) {
        const sets = parseInt(exercise.sets);
        let html = '';
        
        for (let i = 1; i <= sets; i++) {
            const isCompleted = state && state.completedSets && state.completedSets.includes(i);
            html += `
                <div class="serie-item-modern">
                    <input 
                        type="checkbox" 
                        class="serie-checkbox" 
                        id="serie_${exercise.name}_${i}"
                        data-exercise="${exercise.name}"
                        data-set="${i}"
                        data-week="${weekNumber}"
                        data-rest="${exercise.rest || 60}"
                        ${isCompleted ? 'checked' : ''}
                    >
                    <label class="serie-label" for="serie_${exercise.name}_${i}">
                        <span class="serie-number">${i}</span>
                    </label>
                </div>
            `;
        }
        
        return html;
    }

    attachEventListeners(weekNumber) {
        const checkboxes = this.container.querySelectorAll('.serie-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => this.handleSerieToggle(e, weekNumber));
        });
    }

    handleSerieToggle(event, weekNumber) {
        const checkbox = event.target;
        const exerciseName = checkbox.dataset.exercise;
        const setNumber = parseInt(checkbox.dataset.set);
        const restTime = parseInt(checkbox.dataset.rest);
        
        const storageKey = `workout_${weekNumber}_${exerciseName}`;
        let state = this.loadExerciseState(storageKey);
        
        if (!state) {
            state = { completedSets: [] };
        }
        
        if (checkbox.checked) {
            if (!state.completedSets.includes(setNumber)) {
                state.completedSets.push(setNumber);
            }
            
            if (this.timerManager) {
                this.timerManager.startTimer(restTime);
            }
        } else {
            state.completedSets = state.completedSets.filter(s => s !== setNumber);
        }
        
        this.saveExerciseState(storageKey, state);
    }

    loadExerciseState(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Erreur chargement état:', error);
            return null;
        }
    }

    saveExerciseState(key, state) {
        try {
            localStorage.setItem(key, JSON.stringify(state));
        } catch (error) {
            console.error('Erreur sauvegarde état:', error);
        }
    }
}
